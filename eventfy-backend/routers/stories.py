"""Stories router — /stories/*"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from config import supabase
from middleware.auth import get_current_user

router = APIRouter()


# ── STATIC ROUTES FIRST (before /{story_id} catch-all) ─────────────────

@router.get("/me")
async def my_stories(user=Depends(get_current_user)):
    """Fetch current user's active stories (personal + org)."""
    now = datetime.utcnow().isoformat()

    # Personal stories
    personal = (supabase.table("stories")
        .select("*, story_frames(*)")
        .eq("user_id", user["id"])
        .gt("expires_at", now)
        .order("created_at", desc=True).execute())

    # Org stories (if user manages orgs)
    members = supabase.table("org_members").select("org_id").eq("user_id", user["id"]).execute()
    org_ids = [m["org_id"] for m in (members.data or [])]
    org_stories = []
    if org_ids:
        org_data = (supabase.table("stories")
            .select("*, story_frames(*), organizations(name, logo_url, slug)")
            .in_("org_id", org_ids)
            .gt("expires_at", now)
            .order("created_at", desc=True).execute())
        org_stories = org_data.data or []

    return {
        "personal": personal.data or [],
        "org": org_stories,
        "total": len(personal.data or []) + len(org_stories)
    }


@router.get("/feed")
async def stories_feed(user=Depends(get_current_user)):
    """Stories from followed orgs — flat list."""
    follows = supabase.table("org_followers").select("org_id").eq("user_id", user["id"]).execute()
    org_ids = [f["org_id"] for f in (follows.data or [])]
    if not org_ids:
        return []

    stories = (supabase.table("stories")
        .select("*, organizations(id, name, logo_url, slug), story_frames(*)")
        .in_("org_id", org_ids)
        .gt("expires_at", datetime.utcnow().isoformat())
        .order("created_at", desc=True).execute())
    return stories.data or []


@router.get("/feed/tray")
async def stories_feed_tray(user=Depends(get_current_user)):
    """
    Instagram-style story tray: returns stories grouped by user/org.
    Each group = { owner_id, owner_type, owner_name, owner_avatar, stories: [...] }
    Includes the current user's own stories as the first group.
    """
    now = datetime.utcnow().isoformat()
    groups = []

    # 1. Own stories (personal)
    own = (supabase.table("stories")
        .select("*, story_frames(*)")
        .eq("user_id", user["id"])
        .gt("expires_at", now)
        .order("created_at", desc=False).execute())

    profile = supabase.table("profiles").select("username, full_name, avatar_url").eq("id", user["id"]).single().execute()
    p = profile.data or {}

    groups.append({
        "owner_id": user["id"],
        "owner_type": "self",
        "owner_name": p.get("full_name") or p.get("username") or "You",
        "owner_avatar": p.get("avatar_url"),
        "stories": own.data or [],
        "has_stories": len(own.data or []) > 0,
    })

    # 2. Own org stories
    members = supabase.table("org_members").select("org_id").eq("user_id", user["id"]).execute()
    own_org_ids = [m["org_id"] for m in (members.data or [])]

    # 3. Followed org stories
    follows = supabase.table("org_followers").select("org_id").eq("user_id", user["id"]).execute()
    follow_org_ids = [f["org_id"] for f in (follows.data or [])]

    all_org_ids = list(set(own_org_ids + follow_org_ids))
    if all_org_ids:
        org_stories = (supabase.table("stories")
            .select("*, story_frames(*), organizations(id, name, logo_url, slug)")
            .in_("org_id", all_org_ids)
            .gt("expires_at", now)
            .order("created_at", desc=False).execute())

        # Group by org_id
        org_map = {}
        for s in (org_stories.data or []):
            oid = s.get("org_id")
            if oid not in org_map:
                org = s.get("organizations") or {}
                org_map[oid] = {
                    "owner_id": oid,
                    "owner_type": "org",
                    "owner_name": org.get("name", "Org"),
                    "owner_avatar": org.get("logo_url"),
                    "stories": [],
                    "has_stories": True,
                }
            org_map[oid]["stories"].append(s)

        # Own orgs first, then followed orgs
        for oid in own_org_ids:
            if oid in org_map:
                groups.append(org_map.pop(oid))
        for oid in follow_org_ids:
            if oid in org_map:
                groups.append(org_map.pop(oid))

    # 4. Followed user stories (users the current user follows)
    user_follows = supabase.table("connections").select("addressee_id").eq("requester_id", user["id"]).eq("status", "accepted").execute()
    followed_user_ids = [f["addressee_id"] for f in (user_follows.data or [])]

    if followed_user_ids:
        user_stories = (supabase.table("stories")
            .select("*, story_frames(*), profiles!stories_user_id_fkey(id, username, full_name, avatar_url)")
            .in_("user_id", followed_user_ids)
            .is_("org_id", "null")
            .gt("expires_at", now)
            .order("created_at", desc=False).execute())

        user_map = {}
        for s in (user_stories.data or []):
            uid = s.get("user_id")
            if uid not in user_map:
                pr = s.get("profiles") or {}
                user_map[uid] = {
                    "owner_id": uid,
                    "owner_type": "user",
                    "owner_name": pr.get("full_name") or pr.get("username") or "User",
                    "owner_avatar": pr.get("avatar_url"),
                    "stories": [],
                    "has_stories": True,
                }
            user_map[uid]["stories"].append(s)

        for uid in followed_user_ids:
            if uid in user_map:
                groups.append(user_map.pop(uid))

    return groups


