"""Gamification Pydantic models."""

from pydantic import BaseModel
from typing import Optional


class XPAward(BaseModel):
    user_id: str
    amount: int
    reason: str
    event_id: Optional[str] = None


class BadgeResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    shape: Optional[str] = None
    color: Optional[str] = None
    xp_value: int = 0
    is_custom: bool = False
    event_id: Optional[str] = None


class ScoreboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    shape: Optional[str] = None
    shape_color: Optional[str] = None
    xp: int
    level: int
