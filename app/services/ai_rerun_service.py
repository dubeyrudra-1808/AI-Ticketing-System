import logging
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from app.services.ai_service import ai_service
from app.services.email_service import email_service
from app.config import settings

logger = logging.getLogger(__name__)

# MongoDB setup
client = AsyncIOMotorClient(settings.mongodb_url)
db = client.get_default_database()
tickets = db["tickets"]
users = db["users"]


async def process_ticket(ticket: dict):
    _id = ticket.get("_id")
    title = ticket.get("title", "")
    description = ticket.get("description", "")
    assigned_to = ticket.get("assigned_to")

    if not title or not description:
        logger.warning(f"⚠️ Skipping ticket {_id} (missing title/description).")
        return

    try:
        # 🔍 Step 1: Run Gemini AI
        ai_result = await ai_service.analyze_ticket(title, description)

        # 🧠 Step 2: Update ticket in DB
        update_fields = {
            "priority": ai_result["priority"],
            "ticket_type": ai_result["ticket_type"],
            "required_skills": ai_result["required_skills"],
            "ai_notes": ai_result["helpful_notes"],
        }
        await tickets.update_one({"_id": _id}, {"$set": update_fields})
        logger.info(f"✅ Ticket {_id} updated with Gemini AI insights.")

        # 📩 Step 3: Notify assigned moderator
        if assigned_to:
            moderator = await users.find_one({"_id": ObjectId(assigned_to)})
            if moderator and moderator.get("email"):
                await email_service.send_ticket_assignment_email(
                    moderator_email=moderator["email"],
                    ticket_data={
                        "title": title,
                        "priority": ai_result["priority"],
                        "ticket_type": ai_result["ticket_type"],
                        "description": description,
                        "ai_notes": ai_result["helpful_notes"]
                    }
                )
                logger.info(f"📨 Email sent to moderator {moderator.get('email')}")

    except Exception as e:
        logger.error(f"❌ Error processing ticket {_id}: {e}")


async def run_ai_analysis_and_notify():
    """
    Admin-triggered: Re-analyze tickets that have fallback AI notes and are unresolved.
    """
    filter_query = {
        "ai_notes": "AI analysis unavailable. Please review manually.",
        "status": {"$ne": "resolved"}
    }

    count = 0
    cursor = tickets.find(filter_query)

    async for ticket in cursor:
        await process_ticket(ticket)
        count += 1

    logger.info(f"🔁 AI re-analysis complete. {count} ticket(s) updated.")
