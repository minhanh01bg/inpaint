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

def _inference_x2(image_base64=None, image_init64=None):
    # let's download an  image
    if image_base64 is None:
        url = "https://huggingface.co/datasets/hf-internal-testing/diffusers-images/resolve/main/sd2-upscale/low_res_cat.png"
        image_base64 = url
        response = requests.get(url)
        low_res_img = Image.open(BytesIO(response.content)).convert("RGB")
        low_res_img = low_res_img.resize((128, 128))
    else:
        low_res_img = Image.open(image_base64)

    prompt = "high quality high resolution uhd 4k image"
    upscaled_image = pipeline(
        prompt=prompt,
        image=low_res_img,
        num_inference_steps=20,
        guidance_scale=0,
        generator=generator,
    ).images[0]
    
    return upscaled_image, image_init64
