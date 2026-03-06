"""Chat router — /chat/*"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from config import supabase
from middleware.auth import get_current_user
from models.chat import MessageCreate, MessageUpdate, ReactionCreate

router = APIRouter()


@router.get("/channels/{event_id}")
async def get_event_channels(event_id: str, user=Depends(get_current_user)):
    """Get channels for an event (user must be registered)."""
    reg = supabase.table("event_registrations").select("id").eq("event_id", event_id).eq("user_id", user["id"]).execute()
    if not reg.data:
        raise HTTPException(403, "Not registered for this event")

    channels = supabase.table("chat_channels").select("*").eq("event_id", event_id).execute()

    general = next((c for c in (channels.data or []) if c["name"] == "general"), None)
    messages = []
    if general:
        msgs = (supabase.table("messages")
            .select("*, profiles(username, full_name, avatar_url, shape, shape_color)")
            .eq("channel_id", general["id"]).is_("deleted_at", "null")
            .order("created_at", desc=False).limit(50).execute())
        messages = msgs.data or []

    return {
        "channels": channels.data or [],
        "general_channel_id": general["id"] if general else None,
        "messages": messages,
    }


@router.get("/channels/{channel_id}/messages")
async def get_messages(channel_id: str, page: int = 0, page_size: int = 50, user=Depends(get_current_user)):
    """Get message history (paginated)."""
    msgs = (supabase.table("messages")
        .select("*, profiles(username, full_name, avatar_url, shape, shape_color)")
        .eq("channel_id", channel_id).is_("deleted_at", "null")
        .order("created_at", desc=False)
        .range(page * page_size, (page + 1) * page_size - 1).execute())
    return {"messages": msgs.data or []}


@router.post("/channels/{channel_id}/messages")
async def send_message(channel_id: str, body: MessageCreate, user=Depends(get_current_user)):
    """Send a message."""
    msg = supabase.table("messages").insert({
        "channel_id": channel_id, "sender_id": user["id"], "content": body.content,
        "msg_type": body.msg_type, "file_url": body.file_url, "file_name": body.file_name,
        "file_size": body.file_size, "is_broadcast": body.is_broadcast,
    }).execute()
    return msg.data[0] if msg.data else {}


@router.patch("/messages/{message_id}")
async def edit_message(message_id: str, body: MessageUpdate, user=Depends(get_current_user)):
    """Edit a message (own only)."""
    msg = supabase.table("messages").select("sender_id").eq("id", message_id).single().execute()
    if not msg.data or msg.data["sender_id"] != user["id"]:
        raise HTTPException(403, "Not your message")

    result = supabase.table("messages").update({
        "content": body.content, "edited_at": datetime.utcnow().isoformat(),
    }).eq("id", message_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/messages/{message_id}")
async def delete_message(message_id: str, user=Depends(get_current_user)):
    """Soft-delete a message."""
    supabase.table("messages").update({
        "deleted_at": datetime.utcnow().isoformat(),
    }).eq("id", message_id).execute()
    return {"message": "Deleted"}


@router.post("/messages/{message_id}/react")
async def add_reaction(message_id: str, body: ReactionCreate, user=Depends(get_current_user)):
    """Toggle a reaction on a message."""
    existing = (supabase.table("message_reactions").select("*")
        .eq("message_id", message_id).eq("user_id", user["id"]).eq("emoji", body.emoji).execute())
    if existing.data:
        supabase.table("message_reactions").delete().eq("message_id", message_id).eq("user_id", user["id"]).eq("emoji", body.emoji).execute()
        return {"action": "removed"}
    else:
        supabase.table("message_reactions").insert({
            "message_id": message_id, "user_id": user["id"], "emoji": body.emoji,
        }).execute()
        return {"action": "added"}


@router.post("/dm/{target_user_id}")
async def start_dm(target_user_id: str, user=Depends(get_current_user)):
    """Start or get existing DM channel."""
    existing = (supabase.table("chat_channels").select("*")
        .eq("channel_type", "dm").execute())

    for ch in (existing.data or []):
        name_parts = set(ch["name"].split(":"))
        if {user["id"], target_user_id} == name_parts:
            return {"channel_id": ch["id"], "existing": True}

    channel = supabase.table("chat_channels").insert({
        "name": f"{user['id']}:{target_user_id}", "channel_type": "dm",
    }).execute()
    return {"channel_id": channel.data[0]["id"], "existing": False}


@router.get("/dm")
async def list_dms(user=Depends(get_current_user)):
    """List all DM conversations."""
    channels = (supabase.table("chat_channels").select("*")
        .eq("channel_type", "dm").like("name", f"%{user['id']}%").execute())
    return channels.data or []
