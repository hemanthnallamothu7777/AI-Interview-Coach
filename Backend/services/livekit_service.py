"""
LiveKit Service — handles room creation and access token generation.
LiveKit provides the WebRTC infrastructure for voice interview sessions.

Requires: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL in .env
If not configured, voice mode gracefully falls back to browser TTS/STT.
"""

import os
from dotenv import load_dotenv

load_dotenv()

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "")
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "wss://your-livekit-server.livekit.cloud")


def is_livekit_configured() -> bool:
    """Check if LiveKit credentials are present."""
    return bool(LIVEKIT_API_KEY and LIVEKIT_API_SECRET and "your-livekit" not in LIVEKIT_URL)


async def create_room(room_name: str) -> dict:
    """
    Create a LiveKit room for the interview session.
    Room auto-closes after 5 minutes of no participants.
    """
    if not is_livekit_configured():
        raise RuntimeError("LiveKit is not configured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL.")

    try:
        from livekit import api

        lk_api = api.LiveKitAPI(
            url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )

        room = await lk_api.room.create_room(
            api.CreateRoomRequest(
                name=room_name,
                empty_timeout=300,   # delete room after 5 min empty
                max_participants=2,  # candidate + AI agent
            )
        )
        await lk_api.aclose()
        return {"name": room.name, "sid": room.sid}

    except ImportError:
        raise RuntimeError("livekit-api package not installed. Run: pip install livekit-api")


async def generate_token(room_name: str, participant_name: str) -> dict:
    """
    Generate a short-lived JWT access token for a LiveKit room participant.
    Returns dict with 'token' and 'url' keys.
    """
    if not is_livekit_configured():
        raise RuntimeError("LiveKit is not configured.")

    try:
        from livekit import api

        token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        token.with_identity(participant_name)
        token.with_name(participant_name)
        token.with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )

        return {"token": token.to_jwt(), "url": LIVEKIT_URL}

    except ImportError:
        raise RuntimeError("livekit-api package not installed. Run: pip install livekit-api")
