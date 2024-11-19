from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime  # Import datetime
class FeedbackRequestCreate(BaseModel):
    email: EmailStr
    content: str

class FeedbackRequestResponse(BaseModel):
    id: int
    email: EmailStr
    content: str
    status: str
    created_at: datetime
    viewed_at: Optional[datetime] = None

    class Config:
        orm_mode = True
