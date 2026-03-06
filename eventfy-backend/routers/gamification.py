"""Gamification router — /gamification/*"""

from fastapi import APIRouter, Depends, HTTPException
from config import supabase
from middleware.auth import get_current_user, require_org
from models.gamification import XPAward
from utils.xp_engine import award_xp, get_level, get_level_progress

router = APIRouter()


@router.get("/scoreboard")
async def get_scoreboard(page: int = 0, page_size: int = 50):
    """Global leaderboard (paginated)."""
    profiles = (supabase.table("profiles")
        .select("id, username, full_name, avatar_url, shape, shape_color, xp, level")
        .order("xp", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1).execute())

    entries = []
    for i, p in enumerate(profiles.data or []):
        entries.append({**p, "rank": page * page_size + i + 1})
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
