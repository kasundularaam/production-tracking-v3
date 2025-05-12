from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from contextlib import asynccontextmanager

# Import routers
from app.routes.web import router as web_router

# Import database functions
from app.database import init_db

# Import middleware
from app.middleware.auth_middleware import auth_middleware
from app.routes.api.auth_api import router as auth_api_router
from app.routes.api.admin_api import router as admin_api_router
from app.routes.api.planner_api import router as planner_api_router
from app.routes.api.team_leader_api import router as team_leader_api_router

# Define lifespan context manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the database
    await init_db()
    yield
    # Shutdown: Clean up resources if needed
    pass

# Create FastAPI app with lifespan
app = FastAPI(
    title="ETD Production Tracking",
    description="Manufacturing operations tracking and management system",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add auth middleware
app.middleware("http")(auth_middleware)

# Configure static files
app.mount("/static", StaticFiles(directory=Path(__file__).parent /
          "public"), name="static")

# Include routers
app.include_router(web_router)
app.include_router(auth_api_router)
app.include_router(admin_api_router)
app.include_router(planner_api_router)
app.include_router(team_leader_api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
