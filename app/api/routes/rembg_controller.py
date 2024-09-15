from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import Union, Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core.security import (
    create_access_token, check_auth_admin, pwd_context, oauth2_scheme, security, get_current_user
) 

import app.schemas.schemas as schemas
import string
import random
import os
from utils_birefnet import random_string, remove_file
import time
from test import extract_object, birefnet
router = APIRouter()


@router.post("/imgs", status_code=status.HTTP_200_OK)
async def login_for_access_token(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    r = random_string(30)
    filename = f'{r}_{file.filename}'
    ext = filename.split('.')[1]
    if ext not in ['jpeg', 'png', 'jpg']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=[{"msg":"file is not image"}],
            headers={"WWW-Authenticate": "Bearer"},
        )
    # folder = f"./app/media/{filename.split('.')[0]}"
    folder = "app/media"
    if not os.path.exists(folder):
        os.mkdir(folder)
    
    file_location = f"{folder}/{filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    # process
    size = file.size / (1024* 1024)
    t_start = time.time()
    image, mask = extract_object(birefnet, file.file)
    image_p = f"{folder}/{r}_image.png"
    mask_p =  f"{folder}/{r}_mask.png"
    image.save(image_p)
    mask.convert("RGB").save(mask_p)
    # remove_file(file_location)
    return {"image":file_location,"remove":image_p, "file_size":f"{size:.2f}"}