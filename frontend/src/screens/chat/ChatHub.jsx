import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import './ChatHub.css';

export default function ChatHub({ onSelectHub, activeHubId }) {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [search, setSearch] = useState('');

    // Fetch all events the user is registered for (these are the user's "servers")
    const { data: eventChats = [], isLoading } = useQuery({
        queryKey: ['chatHub', profile?.id],
        queryFn: async () => {
            try {
                const data = await api('GET', '/chat/my-chats');
                return data?.chats || [];
            } catch {
                // Fallback: fetch registered events
                const { data: regs } = await supabase
                    .from('registrations')
                    .select('events(id, title, cover_url, organizations(name, logo_url))')
                    .eq('user_id', profile?.id);
                return (regs || []).map(r => ({
                    event_id: r.events?.id,
                    event_title: r.events?.title,
                    cover_url: r.events?.cover_url,
                    org_name: r.events?.organizations?.name,
                    org_logo: r.events?.organizations?.logo_url,
                    last_message: null,
                    unread_count: 0,
                }));
            }
        },
        enabled: !!profile?.id,
    });

    const filtered = eventChats.filter(c =>
        c.event_title?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (chat) => {
        if (onSelectHub) {
            onSelectHub(chat.event_id);
        } else {
            navigate(`/chat/${chat.event_id}`);
        }
    };

    return (
        <div className="chathub-root">
            <header className="chathub-header">
                <h1 className="heading-display">COMMS HUB</h1>
                <span className="chathub-count">{eventChats.length} ACTIVE</span>
            </header>

            <div className="chathub-search">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                    <line x1="10.5" y1="10.5" x2="15" y2="15" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="chathub-list">
                {isLoading && (
                    <>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="chathub-item skeleton">
                                <div className="chathub-item-avatar shimmer" />
                                <div className="skeleton-lines">
                                    <div className="skeleton-line shimmer" style={{ width: '60%' }} />
                                    <div className="skeleton-line shimmer" style={{ width: '40%' }} />
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {!isLoading && filtered.length === 0 && (
                    <div className="chathub-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <h3 className="heading-3">NO ACTIVE CHATS</h3>
                        <p className="text-body text-small">Register for events to unlock their comms channels.</p>
                        <button className="btn btn-coral btn-small" onClick={() => navigate('/explore')}>EXPLORE EVENTS</button>
                    </div>
                )}

                {filtered.map((chat, i) => (
                    <motion.div
                        key={chat.event_id}
                        className={`chathub-item ${activeHubId === chat.event_id ? 'active' : ''}`}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSelect(chat)}
                    >
                        <div className="chathub-item-avatar">
                            <img
                                src={chat.cover_url || chat.org_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.event_title || 'E')}&background=0A0A0F&color=fff`}
                                alt={chat.event_title}
                            />
                            {chat.unread_count > 0 && (
                                <div className="chathub-unread">{chat.unread_count > 9 ? '9+' : chat.unread_count}</div>
                            )}
                        </div>
                        <div className="chathub-item-info">
                            <h3 className="heading-3">{chat.event_title?.toUpperCase()}</h3>
                            <p className="text-small">{chat.last_message || chat.org_name?.toUpperCase() || 'Tap to join'}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
