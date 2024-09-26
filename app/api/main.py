from fastapi import APIRouter
from app.api.routes import inpaint_controller, rembg_controller, upscaler_controller, user_controller
# from app.api.routes import inpaint_controller, rembg_controller, user_controller
api_router = APIRouter()
api_router.include_router(rembg_controller.router,prefix='',tags=['Background removal'])
api_router.include_router(user_controller.router,prefix='',tags=['user'])
api_router.include_router(inpaint_controller.router,prefix='',tags=['inpaint'])
api_router.include_router(upscaler_controller.router, prefix='', tags=['upscaler'])