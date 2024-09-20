import requests
from PIL import Image
from io import BytesIO
from diffusers import StableDiffusionUpscalePipeline, StableDiffusionLatentUpscalePipeline
import torch
import os

# load model and scheduler
model_id = "stabilityai/sd-x2-latent-upscaler"
pipeline = StableDiffusionLatentUpscalePipeline.from_pretrained(model_id, torch_dtype=torch.float16)
device = "cuda" if torch.cuda.is_available() else "cpu"
pipeline = pipeline.to(device)
generator = torch.manual_seed(33)
def _inference(name=None, folder=None, image_path=None):
    # let's download an  image
    if image_path is None:
        url = "https://huggingface.co/datasets/hf-internal-testing/diffusers-images/resolve/main/sd2-upscale/low_res_cat.png"
        image_path = url
        response = requests.get(url)
        low_res_img = Image.open(BytesIO(response.content)).convert("RGB")
        low_res_img = low_res_img.resize((128, 128))
    else:
        low_res_img = Image.open(image_path)

    prompt = "high quality high resolution uhd 4k image"
    upscaled_image = pipeline(
        prompt=prompt,
        image=low_res_img,
        num_inference_steps=20,
        guidance_scale=0,
        generator=generator,
    ).images[0]
    image_name = f"upscaled_{name}.png" if name is not None else "upscaled.png"
    img_save = os.path.join(folder, image_name)
    print(img_save)
    upscaled_image.save(image_name)
    return image_name
