from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.database import init_db
from app.core.config import settings

# Initialize FastAPI app
app = FastAPI(
    title="NeuroLoad API",
    description="Cognitive performance tracking API for combat athletes",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    print("Database initialized")
    print(f"Server starting on {settings.BACKEND_HOST}:{settings.BACKEND_PORT}")

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to NeuroLoad API",
        "version": "1.0.0",
        "docs": "/docs"
    }
