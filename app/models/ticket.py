from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, field):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TicketInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    description: str
    status: TicketStatus = TicketStatus.OPEN
    priority: TicketPriority = TicketPriority.MEDIUM
    ticket_type: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    ai_notes: Optional[str] = None
    created_by: str  # user id as string
    assigned_to: Optional[str] = None  # user id as string
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None  # for updates

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: Optional[TicketPriority] = TicketPriority.MEDIUM
    ticket_type: Optional[str] = None
    required_skills: Optional[List[str]] = None

class TicketResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    priority: str
    ticket_type: Optional[str]
    required_skills: List[str]
    ai_notes: Optional[str]
    created_by: str
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime] = None

class TicketStatusUpdate(BaseModel):
    status: TicketStatus

