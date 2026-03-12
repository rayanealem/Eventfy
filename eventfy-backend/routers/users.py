"""Users router — /users/*"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from datetime import datetime
from config import supabase
from middleware.auth import get_current_user, get_optional_user
from models.user import SkillCreate, ConnectionRequest

router = APIRouter()


# ── User-to-User Following ──────────────────────────

@router.post("/follow/{target_user_id}")
async def follow_user(target_user_id: str, user=Depends(get_current_user)):
    """Follow another user (Instagram-style, one-way)."""
    if target_user_id == user["id"]:
        raise HTTPException(400, "Cannot follow yourself")
        
    existing = supabase.table("user_follows").select("follower_id").eq("follower_id", user["id"]).eq("following_id", target_user_id).execute()
    if existing.data:
        return {"following": True}

    supabase.table("user_follows").insert({
        "follower_id": user["id"],
        "following_id": target_user_id,
    }).execute()
    
    # Increment counts
    me = supabase.table("profiles").select("following_count").eq("id", user["id"]).single().execute()
    if me.data:
        supabase.table("profiles").update({
            "following_count": (me.data.get("following_count") or 0) + 1,
        }).eq("id", user["id"]).execute()
    target = supabase.table("profiles").select("follower_count").eq("id", target_user_id).single().execute()
    if target.data:
        supabase.table("profiles").update({
            "follower_count": (target.data.get("follower_count") or 0) + 1,
        }).eq("id", target_user_id).execute()
        
    # Notification
    try:
        supabase.table("notifications").insert({
            "user_id": target_user_id,
            "type": "new_follower",
            "title": "New Follower",
            "body": f"{user['full_name']} started following you",
            "data": {"follower_id": user["id"]},
        }).execute()
    except Exception:
        pass
    return {"following": True}


@router.delete("/follow/{target_user_id}")
async def unfollow_user(target_user_id: str, user=Depends(get_current_user)):
    """Unfollow a user."""
    supabase.table("user_follows").delete().eq(
        "follower_id", user["id"]
    ).eq("following_id", target_user_id).execute()
    # Decrement counts
    supabase.table("profiles").update({
        "following_count": max(0, (user.get("following_count") or 0) - 1),
    }).eq("id", user["id"]).execute()
    target = supabase.table("profiles").select("follower_count").eq("id", target_user_id).single().execute()
    if target.data:
        supabase.table("profiles").update({
            "follower_count": max(0, (target.data.get("follower_count") or 0) - 1),
        }).eq("id", target_user_id).execute()
    return {"following": False}


@router.get("/followers/{user_id}")
async def get_followers(user_id: str, page: int = 1, limit: int = 20):
    """List users who follow this user."""
    offset = (page - 1) * limit
    data = (
        supabase.table("user_follows")
        .select("follower_id, profiles!user_follows_follower_id_fkey(id, username, full_name, avatar_url, shape, shape_color)")
        .eq("following_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    followers = [r["profiles"] for r in (data.data or []) if r.get("profiles")]
    return {"followers": followers, "has_more": len(followers) == limit}


@router.get("/following/{user_id}")
async def get_following(user_id: str, page: int = 1, limit: int = 20):
    """List users and organizations this user follows."""
    offset = (page - 1) * limit
    
    # Get followed users
    user_data = (
        supabase.table("user_follows")
        .select("following_id, profiles!user_follows_following_id_fkey(id, username, full_name, avatar_url, shape, shape_color)")
        .eq("follower_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    following_users = [
        {"type": "user", **r["profiles"]} 
        for r in (user_data.data or []) if r.get("profiles")
    ]
    
    # Get followed orgs
    org_data = (
        supabase.table("org_followers")
        .select("org_id, organizations(id, name, slug, logo_url)")
        .eq("user_id", user_id)
        .range(offset, offset + limit - 1)
        .execute()
    )
    following_orgs = [
        {
            "type": "org",
            "id": r["organizations"]["id"],
            "username": r["organizations"]["slug"],
            "full_name": r["organizations"]["name"],
            "avatar_url": r["organizations"]["logo_url"]
        }
        for r in (org_data.data or []) if r.get("organizations")
    ]
    
    following = following_users + following_orgs
    return {"following": following, "has_more": len(user_data.data or []) == limit or len(org_data.data or []) == limit}


@router.get("/{username}")
async def get_user_profile(username: str, user=Depends(get_optional_user)):
    """Get public profile by username."""
    profile = (
        supabase.table("profiles")
        .select("*")
        .eq("username", username)
        .single()
        .execute()
    )
    if not profile.data:
        raise HTTPException(404, "User not found")

    # Don't expose private profiles
    if profile.data.get("visibility") == "private":
        return {"id": profile.data["id"], "username": username, "visibility": "private"}

    result = profile.data
    uid = result["id"]

    # Compute live counts from junction tables
    try:
        followers = supabase.table("user_follows").select("follower_id", count="exact").eq("following_id", uid).execute()
        result["follower_count"] = followers.count if followers.count is not None else len(followers.data or [])
    except Exception:
        pass

    try:
        following_users = supabase.table("user_follows").select("following_id").eq("follower_id", uid).execute()
        following_orgs = supabase.table("org_followers").select("org_id").eq("user_id", uid).execute()
        result["following_count"] = len(following_users.data or []) + len(following_orgs.data or [])
    except Exception:
        pass

    try:
        events = supabase.table("event_registrations").select("event_id", count="exact").eq("user_id", uid).execute()
        result["event_count"] = events.count if events.count is not None else len(events.data or [])
    except Exception:
        pass

    # Check if the current user follows this profile
    result["is_following"] = False
    if user and user["id"] != result["id"]:
        follow_check = (
            supabase.table("user_follows")
            .select("follower_id")
            .eq("follower_id", user["id"])
            .eq("following_id", result["id"])
            .execute()
        )
        result["is_following"] = bool(follow_check.data)

    return result


@router.get("/{username}/passport")
async def get_user_passport(username: str):
    """Get full passport data — events, badges, certs, skills."""
    profile = (
        supabase.table("profiles")
        .select("*")
        .eq("username", username)
        .single()
        .execute()
    )
    if not profile.data:
        raise HTTPException(404, "User not found")

    uid = profile.data["id"]

    # Badges
    badges = (
        supabase.table("user_badges")
        .select("*, badges(*)")
        .eq("user_id", uid)
        .execute()
    )

    # Events attended
    events = (
        supabase.table("event_registrations")
        .select("*, events(title, event_type, cover_url, starts_at, org_id)")
        .eq("user_id", uid)
        .execute()
    )

    # Certificates
    certs = (
        supabase.table("certificates")
        .select("*")
        .eq("user_id", uid)
        .execute()
    )

    # Skills
    skills = (
        supabase.table("user_skills")
        .select("*, skills(name, category)")
        .eq("user_id", uid)
        .execute()
    )

    # XP history (last 20)
    xp_history = (
        supabase.table("xp_transactions")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    return {
        "profile": profile.data,
        "badges": badges.data or [],
        "events_attended": events.data or [],
        "certificates": certs.data or [],
        "skills": skills.data or [],
        "xp_history": xp_history.data or [],
    }


@router.get("/me/feed")
async def get_my_feed(
    scope: str = "local",
    page: int = 0,
    page_size: int = 20,
    user=Depends(get_current_user)
):
    """Personalized event feed."""
    query = (
        supabase.table("events")
        .select("*, organizations(name, logo_url, slug, verified)")
        .in_("status", ["scheduled", "live"])
        .order("starts_at", desc=False)
        .range(page * page_size, (page + 1) * page_size - 1)
    )

    if scope == "local" and user.get("wilaya"):
        query = query.eq("wilaya", user["wilaya"])
    elif scope == "international":
        query = query.eq("is_international", True)

    events = query.execute()

    # Get user's registered event IDs
    regs = (
        supabase.table("event_registrations")
        .select("event_id")
        .eq("user_id", user["id"])
        .in_("status", ["confirmed", "pending_approval"])
        .execute()
    )
    registered_ids = [r["event_id"] for r in (regs.data or [])]

    return {
        "events": events.data or [],
        "registered_event_ids": registered_ids,
    }


@router.get("/me/events")
async def get_my_events(user=Depends(get_current_user)):
    """Get events I'm registered for."""
    regs = (
        supabase.table("event_registrations")
        .select("*, events(*, organizations(name, logo_url, slug))")
        .eq("user_id", user["id"])
        .order("registered_at", desc=True)
        .execute()
    )
    return regs.data or []


