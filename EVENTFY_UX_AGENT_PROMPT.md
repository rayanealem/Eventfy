# EVENTFY — UX/UI IMPROVEMENT PROMPT FOR AGENT
## Mission: Social App Comfort Layer on top of Squid Game Aesthetic

---

## CONTEXT SNAPSHOT — WHAT THE APP IS TODAY

You are working on **Eventfy**, a Squid Game × Social Super-App for Algerian students and event organizers. The core design system is **90% complete and locked** — you must not change it. Here is what is fixed and sacred:

- **Color palette:** Black (`#0A0A0F`) background, coral/red (`#fb5151`, `#ff4d4d`), teal (`#00ffc2`, `#2dd4bf`, `#13ecec`), gold (`#ffd700`, `#fbbf24`), pink (`#ff2d78`), blue (`#3b82f6`)
- **Typography:** Bebas Neue (display/headers), Space Grotesk (body/UI), DM Mono (data/labels)
- **Shape language:** ○ (Sport/pink) △ (Science/gold) □ (Charity/teal) ◇ (Cultural/blue) — used on every screen as category symbols and decorative elements
- **Aesthetic:** Dark, dense, military/game-like. Noise texture overlays. Squid Game green replaced by teal. Everything is a "mission", not an "event".
- **Layout:** Max-width 430px mobile-first, `padding-bottom: var(--nav-height)` for bottom nav clearance
- **Stack:** React + Vite + Framer Motion + TanStack Query + Supabase + FastAPI

The app has **10 fully wired screens** (Feed, EventDetail, Explore, PlayerProfile, Chat, Scoreboard, EditProfile, CommandCenter, NewPost, QREntry) and **6 onboarding steps**. All API calls, Supabase realtime, optimistic mutations, and routing are correctly implemented. Do NOT touch backend logic, data fetching, mutations, routing, or query keys. Only improve what the user sees and interacts with.

---

## THE PROBLEM

The app looks great in isolation but **feels clunky as a daily social app** compared to Instagram/Discord/LinkedIn. Users encounter:

1. **Feed**: Cards feel like event listings, not social posts. Missing the "I want to scroll this forever" quality of Instagram.
2. **Profile**: Correct structure but missing the micro-social signals (online status, connection degree, mutual events) that make LinkedIn/Instagram profiles feel alive.
3. **Explore**: Masonry grid is correct but cold. No "suggested for you" logic surfacing.
4. **EventDetail**: Information-dense but linear — 4 tabs feel like a form, not a social experience.
5. **Chat**: Missing the Discord-like presence and "who is in this lobby right now" energy.
6. **Onboarding**: Step 1 is stunning but Steps 2-6 feel like a form wizard.
7. **Scoreboard**: Leaderboard exists but there's no social pressure, no "you are 120 XP from overtaking Sara" contextual nudge.
8. **Global**: No persistent feedback on user actions, no micro-animations on state changes, empty states are generic.

---

## WHAT YOU MUST IMPROVE — SCREEN BY SCREEN

### 1. `Feed.jsx` + `Feed.css`

**Current state:** Instagram-style cards with: org header, cover image, action bar (save/comment/share/register), caption, comment count. Stories row at top. Scope toggle (LOCAL/NATIONAL/INTERNATIONAL). Double-tap to save. Pull to refresh. Swipe gestures.

**What's missing:**

**A) Stories row refinement:**
- Currently: flat circles with org logos and "ADD STORY" button
- Improve: Add a **gradient ring** (teal→pink→coral) on unread stories. Add a **seen state** (grayscale ring) for stories the user has tapped. The "ADD STORY" button should only show for `profile.role === 'organizer'` — for participants, replace with a **"+ CREATE EVENT" pill** that navigates to `/explore` (to discover events to register for). Display the org `name` truncated to 8 chars, not 10.

**B) Card action bar redesign:**
- Current order: [heart, comment, share] on left / [register] on right
- Problem: The **register icon** (bookmark shape) is ambiguous — users don't understand it means "register for event"
- Fix: Replace the register icon with a text pill button: `REGISTER ○` (3px border, coral color, pill shape, `height: 28px`). When registered, show `IN ✓` in teal with a checkmark. This should sit **below the caption**, not in the action bar, making the CTA impossible to miss.
- Keep save (heart), comment (chat bubble), share (arrow) in the action bar as icon-only buttons.

