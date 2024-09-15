from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app import models
from app.core.database import get_db
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Form, Depends, Security
from app.core.config import settings

# Khởi tạo CryptContext để mã hóa mật khẩu
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Khởi tạo OAuth2PasswordBearer và HTTPBearer
security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token")


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # print(to_encode)
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt, to_encode


# Hàm giải mã và kiểm tra token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=[{"msg":"Signature has expired"}],
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        user = db.query(models.User).filter(models.User.username == username).first()
        token = db.query(models.Token).filter(models.Token.access_token == credentials.credentials).first()
        if token is None:
            raise credentials_exception
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Hàm kiểm tra quyền admin
async def check_auth_admin(
    credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)
):
    user = await get_current_user(credentials, db)
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=[{"msg":"user is not admin"}])
    return user

