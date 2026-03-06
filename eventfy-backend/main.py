from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    auth, users, events, organizations, qr, chat,
    stories, gamification, admin, search, posts,
    notifications, volunteers, teams, registrations,
)

app = FastAPI(
    title="Eventfy API",
    version="1.0.0",
    description="Eventfy — Universal Event Super-App Backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://eventfy.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────
app.include_router(auth.router,          prefix="/v1/auth",          tags=["auth"])
app.include_router(users.router,         prefix="/v1/users",         tags=["users"])
app.include_router(events.router,        prefix="/v1/events",        tags=["events"])
app.include_router(organizations.router, prefix="/v1/orgs",          tags=["orgs"])
app.include_router(registrations.router, prefix="/v1/registrations", tags=["registrations"])
app.include_router(volunteers.router,    prefix="/v1/volunteers",    tags=["volunteers"])
app.include_router(teams.router,         prefix="/v1/teams",         tags=["teams"])
app.include_router(qr.router,           prefix="/v1/qr",            tags=["qr"])
app.include_router(chat.router,          prefix="/v1/chat",          tags=["chat"])
app.include_router(stories.router,       prefix="/v1/stories",       tags=["stories"])
app.include_router(notifications.router, prefix="/v1/notifications", tags=["notifications"])
app.include_router(gamification.router,  prefix="/v1/gamification",  tags=["gamification"])
app.include_router(posts.router,         prefix="/v1/posts",         tags=["posts"])
app.include_router(admin.router,         prefix="/v1/admin",         tags=["admin"])
app.include_router(search.router,        prefix="/v1/search",        tags=["search"])


@app.get("/")
async def root():
    return {"app": "Eventfy", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
