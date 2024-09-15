from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import Union, Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core.security import (
    create_access_token, check_auth_admin, pwd_context, oauth2_scheme, security, get_current_user
) 

from pydantic import BaseModel, Field
from typing import List, Union, Optional

import app.schemas.schemas as schemas
import string
import random
import os
from utils_birefnet import random_string, remove_file
import time
from test import extract_object, birefnet
from segments import SegmentAnything
from pathlib import Path
from utils import load_img_to_array, save_array_to_img, dilate_mask, \
    show_mask, show_points, get_clicked_point
import matplotlib.pyplot as plt
from lama_inpaint import inpaint_img_with_lama
router = APIRouter()


# img_path = "./example/remove-anything/dog.jpg"
yolov8_model_path = './weights/yolov8n.pt'
sam2_checkpoint = './sam2/checkpoints/sam2_hiera_large.pt'
sam2_model_config = 'sam2_hiera_l.yaml'
lama_ckpt = "./pretrained_models/big-lama"
lama_config = "./lama/configs/prediction/default.yaml"

seg = SegmentAnything(yolov8_model_path, sam2_checkpoint, sam2_model_config)

@router.post("/imgs_inpaint", status_code=status.HTTP_200_OK)
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
    folder = f"./app/media/{filename.split('.')[0]}"
    # folder = "app/media"
    if not os.path.exists(folder):
        os.mkdir(folder)
    
    file_location = f"{folder}/{filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    # process
    size = file.size / (1024* 1024)
    
    # remove_file(file_location)
    return {"image":file_location,"file_size":f"{size:.2f}"}

# Define models for user inputs
class Box(BaseModel):
    x: float
    y: float
    width: float
    height: float

class Point(BaseModel):
    x: float
    y: float

class Mask(BaseModel):
    points: List[Point]  # A mask is a list of points

# Model to accept the user input for the request
class RemoveAnythingRequest(BaseModel):
    img_path: str = Field(..., description="The URL or path to the image")
    box: Optional[List[Box]] = None  # Optional, only one should be sent at a time
    point: Optional[List[Point]] = None
    mask: Optional[List[Mask]] = None

    @property
    def is_valid_request(self):
        # Ensure only one of box, point, or mask is provided
        return sum([self.box is not None, self.point is not None, self.mask is not None]) == 1

@router.post('/remove_anything', status_code=status.HTTP_200_OK)
async def remove_anything(request: RemoveAnythingRequest):
    # Validate the request data
    if not request.is_valid_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a box, point, or mask, but not multiple."
        )

    img_path = request.img_path
    # Assuming you have a method to load and process the image
    # try:
        # Load the image based on img_path
        # process_image(img_path)  # Placeholder for actual image processing logic
    img_path = img_path.split(":")[2]
    img_path = img_path[5:]
    folder = img_path.split("/")[0] + "/" + img_path.split("/")[1] + "/" + img_path.split("/")[2] + "/" + img_path.split("/")[3] 
    
    print(folder)
    # process
    seg.load_image(img_path)
    
    if request.box:
        box = request.box
        print(box)
        seg.plot_box(folder,box)
        masks = seg.get_mask2action(box,15)
        
        out_dir = Path(f"{folder}/results")
        out_dir.mkdir(parents=True, exist_ok=True)
        img = seg.convert_img2array()
        for idx, mask in enumerate(masks):
            mask_p = out_dir / f"mask_{idx}.png"
            img_points_p = out_dir / f"with_points.png"
            img_mask_p = out_dir / f"with_{Path(mask_p).name}"

            save_array_to_img(mask, mask_p)
            dpi = plt.rcParams['figure.dpi']
            
            height, width = img.shape[:2]

            plt.figure(figsize=(width/dpi/0.77, height/dpi/0.77))
            plt.imshow(img)
            plt.axis('off')
            plt.savefig(img_points_p, bbox_inches='tight', pad_inches=0)
            show_mask(plt.gca(), mask, random_color=False)
            plt.savefig(img_mask_p, bbox_inches='tight', pad_inches=0)
            plt.close()

        for idx, mask in enumerate(masks):
            mask_p = out_dir / f"mask_{idx}.png"
            img_inpainted_p = out_dir / f"inpainted_with_{Path(mask_p).name}"
            img_inpainted = inpaint_img_with_lama(
                img, mask, lama_config, lama_ckpt, device=seg.device)
            save_array_to_img(img_inpainted, img_inpainted_p)
            

    elif request.point:
        point = request.point
        print(point)
        seg.plot_box(folder,points=point)
        masks = seg.get_mask2action(points=point,dilate_kernel_size=15)
        
        out_dir = Path(f"{folder}/results")
        out_dir.mkdir(parents=True, exist_ok=True)
        img = seg.convert_img2array()
        for idx, mask in enumerate(masks):
            mask_p = out_dir / f"mask_{idx}.png"
            img_mask_p = out_dir / f"with_{Path(mask_p).name}"
            save_array_to_img(mask, mask_p)
            dpi = plt.rcParams['figure.dpi']
            
            height, width = img.shape[:2]

            plt.figure(figsize=(width/dpi/0.77, height/dpi/0.77))
            plt.imshow(img)
            plt.axis('off')
            show_mask(plt.gca(), mask, random_color=False)
            plt.savefig(img_mask_p, bbox_inches='tight', pad_inches=0)
            plt.close()

        for idx, mask in enumerate(masks):
            mask_p = out_dir / f"mask_{idx}.png"
            img_inpainted_p = out_dir / f"inpainted_with_{Path(mask_p).name}"
            img_inpainted = inpaint_img_with_lama(
                img, mask, lama_config, lama_ckpt, device=seg.device)
            save_array_to_img(img_inpainted, img_inpainted_p)

    elif request.mask:
        mask = request.mask
        print(mask)

    return {"message": "Success", "img_path": img_path}

    # except Exception as e:
    #     raise HTTPException(
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         detail=f"An error occurred while processing the image: {str(e)}"
    #     )