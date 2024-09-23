from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.database import engine
from app import models
from app.core.config import settings
models.Base.metadata.create_all(bind=engine)
from app.core.init_db import create_superuser
create_superuser()

# run app ---------------------------
app = FastAPI(title="AI PHOTO API", description="This API is for research purposes only", version="0.1.0")

# CORS ---------------------------
from fastapi.middleware.cors import CORSMiddleware
origins = ["*", ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# CORS ---------------------------

# link static file
app.mount(settings.MEDIA_URL, StaticFiles(directory="app/media"), name="app/media")
app.include_router(api_router, prefix=settings.ROUTER)