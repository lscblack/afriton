from pydantic import BaseModel, EmailStr,validator,Field
from typing import List, Optional, Literal
from datetime import date,datetime


class ReturnUser(BaseModel):
    fname: Optional[str] = None
    lname: Optional[str] = None
    avatar: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    acc_type: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    acc_status: Optional[bool] = False
    class Config:
        orm_mode = True
        from_attributes = True  # Enable this to use from_orm

