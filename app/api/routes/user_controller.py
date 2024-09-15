from fastapi import File, UploadFile, HTTPException, status, Form, Depends, Security, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
import app.schemas.schemas as schemas
from app import crud
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.security import (
    create_access_token, check_auth_admin, pwd_context, oauth2_scheme, security, get_current_user
)  # Import từ security.py
from typing import Union, Annotated
router = APIRouter()

@router.get("/users/me", response_model=schemas.User, tags=['user'], status_code=status.HTTP_200_OK)
async def read_users_me(current_user: schemas.User = Security(get_current_user)):
    if current_user is None:
        raise HTTPException(status_code=404, detail=[{"msg":"User not found"}])
    return current_user

@router.post("/create_user", response_model=schemas.User, tags=['user'], status_code=status.HTTP_201_CREATED)
async def create_user(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db), current_user: schemas.User = Security(check_auth_admin)):
    return crud.create_user(db, user)

@router.get("/users", response_model=list[schemas.User], tags=['user'], status_code=status.HTTP_200_OK)
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Security(check_auth_admin)):
    return crud.get_users(db, skip=skip, limit=limit)

@router.delete("/users/{user_id}", tags=['user'], status_code=status.HTTP_200_OK)
async def delete_user(user_id: str, db: Session = Depends(get_db), current_user: schemas.User = Security(check_auth_admin)):
    return crud.delete_user_by_user_id(db, user_id)

@router.post("/login", response_model=schemas.Token, tags=['user'], status_code=status.HTTP_200_OK)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return crud.login_for_access_token(db, form_data.username, form_data.password, pwd_context)

