"""Gamification router — /gamification/*"""

from fastapi import APIRouter, Depends, HTTPException
from config import supabase
from middleware.auth import get_current_user, require_org
from models.gamification import XPAward
from utils.xp_engine import award_xp, get_level, get_level_progress

router = APIRouter()


@router.get("/scoreboard")
async def get_scoreboard(
    page: int = 0,
    page_size: int = 50,
    event_type: str = None,
    wilaya: str = None,
):
    """Global leaderboard (paginated), with optional filters."""
    query = supabase.table("profiles").select("id, username, full_name, player_number, avatar_url, shape, shape_color, xp, level")

    if wilaya:
        query = query.eq("wilaya", wilaya)

    # Order by XP descending
    query = query.order("xp", desc=True)

    profiles = query.execute()
    data = profiles.data or []

    # If event_type is provided, filter using python since we'd need to join event_registrations + events to see who attended
    # Alternatively, since shapes are determined by most attended event type, we can filter by the user's primary shape
    # Sport=○, Science=△, Charity=□, Cultural=◇
    if event_type:
        shape_map = {"sport": "○", "science": "△", "charity": "□", "cultural": "◇"}
        target_shape = shape_map.get(event_type.lower())
        if target_shape:
            data = [p for p in data if p.get("shape") == target_shape]

    # Paginate after filtering
    start_idx = page * page_size
    end_idx = start_idx + page_size
    paginated_data = data[start_idx:end_idx]

    entries = []
    for i, p in enumerate(paginated_data):
        entries.append({**p, "rank": start_idx + i + 1})

    return {"scoreboard": entries}


@router.get("/badges")
async def list_badges():
    """All platform badges."""
    badges = supabase.table("badges").select("*").is_("event_id", "null").order("created_at").execute()
    return badges.data or []


@router.get("/badges/{user_id}")
async def get_user_badges(user_id: str):
    """Get a user's earned badges."""
    badges = (supabase.table("user_badges")
        .select("*, badges(*)").eq("user_id", user_id)
        .order("earned_at", desc=True).execute())
    return badges.data or []


@router.post("/xp")
async def award_xp_endpoint(body: XPAward, user=Depends(require_org)):
    """Award XP to a user (org/internal)."""
    result = award_xp(body.user_id, body.amount, body.reason, body.event_id)
    return result


@router.get("/level/{xp}")
async def get_level_for_xp(xp: int):
    """Get level info for an XP amount."""
    return get_level_progress(xp)
