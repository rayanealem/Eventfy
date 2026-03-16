# UX/UI Audit Report

## 1. Motion & Routing Flaws

**Missing `<AnimatePresence>` Wrappers:**
The following screens currently lack `<AnimatePresence>` to orchestrate entering and exiting animations properly:
- `frontend/src/screens/settings/Settings.jsx`
- `frontend/src/screens/business/Business.jsx`
- `frontend/src/screens/passport/PlayerPassport.jsx`
- `frontend/src/screens/lobby/TeamLobby.jsx`
- `frontend/src/screens/editprofile/EditProfile.jsx`
- `frontend/src/screens/command/CommandCenter.jsx`
- `frontend/src/screens/verify/VerifyCertificate.jsx`
- `frontend/src/screens/chat/DiscordLayout.jsx`
- `frontend/src/screens/chat/ChatHub.jsx`
- `frontend/src/screens/org/OrgDashboard.jsx`
- `frontend/src/screens/orgsetup/OrgSetup.jsx`
- `frontend/src/screens/post/NewPost.jsx`
- `frontend/src/screens/admin/AdminPanel.jsx`
- `frontend/src/screens/analytics/Analytics.jsx`
- `frontend/src/screens/volunteer/VolunteerMode.jsx`
- `frontend/src/screens/event/EventRegister.jsx`
- `frontend/src/screens/event/EventDetail.jsx`
- All `Auth` screens (`Splash.jsx`, `OrgRegisterAuth.jsx`, `OrgLoginAuth.jsx`, `ParticipantRegisterAuth.jsx`, `ParticipantLoginAuth.jsx`)
- All `Onboarding` screens

**Slow Non-Physics Transitions:**
The following files contain Framer Motion transitions that rely on slow time durations (e.g., `duration: 0.3` to `0.7`) rather than the required physical spring mechanics (`type: "spring", stiffness: 400, damping: 35`):
- `frontend/src/router/transitions.js`: The base expand transitions use slow easings `duration: 0.3, ease: 'easeOut'`
- `frontend/src/screens/explore/Explore.jsx`: Uses `duration: 0.4` with `stiffness: 200, damping: 25`
- `frontend/src/screens/feed/Feed.jsx`: Uses `duration: 0.35` with `stiffness: 250, damping: 25`
- `frontend/src/screens/event/EventRegister.jsx`: Uses `duration: 0.5`
- `frontend/src/screens/auth/Splash.jsx`: Uses linear `duration: 0.7` and `duration: 0.4`

## 2. Shared Element Disconnects

**Missing/Mismatched `layoutId` Tags:**
Across the entire application, there is a severe lack of `layoutId` usage to create seamless expansions. Only two files currently utilize `layoutId`:
- `frontend/src/components/BottomNav.jsx` (`layoutId="nav-indicator"`)
- `frontend/src/screens/event/EventDetail.jsx` (`layoutId="event-image-{id}"`)

**Critical Disconnects Identified:**
- `Feed.jsx`: Event cover images in the feed lack `layoutId="event-image-{id}"`, meaning tapping a feed item does not expand smoothly into `EventDetail.jsx`.
- `Explore.jsx`: Event cover images in the explore grid lack `layoutId="event-image-{id}"`, resulting in an instant snap when navigating to `EventDetail.jsx`.
- `OrgProfile.jsx` / `Feed.jsx`: Organization avatars and logos lack `layoutId="org-logo-{id}"`, preventing fluid transitions when clicking a story or org link.
- `PlayerProfile.jsx` / `Scoreboard.jsx`: Player avatars lack `layoutId="player-avatar-{id}"`.

## 3. Tactile Interaction Gaps