**C) Card footer — add event metadata strip:**
Below the caption and above the "View all N comments" line, add a single horizontal strip:
```
[■ TODAY at 20:00]  [◉ 234 going]  [○ SPORT]
```
- Date chip: dark glass background, white text, DM Mono 10px
- Attendees chip: coral/teal dot + count
- Type chip: shape symbol + type label in the type color (from `TYPE_CONFIG`)
- All on one line, `gap: 8px`, `overflow: hidden`

**D) Filter pills row:**
- Currently missing from Feed (only scope toggle exists). Add a horizontal scrollable row of event-type filter pills **between the scope toggle and the cards**:
```
ALL ○  |  SPORT ○  |  SCIENCE △  |  CHARITY □  |  CULTURAL ◇
```
- Active pill: solid type color background, black text, 1px border same color
- Inactive: `rgba(255,255,255,0.05)` background, `rgba(255,255,255,0.4)` text
- Wire to the existing `activeFilter` state already in `Feed.jsx` — it exists but is unused in the render
- When a filter is active, pass `event_type: activeFilter.toLowerCase()` to the existing `feedQuery` by adding it to the `URLSearchParams` build in `queryFn`

**E) "LIVE NOW" indicator on live events:**
- If `event.status === 'live'`, add a pulsing red dot + "LIVE" badge **overlaid on the top-left of the cover image**
- Use: `position: absolute; top: 12px; left: 12px; background: #ff4d4d; border-radius: 999px; padding: 3px 8px; font-size: 10px; font-family: DM Mono; letter-spacing: 1px; display: flex; align-items: center; gap: 4px`
- The dot pulses with `@keyframes livePulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }` at 1.2s

**F) Feed header — make it feel more alive:**
- Currently: `○△□ EVENTFY` logo + search bar shortcut + notification bell + avatar
- Add a **greeting line** under the logo: `GOOD MORNING, #{profile.player_number}` in DM Mono 10px, `rgba(255,255,255,0.3)` color. Change greeting based on `new Date().getHours()`: < 12 "GOOD MORNING", 12-17 "AFTERNOON MISSION", 17-22 "EVENING OPERATIONS", > 22 "LATE NIGHT GRIND"

---

### 2. `EventDetail.jsx` + `EventDetail.css`

**Current state:** Hero image with overlay, 4 tabs (INFO/COMMUNITY/VOLUNTEERS/SPONSORS), polymorphic type sections, XP card, sticky footer with ENTER THE GAME / YOU'RE IN / SCAN IN buttons.

**What's missing:**

**A) Attendee preview row (Instagram "liked by" style):**
After the hero, before the tabs, add a row:
```
[avatar1][avatar2][avatar3] +231 players registered
```
- Show 3 small overlapping avatars (`width: 24px, height: 24px, borderRadius: 50%, marginLeft: -8px for 2nd and 3rd`)
- Use `stableHash(event.id)` to deterministically pick fallback avatar seeds
- Use real `event.registration_count` from the API response
- Tap this row → navigate to `/event/${id}` (same page, scroll to community tab — set `activeTab('COMMUNITY')`)

**B) COMMUNITY tab — replace the two lonely buttons with a mini social feed:**
Currently: just "JOIN LOBBY CHAT ○" and "JOIN TRAVEL GROUP △" buttons in a centered block.
Replace with a proper community panel:
- **Top:** A single message input teaser: `[avatar] Write something...` row that navigates to `/chat/${event.id}` on tap (don't build full inline post — just a CTA that looks like a compose bar)
- **Below:** 3 recent chat messages previewed as cards (use the last 3 messages from `channelData?.messages` if this data was already fetched — it won't be, so just show static shimmer skeletons with a "OPEN LOBBY" button below them). Don't add a new API call.
- **Below that:** "SEE ALL ACTIVITY →" button → navigates to `/chat/${event.id}`

**C) Sticky footer improvement:**
- Currently the MANAGE, ENTER, SCAN IN buttons stack vertically with `margin-top: 8px` between them — looks like an afterthought
- Replace with a single **unified footer bar** that is context-aware:
  - Organizer owner: `[MANAGE □]` (outline gold, half width) + `[SHARE ○]` (outline white, half width) side by side in one row
  - Participant, not registered: Full-width `[ENTER THE GAME ○]` coral button
  - Participant, registered, not checked in: Half `[YOU'RE IN ✓]` (teal, disabled-looking) + Half `[SCAN IN ○]` (white outline)
  - Participant, registered, checked in: Full-width `[CHECKED IN ✓ +{xp_checkin}XP]` teal disabled button

**D) XP card upgrade:**
- Currently: static XP reward card with a shape icon
- Add a small animated shimmer effect on the `+200 PLAYER XP` text using `@keyframes shimmer`
- Add a second row showing the **badge that will be unlocked**: `[shape badge icon] SPORT ENTHUSIAST ○ — COLLECTIBLE BADGE` — this already exists in the JSX but improve the badge icon to actually render the shape in the correct type color inside a small `32x32` bordered circle

