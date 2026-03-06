"""Organization Pydantic models."""

from pydantic import BaseModel, Field
from typing import Optional


class OrgCreate(BaseModel):
    name: str
    org_type: str = Field(
        ...,
        pattern="^(university_club|student_association|ngo|sports_club|company|government|other)$"
    )
    official_email: str
    description: Optional[str] = None
    registration_number: Optional[str] = None
    website: Optional[str] = None
    wilaya: Optional[str] = None
    city: Optional[str] = None
    founded_year: Optional[int] = None


class OrgUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    official_email: Optional[str] = None
    website: Optional[str] = None
    wilaya: Optional[str] = None
    city: Optional[str] = None
    founded_year: Optional[int] = None


class OrgResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    slug: str
    org_type: str
    official_email: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    status: str = "pending"
    verified: bool = False
    follower_count: int = 0
    event_count: int = 0
    total_attendees: int = 0
    wilaya: Optional[str] = None
    city: Optional[str] = None
    created_at: Optional[str] = None


class MemberAdd(BaseModel):
    user_id: str
    role: str = "member"
