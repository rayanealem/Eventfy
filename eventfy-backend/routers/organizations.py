"""Organizations router — /orgs/*"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from datetime import datetime
from config import supabase
from middleware.auth import get_current_user, require_org, get_optional_user
from models.organization import OrgCreate, OrgUpdate, MemberAdd
import re

router = APIRouter()


def _slugify(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug


@router.get("")
async def list_orgs(
    org_type: str = None,
    wilaya: str = None,
    page: int = 0,
    page_size: int = 20,
):
    """List approved organizations."""
    query = (
        supabase.table("organizations")
        .select("*")
        .eq("status", "approved")
        .order("follower_count", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1)
    )
    if org_type:
        query = query.eq("org_type", org_type)
    if wilaya:
        query = query.eq("wilaya", wilaya)

    result = query.execute()
    return {"organizations": result.data or []}


# ── Org Dashboard ──────────────────────────────────────

@router.get("/me/dashboard")
async def org_dashboard(user=Depends(require_org)):
    """Get org dashboard data for the authenticated organizer."""
    # Find the org this user owns or manages
    membership = (
        supabase.table("org_members")
        .select("org_id, role, organizations(*)")
        .eq("user_id", user["id"])
        .execute()
    )
    if not membership.data:
        raise HTTPException(404, "No organization found for this user")

    # Use the first org membership found
    org_data = membership.data[0].get("organizations")
    if not org_data:
        raise HTTPException(404, "Organization not found")

    org_id = org_data["id"]

    # Fetch all events for this org
    events = (
        supabase.table("events")
        .select("id, title, cover_url, starts_at, status, registration_count, capacity, is_live")
        .eq("org_id", org_id)
        .order("starts_at", desc=True)
        .execute()
    )
    event_list = events.data or []
    event_ids = [e["id"] for e in event_list]

    # Count pending volunteer applications for these events
    pending_volunteers = []
    if event_ids:
        vol_apps = (
            supabase.table("volunteer_applications")
            .select("*, volunteer_roles(name)")
            .in_("event_id", event_ids)
            .eq("status", "pending")
            .execute()
        )
        pending_volunteers = vol_apps.data or []

    # Calculate stats
    total_registrations = sum(e.get("registration_count", 0) for e in event_list)

    return {
        "org": org_data,
        "events": event_list,
        "stats": {
            "total_events": len(event_list),
            "total_registrations": total_registrations,
            "follower_count": org_data.get("follower_count", 0),
            "pending_volunteers": len(pending_volunteers),
        },
        "pending_volunteers": pending_volunteers,
    }


@router.get("/{slug}")
async def get_org_profile(slug: str, user=Depends(get_optional_user)):
    """Get org profile by slug."""
    org = (
        supabase.table("organizations")
        .select("*")
        .eq("slug", slug)
        .single()
        .execute()
    )
    if not org.data:
        raise HTTPException(404, "Organization not found")

    result = org.data

    # Check if the current user follows this org
    result["is_following"] = False
    if user:
        follow_check = (
            supabase.table("org_followers")
            .select("id")
            .eq("org_id", result["id"])
            .eq("user_id", user["id"])
            .execute()
        )
        result["is_following"] = bool(follow_check.data)

    return result


@router.post("")
async def create_org(body: OrgCreate, user=Depends(get_current_user)):
    """Create a new organization (status=pending)."""
    slug = _slugify(body.name)

    org = supabase.table("organizations").insert({
        "owner_id": user["id"],
        "name": body.name,
        "slug": slug,
        "org_type": body.org_type,
        "official_email": body.official_email,
        "description": body.description,
        "registration_number": body.registration_number,
        "website": body.website,
        "wilaya": body.wilaya,
        "city": body.city,
        "founded_year": body.founded_year,
        "status": "pending",
    }).execute()

    # Add owner as member
    supabase.table("org_members").insert({
        "org_id": org.data[0]["id"],
        "user_id": user["id"],
        "role": "owner",
    }).execute()

    # Update user role to organizer
    supabase.table("profiles").update({
        "role": "organizer",
    }).eq("id", user["id"]).execute()

    return org.data[0]


@router.patch("/{org_id}")
async def update_org(org_id: str, body: OrgUpdate, user=Depends(require_org)):
    """Update organization details."""
    org = supabase.table("organizations").select("owner_id").eq("id", org_id).single().execute()
    if not org.data or org.data["owner_id"] != user["id"]:
        raise HTTPException(403, "Not the org owner")

    update_data = body.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()

    result = supabase.table("organizations").update(update_data).eq("id", org_id).execute()
    return result.data[0] if result.data else {}


@router.post("/{org_id}/logo")
async def upload_logo(org_id: str, file: UploadFile = File(...), user=Depends(require_org)):
    """Upload org logo."""
    content = await file.read()
    path = f"{org_id}/logo.webp"

    supabase.storage.from_("orgs").upload(
        path, content,
        file_options={"content-type": file.content_type or "image/webp", "upsert": "true"}
    )
    public_url = supabase.storage.from_("orgs").get_public_url(path)

    supabase.table("organizations").update({
        "logo_url": public_url,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", org_id).execute()

    return {"logo_url": public_url}


@router.post("/{org_id}/cover")
async def upload_cover(org_id: str, file: UploadFile = File(...), user=Depends(require_org)):
    """Upload org cover image."""
    content = await file.read()
    path = f"{org_id}/cover.webp"

    supabase.storage.from_("orgs").upload(
        path, content,
        file_options={"content-type": file.content_type or "image/webp", "upsert": "true"}
    )
    public_url = supabase.storage.from_("orgs").get_public_url(path)

    supabase.table("organizations").update({
        "cover_url": public_url,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", org_id).execute()

    return {"cover_url": public_url}


# ── Follow/Unfollow ────────────────────────────────────

@router.post("/{org_id}/follow")
async def follow_org(org_id: str, user=Depends(get_current_user)):
    """Follow an organization."""
    supabase.table("org_followers").insert({
        "org_id": org_id,
        "user_id": user["id"],
    }).execute()

    # Increment counter
    org = supabase.table("organizations").select("follower_count").eq("id", org_id).single().execute()
    if org.data:
        supabase.table("organizations").update({
            "follower_count": org.data["follower_count"] + 1,
        }).eq("id", org_id).execute()

    return {"message": "Followed"}


@router.delete("/{org_id}/follow")
async def unfollow_org(org_id: str, user=Depends(get_current_user)):
    """Unfollow an organization."""
    supabase.table("org_followers").delete().eq(
        "org_id", org_id
    ).eq("user_id", user["id"]).execute()

    org = supabase.table("organizations").select("follower_count").eq("id", org_id).single().execute()
    if org.data:
        supabase.table("organizations").update({
            "follower_count": max(0, org.data["follower_count"] - 1),
        }).eq("id", org_id).execute()

    return {"message": "Unfollowed"}


@router.get("/{org_id}/followers")
async def get_followers(org_id: str, page: int = 0, page_size: int = 20):
    """Get org followers."""
    followers = (
        supabase.table("org_followers")
        .select("*, profiles(username, full_name, avatar_url)")
        .eq("org_id", org_id)
        .order("followed_at", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1)
        .execute()
    )
    return followers.data or []


# ── Org content ────────────────────────────────────────

@router.get("/{org_id}/events")
async def get_org_events(org_id: str, page: int = 0, page_size: int = 20):
    """Get org's events."""
    events = (
        supabase.table("events")
        .select("*")
        .eq("org_id", org_id)
        .order("starts_at", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1)
        .execute()
    )
    return events.data or []


