from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings

# Future imports for routes
# from backend.api.api_v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/")
def root():
    return {"message": "Welcome to ReelForge API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

from backend.api.api import api_router


app.include_router(api_router, prefix=settings.API_V1_STR)

# Configure logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

# Mount static files for video preview
from fastapi.staticfiles import StaticFiles
import os

# Ensure data directory exists
os.makedirs("/app/data", exist_ok=True)

# Mount /files to serve from /app/data
app.mount("/files", StaticFiles(directory="/app/data"), name="files")

