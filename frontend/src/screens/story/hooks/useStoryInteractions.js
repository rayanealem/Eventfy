import { useState, useRef, useCallback } from 'react';
import { api } from '../../../lib/api';

/**
 * useStoryInteractions — Manages polls (optimistic voting), emoji reactions
 * (flying emojis), likes, audio mute toggle, and share.
 */
export default function useStoryInteractions(story, setPaused) {
    const [liked, setLiked] = useState({});
    const [pollVotes, setPollVotes] = useState({});
    const [flyingEmojis, setFlyingEmojis] = useState([]);
    const [isMuted, setIsMuted] = useState(true);
    const [showInsights, setShowInsights] = useState(false);
    const audioRef = useRef(null);

    // ─── Poll Voting (Optimistic UI) ────────────────────────────────────────
    const handlePollVote = useCallback(async (pollId, option, currentFrames, currentFrameIndex) => {
        if (pollVotes[pollId]) return; // Already voted

        setPaused(true);

        const isA = option === 'A';
        setPollVotes(prev => ({
            ...prev,
            [pollId]: {
                option,
                pctA: isA ? 100 : 0,
                pctB: isA ? 0 : 100
            }
        }));

        try {
            await api('POST', `/stories/${story.id}/frames/${currentFrames[currentFrameIndex].id}/vote`, { option });
            setPollVotes(prev => ({
                ...prev,
                [pollId]: { ...prev[pollId], pctA: isA ? 80 : 20, pctB: isA ? 20 : 80 }
            }));
        } catch (e) {
            console.error('Failed to vote:', e);
        }

        setTimeout(() => setPaused(false), 1500);
    }, [pollVotes, story?.id, setPaused]);

    // ─── Emoji Reactions (Flying Animation) ─────────────────────────────────
    const handleReaction = useCallback(async (emoji) => {
        const newEmoji = { id: Date.now() + Math.random(), emoji, x: Math.random() * 80 + 10 };
        setFlyingEmojis(prev => [...prev, newEmoji]);

        setTimeout(() => {
            setFlyingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
        }, 1500);

        try {
            await api('POST', `/stories/${story.id}/react`, { emoji });
        } catch (e) {
            console.error('Failed to send reaction:', e);
        }
    }, [story?.id]);

    // ─── Like Toggle ────────────────────────────────────────────────────────
    const toggleLike = useCallback(() => {
        setLiked(prev => ({ ...prev, [story?.id]: !prev[story?.id] }));
    }, [story?.id]);

    // ─── Audio Mute Toggle ──────────────────────────────────────────────────
    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    // ─── Delete Story ───────────────────────────────────────────────────────
    const handleDeleteStory = useCallback(async (navigate) => {
        if (window.confirm("Are you sure you want to delete this story?")) {
            try {
                await api('DELETE', `/stories/${story.id}`);
                navigate('/feed');
            } catch (e) {
                console.error("Failed to delete story:", e);
            }
        }
    }, [story?.id]);

    // ─── Insights Toggle ────────────────────────────────────────────────────
    const openInsights = useCallback(() => {
        setPaused(true);
        setShowInsights(true);
    }, [setPaused]);

    const closeInsights = useCallback(() => {
        setShowInsights(false);
        setPaused(false);
    }, [setPaused]);

    return {
        liked,
        pollVotes,
        flyingEmojis,
        isMuted,
        showInsights,
        audioRef,
        handlePollVote,
        handleReaction,
        toggleLike,
        toggleMute,
        handleDeleteStory,
        openInsights,
        closeInsights,
    };
}
