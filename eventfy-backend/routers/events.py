"""Events router — /events/*"""

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from config import supabase
from middleware.auth import get_current_user, require_org, get_optional_user
from models.event import (
    EventCreate, EventUpdate, RegistrationCreate, VolunteerApply,
    VolunteerReview, TeamCreate, TeamMemberRole, BroadcastMessage,
    VolunteerRoleCreate, TicketTierCreate, SpeakerCreate, PerformerCreate,
    SportDetails, ScienceDetails, CharityDetails, CulturalDetails,
    CommentCreate,
)
from utils.xp_engine import award_xp
import re

router = APIRouter()


# ── Saved Events ──────────────────────────────────────

@router.get("/me/saved")
async def get_my_saved_events(page: int = 1, limit: int = 20, user=Depends(get_current_user)):
    """Get events saved/bookmarked by the current user."""
    offset = (page - 1) * limit
    saved = (
        supabase.table("saved_events")
        .select("event_id, events(*, organizations(name, logo_url, slug, verified))")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    events = [s["events"] for s in (saved.data or []) if s.get("events")]
    return {"events": events, "has_more": len(events) == limit}


def _slugify(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug


# ── List / Feed ────────────────────────────────────────

@router.get("")
async def list_events(
    event_type: str = None,
    wilaya: str = None,
    status: str = None,
    tags: str = None,
    page: int = 0,
    page_size: int = 20,
):
    """List events with optional filters."""
    query = (
        supabase.table("events")
        .select("*, organizations(name, logo_url, slug, verified)")
        .order("starts_at", desc=False)
        .range(page * page_size, (page + 1) * page_size - 1)
    )

    if event_type:
        query = query.eq("event_type", event_type)
    if wilaya:
        query = query.eq("wilaya", wilaya)
    if status:
        query = query.eq("status", status)
    else:
        query = query.in_("status", ["scheduled", "live", "completed"])

    result = query.execute()
    return {"events": result.data or []}


@router.get("/feed")
async def event_feed(
    scope: str = "local",
    event_type: str = None,
    page: int = 1,
    limit: int = 10,
    user=Depends(get_optional_user),
):
    """Smart personalized event feed."""
    query = (
        supabase.table("events")
        .select("""
            id, title, slug, description, event_type, status,
            starts_at, ends_at, venue_name, city, wilaya,
            cover_url, tags, capacity, registration_count,
            checkin_count, view_count, is_paid, is_international,
            like_count, comment_count, is_live,
            fundraising_goal, fundraising_current,
            organizations!org_id (
                id, name, slug, logo_url, verified
            )
        """)
        .in_("status", ["live", "scheduled"])
        .order("starts_at", desc=False)
        .range((page - 1) * limit, page * limit - 1)
    )

    if event_type:
        query = query.eq("event_type", event_type)

    if user and scope == "local" and user.get("wilaya"):
        query = query.eq("wilaya", user["wilaya"])
    elif scope == "national":
        query = query.eq("is_international", False)
    elif scope == "international":
        query = query.eq("is_international", True)

    events = query.execute()

    # Get which events this user is registered for, liked, and saved
    registered_ids = []
    liked_ids = []
    saved_ids = []
    if user:
        registrations = (
            supabase.table("event_registrations")
            .select("event_id")
            .eq("user_id", user["id"])
            .execute()
        )
        registered_ids = [r["event_id"] for r in (registrations.data or [])]

        likes = (
            supabase.table("event_likes")
            .select("event_id")
            .eq("user_id", user["id"])
            .execute()
        )
        liked_ids = [r["event_id"] for r in (likes.data or [])]

        saves = (
            supabase.table("saved_events")
            .select("event_id")
            .eq("user_id", user["id"])
            .execute()
        )
        saved_ids = [r["event_id"] for r in (saves.data or [])]

    return {
        "events": events.data or [],
        "registered_event_ids": registered_ids,
        "liked_event_ids": liked_ids,
        "saved_event_ids": saved_ids,
        "page": page,
        "has_more": len(events.data or []) == limit,
    }


@router.get("/trending")
async def trending_events(page: int = 0, page_size: int = 20):
    """Trending events (highest registration count in last 7 days)."""
    events = (
        supabase.table("events")
        .select("*, organizations(name, logo_url, slug, verified)")
        .in_("status", ["scheduled", "live"])
        .order("registration_count", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1)
        .execute()
    )
    return {"events": events.data or []}


# ── CRUD ───────────────────────────────────────────────

@router.get("/{event_id}")
async def get_event(event_id: str, user=Depends(get_optional_user)):
    """Get event detail with polymorphic type-specific data."""
    # Core event data with org
    event = (
        supabase.table("events")
        .select("""
            *,
            organizations!org_id (
                id, name, slug, logo_url, cover_url, verified, description,
                follower_count, event_count
            )
        """)
        .eq("id", event_id)
        .single()
        .execute()
    )
    if not event.data:
        raise HTTPException(404, "Event not found")

    result = event.data
    event_type = result["event_type"]

    # Polymorphic type data — unified key "type_details"
    if event_type == "sport":
        details = supabase.table("event_sport_details").select("*").eq("event_id", event_id).execute()
        result["type_details"] = details.data[0] if details.data else None

    elif event_type == "science":
        details = supabase.table("event_science_details").select("*").eq("event_id", event_id).execute()
        speakers = supabase.table("event_speakers").select("*").eq("event_id", event_id).order("sort_order").execute()
        result["type_details"] = details.data[0] if details.data else None
        result["speakers"] = speakers.data or []

    elif event_type == "charity":
        details = supabase.table("event_charity_details").select("*").eq("event_id", event_id).execute()
        result["type_details"] = details.data[0] if details.data else None

    elif event_type == "cultural":
        details = supabase.table("event_cultural_details").select("*").eq("event_id", event_id).execute()
        performers = supabase.table("event_performers").select("*").eq("event_id", event_id).order("sort_order").execute()
        tiers = supabase.table("event_ticket_tiers").select("*").eq("event_id", event_id).order("sort_order").execute()
        result["type_details"] = details.data[0] if details.data else None
        result["performers"] = performers.data or []
        result["ticket_tiers"] = tiers.data or []

    # Volunteer roles (all event types)
    roles = supabase.table("volunteer_roles").select("*").eq("event_id", event_id).execute()
    result["volunteer_roles"] = roles.data or []

    # Current user's registration status (only if authenticated)
    result["my_registration"] = None
    result["my_volunteer_application"] = None
    if user:
        reg = (
            supabase.table("event_registrations")
            .select("*")
            .eq("event_id", event_id)
            .eq("user_id", user["id"])
            .execute()
        )
        result["my_registration"] = reg.data[0] if reg.data else None

        # User's volunteer application (if any)
        if reg.data:
            vol_app = (
                supabase.table("volunteer_applications")
                .select("*, volunteer_roles(name)")
                .eq("event_id", event_id)
                .eq("user_id", user["id"])
                .execute()
            )
            result["my_volunteer_application"] = vol_app.data[0] if vol_app.data else None

    # Increment view count
    supabase.table("events").update({
        "view_count": result["view_count"] + 1
    }).eq("id", event_id).execute()

    return result


@router.post("")
async def create_event(body: EventCreate, user=Depends(require_org)):
    """Create a new event."""
    # Verify user belongs to the org
    membership = (
        supabase.table("org_members")
        .select("role")
        .eq("org_id", body.org_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not membership.data:
        raise HTTPException(403, "Not a member of this organization")

    event_data = {
        "org_id": body.org_id,
        "created_by": user["id"],
        "title": body.title,
        "slug": _slugify(body.title),
        "description": body.description,
        "event_type": body.event_type,
        "visibility": body.visibility,
        "starts_at": body.starts_at,
        "ends_at": body.ends_at,
        "registration_closes_at": body.registration_closes_at,
        "venue_name": body.venue_name,
        "address": body.address,
        "wilaya": body.wilaya,
        "city": body.city,
        "is_online": body.is_online,
        "online_url": body.online_url,
        "is_international": body.is_international,
        "capacity": body.capacity,
        "waitlist_enabled": body.waitlist_enabled,
        "team_mode": body.team_mode,
        "is_paid": body.is_paid,
        "cover_url": body.cover_url,
        "media_urls": body.media_urls,
        "tags": body.tags,
        "xp_checkin": body.xp_checkin,
        "xp_completion": body.xp_completion,
        "xp_winner": body.xp_winner,
        "xp_volunteer_multiplier": body.xp_volunteer_multiplier,
        "fundraising_goal": body.fundraising_goal,
        "status": "draft",
    }

    if body.latitude and body.longitude:
        event_data["location"] = f"POINT({body.longitude} {body.latitude})"

    result = supabase.table("events").insert(event_data).execute()
    event = result.data[0]

    # Create default chat channels
    for ch_name in ["general", "announcements", "team-formation"]:
        supabase.table("chat_channels").insert({
            "event_id": event["id"],
            "name": ch_name,
            "channel_type": "event",
            "is_locked": ch_name == "announcements",
        }).execute()

    # Award XP to org creator
    award_xp(user["id"], 500, "event_created", event["id"])

    return event


@router.patch("/{event_id}")
async def update_event(event_id: str, body: EventUpdate, user=Depends(require_org)):
    """Update an event."""
    event = supabase.table("events").select("created_by").eq("id", event_id).single().execute()
    if not event.data or event.data["created_by"] != user["id"]:
        raise HTTPException(403, "Not your event")

    update_data = body.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()

    result = supabase.table("events").update(update_data).eq("id", event_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/{event_id}")
async def delete_event(event_id: str, user=Depends(require_org)):
    """Cancel/delete an event."""
    event = supabase.table("events").select("created_by").eq("id", event_id).single().execute()
    if not event.data or event.data["created_by"] != user["id"]:
        raise HTTPException(403, "Not your event")

    supabase.table("events").update({
        "status": "cancelled",
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", event_id).execute()
    return {"message": "Event cancelled"}


@router.post("/{event_id}/publish")
async def publish_event(event_id: str, user=Depends(require_org)):
    """Publish event (draft → scheduled/live)."""
    event = supabase.table("events").select("*").eq("id", event_id).single().execute()
    if not event.data or event.data["created_by"] != user["id"]:
        raise HTTPException(403, "Not your event")

    now = datetime.utcnow().isoformat()
    new_status = "live" if event.data["starts_at"] <= now else "scheduled"

    supabase.table("events").update({
        "status": new_status,
        "published_at": now,
        "updated_at": now,
    }).eq("id", event_id).execute()
    return {"status": new_status}


# ── Registrations ──────────────────────────────────────

@router.post("/{event_id}/register")
async def register_for_event(
    event_id: str,
    body: RegistrationCreate = None,
    user=Depends(get_current_user),
):
    """Register for an event."""
    event = supabase.table("events").select("*").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(404, "Event not found")

    # Check capacity
    if event.data["capacity"] and event.data["registration_count"] >= event.data["capacity"]:
        if event.data["waitlist_enabled"]:
            status = "waitlisted"
        else:
            raise HTTPException(400, "Event is full")
    else:
        status = "confirmed"

    reg_data = {
        "event_id": event_id,
        "user_id": user["id"],
        "status": status,
    }
    if body and body.ticket_tier_id:
        reg_data["ticket_tier_id"] = body.ticket_tier_id

    result = supabase.table("event_registrations").insert(reg_data).execute()

    # Increment counter
    supabase.table("events").update({
        "registration_count": event.data["registration_count"] + 1,
    }).eq("id", event_id).execute()

    # Check first event registration badge
    all_regs = (
        supabase.table("event_registrations")
        .select("id", count="exact")
        .eq("user_id", user["id"])
        .execute()
    )
    if all_regs.count == 1:
        award_xp(user["id"], 50, "first_registration", event_id)

    # Notification
    supabase.table("notifications").insert({
        "user_id": user["id"],
        "type": "registration_confirmed",
        "title": "Registration Confirmed!",
        "body": f"You're registered for {event.data['title']}",
        "data": {"event_id": event_id},
    }).execute()

    return result.data[0] if result.data else {"status": status}


@router.delete("/{event_id}/register")
async def unregister_from_event(event_id: str, user=Depends(get_current_user)):
    """Unregister from an event."""
    supabase.table("event_registrations").delete().eq(
        "event_id", event_id
    ).eq("user_id", user["id"]).execute()

    # Decrement counter
    event = supabase.table("events").select("registration_count").eq("id", event_id).single().execute()
    if event.data:
        supabase.table("events").update({
            "registration_count": max(0, event.data["registration_count"] - 1),
        }).eq("id", event_id).execute()

    return {"message": "Unregistered"}


# ── Save / Bookmark ────────────────────────────────────

@router.post("/{event_id}/save")
async def save_event(event_id: str, user=Depends(get_current_user)):
    """Save/bookmark an event."""
    supabase.table("saved_events").upsert({
        "user_id": user["id"],
        "event_id": event_id,
    }).execute()
    return {"saved": True}


@router.delete("/{event_id}/save")
async def unsave_event(event_id: str, user=Depends(get_current_user)):
    """Unsave/unbookmark an event."""
    supabase.table("saved_events").delete().eq(
        "user_id", user["id"]
    ).eq("event_id", event_id).execute()
    return {"saved": False}


# ── Like / Comment ────────────────────────────────────

@router.post("/{event_id}/like")
async def like_event(event_id: str, user=Depends(get_current_user)):
    """Like an event."""
    event = supabase.table("events").select("id, like_count").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(404, "Event not found")

    # Upsert into event_likes (idempotent)
    supabase.table("event_likes").upsert({
        "event_id": event_id,
        "user_id": user["id"],
    }).execute()

    # Increment like_count on the event
    supabase.table("events").update({
        "like_count": (event.data.get("like_count") or 0) + 1,
    }).eq("id", event_id).execute()

    return {"liked": True}


@router.delete("/{event_id}/like")
async def unlike_event(event_id: str, user=Depends(get_current_user)):
    """Remove like from an event."""
    event = supabase.table("events").select("id, like_count").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(404, "Event not found")

    # Delete the like row
    supabase.table("event_likes").delete().eq(
        "event_id", event_id
    ).eq("user_id", user["id"]).execute()

    # Decrement like_count, clamped to 0
    supabase.table("events").update({
        "like_count": max(0, (event.data.get("like_count") or 0) - 1),
    }).eq("id", event_id).execute()

    return {"liked": False}


@router.post("/{event_id}/comment")
async def comment_on_event(event_id: str, body: CommentCreate, user=Depends(get_current_user)):
    """Add a comment on an event."""
    event = supabase.table("events").select("id, comment_count").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(404, "Event not found")

    # Insert the comment
    comment = supabase.table("event_comments").insert({
        "event_id": event_id,
        "user_id": user["id"],
        "content": body.content,
    }).execute()

    # Increment comment_count on the event
    supabase.table("events").update({
        "comment_count": (event.data.get("comment_count") or 0) + 1,
    }).eq("id", event_id).execute()

    return comment.data[0] if comment.data else {"commented": True}


@router.get("/{event_id}/comments")
async def get_event_comments(
    event_id: str,
    page: int = 1,
    limit: int = 20,
):
    """Get comments for an event, with author profiles."""
    comments = (
        supabase.table("event_comments")
        .select("*, profiles!user_id(username, full_name, avatar_url, shape, shape_color, player_number)")
        .eq("event_id", event_id)
        .order("created_at", desc=False)
        .range((page - 1) * limit, page * limit - 1)
        .execute()
    )

    return {
        "comments": comments.data or [],
        "has_more": len(comments.data or []) == limit,
    }


@router.get("/{event_id}/registrations")
async def get_registrations(event_id: str, user=Depends(require_org)):
    """Get event registrations (org only)."""
    regs = (
        supabase.table("event_registrations")
        .select("*, profiles(username, full_name, avatar_url, shape, shape_color, player_number)")
        .eq("event_id", event_id)
        .order("registered_at", desc=True)
        .execute()
    )
    return regs.data or []


# ── Volunteer Management ───────────────────────────────

@router.get("/{event_id}/volunteers")
async def get_volunteer_roles(event_id: str):
    """Get volunteer roles and slots for an event."""
    roles = (
        supabase.table("volunteer_roles")
        .select("*")
        .eq("event_id", event_id)
        .order("sort_order")
        .execute()
    )
    return roles.data or []


@router.post("/{event_id}/volunteers/apply")
async def apply_for_volunteer(
    event_id: str,
    body: VolunteerApply,
    user=Depends(get_current_user),
):
    """Apply for a volunteer role."""
    result = supabase.table("volunteer_applications").insert({
        "role_id": body.role_id,
        "event_id": event_id,
        "user_id": user["id"],
        "status": "pending",
    }).execute()
    return result.data[0] if result.data else {"status": "pending"}


@router.patch("/{event_id}/volunteers/{app_id}")
async def review_volunteer(
    event_id: str,
    app_id: str,
    body: VolunteerReview,
    user=Depends(require_org),
):
    """Approve or reject a volunteer application."""
    supabase.table("volunteer_applications").update({
        "status": body.status,
        "reviewed_at": datetime.utcnow().isoformat(),
        "reviewed_by": user["id"],
    }).eq("id", app_id).execute()

    # Get applicant info
    app = supabase.table("volunteer_applications").select("user_id").eq("id", app_id).single().execute()
    if app.data:
        notif_type = "volunteer_approved" if body.status == "approved" else "volunteer_rejected"
        supabase.table("notifications").insert({
            "user_id": app.data["user_id"],
            "type": notif_type,
            "title": f"Volunteer Application {body.status.title()}",
            "body": f"Your volunteer application has been {body.status}",
            "data": {"event_id": event_id},
        }).execute()

    return {"status": body.status}


# ── Teams ──────────────────────────────────────────────

@router.get("/{event_id}/teams")
async def get_teams(event_id: str):
    """Get teams for this event."""
    teams = (
        supabase.table("teams")
        .select("*, team_members(*, profiles(username, full_name, avatar_url, shape, shape_color))")
        .eq("event_id", event_id)
        .execute()
    )
    return teams.data or []


@router.post("/{event_id}/teams")
async def create_team(event_id: str, body: TeamCreate, user=Depends(get_current_user)):
    """Create a team for this event."""
    import secrets
    code = f"T-{secrets.randbelow(90000) + 10000}"

    team = supabase.table("teams").insert({
        "event_id": event_id,
        "name": body.name,
        "code": code,
        "leader_id": user["id"],
        "shape": body.shape,
        "color": body.color,
        "max_members": body.max_members,
        "is_public": body.is_public,
        "skills_needed": body.skills_needed,
    }).execute()

    # Add leader as member
    supabase.table("team_members").insert({
        "team_id": team.data[0]["id"],
        "user_id": user["id"],
        "role": "PM",
    }).execute()

    return team.data[0]


@router.post("/{event_id}/teams/{team_id}/join")
async def join_team(event_id: str, team_id: str, body: TeamMemberRole = None, user=Depends(get_current_user)):
    """Join a team."""
    team = supabase.table("teams").select("max_members").eq("id", team_id).single().execute()
    members = supabase.table("team_members").select("user_id", count="exact").eq("team_id", team_id).execute()

    if members.count >= team.data["max_members"]:
        raise HTTPException(400, "Team is full")

    supabase.table("team_members").insert({
        "team_id": team_id,
        "user_id": user["id"],
        "role": body.role if body else None,
    }).execute()
    return {"message": "Joined team"}


@router.delete("/{event_id}/teams/{team_id}/leave")
async def leave_team(event_id: str, team_id: str, user=Depends(get_current_user)):
    """Leave a team."""
    supabase.table("team_members").delete().eq(
        "team_id", team_id
    ).eq("user_id", user["id"]).execute()
    return {"message": "Left team"}


@router.patch("/{event_id}/teams/{team_id}/ready")
async def mark_team_ready(event_id: str, team_id: str, user=Depends(get_current_user)):
    """Mark team as ready (leader only)."""
    team = supabase.table("teams").select("leader_id").eq("id", team_id).single().execute()
    if not team.data or team.data["leader_id"] != user["id"]:
        raise HTTPException(403, "Only the team leader can mark as ready")

    supabase.table("teams").update({"is_ready": True}).eq("id", team_id).execute()
    return {"is_ready": True}


# ── Stats / Command Center ─────────────────────────────

@router.get("/{event_id}/stats")
async def get_event_stats(event_id: str, user=Depends(require_org)):
    """Get event statistics for command center."""
    event = supabase.table("events").select("*").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(404, "Event not found")

    return {
        "registration_count": event.data["registration_count"],
        "checkin_count": event.data["checkin_count"],
        "view_count": event.data["view_count"],
        "capacity": event.data["capacity"],
        "status": event.data["status"],
    }


@router.get("/{event_id}/checkins")
async def get_checkins(event_id: str, user=Depends(require_org)):
    """Get live check-in list."""
    checkins = (
        supabase.table("event_registrations")
        .select("*, profiles(username, full_name, avatar_url, player_number)")
        .eq("event_id", event_id)
        .eq("checked_in", True)
        .order("checked_in_at", desc=True)
        .execute()
    )
    return checkins.data or []


@router.post("/{event_id}/broadcast")
async def broadcast_message(event_id: str, body: BroadcastMessage, user=Depends(require_org)):
    """Send flash alert to all registrants."""
    regs = (
        supabase.table("event_registrations")
        .select("user_id")
        .eq("event_id", event_id)
        .in_("status", ["confirmed", "pending_approval"])
        .execute()
    )

    notifications = []
    for reg in (regs.data or []):
        notifications.append({
            "user_id": reg["user_id"],
            "type": "flash_alert",
            "title": "📢 Flash Alert",
            "body": body.message,
            "data": {"event_id": event_id},
        })

    if notifications:
        supabase.table("notifications").insert(notifications).execute()

    return {"message": "Broadcast sent", "recipients": len(notifications)}
