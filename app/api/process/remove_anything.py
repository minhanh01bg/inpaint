from segments import SegmentAnything
from pathlib import Path
from utils import load_img_to_array, save_array_to_img, dilate_mask, \
    show_mask, show_points, get_clicked_point
import matplotlib.pyplot as plt
from lama_inpaint import inpaint_img_with_lama, InpaintModel
import numpy as np
import cv2
import random
from urllib.parse import urlparse
from utils_birefnet import random_string, numpy_to_base64, pil_to_base64
import os
import shutil
from operator import itemgetter
from pathlib import Path
import base64, io
from PIL import Image

yolov8_model_path = './weights/yolov8n.pt'
sam2_checkpoint = './sam2/checkpoints/sam2_hiera_large.pt'
sam2_model_config = 'sam2_hiera_l.yaml'
lama_ckpt = "./pretrained_models/big-lama"
lama_config = "./lama/configs/prediction/default.yaml"
colors = [[random.randint(0, 255) for _ in range(3)] for _ in range(10)]
seg = SegmentAnything(yolov8_model_path, sam2_checkpoint, sam2_model_config)
lama = InpaintModel(config_p=lama_config, ckpt_p=lama_ckpt, device=seg.device)

def is_base64(s):
    try:
        # Kiểm tra nếu chuỗi có thể decode bằng base64 mà không gặp lỗi
        if isinstance(s, str):
            # Thử decode và kiểm tra xem có đúng base64 không
            base64.b64decode(s, validate=True)
            return True
        return False
    except (ValueError, base64.binascii.Error):
        return False

def overlay(image, mask, color, alpha, resize=None):
    """Combines image and its segmentation mask into a single image.
    
    Params:
        image: Training image. np.ndarray,
        mask: Segmentation mask. np.ndarray,
        color: Color for segmentation mask rendering.  tuple[int, int, int] = (255, 0, 0)
        alpha: Segmentation mask's transparency. float = 0.5,
        resize: If provided, both image and its mask are resized before blending them together.
        tuple[int, int] = (1024, 1024))

    Returns:
        image_combined: The combined image. np.ndarray

    """
    colored_mask = np.expand_dims(mask, 0).repeat(3, axis=0)
    colored_mask = np.moveaxis(colored_mask, 0, -1)
    masked = np.ma.MaskedArray(image, mask=colored_mask, fill_value=color)
    image_overlay = masked.filled()

    if resize is not None:
        image = cv2.resize(image.transpose(1, 2, 0), resize)
        image_overlay = cv2.resize(image_overlay.transpose(1, 2, 0), resize)

    image_combined = cv2.addWeighted(image, 1 - alpha, image_overlay, alpha, 0)

    return image_combined

def dilate_mask(mask, kernel_size):
    # Tạo kernel hình chữ nhật với kích thước kernel_size
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    # Thực hiện phép giãn mask bằng kernel
    if mask.dtype == bool:
        mask = mask.astype(np.uint8) * 255  # Chuyển đổi sang 0/255
    dilated_mask = cv2.dilate(mask, kernel, iterations=1)

    return dilated_mask

