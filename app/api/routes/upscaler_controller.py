from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
import os, time, io, base64
from utils_birefnet import random_string, remove_file, file_to_base64, pil_to_base64, prepare_image_input, numpy_to_base64
# from app.api.process.upscaler import _inference
# from app.api.process.upscaler_x2 import _inference_x2
from app.schemas.upscale_schemas import InputWrapper
from fastapi.encoders import jsonable_encoder
from PIL import Image
from inference1 import RealESRGANUpsampler
import numpy as np

router = APIRouter()

processing_status = {}

def check_image_size(image_data):
    image = Image.open(io.BytesIO(image_data))
    width, height = image.size

    if width > 1000 or height > 1000:
        raise ValueError(f"Image dimensions too large: {width}x{height}. Maximum allowed is 1000x1000.")
    return True

# def process_image_upscaling(id, mode, image_base64, image_init64):
#     if mode == 'x2':
#         upscaler_image, image_init64 = _inference_x2(image_base64, image_init64)
#     else:
#         upscaler_image, image_init64 = _inference(image_base64, image_init64)
#     upscaled_image, image_init64 = _inference(image_base64=image_base64, image_init64=image_init64)
#     upscaled_image = pil_to_base64(upscaled_image)
#     processing_status[id] = {
#         "status":"COMPLETED",
#         "output": {
#             "result_base64": upscaled_image,
#             "image":image_init64
#         }
#     }
#     return upscaled_image

# @router.post("/upscaler", status_code=status.HTTP_200_OK)
# async def upscaler_images(
#     background_tasks: BackgroundTasks,
#     data: InputWrapper,
# ):
#     id = random_string(20)
#     inp = jsonable_encoder(data.input)
#     mode = inp.get("mode")
#     image_data = prepare_image_input(inp)
#     check_image_size(image_data=image_data)
#     # process
#     processing_status[id] = {"status":"IN_QUEUE"}
#     # upscale w BackgroundTasks
#     background_tasks.add_task(process_image_upscaling, id, mode, io.BytesIO(image_data), base64.b64encode(image_data).decode('utf-8'))

#     return {"message": "Image is being processed in the background", "id": id}

# API status
@router.get("/upscaler/status/{id}", status_code=status.HTTP_200_OK)
async def get_image_status(id: str):
    status = processing_status.get(id, "not found")
    
    if not status or not isinstance(status, dict):
        return {"status": "not found"}
    
    if status["status"] == "COMPLETED":
        return status
    elif status["status"] == "IN_QUEUE":
        return status
    else:
        return {"status": "not found"}
    
upsampler = RealESRGANUpsampler(model_name='RealESRGAN_x4plus')

def process_image_upscaling(id, mode, image_base64, image_init64):
    mode = mode[1:]
    mode = int(mode)
    image = Image.open(image_base64).convert("RGB")
    image = np.array(image)
    output_img = upsampler.enhance_image(image, outscale=4, face_enhance=True)
    processing_status[id] = {
        "status":"COMPLETED",
        "output": {
            "result_base64": numpy_to_base64(output_img),
            "image": image_init64,
        }
    }
    return


@router.post("/upscaler1", status_code=status.HTTP_200_OK)
async def upscaler_images(
    background_tasks: BackgroundTasks,
    data: InputWrapper,
):
    id = random_string(20)
    inp = jsonable_encoder(data.input)
    mode = inp.get("mode")
    image_data = prepare_image_input(inp)
    check_image_size(image_data=image_data)
    # process
    processing_status[id] = {"status":"IN_QUEUE"}
    # upscale w BackgroundTasks
    background_tasks.add_task(process_image_upscaling, id, mode, io.BytesIO(image_data), base64.b64encode(image_data).decode('utf-8'))

    return {"message": "Image is being processed in the background", "id": id}
