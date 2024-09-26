from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Union, Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core.security import (
    create_access_token, check_auth_admin, pwd_context, oauth2_scheme, security, get_current_user
) 

import app.schemas.schemas as schemas
from app.schemas.inpaint_schemas import RemoveAnythingRequest, InputWrapper
import string
import random
import os
from utils_birefnet import random_string, remove_file
from app.api.process.remove_anything import rem_box_point, rem_mask
from fastapi.encoders import jsonable_encoder

router = APIRouter()
processing_status = {}

def process_image_inpaint_bp(image_id, img_path, boxs, points, dilate_kernel_size):
    path, score,img_base64s = rem_box_point(img_path=img_path, boxs=boxs, points=points, dilate_kernel_size=dilate_kernel_size)
    processing_status[image_id] = {
        "status":"COMPLETED",
        "output": {
            "mask_plot":path, 
            "score":score, 
            "img_base64s": img_base64s
        }
    }
    return

def process_image_inpaint_mask(image_id, img_path, sliderValue, mask,dilate_kernel_size):
    path, score, img_base64s = rem_mask(img_path=img_path,sliderValue=sliderValue, masks=mask,dilate_kernel_size=dilate_kernel_size)
    processing_status[image_id] = {
        "status":"COMPLETED",
        "output": {
            "mask_plot":path, 
            "score":score, 
            "img_base64s": img_base64s
        }
    }
    return

@router.post('/remove_anything', status_code=status.HTTP_200_OK)
async def remove_anything(
    # background_tasks: BackgroundTasks, 
    request: InputWrapper
):
    # Validate the request data
    if not request.input.is_valid_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a box, point, or mask, but not multiple."
        )
    data = jsonable_encoder(request.input)
    image_id = random_string(20)
    processing_status[image_id] = {"status":"IN_QUEUE"}

    img_path = data.get('img_path') # base64 string
    if data.get('box'):
        boxs = data.get('box')
        path, score, img_base64s = rem_box_point(img_path=img_path, boxs=boxs, dilate_kernel_size=15)
        return {"mask_plot":path, "score":score,"img_base64s": img_base64s}
        # background_tasks.add_task(process_image_inpaint_bp, image_id, img_path, boxs, None, 15)

    elif data.get('point'):
        points = data.get('point')    
        path, score,img_base64s = rem_box_point(img_path=img_path, points=points, dilate_kernel_size=15)   
        return {"mask_plot":path, "score":score, "img_base64s": img_base64s}
        # background_tasks.add_task(process_image_inpaint_bp, image_id, img_path, None, points, 15)

    elif data.get('mask'):
        mask = data.get('mask')
        sliderValue = data.get('sliderValue')
        path, score, img_base64s = rem_mask(img_path=img_path,sliderValue=sliderValue, masks=mask,dilate_kernel_size=15)
        return {"mask_plot":path, "score":score,"img_base64s": img_base64s}
        # background_tasks.add_task(process_image_inpaint_mask, image_id, img_path, sliderValue, mask, 15)

    return {"image_id": image_id, "status":"IN_QUEUE"}


@router.get("/remove_anything/status/{image_id}", status_code=status.HTTP_200_OK)
async def get_image_status(image_id: str):
    folder = f"app/media/{image_id}"
    status = processing_status.get(image_id, "not found")
    # print(status)
    if status["status"] == "COMPLETED":
        return status
    elif status["status"] == "IN_QUEUE":
        return status
    else:
        return {"status": "not found"}