@router.get("/me/notifications")
async def get_my_notifications(
    page: int = 0,
    page_size: int = 20,
    user=Depends(get_current_user)
):
    """Get my notifications (paginated)."""
    notifs = (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1)
        .execute()
    )
    return notifs.data or []


@router.patch("/me/notifications/read")
async def mark_notifications_read(user=Depends(get_current_user)):
    """Mark all notifications as read."""
    supabase.table("notifications").update({
        "is_read": True,
    }).eq("user_id", user["id"]).eq("is_read", False).execute()
    return {"message": "All notifications marked as read"}


@router.get("/me/skills")
async def get_my_skills(user=Depends(get_current_user)):
    """Get my skills."""
    skills = (
        supabase.table("user_skills")
        .select("*, skills(name, category)")
        .eq("user_id", user["id"])
        .execute()
    )
    return skills.data or []


@router.post("/me/skills")
async def add_skill(body: SkillCreate, user=Depends(get_current_user)):
    """Add a skill to my profile."""
    # Find or create skill
    existing = (
        supabase.table("skills")
        .select("id")
        .eq("name", body.skill_name)
        .execute()
    )

    if existing.data:
        skill_id = existing.data[0]["id"]
    else:
        new_skill = (
            supabase.table("skills")
            .insert({"name": body.skill_name})
            .execute()
        )
        skill_id = new_skill.data[0]["id"]

    # Link to user
    supabase.table("user_skills").insert({
        "user_id": user["id"],
        "skill_id": skill_id,
    }).execute()

    return {"skill_id": skill_id, "skill_name": body.skill_name}