@router.get("/{org_id}/posts")
async def get_org_posts(org_id: str, page: int = 0, page_size: int = 20):
    """Get org's posts."""
    posts = (
        supabase.table("posts")
        .select("*, profiles(username, full_name, avatar_url)")
        .eq("org_id", org_id)
        .eq("is_draft", False)
        .order("published_at", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1)
        .execute()
    )
    return posts.data or []


# ── Members ────────────────────────────────────────────

@router.post("/{org_id}/members")
async def add_member(org_id: str, body: MemberAdd, user=Depends(require_org)):
    """Add a member to the org."""
    org = supabase.table("organizations").select("owner_id").eq("id", org_id).single().execute()
    if not org.data or org.data["owner_id"] != user["id"]:
        raise HTTPException(403, "Not the org owner")

    supabase.table("org_members").insert({
        "org_id": org_id,
        "user_id": body.user_id,
        "role": body.role,
    }).execute()
    return {"message": "Member added"}


@router.delete("/{org_id}/members/{target_user_id}")
async def remove_member(org_id: str, target_user_id: str, user=Depends(require_org)):
    """Remove a member from the org."""
    org = supabase.table("organizations").select("owner_id").eq("id", org_id).single().execute()
    if not org.data or org.data["owner_id"] != user["id"]:
        raise HTTPException(403, "Not the org owner")

    supabase.table("org_members").delete().eq(
        "org_id", org_id
    ).eq("user_id", target_user_id).execute()
    return {"message": "Member removed"}
