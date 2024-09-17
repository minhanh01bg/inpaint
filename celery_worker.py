from celery import Celery

celery_app = Celery(
    "upscaler",
    broker="redis://localhost:6379/0",  # Redis broker
    backend="redis://localhost:6379/0"  # Redis backend
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json"
)
