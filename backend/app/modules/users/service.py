from datetime import datetime
from sqlalchemy.orm import Session
from . import models, schemas

def login_and_register_user(db: Session, login_data: schemas.LoginRequest):
    # 1. 检查邮箱是否存在
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    
    if user:
        user.last_login=datetime.now()
        db.commit()
        return user
    
    # 3. 如果不存在，创建新用户
    new_user = models.User (
        logto_id=login_data.logto_id,
        email=login_data.email,
        nickname=login_data.email.split('@')[0], # 初始昵称设为邮箱前缀
        role='customer',
        created_at=datetime.now(),
        last_login=datetime.now(),
        isActive=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user