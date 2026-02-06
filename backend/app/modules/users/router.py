from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from . import service, schemas
from core.database import get_db # 假设你的数据库连接在这里

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: request data: {login_data}")
    # 调用 Service 层的逻辑
    user = service.login_and_register_user(db, login_data)
    return user