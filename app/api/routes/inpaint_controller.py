from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
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

@router.post("/inpainting", status_code=status.HTTP_200_OK)
async def login_for_access_token(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
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
    
    # remove_file(file_location)
    return {
        "image_path":file_location,
        "file_size":f"{size:.2f}"
    }

@router.post('/remove_anything', status_code=status.HTTP_200_OK)
async def remove_anything(request: InputWrapper):
    # Validate the request data
    if not request.input.is_valid_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a box, point, or mask, but not multiple."
        )
    data = request.input
    data = jsonable_encoder(data.input)
    
    img_path = data.get('img_path') # base64 string
    if data.get('box'):
        boxs = data.get('box')
        path, score, img_base64s = rem_box_point(img_path=img_path, boxs=boxs, dilate_kernel_size=15)
        return {"message": "Success", "mask_plot":path, "score":score, "img_base64s": img_base64s}
    elif data.get('point'):
        points = data.get('point')    
        path, score,img_base64s = rem_box_point(img_path=img_path, points=points, dilate_kernel_size=15)   
        return {"message": "Success", "mask_plot":path, "score":score, "img_base64s": img_base64s}

    elif data.get('mask'):
        mask = data.get('mask')
        sliderValue = data.get('sliderValue')
        path, score, img_base64s = rem_mask(img_path=img_path,sliderValue=sliderValue, masks=mask,dilate_kernel_size=15)
        return {"message": "Success", "mask_plot":path, "score":score,"img_base64s": img_base64s}

    return {"message":"ok"}