def rem_box_point(img_path, boxs=None, points=None, dilate_kernel_size=None):
    if isinstance(img_path, str):
        if not is_base64(img_path):
            parsed_url = urlparse(img_path)
            app_path = parsed_url.path.split('app', 1)[-1]
            img_path = 'app' + app_path
            folder = img_path.split("/")[0] + "/" + img_path.split("/")[1] + "/" + img_path.split("/")[2]
            print(img_path)
            print(folder)
            seg.load_image(img_path)
            seg.plot_box(folder=folder, boxs=boxs, points=points)
        else:
            image_data = base64.b64decode(img_path)
            seg.load_image_base64(io.BytesIO(image_data))
    else:
        print("img_path is not str.")
        return

    # Lấy kết quả masks và iou_predictions từ SAM2
    masks, iou_predictions = seg.get_mask2action(boxs=boxs, points=points)

    out_dir = Path(f"{folder}/results")
    if out_dir.exists():
        # Remove the folder and its contents
        shutil.rmtree(out_dir)

    # Recreate the folder
    os.makedirs(out_dir)
    
    img = seg.convert_img2array()

    path = []
    score = []
    img_base64s = []
    # Kiểm tra xem `masks` có phải là một danh sách hay không
    if masks.ndim==4:
        # Trường hợp nhiều mask
        for obj_idx, (obj_masks, obj_iou) in enumerate(zip(masks, iou_predictions)):
            print(f"Processing object {obj_idx + 1}")

            # Đảm bảo iou_predictions là mảng 1D
            if obj_iou.ndim > 1:
                obj_iou = obj_iou.flatten()  # Chuyển thành mảng 1D nếu cần

            best_iou_idx = max(enumerate(obj_iou), key=itemgetter(1))[0]
            s = obj_iou[best_iou_idx]
            best_mask = obj_masks[best_iou_idx]

            # Nếu có `dilate_kernel_size`, áp dụng hàm giãn nở (dilation) lên mask tốt nhất
            if dilate_kernel_size is not None:
                best_mask = dilate_mask(best_mask, dilate_kernel_size)

            # Lưu mask tốt nhất
            # mask_p = out_dir / f"object_{obj_idx + 1}_best_mask.png"
            # save_array_to_img(best_mask, mask_p)

            img_mask = overlay(img, best_mask, colors[best_iou_idx % len(colors)], 0.5)
            path.append(numpy_to_base64(img_mask))
            # img_mask_p = out_dir / f"object_{obj_idx + 1}_with_best_mask.png"
            # save_array_to_img(img_mask, img_mask_p)

            # Inpainting sử dụng mask tốt nhất
            img_inpainted = lama.predict(img=img, mask=best_mask)
            img_base64s.append(numpy_to_base64(img_inpainted))
            score.append(f"{s:.2f}")

            # img_inpainted_p = out_dir / f"object_{obj_idx + 1}_inpainted_best_mask.png"
            # path.append(str(img_inpainted_p))  # Ensure path is a string
            # save_array_to_img(img_inpainted, img_inpainted_p)
    else:
        # Trường hợp chỉ có một mask duy nhất
        print("Processing single object")

        # Đảm bảo iou_predictions là mảng 1D
        obj_iou = iou_predictions.flatten() if iou_predictions.ndim > 1 else iou_predictions

        best_iou_idx = max(enumerate(obj_iou), key=itemgetter(1))[0]
        s = obj_iou[best_iou_idx]
        best_mask = masks[best_iou_idx]

        # Nếu có `dilate_kernel_size`, áp dụng hàm giãn nở (dilation)
        if dilate_kernel_size is not None:
            best_mask = dilate_mask(best_mask, dilate_kernel_size)

        # save best mask
        # mask_p = out_dir / f"object_1_best_mask.png"
        # save_array_to_img(best_mask, mask_p)

        img_mask = overlay(img, best_mask, colors[best_iou_idx % len(colors)], 0.5)
        path.append(numpy_to_base64(img_mask))
        # img_mask_p = out_dir / f"object_1_with_best_mask.png"
        # save_array_to_img(img_mask, img_mask_p)

        # Inpainting best mask
        img_inpainted = lama.predict(img=img, mask=best_mask)
        score.append(f"{s:.2f}")
        img_base64s.append(numpy_to_base64(img_inpainted))
        
        # img_inpainted_p = out_dir / f"{random_string(40)}.png"
        # path.append(str(img_inpainted_p))  # Ensure path is a string
        # save_array_to_img(img_inpainted, img_inpainted_p)
    
    return path, score, img_base64s

def create_mask_image(image_path: str, masks, sliderValue, output_path: str):
    # Load the original image
    if isinstance(image_path, str):
        img = cv2.imread(image_path)
    else:
        img = image_path
    if img is None:
        raise ValueError(f"Image at path {image_path} could not be loaded.")

    # Create a mask image with the same dimensions as the original image
    mask_image = np.zeros((img.shape[0], img.shape[1]), dtype=np.uint8)

    # Iterate over each mask and draw lines between points
    for mask in masks:
        points = mask.points
        for i in range(len(points)):
            if (i + 1) % len(points)== 0:
                continue
            start_point = (int(points[i].x), int(points[i].y))
            end_point = (int(points[(i + 1) % len(points)].x), int(points[(i + 1) % len(points)].y))  # Wrap around to the first point
            # Draw line segment
            cv2.line(mask_image, start_point, end_point, color=(255, 255, 255), thickness=int(sliderValue))

    if type(image_path) == str:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    return mask_image, img

def rem_mask(img_path, masks=None,sliderValue=None, dilate_kernel_size=None):
    if isinstance(img_path, str):
        if not is_base64(img_path):
            parsed_url = urlparse(img_path)
            app_path = parsed_url.path.split('app', 1)[-1]
            img_path = 'app' + app_path
            folder = img_path.split("/")[0] + "/" + img_path.split("/")[1] + "/" + img_path.split("/")[2]
            print(img_path)
            print(folder)
        else:
            image_data = base64.b64decode(img_path)
            image_data = Image.open(io.BytesIO(image_data)).convert("RGB")
            img_path = np.array(image_data)
    
    else:
        print("img_path is not str.")
        return
    best_mask, img = create_mask_image(image_path=img_path,masks=masks,sliderValue=sliderValue, output_path='app/media/test.png')
    print(best_mask.shape, img.shape)
    out_dir = Path(f"{folder}/results")
    if out_dir.exists():
        # Remove the folder and its contents
        shutil.rmtree(out_dir)

    # Recreate the folder
    os.makedirs(out_dir)
    path = []
    score = []
    img_base64s = []
    if dilate_kernel_size is not None:
        best_mask = dilate_mask(best_mask, dilate_kernel_size)

        # mask_p = out_dir / f"object_1_best_mask.png"
        # save_array_to_img(best_mask, mask_p)

        img_mask = overlay(img, best_mask, colors[0 % len(colors)], 0.5)
        # img_mask_p = out_dir / f"object_1_with_best_mask.png"
        # save_array_to_img(img_mask, img_mask_p)
        path.append(numpy_to_base64(img_mask))
        img_inpainted = lama.predict(img=img, mask=best_mask)

        score.append("")
        img_base64s.append(numpy_to_base64(img_inpainted))

        # img_inpainted_p = out_dir / f"{random_string(40)}.png"
        # path.append(str(img_inpainted_p))  # Ensure path is a string
        # save_array_to_img(img_inpainted, img_inpainted_p)
    
    return path, score, img_base64s