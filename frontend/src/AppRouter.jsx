import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AppShell from './AppShell';

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
import Notifications from './screens/notifications/Notifications';
import Settings from './screens/settings/Settings';
import OrgProfile from './screens/org/OrgProfile';
import TeamLobby from './screens/lobby/TeamLobby';
import Scoreboard from './screens/scoreboard/Scoreboard';
import CreateEvent from './screens/create/CreateEvent';
import QREntry from './screens/qr/QREntry';
import VolunteerModeScreen from './screens/volunteer/VolunteerMode';
import AnalyticsScreen from './screens/analytics/Analytics';
import CommandCenterScreen from './screens/command/CommandCenter';
import NewPostScreen from './screens/post/NewPost';
import VerifyCertificateScreen from './screens/verify/VerifyCertificate';
import PlayerPassportScreen from './screens/passport/PlayerPassport';
import AdminPanelScreen from './screens/admin/AdminPanel';
import BusinessScreen from './screens/business/Business';
import OrgSetupScreen from './screens/orgsetup/OrgSetup';
import OnboardingScreen from './screens/onboarding/Onboarding';
import EditProfileScreen from './screens/editprofile/EditProfile';
import StoryScreen from './screens/story/Story';
import OnboardingStep2Screen from './screens/onboarding/OnboardingStep2';
import OnboardingStep3Screen from './screens/onboarding/OnboardingStep3';
import OnboardingStep4Screen from './screens/onboarding/OnboardingStep4';
import OnboardingStep5Screen from './screens/onboarding/OnboardingStep5';
import OnboardingStep6Screen from './screens/onboarding/OnboardingStep6';

// Placeholder for screens not yet fully built
import PlaceholderScreen from './screens/PlaceholderScreen';

// Placeholder component factories
// Explore and EventDetail imported above
// const Explore - see import
// const EventDetail - see import
// CreateEvent imported above
// TeamLobby imported above
// PlayerProfile imported above
const EditProfile = () => <EditProfileScreen />;
// OrgProfile imported above
const OrgSetup = () => <OrgSetupScreen />;
const GamificationHub = () => <Scoreboard />;
const Leaderboard = () => <Scoreboard />;
// Chat imported above
const StoryViewer = () => <StoryScreen />;
const StoryCreate = () => <StoryScreen />;
const QRTicket = () => <QREntry />;
const QRScanner = () => <QREntry />;
const VolunteerMode = () => <VolunteerModeScreen />;
const CommandCenter = () => <CommandCenterScreen />;
const Analytics = () => <AnalyticsScreen />;
const NewPost = () => <NewPostScreen />;
const RecruiterDashboard = () => <BusinessScreen />;
const SponsorshipPortal = () => <BusinessScreen />;
const TravelMode = () => <PlaceholderScreen title="TRAVEL MODE" icon="○" color="#3b82f6" />;
const Connections = () => <PlaceholderScreen title="NETWORK" icon="◇" color="#00ffc2" />;
// Notifications imported above
// Settings imported above
const AdminPanel = () => <AdminPanelScreen />;
const SearchResults = () => <PlaceholderScreen title="SEARCH" icon="△" color="#ffd700" />;
const CertVerify = () => <VerifyCertificateScreen />;
const PlayerPassport = () => <PlayerPassportScreen />;

// Onboarding
const Step1 = () => <OnboardingScreen />;
const Step2 = () => <OnboardingStep2Screen />;
const Step3 = () => <OnboardingStep3Screen />;
const Step4 = () => <OnboardingStep4Screen />;
const Step5 = () => <OnboardingStep5Screen />;
const Step6 = () => <OnboardingStep6Screen />;

const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell />,
        children: [
            // Redirects
            { index: true, element: <Navigate to="/splash" replace /> },

            // Auth (GuestGuard - public)
            { path: 'splash', element: <Splash /> },
            { path: 'auth/participant/login', element: <ParticipantLoginAuth /> },
            { path: 'auth/participant/register', element: <ParticipantRegisterAuth /> },
            { path: 'auth/org/login', element: <OrgLoginAuth /> },
            { path: 'auth/org/register', element: <OrgRegisterAuth /> },

            // Onboarding (AuthGuard + NotCompleted)
            { path: 'onboarding/1', element: <Step1 /> },
            { path: 'onboarding/2', element: <Step2 /> },
            { path: 'onboarding/3', element: <Step3 /> },
            { path: 'onboarding/4', element: <Step4 /> },
            { path: 'onboarding/5', element: <Step5 /> },
            { path: 'onboarding/6', element: <Step6 /> },

            // Core (AuthGuard)
            { path: 'feed', element: <Feed /> },
            { path: 'explore', element: <Explore /> },
            { path: 'search', element: <SearchResults /> },
            { path: 'event/:id', element: <EventDetail /> },
            { path: 'event/create', element: <CreateEvent /> },
            { path: 'event/:id/teams', element: <TeamLobby /> },

            // Profile
            { path: 'profile/:username', element: <PlayerProfile /> },
            { path: 'profile/edit', element: <EditProfile /> },
            { path: 'org/:orgId', element: <OrgProfile /> },
            { path: 'org/setup', element: <OrgSetup /> },
            { path: 'passport', element: <PlayerPassport /> },

            // Gamification
            { path: 'hub', element: <GamificationHub /> },
            { path: 'hub/leaderboard', element: <Leaderboard /> },

            // Social
            { path: 'chat', element: <Chat /> },
            { path: 'chat/:eventId', element: <Chat /> },
            { path: 'stories/:orgId', element: <StoryViewer /> },
            { path: 'stories/create', element: <StoryCreate /> },
            { path: 'network', element: <Connections /> },
            { path: 'notifications', element: <Notifications /> },

            // QR
            { path: 'ticket/:eventId', element: <QRTicket /> },
            { path: 'scan', element: <QRScanner /> },

            // Volunteer / Organizer
            { path: 'volunteer/:eventId', element: <VolunteerMode /> },
            { path: 'manage/:eventId', element: <CommandCenter /> },
            { path: 'manage/:eventId/analytics', element: <Analytics /> },
            { path: 'post/create', element: <NewPost /> },

            // Business
            { path: 'recruit', element: <RecruiterDashboard /> },
            { path: 'sponsor', element: <SponsorshipPortal /> },
            { path: 'travel', element: <TravelMode /> },

            // Settings & Admin
            { path: 'settings', element: <Settings /> },
            { path: 'admin', element: <AdminPanel /> },

            // Certificate
            { path: 'verify/:certId', element: <CertVerify /> },

            // Catch-all
            { path: '*', element: <Navigate to="/splash" replace /> },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
