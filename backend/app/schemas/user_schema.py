from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    username: str
    password: str
    role: Optional[str] = "user"  # "admin" or "user"


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    username: str
    role: str

    class Config:
        from_attributes = True