from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings  # Your config with MONGODB_URL
import asyncio

class MongoDB:
    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Connect to MongoDB Atlas and create indexes"""
    try:
        mongodb.client = AsyncIOMotorClient(settings.mongodb_url)
        mongodb.database = mongodb.client.get_default_database()
        await create_indexes()
        print("Connected to MongoDB Atlas")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    """Close MongoDB connection"""
    if mongodb.client:
        mongodb.client.close()
        print("Disconnected from MongoDB Atlas")

async def create_indexes():
    """Create necessary indexes on collections for performance"""
    # Unique indexes on user email and username
    await mongodb.database.users.create_index("email", unique=True)
    await mongodb.database.users.create_index("username", unique=True)
    
    # Indexes on tickets collection for faster queries
    await mongodb.database.tickets.create_index("created_by")
    await mongodb.database.tickets.create_index("assigned_to")
    await mongodb.database.tickets.create_index("status")
    await mongodb.database.tickets.create_index("priority")
    await mongodb.database.tickets.create_index("created_at")

def get_database() -> AsyncIOMotorDatabase:
    if mongodb.database is None:
        raise RuntimeError("MongoDB not connected. Call connect_to_mongo() first.")
    return mongodb.database

