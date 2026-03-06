"""Stories router — /stories/*"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from config import supabase
from middleware.auth import get_current_user, require_org

router = APIRouter()


@router.get("/feed")
async def stories_feed(user=Depends(get_current_user)):
    """Stories from followed orgs."""
    follows = supabase.table("org_followers").select("org_id").eq("user_id", user["id"]).execute()
    org_ids = [f["org_id"] for f in (follows.data or [])]
    if not org_ids:
        return []

    stories = (supabase.table("stories")
        .select("*, organizations(name, logo_url, slug), story_frames(*)")
        .in_("org_id", org_ids)
        .gt("expires_at", datetime.utcnow().isoformat())
        .order("created_at", desc=True).execute())
    return stories.data or []


@router.get("/{story_id}")
async def get_story(story_id: str):
    """Get story with frames."""
    story = (supabase.table("stories")
        .select("*, story_frames(*), organizations(name, logo_url, slug)")
        .eq("id", story_id).single().execute())
    if not story.data:
        raise HTTPException(404, "Story not found")
    return story.data


@router.post("")
async def create_story(body: dict, user=Depends(require_org)):
    """Create a story."""
    story = supabase.table("stories").insert({
        "org_id": body.get("org_id"), "event_id": body.get("event_id"),
        "audience": body.get("audience", "followers"),
        "pinned_to_event": body.get("pinned_to_event", False),
    }).execute()
    return story.data[0] if story.data else {}


@router.post("/{story_id}/frames")
async def add_frame(story_id: str, body: dict, user=Depends(require_org)):
    """Add a frame to a story."""
    frame = supabase.table("story_frames").insert({
        "story_id": story_id, "media_url": body["media_url"],
        "media_type": body.get("media_type", "image"),
        "duration_ms": body.get("duration_ms", 5000),
        "overlays": body.get("overlays", []),
        "sort_order": body.get("sort_order", 0),
    }).execute()
    return frame.data[0] if frame.data else {}


@router.delete("/{story_id}")
async def delete_story(story_id: str, user=Depends(require_org)):
    """Delete a story."""
    supabase.table("stories").delete().eq("id", story_id).execute()
    return {"message": "Story deleted"}


@router.post("/{story_id}/view")
async def record_view(story_id: str, user=Depends(get_current_user)):
    """Record a story view."""
    supabase.table("story_views").upsert({
        "story_id": story_id, "user_id": user["id"],
    }).execute()

    story = supabase.table("stories").select("view_count").eq("id", story_id).single().execute()
    if story.data:
        supabase.table("stories").update({
            "view_count": story.data["view_count"] + 1,
        }).eq("id", story_id).execute()

    return {"viewed": True}


@router.get("/{story_id}/analytics")
async def story_analytics(story_id: str, user=Depends(require_org)):
    """Get story view analytics."""
    views = (supabase.table("story_views")
        .select("*, profiles(username, full_name, avatar_url)")
        .eq("story_id", story_id).execute())
    story = supabase.table("stories").select("view_count").eq("id", story_id).single().execute()
    return {"views": views.data or [], "total_views": story.data["view_count"] if story.data else 0}
