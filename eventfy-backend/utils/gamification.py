"""Gamification module for assigning user shapes and awarding badges."""

from config import supabase

# Mapping of event type to shape and color
SHAPE_MAP = {
    "sport": {"shape": "○", "color": "Pink"},
    "science": {"shape": "△", "color": "Gold"},
    "charity": {"shape": "□", "color": "Teal"},
    "cultural": {"shape": "◇", "color": "Blue"},
}


def recalculate_user_shape(user_id: str) -> None:
    """Recalculate and update the user's shape based on most frequent attended event type."""
    # Query registrations joined with events to count attended event types
    # We fetch all check-ins for the user and count them in Python since Supabase RPC/aggregation on joined tables might be complex
    registrations = (
        supabase.table("event_registrations")
        .select("events(event_type)")
        .eq("user_id", user_id)
        .eq("checked_in", True)
        .execute()
    )

    if not registrations.data:
        return

    type_counts = {}
    for reg in registrations.data:
        event = reg.get("events")
        if event and event.get("event_type"):
            event_type = event["event_type"]
            type_counts[event_type] = type_counts.get(event_type, 0) + 1

    if not type_counts:
        return

    # Find the most frequent event type
    most_frequent_type = max(type_counts, key=type_counts.get)
    shape_info = SHAPE_MAP.get(most_frequent_type)

    if shape_info:
        # Update profile with new shape and color
        supabase.table("profiles").update({
            "shape": shape_info["shape"],
            "shape_color": shape_info["color"],
        }).eq("id", user_id).execute()


def check_and_award_badges(user_id: str, reason: str, event_id: str = None) -> list:
    """Check milestones and award badges if conditions are met."""
    unlocked = []

    # Only evaluate these check-in based milestones if the reason is a checkin
    if reason == "checkin":
        # Get all check-ins for the user with event type info
        checkins = (
            supabase.table("event_registrations")
            .select("events(event_type)")
            .eq("user_id", user_id)
            .eq("checked_in", True)
            .execute()
        )

        total_checkins = len(checkins.data) if checkins.data else 0

        attended_types = set()
        for reg in (checkins.data or []):
            event = reg.get("events")
            if event and event.get("event_type"):
                attended_types.add(event["event_type"])

        # Define conditions
        badge_conditions = {}

        # 1. First Blood
        if total_checkins >= 1:
            badge_conditions["First Blood"] = True

        # 2. Veteran
        if total_checkins >= 10:
            badge_conditions["Veteran"] = True

        # 3. Omni-Player (Attended at least one of all 4 types)
        if len(attended_types) >= 4 and {"sport", "science", "charity", "cultural"}.issubset(attended_types):
            badge_conditions["Omni-Player"] = True

        for badge_name, condition_met in badge_conditions.items():
            if condition_met:
                _award_badge_if_not_owned(user_id, badge_name, event_id, unlocked)

        # Also keep the existing count-based checks from old _check_badge_criteria
        legacy_badge_map = {
            1: "First Check-In",
            5: "Regular Attendee",
            10: "Event Enthusiast",
            25: "Event Veteran",
            50: "Event Legend",
        }

        for threshold, badge_name in legacy_badge_map.items():
            if total_checkins >= threshold:
                _award_badge_if_not_owned(user_id, badge_name, event_id, unlocked)

    return unlocked


def _award_badge_if_not_owned(user_id: str, badge_name: str, event_id: str, unlocked_list: list) -> None:
    """Helper to check if a user has a badge, and award it if they don't."""
    badge = (
        supabase.table("badges")
        .select("id")
        .eq("name", badge_name)
        .single()
        .execute()
    )

    # If badge does not exist in DB, we skip
    if not badge.data:
        return

    badge_id = badge.data["id"]

    existing = (
        supabase.table("user_badges")
        .select("user_id")
        .eq("user_id", user_id)
        .eq("badge_id", badge_id)
        .execute()
    )

    if not existing.data:
        # Award the badge
        insert_data = {
            "user_id": user_id,
            "badge_id": badge_id,
        }
        if event_id:
            insert_data["event_id"] = event_id

        supabase.table("user_badges").insert(insert_data).execute()

        # Send notification
        supabase.table("notifications").insert({
            "user_id": user_id,
            "type": "badge_earned",
            "title": "Badge Unlocked! 🏅",
            "body": f'You earned the "{badge_name}" badge!',
            "data": {"badge_id": badge_id, "badge_name": badge_name},
        }).execute()

        unlocked_list.append(badge_name)
