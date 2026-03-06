"""XP Engine — Level thresholds, titles, and XP award logic."""

from config import supabase
from datetime import datetime

LEVEL_THRESHOLDS = [
    0,      # Level 1
    500,    # Level 2
    1200,   # Level 3
    2500,   # Level 4
    4500,   # Level 5
    7000,   # Level 6
    10000,  # Level 7
    14000,  # Level 8
    19000,  # Level 9
    25000,  # Level 10
]

LEVEL_TITLES = {
    1: "ROOKIE",
    2: "CHALLENGER",
    3: "ARENA PLAYER",
    4: "RISING STAR",
    5: "TACTICIAN",
    6: "VETERAN",
    7: "HACKATHON VETERAN",
    8: "ELITE OPERATOR",
    9: "LEGEND",
    10: "THE FRONT MAN",
}


def get_level(xp: int) -> int:
    """Return level (1–10) for a given XP amount."""
    for i, threshold in enumerate(reversed(LEVEL_THRESHOLDS)):
        if xp >= threshold:
            return len(LEVEL_THRESHOLDS) - i
    return 1


def get_level_title(level: int) -> str:
    """Return the title string for a level."""
    return LEVEL_TITLES.get(level, "ROOKIE")


def get_level_progress(xp: int) -> dict:
    """Return level progress info: current level, XP within level, XP needed for next."""
    level = get_level(xp)
    current_threshold = LEVEL_THRESHOLDS[level - 1] if level <= len(LEVEL_THRESHOLDS) else LEVEL_THRESHOLDS[-1]
    next_threshold = LEVEL_THRESHOLDS[level] if level < len(LEVEL_THRESHOLDS) else None

    return {
        "level": level,
        "title": get_level_title(level),
        "current_xp": xp,
        "level_xp": xp - current_threshold,
        "xp_for_next": next_threshold - current_threshold if next_threshold else None,
        "is_max_level": next_threshold is None,
    }


def award_xp(user_id: str, amount: int, reason: str, event_id: str = None) -> dict:
    """
    Award XP to a user.
    1. Insert xp_transaction
    2. Update profiles.xp += amount
    3. Check if level changed → notify
    4. Check badge criteria → award if unlocked
    5. Return result dict
    """
    # 1. Get current profile
    profile = (
        supabase.table("profiles")
        .select("xp, level")
        .eq("id", user_id)
        .single()
        .execute()
    )
    old_xp = profile.data["xp"]
    old_level = profile.data["level"]
    new_xp = old_xp + amount
    new_level = get_level(new_xp)

    # 2. Insert XP transaction
    tx_data = {
        "user_id": user_id,
        "amount": amount,
        "reason": reason,
    }
    if event_id:
        tx_data["event_id"] = event_id
    supabase.table("xp_transactions").insert(tx_data).execute()

    # 3. Update profile
    supabase.table("profiles").update({
        "xp": new_xp,
        "level": new_level,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", user_id).execute()

    leveled_up = new_level > old_level

    # 4. If leveled up, create notification
    if leveled_up:
        supabase.table("notifications").insert({
            "user_id": user_id,
            "type": "level_up",
            "title": f"Level Up! 🎉",
            "body": f"You reached Level {new_level} — {get_level_title(new_level)}!",
            "data": {"new_level": new_level, "title": get_level_title(new_level)},
        }).execute()

    # 5. Check badge criteria (simplified — check count-based badges)
    badges_unlocked = _check_badge_criteria(user_id, reason, event_id)

    return {
        "new_xp": new_xp,
        "new_level": new_level,
        "leveled_up": leveled_up,
        "badges_unlocked": badges_unlocked,
    }


def _check_badge_criteria(user_id: str, reason: str, event_id: str = None) -> list:
    """Check and award any badges the user has now unlocked."""
    unlocked = []

    # Count-based badge checks
    if reason == "checkin":
        # Check total check-ins
        checkins = (
            supabase.table("event_registrations")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("checked_in", True)
            .execute()
        )
        count = checkins.count or 0

        badge_map = {
            1: "First Check-In",
            5: "Regular Attendee",
            10: "Event Enthusiast",
            25: "Event Veteran",
            50: "Event Legend",
        }

        for threshold, badge_name in badge_map.items():
            if count >= threshold:
                # Check if badge exists and not already earned
                badge = (
                    supabase.table("badges")
                    .select("id")
                    .eq("name", badge_name)
                    .single()
                    .execute()
                )
                if badge.data:
                    existing = (
                        supabase.table("user_badges")
                        .select("user_id")
                        .eq("user_id", user_id)
                        .eq("badge_id", badge.data["id"])
                        .execute()
                    )
                    if not existing.data:
                        supabase.table("user_badges").insert({
                            "user_id": user_id,
                            "badge_id": badge.data["id"],
                            "event_id": event_id,
                        }).execute()

                        supabase.table("notifications").insert({
                            "user_id": user_id,
                            "type": "badge_earned",
                            "title": "Badge Unlocked! 🏅",
                            "body": f'You earned the "{badge_name}" badge!',
                            "data": {"badge_id": badge.data["id"], "badge_name": badge_name},
                        }).execute()

                        unlocked.append(badge_name)

    return unlocked
