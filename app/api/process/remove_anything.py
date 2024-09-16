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
    parsed_url = urlparse(img_path)
    app_path = parsed_url.path.split('app', 1)[-1]
    img_path = 'app' + app_path
    folder = img_path.split("/")[0] + "/" + img_path.split("/")[1] + "/" + img_path.split("/")[2]
    print(img_path)
    print(folder)

    # process
    seg.load_image(img_path)
    seg.plot_box(folder=folder, boxs=boxs, points=points)

    # Lấy kết quả masks và iou_predictions từ SAM2
    masks, iou_predictions = seg.get_mask2action(boxs=boxs, points=points)

    # Chọn mask có IoU cao nhất
    best_iou_idx = max(enumerate(iou_predictions), key=itemgetter(1))[0]
    best_mask = masks[best_iou_idx]

    # Nếu có `dilate_kernel_size`, áp dụng hàm giãn nở (dilation) lên mask tốt nhất
    if dilate_kernel_size is not None:
        best_mask = dilate_mask(best_mask, dilate_kernel_size)

    out_dir = Path(f"{folder}")
    img = seg.convert_img2array()

    # Lưu mask tốt nhất
    mask_p = out_dir / f"best_mask.png"
    img_mask_p = out_dir / f"with_best_mask.png"

    save_array_to_img(best_mask, mask_p)
    img_mask = overlay(img, best_mask, colors[0], 0.5)  # chỉ cần dùng 1 màu vì chỉ có 1 mask
    save_array_to_img(img_mask, img_mask_p)

    # Inpainting sử dụng mask tốt nhất
    mask_p = out_dir / f"best_mask.png"
    img_inpainted_p = out_dir / f"inpainted_best_mask.png"
    
    img_inpainted = lama.predict(img=img, mask=best_mask)
    save_array_to_img(img_inpainted, img_inpainted_p)

    return img_inpainted_p, iou_predictions[best_iou_idx]
