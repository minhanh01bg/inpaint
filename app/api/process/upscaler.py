import requests
from PIL import Image
from diffusers import StableDiffusionUpscalePipeline
import torch
import os, io

# load model and scheduler
model_id = "stabilityai/stable-diffusion-x4-upscaler"
pipeline = StableDiffusionUpscalePipeline.from_pretrained(model_id, torch_dtype=torch.float16)
device = "cuda" if torch.cuda.is_available() else "cpu"
pipeline = pipeline.to(device)

def _inference(image_base64=None):
    # let's download an  image
    if image_base64 is None:
        url = "https://huggingface.co/datasets/hf-internal-testing/diffusers-images/resolve/main/sd2-upscale/low_res_cat.png"
        image_base64 = url
        response = requests.get(url)
        low_res_img = Image.open(io.BytesIO(response.content)).convert("RGB")
        low_res_img = low_res_img.resize((128, 128))
    else:
        low_res_img = Image.open(image_base64).convert("RGB")

    prompt = "high quality high resolution uhd 4k image"
    upscaled_image = pipeline(prompt=prompt, image=low_res_img).images[0]
    return upscaled_image


