from pydantic import BaseModel, EmailStr,conlist, validator,root_validator,ValidationError,Field
from typing import List, Optional, Literal
from datetime import date, datetime
from schemas.returnSchemas import ReturnUser


class CreateUserRequest(BaseModel):  # registeration Schema
    fname: str
    mname: Optional[str] = None
    lname: str
    email: EmailStr
    phone: Optional[str] = None
    gender: Optional[str] = None
    password: str
    avatar: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class Token(BaseModel):  # token validation schema
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    UserInfo: ReturnUser


class FromData(BaseModel):  # token validation schema
    username: Optional[str]
    password: Optional[str]


# Define your Pydantic schema for partial updates

class UpdateUserSchema(BaseModel):
    fname: Optional[str] = None
    lname: Optional[str] = None
    avatar: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


# change password
class ChangePassword(BaseModel):
    oldPassword:str
    newPassword:str
 
#   reset password
class ResetPassword(BaseModel):
    otp_code: str
    verification_code: str
    newPassword:str
    

