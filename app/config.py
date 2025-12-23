from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # MongoDB Atlas
    mongodb_url: str = "mongodb://localhost:27017/ai_ticket_system"
    
    # JWT
    secret_key: str = "your-secret-key-change-in-production-make-it-very-long-and-secure"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AI
    gemini_api_key: str = ""
    
    # Email
    smtp_host: str = "smtp.mailtrap.io"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    from_email: str = "dubeyrudra63@gmail.com"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # App
    app_name: str = "AI Ticket System"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
