from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from . import service, schemas
from app.core.database import get_db
import httpx, os

router = APIRouter(prefix="/auth", tags=["Authentication"])

LOGTO_ENDPOINT = os.getenv("LOGTO_ENDPOINT")
LOGTO_APP_ID = os.getenv("LOGTO_APP_ID") 
LOGTO_APP_SECRET = os.getenv("APP_SECRET")

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

@router.post("/verifyPassword")
async def verifyPassword(logto_id: str, currentPassword: str):
    print(f"verify password")
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

@router.post("/updatePassword")
def updatePassword(logto_id: str, newPassword: str):
    print(f"update password")
    return service.update_password
