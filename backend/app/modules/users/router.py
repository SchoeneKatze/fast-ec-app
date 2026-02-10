from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from . import service, schemas
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(request: Request, login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: request data: {login_data}")
    user_ip_address = request.client.host
    # 调用 Service 层的逻辑
    user = service.login_and_register_user(login_data, db, user_ip_address)
    return user

@router.get("/me")
def getMe(logto_id:str,db: Session = Depends(get_db)):
    print(f"get me start")
    return service.getMe(logto_id,db)

@router.post("/updateUser")
def updateUser(update_user_info: schemas.UserUpdateRequest, db: Session = Depends(get_db)):
    print(f"update user infomation: {update_user_info}")
    return service.update_user_info(update_user_info, db)