from fastapi import APIRouter
from app.api.routes import home, rembg_controller, user_controller, inpaint

api_router = APIRouter()
api_router.include_router(home.router,prefix='/home',tags=['home'])
api_router.include_router(rembg_controller.router,prefix='',tags=['test'])
api_router.include_router(user_controller.router,prefix='',tags=['user'])
api_router.include_router(inpaint.router,prefix='',tags=['inpaint'])