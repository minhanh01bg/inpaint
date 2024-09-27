from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
import os, time, io, base64
from utils_birefnet import random_string, remove_file, file_to_base64, pil_to_base64, prepare_image_input
from app.api.process.upscaler import _inference
from app.schemas.rembg_schemas import InputWrapper
from fastapi.encoders import jsonable_encoder

router = APIRouter()

processing_status = {}

def process_image_upscaling(id,image_base64, image_init64):
    upscaled_image, image_init64 = _inference(image_base64=image_base64, image_init64=image_init64)
    upscaled_image = pil_to_base64(upscaled_image)
    processing_status[id] = {
        "status":"COMPLETED",
        "output": {
            "result_base64": upscaled_image,
            "image":image_init64
        }
    }
    return upscaled_image

@router.post("/upscaler", status_code=status.HTTP_200_OK)
async def upscaler_images(
    background_tasks: BackgroundTasks,
    data: InputWrapper,
):
    r = random_string(20)
    inp = jsonable_encoder(data.input)
    image_data = prepare_image_input(inp)
    # process
    processing_status[r] = {"status":"IN_QUEUE"}
    # upscale w BackgroundTasks
    background_tasks.add_task(process_image_upscaling, r, io.BytesIO(image_data), base64.b64encode(image_data).decode('utf-8'))

    return {"message": "Image is being processed in the background", "id": r}

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