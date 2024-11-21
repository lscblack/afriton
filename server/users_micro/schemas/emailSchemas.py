from pydantic import BaseModel, EmailStr
from typing import List, Literal, Optional

class EmailSchema(BaseModel):
    purpose: Literal["login", "email","reset","Info"]
    toEmail: EmailStr

class OtpVerify(BaseModel):
    otp_code: str
    verification_code: str
    email: str
    purpose: str