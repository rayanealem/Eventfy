# EVENTFY — COMPLETE NAVIGATION & ROUTING REFERENCE
## Every Screen · Every Button · Every Transition
### For use with Figma MCP + Claude in Antigravity

---

> **How to read this file:**
> Each screen has:
> - 📁 **FILE PATH** — the exact component file location in your React project
> - 🔗 **ROUTE** — the URL path used by React Router
> - 🔘 **BUTTONS** — every interactive element and exactly where it navigates
> - ➡️ **TRANSITIONS** — the animation/motion type for each navigation
> - 🔒 **GUARDS** — authentication/role checks before entering this screen

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🗺️ ROUTING ARCHITECTURE OVERVIEW
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
src/
├── App.jsx                          ← Root router
├── router/
│   ├── index.jsx                    ← All route definitions
│   ├── guards/
│   │   ├── AuthGuard.jsx            ← Redirects unauthenticated → /splash
│   │   ├── GuestGuard.jsx           ← Redirects authenticated → /feed
│   │   ├── OrgGuard.jsx             ← Redirects non-orgs → /feed
│   │   ├── VolunteerGuard.jsx       ← Redirects non-volunteers → /feed
│   │   └── AdminGuard.jsx           ← Redirects non-admins → /feed
│   └── transitions.js               ← Framer Motion page variants
└── screens/
    ├── auth/
    │   ├── Splash.jsx                    ← /splash
    │   ├── OrgLoginAuth.jsx              ← /auth/org/login
    │   ├── OrgRegisterAuth.jsx           ← /auth/org/register (includes pending state)
    │   ├── ParticipantRegisterAuth.jsx   ← /auth/participant/register
    │   └── ParticipantLoginAuth.jsx      ← /auth/participant/login
    ├── onboarding/
    │   ├── Step1PlayerNumber.jsx    ← /onboarding/1
    │   ├── Step2Appearance.jsx      ← /onboarding/2
    │   ├── Step3Skills.jsx          ← /onboarding/3
    │   ├── Step4Arena.jsx           ← /onboarding/4
    │   ├── Step5Allies.jsx          ← /onboarding/5
    │   └── Step6FirstMission.jsx    ← /onboarding/6
    ├── feed/
    │   └── Feed.jsx                 ← /feed
    ├── event/
    │   ├── EventDetail.jsx          ← /event/:id
    │   ├── variants/
    │   │   ├── SportDetail.jsx      ← rendered inside EventDetail when type=sport
    │   │   ├── ScienceDetail.jsx    ← rendered inside EventDetail when type=science
    │   │   ├── CharityDetail.jsx    ← rendered inside EventDetail when type=charity
    │   │   └── CulturalDetail.jsx   ← rendered inside EventDetail when type=cultural
    │   └── CreateEvent.jsx          ← /event/create
    ├── explore/
    │   └── Explore.jsx              ← /explore
    ├── profile/
    │   ├── PlayerProfile.jsx        ← /profile/:username
    │   ├── OrgProfile.jsx           ← /org/:orgId
    │   └── EditProfile.jsx          ← /profile/edit
    ├── gamification/
    │   ├── GamificationHub.jsx      ← /hub
    │   └── Leaderboard.jsx          ← /hub/leaderboard
    ├── chat/
    │   └── Chat.jsx                 ← /chat/:eventId?
    ├── stories/
    │   ├── StoryViewer.jsx          ← /stories/:orgId
    │   └── StoryCreate.jsx          ← /stories/create
    ├── qr/
    │   ├── QRTicket.jsx             ← /ticket/:eventId (org generates QR for check-in)
    │   └── QRScanner.jsx            ← /scan (participant/volunteer scans org's QR to check in)
    ├── volunteer/
    │   └── VolunteerMode.jsx        ← /volunteer/:eventId
    ├── organizer/
    │   ├── CommandCenter.jsx        ← /manage/:eventId
    │   ├── Analytics.jsx            ← /manage/:eventId/analytics
    │   ├── NewPost.jsx              ← /post/create
    │   └── OrgOnboarding.jsx        ← /org/setup
    ├── recruiter/
    │   ├── RecruiterDashboard.jsx   ← /recruit
    │   └── SponsorshipPortal.jsx    ← /sponsor
    ├── admin/
    │   ├── AdminPanel.jsx           ← /admin
    │   └── LocalAdmin.jsx           ← /admin/local
    ├── travel/
    │   └── TravelMode.jsx           ← /travel
    ├── teams/
    │   └── TeamLobby.jsx            ← /event/:id/teams
    ├── social/
    │   ├── Connections.jsx          ← /network
    │   └── SearchResults.jsx        ← /search
    ├── notifications/
    │   └── Notifications.jsx        ← /notifications
    ├── settings/
    │   └── Settings.jsx             ← /settings
    └── public/
        └── CertVerify.jsx           ← /verify/:certId (public, no auth)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔐 ROUTE GUARD LOGIC
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
User visits any URL:
  └─ Is authenticated?
       NO  → Check if route is public (/splash, /auth/*, /verify/:id)
               Public  → Allow access
               Private → Redirect to /splash
       YES → Has completed onboarding?
               NO  → Redirect to /onboarding/1
               YES → Is route allowed for this role?
                       NO  → Redirect to /feed
                       YES → Allow access
```

**Role → Allowed Routes:**
| Role | Blocked Routes |
|------|---------------|
| GUEST (unauthed) | Everything except /splash, /auth/*, /verify/:id |
| PARTICIPANT | /admin, /admin/local, /manage/:id, /recruit |
| VOLUNTEER | /admin, /admin/local, /recruit (can access /scan, /volunteer) |
| ORGANIZER | /admin, /admin/local, /recruit (generates QR via /ticket/:eventId) |
| RECRUITER | /admin, /admin/local, /volunteer |
| LOCAL_ADMIN | /recruit (can access /admin/local only, not /admin) |
| GLOBAL_ADMIN | Nothing blocked |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN 1 — SPLASH / ONBOARDING
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/auth/Splash.jsx
🔗 ROUTE:  /splash
🔒 GUARD:  GuestGuard (if already logged in → redirect /feed)
```

### Buttons & Interactions:

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"JOIN THE GAME"** button | Bottom, full-width coral | Tap | `/auth/participant/register` | Slide up (modal sheet) |
| **"I HAVE AN ACCOUNT"** button | Below JOIN THE GAME, white outline | Tap | `/auth/participant/login` | Slide up (modal sheet) |
| **"Join as Organization △"** link | Below both buttons, teal text | Tap | `/auth/org/register` | Slide up (modal sheet) |
| Slide dots (○ △ □) | Below carousel | Tap | Switches carousel slide | Cross-fade |
| Carousel swipe | Full screen | Swipe L/R | Next/prev slide | Slide L/R (spring) |

### Flow Diagram:
```
/splash
  ├─── "JOIN THE GAME" ──────────────────► /auth/participant/register
  │                                              │
  │                                              ▼
  │                                         Register form (Participant tab active)
  │                                              │
  │                                         Submit "CLAIM YOUR SPOT"
  │                                              │
  │                                              ▼
  │                                         /onboarding/1
  │
  ├─── "I HAVE AN ACCOUNT" ─────────────► /auth/participant/login
  │                                              │
  │                                         Submit "ENTER"
  │                                              │
  │                                              ▼
  │                                         /feed (if onboarding done)
  │                                         /onboarding/1 (if first time)
  │
  │                                    OR: "Login as Organization" link
  │                                              │
  │                                              ▼
  │                                         /auth/org/login
  │
  └─── "Join as Organization" ──────────► /auth/org/register
                                                 │
                                            Register form
                                                 │
                                            Submit "REQUEST ACCESS"
                                                 │
                                                 ▼
                                            Pending state shown inline in OrgRegisterAuth (waiting for admin approval)
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN 2 — AUTHENTICATION (4 Separate Screens)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> ⚠️ NOTE: Volunteer is NOT a separate account type. It's a mode the same participant activates per-event. Participant login/register covers both.

### SCREEN 2A — Participant Login

```
📁 FILE:   src/screens/auth/ParticipantLoginAuth.jsx
🔗 ROUTE:  /auth/participant/login
🔒 GUARD:  GuestGuard (if already logged in → redirect /feed)
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"ENTER □"** button | Full-width coral | Submit login | `/feed` (onboarding done) OR `/onboarding/1` (first login) | Fade out + Fade in |
| **"FORGOT ACCESS?"** | Right-aligned teal link | Tap | Opens password reset modal (inline, no navigation) | Modal slide up |
| **"CONTINUE WITH GOOGLE"** | White outlined button | OAuth | Same logic as ENTER | Fade |
| **"Don't have an account?"** link | Below form | Tap | `/auth/participant/register` | Slide right |
| **"Login as Organization"** link | Below form | Tap | `/auth/org/login` | Slide right |

---

### SCREEN 2B — Participant Register

```
📁 FILE:   src/screens/auth/ParticipantRegisterAuth.jsx
🔗 ROUTE:  /auth/participant/register
🔒 GUARD:  GuestGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"CLAIM YOUR SPOT ○"** | Full-width coral | Submit registration | `/onboarding/1` | Full-screen flash (#FF4D4D) → fade to black → slide in Step 1 |
| **"Already have an account?"** | Below form | Tap | `/auth/participant/login` | Slide right |
| **"I am a Student" toggle** | In form | Toggle ON | Reveals University + Year dropdowns inline | Expand animation |
| **"Register as Organization"** link | Below form | Tap | `/auth/org/register` | Slide right |

---

### SCREEN 2C — Organization Login

```
📁 FILE:   src/screens/auth/OrgLoginAuth.jsx
🔗 ROUTE:  /auth/org/login
🔒 GUARD:  GuestGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"ENTER △"** button | Full-width teal | Submit login | `/feed` (setup done) OR `/org/setup` (first login) | Fade out + Fade in |
| **"FORGOT ACCESS?"** | Right-aligned teal link | Tap | Opens password reset modal (inline) | Modal slide up |
| **"CONTINUE WITH GOOGLE"** | White outlined button | OAuth | Same logic as ENTER | Fade |
| **"Don't have an account?"** link | Below form | Tap | `/auth/org/register` | Slide right |
| **"Login as Participant"** link | Below form | Tap | `/auth/participant/login` | Slide right |

---

### SCREEN 2D — Organization Register (+ Pending State)

```
📁 FILE:   src/screens/auth/OrgRegisterAuth.jsx
🔗 ROUTE:  /auth/org/register
🔒 GUARD:  GuestGuard
```

**Register form state:**

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"REQUEST ACCESS △"** | Gold outlined button | Submit org registration | Same screen transitions to pending state (inline) | Slide up success card |
| **"Already have an account?"** | Below form | Tap | `/auth/org/login` | Slide right |
| **Upload document zone** | Dashed □ area | Tap / drag | File picker (inline) | Border turns coral |

**Pending state (shown inline after submit):**

| Element | Action | Navigates To |
|---------|--------|-------------|
| **"Upload additional documents"** button | Tap | Opens file picker inline |
| **"Contact admin"** link | Tap | Opens mailto: link |
| Status auto-updates via WebSocket when admin approves → redirect `/org/setup` |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREENS 3–8 — USER ONBOARDING WIZARD
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> **IMPORTANT:** The onboarding wizard cannot be skipped (except Step 5 + 6 have "Skip" links). Users are redirected here on first login. Cannot go back past Step 1.

```
📁 FILE:   src/screens/onboarding/Step1PlayerNumber.jsx
🔗 ROUTE:  /onboarding/1
🔒 GUARD:  AuthGuard + OnboardingIncompleteGuard
```

---

### STEP 1 — PLAYER NUMBER ASSIGNMENT

```
📁 FILE:   src/screens/onboarding/Step1PlayerNumber.jsx
🔗 ROUTE:  /onboarding/1
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"BEGIN YOUR JOURNEY ○"** | Bottom coral button, slides up | Tap | `/onboarding/2` | Slide left (spring, 400ms) |

> No back button on Step 1. This is a one-way door.

---

### STEP 2 — CHOOSE YOUR APPEARANCE

```
📁 FILE:   src/screens/onboarding/Step2Appearance.jsx
🔗 ROUTE:  /onboarding/2
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"SAVE & CONTINUE △"** | Bottom teal button | Tap | `/onboarding/3` | Slide left |
| Back arrow (← □ frame) | Top left | Tap | `/onboarding/1` | Slide right |
| Avatar upload zone (hex) | Center | Tap | File picker (inline) | No navigation |
| Shape selector ○△□◇ | Below upload | Tap | Changes avatar preview (inline) | Scale spring |
| Color swatches row | Below shapes | Tap | Changes avatar color (inline) | No navigation |
| Username field | Input | Type | Async availability check inline | No navigation |

---

### STEP 3 — CLAIM YOUR SKILLS

```
📁 FILE:   src/screens/onboarding/Step3Skills.jsx
🔗 ROUTE:  /onboarding/3
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"CONTINUE □"** | Bottom coral button | Tap | `/onboarding/4` | Slide left |
| Back arrow | Top left | Tap | `/onboarding/2` | Slide right |
| Skill tags (tag cloud) | Center area | Tap to add/remove | Adds to "YOUR SKILLS" row (inline) | Tag fly animation |
| "TYPE A SKILL" input | Below tag cloud | Type + Enter | Adds custom tag | No navigation |
| × on added skill tag | On each tag | Tap | Removes tag (inline) | Tag shrink + fade |

---

### STEP 4 — SET YOUR ARENA

```
📁 FILE:   src/screens/onboarding/Step4Arena.jsx
🔗 ROUTE:  /onboarding/4
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"CONTINUE ◇"** | Bottom gold button | Tap | `/onboarding/5` | Slide left |
| Back arrow | Top left | Tap | `/onboarding/3` | Slide right |
| Wilaya dropdown | Form | Tap | Opens searchable dropdown (inline) | Dropdown expand |
| University dropdown | Form (if student) | Tap | Opens searchable dropdown (inline) | Dropdown expand |
| Radius selector (10/25/50km pills) | Form | Tap | Selects radius (inline) | Pill fill animation |

---

### STEP 5 — CHOOSE YOUR ALLIES

```
📁 FILE:   src/screens/onboarding/Step5Allies.jsx
🔗 ROUTE:  /onboarding/5
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"FOLLOW ALL IN MY CATEGORY △"** | Top of org grid | Tap | Marks all as FOLLOWING (inline, optimistic) | All buttons fill teal |
| **"CONTINUE ◇"** | Bottom button | Tap | `/onboarding/6` | Slide left |
| **"Skip — I'll find them later"** | Small link below button | Tap | `/onboarding/6` | Slide left |
| Back arrow | Top left | Tap | `/onboarding/4` | Slide right |
| **"+ FOLLOW"** on each org card | Per org | Tap | Follows org (optimistic UI, inline) | Button → "FOLLOWING ✓" (teal) |

---

### STEP 6 — YOUR FIRST MISSION

```
📁 FILE:   src/screens/onboarding/Step6FirstMission.jsx
🔗 ROUTE:  /onboarding/6
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"REGISTER NOW ○"** | Coral button on event card | Tap | Registers for event (optimistic) → `/feed` | ○△□ burst confetti + fade to feed |
| **"EXPLORE MORE EVENTS △"** | Teal outlined button | Tap | `/feed` (with EXPLORE tab active) | Burst confetti → slide to feed |
| **"ENTER THE ARENA □"** | Bottom white/teal button | Tap | `/feed` | ○△□ burst confetti → fade to feed |
| Back arrow | Top left | Tap | `/onboarding/5` | Slide right |

> **COMPLETION:** When user taps any "enter feed" button on Step 6:
> 1. Mark `user.onboardingComplete = true` in state/backend
> 2. Play shape burst confetti animation
> 3. Show "GAME ON. PLAYER #4821 IS READY." text
> 4. Fade to `/feed`
> 5. GuestGuard no longer triggers, user can navigate freely

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — SMART FEED (HOME)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/feed/Feed.jsx
🔗 ROUTE:  /feed
🔒 GUARD:  AuthGuard
```

### Top Bar:

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| Search bar | Center top | Tap | `/explore` (search focused) | Push right |
| Notification bell □ | Top right | Tap | `/notifications` | Slide down from top |
| Hexagonal avatar | Top right | Tap | `/profile/@me` (own profile) | Slide right |

### Story Bar:

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"+ ADD STORY"** (first item) | Story bar, first | Tap | `/stories/create` | Slide up full-screen |
| Any org story ring | Story bar | Tap | `/stories/:orgId` | Expand from circle to full-screen (Framer Motion layoutId) |

### Feed Toggle:

| Pill | Action | Effect |
|------|--------|--------|
| **[LOCAL ○]** | Tap | Reloads feed with local events. Cards slide in from right |
| **[NATIONAL △]** | Tap | Reloads feed with national events |
| **[INTERNATIONAL □]** | Tap | Activates Travel Mode banner → shows `/travel` content inline |

### Feed Cards:

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **Tap card body / image** | Any feed card | Tap | `/event/:id` | Framer Motion layoutId morph (card expands to fill screen, 300ms) |
| **"REGISTER ○"** button | Card action bar | Tap | Optimistic register (no navigation). Turns teal "YOU'RE IN ✓" | Button fill animation |
| **"SAVE △"** button | Card action bar | Tap | Saves to wishlist (inline, no navigation) | Icon fill |
| **"SHARE □"** button | Card action bar | Tap | Opens native share sheet | System overlay |
| Swipe RIGHT on card | Full card | Swipe | "INTERESTED" wishlist save + gold star (no navigation) | Card tilt + star appear |
| Swipe LEFT on card | Full card | Swipe | "NOT FOR ME" — hides card, teaches algorithm | Card slide out left |
| Organizer name/avatar | Below image | Tap | `/org/:orgId` | Slide right |
| Location chip | Card info row | Tap | Opens map modal (inline) | Modal slide up |

### Floating Action Button:

| Role | Tap Action | Navigates To |
|------|-----------|-------------|
| Verified Organizer | Tap FAB (□ coral, bottom right) | `/event/create` |
| Any other user | Tap FAB | Shows tooltip "🔒 VERIFY YOUR ORG TO CREATE EVENTS" (inline) |

### Bottom Navigation (all screens):

| Tab | Icon | Navigates To | Active Indicator |
|-----|------|-------------|-----------------|
| **FEED** | ○ (circle) | `/feed` | Filled ○ + role color underline |
| **EXPLORE** | △ (triangle) | `/explore` | Filled △ |
| **MY EVENTS** | □ (square) | `/my-events` | Filled □ |
| **PROFILE** | ◇ (diamond) | `/profile/@me` | Filled ◇ |
| **CHAT** | ⬡ (hexagon) | `/chat` | Filled ⬡ + unread coral badge |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — EVENT DETAIL (Polymorphic)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/event/EventDetail.jsx
🔗 ROUTE:  /event/:id
🔒 GUARD:  AuthGuard

Sub-components rendered inside based on event.type:
  sport    → src/screens/event/variants/SportDetail.jsx
  science  → src/screens/event/variants/ScienceDetail.jsx
  charity  → src/screens/event/variants/CharityDetail.jsx
  cultural → src/screens/event/variants/CulturalDetail.jsx
```

### Universal Buttons (all event types):

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back arrow** | Top left (□ frame) | Tap | Goes back to previous screen (browser history) | Framer Motion reverse morph (shrinks back to card) |
| **Share □** icon | Top right | Tap | Native share sheet | System overlay |
| **Save △** icon | Top right | Tap | Saves to wishlist (inline) | Icon fill |
| Organizer avatar/name | Hero bottom | Tap | `/org/:orgId` | Slide right |
| **"ENTER THE GAME ○"** (fixed bottom) | Bottom full-width | Tap (default) | Registers → button turns teal "YOU'RE IN ✓" | Button fill (no navigation) |
| **"JOIN WAITLIST △"** (fixed bottom) | When event full | Tap | Waitlisted (inline, no navigation) | Button turns gold |
| **"MANAGE THIS EVENT □"** (fixed bottom) | Organizer only | Tap | `/manage/:id` | Slide right |

### Tab Bar (inside EventDetail):

| Tab | Navigates To | Content |
|-----|-------------|---------|
| **○ INFO** | Stays on /event/:id (tab switch, no route) | Event description + polymorphic section |
| **△ COMMUNITY** | Stays on /event/:id (tab switch) | Chat preview + friends attending |
| **□ VOLUNTEERS** | Stays on /event/:id (tab switch) | Volunteer roles |
| **◇ SPONSORS** | Stays on /event/:id (tab switch) | Sponsor logos |

### SPORT variant extra buttons:

| Element | Action | Navigates To |
|---------|--------|-------------|
| **"JOIN A TEAM △"** | Tap | `/event/:id/teams` (Team Formation Lobby) |

### SCIENCE variant extra buttons:

| Element | Action | Navigates To |
|---------|--------|-------------|
| **"SUBMIT ABSTRACT □"** | Tap | Opens file upload drawer (inline, no navigation) |
| DOI links | Tap | Opens external URL in browser |

### CHARITY variant extra buttons:

| Element | Action | Navigates To |
|---------|--------|-------------|
| **"DONATE ◇"** | Tap | Opens payment modal (inline) |
| **"APPLY △"** on volunteer shift | Tap | Applies for shift (inline, status changes to PENDING) |

### CULTURAL variant extra buttons:

| Element | Action | Navigates To |
|---------|--------|-------------|
| **"SELECT"** on ticket tier | Tap | Opens payment/booking drawer (inline) |

### COMMUNITY TAB buttons:

| Element | Action | Navigates To |
|---------|--------|-------------|
| **"JOIN LOBBY CHAT ○"** | Tap | `/chat/:eventId` |
| **"JOIN TRAVEL GROUP △"** | Tap | `/chat/:eventId?channel=travel` |
| **"GENERATE VISA SUPPORT LETTER ○"** | Tap | Opens PDF generation modal (inline) |

### VOLUNTEERS TAB buttons:

| Element | Action | Navigates To |
|---------|--------|-------------|
| **"APPLY △"** on a role | Tap | Submits application (optimistic). Status → "APPLIED — PENDING ◇" inline |
| **"VOLUNTEER MODE UNLOCKED"** card | When approved | Shown as info card. No navigation until event day |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — EXPLORE / SEARCH
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/explore/Explore.jsx
🔗 ROUTE:  /explore
🔒 GUARD:  AuthGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| Search bar (focused on arrival) | Top | Type | Shows results inline below | Instant |
| Filter pills [ALL ○][SPORT △]... | Below search | Tap | Filters results (inline) | Pill fill |
| [NEAR ME ○] filter pill | Filter row | Tap | Triggers location permission → filters | Inline |
| Trending card | Horizontal scroll | Tap | `/event/:id` | Morph expand |
| Org card in Top Orgs | Grid | Tap | `/org/:orgId` | Slide right |
| **"FOLLOW +"** on org card | Org card | Tap | Follows (inline optimistic) | Button → "FOLLOWING ✓" |
| Skill tag in Skills Cloud | Tag cloud | Tap | Filters events by skill (inline) | Tags filter |
| [LIST □] / [MAP ○] toggle | Top right | Tap | Switches list ↔ map view (inline) | Cross-fade |
| Map pin | Map view | Tap | Mini popup card inline | Popup appear |
| **"REGISTER ○"** in popup | Map pin popup | Tap | Registers (inline optimistic) | Button fill |
| Event card in results | Results list | Tap | `/event/:id` | Morph expand |
| Player card in results | Players tab | Tap | `/profile/:username` | Slide right |
| **"CONNECT △"** on player | Player card | Tap | Sends connection request (inline) | Button → "PENDING" |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — PLAYER PROFILE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/profile/PlayerProfile.jsx
🔗 ROUTE:  /profile/:username
            /profile/@me  (own profile shortcut)
🔒 GUARD:  AuthGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back** | Top left | Tap | Previous screen | Slide right |
| **"EDIT PROFILE"** button (own profile) | Top right or profile area | Tap | `/profile/edit` | Slide up |
| **"CONNECT △"** (other user's profile) | Action area | Tap | Sends request (inline) | Button state change |
| **"MESSAGE □"** (other user) | Action area | Tap | `/chat` (opens DM) | Slide right |
| Event card in Identity Passport timeline | Timeline | Tap | `/event/:id` | Morph expand |
| **"CERTIFICATE ISSUED"** badge on event | Timeline | Tap | `/verify/:certId` (certificate detail) | Slide up modal |
| **"DOWNLOAD FULL PASSPORT PDF"** | Bottom teal button | Tap | Opens PDF generation modal (inline) | Modal slide up |
| Volunteer Mode toggle | Profile header area | Toggle ON | UI theme sweeps teal, reveals volunteer tools | Full-screen teal sweep (800ms) |
| Badge in badge grid | Badge section | Tap | Opens badge detail modal (inline) | Scale expand |
| **"SHARE PROFILE"** | Share area | Tap | Native share sheet | System overlay |

### Bottom Nav on Profile (Profile tab active):

Same 5-tab bottom nav, ◇ PROFILE tab active with role color fill.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — GAMIFICATION HUB
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/gamification/GamificationHub.jsx
🔗 ROUTE:  /hub
🔒 GUARD:  AuthGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"VIEW FULL LEADERBOARD"** | Below top performers | Tap | `/hub/leaderboard` | Slide left |
| Player row in leaderboard | Leaderboard section | Tap | `/profile/:username` | Slide right |
| Badge in badge grid (unlocked) | Badges section | Tap | Opens badge detail modal (inline) | Scale expand |
| Badge in badge grid (locked) | Badges section | Tap | Shows "how to unlock" tooltip inline | Tooltip appear |
| Achievement checkbox (incomplete) | Achievements section | Shown as progress, no navigation | — | — |
| Hamburger menu | Top right | Tap | Opens side drawer with extra links | Slide in from right |
| Notification bell | Top right | Tap | `/notifications` | Slide down |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — NOTIFICATIONS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/notifications/Notifications.jsx
🔗 ROUTE:  /notifications
🔒 GUARD:  AuthGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back** | Top left | Tap | Previous screen | Slide right |
| **"MARK ALL READ ○"** | Top right teal link | Tap | Marks all read (inline) | All unread dots fade |
| Filter tabs [ALL][EVENTS][SOCIAL][SYSTEM] | Below header | Tap | Filters list (inline) | Tab switch |
| **"VIEW EVENT ○"** on event notification | Notification card | Tap | `/event/:id` | Slide right |
| **"FOLLOW BACK"** on social notification | Notification card | Tap | Follows back (inline optimistic) | Button → "FOLLOWING ✓" |
| **"ACCEPT △"** on volunteer approval | Notification card | Tap | Accepts (inline) | Card turns teal |
| **"REJECT"** on volunteer approval | Notification card | Tap | Rejects (inline) | Card fades |
| **"ACCEPT △"** on Golden Ticket | Gold bordered card | Tap | Opens Golden Ticket response modal | Modal slide up |
| **"DECLINE □"** on Golden Ticket | Gold bordered card | Tap | Declines (inline). Card mutes | Button state |
| **"VIEW BADGE ◇"** on badge earned | Notification card | Tap | Opens badge detail modal (inline) | Scale expand |
| **"VIEW ORG PROFILE □"** on verification | Notification card | Tap | `/org/:orgId` | Slide right |
| Notification item (tap body) | Any notification | Tap | Relevant screen for that notification | Contextual |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — SETTINGS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/settings/Settings.jsx
🔗 ROUTE:  /settings
🔒 GUARD:  AuthGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back** | Top left | Tap | Previous screen | Slide right |
| **"Edit Profile →"** row | Account section | Tap | `/profile/edit` | Slide right |
| **"Change Email"** row | Account section | Tap | Opens inline form | Expand |
| **"Change Password"** row | Account section | Tap | Opens inline form | Expand |
| **"Linked Accounts (Google)"** row | Account section | Tap | Google OAuth flow | System |
| **"Block list"** row | Privacy section | Tap | Opens blocked users modal | Modal slide up |
| **"DOWNLOAD MY DATA □"** | Bottom section | Tap | Triggers data export email (confirmation modal) | Modal |
| **"DEACTIVATE ACCOUNT △"** | Bottom section | Tap | Opens confirmation modal | Modal |
| **"DELETE ACCOUNT ✗"** | Bottom, coral text | Tap | Opens type-to-confirm dialog | Modal (requires typing "DELETE #4821") |
| **"LOG OUT"** | Bottom coral outline button | Tap | Clears auth state → `/splash` | Fade to black → splash |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — CHAT / COMMUNITY
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/chat/Chat.jsx
🔗 ROUTE:  /chat/:eventId?
           /chat  (shows all chats list)
🔒 GUARD:  AuthGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back / close** | Top | Tap | Previous screen | Slide right |
| Channel in sidebar | Left sidebar | Tap | Switches active channel (inline) | Channel slide |
| **"#staff-only ◇"** (locked) | Sidebar | Tap | Shows tooltip "Join as Volunteer to access" | Inline tooltip |
| **"+ NEW DM ○"** | Sidebar bottom | Tap | Opens user search modal | Modal slide up |
| Player name/avatar in message | Chat area | Tap | `/profile/:username` | Slide right |
| **"SEND FLASH ALERT 🔴"** (organizer) | Above input | Tap | Expands broadcast field inline | Expand animation |
| **"BROADCAST △"** | Flash alert area | Tap | Sends to all. Confirmation modal first | Modal → send |
| Attachment □ icon | Input bar left | Tap | File picker | System |
| Image ○ icon | Input bar left | Tap | Photo picker | System |
| Poll △ icon | Input bar left | Tap | Opens poll creator modal | Modal slide up |
| **"WALKIE TALKIE ○ — HOLD TO SPEAK"** | Sidebar bottom | Hold | Records audio. Release to send to #staff-only | Hold interaction |
| Member row (desktop right panel) | Members list | Right-click / long-press | Context menu: DM / View Profile / Report | Context menu |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — STORIES VIEWER
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/stories/StoryViewer.jsx
🔗 ROUTE:  /stories/:orgId
🔒 GUARD:  AuthGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **✕ Close** | Top left (□ frame) | Tap | Previous screen | Shrinks back to story ring in story bar |
| Tap left half of screen | Full screen | Tap | Previous story frame | Frame reverse |
| Tap right half of screen | Full screen | Tap | Next story frame (or closes if last) | Frame forward |
| Long press | Full screen | Hold | Pauses timer | Pause |
| Swipe down | Full screen | Swipe | Closes story viewer | Shrink to ring |
| **"FOLLOW +"** / **"FOLLOWING ✓"** | Top right | Tap | Follow/unfollow (inline) | Button state |
| **"ENTER THE GAME ○"** CTA card | Bottom of story | Tap | `/event/:id` | Slide right |
| Poll option [YES ○][MAYBE △][NO □] | Poll sticker | Tap | Votes (inline). Shows % after | Fill animation |
| Reaction buttons ○🔥 △💡 □❤️ ◇⚡ | Bottom | Tap | Floating emoji animation (inline) | Float up + fade |
| **"SEND MESSAGE □"** | Bottom | Tap | Opens quick reply input (inline) | Input expand |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — STORIES CREATION
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/stories/StoryCreate.jsx
🔗 ROUTE:  /stories/create
🔒 GUARD:  OrgGuard (only verified orgs can create stories)

3 steps: CAPTURE → EDIT → AUDIENCE
```

| Element | Step | Action | Navigates To |
|---------|------|--------|-------------|
| **[○ PHOTO][△ VIDEO][□ BOOMERANG]** | Capture | Tap | Switches camera mode |
| Gallery □ icon | Capture | Tap | Opens photo library |
| Capture button | Capture | Tap / hold | Takes photo / records video |
| **"DISCARD ✗"** | Edit | Tap | Back to capture step |
| **"NEXT → AUDIENCE"** | Edit | Tap | Goes to Audience step |
| Text tool T | Edit | Tap | Text input overlay on media |
| Shape sticker ○△□◇ | Edit | Tap | Opens sticker picker |
| Countdown ⏱ | Edit | Tap | Date picker → countdown sticker |
| Poll 📊 | Edit | Tap | Poll builder modal |
| Event Link □ | Edit | Tap | Event search → attaches CTA card |
| **"POST ◇"** | Audience | Tap | Posts story → back to feed / org profile. Toast: "Story Live." |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — QR TICKET (Organizer Generates)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/qr/QRTicket.jsx
🔗 ROUTE:  /ticket/:eventId
🔒 GUARD:  OrgGuard + must be organizer of this event
```

> **FLOW:** The organizer opens this screen on their device and displays the QR code. Participants/volunteers scan it with /scan to check in.

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back** | Top | Tap | `/manage/:eventId` | Slide right |
| QR code (auto-refreshes every 60s) | Center | Displayed on organizer's device for attendees to scan | Stays on screen (attendees scan with their own /scan) | — |
| **"FULLSCREEN MODE"** | Below QR | Tap | Expands QR to full-screen for large display | Scale expand |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — QR SCANNER (Participant/Volunteer Check-in)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/qr/QRScanner.jsx
🔗 ROUTE:  /scan
🔒 GUARD:  AuthGuard (any authenticated participant/volunteer can scan)
```

> **FLOW:** Participant/volunteer opens this screen, points camera at the organizer's QR code to check themselves in.

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back** | Top | Tap | Previous screen | Slide right |
| Successful scan | Auto | Auto | Shows ACCESS GRANTED overlay (3s) + "+100 XP" → auto-returns to `/feed` | Full-screen mint flash |
| Failed scan | Auto | Auto | Shows REJECTED overlay (2s) → auto-returns to scanner | Coral flash overlay |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — CREATE EVENT
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/organizer/CreateEvent.jsx
🔗 ROUTE:  /event/create
🔒 GUARD:  OrgGuard (verified organizers only)

4 steps tracked by shape progress indicator at top:
  ○ BASICS → △ DETAILS → □ COMMUNITY → ◇ LAUNCH
```

### Step Navigation Buttons:

| Element | Step | Action | Navigates To |
|---------|------|--------|-------------|
| **← Back (✕ close)** | All steps | Tap | Confirms exit → `/feed` (discards draft) |
| **"NEXT →"** / shape icon | End of each step | Tap | Next step (inline step switch) |
| Step indicator ○△□◇ | Top progress bar | Tap completed step | Jump to that step |
| **"SAVE AS DRAFT □"** | Step 4 | Tap | Saves draft → `/feed`. Toast: "Draft saved." |
| **"SCHEDULE LAUNCH △"** | Step 4 | Tap | Opens date/time picker inline. Schedules → `/feed` |
| **"LAUNCH NOW ▶"** | Step 4 | Tap | Confirmation modal → on confirm: POST_LAUNCH confetti → `/event/:newId` |
| **"VIEW EVENT"** (post-launch) | Success screen | Tap | `/event/:newId` |
| **"SHARE TO STORIES"** (post-launch) | Success screen | Tap | `/stories/create` (pre-linked to new event) |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — ORGANIZER COMMAND CENTER
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/organizer/CommandCenter.jsx
🔗 ROUTE:  /manage/:eventId
🔒 GUARD:  OrgGuard + must be organizer of this event
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back** | Top | Tap | `/feed` or `/my-events` | Slide right |
| **"SWITCH EVENT ◇"** | Header dropdown | Tap | Changes to different event's command center (same route, new :id) | Dropdown |
| **"SEND FLASH ALERT 🔴"** | Quick actions | Tap | Expands broadcast field inline | Expand |
| **"BROADCAST NOW □"** | Flash alert area | Tap | Sends push to all. Confirmation first | Modal → send |
| **"EXPORT ATTENDEE LIST □"** | Quick actions | Tap | Downloads CSV/PDF | System download |
| **"OPEN STAFF CHAT △"** | Quick actions | Tap | `/chat/:eventId?channel=staff` (opens as overlay) | Slide in from right |
| Volunteer card | Volunteer panel | Tap | Shows volunteer detail modal (inline) | Modal |
| Analytics charts | Analytics row | Tap/zoom | Interactive chart (inline) | Expand |
| **"VIEW ANALYTICS □"** | Analytics section | Tap | `/manage/:eventId/analytics` | Slide right |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — ORGANIZATION PROFILE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/profile/OrgProfile.jsx
🔗 ROUTE:  /org/:orgId
🔒 GUARD:  AuthGuard
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back** | Top | Tap | Previous screen | Slide right |
| **"FOLLOW +"** | Action row | Tap | Follows (inline optimistic) | Button → "FOLLOWING ✓" |
| **"NOTIFY ME □"** | Action row | Tap | Enables notifications for org (inline) | Button fill |
| **"MESSAGE △"** (if following) | Action row | Tap | `/chat` (opens DM with org) | Slide right |
| **"REPORT ◇"** | Action row small | Tap | Report modal (inline) | Modal slide up |
| Past event card | Events tab | Tap | `/event/:id` | Morph expand |
| **"MANAGE ORG □"** (own org only) | — | Tap | `/org/:orgId/manage` | Slide right |
| **"CREATE EVENT □"** (own org) | — | Tap | `/event/create` | Slide right |
| **"POST UPDATE □"** (own org) | — | Tap | `/post/create` | Slide up |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — TEAM FORMATION LOBBY
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/teams/TeamLobby.jsx
🔗 ROUTE:  /event/:id/teams
🔒 GUARD:  AuthGuard + must be registered for this event
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back** | Top | Tap | `/event/:id` (Community tab) | Slide right |
| **"CREATE A TEAM □"** | No-team state | Tap | Opens create team drawer (slide up) | Drawer slide up |
| **"JOIN A TEAM ○"** | No-team state | Tap | Scrolls to Open Squads section | Smooth scroll |
| **"CREATE □"** in create drawer | Create team form | Tap | Creates team (optimistic). Drawer closes. Team appears in lobby | Drawer closes |
| **"SHARE JOIN LINK △"** | Have-team state | Tap | Native share sheet | System overlay |
| **"TEAM CHAT □"** | Have-team state | Tap | `/chat/:eventId?channel=team-{teamId}` | Slide right |
| **"JOIN △"** on open team card | Open teams list | Tap | Joins (public: immediate) or sends request (invite-only) | Avatar animates into team row |
| **"INVITE △"** on solo player | Solo board | Tap | Sends invite notification (inline) | Button → "INVITED" |
| **"MARK READY ✓"** toggle | Have-team (leader) | Toggle | Marks team ready. Card border → teal glow | Toggle animation |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — TRAVEL MODE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/travel/TravelMode.jsx
🔗 ROUTE:  /travel
🔒 GUARD:  AuthGuard

Entry: Tap [INTERNATIONAL □] in Feed toggle, or △ TRAVEL in Explore
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **← Back / close Travel Mode** | Top | Tap | `/feed` | Slide down (Travel Mode banner slides out) |
| Event card in international feed | Feed | Tap | `/event/:id` | Morph expand |
| **"JOIN TRAVEL GROUP △"** | Event's travel section | Tap | `/chat/:eventId?channel=travel` | Slide right |
| **"GENERATE VISA SUPPORT LETTER ○"** | Event's travel section | Tap | Opens PDF modal inline. "DOWNLOAD PDF △" in modal | Modal slide up |
| **"REQUEST TO STAY □"** on host card | Accommodation tab | Tap | Sends request (inline) | Button state |
| **"BOOK WITH DISCOUNT ◇"** | Partner Hotels tab | Tap | External booking link | Browser |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — RECRUITER DASHBOARD
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/recruiter/RecruiterDashboard.jsx
🔗 ROUTE:  /recruit
🔒 GUARD:  AuthGuard + role === RECRUITER
```

| Element | Location | Action | Navigates To | Transition |
|---------|----------|--------|-------------|------------|
| **"RUN SEARCH ◇"** | Filter panel | Tap | Runs search (inline results appear) | Results slide in |
| **"VIEW PROFILE ○"** on candidate | Candidate card | Tap | `/profile/:username` | Slide right |
| **"GOLDEN TICKET △"** on candidate | Candidate card | Tap | Opens golden ticket drawer (slide up) | Drawer slide up |
| **"SEND OFFER ◇"** in drawer | Golden ticket drawer | Tap | Sends notification. Drawer closes. Status → "SENT — AWAITING RESPONSE △" | Drawer close |
| **"SPONSOR THIS EVENT ◇"** | Sponsorship section | Tap | `/sponsor` (Sponsorship Portal) | Slide right |
| Candidate card expand ▽ | Candidate card | Tap | Expands event history + badge gallery inline | Height expand |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — ADMIN PANEL
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/admin/AdminPanel.jsx
🔗 ROUTE:  /admin
🔒 GUARD:  AdminGuard (role === GLOBAL_ADMIN)
```

### Left Sidebar Navigation:

| Item | Navigates To (tab switch, no route change) |
|------|-------------------------------------------|
| **□ OVERVIEW** | Overview panel |
| **○ VERIFICATION QUEUE** | Verification queue panel |
| **△ LIVE MAP** | Live map panel |
| **◇ USER MANAGEMENT** | User management panel |
| **⬡ CONTENT FLAGS** | Content flags panel |
| **▲ PLATFORM ANALYTICS** | Analytics panel |
| **● SYSTEM HEALTH** | System health panel |
| **⚙ SETTINGS** | Admin settings |
| **← LOGOUT** | Clears auth → `/splash` |

### Verification Queue Actions:

| Element | Action | Navigates To |
|---------|--------|-------------|
| **"REVIEW →"** on org | Tap | Opens review panel inline (slide in from right) |
| **"APPROVE ✓"** | In review panel | Tap | Approves org. Sends notification. Panel closes. Queue updates |
| **"REJECT ✗"** | In review panel | Tap | Opens reason field. On confirm: rejects. Sends notification |
| **"REQUEST MORE INFO △"** | In review panel | Tap | Opens message field. Sends to org |
| **"FLAG ⬡"** | In review panel | Tap | Escalates to flags queue |

### User Management Actions:

| Element | Action |
|---------|--------|
| **"VIEW PROFILE ○"** | Opens `/profile/:username` in new tab |
| **"SUSPEND △"** | Duration picker modal → confirm → suspends |
| **"BAN □"** | Confirmation + reason → permanent ban |
| **"PROMOTE ◇"** | Region selector → promotes to LOCAL_ADMIN |
| **"MESSAGE ⬡"** | Opens DM with that user |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — NEW POST CREATION
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/organizer/NewPost.jsx
🔗 ROUTE:  /post/create
🔒 GUARD:  OrgGuard
```

| Element | Location | Action | Navigates To |
|---------|----------|--------|-------------|
| **← Back / ✕ close** | Top | Tap | Previous screen (discards draft) |
| Tab [○ UPDATE][△ ANNOUNCEMENT][□ STORY] | Top | Tap | Switches post type (inline). □ STORY → redirect to `/stories/create` |
| **"ADD IMAGE ○"** | Media row | Tap | File picker |
| **"ADD VIDEO △"** | Media row | Tap | Video picker |
| **"ADD FILE □"** | Media row | Tap | File picker |
| **"ADD POLL ◇"** | Media row | Tap | Poll builder inline |
| **"SAVE DRAFT □"** | Bottom | Tap | Saves → closes. Toast: "Draft saved." |
| **"SCHEDULE △"** | Bottom | Tap | Date/time picker inline → schedules post |
| **"PUBLISH NOW ▶"** | Bottom coral button | Tap | Posts immediately → back to org profile. Toast: "Posted." |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — SOCIAL CONNECTIONS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/social/Connections.jsx
🔗 ROUTE:  /network
🔒 GUARD:  AuthGuard
```

| Element | Location | Action | Navigates To |
|---------|----------|--------|-------------|
| **← Back** | Top | Tap | Previous screen |
| Tab [○ CONNECTIONS][△ PENDING][□ SUGGESTIONS][◇ MUTUAL EVENTS] | Tab bar | Tap | Switches list (inline) |
| **"VIEW PROFILE ○"** | Connection card | Tap | `/profile/:username` |
| **"MESSAGE □"** | Connection card | Tap | `/chat` (DM) |
| **"ACCEPT ✓ ○"** | Pending tab card | Tap | Accepts request (optimistic). Card moves to CONNECTIONS |
| **"DECLINE ✗ □"** | Pending tab card | Tap | Declines (optimistic). Card removes |
| **"CANCEL REQUEST □"** | Pending - sent | Tap | Cancels request (optimistic). Card removes |
| **"CONNECT △"** | Suggestions tab | Tap | Sends request (optimistic). Button → "PENDING ◇" |
| **"CONNECT WITH ALL △"** | Mutual Events tab | Tap | Bulk connect with co-attendees |
| Event name (in Mutual Events) | Mutual Events tab | Tap | `/event/:id` |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN — CERTIFICATE VERIFY (PUBLIC)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
📁 FILE:   src/screens/public/CertVerify.jsx
🔗 ROUTE:  /verify/:certId
🔒 GUARD:  None (fully public — no login required)
```

| Element | Action | Navigates To |
|---------|--------|-------------|
| **"DOWNLOAD △"** | Tap | Downloads PDF cert |
| **"VIEW PLAYER PROFILE ○"** | Tap | `/profile/:username` (requires login to view full profile) |
| QR code link on cert | Scan | Returns to this same verify URL |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔁 COMPLETE USER JOURNEY FLOWS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🆕 FLOW A — New Participant (First Time)
```
/splash
  → (JOIN THE GAME)
/auth/participant/register
  → (CLAIM YOUR SPOT)
/onboarding/1  [Player number assigned]
  → (BEGIN YOUR JOURNEY)
/onboarding/2  [Upload avatar, pick symbol]
  → (SAVE & CONTINUE)
/onboarding/3  [Select skills]
  → (CONTINUE)
/onboarding/4  [Set wilaya + radius]
  → (CONTINUE)
/onboarding/5  [Follow orgs]
  → (CONTINUE)
/onboarding/6  [First mission]
  → (ENTER THE ARENA)
/feed  ← HOME BASE for all future logins
```

---

### 🔄 FLOW B — Returning Participant
```
/splash
  → (I HAVE AN ACCOUNT)
/auth/participant/login
  → (ENTER)
/feed  ← Direct (onboarding already complete)
```

---

### 🏢 FLOW C — New Organization
```
/splash
  → (Join as Organization)
/auth/org/register
  → Fill form + upload official document
  → (REQUEST ACCESS)
  → Screen transitions to pending state (inline, same route)
  → WebSocket listens for admin decision
  → [Admin approves in /admin → Verification Queue]
  → [WebSocket pushes approval] → redirect:
/org/setup  [Org onboarding wizard: logo, description, first event setup]
  → (COMPLETE SETUP)
/feed  ← Now has organizer capabilities
```

---

### 📅 FLOW D — Register for an Event + Check In
```
/feed
  → (Tap event card)
/event/:id
  → (ENTER THE GAME ○)
  [Button turns teal → YOU'RE IN ✓]
  [No navigation — stays on event page]
  [Push notification later: "Event starts in 1 hour!"]
  → Event day: open /scan
/scan  [Point camera at organizer's QR code to check in]
  → ACCESS GRANTED → +100 XP → /feed
```

---

### 🔧 FLOW E — Volunteer for an Event
```
/event/:id
  → (□ VOLUNTEERS tab)
  → (APPLY △ on a role)
  [Button → "APPLIED — PENDING ◇"]
  [Push notification when approved]
/notifications
  → "Volunteer approved" notification → (ACCEPT △)
  [Volunteer Mode unlocked for this event]
  → Event day: volunteer checks in same as participants
/scan  [Point camera at organizer's QR code to check in]
  → ACCESS GRANTED → volunteer tools unlocked
/volunteer/:eventId  [Volunteer dashboard for the event]
```

---

### 🎮 FLOW F — Gamification Loop
```
Attend event → check in via QR → /scan → scan organizer's QR
  → Full-screen mint flash + "+100 XP" popup
  → Badge popup (if unlocked)
  → Level-up modal (if leveled)
  → Auto-returns to /feed after 3s

Check progress:
/hub  → View XP, rank, badges, achievements
  → (VIEW FULL LEADERBOARD)
/hub/leaderboard  → Full rankings
```

---

### 🏟️ FLOW G — Create and Launch an Event (Organizer)
```
/feed  → (FAB □ button)
/event/create
  → Step 1: Choose type (SPORT / SCIENCE / CHARITY / CULTURAL)
  → Step 2: Fill details (polymorphic form per type)
  → Step 3: Set XP rewards, volunteer roles, chat channels
  → Step 4: Preview → (LAUNCH NOW ▶)
  → [Confirmation modal] → OK
  → [Confetti burst + "YOUR ARENA IS LIVE! ◇"]
  → (VIEW EVENT)
/event/:newId  ← Event is now live in the feed
```

---

### 📡 FLOW H — Live Event Day (Organizer)
```
/manage/:eventId  [Command Center]
  → Real-time check-in count via WebSocket
  → (SEND FLASH ALERT 🔴) → broadcasts to all attendees
  → (OPEN STAFF CHAT △) → /chat/:eventId?channel=staff
  → (EXPORT ATTENDEE LIST □) → downloads CSV
  → After event:
/manage/:eventId/analytics  [Full post-event analytics]
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚡ TRANSITION CHEAT SHEET
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Transition Type | When to use | Framer Motion config |
|----------------|-------------|---------------------|
| **Slide Left** | Going deeper / forward | `x: [100%, 0]` on enter, `x: [0, -100%]` on exit |
| **Slide Right** | Going back | `x: [-100%, 0]` on enter, `x: [0, 100%]` on exit |
| **Slide Up** | Modal, drawer, story creation | `y: [100%, 0]` on enter |
| **Slide Down** | Notifications, top drawers | `y: [-100%, 0]` on enter |
| **Morph Expand** | Feed card → Event Detail | `layoutId` shared between card and detail |
| **Fade** | Auth transitions, post-action | `opacity: [0, 1]` |
| **Full-screen flash** | Post-registration, QR success | Background color fills screen (150ms) then fades |
| **Teal sweep** | Volunteer mode activation | `scaleX: [0, 1]` from left to right, teal bg |
| **Shrink to ring** | Close story viewer | Reverse of expand from story ring |
| **Shape burst** | Onboarding complete, event launch | ○△□◇ burst outward with role colors |
| **No transition** | Filter changes, tab switches | Instant or cross-fade (150ms) |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🗂️ ROUTE TABLE (Full Index)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Route | Screen | File | Guard |
|-------|--------|------|-------|
| `/splash` | Splash | `auth/Splash.jsx` | GuestGuard |
| `/auth/participant/login` | Participant Login | `auth/ParticipantLoginAuth.jsx` | GuestGuard |
| `/auth/participant/register` | Participant Register | `auth/ParticipantRegisterAuth.jsx` | GuestGuard |
| `/auth/org/login` | Organization Login | `auth/OrgLoginAuth.jsx` | GuestGuard |
| `/auth/org/register` | Organization Register + Pending | `auth/OrgRegisterAuth.jsx` | GuestGuard |
| *(pending state is inline in /auth/org/register)* | — | — | — |
| `/onboarding/1` | Step 1 Player Number | `onboarding/Step1PlayerNumber.jsx` | AuthGuard + NotCompleted |
| `/onboarding/2` | Step 2 Appearance | `onboarding/Step2Appearance.jsx` | AuthGuard + NotCompleted |
| `/onboarding/3` | Step 3 Skills | `onboarding/Step3Skills.jsx` | AuthGuard + NotCompleted |
| `/onboarding/4` | Step 4 Arena | `onboarding/Step4Arena.jsx` | AuthGuard + NotCompleted |
| `/onboarding/5` | Step 5 Allies | `onboarding/Step5Allies.jsx` | AuthGuard + NotCompleted |
| `/onboarding/6` | Step 6 First Mission | `onboarding/Step6FirstMission.jsx` | AuthGuard + NotCompleted |
| `/feed` | Smart Feed | `feed/Feed.jsx` | AuthGuard |
| `/event/:id` | Event Detail | `event/EventDetail.jsx` | AuthGuard |
| `/event/create` | Create Event | `organizer/CreateEvent.jsx` | OrgGuard |
| `/event/:id/teams` | Team Lobby | `teams/TeamLobby.jsx` | AuthGuard |
| `/explore` | Explore / Search | `explore/Explore.jsx` | AuthGuard |
| `/search` | Search Results | `social/SearchResults.jsx` | AuthGuard |
| `/profile/:username` | Player Profile | `profile/PlayerProfile.jsx` | AuthGuard |
| `/profile/edit` | Edit Profile | `profile/EditProfile.jsx` | AuthGuard |
| `/org/:orgId` | Org Profile | `profile/OrgProfile.jsx` | AuthGuard |
| `/org/setup` | Org Onboarding | `organizer/OrgOnboarding.jsx` | OrgGuard |
| `/hub` | Gamification Hub | `gamification/GamificationHub.jsx` | AuthGuard |
| `/hub/leaderboard` | Full Leaderboard | `gamification/Leaderboard.jsx` | AuthGuard |
| `/chat` | Chat List | `chat/Chat.jsx` | AuthGuard |
| `/chat/:eventId` | Event Chat | `chat/Chat.jsx` | AuthGuard |
| `/stories/:orgId` | Story Viewer | `stories/StoryViewer.jsx` | AuthGuard |
| `/stories/create` | Story Create | `stories/StoryCreate.jsx` | OrgGuard |
| `/ticket/:eventId` | QR Ticket | `qr/QRTicket.jsx` | AuthGuard |
| `/scan` | QR Scanner | `qr/QRScanner.jsx` | AuthGuard (participant/volunteer) |
| `/volunteer/:eventId` | Volunteer Mode | `volunteer/VolunteerMode.jsx` | VolunteerGuard |
| `/manage/:eventId` | Command Center | `organizer/CommandCenter.jsx` | OrgGuard |
| `/manage/:eventId/analytics` | Analytics | `organizer/Analytics.jsx` | OrgGuard |
| `/post/create` | New Post | `organizer/NewPost.jsx` | OrgGuard |
| `/recruit` | Recruiter Dashboard | `recruiter/RecruiterDashboard.jsx` | RecruiterGuard |
| `/sponsor` | Sponsorship Portal | `recruiter/SponsorshipPortal.jsx` | AuthGuard |
| `/travel` | Travel Mode | `travel/TravelMode.jsx` | AuthGuard |
| `/network` | Connections | `social/Connections.jsx` | AuthGuard |
| `/notifications` | Notifications | `notifications/Notifications.jsx` | AuthGuard |
| `/settings` | Settings | `settings/Settings.jsx` | AuthGuard |
| `/admin` | Admin God View | `admin/AdminPanel.jsx` | AdminGuard |
| `/admin/local` | Local Admin | `admin/LocalAdmin.jsx` | LocalAdminGuard |
| `/my-events` | My Events | `feed/MyEvents.jsx` | AuthGuard |
| `/verify/:certId` | Certificate Verify | `public/CertVerify.jsx` | **None (public)** |

---

> *"The game has already begun. Every screen is a level. Every tap is a move."*
> 
> — Eventfy Navigation Reference v1.0
> — Use this file with Figma MCP to give Claude in Antigravity full context on every transition.
