import os
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError
from google.oauth2 import id_token
from google.auth.transport import requests

from services.db import users_collection
from models.auth_models import GoogleAuthRequest, LoginResponse, UserResponse

# Load environment configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or "default-secret-key-fallback-change-in-prod"
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

router = APIRouter(tags=["authentication"])
security = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Utility to generate a signed JWT token with custom expiration"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Reusable FastAPI dependency to authenticate requests.
    Validates the Bearer JWT token from the Authorization header and fetches user details.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("user_id")
        email: str = payload.get("email")
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Missing payload claims",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Invalid ID format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def verify_google_token(token: str) -> dict:
    """Verifies the integrity of Google Sign-In credential token using google-auth library"""
    try:
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return id_info
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google token verification failed: {str(e)}"
        )

@router.post("/google", response_model=LoginResponse)
async def login_google(request: GoogleAuthRequest):
    """
    POST /api/auth/google
    Verifies Google credentials, inserts/updates user in MongoDB, and issues a JWT.
    """
    id_info = verify_google_token(request.token)
    
    email = id_info.get("email")
    name = id_info.get("name")
    picture = id_info.get("picture")
    google_id = id_info.get("sub")
    
    if not google_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid Google token claims"
        )
        
    user = await users_collection.find_one({"google_id": google_id})
    now = datetime.utcnow()
    
    if not user:
        # Insert new user record
        new_user = {
            "google_id": google_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": now,
            "last_login": now
        }
        result = await users_collection.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        user = new_user
    else:
        # Update last login time
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": now}}
        )
        user["last_login"] = now
        
    token_data = {
        "user_id": str(user["_id"]),
        "email": user["email"]
    }
    
    access_token = create_access_token(token_data, expires_delta=timedelta(days=30))
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_mongo(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    GET /api/auth/me
    Returns the authenticated user details.
    """
    return UserResponse.from_mongo(current_user)

@router.post("/logout")
async def logout():
    """
    POST /api/auth/logout
    Stateless logout route. Returns a confirmation response.
    """
    return {"message": "Logged out successfully"}
