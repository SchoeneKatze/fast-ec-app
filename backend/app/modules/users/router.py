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
    user = service.login_and_register_user(db, login_data, user_ip_address)
    return user