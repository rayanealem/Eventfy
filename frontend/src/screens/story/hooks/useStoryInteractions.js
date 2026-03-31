import { useState, useRef, useCallback } from 'react';
import { api } from '../../../lib/api';

/**
 * useStoryInteractions — Manages polls, emoji reactions, likes, audio, insights.
 * Now with owner-mode swipe-up for insights.
 */
export default function useStoryInteractions(currentStory, setPaused) {
    const [liked, setLiked] = useState({});
    const [pollVotes, setPollVotes] = useState({});
    const [flyingEmojis, setFlyingEmojis] = useState([]);
    const [isMuted, setIsMuted] = useState(true);
    const [showInsights, setShowInsights] = useState(false);
    const [replyText, setReplyText] = useState('');
    const audioRef = useRef(null);

    // ─── Poll Voting (Optimistic UI) ────────────────────────────────────────
    const handlePollVote = useCallback(async (pollId, option, frameId) => {
        if (pollVotes[pollId]) return;

        setPaused(true);

        const isA = option === 'A';
        setPollVotes(prev => ({
            ...prev,
            [pollId]: {
                option,
                pctA: isA ? 100 : 0,
                pctB: isA ? 0 : 100,
            }
        }));

        try {
            await api('POST', `/stories/${currentStory.id}/frames/${frameId}/vote`, { option });
            // Simulate server response
            setPollVotes(prev => ({
                ...prev,
                [pollId]: { ...prev[pollId], pctA: isA ? 75 : 25, pctB: isA ? 25 : 75 }
            }));
        } catch (e) {
            console.error('Failed to vote:', e);
        }

        setTimeout(() => setPaused(false), 1200);
    }, [pollVotes, currentStory?.id, setPaused]);

    // ─── Emoji Reactions (Flying Animation) ─────────────────────────────────
    const handleReaction = useCallback(async (emoji) => {
        const newEmoji = {
            id: Date.now() + Math.random(),
            emoji,
            x: 20 + Math.random() * 60,
            delay: Math.random() * 0.2,
        };
        setFlyingEmojis(prev => [...prev, newEmoji]);

        setTimeout(() => {
            setFlyingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
        }, 2000);

        try {
            await api('POST', `/stories/${currentStory.id}/react`, { emoji });
        } catch {}
    }, [currentStory?.id]);

    // ─── Like Toggle ────────────────────────────────────────────────────────
    const toggleLike = useCallback(() => {
        setLiked(prev => ({ ...prev, [currentStory?.id]: !prev[currentStory?.id] }));
    }, [currentStory?.id]);

    // ─── Audio Mute Toggle ──────────────────────────────────────────────────
    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
        }
    }, []);

    // ─── Reply ──────────────────────────────────────────────────────────────
    const sendReply = useCallback(async () => {
        if (!replyText.trim()) return;
        try {
            // TODO: implement story reply API
            console.log('Reply sent:', replyText);
            setReplyText('');
        } catch {}
    }, [replyText]);

    // ─── Delete Story ───────────────────────────────────────────────────────
    const handleDeleteStory = useCallback(async (navigateFn) => {
        if (window.confirm('Delete this story? This cannot be undone.')) {
            try {
                await api('DELETE', `/stories/${currentStory.id}`);
                navigateFn(-1);
            } catch (e) {
                console.error('Failed to delete story:', e);
            }
        }
    }, [currentStory?.id]);

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
        replyText,
        setReplyText,
        audioRef,

        handlePollVote,
        handleReaction,
        toggleLike,
        toggleMute,
        sendReply,
        handleDeleteStory,
        openInsights,
        closeInsights,
    };
}