@router.delete("/me/skills/{skill_id}")
async def remove_skill(skill_id: str, user=Depends(get_current_user)):
    """Remove a skill from my profile."""
    supabase.table("user_skills").delete().eq(
        "user_id", user["id"]
    ).eq("skill_id", skill_id).execute()
    return {"message": "Skill removed"}


@router.get("/me/connections")
async def get_my_connections(user=Depends(get_current_user)):
    """Get all my connections."""
    sent = (
        supabase.table("connections")
        .select("*, profiles!connections_addressee_id_fkey(username, full_name, avatar_url, shape, shape_color)")
        .eq("requester_id", user["id"])
        .eq("status", "accepted")
        .execute()
    )
    received = (
        supabase.table("connections")
        .select("*, profiles!connections_requester_id_fkey(username, full_name, avatar_url, shape, shape_color)")
        .eq("addressee_id", user["id"])
        .eq("status", "accepted")
        .execute()
    )
    # Pending requests received
    pending = (
        supabase.table("connections")
        .select("*, profiles!connections_requester_id_fkey(username, full_name, avatar_url, shape, shape_color)")
        .eq("addressee_id", user["id"])
        .eq("status", "pending")
        .execute()
    )
    return {
        "connections": (sent.data or []) + (received.data or []),
        "pending_requests": pending.data or [],
    }


@router.post("/me/connections/{target_user_id}")
async def send_connection_request(target_user_id: str, user=Depends(get_current_user)):
    """Send a connection request."""
    if target_user_id == user["id"]:
        raise HTTPException(400, "Cannot connect with yourself")

    supabase.table("connections").insert({
        "requester_id": user["id"],
        "addressee_id": target_user_id,
        "status": "pending",
    }).execute()

    # Send notification
    supabase.table("notifications").insert({
        "user_id": target_user_id,
        "type": "connection_request",
        "title": "New Connection Request",
        "body": f"{user['full_name']} wants to connect with you",
        "data": {"requester_id": user["id"]},
    }).execute()

    return {"message": "Connection request sent"}


@router.patch("/me/connections/{target_user_id}")
async def respond_connection(
    target_user_id: str,
    body: ConnectionRequest,
    user=Depends(get_current_user)
):
    """Accept or decline a connection request."""
    supabase.table("connections").update({
        "status": body.status,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("requester_id", target_user_id).eq("addressee_id", user["id"]).execute()
    return {"status": body.status}


@router.delete("/me/connections/{target_user_id}")
async def remove_connection(target_user_id: str, user=Depends(get_current_user)):
    """Remove a connection."""
    supabase.table("connections").delete().or_(
        f"and(requester_id.eq.{user['id']},addressee_id.eq.{target_user_id}),"
        f"and(requester_id.eq.{target_user_id},addressee_id.eq.{user['id']})"
    ).execute()
    return {"message": "Connection removed"}


@router.get("/me/xp")
async def get_xp_history(
    page: int = 0,
    page_size: int = 20,
    user=Depends(get_current_user)
):
    """Get XP transaction history."""
    xp = (
        supabase.table("xp_transactions")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1)
        .execute()
    )
    return xp.data or []


@router.post("/me/avatar")
async def upload_avatar(file: UploadFile = File(...), user=Depends(get_current_user)):
    """Upload avatar to Supabase Storage."""
    content = await file.read()
    path = f"{user['id']}/avatar.webp"

    supabase.storage.from_("avatars").upload(
        path, content,
        file_options={"content-type": file.content_type or "image/webp", "upsert": "true"}
    )

    public_url = supabase.storage.from_("avatars").get_public_url(path)

    supabase.table("profiles").update({
        "avatar_url": public_url,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", user["id"]).execute()

    return {"avatar_url": public_url}
