import matplotlib.pyplot as plt
from pathlib import Path
from lama_inpaint import inpaint_img_with_lama
from utils import load_img_to_array, save_array_to_img, dilate_mask, \
    show_mask, show_points, get_clicked_point
from segments import SegmentAnything


img_path = "./example/remove-anything/dog.jpg"
yolov8_model_path = './weights/yolov8n.pt'
sam2_checkpoint = './sam2/checkpoints/sam2_hiera_large.pt'
sam2_model_config = 'sam2_hiera_l.yaml'
lama_ckpt = "./pretrained_models/big-lama"
lama_config = "./lama/configs/prediction/default.yaml"

remover = SegmentAnything(yolov8_model_path, sam2_checkpoint, sam2_model_config)
remover.load_image(img_path)
masks = remover.get_mask(dilate_kernel_size=15)
img_stem = Path(img_path).stem
out_dir = Path("./results") / img_stem
out_dir.mkdir(parents=True, exist_ok=True)
# print(out_dir)
img = remover.convert_img2array()

for idx, mask in enumerate(masks):
    mask_p = out_dir / f"mask_{idx}.png"
    img_points_p = out_dir / f"with_points.png"
    img_mask_p = out_dir / f"with_{Path(mask_p).name}"

    save_array_to_img(mask, mask_p)
    dpi = plt.rcParams['figure.dpi']
    
    height, width = img.shape[:2]

    plt.figure(figsize=(width/dpi/0.77, height/dpi/0.77))
    plt.imshow(img)
    plt.axis('off')
    plt.savefig(img_points_p, bbox_inches='tight', pad_inches=0)
    show_mask(plt.gca(), mask, random_color=False)
    plt.savefig(img_mask_p, bbox_inches='tight', pad_inches=0)
    plt.close()

for idx, mask in enumerate(masks):
    mask_p = out_dir / f"mask_{idx}.png"
    img_inpainted_p = out_dir / f"inpainted_with_{Path(mask_p).name}"
    img_inpainted = inpaint_img_with_lama(
        img, mask, lama_config, lama_ckpt, device=remover.device)
    save_array_to_img(img_inpainted, img_inpainted_p)

