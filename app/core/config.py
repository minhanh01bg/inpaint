
class Settings:
    ROUTER ='/api/v1'
    #  DB
    SQLALCHEMY_DATABASE_URL = "sqlite:///./app/db.sqlite3"
    # SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost/fancy"
    # 
    superuser = {
        "id": 1,
        "username": "admin",
        "password": "admin",
        "is_active": True,
        "is_admin": True,
    }

    # Sercurity
    SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 360
    MEDIA_URL = "/app/media"

settings = Settings()