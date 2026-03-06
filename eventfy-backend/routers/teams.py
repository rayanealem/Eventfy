"""Teams router — /teams/* (standalone endpoints)"""

from fastapi import APIRouter, Depends, Query
from config import supabase
from middleware.auth import get_current_user

router = APIRouter()


@router.get("/me")
async def my_teams(user=Depends(get_current_user)):
    """Get teams I'm a member of."""
    teams = (supabase.table("team_members")
        .select("*, teams(*, events(title, starts_at))")
        .eq("user_id", user["id"]).execute())
    return teams.data or []


@router.get("/search")
async def search_teams(code: str = Query(...)):
    """Find a team by invite code."""
    team = (supabase.table("teams")
        .select("*, events(title), team_members(*, profiles(username, full_name, avatar_url))")
        .eq("code", code).execute())
    return team.data[0] if team.data else None
