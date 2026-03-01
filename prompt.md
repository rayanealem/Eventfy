# EVENTFY — COMPLETE NAVIGATION & ROUTING REFERENCE
## Every Screen · Every Button · Every Transition
### v3.0 — Reconciled with actual project folder structure

---

> **Changelog from v2:**
> - All file paths reconciled with actual `tree /f` output
> - Route map updated to match real folder/file names
> - EventDetail polymorphic logic clarified (single file, type-based rendering)
> - Onboarding reconciled (Onboarding.jsx = Step 1, OnboardingStep2–6 = Steps 2–6)
> - QR: QREntry.jsx = org-side generator + participant-side scanner (same file, mode-based)
> - Scoreboard = GamificationHub, Passport = PlayerPassport, Business = Recruiter
> - Logic injection prompt included at bottom of this file

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🗺️ REAL FOLDER → ROUTE MAP
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
src/
├── App.jsx
├── AppRouter.jsx           ← All route definitions live here
├── AppShell.jsx            ← Wraps authenticated screens (BottomNav lives here)
├── index.css
├── main.jsx
│
├── components/
│   └── BottomNav.jsx       ← Persistent bottom nav (5 tabs)
│
├── router/
│   └── transitions.js      ← Framer Motion page variants
│
└── screens/
    ├── auth/
    │   ├── Splash.jsx                   ← /splash
    │   ├── ParticipantLoginAuth.jsx     ← /auth/participant/login
    │   ├── ParticipantRegisterAuth.jsx  ← /auth/participant/register
    │   ├── OrgLoginAuth.jsx             ← /auth/org/login
    │   └── OrgRegisterAuth.jsx          ← /auth/org/register  (+ pending state)
    │
    ├── onboarding/
    │   ├── Onboarding.jsx               ← /onboarding/1  (Step 1: Player Number)
    │   ├── OnboardingStep2.jsx          ← /onboarding/2  (Appearance)
    │   ├── OnboardingStep3.jsx          ← /onboarding/3  (Skills)
    │   ├── OnboardingStep4.jsx          ← /onboarding/4  (Arena/Location)
    │   ├── OnboardingStep5.jsx          ← /onboarding/5  (Follow Orgs)
    │   ├── OnboardingStep6.jsx          ← /onboarding/6  (First Mission)
    │   ├── OnboardingSteps.jsx          ← shared step layout/wrapper (not a route)
    │   ├── Onboarding.css
    │   └── OnboardingSteps.css
    │
    ├── feed/
    │   └── Feed.jsx                     ← /feed
    │
    ├── explore/
    │   └── Explore.jsx                  ← /explore
    │
    ├── event/
    │   └── EventDetail.jsx              ← /event/:id
    │       (renders sport/science/charity/cultural variants internally based on event.type)
    │
    ├── create/
    │   └── CreateEvent.jsx              ← /event/create
    │
    ├── profile/
    │   └── PlayerProfile.jsx            ← /profile/:username  and  /profile/me
    │
    ├── editprofile/
    │   └── EditProfile.jsx              ← /profile/edit
    │
    ├── org/
    │   └── OrgProfile.jsx               ← /org/:orgId
    │
    ├── orgsetup/
    │   └── OrgSetup.jsx                 ← /org/setup
    │
    ├── passport/
    │   └── PlayerPassport.jsx           ← /passport/:username  (CV / Passport view)
    │
    ├── scoreboard/
    │   └── Scoreboard.jsx               ← /scoreboard  (Gamification Hub / Leaderboard)
    │
    ├── chat/
    │   └── Chat.jsx                     ← /chat  and  /chat/:eventId
    │
    ├── story/
    │   └── Story.jsx                    ← /stories/:orgId  and  /stories/create
    │       (mode prop: 'view' | 'create')
    │
    ├── qr/
    │   └── QREntry.jsx                  ← /qr/:eventId
    │       (mode prop: 'generate' for orgs, 'scan' for participants+volunteers)
    │
    ├── volunteer/
    │   └── VolunteerMode.jsx            ← /volunteer/:eventId
    │
    ├── command/
    │   └── CommandCenter.jsx            ← /manage/:eventId
    │
    ├── analytics/
    │   └── Analytics.jsx                ← /manage/:eventId/analytics
    │
    ├── post/
    │   └── NewPost.jsx                  ← /post/create
    │
    ├── lobby/
    │   └── TeamLobby.jsx                ← /event/:id/teams
    │
    ├── notifications/
    │   └── Notifications.jsx            ← /notifications
    │
    ├── settings/
    │   └── Settings.jsx                 ← /settings
    │
    ├── business/
    │   └── Business.jsx                 ← /recruit  (Recruiter Dashboard)
    │
    ├── admin/
    │   └── AdminPanel.jsx               ← /admin
    │
    ├── verify/
    │   └── VerifyCertificate.jsx        ← /verify/:certId  (public, no auth)
    │
    └── PlaceholderScreen.jsx            ← fallback for unbuilt screens
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📋 COMPLETE ROUTE TABLE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Route | File | Guard | Notes |
|-------|------|-------|-------|
| `/splash` | `auth/Splash.jsx` | GuestGuard | First screen |
| `/auth/participant/login` | `auth/ParticipantLoginAuth.jsx` | GuestGuard | |
| `/auth/participant/register` | `auth/ParticipantRegisterAuth.jsx` | GuestGuard | |
| `/auth/org/login` | `auth/OrgLoginAuth.jsx` | GuestGuard | |
| `/auth/org/register` | `auth/OrgRegisterAuth.jsx` | GuestGuard | Handles pending state internally |
| `/onboarding/1` | `onboarding/Onboarding.jsx` | AuthGuard + !onboardingDone | |
| `/onboarding/2` | `onboarding/OnboardingStep2.jsx` | AuthGuard + !onboardingDone | |
| `/onboarding/3` | `onboarding/OnboardingStep3.jsx` | AuthGuard + !onboardingDone | |
| `/onboarding/4` | `onboarding/OnboardingStep4.jsx` | AuthGuard + !onboardingDone | |
| `/onboarding/5` | `onboarding/OnboardingStep5.jsx` | AuthGuard + !onboardingDone | |
| `/onboarding/6` | `onboarding/OnboardingStep6.jsx` | AuthGuard + !onboardingDone | |
| `/feed` | `feed/Feed.jsx` | AuthGuard | Home base |
| `/explore` | `explore/Explore.jsx` | AuthGuard | |
| `/event/:id` | `event/EventDetail.jsx` | AuthGuard | Polymorphic by event.type |
| `/event/create` | `create/CreateEvent.jsx` | OrgGuard | |
| `/event/:id/teams` | `lobby/TeamLobby.jsx` | AuthGuard | |
| `/profile/:username` | `profile/PlayerProfile.jsx` | AuthGuard | |
| `/profile/me` | `profile/PlayerProfile.jsx` | AuthGuard | Own profile shortcut |
| `/profile/edit` | `editprofile/EditProfile.jsx` | AuthGuard | |
| `/org/:orgId` | `org/OrgProfile.jsx` | AuthGuard | |
| `/org/setup` | `orgsetup/OrgSetup.jsx` | OrgGuard | Post-approval onboarding |
| `/passport/:username` | `passport/PlayerPassport.jsx` | AuthGuard | |
| `/scoreboard` | `scoreboard/Scoreboard.jsx` | AuthGuard | Gamification + leaderboard |
| `/chat` | `chat/Chat.jsx` | AuthGuard | All chats list |
| `/chat/:eventId` | `chat/Chat.jsx` | AuthGuard | Event-specific chat |
| `/stories/:orgId` | `story/Story.jsx` | AuthGuard | mode="view" |
| `/stories/create` | `story/Story.jsx` | OrgGuard | mode="create" |
| `/qr/:eventId` | `qr/QREntry.jsx` | AuthGuard | mode auto-detected by role |
| `/volunteer/:eventId` | `volunteer/VolunteerMode.jsx` | AuthGuard + approved volunteer | |
| `/manage/:eventId` | `command/CommandCenter.jsx` | OrgGuard | |
| `/manage/:eventId/analytics` | `analytics/Analytics.jsx` | OrgGuard | |
| `/post/create` | `post/NewPost.jsx` | OrgGuard | |
| `/notifications` | `notifications/Notifications.jsx` | AuthGuard | |
| `/settings` | `settings/Settings.jsx` | AuthGuard | |
| `/recruit` | `business/Business.jsx` | AuthGuard | Recruiter dashboard |
| `/admin` | `admin/AdminPanel.jsx` | AdminGuard | |
| `/verify/:certId` | `verify/VerifyCertificate.jsx` | None | Public |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔘 EVERY BUTTON — EVERY SCREEN
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### SPLASH  `/splash`

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| "JOIN THE GAME" | `/auth/participant/register` | Slide up |
| "I HAVE AN ACCOUNT" | Opens inline modal: "Who are you?" → Participant → `/auth/participant/login` / Org → `/auth/org/login` | Modal |
| "Join as Organization △" | `/auth/org/register` | Slide up |