---

### 3. `Explore.jsx` + `Explore.css`

**Current state:** Search header with input, filter pills, masonry 2-column grid of trending events, horizontal org scroll row with follow buttons.

**What's missing:**

**A) Trending events section header:**
Add a section divider before the masonry grid:
```
TRENDING NOW  ○△□◇  [SEE ALL →]
```
- `SEE ALL →` changes query to sort by `starts_at` (navigate to feed with scope=national)

**B) Org cards in horizontal scroll — humanize them:**
Currently: hexagonal logo + name + member count + `+Follow` button
Add: a **secondary line** under the org name showing `N UPCOMING EVENTS` using `org.event_count` from the API response. If `org.verified`, show a tiny `✓` in blue next to the name (already done in Feed, replicate here).

**C) Search results — add a "PLAYERS" section visual upgrade:**
Currently: each user result is a flat row with avatar + username + full_name
Add a **shape badge** next to the avatar — a tiny `16px` circle/triangle/square/diamond in `profile.shape_color` with the shape symbol inside it. This communicates the player's identity at a glance and reinforces the design system.

**D) Empty explore state:**
When no events are found for a filter, show:
```
[large shape symbol in type color, opacity 0.15]
NO {FILTER} EVENTS FOUND
Try broadening your search
```
Use the filter's shape (○ for SPORT, △ for SCIENCE, etc.) at `font-size: 80px`

---

### 4. `PlayerProfile.jsx` + `PlayerProfile.css`

**Current state:** Instagram-style layout — avatar with shape ring, stats row (events/followers/following), XP progress bar, level title badge, bio, university/location, 3-tab grid (events/saved/badges). Edit Profile + Settings buttons for own profile. Follow button for other profiles.

**What's missing:**

**A) Shape avatar ring — make it dynamic:**
Currently: static teal ring around avatar
Change: The ring gradient should match `profile.shape_color`. If `shape_color` is `#13ecec`, the ring is `#13ecec → #00ffc2`. If `#ff4d4d`, the ring is `#ff4d4d → #ff2d78`. Use a `conic-gradient` or a bordered circle with `border-color: profile.shape_color`.

**B) Level badge — make it feel earned:**
Currently: a small pill below the name showing `LEVEL {n} — {title}`
Upgrade: Make the level number much larger — render `{level}` in Bebas Neue at `48px` in a `64x64` circle with the shape border, and the title text below it at `10px` DM Mono. This is a **visual identity anchor**, like a rank badge. Place it to the right of the avatar.

**C) Stats row — add mutual context:**
Currently: `{eventCount} EVENTS | {followerCount} FOLLOWERS | {followingCount} FOLLOWING`
For **other profiles**, add a 4th stat: `{mutualEventCount} MUTUAL` — use `passportData?.events_attended` from the already-fetched passport query and compare against the current user's `profile.xp` to estimate. Since we don't have a real mutual-events API endpoint, compute it client-side: `Math.min(3, stableHash(username) % 4)` as a placeholder — label it "MUTUAL EVENTS" and make it tappable to show a toast "Feature coming soon".

**D) "Events" tab grid — give each cell a type color:**
Currently: 3-column grid of `cover_url` images
Overlay the **type shape symbol** in the bottom-left corner of each cell: `position: absolute; bottom: 4px; left: 6px; font-size: 12px; color: white; opacity: 0.8; text-shadow: 0 0 4px rgba(0,0,0,0.8)`. Source from `passportData?.events_attended[i]?.events?.event_type`.

**E) "Badges" tab — animate the badge grid:**
Currently: static 3-column grid of badges
Add staggered entrance animation: each badge cell uses `initial={{ opacity: 0, scale: 0.8 }}`, `animate={{ opacity: 1, scale: 1 }}`, `transition={{ delay: index * 0.05 }}`. Already using Framer Motion in the file — just add these props to each grid item.

**F) For own profile — "PASSPORT" quick action:**
Below the stats row, add a thin horizontal banner:
```
[◇ shape icon] VIEW YOUR PLAYER PASSPORT  →
```
Background: `rgba(255,255,255,0.03)`, border: `1px solid rgba(255,255,255,0.06)`. Navigates to `/passport/${profile.username}`. This surfaces a feature that currently has no entry point from the profile screen.

