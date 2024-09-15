from segments import SegmentAnything
from pathlib import Path
import matplotlib.pyplot as plt
from lama_inpaint import inpaint_img_with_lama
from utils import load_img_to_array, save_array_to_img, dilate_mask, \
    show_mask, show_points, get_clicked_point
import torch
from stable_diffusion_inpaint import replace_img_with_sd
# config
seed = None
img_path = "/home/minhthuy/Desktop/new/Inpaint-Anything/example/remove-anything/dog.jpg"
yolov8_model_path = '/home/minhthuy/Models/yolov8_train/yolov8n.pt'
sam2_checkpoint = '/home/minhthuy/Desktop/new/Grounded-SAM-2/checkpoints/sam2_hiera_large.pt'
sam2_model_config = 'sam2_hiera_l.yaml'
lama_ckpt = "/home/minhthuy/Desktop/new/Inpaint-Anything/pretrained_models/big-lama"
lama_config = "/home/minhthuy/Desktop/new/Inpaint-Anything/lama/configs/prediction/default.yaml"
#  --- end ---

seg = SegmentAnything(yolov8_model_path, sam2_checkpoint, sam2_model_config)
seg.load_image(img_path)
masks = seg.get_mask(dilate_kernel_size=50)
text_prompt = "a teddy bear on a bench"
img_stem = Path(img_path).stem
out_dir = Path("./results") / img_stem
out_dir.mkdir(parents=True, exist_ok=True)

img = seg.convert_img2array()
for idx, mask in enumerate(masks):
    mask_p = out_dir / f'mask_{idx}.png'
    img_points_p = out_dir / f'with_points.png'
    img_mask_p = out_dir / f'with_{Path(mask_p).name}'

    save_array_to_img(mask, mask_p)

    # save the pointed and masked image
    dpi = plt.rcParams['figure.dpi']
    height, width = img.shape[:2]
    plt.figure(figsize=(width/dpi/0.77, height/dpi/0.77))
    plt.imshow(img)
    plt.axis('off')
    plt.savefig(img_points_p, bbox_inches='tight', pad_inches=0)
    show_mask(plt.gca(), mask, random_color=False)
    plt.savefig(img_mask_p, bbox_inches='tight', pad_inches=0)
    plt.close()

# fill the masked image
for idx, mask in enumerate(masks):
    if seed is not None:
        torch.manual_seed(seed)
    mask_p = out_dir / f"mask_{idx}.png"
    img_replaced_p = out_dir / f"replaced_with_{Path(mask_p).name}"
    img_replaced = replace_img_with_sd(
        img, mask, text_prompt, device=seg.device)
    save_array_to_img(img_replaced, img_replaced_p)