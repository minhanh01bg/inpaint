from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import Union, Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core.security import (
    create_access_token, check_auth_admin, pwd_context, oauth2_scheme, security, get_current_user
) 

import os
from utils_birefnet import random_string, remove_file,prepare_image_input
from background_removal import extract_object, birefnet
import base64, io,json

router = APIRouter()


@router.post("/remove_background", status_code=status.HTTP_200_OK)
async def rmbg_img(
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

    # folder = "app/media"
    # if not os.path.exists(folder):
    #     os.mkdir(folder)
    
    # Đọc dữ liệu file mà không cần lưu
    file_content = file.file.read()

    # Chuyển dữ liệu file sang base64
    base64_encoded_image = base64.b64encode(file_content).decode('utf-8')

    # process
    inp = f"""
    {{
        "source": "{base64_encoded_image}",
        "input_type":"base64"
    }}
    """
    data = json.loads(inp)

    image_data = prepare_image_input(data)
    result, mask = extract_object(birefnet, file.file)
    
    # image_p = f"{folder}/{r}_image.png"
    # mask_p =  f"{folder}/{r}_mask.png"
    # result.save(image_p)
    # mask.convert("RGB").save(mask_p)

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