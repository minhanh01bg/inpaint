from fastapi import APIRouter, Security
from fastapi.responses import JSONResponse
import json
from app.core.security import check_auth_admin
from app.schemas import schemas
router = APIRouter()

@router.get('/home')
async def home(user: schemas.User = Security(check_auth_admin)):
    return {'ok'}