"""Search router — /search/*"""

from fastapi import APIRouter, Depends, Query
from config import supabase
from middleware.auth import get_optional_user

router = APIRouter()


@router.get("")
async def search(
    q: str = Query(..., min_length=1),
    type: str = None,
    event_type: str = None,
    wilaya: str = None,
    tags: str = None,
    free: bool = None,
    page: int = 0,
    page_size: int = 20,
    user=Depends(get_optional_user),
):
    """Full-text search across events, orgs, and users."""
    results = {"events": [], "orgs": [], "users": []}

    if not type or type == "events":
        query = (supabase.table("events")
            .select("*, organizations(name, logo_url, slug)")
            .ilike("title", f"%{q}%")
            .in_("status", ["scheduled", "live", "completed"])
            .range(page * page_size, (page + 1) * page_size - 1))
        if event_type:
            query = query.eq("event_type", event_type)
        if wilaya:
            query = query.eq("wilaya", wilaya)
        if free is True:
            query = query.eq("is_paid", False)
        events = query.execute()
        results["events"] = events.data or []

    if not type or type == "orgs":
        orgs = (supabase.table("organizations")
            .select("*").ilike("name", f"%{q}%")
            .eq("status", "approved")
            .range(page * page_size, (page + 1) * page_size - 1).execute())
        results["orgs"] = orgs.data or []

    if not type or type == "users":
        users = (supabase.table("profiles")
            .select("id, username, full_name, avatar_url, shape, shape_color, xp, level")
            .or_(f"username.ilike.%{q}%,full_name.ilike.%{q}%")
            .range(page * page_size, (page + 1) * page_size - 1).execute())
        results["users"] = users.data or []

    return results


@router.get("/skills")
async def search_skills(q: str = Query(..., min_length=1)):
    """Autocomplete skills."""
    skills = (supabase.table("skills").select("*").ilike("name", f"%{q}%").limit(10).execute())
    return skills.data or []


@router.get("/events/nearby")
async def nearby_events(
    lat: float = Query(...), lng: float = Query(...),
    radius: int = Query(default=50),
    page: int = 0, page_size: int = 20,
):
    """PostGIS geo query for nearby events."""
    # Using raw RPC for PostGIS query
    try:
        result = supabase.rpc("events_nearby", {
            "lat": lat, "lng": lng, "radius_km": radius,
            "lim": page_size, "off": page * page_size,
        }).execute()
        return result.data or []
    except Exception:
        # Fallback: return events filtered by wilaya
        events = (supabase.table("events")
            .select("*, organizations(name, logo_url, slug)")
            .in_("status", ["scheduled", "live"])
            .range(page * page_size, (page + 1) * page_size - 1).execute())
        return events.data or []
