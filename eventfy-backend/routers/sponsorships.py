"""Sponsorships router — /v1/sponsorships"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config import supabase
from middleware.auth import get_current_user

router = APIRouter()

class SponsorshipCreate(BaseModel):
    event_id: str
    org_id: str
    tier: str
    amount: int

@router.post("")
async def create_sponsorship(data: SponsorshipCreate, user=Depends(get_current_user)):
    """Create a new sponsorship application."""
    # Insert sponsorship
    res = supabase.table("sponsorships").insert({
        "event_id": data.event_id,
        "org_id": data.org_id,
        "tier": data.tier.lower(),
        "amount": data.amount,
        "status": "pending"
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create sponsorship")
        
    return res.data[0]

@router.get("/event/{event_id}")
async def get_event_sponsorships(event_id: str):
    """Get all sponsorships for an event."""
    res = supabase.table("sponsorships").select("*, organizations(name, logo_url)").eq("event_id", event_id).execute()
    return res.data or []
