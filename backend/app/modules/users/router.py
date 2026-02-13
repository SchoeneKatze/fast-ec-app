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

@router.post("/verifyPassword")
async def verifyPassword(password_data: schemas.PasswordUpdateData):
    print(f"verify password")
    return await service.verify_password(password_data.logto_id, password_data.currentPassword)

@router.post("/updatePassword")
async def updatePassword(password_data: schemas.PasswordUpdateData):
    print(f"update password")
    return await service.update_password(password_data.logto_id, password_data.currentPassword, password_data.newPassword)

@router.get("/getAddresses")
def getAddresses(logto_id: str, db: Session = Depends(get_db)):
    print(f"get addresses for logto_id: {logto_id}")
    return service.get_addresses(logto_id, db)

@router.post("/addAddress")
def addAddress(address_data: schemas.ShippingAddressUpdate, db: Session = Depends(get_db)):
    print(f"add address: {address_data.tag}")
    return service.add_address(address_data, db)

@router.post("/updateAddress")
def updateAddress(address_data: schemas.ShippingAddressUpdate, db: Session = Depends(get_db)):
    print(f"update address: {address_data.tag}")
    return service.update_address(address_data, db)

@router.post("/setDefaultAddress")
def setDefaultAddress(address_data: schemas.defaultAddressSet, db: Session = Depends(get_db)):
    print(f"set as default address : {address_data.tag}")
    return service.set_default_address(address_data, db)