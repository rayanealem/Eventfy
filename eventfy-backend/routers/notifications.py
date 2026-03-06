"""Notifications router — /notifications/*"""

from fastapi import APIRouter, Depends
from config import supabase
from middleware.auth import get_current_user

router = APIRouter()


@router.get("")
async def list_notifications(page: int = 0, page_size: int = 20, user=Depends(get_current_user)):
    """Get user notifications (paginated)."""
    notifs = (supabase.table("notifications").select("*")
        .eq("user_id", user["id"]).order("created_at", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1).execute())
    unread = (supabase.table("notifications").select("id", count="exact")
        .eq("user_id", user["id"]).eq("is_read", False).execute())
    return {"notifications": notifs.data or [], "unread_count": unread.count or 0}


@router.patch("/read")
async def mark_all_read(user=Depends(get_current_user)):
    """Mark all notifications as read."""
    supabase.table("notifications").update({"is_read": True}).eq("user_id", user["id"]).eq("is_read", False).execute()
    return {"message": "All marked as read"}


@router.patch("/{notification_id}/read")
async def mark_one_read(notification_id: str, user=Depends(get_current_user)):
    """Mark single notification as read."""
    supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user["id"]).execute()
    return {"message": "Marked as read"}
