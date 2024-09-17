# from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
# from sqlalchemy.orm import Session
# from app.core.database import get_db
# import os
# from utils_birefnet import random_string, remove_file
# import time
# from app.api.process.upscaler import _inference
# router = APIRouter()


# @router.post("/imgs_upscaler", status_code=status.HTTP_200_OK)
# async def upscaler_images(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db)
# ):
#     r = random_string(10)
#     filename = f'{r}_{file.filename}'
#     ext = filename.split('.')[1]
#     if ext not in ['jpeg', 'png', 'jpg']:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail=[{"msg":"file is not image"}],
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     folder = f"app/media/{filename.split('.')[0]}"
#     # folder = "app/media"
#     if not os.path.exists(folder):
#         os.mkdir(folder)
    
#     file_location = f"{folder}/{filename}"
#     with open(file_location, "wb+") as file_object:
#         file_object.write(file.file.read())
#     # process
#     size = file.size / (1024* 1024)
#     t_start = time.time()
#     upscaled_image = _inference(name=filename.split('.')[0], folder=folder, image_path=file_location)
#     return {"image":file_location,"upscaled":upscaled_image, "file_size":f"{size:.2f}", "time":f"{time.time() - t_start}"}


from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from app.core.database import get_db
import os
from utils_birefnet import random_string, remove_file
from app.api.process.upscaler import _inference
from celery_worker import celery_app

router = APIRouter()

# Tác vụ Celery cho việc upscale ảnh
@celery_app.task
def upscale_image_task(filename: str, folder: str, file_location: str):
    upscaled_image = _inference(name=filename.split('.')[0], folder=folder, image_path=file_location)
    return {"upscaled_image": upscaled_image}

@router.post("/imgs_upscaler", status_code=status.HTTP_200_OK)
async def upscaler_images(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    r = random_string(10)
    filename = f'{r}_{file.filename}'
    ext = filename.split('.')[1]
    if ext not in ['jpeg', 'png', 'jpg']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=[{"msg": "file is not image"}],
            headers={"WWW-Authenticate": "Bearer"},
        )

    folder = f"app/media/{filename.split('.')[0]}"
    if not os.path.exists(folder):
        os.mkdir(folder)

    file_location = f"{folder}/{filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())

    # Gọi task xử lý background
    task = upscale_image_task.delay(filename, folder, file_location)
    size = file.size / (1024 * 1024)

    return {
        "message": "Upscale task started",
        "task_id": task.id,
        "file_size": f"{size:.2f} MB"
    }


@router.get("/task_status/{task_id}")
def get_task_status(task_id: str):
    task_result = celery_app.AsyncResult(task_id)
    if task_result.state == "PENDING":
        response = {
            "state": task_result.state,
            "status": "Pending..."
        }
    elif task_result.state != "FAILURE":
        response = {
            "state": task_result.state,
            "status": task_result.info,
        }
    else:
        response = {
            "state": task_result.state,
            "status": str(task_result.info),  # Exception information
        }
    return response
