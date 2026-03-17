from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from app.utils.utils import get_currency_by_ip
import os,httpx

LOGTO_ENDPOINT = os.getenv("LOGTO_ENDPOINT")
LOGTO_APP_ID = os.getenv("LOGTO_APP_ID") 
LOGTO_APP_SECRET = os.getenv("APP_SECRET")

def login_and_register_user(login_data: schemas.LoginRequest, db: Session, user_ip_address: str):

    user = db.query(models.User).filter(models.User.logto_id == login_data.logto_id).first()
    currency_from_ip = get_currency_by_ip(user_ip_address)
    if user:
        if user.default_currency != currency_from_ip:
            user.default_currency = currency_from_ip
        if user.email != login_data.email:
            user.email = login_data.email
        user.last_login=datetime.now()
        db.commit()
        db.refresh(user)
        return user
    
    new_user = models.User (
        logto_id=login_data.logto_id,
        email=login_data.email,
        nickname=login_data.email.split('@')[0],
        default_currency=currency_from_ip,
        role='customer',
        created_at=datetime.now(),
        last_login=datetime.now(),
        isActive=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def getMe(logto_id:str, db: Session):
    user_me = db.query(models.User).filter(models.User.logto_id == logto_id).first()
    if not user_me:
        raise HTTPException(status_code=404, detail="User not found")
    return user_me

def update_user_info(update_user_info: schemas.UserUpdateRequest, db: Session):
    user = db.query(models.User).filter(models.User.logto_id == update_user_info.logto_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.nickname = update_user_info.nickname
    user.gender = update_user_info.gender
    user.birthday = update_user_info.birthday
    user.phone_no = update_user_info.phone_no
    
    try:
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
async def update_notifications(notification_info: schemas.UpdateNotificationSetting, db: Session):
    user = db.query(models.User).filter(models.User.logto_id == notification_info.logto_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.email_notifications = notification_info.email_notifications
    user.push_notifications = notification_info.push_notifications
    user.sms_notifications = notification_info.sms_notifications

    try:
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        print(f"Error updating notification: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
async def verify_password(logto_id: str, currentPassword: str):
    print(f"DEBUG: LOGTO_ENDPOINT is '{LOGTO_ENDPOINT}'")
    async with httpx.AsyncClient() as client:
        # --- 第一步：获取管理权限的 Access Token ---
        # 这一步不需要 Logto_id，需要的是你的 App ID 和 Secret
        token_response = await client.post(
            f"{LOGTO_ENDPOINT}/oidc/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "grant_type": "client_credentials",
                "resource": f"{LOGTO_ENDPOINT}/api", # 声明你要访问管理 API
                "scope": "all",
                "client_id": LOGTO_APP_ID,
                "client_secret": LOGTO_APP_SECRET,
            }
        )
        token_data = token_response.json()
        mgmt_token = token_data.get("access_token")
        if not mgmt_token:
            print(f"Token error: {token_data}") 
            return {"success": False, "message": "Failed to authenticate with Logto"}

        # --- 第二步：带着这个 Token 去验证密码 ---
        # 请求头写在 headers 参数里
        verify_response = await client.post(
            f"{LOGTO_ENDPOINT}/api/users/{logto_id}/password/verify",
            headers={
                "Authorization": f"Bearer {mgmt_token}", # 这就是你要的请求头
                "Content-Type": "application/json"
            },
            json={"password": currentPassword}
        )

        # Logto 官方文档规定：验证成功返回 204 No Content
        if verify_response.status_code == 204:
            return {"success": True, "message": "Password correct"}
        else:
            return {"success": False, "message": "Password incorrect"}

async def update_password(logto_id: str, currentPassword: str, newPassword: str):
    verify_password_result = await verify_password(logto_id, currentPassword)
    if not verify_password_result["success"]:
        return {"success": False, "message": "Current password is incorrect, cannot update to new password"}
    else:        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                f"{LOGTO_ENDPOINT}/oidc/token",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "grant_type": "client_credentials",
                    "resource": f"{LOGTO_ENDPOINT}/api",
                    "scope": "all",
                    "client_id": LOGTO_APP_ID,
                    "client_secret": LOGTO_APP_SECRET,
                }
            )
        token_data = token_response.json()
        mgmt_token = token_data.get("access_token")
        if not mgmt_token:
            print(f"Token error: {token_data}") 
            return {"success": False, "message": "Failed to authenticate with Logto"}

        # --- 第二步：带着这个 Token 去更新密码 ---
        update_response = await client.patch(
            f"{LOGTO_ENDPOINT}/api/users/{logto_id}/password",
            headers={
                "Authorization": f"Bearer {mgmt_token}",
                "Content-Type": "application/json"
            },
            json={"newPassword": newPassword}
        )
        if update_response.status_code == 204:
            return {"success": True, "message": "Password updated successfully"}
        else:
            return {"success": False, "message": "Failed to update password"}
        