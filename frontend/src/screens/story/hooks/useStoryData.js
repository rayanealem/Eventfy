import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';

/**
 * useStoryData — Fetches story data for the viewer.
 *
 * Two modes:
 * 1. Single-user mode (orgId param) — fetches stories for one user/org
 * 2. Tray mode (storyTray param) — uses pre-fetched grouped story data
 */
export default function useStoryData(orgId) {
    const { profile } = useAuth();

    // Fetch org/user info for the header
    const { data: ownerInfo } = useQuery({
        queryKey: ['storyOwner', orgId],
        queryFn: async () => {
            // Try as org first
            try {
                const org = await api('GET', `/organizations/${orgId}`);
                if (org && org.name) return { type: 'org', name: org.name, avatar: org.logo_url, id: orgId };
            } catch {}

            // Try as user profile
            try {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .eq('id', orgId)
                    .single();
                if (userProfile) {
                    return {
                        type: 'user',
                        name: userProfile.full_name || userProfile.username || 'User',
                        avatar: userProfile.avatar_url,
                        id: orgId,
                    };
                }
            } catch {}

            return { type: 'unknown', name: 'EVENTFY', avatar: null, id: orgId };
        },
        enabled: !!orgId,
        staleTime: 60000,
    });

    // Fetch stories with frames
    const { data: stories = [], isLoading } = useQuery({
        queryKey: ['viewerStories', orgId],
        queryFn: async () => {
            const now = new Date().toISOString();

            // Try org stories
            try {
                const { data: orgData } = await supabase
                    .from('stories')
                    .select('*, story_frames(*)')
                    .eq('org_id', orgId)
                    .gt('expires_at', now)
                    .order('created_at', { ascending: true });
                if (orgData && orgData.length > 0) return orgData;
            } catch {}

            // Try user stories
            try {
                const { data: userData } = await supabase
                    .from('stories')
                    .select('*, story_frames(*)')
                    .eq('user_id', orgId)
                    .gt('expires_at', now)
                    .order('created_at', { ascending: true });
                if (userData && userData.length > 0) return userData;
            } catch {}

            return [];
        },
        enabled: !!orgId,
    });

    // Build frames list: flatten all story frames in order
    const allFrames = stories.flatMap(story => {
        const frames = story.story_frames || [];
        return frames.map(f => ({ ...f, _storyId: story.id, _story: story }));
    });

    // Check if the current user is the story owner
    const isOwner = (story) => {
        if (!story || !profile) return false;
        return profile.id === story.user_id ||
            profile.id === orgId ||
            profile.managed_orgs?.some(o => o.id === story.org_id);
    };

    // Record a view
    const recordView = async (storyId) => {
        try {
            await api('POST', `/stories/${storyId}/view`);
        } catch {}
    };

    return {
        ownerInfo,
        stories,
        allFrames,
        isLoading,
        profile,
        isOwner,
        recordView,
    };
}
