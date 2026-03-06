"""Common Pydantic models shared across domains."""

from pydantic import BaseModel
from typing import Optional, Any


class PaginatedResponse(BaseModel):
    data: list[Any]
    total: int
    page: int
    page_size: int
    has_more: bool


class ErrorResponse(BaseModel):
    detail: str


class SuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
