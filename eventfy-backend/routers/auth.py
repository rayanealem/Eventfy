"""Auth router — /auth/*"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from config import supabase
from middleware.auth import get_current_user
from models.user import ParticipantRegister, OrgRegister, ProfileUpdate
import re

router = APIRouter()


def _slugify(text: str) -> str:
    """Create a URL-safe slug from text."""
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug


@router.post("/register/participant")
async def register_participant(body: ParticipantRegister):
    """Create participant account via Supabase Auth."""
    try:
        result = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {
                    "username": body.username,
                    "full_name": body.full_name,
                }
            }
        })
        if result.user is None:
            raise HTTPException(400, "Registration failed")

        return {
            "user_id": result.user.id,
            "email": result.user.email,
            "message": "Account created successfully"
        }
    except Exception as e:
        raise HTTPException(400, str(e))


@router.post("/register/org")
async def register_org(body: OrgRegister, user=Depends(get_current_user)):
    """Create org for the current authenticated user (status=pending)."""
    try:
        user_id = user["id"]

        # 1. Update profile role to organizer
        supabase.table("profiles").update({
            "role": "organizer",
            "wilaya": body.wilaya,
            "city": body.city,
        }).eq("id", user_id).execute()

        # 2. Create organization
        slug = _slugify(body.org_name)
        org = supabase.table("organizations").insert({
            "owner_id": user_id,
            "name": body.org_name,
            "slug": slug,
            "org_type": body.org_type,
            "official_email": body.official_email,
            "description": body.description,
            "registration_number": body.registration_number,
            "website": body.website,
            "wilaya": body.wilaya,
            "city": body.city,
            "status": "pending",
        }).execute()

        # 3. Add owner as org member
        supabase.table("org_members").insert({
            "org_id": org.data[0]["id"],
            "user_id": user_id,
            "role": "owner",
        }).execute()

        return {
            "user_id": user_id,
            "org_id": org.data[0]["id"],
            "status": "pending",
            "message": "Organization account created. Pending admin approval."
        }
    except Exception as e:
        raise HTTPException(400, str(e))


@router.post("/logout")
async def logout(user=Depends(get_current_user)):
    """Revoke current session."""
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    """Get current user profile with badges, skills, and managed orgs. Core gamified state included."""
    # Get profile with badges and skill counts
    profile = (
        supabase.table("profiles")
        .select("""
            id, username, full_name, avatar_url, shape, shape_color, player_number, xp, level, role, onboarding_done,
            user_badges (
                badge_id,
                badges ( name, icon_url, shape, color )
            ),
            user_skills (
                skill_id, verified,
                skills ( name, category )
            )
        """)
        .eq("id", user["id"])
        .single()
        .execute()
    )

    # Get orgs this user owns/manages
    orgs = (
        supabase.table("org_members")
        .select("*, organizations(id, name, slug, logo_url, status, verified)")
        .eq("user_id", user["id"])
        .execute()
    )

    result = {
        **(profile.data or user),
        "managed_orgs": [m["organizations"] for m in (orgs.data or [])],
    }

    # Extract user badges safely
    result["badges"] = [b for b in (result.get("user_badges") or []) if b.get("badges")]

    # Compute live counts from junction tables
    uid = user["id"]
    try:
        followers = supabase.table("user_follows").select("follower_id").eq("following_id", uid).execute()
        result["follower_count"] = len(followers.data or [])
    except Exception as e:
        print(f"Error computing follower_count: {e}")
        result["follower_count"] = 0

    try:
        following_users = supabase.table("user_follows").select("following_id").eq("follower_id", uid).execute()
        following_orgs = supabase.table("org_followers").select("org_id").eq("user_id", uid).execute()
        result["following_count"] = len(following_users.data or []) + len(following_orgs.data or [])
    except Exception as e:
        print(f"Error computing following_count: {e}")
        result["following_count"] = 0

    try:
        events = supabase.table("event_registrations").select("event_id").eq("user_id", uid).execute()
        result["event_count"] = len(events.data or [])
    except Exception as e:
        print(f"Error computing event_count: {e}")
        result["event_count"] = 0

    return result


@router.patch("/me")
async def update_me(body: ProfileUpdate, user=Depends(get_current_user)):
    """Update current user profile fields."""
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(400, "No fields to update")

    update_data["updated_at"] = datetime.utcnow().isoformat()
    result = (
        supabase.table("profiles")
        .update(update_data)
        .eq("id", user["id"])
        .execute()
    )
    return result.data[0] if result.data else user


@router.post("/complete-onboarding")
async def complete_onboarding(user=Depends(get_current_user)):
    """Mark onboarding as done and award XP."""
    supabase.table("profiles").update({
        "onboarding_done": True,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", user["id"]).execute()

    # Award onboarding XP
    from utils.xp_engine import award_xp
    xp_result = award_xp(user["id"], 100, "onboarding_complete")

    return {
        "onboarding_done": True,
        "xp_earned": 100,
        **xp_result,
    }
