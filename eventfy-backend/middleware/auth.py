from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError, jwk
from typing import Optional
import requests
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import JWT_SECRET, SUPABASE_URL, supabase

# ── JWKS cache ────────────────────────────────────────
_jwks_cache = None


def _get_jwks():
    """Fetch and cache JWKS from Supabase."""
    global _jwks_cache
    if _jwks_cache is None:
        try:
            url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
            r = requests.get(url, timeout=5)
            r.raise_for_status()
            _jwks_cache = r.json()
        except Exception as e:
            print(f"WARNING: Failed to fetch JWKS: {e}")
            _jwks_cache = {"keys": []}
    return _jwks_cache


def _find_jwk_key(token: str):
    """Find the matching JWK for a token's kid header."""
    try:
        headers = jwt.get_unverified_header(token)
    except JWTError:
        return None, None

    alg = headers.get("alg", "HS256")
    kid = headers.get("kid")

    if alg == "HS256":
        # Legacy HS256 — use the JWT_SECRET directly
        return JWT_SECRET, "HS256"

    # ES256 or other asymmetric — look up in JWKS
    jwks = _get_jwks()
    for key_data in jwks.get("keys", []):
        if kid and key_data.get("kid") == kid:
            return key_data, alg
        if not kid and key_data.get("kty") in ("EC", "RSA"):
            return key_data, alg

    return None, alg


async def get_current_user(authorization: str = Header(...)):
    """Extract and validate JWT token, return user profile from DB."""
    try:
        token = authorization.replace("Bearer ", "")

        key, alg = _find_jwk_key(token)
        if key is None:
            raise HTTPException(status_code=401, detail="No matching key found for token")

        payload = jwt.decode(
            token, key, algorithms=[alg],
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
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {e}")


async def get_optional_user(authorization: Optional[str] = Header(None)):
    """Optional auth — returns user profile or None."""
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None


def require_org(user=Depends(get_current_user)):
    """Ensure the user has an organizer-level role."""
    if user["role"] not in ("organizer", "local_admin", "global_admin"):
        raise HTTPException(status_code=403, detail="Organization account required")
    return user


def require_admin(user=Depends(get_current_user)):
    """Ensure the user has an admin role."""
    if user["role"] not in ("local_admin", "global_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