---

### 5. `Chat.jsx` + `Chat.css`

**Current state:** Full-screen event lobby chat. Header shows event title. Messages with sender avatar, username, timestamp. Broadcast panel (org-only). DM modal. Poll modal. Own messages right-aligned in coral. Other messages left-aligned with avatar.

**What's missing:**

**A) Header — add live attendee count:**
The header currently shows: `← | MISSION: {event title} | ◉`
Add below the title: `{registration_count} PLAYERS IN LOBBY` in DM Mono 10px, teal color. Source: the `channelData` response already contains the channel info — use `channelData?.channels?.[0]?.event_id` and note that `registration_count` is available from the EventDetail query cache. Use `useQueryClient().getQueryData(['event', eventId])?.registration_count ?? '?'` to get it without a new fetch.

**B) System messages — style them properly:**
Currently: system messages (`msg_type === 'system'`) render as regular messages
Change: center-align them, wrap in a subtle divider line:
```css
.chat-system-msg {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 16px; margin: 8px 0;
}
.chat-system-msg::before, .chat-system-msg::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(255,255,255,0.05);
}
```
The text: DM Mono, 10px, `rgba(255,255,255,0.3)`, letter-spacing 1px

**C) Message timestamps — show on tap:**
Currently: timestamps are always visible under each message
Change: hide timestamps by default, show them only when the user taps/holds a message. Use a `useState` per-message or a single `visibleTimestamp` state: `const [visibleTimestamp, setVisibleTimestamp] = useState(null)`. On `onClick` of any message bubble, `setVisibleTimestamp(msg.id)`. Show `created_at` formatted as `HH:mm` in DM Mono 9px, faded, only when `visibleTimestamp === msg.id`.

**D) Reaction animation — upgrade the double-tap heart:**
Currently: double-tap other messages adds a ❤ reaction via API
Add a visual: when the mutation succeeds, briefly show a floating `❤` emoji that animates from the tapped message upward and fades:
```jsx
<motion.div
    initial={{ opacity: 1, y: 0, scale: 0.8 }}
    animate={{ opacity: 0, y: -40, scale: 1.4 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    style={{ position: 'absolute', fontSize: '20px', pointerEvents: 'none', zIndex: 10 }}
>
    ❤
</motion.div>
```
Use `AnimatePresence` and a `reactionAnim` state similar to how `heartAnim` works in Feed.

**E) Input bar upgrade:**
Currently: text input + send button
Add three icon buttons before the text input: `📎` (file), `🖼` (image), `⊕` (poll — only visible for orgs). These already have `fileRef`, `imgRef` refs and state for `showPollModal` in the component — just surface them as icon buttons in the input row instead of being hidden. For participants, show only 📎 and 🖼 greyed out (they're UI-only stubs, no functional change needed).

---

### 6. `Scoreboard.jsx` + (its CSS)

**Current state:** 3 tabs — Leaderboard (top 15, clickable rows), Badges, Achievements. Current user is highlighted with `isCurrentUser` check. Level info computed from XP.

**What's missing:**

**A) "YOU ARE HERE" contextual position card:**
Currently: the current user appears in the list only if they're in the top 15
Add a **sticky card at the top** (above the list, below the tab bar) that always shows the current user's rank:
```
YOUR RANK: #47 of 2,341 PLAYERS
[progress bar showing XP gap to next rank]
120 XP to overtake [username of rank #46]
```
- Data: the scoreboard API returns all entries. Find `currentUserRank` by searching `entries.find(e => e.user_id === profile.id)`. If not in the returned 15, show `#?` and `"Keep earning XP to enter the leaderboard"`.
- Progress bar: `xpToOvertake = entries[currentUserRank - 2]?.xp - currentUserXp` (person just above). Width: `100 - (xpToOvertake / 500 * 100)` clamped to 0-100%.
- Style: `background: rgba(255,215,0,0.05)`, `border: 1px solid rgba(255,215,0,0.2)`, gold text for the rank number.

**B) Leaderboard row — add shape identity:**
Currently: rank number + avatar + username + XP
Add: the user's `shape` symbol (○△□◇) in their `shape_color` color between the avatar and the username. This reinforces the shape identity system everywhere.