---

### PARTICIPANT LOGIN  `/auth/participant/login`

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| "ENTER □" (submit) | `/feed` or `/onboarding/1` if first login | Fade |
| "FORGOT ACCESS?" | Password reset modal inline | — |
| "CONTINUE WITH GOOGLE" | Same logic as ENTER | OAuth |
| "Don't have an account?" | `/auth/participant/register` | Cross-fade |
| "Log in as Organization" | `/auth/org/login` | Cross-fade |
| ← Back | `/splash` | Slide right |

---

### PARTICIPANT REGISTER  `/auth/participant/register`

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| "CLAIM YOUR SPOT ○" (submit) | `/onboarding/1` | Coral flash → Step 1 |
| "Already have an account?" | `/auth/participant/login` | Cross-fade |
| "Register as Organization" | `/auth/org/register` | Cross-fade |
| ← Back | `/splash` | Slide right |
| "I am a Student" toggle ON | Reveals University + Year fields inline | No nav |

---

### ORG LOGIN  `/auth/org/login`

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| "ENTER □" (submit) | `/feed` if setup done / `/org/setup` if first time | Fade |
| "FORGOT ACCESS?" | Password reset modal inline | — |
| "CONTINUE WITH GOOGLE" | Same logic as ENTER | OAuth |
| "Don't have an account?" | `/auth/org/register` | Cross-fade |
| "Log in as Participant" | `/auth/participant/login` | Cross-fade |
| ← Back | `/splash` | Slide right |