# ── DYNAMIC ROUTES ──────────────────────────────────────────────────────

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
async def create_story(body: dict, user=Depends(get_current_user)):
    """Create a story (org or personal user story)."""
    org_id = body.get("org_id")

    # If org_id provided, verify membership
    if org_id:
        member = supabase.table("org_members").select("*").eq("org_id", org_id).eq("user_id", user["id"]).execute()
        if not member.data:
            org_id = None  # Not authorized for this org

    story = supabase.table("stories").insert({
        "org_id": org_id if org_id else None,
        "user_id": user["id"] if not org_id else None,
        "event_id": body.get("event_id"),
        "audience": body.get("audience", "followers"),
        "pinned_to_event": body.get("pinned_to_event", False),
    }).execute()
    return story.data[0] if story.data else {}


@router.post("/{story_id}/frames")
async def add_frame(story_id: str, body: dict, user=Depends(get_current_user)):
    """Add a frame to a story."""
    frame = supabase.table("story_frames").insert({
        "story_id": story_id, "media_url": body["media_url"],
        "media_type": body.get("media_type", "image"),
        "duration_ms": body.get("duration_ms", 5000),
        "overlays": body.get("overlays", []),
        "filter_css": body.get("filter_css", "none"),
        "sort_order": body.get("sort_order", 0),
    }).execute()
    return frame.data[0] if frame.data else {}


@router.delete("/{story_id}")
async def delete_story(story_id: str, user=Depends(get_current_user)):
    """Delete a story (owner or org admin)."""
    story = supabase.table("stories").select("*").eq("id", story_id).single().execute()
    if not story.data:
        raise HTTPException(404, "Story not found")

    is_owner = story.data.get("user_id") == user["id"]
    is_org_admin = False
    if story.data.get("org_id"):
        member = supabase.table("org_members").select("role").eq("org_id", story.data["org_id"]).eq("user_id", user["id"]).execute()
        is_org_admin = bool(member.data)

    if not is_owner and not is_org_admin:
        raise HTTPException(403, "Not authorized to delete this story")

    supabase.table("stories").delete().eq("id", story_id).execute()
    return {"message": "Story deleted"}


@router.post("/{story_id}/frames/{frame_id}/vote")
async def vote_poll(story_id: str, frame_id: str, body: dict, user=Depends(get_current_user)):
    """Vote on a poll in a story frame."""
    vote = supabase.table("story_poll_votes").insert({
        "story_id": story_id,
        "frame_id": frame_id,
        "user_id": user["id"],
        "option": body.get("option", "A"),
    }).execute()
    return vote.data[0] if vote.data else {}


@router.post("/{story_id}/react")
async def react_story(story_id: str, body: dict, user=Depends(get_current_user)):
    """React to a story."""
    reaction = supabase.table("story_reactions").insert({
        "story_id": story_id,
        "user_id": user["id"],
        "emoji": body.get("emoji", "❤️"),
    }).execute()
    return reaction.data[0] if reaction.data else {}


@router.post("/{story_id}/view")
async def record_view(story_id: str, user=Depends(get_current_user)):
    """Record a story view."""
    supabase.table("story_views").upsert({
        "story_id": story_id, "user_id": user["id"],
    }).execute()

    story = supabase.table("stories").select("view_count").eq("id", story_id).single().execute()
    if story.data:
        supabase.table("stories").update({
            "view_count": (story.data.get("view_count") or 0) + 1,
        }).eq("id", story_id).execute()

    return {"viewed": True}


@router.get("/{story_id}/analytics")
async def story_analytics(story_id: str, user=Depends(get_current_user)):
    """Get story view analytics (available to the story owner)."""
    views = (supabase.table("story_views")
        .select("*, profiles(username, full_name, avatar_url)")
        .eq("story_id", story_id).execute())
    reactions = (supabase.table("story_reactions")
        .select("*, profiles(username, avatar_url)")
        .eq("story_id", story_id).execute())
    story = supabase.table("stories").select("view_count").eq("id", story_id).single().execute()
    return {
        "views": views.data or [],
        "reactions": reactions.data or [],
        "total_views": story.data["view_count"] if story.data else 0,
        "total_reactions": len(reactions.data) if reactions.data else 0,
    }
