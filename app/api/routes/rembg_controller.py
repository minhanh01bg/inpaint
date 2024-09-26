from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Union, Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core.security import (
    create_access_token, check_auth_admin, pwd_context, oauth2_scheme, security, get_current_user
) 
from fastapi.encoders import jsonable_encoder
from app.schemas.rembg_schemas import InputWrapper
from utils_birefnet import random_string, remove_file,prepare_image_input
from background_removal import extract_object, birefnet
import base64, io,json, os

router = APIRouter()

processing_status = {}

@router.post("/remove_background", status_code=status.HTTP_200_OK)
async def rmbg_img(
    data: InputWrapper,
    # db: Session = Depends(get_db),
):
    inp = jsonable_encoder(data.input)
    # data = json.loads(inp)
    image_data = prepare_image_input(inp)
    result, mask = extract_object(birefnet, io.BytesIO(image_data))

    buffered_image = io.BytesIO()
    buffered_mask = io.BytesIO()
    # Save the image and mask into BytesIO objects
    result.save(buffered_image, format="PNG")
    mask.convert("RGB").save(buffered_mask, format="PNG")
    # Encode
    image_base64 = base64.b64encode(buffered_image.getvalue()).decode('utf-8')
    mask_base64 = base64.b64encode(buffered_mask.getvalue()).decode('utf-8')

    return {
        "image": base64.b64encode(image_data).decode('utf-8'),
        "result_base64":image_base64,
        "mask_base64":mask_base64,
        "message":"Image processed successfully"
    }


def process_remove_background_image(id, image_data):
    result, mask = extract_object(birefnet, io.BytesIO(image_data))
    buffered_image = io.BytesIO()
    buffered_mask = io.BytesIO()
    # Save the image and mask into BytesIO objects
    result.save(buffered_image, format="PNG")
    mask.convert("RGB").save(buffered_mask, format="PNG")
    # Encode
    image_base64 = base64.b64encode(buffered_image.getvalue()).decode('utf-8')
    mask_base64 = base64.b64encode(buffered_mask.getvalue()).decode('utf-8')
    processing_status[id] = {
        "status": "COMPLETED",
        "output": {
            "image": base64.b64encode(image_data).decode('utf-8'),
            "result_base64":image_base64,
            "mask_base64":mask_base64,
            "message":"Image processed successfully"
        }
    }
    return 

@router.post('/remove_background2', status_code=status.HTTP_200_OK)
async def rmbg_img2(
    background_tasks: BackgroundTasks, 
    data: InputWrapper,
):
    id = random_string(20)
    inp = jsonable_encoder(data.input)
    image_data = prepare_image_input(inp)
    processing_status[id] = {"status":"IN_QUEUE"}
    background_tasks.add_task(process_remove_background_image, id, image_data)

    return {"id": id, "status":"IN_QUEUE"}

@router.get("/remove_background2/status/{id}", status_code=status.HTTP_200_OK)
async def get_image_status(id: str):

    status = processing_status.get(id, "not found")
    # print(status)
    if status["status"] == "COMPLETED":
        return status
    elif status["status"] == "IN_QUEUE":
        return status
    else:
        return {"status": "not found"}