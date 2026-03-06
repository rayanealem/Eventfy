from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError
from typing import Optional
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import JWT_SECRET, supabase


async def get_current_user(authorization: str = Header(...)):
    """Extract and validate JWT token, return user profile from DB."""
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(
            token, JWT_SECRET, algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        profile = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if not profile.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile.data
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_optional_user(authorization: Optional[str] = Header(None)):
    """Optional auth — returns user profile or None."""
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None


def require_org(user=Depends(get_current_user)):
    """Ensure the user has the organizer role."""
    if user["role"] != "organizer":
        raise HTTPException(status_code=403, detail="Organization account required")
    return user


def require_admin(user=Depends(get_current_user)):
    """Ensure the user has an admin role."""
    if user["role"] not in ("local_admin", "global_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