---

### ORG REGISTER  `/auth/org/register`

**STATE A — Form:**

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| "REQUEST ACCESS △" (submit) | STATE B (pending) — same URL, no route change | Form → pending card |
| "Already have an account?" | `/auth/org/login` | Cross-fade |
| "Register as Participant" | `/auth/participant/register` | Cross-fade |
| ← Back | `/splash` | Slide right |

**STATE B — Pending (after submit):**

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| "Upload additional documents" | File picker inline | No nav |
| "Contact admin" | mailto: | System |
| Admin approves (WebSocket event) | `/org/setup` | Auto-redirect, teal sweep |
| Admin rejects (WebSocket event) | Back to STATE A + reason shown | Auto-redirect |

---

### ONBOARDING STEP 1  `/onboarding/1`
`Onboarding.jsx`

| Button | navigateTo |
|--------|-----------|
| "BEGIN YOUR JOURNEY ○" | `/onboarding/2` |
| (No back button) | — |

---

### ONBOARDING STEP 2  `/onboarding/2`
`OnboardingStep2.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | `/onboarding/1` |
| "SAVE & CONTINUE △" | `/onboarding/3` |

---

### ONBOARDING STEP 3  `/onboarding/3`
`OnboardingStep3.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | `/onboarding/2` |
| "CONTINUE □" | `/onboarding/4` |

---

### ONBOARDING STEP 4  `/onboarding/4`
`OnboardingStep4.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | `/onboarding/3` |
| "CONTINUE ◇" | `/onboarding/5` |

---

### ONBOARDING STEP 5  `/onboarding/5`
`OnboardingStep5.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | `/onboarding/4` |
| "+ FOLLOW" per org card | Follow inline (optimistic) |
| "FOLLOW ALL IN MY CATEGORY" | Follow all inline |
| "CONTINUE ◇" | `/onboarding/6` |
| "Skip" | `/onboarding/6` |

---

### ONBOARDING STEP 6  `/onboarding/6`
`OnboardingStep6.jsx`

| Button | navigateTo | Notes |
|--------|-----------|-------|
| ← Back | `/onboarding/5` | |
| "REGISTER NOW ○" on event card | `/feed` | Set onboardingComplete=true, confetti burst |
| "EXPLORE MORE EVENTS △" | `/feed` | Same |
| "ENTER THE ARENA □" | `/feed` | Same |

---

### FEED  `/feed`
`feed/Feed.jsx`

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| **Search bar** (tap) | `/explore` with search focused | Push right |
| **Notification bell** | `/notifications` | Slide down |
| **Own avatar (top right)** | `/profile/me` | Slide right |
| **Story ring** (any org) | `/stories/:orgId` | Expand from circle |
| **"+ ADD STORY"** | `/stories/create` | Slide up |
| **Event card** (tap body/image) | `/event/:id` | layoutId morph expand |
| **"REGISTER ○"** on card | Register inline (optimistic) — no nav | Button → "YOU'RE IN ✓" |
| **"SAVE △"** on card | Save to wishlist inline | Icon fill |
| **"SHARE □"** on card | Native share sheet | System |
| **Organizer name/avatar** on card | `/org/:orgId` | Slide right |
| **Location chip** on card | Map modal inline | Modal |
| **Swipe card RIGHT** | Save to wishlist inline | Gold star |
| **Swipe card LEFT** | Hide card (teaches algo) | Card slides out |
| **FAB □** (verified org) | `/event/create` | Slide up |
| **FAB □** (non-org) | Tooltip inline | No nav |
| **[LOCAL ○]** toggle | Reload feed: local events | Cards slide in |
| **[NATIONAL △]** toggle | Reload feed: national | Cards slide in |
| **[INTERNATIONAL □]** toggle | Travel mode inline | Banner slides in |

**BottomNav (on all authenticated screens via AppShell):**

| Tab | navigateTo |
|-----|-----------|
| ○ FEED | `/feed` |
| △ EXPLORE | `/explore` |
| □ MY EVENTS | `/profile/me` (events tab active) |
| ◇ PROFILE | `/profile/me` |
| ⬡ CHAT | `/chat` |

---

### EXPLORE  `/explore`
`explore/Explore.jsx`

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| Search input (type) | Results inline | No nav |
| Filter pills | Filter results inline | No nav |
| [LIST □] / [MAP ○] toggle | Switch view inline | No nav |
| Trending event card | `/event/:id` | Morph |
| Org card | `/org/:orgId` | Slide right |
| "FOLLOW +" on org | Follow inline | → "FOLLOWING ✓" |
| Skill tag | Filter by skill inline | No nav |
| Map pin (tap) | Mini popup inline | No nav |
| "REGISTER ○" in popup | Register inline | No nav |
| Event card in results | `/event/:id` | Morph |
| Player card | `/profile/:username` | Slide right |
| "CONNECT △" on player | Send request inline | → "PENDING" |

---

