import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import './DiscordLayout.css';
import Chat from './Chat';

export default function DiscordLayout() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();

    // Derived state from URL params
    // If eventId === 'me' or is undefined, we are in the "Direct Messages" view.
    const isHome = !eventId || eventId === 'me';

    // Fetch user's registered events (Servers)
    const { data: eventChats = [] } = useQuery({
        queryKey: ['chatHub', profile?.id],
        queryFn: async () => {
            const data = await api('GET', '/chat/my-chats');
            return data?.chats || [];
        },
        enabled: !!profile?.id,
    });

    const handleServerClick = (id) => {
        if (id === 'me') {
            navigate('/chat');
        } else {
            navigate(`/chat/${id}`);
        }
    };

    return (
        <div className="discord-master-layout">

            {/* 1. Far-Left Server Bar */}
            <nav className="server-sidebar">

                {/* Home Button (DMs) */}
                <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={`server-icon-wrap ${isHome ? 'active' : ''}`}
                    onClick={() => handleServerClick('me')}
                    style={{ position: 'relative' }}
                >
                    {isHome && (
                        <motion.div
                            layoutId="discordServerPill"
                            style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '24px', background: '#fff', borderRadius: '0 4px 4px 0' }}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                    )}
                    <button className="server-btn" style={{ background: isHome ? 'var(--discord-brand)' : undefined, color: isHome ? '#fff' : undefined }}>
                        <div style={{ fontWeight: 900, fontSize: '24px', fontStyle: 'italic', letterSpacing: '-1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>E</div>
                    </button>
                </motion.div>

                <div className="server-separator" />

                {/* Event Servers */}
                {eventChats.map((chat) => (
                    <motion.div
                        whileTap={{ scale: 0.85 }}
                        key={chat.event_id}
                        className={`server-icon-wrap ${eventId === chat.event_id ? 'active' : ''}`}
                        onClick={() => handleServerClick(chat.event_id)}
                        style={{ position: 'relative' }}
                    >
                        {eventId === chat.event_id && (
                            <motion.div
                                layoutId="discordServerPill"
                                style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '24px', background: '#fff', borderRadius: '0 4px 4px 0' }}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            />
                        )}
                        <button className="server-btn">
                            <img
                                src={chat.cover_url || chat.org_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.event_title || 'E')}&background=1e293b&color=fff`}
                                alt={chat.event_title}
                            />
                        </button>
                    </motion.div>
                ))}
            </nav>

            {/* 2 & 3 & 4. Channels, Chat, Members */}
            {/* 
                We reuse Chat.jsx but pass it props to know whether it's rendering 
                the DM home screen or an Event Server screen 
            */}
            <Chat eventId={isHome ? null : eventId} isHomeView={isHome} />

        </div>
    );
}
