from fastapi import APIRouter
from app.api.routes import inpaint_controller, rembg_controller, user_controller, upscaler_route

api_router = APIRouter()
api_router.include_router(rembg_controller.router,prefix='',tags=['test'])
api_router.include_router(user_controller.router,prefix='',tags=['user'])
api_router.include_router(inpaint_controller.router,prefix='',tags=['inpaint'])
api_router.include_router(upscaler_route.router, prefix='', tags=['upscaler'])