import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AppShell from './AppShell';
import { AuthGuard, GuestGuard, OrgGuard, AdminGuard } from './router/guards/AuthGuard';

// Auth screens (eager load — entry points)
import Splash from './screens/auth/Splash';
import ParticipantLoginAuth from './screens/auth/ParticipantLoginAuth';
import ParticipantRegisterAuth from './screens/auth/ParticipantRegisterAuth';
import OrgLoginAuth from './screens/auth/OrgLoginAuth';
import OrgRegisterAuth from './screens/auth/OrgRegisterAuth';

// Core screens (eager load)
import Feed from './screens/feed/Feed';
import EventDetail from './screens/event/EventDetail';
import Explore from './screens/explore/Explore';
import PlayerProfile from './screens/profile/PlayerProfile';
import Chat from './screens/chat/Chat';
import ChatHub from './screens/chat/ChatHub';
import Notifications from './screens/notifications/Notifications';
import Settings from './screens/settings/Settings';
import OrgDashboard from './screens/org/OrgDashboard';
import OrgProfile from './screens/org/OrgProfile';
import TeamLobby from './screens/lobby/TeamLobby';
import Scoreboard from './screens/scoreboard/Scoreboard';
import CreateEvent from './screens/create/CreateEvent';
import QREntry from './screens/qr/QREntry';
import VolunteerMode from './screens/volunteer/VolunteerMode';
import Analytics from './screens/analytics/Analytics';
import CommandCenter from './screens/command/CommandCenter';
import NewPost from './screens/post/NewPost';
import VerifyCertificate from './screens/verify/VerifyCertificate';
import PlayerPassport from './screens/passport/PlayerPassport';
import AdminPanel from './screens/admin/AdminPanel';
import Business from './screens/business/Business';
import OrgSetup from './screens/orgsetup/OrgSetup';
import EditProfile from './screens/editprofile/EditProfile';
import Story from './screens/story/Story';
import StoryCreate from './screens/story/StoryCreate';

// Onboarding
import Onboarding from './screens/onboarding/Onboarding';
import OnboardingStep2 from './screens/onboarding/OnboardingStep2';
import OnboardingStep3 from './screens/onboarding/OnboardingStep3';
import OnboardingStep4 from './screens/onboarding/OnboardingStep4';
import OnboardingStep5 from './screens/onboarding/OnboardingStep5';
import OnboardingStep6 from './screens/onboarding/OnboardingStep6';



const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell />,
        children: [
            // Redirects
            { index: true, element: <Navigate to="/splash" replace /> },

            // Auth (GuestGuard - public)
            { path: 'splash', element: <GuestGuard><Splash /></GuestGuard> },
            { path: 'auth/participant/login', element: <GuestGuard><ParticipantLoginAuth /></GuestGuard> },
            { path: 'auth/participant/register', element: <GuestGuard><ParticipantRegisterAuth /></GuestGuard> },
            { path: 'auth/org/login', element: <GuestGuard><OrgLoginAuth /></GuestGuard> },
            { path: 'auth/org/register', element: <GuestGuard><OrgRegisterAuth /></GuestGuard> },

            // Onboarding (AuthGuard)
            { path: 'onboarding/1', element: <AuthGuard><Onboarding /></AuthGuard> },
            { path: 'onboarding/2', element: <AuthGuard><OnboardingStep2 /></AuthGuard> },
            { path: 'onboarding/3', element: <AuthGuard><OnboardingStep3 /></AuthGuard> },
            { path: 'onboarding/4', element: <AuthGuard><OnboardingStep4 /></AuthGuard> },
            { path: 'onboarding/5', element: <AuthGuard><OnboardingStep5 /></AuthGuard> },
            { path: 'onboarding/6', element: <AuthGuard><OnboardingStep6 /></AuthGuard> },

            // Core (AuthGuard)
            { path: 'feed', element: <AuthGuard><Feed /></AuthGuard> },
            { path: 'explore', element: <AuthGuard><Explore /></AuthGuard> },
            { path: 'event/create', element: <OrgGuard><CreateEvent /></OrgGuard> },
            { path: 'event/:id', element: <AuthGuard><EventDetail /></AuthGuard> },
            { path: 'event/:id/teams', element: <AuthGuard><TeamLobby /></AuthGuard> },

            // Profile
            { path: 'profile/me', element: <AuthGuard><PlayerProfile /></AuthGuard> },
            { path: 'profile/edit', element: <AuthGuard><EditProfile /></AuthGuard> },
            { path: 'profile/:username', element: <AuthGuard><PlayerProfile /></AuthGuard> },
            { path: 'org/dashboard', element: <OrgGuard><OrgDashboard /></OrgGuard> },
            { path: 'org/:orgId', element: <AuthGuard><OrgProfile /></AuthGuard> },
            { path: 'org/setup', element: <AuthGuard><OrgSetup /></AuthGuard> },
            { path: 'passport/:username', element: <AuthGuard><PlayerPassport /></AuthGuard> },

            // Gamification
            { path: 'scoreboard', element: <AuthGuard><Scoreboard /></AuthGuard> },

            // Social
            { path: 'chat', element: <AuthGuard><ChatHub /></AuthGuard> },
            { path: 'chat/:eventId', element: <AuthGuard><Chat /></AuthGuard> },
            { path: 'stories/create', element: <AuthGuard><StoryCreate /></AuthGuard> },
            { path: 'stories/:orgId', element: <AuthGuard><Story /></AuthGuard> },
            { path: 'notifications', element: <AuthGuard><Notifications /></AuthGuard> },

            // QR — single route, mode auto-detected by role
            { path: 'qr/:eventId', element: <AuthGuard><QREntry /></AuthGuard> },

            // Volunteer / Organizer
            { path: 'volunteer/:eventId', element: <AuthGuard><VolunteerMode /></AuthGuard> },
            { path: 'manage/:eventId', element: <OrgGuard><CommandCenter /></OrgGuard> },
            { path: 'manage/:eventId/analytics', element: <OrgGuard><Analytics /></OrgGuard> },
            { path: 'post/create', element: <OrgGuard><NewPost /></OrgGuard> },

            // Business
            { path: 'recruit', element: <AuthGuard><Business /></AuthGuard> },

            // Settings & Admin
            { path: 'settings', element: <AuthGuard><Settings /></AuthGuard> },
            { path: 'admin', element: <AdminGuard><AdminPanel /></AdminGuard> },

            // Certificate (public, no auth)
            { path: 'verify/:certId', element: <VerifyCertificate /> },

            // Catch-all
            { path: '*', element: <Navigate to="/splash" replace /> },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
