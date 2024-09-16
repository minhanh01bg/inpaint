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

yolov8_model_path = './weights/yolov8n.pt'
sam2_checkpoint = './sam2/checkpoints/sam2_hiera_large.pt'
sam2_model_config = 'sam2_hiera_l.yaml'
lama_ckpt = "./pretrained_models/big-lama"
lama_config = "./lama/configs/prediction/default.yaml"
colors = [[random.randint(0, 255) for _ in range(3)] for _ in range(10)]
seg = SegmentAnything(yolov8_model_path, sam2_checkpoint, sam2_model_config)
lama = InpaintModel(config_p=lama_config, ckpt_p=lama_ckpt, device=seg.device)

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
    from operator import itemgetter
    from pathlib import Path

    parsed_url = urlparse(img_path)
    app_path = parsed_url.path.split('app', 1)[-1]
    img_path = 'app' + app_path
    folder = img_path.split("/")[0] + "/" + img_path.split("/")[1] + "/" + img_path.split("/")[2]
    print(img_path)
    print(folder)

    # Load hình ảnh
    seg.load_image(img_path)
    seg.plot_box(folder=folder, boxs=boxs, points=points)

    # Lấy kết quả masks và iou_predictions từ SAM2
    masks, iou_predictions = seg.get_mask2action(boxs=boxs, points=points)

    out_dir = Path(f"{folder}")
    img = seg.convert_img2array()

    path = []
    score = []

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
            mask_p = out_dir / f"object_{obj_idx + 1}_best_mask.png"
            save_array_to_img(best_mask, mask_p)

            img_mask_p = out_dir / f"object_{obj_idx + 1}_with_best_mask.png"
            img_mask = overlay(img, best_mask, colors[best_iou_idx % len(colors)], 0.5)
            save_array_to_img(img_mask, img_mask_p)

            # Inpainting sử dụng mask tốt nhất
            img_inpainted_p = out_dir / f"object_{obj_idx + 1}_inpainted_best_mask.png"
            img_inpainted = lama.predict(img=img, mask=best_mask)
            path.append(str(img_inpainted_p))  # Ensure path is a string
            score.append(f"{s:.2f}")
            save_array_to_img(img_inpainted, img_inpainted_p)

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

        # Lưu mask tốt nhất
        mask_p = out_dir / f"object_1_best_mask.png"
        save_array_to_img(best_mask, mask_p)

        img_mask_p = out_dir / f"object_1_with_best_mask.png"
        img_mask = overlay(img, best_mask, colors[best_iou_idx % len(colors)], 0.5)
        save_array_to_img(img_mask, img_mask_p)

        # Inpainting sử dụng mask tốt nhất
        img_inpainted_p = out_dir / f"object_1_inpainted_best_mask.png"
        img_inpainted = lama.predict(img=img, mask=best_mask)
        path.append(str(img_inpainted_p))  # Ensure path is a string
        score.append(f"{s:.2f}")
        save_array_to_img(img_inpainted, img_inpainted_p)

    return path, score
