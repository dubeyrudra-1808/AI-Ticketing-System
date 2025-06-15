from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models.user import UserUpdate, UserResponse
from app.services.auth_service import auth_service
from app.routes.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

def require_admin(current_user = Depends(get_current_user)):
    """Dependency to require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(admin_user = Depends(require_admin)):
    """Get all users (admin only)"""
    users = await auth_service.get_all_users()
    
    return [
        UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            role=user.role,
            skills=user.skills,
            is_active=user.is_active,
            created_at=user.created_at
        )
        for user in users
    ]

@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    admin_user = Depends(require_admin)
):
    """Update user role and skills (admin only)"""
    updated_user = await auth_service.update_user_role_and_skills(
        user_id,  # Correct usage of user_id from path
        user_update.role,
        user_update.skills
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or update failed"
        )
    
    return UserResponse(
        id=str(updated_user.id),
        email=updated_user.email,
        username=updated_user.username,
        full_name=updated_user.full_name,
        role=updated_user.role,
        skills=updated_user.skills,
        is_active=updated_user.is_active,
        created_at=updated_user.created_at
    )

