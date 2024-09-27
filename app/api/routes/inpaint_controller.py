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

def process_image_inpaint_bp(id, img_path, boxs, points, dilate_kernel_size):
    path, score,img_base64s = rem_box_point(img_path=img_path, boxs=boxs, points=points, dilate_kernel_size=dilate_kernel_size)
    processing_status[id] = {
        "status":"COMPLETED",
        "output": {
            "mask_base64":path, 
            "score":score, 
            "result_base64": img_base64s
        }
    }
    return

def process_image_inpaint_mask(id, img_path, sliderValue, mask,dilate_kernel_size):
    path, score, img_base64s = rem_mask(img_path=img_path,sliderValue=sliderValue, masks=mask,dilate_kernel_size=dilate_kernel_size)
    processing_status[id] = {
        "status":"COMPLETED",
        "output": {
            "mask_base64":path, 
            "score":score, 
            "result_base64": img_base64s
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
    id = random_string(20)
    processing_status[id] = {"status":"IN_QUEUE"}

    img_path = data.get('source') # base64 string
    if data.get('box'):
        boxs = data.get('box')
        path, score, img_base64s = rem_box_point(img_path=img_path, boxs=boxs, dilate_kernel_size=15)
        return {"mask_base64":path, "score":score,"result_base64": img_base64s}
        

    elif data.get('point'):
        points = data.get('point')    
        path, score,img_base64s = rem_box_point(img_path=img_path, points=points, dilate_kernel_size=15)   
        return {"mask_base64":path, "score":score, "result_base64": img_base64s}
        

    elif data.get('mask'):
        mask = data.get('mask')
        sliderValue = data.get('sliderValue')
        path, score, img_base64s = rem_mask(img_path=img_path,sliderValue=sliderValue, masks=mask,dilate_kernel_size=15)
        return {"mask_base64":path, "score":score,"result_base64": img_base64s}
        

    return {"id": id, "status":"IN_QUEUE"}

@router.post('/remove_anything2', status_code=status.HTTP_200_OK)
async def remove_anything2(
    background_tasks: BackgroundTasks, 
    request: InputWrapper
):
    # Validate the request data
    if not request.input.is_valid_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a box, point, or mask, but not multiple."
        )
    data = jsonable_encoder(request.input)
    id = random_string(20)
    processing_status[id] = {"status":"IN_QUEUE"}

    img_path = data.get('source') # base64 string
    if data.get('box'):
        boxs = data.get('box')
        
        background_tasks.add_task(process_image_inpaint_bp, id, img_path, boxs, None, 15)

    elif data.get('point'):
        points = data.get('point')    
        background_tasks.add_task(process_image_inpaint_bp, id, img_path, None, points, 15)

    elif data.get('mask'):
        mask = data.get('mask')
        sliderValue = data.get('sliderValue')
        background_tasks.add_task(process_image_inpaint_mask, id, img_path, sliderValue, mask, 15)

    return {"id": id, "status":"IN_QUEUE"}

@router.get("/remove_anything2/status/{id}", status_code=status.HTTP_200_OK)
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