from pydantic import BaseModel, EmailStr
from typing import Optional

class GoogleAuthRequest(BaseModel):
    token: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    picture: Optional[str] = None

    @classmethod
    def from_mongo(cls, user_dict: dict):
        """Helper to construct UserResponse from a MongoDB document dict (mapping _id to id)"""
        if not user_dict:
            return None
        return cls(
            id=str(user_dict.get("_id")),
            name=user_dict.get("name"),
            email=user_dict.get("email"),
            picture=user_dict.get("picture")
        )

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
