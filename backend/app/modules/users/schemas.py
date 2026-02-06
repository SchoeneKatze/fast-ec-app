from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    logto_id: str
    email: EmailStr