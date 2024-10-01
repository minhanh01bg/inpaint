from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Union, Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core.security import (
    create_access_token, check_auth_admin, pwd_context, oauth2_scheme, security, get_current_user
) 
import app.schemas.schemas as schemas
from app.schemas.inpaint_schemas_v2 import InputWrapper,RemoveMask
import string, os, random
from utils_birefnet import random_string, remove_file
from app.api.process.remove_anything_v2 import rem_box_point, rem_mask, remove_mask_v2
from fastapi.encoders import jsonable_encoder

router = APIRouter()
processing_status = {}

def process_image_inpaint_bp(id, img_path, boxs, points,labels, dilate_kernel_size):
    path, score, best_masks = rem_box_point(img_path=img_path, boxs=boxs, points=points,labels=labels, dilate_kernel_size=dilate_kernel_size)
    processing_status[id] = {
        "status":"COMPLETED",
        "output": {
            "mask_base64": best_masks, 
            "score": score,
            "result_base64": path
        }
    }
    return {
        "status":"COMPLETED",
        "output": {
            "mask_base64": best_masks, 
            "score": score,
            "result_base64": path
        }
    }

@router.post('/segment', status_code=status.HTTP_200_OK)
async def remove_anything2(
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
        print(boxs)
        # background_tasks.add_task(process_image_inpaint_bp, id, img_path, boxs, None, None, 15)
        return process_image_inpaint_bp(id, img_path, boxs, None, None, 15)

    elif data.get('pals'):
        _ = data.get('pals')    
        print(data.get('pals'))
        points = _.get('points')
        labels = _.get('labels')
        
        # background_tasks.add_task(process_image_inpaint_bp, id, img_path, None, points, labels, 15)
        return process_image_inpaint_bp(id, img_path, None, points, labels, 15)

@router.post('/remove_mask', status_code=status.HTTP_200_OK)
async def remove_mask(request: RemoveMask):
    data = jsonable_encoder(request.input)

    source = data.get("source")
    mask = data.get("mask")
    img_base64s = remove_mask_v2(source,mask[0])
    result = []
    result.append(img_base64s)
    return {
        "output":{
            "result_base64": result
        }
    }