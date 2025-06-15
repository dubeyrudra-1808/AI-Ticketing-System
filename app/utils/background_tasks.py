import asyncio
from app.models.database import get_database
from app.services.ticket_service import TicketService

class BackgroundTasks:
    def __init__(self):
        self.tasks = []

    def add_task(self, coro):
        task = asyncio.create_task(coro)
        self.tasks.append(task)
        # Remove any tasks that have already completed
        self.tasks = [t for t in self.tasks if not t.done()]
        return task

    async def wait_for_all(self):
        if self.tasks:
            await asyncio.gather(*self.tasks, return_exceptions=True)

background_tasks = BackgroundTasks()

def process_ticket_async(ticket_id: str):
    """
    Fetch the database _at call time_ (when connect_to_mongo() has already run),
    instantiate TicketService, and then schedule the AI-processing coroutine.
    """
    db = get_database()  # Now that FastAPI’s lifespan has run, this will be the real DB object
    service = TicketService(db)
    return background_tasks.add_task(
        service.process_ticket_with_ai(ticket_id)
    )
