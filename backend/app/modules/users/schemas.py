from datetime import date
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    logto_id: str
    email: EmailStr

class UserUpdateRequest(BaseModel):
    logto_id: str
    nickname: str
    gender: str
    birthday: date
    email: EmailStr
    phone_no: str
    
class PasswordUpdateData(BaseModel):
    logto_id: str
    currentPassword: str
    newPassword: str
    
class ShippingAddressUpdate(BaseModel):
    logto_id: str
    id: int
    tag: str
    recipient_name: str
    phone: str
    country_code: str
    zip_code: str
    state: str | None = None
    city: str | None = None
    address_line: str
    is_default: bool = False
    
class defaultAddressSet(BaseModel):
    logto_id: str
    id: int
    tag: str
    is_default: bool = False