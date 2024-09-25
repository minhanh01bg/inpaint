from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
import os
from utils_birefnet import random_string, remove_file, file_to_base64, pil_to_base64
import time
from app.api.process.upscaler import _inference

router = APIRouter()

processing_status = {}

def process_image_upscaling(name, folder, image_path):
    upscaled_image = _inference(name=name, folder=folder, image_path=image_path)
    upscaled_image = pil_to_base64(upscaled_image)
    processing_status[name] = {
        "status":"completed",
        "result": upscaled_image
    }
    return upscaled_image

@router.post("/upscaler", status_code=status.HTTP_200_OK)
async def upscaler_images(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    r = random_string(10)
    filename = f'{r}_{file.filename}'
    ext = filename.split('.')[1]
    if ext not in ['jpeg', 'png', 'jpg']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=[{"msg":"file is not image"}],
            headers={"WWW-Authenticate": "Bearer"},
        )

    folder = f"app/media/{filename.split('.')[0]}"
    # folder = "app/media"
    if not os.path.exists(folder):
        os.mkdir(folder)
    
    # file_location = f"{folder}/{filename}"
    # with open(file_location, "wb+") as file_object:
    #     file_object.write(file.file.read())
    # process
    image_base64 = file_to_base64(file)
    processing_status[filename.split('.')[0]] = {"status":"processing"}
    # upscale w BackgroundTasks
    background_tasks.add_task(process_image_upscaling, filename.split('.')[0], folder, file.file)

    return {"message": "Image is being processed in the background", "image_id": filename.split('.')[0], "image_base64": image_base64}


# API để kiểm tra trạng thái xử lý của ảnh
@router.get("/upscaler/status/{image_id}", status_code=status.HTTP_200_OK)
async def get_image_status(image_id: str):
    folder = f"app/media/{image_id}"
    status = processing_status.get(image_id, "not found")
    # print(status)
    if status["status"] == "completed":
        return status
    elif status["status"] == "processing":
        return status
    else:
        return {"status": "not found"}