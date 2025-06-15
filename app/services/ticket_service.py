# app/services/ticket_service.py

from app.models.database import get_database
from app.models.ticket import TicketInDB, TicketStatus, TicketPriority
from app.models.user import UserRole, UserInDB
from app.services.ai_service import ai_service
from app.services.email_service import email_service
from bson import ObjectId
from datetime import datetime
import re


class TicketService:
    def __init__(self, db):
        """
        Initialize TicketService with a connected MongoDB database instance.
        """
        self.db = db

    async def create_ticket(self, title: str, description: str, user_id: str) -> TicketInDB:
        """
        Create a new ticket document and insert it into MongoDB.
        Then kick off AI processing (to set required_skills, priority, ticket_type, ai_notes, assigned_to).
        """
        ticket_data = {
            "title": title,
            "description": description,
            "status": TicketStatus.OPEN,
            "priority": TicketPriority.MEDIUM,
            "ticket_type": None,
            "required_skills": [],
            "ai_notes": None,
            "created_by": user_id,
            "assigned_to": None,
            "created_at": datetime.utcnow(),
            "updated_at": None
        }

        # Insert into MongoDB
        result = await self.db.tickets.insert_one(ticket_data)
        ticket_data["_id"] = result.inserted_id

        # Build Pydantic model from inserted document
        ticket = TicketInDB(**ticket_data)

        # Asynchronously process with AI (in the background)
        await self.process_ticket_with_ai(str(ticket.id))

        return ticket

    async def process_ticket_with_ai(self, ticket_id: str):
        """
        Given a ticket_id, fetch its document, run AI analysis, update fields:
        - required_skills
        - priority
        - ticket_type
        - ai_notes
        - assigned_to (find a matching moderator or default to an admin)
        """
        try:
            # Fetch the ticket document
            ticket_doc = await self.db.tickets.find_one({"_id": ObjectId(ticket_id)})
            if not ticket_doc:
                return

            ticket = TicketInDB(**ticket_doc)

            # Call AI service to analyze title+description
            ai_analysis = await ai_service.analyze_ticket(ticket.title, ticket.description)

            update_data = {
                "required_skills": ai_analysis.get("required_skills", []),
                "priority": ai_analysis.get("priority", TicketPriority.MEDIUM),
                "ticket_type": ai_analysis.get("ticket_type", "support"),
                "ai_notes": ai_analysis.get("helpful_notes", ""),
                "updated_at": datetime.utcnow()
            }

            # Find the best matching moderator (or fallback to an admin)
            assigned_moderator = await self.find_matching_moderator(update_data["required_skills"])
            if assigned_moderator:
                update_data["assigned_to"] = str(assigned_moderator.id)

                # If a moderator was found, send them an assignment email
                ticket_data_for_email = {
                    "title": ticket.title,
                    "description": ticket.description,
                    "priority": update_data["priority"],
                    "ticket_type": update_data["ticket_type"],
                    "ai_notes": update_data["ai_notes"]
                }
                await email_service.send_ticket_assignment_email(
                    assigned_moderator.email,
                    ticket_data_for_email
                )

            # Update the MongoDB document
            await self.db.tickets.update_one(
                {"_id": ObjectId(ticket_id)},
                {"$set": update_data}
            )

        except Exception as e:
            # Log the exception; do not crash
            print(f"Error processing ticket with AI: {e}")

    async def find_matching_moderator(self, required_skills: list) -> UserInDB | None:
        """
        Find a moderator whose skills best match the required_skills list.
        If none match, fall back to returning any admin user.
        """
        moderators = []
        # Fetch all active moderators
        async for user_doc in self.db.users.find({
            "role": UserRole.MODERATOR,
            "is_active": True
        }):
            moderators.append(user_doc)

        best_match = None
        max_matches = 0

        for mod_doc in moderators:
            if not mod_doc.get("skills"):
                continue

            # Count how many required_skills match this moderator's skills
            matches = sum(
                1 for req in required_skills
                if any(re.search(req.lower(), skill.lower()) for skill in mod_doc["skills"])
            )

            if matches > max_matches:
                max_matches = matches
                best_match = mod_doc

        # If no moderator matched, fall back to any admin
        if not best_match:
            admin_doc = await self.db.users.find_one({"role": UserRole.ADMIN})
            if admin_doc:
                return UserInDB(**admin_doc)

        if best_match:
            return UserInDB(**best_match)

        return None

    async def get_user_tickets(self, user_id: str, user_role: str) -> list[TicketInDB]:
        """
        Retrieve tickets based on the role of the requesting user:
        - Admin: all tickets
        - Moderator: tickets assigned to them or unassigned tickets
        - User: tickets created by this user
        """
        if user_role == UserRole.ADMIN:
            query = {}
        elif user_role == UserRole.MODERATOR:
            query = {"$or": [{"assigned_to": user_id}, {"assigned_to": None}]}
        else:
            query = {"created_by": user_id}

        tickets: list[TicketInDB] = []
        cursor = self.db.tickets.find(query).sort("created_at", -1)
        async for doc in cursor:
            tickets.append(TicketInDB(**doc))
        return tickets

    async def get_ticket_by_id(self, ticket_id: str) -> TicketInDB | None:
        """
        Fetch a single ticket document by its ObjectId. Return None if not found or invalid ID.
        """
        try:
            doc = await self.db.tickets.find_one({"_id": ObjectId(ticket_id)})
            if doc:
                return TicketInDB(**doc)
        except Exception:
            pass
        return None

    async def update_ticket_status(self, ticket_id: str, status: TicketStatus) -> bool:
        """
        Update the status and updated_at timestamp of a ticket.
        Return True if a document was modified, False otherwise.
        """
        try:
            result = await self.db.tickets.update_one(
                {"_id": ObjectId(ticket_id)},
                {"$set": {"status": status, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    async def get_ticket_statistics(self) -> dict:
        """
        Aggregate ticket statistics for an admin dashboard:
        - Total tickets
        - Open tickets
        - In-progress tickets
        - Resolved tickets
        - Urgent priority tickets
        """
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "open": {"$sum": {"$cond": [{"$eq": ["$status", "open"]}, 1, 0]}},
                    "in_progress": {"$sum": {"$cond": [{"$eq": ["$status", "in_progress"]}, 1, 0]}},
                    "resolved": {"$sum": {"$cond": [{"$eq": ["$status", "resolved"]}, 1, 0]}},
                    "urgent": {"$sum": {"$cond": [{"$eq": ["$priority", "urgent"]}, 1, 0]}}
                }
            }
        ]

        result = await self.db.tickets.aggregate(pipeline).to_list(length=1)
        if result:
            stats = result[0]
            return {
                "total": stats.get("total", 0),
                "open": stats.get("open", 0),
                "in_progress": stats.get("in_progress", 0),
                "resolved": stats.get("resolved", 0),
                "urgent": stats.get("urgent", 0),
            }

        return {"total": 0, "open": 0, "in_progress": 0, "resolved": 0, "urgent": 0}