**Instant Snapping State Changes (Missing Sliding Pill):**
The following files rely on instant React state/CSS class toggling (`className={isActive ? 'active' : ''}`) for tabs and filters instead of a fluid Framer Motion sliding background pill:
- `frontend/src/screens/create/CreateEvent.jsx` (multiple instances: toggles, shape selectors, color swatches)
- `frontend/src/screens/explore/Explore.jsx` (filter pills)
- `frontend/src/screens/chat/DiscordLayout.jsx` (server icons)
- `frontend/src/screens/chat/Chat.jsx` (channel items)
- `frontend/src/screens/chat/ChatHub.jsx` (hub items)
- `frontend/src/screens/org/OrgProfile.jsx` (tabs)
- `frontend/src/screens/orgsetup/OrgSetup.jsx` (progress icons and categories)
- `frontend/src/screens/feed/Feed.jsx` (scope toggles and filter pills)
- `frontend/src/screens/post/NewPost.jsx` (audience tags and type buttons)
- `frontend/src/screens/event/EventDetail.jsx` (info/community/volunteers/sponsors tabs)
- `frontend/src/screens/auth/OrgRegisterAuth.jsx` (org type buttons)
- `frontend/src/screens/onboarding/OnboardingStep2.jsx` (shapes and colors)
- `frontend/src/screens/onboarding/OnboardingStep4.jsx` (radar radius buttons)

**Missing `whileTap={{ scale: 0.85 }}` Physics:**
While `EventDetail.jsx` and some other screens have begun implementing `whileTap={{ scale: 0.95 }}`, standard buttons and interactive cards across the following components completely lack the tactile tap compression physics:
- All custom toggle switches in `CreateEvent.jsx`
- Category and radius buttons in the `Onboarding` flow
- Tab buttons in `OrgProfile.jsx`
- Feed filter pills in `Feed.jsx` and `Explore.jsx`
- Note: Even where `whileTap` is used, the scale is generally set to `0.95` or `0.96` instead of the more tactile `0.85` requested.

## 4. Aesthetic Inconsistencies

**Pure Hex Colors Missing Noise Texture:**
The following files use raw dark hex colors (`#000000`, `#0A0A0F`, `#111111`, `black`, `rgba(0,0,0,x)`) as primary backgrounds without an applied noise texture class/overlay.
- `frontend/src/screens/settings/Settings.css` (`#000000`)
- `frontend/src/screens/profile/PlayerProfile.css` (`black`)
- `frontend/src/screens/notifications/Notifications.css` (`#000000`, `#111111`)
- `frontend/src/screens/story/Story.css` (`#0A0A0F`, `rgba(0,0,0,0.6)`)
- `frontend/src/screens/explore/Explore.css` (`black`, `rgba(0,0,0,0.8)`)
- `frontend/src/screens/chat/Chat.css` (`rgba(0,0,0,0.6)`)
- `frontend/src/screens/feed/Feed.css` (`black`, `rgba(0,0,0,0.8)`)
- `frontend/src/screens/event/EventDetail.css` (`black`, `rgba(0,0,0,0.95)`)
- `frontend/src/screens/auth/Splash.css` (`black`)
- `frontend/src/screens/editprofile/EditProfile.css` (`rgba(0,0,0,0.8)`)
- `frontend/src/screens/onboarding/OnboardingSteps.css` (`rgba(0,0,0,0.8)`)

**Typography Hierarchy Violations (Data Missing DM Mono):**
Many data points in the UI inherit the standard body font (Space Grotesk) and fail to apply the `DM Mono` monospace typeface required to look technical.
- `frontend/src/screens/feed/Feed.jsx`: Registration counts (`event.registration_count`), capacity amounts, countdown timers, and comment timestamps inherit standard body fonts or use inline styles missing `DM Mono`.
- `frontend/src/components/BottomNav.jsx`: Any numerical badges.
- `frontend/src/screens/profile/PlayerProfile.jsx`: XP totals and level indicators.
- `frontend/src/screens/scoreboard/Scoreboard.jsx`: Rank and point totals.
- `frontend/src/screens/event/EventDetail.jsx`: Dates, times, ticket prices, and spot availability.