### EVENT DETAIL  `/event/:id`
`event/EventDetail.jsx`

> This single file renders all 4 event types. It reads `event.type` and conditionally renders the polymorphic section inside the INFO tab. Do NOT create separate route files for each type — keep them as internal conditional renders.

**Universal (all types):**

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| ← Back | Previous (history.back()) | Reverse morph |
| Share □ | Native share | System |
| Save △ | Wishlist inline | — |
| Organizer avatar/name | `/org/:orgId` | Slide right |
| **"ENTER THE GAME ○"** (default) | Register inline → button → "YOU'RE IN ✓" | No nav |
| **"JOIN WAITLIST △"** (when full) | Waitlist inline | No nav |
| **"MANAGE THIS EVENT □"** (org only) | `/manage/:id` | Slide right |
| **"SCAN IN ○"** (participant/volunteer, registered) | `/qr/:eventId` | Slide up |

**Tab bar (no route change, inline):**

| Tab | Shows |
|-----|-------|
| ○ INFO | Description + polymorphic section |
| △ COMMUNITY | Chat preview, friends, travel |
| □ VOLUNTEERS | Roles + apply buttons |
| ◇ SPONSORS | Sponsor logos |

**INFO tab — SPORT type:**

| Button | navigateTo |
|--------|-----------|
| "JOIN A TEAM △" | `/event/:id/teams` |

**INFO tab — SCIENCE type:**

| Button | navigateTo |
|--------|-----------|
| "SUBMIT ABSTRACT □" | File upload drawer inline |
| DOI links | External URL |

**INFO tab — CHARITY type:**

| Button | navigateTo |
|--------|-----------|
| "DONATE ◇" | Payment modal inline |
| "APPLY △" on shift | Apply inline → PENDING status |

**INFO tab — CULTURAL type:**

| Button | navigateTo |
|--------|-----------|
| "SELECT" on ticket tier | Booking drawer inline |

**COMMUNITY tab:**

| Button | navigateTo |
|--------|-----------|
| "JOIN LOBBY CHAT ○" | `/chat/:eventId` |
| "JOIN TRAVEL GROUP △" | `/chat/:eventId?channel=travel` |
| "GENERATE VISA SUPPORT LETTER ○" | PDF modal inline |

**VOLUNTEERS tab:**

| Button | navigateTo |
|--------|-----------|
| "APPLY △" on role | Apply inline → status → PENDING |

---

### QR ENTRY  `/qr/:eventId`
`qr/QREntry.jsx`

