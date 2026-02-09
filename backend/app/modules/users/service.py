from datetime import datetime
from sqlalchemy.orm import Session
from . import models, schemas
from app.utils.utils import get_currency_by_ip

def login_and_register_user(db: Session, login_data: schemas.LoginRequest, user_ip_address: str):
    # 1. 检查id是否存在
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
    
    # 3. 如果不存在，创建新用户
    new_user = models.User (
        logto_id=login_data.logto_id,
        email=login_data.email,
        nickname=login_data.email.split('@')[0], # 初始昵称设为邮箱前缀
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