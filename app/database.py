from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.models import Base, User, UserRole
from app.services.auth_service import get_password_hash

# Database configuration
DATABASE_URL = "sqlite:///./production_tracking.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database dependency function


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database


async def init_db():
    """
    Initialize the database and create tables.
    Also creates an admin user if one doesn't exist.
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create admin user if it doesn't exist
    _create_initial_admin()


def _create_initial_admin():
    """Create the initial admin user if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(
            User.sap_id == "0000",
            User.role == UserRole.ADMIN
        ).first()

        # If admin doesn't exist, create it
        if not admin:
            # Create new admin user with hashed password
            hashed_password = get_password_hash("123456")

            admin = User(
                sap_id="0000",
                name="SUPA ADMIN 👑",
                role=UserRole.ADMIN,
                password=hashed_password
            )

            db.add(admin)
            db.commit()
            print("Admin user created successfully!")

    finally:
        db.close()