**C) Top 3 podium:**
Before the scrollable list, add a visual podium for rank 1, 2, 3:
- Three cards side by side (2nd left, 1st center tall, 3rd right) — classic podium layout
- 1st: `height: 100px`, gold border, gold shape symbol, `FRONT MAN` label
- 2nd: `height: 80px`, silver (`rgba(255,255,255,0.4)`) border
- 3rd: `height: 60px`, bronze (`#cd7f32`) border
- Below rank 4+, show the compact list rows as currently implemented

**D) Badges tab — add category grouping:**
Currently: flat grid of all badges
Group by `badge.shape` (circle/triangle/square/diamond) with a small header label for each group. Use `Object.groupBy` or a manual reduce. Each group header shows the shape symbol + count: `○ CIRCLE BADGES (3)`.

---

### 7. Onboarding Steps 2-6 (`OnboardingStep2.jsx` through `OnboardingStep6.jsx`)

**Current state:** Each step is a self-contained screen with a sticky header, progress bar, form content, and a CTA button. The logic is correct and wired to Supabase.

**What's missing:**

**A) Step 2 (Identity) — avatar upload feels dead:**
The hexagonal upload zone shows just an up-arrow icon. When the user hasn't uploaded an avatar:
- Animate the hex border with a rotating dashed border: `animation: hexSpin 3s linear infinite; @keyframes hexSpin { from { filter: hue-rotate(0deg) } to { filter: hue-rotate(360deg) } }` — creates a rainbow effect on the clip-path border
- Add a subtle text cycle below "Upl0ad Identity": every 2s cycle through "ADD YOUR FACE", "CHOOSE YOUR IDENTITY", "SET YOUR IMAGE" using a `useState` + `setInterval`

**B) Step 3 (Skills) — empty cloud feels intimidating:**
If the skills API returns 0 results (or is loading), show 8 **skeleton pill buttons** with pulse animation so the screen never looks empty.
If loaded, animate the pills entrance with staggered `initial={{ opacity:0, scale:0.8 }}` / `animate={{ opacity:1, scale:1 }}` with `transition={{ delay: i * 0.03 }}`.

**C) Step 5 (Allies) — add a "SKIP ALL" vs "FOLLOW ALL" decision:**
Currently: one CTA button that either says "FOLLOW N ALLIES △" or "SKIP FOR NOW △"
Add a secondary ghost button below: `[FOLLOW ALL]` — on tap, mark all orgs as followed: `setFollowedIds(new Set(orgs.map(o => o.id)))`. This is a single tap to follow everything, very common in onboarding (Instagram does this with "Follow All Suggested").

**D) Step 6 (Final) — "ENTER THE ARENA" button — add pre-launch haptic + sound feeling:**
When the user taps the button:
1. First tap: `navigator.vibrate([100, 50, 100])` (double pulse)
2. Then the button enters a loading state showing a countdown-style animation: replace text with `3... 2... 1...` using `setInterval` over 3 seconds, then navigate
3. This mirrors the Squid Game countdown energy and gives the onboarding a climactic finish

---

### 8. Global — Cross-Screen UX Improvements

These apply everywhere and should be added to `index.css` or the relevant component CSS:

**A) Toast notification system:**
Add a lightweight toast component to `AppShell.jsx`. Create `src/components/Toast.jsx`:
- A fixed-position element: `position: fixed; bottom: calc(var(--nav-height) + 16px); left: 50%; transform: translateX(-50%); z-index: 200`
- State: `{ message, type: 'success'|'error'|'info', visible }`
- Show for 2.5 seconds then auto-dismiss with a slide-up + fade animation
- Expose via a Context: `useToast()` → `showToast(message, type)`
- Wire it to existing mutations: after `saveMutation` succeeds → `showToast('EVENT SAVED ◇', 'success')`. After `registerMutation` succeeds → `showToast('REGISTERED ✓ CHECK YOUR NOTIFICATIONS', 'success')`. After any error → `showToast(error.message, 'error')`.

**B) Scroll-to-top on nav tab tap:**
Already implemented in BottomNav with `window.scrollTo({ top: 0, behavior: 'smooth' })`. Keep as-is. ✓

**C) Page transitions — differentiate push vs pop:**
Currently: `fadeTransition` from `transitions.js` is used for all route changes. This means going back from EventDetail to Feed feels the same as navigating forward. Add a direction-aware transition:
- When navigating forward (to deeper routes): `x: 24` slide in from right
- When navigating back: `x: -24` slide in from left
- Detect direction using the browser's `history.state.idx` (React Router v6 popstate behavior): `const isBack = window.history.state?.idx < prevIdx`
- Simpler alternative: just use `slideUpTransition` for detail screens (EventDetail, PlayerProfile, OrgProfile, Chat) and `fadeTransition` for top-level tabs (Feed, Explore, Scoreboard). Define both in `transitions.js`.

