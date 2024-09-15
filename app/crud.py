from sqlalchemy.orm import Session
from app import models
from datetime import datetime
from app.schemas import schemas
from app.core.security import (
    create_access_token, check_auth_admin, pwd_context, oauth2_scheme, security, get_current_user
) 
from sqlalchemy import and_

from fastapi import HTTPException, status
def add_token(db:Session, username: str, access_token: str,expired_at: datetime):
    db_token = models.Token(access_token=access_token, username=username, expired_at=expired_at)
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

def get_token_by_user_id(db: Session, username: str):
    return db.query(models.Token).filter(models.Token.username == username).first()

def authenticate_user(db: Session, username: str, password: str, pwd_context):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=[{"msg":"User not found"}]
            )
    if not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=[{"msg":"Incorrect password"}])
    return user

def get_user_by_token(db:Session, credentials):
    access_token = credentials.credentials.strip()
    # print(token)
    token = db.query(models.Token).filter(models.Token.access_token == access_token).first()
    if not token:
        return None
    return db.query(models.User).filter(models.User.id == token.user_id).first()

def login_for_access_token(db: Session, username: str, password: str, pwd_context):
    user = authenticate_user(db, username, password, pwd_context)
    if not user:
        return None
    token = get_token_by_user_id(db, user.username)

    if token and token.expired_at >= datetime.now():
        access_token = token.access_token
    else:
        access_token, to_encode = create_access_token(data={"sub": user.username})
        expiration_date = datetime.fromtimestamp(to_encode.get("exp"))

        if token:
            token.access_token = access_token
            token.expired_at = expiration_date
        else:
            add_token(db=db, username=user.username, access_token=access_token, expired_at=expiration_date)
        db.commit()
    return {"access_token": access_token, "token_type": "bearer"}


def get_users(db: Session, skip: int = 0, limit: int = 20):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=[{"msg":"Username already exists"}])
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user_by_user_id(db: Session, user_id: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.username == 'admin':
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    
    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}

def delete_user_by_username(db: Session, username: str):
    user = db.query(models.User).filter(models.User.id == username).first()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.username == 'admin':
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    
    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}