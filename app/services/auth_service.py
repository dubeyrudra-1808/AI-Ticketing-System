from app.models.database import get_database
from app.models.user import UserInDB, UserRole
from app.utils.security import get_password_hash, verify_password
from typing import Optional, List
from bson import ObjectId
from datetime import datetime

class AuthService:
    async def create_user(self, email: str, username: str, password: str, full_name: str = None) -> UserInDB:
        """Create a new user"""
        db = get_database()
        hashed_password = get_password_hash(password)
        user_data = {
            "email": email,
            "username": username,
            "hashed_password": hashed_password,
            "full_name": full_name,
            "role": UserRole.USER,
            "skills": [],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": None
        }
        
        result = await db.users.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return UserInDB(**user_data)
    
    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """Authenticate user by email and password"""
        db = get_database()
        user_doc = await db.users.find_one({"email": email})
        if not user_doc:
            return None
        
        user = UserInDB(**user_doc)
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email"""
        db = get_database()
        user_doc = await db.users.find_one({"email": email})
        if user_doc:
            return UserInDB(**user_doc)
        return None

    async def get_user_by_username(self, username: str) -> Optional[UserInDB]:
        """Get user by username"""
        db = get_database()
        user_doc = await db.users.find_one({"username": username})
        if user_doc:
            return UserInDB(**user_doc)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID"""
        db = get_database()
        try:
            user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
            if user_doc:
                return UserInDB(**user_doc)
        except Exception:
            pass
        return None
    
    async def update_user_role_and_skills(self, user_id: str, role: UserRole, skills: List[str] = None) -> Optional[UserInDB]:
        """Update user role and skills (admin only)"""
        db = get_database()
        try:
            update_data = {
                "role": role,
                "updated_at": datetime.utcnow()
            }
            if skills is not None:
                update_data["skills"] = skills
            
            result = await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
            if result.modified_count:
                return await self.get_user_by_id(user_id)
        except Exception as e:
            print(f"Error updating user: {e}")
        
        return None
    
    async def get_all_users(self) -> List[UserInDB]:
        """Get all users (admin only)"""
        db = get_database()
        users = []
        async for user_doc in db.users.find():
            users.append(UserInDB(**user_doc))
        return users

# Export a singleton instance
auth_service = AuthService()
