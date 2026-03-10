from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ContactBase(BaseModel):
    order_id: int
    user_id: str
    message: str

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    status: Optional[str] = None

class Contact(ContactBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True