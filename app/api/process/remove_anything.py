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
    parsed_url = urlparse(img_path)
    app_path = parsed_url.path.split('app', 1)[-1]
    img_path = 'app' + app_path
    folder = img_path.split("/")[0] + "/" + img_path.split("/")[1] + "/" + img_path.split("/")[2]
    print(img_path)
    print(folder)
    # process
    seg.load_image(img_path)
    seg.plot_box(folder=folder,boxs=boxs, points=points)
    masks = seg.get_mask2action(boxs=boxs,points=points)
    if dilate_kernel_size is not None:
        masks = [dilate_mask(mask, dilate_kernel_size) for mask in masks]

    out_dir = Path(f"{folder}")
    # out_dir.mkdir(parents=True, exist_ok=True)
    img = seg.convert_img2array()
    for idx, mask in enumerate(masks):
        # print(mask)
        mask_p = out_dir / f"mask_{idx}.png"
        img_mask_p = out_dir / f"with_{Path(mask_p).name}"

        save_array_to_img(mask, mask_p)
        img_mask = overlay(img, mask, colors[idx], 0.5)
        save_array_to_img(img_mask, img_mask_p)

    for idx, mask in enumerate(masks):
        mask_p = out_dir / f"mask_{idx}.png"
        img_inpainted_p = out_dir / f"inpainted_{Path(mask_p).name}"
        # img_inpainted = inpaint_img_with_lama(
        #     img, mask, lama_config, lama_ckpt, device=seg.device)
        img_inpainted = lama.predict(img=img, mask=mask)  
        save_array_to_img(img_inpainted, img_inpainted_p)

    return folder, len(masks)
