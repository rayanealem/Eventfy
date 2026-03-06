"""Registrations router — /registrations/* (standalone endpoints)"""

from fastapi import APIRouter, Depends
from config import supabase
from middleware.auth import get_current_user

router = APIRouter()


@router.get("/me")
async def my_registrations(user=Depends(get_current_user)):
    """Get all my event registrations."""
    regs = (supabase.table("event_registrations")
        .select("*, events(title, starts_at, ends_at, cover_url, event_type, status, venue_name, organizations(name, logo_url))")
        .eq("user_id", user["id"]).order("registered_at", desc=True).execute())
    return regs.data or []


@router.get("/me/upcoming")
async def my_upcoming(user=Depends(get_current_user)):
    """Get my upcoming registered events."""
    regs = (supabase.table("event_registrations")
        .select("*, events!inner(title, starts_at, ends_at, cover_url, event_type, status, venue_name, organizations(name, logo_url))")
        .eq("user_id", user["id"]).in_("status", ["confirmed", "pending_approval"])
        .order("registered_at", desc=True).execute())
    # Filter for upcoming events client-side since Supabase filtering on joined columns is limited
    return regs.data or []
