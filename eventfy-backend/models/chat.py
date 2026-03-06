"""Chat Pydantic models."""

from pydantic import BaseModel
from typing import Optional


class MessageCreate(BaseModel):
    content: Optional[str] = None
    msg_type: str = "text"
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    is_broadcast: bool = False


class MessageUpdate(BaseModel):
    content: str


class ReactionCreate(BaseModel):
    emoji: str


class PollCreate(BaseModel):
    question: str
    options: list[dict]  # [{id, text}]
    ends_at: Optional[str] = None


class PollVote(BaseModel):
    option_id: str


class ChannelCreate(BaseModel):
    event_id: str
    name: str
    channel_type: str = "event"
    shape: Optional[str] = None
    is_locked: bool = False
