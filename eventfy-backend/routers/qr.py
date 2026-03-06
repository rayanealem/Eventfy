"""QR router — /qr/*"""

import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from config import supabase
from middleware.auth import get_current_user, require_org
from utils.xp_engine import award_xp
from utils.qr_generator import generate_qr_data_url

router = APIRouter()


@router.post("/{event_id}/generate")
async def generate_qr(event_id: str, org=Depends(require_org)):
    """Generate new QR token (60s TTL)."""
    event = supabase.table("events").select("created_by, org_id").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(404, "Event not found")

    membership = supabase.table("org_members").select("role").eq("org_id", event.data["org_id"]).eq("user_id", org["id"]).execute()
    if not membership.data:
        raise HTTPException(403, "Not authorized for this event")

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(seconds=60)

    supabase.table("qr_tokens").insert({
        "event_id": event_id, "org_id": event.data["org_id"],
        "token": token, "expires_at": expires_at.isoformat(),
    }).execute()

    qr_data_url = generate_qr_data_url(f"eventfy://checkin/{event_id}/{token}")

    return {"token": token, "expires_at": expires_at.isoformat(), "qr_data_url": qr_data_url}


@router.post("/{event_id}/scan")
async def scan_qr(event_id: str, body: dict, user=Depends(get_current_user)):
    """Validate token + check in user + award XP."""
    token = body.get("token")
    if not token:
        raise HTTPException(400, "Token required")

    now = datetime.utcnow().isoformat()
    qr = supabase.table("qr_tokens").select("*").eq("event_id", event_id).eq("token", token).gt("expires_at", now).execute()
    if not qr.data:
        raise HTTPException(400, "Invalid or expired QR code")

    reg = supabase.table("event_registrations").select("*").eq("event_id", event_id).eq("user_id", user["id"]).single().execute()
    if not reg.data:
        raise HTTPException(403, "Not registered for this event")
    if reg.data["checked_in"]:
        raise HTTPException(409, "Already checked in")

    supabase.table("event_registrations").update({
        "checked_in": True, "checked_in_at": datetime.utcnow().isoformat(),
    }).eq("id", reg.data["id"]).execute()

    event = supabase.table("events").select("xp_checkin, checkin_count").eq("id", event_id).single().execute()
    xp_amount = event.data["xp_checkin"] if event.data else 100
    xp_result = award_xp(user["id"], xp_amount, "checkin", event_id)

    if event.data:
        supabase.table("events").update({"checkin_count": event.data["checkin_count"] + 1}).eq("id", event_id).execute()

    return {
        "success": True,
        "user": {"player_number": user["player_number"], "full_name": user["full_name"]},
        "xp_earned": xp_amount, "new_total_xp": xp_result["new_xp"],
        "leveled_up": xp_result["leveled_up"], "badge_unlocked": xp_result.get("badges_unlocked"),
    }
