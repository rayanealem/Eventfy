"""Volunteers router — /volunteers/* (standalone endpoints)"""

from fastapi import APIRouter, Depends
from config import supabase
from middleware.auth import get_current_user

router = APIRouter()


@router.get("/me")
async def my_volunteer_apps(user=Depends(get_current_user)):
    """Get my volunteer applications across all events."""
    apps = (supabase.table("volunteer_applications")
        .select("*, volunteer_roles(name, skills, perks), events(title, starts_at, cover_url)")
        .eq("user_id", user["id"]).order("applied_at", desc=True).execute())
    return apps.data or []


@router.get("/available")
async def available_roles(wilaya: str = None, page: int = 0, page_size: int = 20):
    """Get open volunteer roles across all events."""
    query = (supabase.table("volunteer_roles")
        .select("*, events(title, starts_at, wilaya, cover_url, org_id, organizations(name, logo_url))")
        .order("shift_start").range(page * page_size, (page + 1) * page_size - 1))
    result = query.execute()
    # Filter where filled < slots
    open_roles = [r for r in (result.data or []) if r["filled"] < r["slots"]]
    return open_roles
