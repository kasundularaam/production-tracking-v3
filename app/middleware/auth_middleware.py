from fastapi import Request
from app.database import get_db
from app.services.auth_service import decode_token
from app.models import User


async def auth_middleware(request: Request, call_next):
    """
    Middleware to authenticate users and attach them to the request state.
    This middleware doesn't block any requests - it just adds user info if available.
    """
    # Get the authorization header
    authorization = request.headers.get("Authorization")
    token = None

    # Extract the token if it exists
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")

    # Use dependency for DB session
    for db in get_db():
        # If we have a token, try to get the user
        if token:
            payload = decode_token(token)
            if payload and "sub" in payload:
                # Get user from database
                sap_id = payload["sub"]
                user = db.query(User).filter(User.sap_id == sap_id).first()
                if user:
                    # Attach the user to the request state
                    request.state.user = user
                else:
                    # Invalid user, but we don't block the request
                    request.state.user = None
            else:
                # Invalid token, but we don't block the request
                request.state.user = None
        else:
            # No token provided
            request.state.user = None

    # Call the next middleware/endpoint
    response = await call_next(request)
    return response
