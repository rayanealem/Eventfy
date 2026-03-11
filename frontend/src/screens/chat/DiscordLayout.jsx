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
                <div
                    className={`server-icon-wrap ${isHome ? 'active' : ''}`}
                    onClick={() => handleServerClick('me')}
                >
                    <div className="nav-pill"></div>
                    <button className="server-btn" style={{ background: isHome ? 'var(--discord-brand)' : undefined, color: isHome ? '#fff' : undefined }}>
                        <div style={{ fontWeight: 900, fontSize: '24px', fontStyle: 'italic', letterSpacing: '-1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>E</div>
                    </button>
                </div>

                <div className="server-separator" />

                {/* Event Servers */}
                {eventChats.map((chat) => (
                    <div
                        key={chat.event_id}
                        className={`server-icon-wrap ${eventId === chat.event_id ? 'active' : ''}`}
                        onClick={() => handleServerClick(chat.event_id)}
                    >
                        <div className="nav-pill"></div>
                        <button className="server-btn">
                            <img
                                src={chat.cover_url || chat.org_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.event_title || 'E')}&background=1e293b&color=fff`}
                                alt={chat.event_title}
                            />
                        </button>
                    </div>
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
