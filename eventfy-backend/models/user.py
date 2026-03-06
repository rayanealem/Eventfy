"""User / Profile Pydantic models."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    shape: Optional[str] = None
    shape_color: Optional[str] = None
    wilaya: Optional[str] = None
    city: Optional[str] = None
    is_student: Optional[bool] = None
    university: Optional[str] = None
    study_year: Optional[str] = None
    volunteer_available: Optional[bool] = None
    stealth_mode: Optional[bool] = None
    visibility: Optional[str] = None
    show_in_talent_pool: Optional[bool] = None


class ProfileResponse(BaseModel):
    id: str
    player_number: int
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    shape: Optional[str] = None
    shape_color: Optional[str] = None
    bio: Optional[str] = None
    wilaya: Optional[str] = None
    city: Optional[str] = None
    is_student: bool = False
    university: Optional[str] = None
    study_year: Optional[str] = None
    role: str = "participant"
    xp: int = 0
    level: int = 1
    onboarding_done: bool = False
    volunteer_available: bool = True
    stealth_mode: bool = False
    visibility: str = "public"
    show_in_talent_pool: bool = True
    created_at: Optional[str] = None


class ParticipantRegister(BaseModel):
    email: str
    password: str = Field(min_length=6)
    username: str = Field(min_length=3, max_length=30)
    full_name: str = Field(min_length=1)


class OrgRegister(BaseModel):
    email: str
    password: str = Field(min_length=6)
    username: str = Field(min_length=3, max_length=30)
    full_name: str = Field(min_length=1)
    org_name: str
    org_type: str
    official_email: str
    description: Optional[str] = None
    wilaya: Optional[str] = None
    city: Optional[str] = None
    registration_number: Optional[str] = None
    website: Optional[str] = None


class ConnectionRequest(BaseModel):
    status: str = Field(default="pending")


class SkillCreate(BaseModel):
    skill_name: str
