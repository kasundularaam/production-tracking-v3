from passlib.context import CryptContext
import jwt
from typing import Dict, Any, Optional

# Configuration
JWT_SECRET = "your_secret_key_change_this_in_production"
ALGORITHM = "HS256"

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify if the provided password matches the stored hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a password hash using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT access token without expiration.
    """
    to_encode = data.copy()
    # No expiration time is set, making the token valid indefinitely
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode a JWT token without verifying expiration.
    """
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_exp": False}  # Don't verify expiration
        )
        return payload
    except jwt.PyJWTError:
        return None
