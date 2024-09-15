import uuid
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index = True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    birth = Column(String, default=None, index=True)
    first_name = Column(String, default=None, index=True)
    last_name = Column(String, default=None, index=True)
    email = Column(String, default=None, index=True)
    address = Column(String, default=None, index=True)
    phone = Column(String, default=None, index=True)
    avatar = Column(String, default=None, index=True)
    gender = Column(String, default=None, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    tokens = relationship("Token", back_populates="owner")

class Token(Base):
    __tablename__ = "auth_tokens"

    id = Column(Integer, primary_key=True, index=True)
    access_token = Column(String, index=True, unique=True)
    token_type = Column(String, default="bearer")
    username = Column(String, ForeignKey("users.username"))
    expired_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="tokens")