**D) Empty state illustrations — replace generic SVG icons:**
Currently: error states and empty states use generic SVG warning icons.
Replace all empty states with **shape-based illustrations** using the design system:
```
Large ○ (80px, opacity 0.06) centered
Small △ (40px, opacity 0.06) offset top-right
Tiny □ (24px, opacity 0.04) offset bottom-left
```
Stacked absolutely behind the text. This creates a depth effect using only the existing shape language — no new assets needed.

**E) Haptic feedback — standardize:**
Add `navigator.vibrate(30)` to:
- Every primary CTA tap (register, save, send message, complete onboarding step)
- Every successful mutation
- `navigator.vibrate([50, 30, 50])` for errors (double pulse)
Wrap in a utility: `export function haptic(pattern = 30) { if (navigator.vibrate) navigator.vibrate(pattern); }`
Place in `src/lib/haptic.js`. Import it in Feed, EventDetail, Chat, Scoreboard.

**F) `BottomNav` — add a floating active indicator:**
Currently: active item shows the shape in full color + a 4px dot below it.
Add a `layoutId="nav-bg"` Framer Motion `div` behind the active item that slides between tabs — a rounded rectangle (40x40) in `rgba(activeColor, 0.1)` that smoothly animates position when the active tab changes. This is the classic Discord/Instagram "pill slides under active tab" pattern.

---

## CONSTRAINTS — WHAT YOU MUST NOT CHANGE

1. **Do not change any `api()` calls, `useQuery`, `useMutation`, `useInfiniteQuery`, or Supabase calls.** All data fetching is correct.
2. **Do not change any `navigate()` calls or route paths.** Routing is complete and correct.
3. **Do not change the Squid Game color palette.** No new colors. If you need a new shade, use `rgba()` of an existing color.
4. **Do not change font families.** Bebas Neue, Space Grotesk, DM Mono only.
5. **Do not rebuild any screen from scratch.** All improvements are additive on top of existing JSX.
6. **Do not add new npm packages.** Everything can be done with Framer Motion (already installed), native CSS, and vanilla JS.
7. **Do not change `AuthContext.jsx`, `EventStore.jsx`, `AppRouter.jsx`, `AppShell.jsx`, `supabase.js`, or `api.js`.** These are infrastructure files.
8. **Preserve all existing class names** — other CSS may depend on them. Add new classes, don't rename old ones.
9. **`OnboardingSteps.jsx`** is a static design preview file — do not touch it.
10. **The `○△□◇` shape system** must appear consistently — any new UI element that references an event type must use the correct shape.

---

## PRIORITY ORDER

Work in this order:

1. **Feed improvements** (A, B, C, D, E, F) — this is the daily home screen, highest impact
2. **Global toast system** — needed by everything else
3. **Haptic utility** — one file, used everywhere
4. **EventDetail footer unification** — removes the broken multi-button stacking
5. **Scoreboard "YOU ARE HERE" card** — highest social pressure, biggest engagement driver
6. **PlayerProfile shape ring + level badge** — identity, visited daily
7. **Chat timestamps + system messages** — polish
8. **Explore section headers + player shape badge** — discovery
9. **Onboarding step animations** — only new users see this, lower priority
10. **Page transition direction awareness** — nice to have, last

---

## DESIGN REFERENCES TO KEEP IN MIND

- **Instagram Feed:** The card structure is correct. What makes Instagram addictive is the rhythm — every card is the same *structure* but different *content*. Keep the structure rigid. Add the metadata strip (Fix C) so every card communicates the 3 most important facts in one glance.
- **Instagram Stories:** Gradient rings, seen/unseen states. Already close — just add the seen state dimming.
- **Discord Chat:** The key thing Discord does is make the **server feel alive** — online members count, reactions visible at a glance, system messages separating conversation threads. Apply Fix B (system message dividers) and Fix A (lobby count).
- **LinkedIn Profile:** The "mutual connections" and "2nd degree" signals make every profile feel contextually relevant. Fix C (mutual events count) achieves the same thing for events.
- **Squid Game Energy** (preserve this): The countdown in Step 6, the "PLAYER #4821" framing, the military lexicon ("MISSION", "SCAN IN", "ENTER THE ARENA"), the shape identity. Never let the Instagram-comfort improvements wash out this identity.
