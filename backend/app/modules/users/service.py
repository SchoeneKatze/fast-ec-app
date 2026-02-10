from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from app.utils.utils import get_currency_by_ip

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