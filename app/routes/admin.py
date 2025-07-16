from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models.user import UserUpdate, UserResponse
from app.services.auth_service import auth_service
from app.routes.auth import get_current_user
from app.services.ai_rerun_service import run_ai_analysis_and_notify  

router = APIRouter(prefix="/admin", tags=["Admin"])

# Admin role check
def require_admin(current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ✅ Get all users (admin only)
@router.get("/users", response_model=List[UserResponse])
async def get_all_users(admin_user=Depends(require_admin)):
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


# ✅ Update user role or skills (admin only)
@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    admin_user=Depends(require_admin)
):
    updated_user = await auth_service.update_user_role_and_skills(
        user_id,
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


# ✅ Admin-triggered rerun of AI + email
@router.post("/rerun-ai", status_code=200)
async def trigger_rerun_ai(admin_user=Depends(require_admin)):
    """
    Admin-triggered AI re-analysis of failed tickets only.

    ✅ Filters only tickets where:
        - ai_notes == "AI analysis unavailable. Please review manually."
        - status != "resolved"

    Re-runs Gemini analysis and notifies moderators via email.
    """
    try:
        await run_ai_analysis_and_notify()
        return {"message": "✅ AI re-analysis of fallback tickets triggered successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"❌ Failed to rerun AI analysis: {str(e)}"
        )

