from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from . import service, schemas
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(request: Request, login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: request data: {login_data}")
    user_ip_address = request.client.host
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

@router.post("/updateNotifications")
async def update_notification_route(
    notification_info: schemas.UpdateNotificationSetting, 
    db: Session = Depends(get_db)
):
    updated_user = await service.update_notifications(notification_info, db)
    return {
        "status": "success", 
        "settings": {
            "email": updated_user.email_notifications,
            "push": updated_user.push_notifications,
            "sms": updated_user.sms_notifications
        }
    }

@router.post("/verifyPassword")
async def verifyPassword(password_data: schemas.PasswordUpdateData):
    print(f"verify password")
    return await service.verify_password(password_data.logto_id, password_data.currentPassword)

@router.post("/updatePassword")
async def updatePassword(password_data: schemas.PasswordUpdateData):
    print(f"update password")
    return await service.update_password(password_data.logto_id, password_data.currentPassword, password_data.newPassword)