> **One file, two modes.** Mode is determined by the user's role when they arrive:
> - `role === ORGANIZER` → **GENERATE mode** (display QR for others to scan)
> - `role === PARTICIPANT || VOLUNTEER` → **SCAN mode** (camera to scan org's QR)

**GENERATE mode (org sees this):**

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| ← Back | `/manage/:eventId` | Slide right |
| QR code | Static display, auto-refresh every 60s | — |
| "FULL SCREEN MODE □" | Maximizes QR inline | No nav |
| "MANUAL CHECK-IN □" | Player search modal inline | — |
| Live check-in feed | Auto-updates via WebSocket | No nav |

**SCAN mode (participant/volunteer sees this):**

| Button / Element | navigateTo | Notes |
|-----------------|-----------|-------|
| ← Back | `/event/:id` | Slide right |
| Camera viewfinder | — | Live camera |
| Successful scan (200) | `/event/:id` after 3s | Mint flash + XP popup |
| Already scanned (409) | `/event/:id` after 2s | "ALREADY CHECKED IN ✓" overlay |
| Not registered (403) | `/event/:id` after 2s | Coral overlay |

---

### VOLUNTEER MODE  `/volunteer/:eventId`
`volunteer/VolunteerMode.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | `/event/:id` |
| "OPEN SCANNER ○" | `/qr/:eventId` (SCAN mode — they are participant/volunteer, not org) |
| "OPEN STAFF CHAT △" | `/chat/:eventId?channel=staff` |
| Task checkbox | Mark done inline |
| "WALKIE TALKIE" (hold) | Broadcast voice to #staff-only |

---

### PLAYER PROFILE  `/profile/:username`  or  `/profile/me`
`profile/PlayerProfile.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | Previous screen |
| "EDIT PROFILE" (own) | `/profile/edit` |
| "CONNECT △" (other) | Send request inline |
| "MESSAGE □" (other) | `/chat` (DM) |
| Event card in passport | `/event/:id` |
| "CERTIFICATE ISSUED" badge | `/verify/:certId` modal |
| "DOWNLOAD FULL PASSPORT PDF" | PDF modal inline |
| "VIEW FULL PASSPORT" | `/passport/:username` |
| Volunteer Mode toggle | Teal sweep inline, unlocks volunteer UI |
| Badge (unlocked) | Badge detail modal inline |
| "SHARE PROFILE" | Native share |

---

### PLAYER PASSPORT  `/passport/:username`
`passport/PlayerPassport.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | `/profile/:username` |
| "DOWNLOAD PDF □" | PDF download modal inline |
| Event in timeline | `/event/:id` |
| Org link | `/org/:orgId` |
| "VERIFY ONLINE →" on cert | `/verify/:certId` |

---

### SCOREBOARD  `/scoreboard`
`scoreboard/Scoreboard.jsx`

| Button | navigateTo |
|--------|-----------|
| Player row in leaderboard | `/profile/:username` |
| Badge (unlocked) | Badge detail modal inline |
| Badge (locked) | "How to unlock" tooltip inline |
| Notification bell | `/notifications` |

---

### CHAT  `/chat`  or  `/chat/:eventId`
`chat/Chat.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back / close | Previous screen |
| Channel in sidebar | Switch channel inline |
| "#staff-only ◇" (locked) | Tooltip inline |
| "+ NEW DM ○" | User search modal inline |
| Player name in message | `/profile/:username` |
| "SEND FLASH ALERT 🔴" (org) | Expands broadcast field inline |
| "BROADCAST △" | Confirmation modal → send |
| Attachment / Image / Poll icons | System picker / modal |
| "WALKIE TALKIE" (hold) | Broadcast voice to #staff-only |

**Chat input bar (IMPORTANT — these were broken):**

| Element | Action |
|---------|--------|
| Text input | Type message |
| **Send button (→ or □)** | Send message via WebSocket — NO navigation |
| Attachment □ | File picker |
| Image ○ | Photo picker |
| Poll △ | Poll creator modal inline |

---

### STORY  `/stories/:orgId`  or  `/stories/create`
`story/Story.jsx`

**VIEW mode:**

| Button | navigateTo |
|--------|-----------|
| ✕ Close | Previous screen (shrink to ring) |
| Tap left half | Previous frame |
| Tap right half | Next frame or close |
| Long press | Pause |
| Swipe down | Close |
| "ENTER THE GAME ○" CTA | `/event/:id` |
| "FOLLOW +" / "FOLLOWING ✓" | Follow inline |
| Poll option | Vote inline |
| Reaction buttons | Float emoji inline |
| "SEND MESSAGE □" | Quick reply input inline |

**CREATE mode:**

| Button | navigateTo |
|--------|-----------|
| "DISCARD ✗" | Back to capture |
| "NEXT → AUDIENCE" | Audience step inline |
| "POST ◇" | Post → back to `/feed`. Toast: "Story Live." |

---

### NOTIFICATIONS  `/notifications`
`notifications/Notifications.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | Previous screen |
| "MARK ALL READ ○" | Mark all read inline |
| Filter tabs | Filter inline |
| "VIEW EVENT ○" | `/event/:id` |
| "FOLLOW BACK" | Follow inline |
| "ACCEPT △" volunteer | Accept inline |
| "REJECT" volunteer | Reject inline |
| "ACCEPT △" Golden Ticket | Golden Ticket modal inline |
| "DECLINE □" Golden Ticket | Decline inline |
| "VIEW BADGE ◇" | Badge detail modal inline |
| "VIEW ORG PROFILE □" | `/org/:orgId` |

---

### SETTINGS  `/settings`
`settings/Settings.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | Previous screen |
| "Edit Profile →" | `/profile/edit` |
| "Block list" | Modal inline |
| "DOWNLOAD MY DATA □" | Confirmation modal |
| "DEACTIVATE ACCOUNT △" | Confirmation modal |
| "DELETE ACCOUNT ✗" | Type-to-confirm modal |
| "LOG OUT" | Clear auth → `/splash` |

---

### ORG PROFILE  `/org/:orgId`
`org/OrgProfile.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | Previous screen |
| "FOLLOW +" | Follow inline |
| "NOTIFY ME □" | Enable notifications inline |
| "MESSAGE △" | `/chat` DM |
| "REPORT ◇" | Report modal inline |
| Past event card | `/event/:id` |
| "MANAGE ORG □" (own org) | `/manage/:eventId` or org settings |
| "CREATE EVENT □" (own org) | `/event/create` |
| "POST UPDATE □" (own org) | `/post/create` |

---

### COMMAND CENTER  `/manage/:eventId`
`command/CommandCenter.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | `/feed` |
| "SWITCH EVENT ◇" | Same route, new :id |
| "SEND FLASH ALERT 🔴" | Expand broadcast field inline |
| "BROADCAST NOW □" | Confirmation → send |
| "EXPORT ATTENDEE LIST □" | Download CSV/PDF |
| "OPEN STAFF CHAT △" | `/chat/:eventId?channel=staff` |
| "VIEW ANALYTICS □" | `/manage/:eventId/analytics` |
| **"SHOW QR CODE □"** | `/qr/:eventId` (GENERATE mode — org) |

---

### CREATE EVENT  `/event/create`
`create/CreateEvent.jsx`

| Button | Step | navigateTo |
|--------|------|-----------|
| ✕ close / ← Back | All | Confirm discard → `/feed` |
| "NEXT →" | End of 1/2/3 | Next step inline |
| Completed step indicator | Any | Jump to that step inline |
| "SAVE AS DRAFT □" | Step 4 | Save → `/feed`. Toast: "Draft saved." |
| "SCHEDULE LAUNCH △" | Step 4 | Date picker inline → schedule → `/feed` |
| "LAUNCH NOW ▶" | Step 4 | Confirm modal → confetti → `/event/:newId` |
| "VIEW EVENT" (post-launch) | Success | `/event/:newId` |
| "SHARE TO STORIES" (post-launch) | Success | `/stories/create` pre-linked |

---

### NEW POST  `/post/create`
`post/NewPost.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back / ✕ | Previous screen |
| Tab "□ STORY" | Redirect to `/stories/create` |
| "SAVE DRAFT □" | Save → close. Toast. |
| "SCHEDULE △" | Date picker inline → schedule |
| "PUBLISH NOW ▶" | Post → `/org/:orgId`. Toast: "Posted." |

---

### TEAM LOBBY  `/event/:id/teams`
`lobby/TeamLobby.jsx`

| Button | navigateTo |
|--------|-----------|
| ← Back | `/event/:id` (Community tab) |
| "CREATE A TEAM □" | Create team drawer inline |
| "CREATE □" in drawer | Create inline → team appears |
| "SHARE JOIN LINK △" | Native share |
| "TEAM CHAT □" | `/chat/:eventId?channel=team-{id}` |
| "JOIN △" on team card | Join inline (or PENDING if invite-only) |
| "INVITE △" on solo player | Send invite inline |

---

### BUSINESS / RECRUITER  `/recruit`
`business/Business.jsx`

| Button | navigateTo |
|--------|-----------|
| "RUN SEARCH ◇" | Results inline |
| "VIEW PROFILE ○" | `/profile/:username` |
| "GOLDEN TICKET △" | Golden ticket drawer inline |
| "SEND OFFER ◇" | Send → status → "AWAITING RESPONSE" |
| "SPONSOR THIS EVENT ◇" | Sponsorship section inline |

---

### ADMIN PANEL  `/admin`
`admin/AdminPanel.jsx`

| Sidebar item | Shows |
|-------------|-------|
| □ OVERVIEW | Overview panel |
| ○ VERIFICATION QUEUE | Queue panel |
| △ LIVE MAP | Map panel |
| ◇ USER MANAGEMENT | Users panel |
| ⬡ CONTENT FLAGS | Flags panel |
| ▲ PLATFORM ANALYTICS | Analytics panel |
| ● SYSTEM HEALTH | Health panel |
| ← LOGOUT | Clear auth → `/splash` |

| Button | Action |
|--------|--------|
| "APPROVE ✓" | Approve org → notification sent |
| "REJECT ✗" | Reject + reason → notification sent |
| "VIEW PROFILE ○" | Open `/profile/:username` |
| "SUSPEND △" | Duration picker → suspend |
| "BAN □" | Confirm + reason → ban |
| "PROMOTE ◇" | Region picker → promote to local admin |

---

### VERIFY CERTIFICATE  `/verify/:certId`
`verify/VerifyCertificate.jsx`

| Button | navigateTo |
|--------|-----------|
| "DOWNLOAD △" | Download PDF |
| "VIEW PLAYER PROFILE ○" | `/profile/:username` |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔁 COMPLETE USER JOURNEY FLOWS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### FLOW A — New Participant
```
/splash
→ "JOIN THE GAME"
/auth/participant/register
→ "CLAIM YOUR SPOT"
/onboarding/1 → /onboarding/2 → /onboarding/3 → /onboarding/4 → /onboarding/5 → /onboarding/6
→ "ENTER THE ARENA"
/feed  ← home base for all future logins
```

### FLOW B — Returning Participant
```
/splash
→ "I HAVE AN ACCOUNT" → [modal] → "Participant"
/auth/participant/login
→ "ENTER"
/feed  ← direct (onboarding already complete)
```

### FLOW C — New Organization
```
/splash
→ "Join as Organization △"
/auth/org/register
→ "REQUEST ACCESS"
[same screen — pending state shows]
→ [admin approves — WebSocket]
/org/setup
→ "COMPLETE SETUP"
/feed  ← org capabilities now active
```

### FLOW D — Register + Check In to an Event (Participant)
```
/feed → tap event card
/event/:id → "ENTER THE GAME ○"  [registered inline]
            → "SCAN IN ○"
/qr/:eventId  [SCAN mode — camera opens]
→ scan org's displayed QR
→ [200 success] mint flash + XP popup → /event/:id after 3s
```

### FLOW E — Volunteer Check-In Flow
```
/event/:id → VOLUNTEERS tab → "APPLY △"
[approved via notification]
/volunteer/:eventId  [task list + scanner access]
→ "OPEN SCANNER ○"
/qr/:eventId  [SCAN mode — same scanner as participant]
→ scan org's QR → confirmed
```

### FLOW F — Organizer Runs Check-In
```
/manage/:eventId  [Command Center]
→ "SHOW QR CODE □"
/qr/:eventId  [GENERATE mode — large QR displayed]
[participants + volunteers arrive and scan from their phones]
[live check-in feed updates on org's screen via WebSocket]
```

### FLOW G — Create and Launch Event
```
/feed → FAB □
/event/create
→ Step 1: type → Step 2: details → Step 3: gamification → Step 4: review
→ "LAUNCH NOW ▶" → confirm
→ confetti burst → /event/:newId
```

### FLOW H — Org Live Day
```
/manage/:eventId
→ "SHOW QR CODE □" → /qr/:eventId (their screen shows QR)
→ "OPEN STAFF CHAT △" → /chat/:eventId?channel=staff
→ "SEND FLASH ALERT 🔴" → broadcast inline
→ "VIEW ANALYTICS □" → /manage/:eventId/analytics
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚡ TRANSITION CHEAT SHEET
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Transition | When | Framer Motion |
|-----------|------|---------------|
| Slide left | Going forward / deeper | `x: ['100%', '0%']` enter / `x: ['0%', '-100%']` exit |
| Slide right | Going back | `x: ['-100%', '0%']` enter / `x: ['0%', '100%']` exit |
| Slide up | Modal, drawer, story create | `y: ['100%', '0%']` enter |
| Slide down | Notifications, top drawers | `y: ['-100%', '0%']` enter |
| Morph expand | Feed card → Event Detail | `layoutId` shared on card + detail hero |
| Shrink to ring | Close story viewer | Reverse of expand to story ring |
| Fade | Auth flows, post-action | `opacity: [0, 1]` |
| Coral full-screen flash | Post-registration | bg fills 150ms then fades |
| Mint full-screen flash | Successful QR scan | bg fills 150ms then fades |
| Teal sweep | Volunteer mode ON | `scaleX: [0, 1]` L→R, teal bg |
| Shape burst | Onboarding complete / event launch | ○△□◇ burst outward |
| Cross-fade | Auth tab switches | `opacity: [0,1]` on new, `[1,0]` on old |
| None / instant | Filter changes, tab switches | No animation |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🚨 LOGIC INJECTION PROMPT
## For Claude in Antigravity — Fix Static Screens
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> **How to use:** Paste this prompt into Claude in Antigravity for each screen you want to fix.
> Replace `[SCREEN_NAME]` and `[FILE_PATH]` with the actual values.
> The design must NOT change — only logic and navigation are added.

---

```
TASK: Add interactivity and navigation logic to [SCREEN_NAME].
FILE: src/screens/[FILE_PATH]

CRITICAL RULES:
1. DO NOT change any CSS, colors, fonts, sizes, spacing, or visual layout.
2. DO NOT redesign any component. The Figma-accurate pixel-perfect design is final.
3. ONLY add: onClick handlers, useNavigate, useState for interactive states,
   and any missing imports.
4. Use React Router's useNavigate hook for all navigation.
5. Use useState for optimistic UI (button state changes like REGISTER → YOU'RE IN ✓).

NAVIGATION TO ADD:
[paste the relevant button table from this reference for that screen]

SPECIFIC FIXES FOR THIS SCREEN:
[paste the specific broken items listed below]

After editing, verify:
- No visual change of any kind
- All buttons navigate to correct routes
- No console errors
- File still imports and renders correctly
```

---

### Specific fixes per screen (paste into prompt above):

**Feed.jsx:**
```
- Search bar onClick → navigate('/explore') — currently does nothing
- Notification bell onClick → navigate('/notifications')
- Own avatar (top right) onClick → navigate('/profile/me')
- Story rings onClick → navigate('/stories/' + org.id)
- "ADD STORY" onClick → navigate('/stories/create')
- Event card body onClick → navigate('/event/' + event.id)
  (use Framer Motion layoutId="event-card-"+event.id on the card,
   same layoutId on the hero image in EventDetail.jsx)
- "REGISTER ○" button: add useState(false) for registered state.
  onClick → setRegistered(true). Render "YOU'RE IN ✓" when registered===true.
- Organizer name/avatar onClick → navigate('/org/' + event.orgId)
- Bottom nav is in BottomNav.jsx — verify all 5 tabs navigate correctly:
  ○ → /feed, △ → /explore, □ → /profile/me (events tab), ◇ → /profile/me, ⬡ → /chat
- [LOCAL/NATIONAL/INTERNATIONAL] toggles: useState for active toggle.
  onClick on each changes active state. INTERNATIONAL toggle shows travel banner.
- FAB □ button: if user.role === 'organizer' → navigate('/event/create')
  else → show tooltip state inline (no navigate)
```

**EventDetail.jsx:**
```
- ← Back button onClick → navigate(-1) [browser back]
- Organizer avatar/name onClick → navigate('/org/' + event.orgId)
- "ENTER THE GAME ○" button: useState(registered=false).
  onClick → setRegistered(true). Render teal "YOU'RE IN ✓" when true.
- "SCAN IN ○" button (show only if registered===true):
  onClick → navigate('/qr/' + eventId)
- "MANAGE THIS EVENT □" button (show only if user.role==='organizer'):
  onClick → navigate('/manage/' + eventId)
- Tab bar [INFO/COMMUNITY/VOLUNTEERS/SPONSORS]:
  useState(activeTab='info'). onClick each → setActiveTab('info'|'community'|'volunteers'|'sponsors').
  Conditionally render each tab's content based on activeTab.
- COMMUNITY tab → "JOIN LOBBY CHAT ○" onClick → navigate('/chat/' + eventId)
- SPORT type → "JOIN A TEAM △" onClick → navigate('/event/' + eventId + '/teams')
- event.type determines which polymorphic section to render in INFO tab:
  if (event.type === 'sport') render SportSection
  if (event.type === 'science') render ScienceSection
  if (event.type === 'charity') render CharitySection
  if (event.type === 'cultural') render CulturalSection
  (Currently renders only one static version — add the conditional)
```

**Chat.jsx:**
```
- Send button onClick → call sendMessage(inputValue). Clear input after send.
  DO NOT navigate. Message should appear in the chat list (useState for messages array).
- Channel items in sidebar onClick → useState(activeChannel). Switch active channel.
- "+ NEW DM ○" onClick → show user search modal inline (useState showDMModal)
- Player name/avatar in message onClick → navigate('/profile/' + player.username)
- "SEND FLASH ALERT 🔴" onClick → toggle useState(showBroadcast). Expands textarea.
- "BROADCAST △" onClick → send flash alert via API. Hide broadcast area.
- Attachment □ onClick → trigger file input ref (hidden input, type="file")
- Image ○ onClick → trigger image input ref (hidden input, type="file", accept="image/*")
- Poll △ onClick → useState(showPollModal=true)
```

**Notifications.jsx:**
```
- ← Back onClick → navigate(-1)
- "MARK ALL READ ○" onClick → mark all read (optimistic: setState clears all unread dots)
- Filter tabs: useState(activeFilter='all'). onClick each → setActiveFilter.
- "VIEW EVENT ○" onClick → navigate('/event/' + notification.eventId)
- "FOLLOW BACK" onClick → follow inline (optimistic setState)
- "VIEW ORG PROFILE □" onClick → navigate('/org/' + notification.orgId)
- Notification bell on profile/scoreboard → navigate('/notifications')
```

**BottomNav.jsx:**
```
- Verify all 5 tab onClick handlers use useNavigate:
  ○ FEED onClick → navigate('/feed')
  △ EXPLORE onClick → navigate('/explore')
  □ MY EVENTS onClick → navigate('/profile/me') — or scroll to events tab
  ◇ PROFILE onClick → navigate('/profile/me')
  ⬡ CHAT onClick → navigate('/chat')
- Active tab: read current route with useLocation().pathname.
  Highlight the tab whose route matches current path.
- This component is rendered by AppShell.jsx — it must be OUTSIDE the page scroll container so it stays fixed at bottom.
```

**Splash.jsx:**
```
- "JOIN THE GAME" onClick → navigate('/auth/participant/register')
- "I HAVE AN ACCOUNT" onClick → useState(showModal=true). Show inline modal with two options.
  Modal option "Participant" onClick → navigate('/auth/participant/login')
  Modal option "Organization" onClick → navigate('/auth/org/login')
- "Join as Organization △" onClick → navigate('/auth/org/register')
- Carousel slide dots onClick → useState(activeSlide). Switch carousel slide.
- Auto-advance carousel: useEffect → setInterval(3000) → advance slide.
```

**ParticipantLoginAuth.jsx / OrgLoginAuth.jsx:**
```
- Form onSubmit → call login API. On success: navigate('/feed') or navigate('/onboarding/1')
- "FORGOT ACCESS?" onClick → useState(showResetModal=true)
- "Don't have an account?" link onClick → navigate to matching register route
- "Log in as Organization" / "Log in as Participant" link onClick → navigate to other login
- ← Back onClick → navigate('/splash')
- Password eye toggle: useState(showPassword=false). onClick → toggle. Change input type.
```

**ParticipantRegisterAuth.jsx:**
```
- Form onSubmit → call register API. On success: navigate('/onboarding/1')
- "I am a Student" toggle: useState(isStudent=false). onClick → toggle.
  Conditionally render University + Year fields based on isStudent.
- "Already have an account?" onClick → navigate('/auth/participant/login')
- "Register as Organization" onClick → navigate('/auth/org/register')
- ← Back onClick → navigate('/splash')
- Password strength bar: useEffect on password value → compute strength → setState
```

**OrgRegisterAuth.jsx:**
```
- Form onSubmit → call register API. On success: setState({pending: true}) — no navigate.
  Show pending UI inline (STATE B).
- "Upload additional documents" onClick → trigger file input inline
- "Contact admin" onClick → open mailto link
- WebSocket listener: on 'org_approved' event → navigate('/org/setup')
- WebSocket listener: on 'org_rejected' event → setState({pending: false, rejectionReason: reason})
- "Already have an account?" onClick → navigate('/auth/org/login')
- ← Back onClick → navigate('/splash')
```

**Onboarding.jsx (Step 1):**
```
- "BEGIN YOUR JOURNEY ○" onClick → navigate('/onboarding/2')
- No back button — this is intentional.
```

**OnboardingStep2 through OnboardingStep6:**
```
- Each step: ← Back onClick → navigate('/onboarding/' + (currentStep - 1))
- Each step: Continue/Next button onClick → navigate('/onboarding/' + (currentStep + 1))
- Step 6 all three buttons → navigate('/feed') after setting onboardingComplete=true in auth context
```
```

---

> *"The game has already begun. Every screen is a level. Every tap is a move."*
>
> Eventfy Navigation Reference v3.0
> Use alongside Figma MCP for pixel-perfect + fully interactive screens.