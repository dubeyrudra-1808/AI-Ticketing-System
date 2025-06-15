from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.models.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, tickets, admin
from app.config import settings
from app.utils.background_tasks import background_tasks

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up AI Ticket System...")
    await connect_to_mongo()
    yield
    print("Shutting down AI Ticket System...")
    await background_tasks.wait_for_all()
    await close_mongo_connection()

app = FastAPI(
    title=settings.app_name,
    description="AI-powered ticket management system with MongoDB Atlas",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "AI Ticket Management System API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )

