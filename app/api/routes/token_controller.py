from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Union, Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.database import get_db
from core.security import (
    create_access_token, check_auth_admin, pwd_context, oauth2_scheme, security, get_current_user
) 
from crud import users
import app.schemas.schemas as schemas
router = APIRouter()


@router.post("/token", response_model=schemas.Token, status_code=status.HTTP_200_OK)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)
):
    output = users.login_for_access_token(db, form_data.username, form_data.password, pwd_context)
    if not output:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=[{"msg":"Incorrect username or password"}],
            headers={"WWW-Authenticate": "Bearer"},
        )
    return output