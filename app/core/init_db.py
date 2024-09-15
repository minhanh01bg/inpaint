from sqlalchemy.orm import Session
from app import models
from app.core.database import SessionLocal
from app.core.security import create_access_token, pwd_context
from app import crud
from datetime import datetime
from app.core.config import settings
def create_superuser():
    password = settings.superuser['password']
    settings.superuser['password'] = pwd_context.hash(password)

    database_addsuperuser = SessionLocal()
    user = database_addsuperuser.query(models.User).filter(models.User.username =='admin').first()
    if user is None:
        addsuperuser = models.User(id=settings.superuser['id'], username=settings.superuser['username'],
                                hashed_password=settings.superuser['password'], is_active=settings.superuser['is_active'], is_admin=settings.superuser['is_admin'])
        
        database_addsuperuser.add(addsuperuser)
        access_token, to_encode = create_access_token(
            data={"sub": addsuperuser.username}
        )
        d = datetime.fromtimestamp(to_encode.get("exp"))
        crud.add_token(db=database_addsuperuser,
                    username=addsuperuser.username, access_token=access_token, expired_at=d)
        database_addsuperuser.commit()
        database_addsuperuser.refresh(addsuperuser)
        database_addsuperuser.close()
    else:
        database_addsuperuser.close()
        print('admin is oke')

# create_superuser()
