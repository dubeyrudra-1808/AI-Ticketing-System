# app/routes/tickets.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models.ticket import TicketCreate, TicketResponse, TicketStatusUpdate
from app.services.ticket_service import TicketService
from app.routes.auth import get_current_user
from app.models.database import get_database

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def get_ticket_service() -> TicketService:
    """
    Dependency that returns a TicketService instance
    after MongoDB has been connected in the app’s lifespan.
    """
    db = get_database()
    return TicketService(db)


@router.post("/", response_model=TicketResponse)
async def create_ticket(
    ticket_data: TicketCreate,
    current_user=Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service),
):
    """Create a new support ticket"""
    ticket = await service.create_ticket(
        ticket_data.title,
        ticket_data.description,
        str(current_user.id),
    )

    return TicketResponse(
        id=str(ticket.id),
        title=ticket.title,
        description=ticket.description,
        status=ticket.status,
        priority=ticket.priority,
        ticket_type=ticket.ticket_type,
        required_skills=ticket.required_skills,
        ai_notes=ticket.ai_notes,
        created_by=ticket.created_by,
        assigned_to=ticket.assigned_to,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
    )


@router.get("/", response_model=List[TicketResponse])
async def get_tickets(
    current_user=Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service),
):
    """Get tickets based on user role"""
    tickets = await service.get_user_tickets(str(current_user.id), current_user.role)

    return [
        TicketResponse(
            id=str(ticket.id),
            title=ticket.title,
            description=ticket.description,
            status=ticket.status,
            priority=ticket.priority,
            ticket_type=ticket.ticket_type,
            required_skills=ticket.required_skills,
            ai_notes=ticket.ai_notes,
            created_by=ticket.created_by,
            assigned_to=ticket.assigned_to,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
        )
        for ticket in tickets
    ]


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    current_user=Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service),
):
    """Get a specific ticket"""
    ticket = await service.get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Check permissions
    if current_user.role == "user" and ticket.created_by != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this ticket",
        )

    return TicketResponse(
        id=str(ticket.id),
        title=ticket.title,
        description=ticket.description,
        status=ticket.status,
        priority=ticket.priority,
        ticket_type=ticket.ticket_type,
        required_skills=ticket.required_skills,
        ai_notes=ticket.ai_notes,
        created_by=ticket.created_by,
        assigned_to=ticket.assigned_to,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
    )


@router.patch("/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: str,
    status_update: TicketStatusUpdate,
    current_user=Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service),
):
    """Update ticket status (moderators and admins only)"""
    if current_user.role not in ["moderator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update ticket status",
        )

    ticket = await service.get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Check if moderator is assigned to this ticket
    if current_user.role == "moderator" and ticket.assigned_to != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this ticket",
        )

    success = await service.update_ticket_status(ticket_id, status_update.status)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update ticket status",
        )

    return {"message": "Ticket status updated successfully"}


@router.get("/stats/dashboard")
async def get_ticket_statistics(
    current_user=Depends(get_current_user),
    service: TicketService = Depends(get_ticket_service),
):
    """Get ticket statistics for dashboard (admins only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view statistics",
        )

    stats = await service.get_ticket_statistics()
    return stats
