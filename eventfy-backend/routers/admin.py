"""Admin router — /admin/*"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from config import supabase
from middleware.auth import require_admin

router = APIRouter()


@router.get("/orgs/pending")
async def get_pending_orgs(user=Depends(require_admin)):
    """Get org verification queue."""
    orgs = (supabase.table("organizations").select("*, profiles(username, full_name, avatar_url)")
        .in_("status", ["pending", "under_review"]).order("created_at").execute())
    return orgs.data or []


@router.patch("/orgs/{org_id}/approve")
async def approve_org(org_id: str, user=Depends(require_admin)):
    """Approve an organization."""
    supabase.table("organizations").update({
        "status": "approved", "verified": True, "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", org_id).execute()

    org = supabase.table("organizations").select("owner_id, name").eq("id", org_id).single().execute()
    if org.data:
        supabase.table("notifications").insert({
            "user_id": org.data["owner_id"], "type": "org_verified",
            "title": "Organization Approved! ✅",
            "body": f'{org.data["name"]} has been verified and approved!',
            "data": {"org_id": org_id},
        }).execute()
    return {"status": "approved"}


@router.patch("/orgs/{org_id}/reject")
async def reject_org(org_id: str, body: dict, user=Depends(require_admin)):
    """Reject an organization."""
    reason = body.get("reason", "")
    supabase.table("organizations").update({
        "status": "rejected", "rejection_reason": reason, "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", org_id).execute()

    org = supabase.table("organizations").select("owner_id, name").eq("id", org_id).single().execute()
    if org.data:
        supabase.table("notifications").insert({
            "user_id": org.data["owner_id"], "type": "org_rejected",
            "title": "Organization Application Update",
            "body": f'{org.data["name"]} was not approved. Reason: {reason}',
            "data": {"org_id": org_id, "reason": reason},
        }).execute()
    return {"status": "rejected"}


@router.patch("/orgs/{org_id}/review")
async def mark_under_review(org_id: str, user=Depends(require_admin)):
    """Mark org as under review."""
    supabase.table("organizations").update({
        "status": "under_review", "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", org_id).execute()
    return {"status": "under_review"}


@router.get("/users")
async def list_users(role: str = None, page: int = 0, page_size: int = 50, user=Depends(require_admin)):
    """List all users."""
    query = supabase.table("profiles").select("*").order("created_at", desc=True).range(page * page_size, (page + 1) * page_size - 1)
    if role:
        query = query.eq("role", role)
    return query.execute().data or []


@router.patch("/users/{user_id}/suspend")
async def suspend_user(user_id: str, user=Depends(require_admin)):
    """Suspend a user."""
    supabase.table("profiles").update({"role": "suspended"}).eq("id", user_id).execute()
    return {"message": "User suspended"}


@router.patch("/users/{user_id}/ban")
async def ban_user(user_id: str, user=Depends(require_admin)):
    """Ban a user."""
    supabase.table("profiles").update({"role": "banned"}).eq("id", user_id).execute()
    return {"message": "User banned"}


@router.patch("/users/{user_id}/promote")
async def promote_user(user_id: str, body: dict, user=Depends(require_admin)):
    """Promote user to admin role."""
    new_role = body.get("role", "local_admin")
    if new_role not in ("local_admin", "global_admin"):
        raise HTTPException(400, "Invalid role")
    supabase.table("profiles").update({"role": new_role}).eq("id", user_id).execute()
    return {"role": new_role}


@router.get("/stats")
async def platform_stats(user=Depends(require_admin)):
    """Platform analytics."""
    users = supabase.table("profiles").select("id", count="exact").execute()
    events = supabase.table("events").select("id", count="exact").execute()
    orgs = supabase.table("organizations").select("id", count="exact").eq("status", "approved").execute()
    return {"total_users": users.count or 0, "total_events": events.count or 0, "total_orgs": orgs.count or 0}


@router.get("/health")
async def system_health(user=Depends(require_admin)):
    """System health metrics."""
    return {"database": "connected", "status": "healthy", "timestamp": datetime.utcnow().isoformat()}
