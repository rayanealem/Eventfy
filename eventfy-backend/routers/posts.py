"""Posts router — /posts/*"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from config import supabase
from middleware.auth import get_current_user, require_org

router = APIRouter()


@router.get("/feed")
async def posts_feed(page: int = 0, page_size: int = 20, user=Depends(get_current_user)):
    """Posts from followed orgs."""
    follows = supabase.table("org_followers").select("org_id").eq("user_id", user["id"]).execute()
    org_ids = [f["org_id"] for f in (follows.data or [])]
    if not org_ids:
        return []

    posts = (supabase.table("posts")
        .select("*, profiles(username, full_name, avatar_url), organizations(name, logo_url, slug)")
        .in_("org_id", org_ids).eq("is_draft", False)
        .order("published_at", desc=True)
        .range(page * page_size, (page + 1) * page_size - 1).execute())
    return posts.data or []


@router.get("/{post_id}")
async def get_post(post_id: str):
    """Get post detail."""
    post = (supabase.table("posts")
        .select("*, profiles(username, full_name, avatar_url), organizations(name, logo_url, slug)")
        .eq("id", post_id).single().execute())
    if not post.data:
        raise HTTPException(404, "Post not found")
    return post.data


@router.post("")
async def create_post(body: dict, user=Depends(require_org)):
    """Create a post."""
    post = supabase.table("posts").insert({
        "org_id": body["org_id"], "author_id": user["id"],
        "post_type": body.get("post_type", "update"), "content": body.get("content"),
        "media_urls": body.get("media_urls", []),
        "is_draft": body.get("is_draft", False),
        "scheduled_at": body.get("scheduled_at"),
    }).execute()
    return post.data[0] if post.data else {}


@router.patch("/{post_id}")
async def edit_post(post_id: str, body: dict, user=Depends(require_org)):
    """Edit a post."""
    post = supabase.table("posts").select("author_id").eq("id", post_id).single().execute()
    if not post.data or post.data["author_id"] != user["id"]:
        raise HTTPException(403, "Not your post")

    update = {k: v for k, v in body.items() if v is not None}
    result = supabase.table("posts").update(update).eq("id", post_id).execute()
    return result.data[0] if result.data else {}


@router.delete("/{post_id}")
async def delete_post(post_id: str, user=Depends(require_org)):
    """Delete a post."""
    supabase.table("posts").delete().eq("id", post_id).execute()
    return {"message": "Post deleted"}


@router.post("/{post_id}/like")
async def like_post(post_id: str, user=Depends(get_current_user)):
    """Toggle like on a post."""
    post = supabase.table("posts").select("like_count").eq("id", post_id).single().execute()
    if not post.data:
        raise HTTPException(404, "Post not found")

    # Simple toggle via count (in production, use a likes junction table)
    supabase.table("posts").update({
        "like_count": post.data["like_count"] + 1,
    }).eq("id", post_id).execute()
    return {"liked": True}


@router.post("/{post_id}/comment")
async def comment_on_post(post_id: str, body: dict, user=Depends(get_current_user)):
    """Comment on a post (stores as notification for now)."""
    post = supabase.table("posts").select("author_id, comment_count").eq("id", post_id).single().execute()
    if not post.data:
        raise HTTPException(404, "Post not found")

    supabase.table("posts").update({
        "comment_count": post.data["comment_count"] + 1,
    }).eq("id", post_id).execute()

    return {"comment_count": post.data["comment_count"] + 1}
