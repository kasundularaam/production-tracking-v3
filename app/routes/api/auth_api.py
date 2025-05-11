from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models import User
from app.services.auth_service import verify_password, create_access_token

router = APIRouter(prefix="/api/auth")

# Pydantic models for request validation


class LoginData(BaseModel):
    sap_id: str
    password: str


class TokenData(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    sap_id: str
    name: str
    role: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginData, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""

    # Find user by SAP ID
    user = db.query(User).filter(
        User.sap_id == login_data.sap_id,
        User.is_deleted == False
    ).first()

    # Validate user and password
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Create access token
    token_data = {
        "sub": user.sap_id,
        "role": user.role.value
    }

    access_token = create_access_token(token_data)

    # Prepare user response object
    user_response = UserResponse(
        sap_id=user.sap_id,
        name=user.name,
        role=user.role.value
    )

    # Return token and user data
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }


@router.get("/me", response_model=UserResponse)
def get_current_user(request: Request):
    """Get current authenticated user profile"""

    # Access user from request state (injected by middleware)
    user = request.state.user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    return UserResponse(
        sap_id=user.sap_id,
        name=user.name,
        role=user.role.value
    )
