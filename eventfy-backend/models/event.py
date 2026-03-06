"""Event Pydantic models."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str = Field(..., pattern="^(sport|science|charity|cultural)$")
    visibility: str = "open"

    # Dates
    starts_at: str
    ends_at: str
    registration_closes_at: Optional[str] = None

    # Location
    venue_name: Optional[str] = None
    address: Optional[str] = None
    wilaya: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_online: bool = False
    online_url: Optional[str] = None
    is_international: bool = False

    # Capacity
    capacity: Optional[int] = None
    waitlist_enabled: bool = False
    team_mode: bool = False
    is_paid: bool = False

    # Media
    cover_url: Optional[str] = None
    media_urls: list[str] = []
    tags: list[str] = []

    # Gamification
    xp_checkin: int = 100
    xp_completion: int = 200
    xp_winner: int = 0
    xp_volunteer_multiplier: bool = True

    # Fundraising
    fundraising_goal: Optional[int] = None

    # Org
    org_id: str


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    visibility: Optional[str] = None
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    registration_closes_at: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    wilaya: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_online: Optional[bool] = None
    online_url: Optional[str] = None
    capacity: Optional[int] = None
    waitlist_enabled: Optional[bool] = None
    cover_url: Optional[str] = None
    tags: Optional[list[str]] = None


class RegistrationCreate(BaseModel):
    ticket_tier_id: Optional[str] = None


class VolunteerApply(BaseModel):
    role_id: str


class VolunteerReview(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")


class TeamCreate(BaseModel):
    name: str
    max_members: int = 5
    is_public: bool = True
    shape: Optional[str] = None
    color: Optional[str] = None
    skills_needed: list[str] = []


class TeamMemberRole(BaseModel):
    role: Optional[str] = None  # BACKEND / FRONTEND / ML / DESIGN / PM


class BroadcastMessage(BaseModel):
    message: str


# Type-specific detail models
class SportDetails(BaseModel):
    team_a_name: Optional[str] = None
    team_b_name: Optional[str] = None
    team_a_score: Optional[int] = None
    team_b_score: Optional[int] = None
    league_name: Optional[str] = None
    live_score_enabled: bool = False


class ScienceDetails(BaseModel):
    call_for_papers: bool = False
    submission_deadline: Optional[str] = None
    abstract_word_limit: Optional[int] = None
    accept_pdf_uploads: bool = True
    topics: list[str] = []
    pub_language: str = "en"


class CharityDetails(BaseModel):
    ngo_cert_number: Optional[str] = None
    show_live_progress: bool = True
    currency: str = "DZD"


class CulturalDetails(BaseModel):
    require_age_verify: bool = False


class SpeakerCreate(BaseModel):
    name: str
    title: Optional[str] = None
    org_name: Optional[str] = None
    topic: Optional[str] = None
    photo_url: Optional[str] = None
    sort_order: int = 0


class PerformerCreate(BaseModel):
    name: str
    stage_name: Optional[str] = None
    time_slot: Optional[str] = None
    role: Optional[str] = None
    photo_url: Optional[str] = None
    sort_order: int = 0


class TicketTierCreate(BaseModel):
    name: str
    tier_shape: Optional[str] = None
    price: int = 0
    perks: Optional[str] = None
    quantity: Optional[int] = None
    sort_order: int = 0


class VolunteerRoleCreate(BaseModel):
    name: str
    slots: int = 1
    skills: list[str] = []
    perks: Optional[str] = None
    shift_start: Optional[str] = None
    shift_end: Optional[str] = None
    sort_order: int = 0
