from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
import os
from utils_birefnet import random_string, remove_file
import time
from app.api.process.upscaler import _inference

router = APIRouter()

def process_image_upscaling(name, folder, image_path):
    upscaled_image = _inference(name=name, folder=folder, image_path=image_path)
    return upscaled_image

@router.post("/imgs_upscaler", status_code=status.HTTP_200_OK)
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
    
    file_location = f"{folder}/{filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    # process
    size = file.size / (1024* 1024)
    t_start = time.time()
    # upscaled_image = _inference(name=filename.split('.')[0], folder=folder, image_path=file_location)
    # return {"image":file_location,"upscaled":upscaled_image, "file_size":f"{size:.2f}", "time":f"{time.time() - t_start}"}

    # Thực hiện upscale ảnh dưới nền bằng BackgroundTasks
    background_tasks.add_task(process_image_upscaling, filename.split('.')[0], folder, file_location)

    return {"message": "Image is being processed in the background", "image_id": filename.split('.')[0], "image": file_location}


# API để kiểm tra trạng thái xử lý của ảnh
@router.get("/imgs_upscaler/status/{image_id}", status_code=status.HTTP_200_OK)
async def get_image_status(image_id: str):
    folder = f"app/media/{image_id}"
    upscaled_image_path = f"{folder}/upscaled_{image_id}.png"

    if os.path.exists(upscaled_image_path):
        return {"status": "completed", "upscaled_image": upscaled_image_path}
    return {"status": "processing"}