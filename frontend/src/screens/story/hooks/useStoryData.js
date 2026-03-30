import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { FALLBACK_STORIES } from '../constants';

/**
 * useStoryData — Fetches org info, stories (org → user fallback → hardcoded fallback),
 * and owner analytics. Centralizes all story data fetching.
 */
export default function useStoryData(orgId) {
    const { profile } = useAuth();

    // Fetch org info
    const { data: org } = useQuery({
        queryKey: ['org', orgId],
        queryFn: async () => {
            try {
                return await api('GET', `/organizations/${orgId}`);
            } catch {
                return { name: 'EVENTFY ORG', logo_url: null };
            }
        },
        enabled: !!orgId,
    });

    // Fetch stories (org stories first, fallback to personal user stories)
    const { data: stories = FALLBACK_STORIES } = useQuery({
        queryKey: ['stories', orgId],
        queryFn: async () => {
            try {
                // Try fetching as organization stories first via Supabase directly
                const { data: orgData } = await supabase
                    .from('stories')
                    .select('*, story_frames(*), organizations(id, name, slug, logo_url)')
                    .eq('org_id', orgId)
                    .gt('expires_at', new Date().toISOString())
                    .order('created_at', { ascending: true });
                if (orgData && orgData.length > 0) return orgData;
            } catch { }

            try {
                // Fallback: fetch personal user stories via Supabase directly
                const { data: userData } = await supabase
                    .from('stories')
                    .select('*, story_frames(*), profiles(username, full_name, avatar_url, shape, shape_color)')
                    .eq('user_id', orgId)
                    .gt('expires_at', new Date().toISOString())
                    .order('created_at', { ascending: true });

                if (userData && userData.length > 0) {
                    // Normalize user stories to match the org-story shape for the UI
                    return userData.map(s => ({
                        ...s,
                        organizations: {
                            id: s.user_id,
                            name: s.profiles?.full_name || s.profiles?.username || 'User',
                            logo_url: s.profiles?.avatar_url,
                            slug: s.profiles?.username
                        }
                    }));
                }
            } catch { }

            return FALLBACK_STORIES;
        },
        enabled: !!orgId,
    });

    // Analytics query (only fetched when enabled by the consumer)
    const fetchAnalytics = (storyId, enabled) => useQuery({
        queryKey: ['storyAnalytics', storyId],
        queryFn: async () => {
            return await api('GET', `/stories/${storyId}/analytics`);
        },
        enabled,
    });

    // Check if the current user is the story owner
    const isOwner = (story) => {
        return profile?.id === story?.user_id ||
            profile?.managed_orgs?.some(o => o.id === story?.org_id);
    };

    return {
        org,
        stories,
        profile,
        isOwner,
        fetchAnalytics,
    };
}
