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
    
class UpdateNotificationSetting(BaseModel):
    logto_id: str
    email_notifications: bool
    push_notifications: bool
    sms_notifications: bool
    
class PasswordUpdateData(BaseModel):
    logto_id: str
    currentPassword: str
    newPassword: str
    