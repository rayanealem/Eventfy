import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { haptic } from '../../lib/haptic';
import './Chat.css';

// Simple Markdown Renderer for Chat
const renderContent = (content) => {
    if (!content) return null;

    // Code blocks: ```code```
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.slice(3, -3).trim();
            return (
                <pre key={i} className="message-code-block">
                    <code>{code}</code>
                </pre>
            );
        }

        // Bold and Italic
        let text = part;
        const segments = [];
        let key = 0;

        // This is a very basic way to handle it without external libs
        // For a real Discord clone, we'd use react-markdown
        return (
            <span key={i} dangerouslySetInnerHTML={{
                __html: text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/__(.*?)__/g, '<u>$1</u>')
                    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
            }} />
        );
    });
};

export default function Chat() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { user, profile } = useAuth();
    const queryClient = useQueryClient();

    // State for UI layout
    const [leftPanelVisible, setLeftPanelVisible] = useState(true);
    const [rightPanelVisible, setRightPanelVisible] = useState(true);
    const [activeChannelId, setActiveChannelId] = useState(null);
    const [msgInput, setMsgInput] = useState('');
    const [reactions, setReactions] = useState({});
    const bottomRef = useRef(null);

    // Fetch channels and initial data
    const { data: chatData, isLoading, isError } = useQuery({
        queryKey: ['chat', eventId],
        queryFn: async () => {
            const data = await api('GET', `/chat/channels/${eventId}`);
            // If no active channel selected yet, pick the first one (usually #lobby or #general)
            if (!activeChannelId && data?.channels?.length > 0) {
                setActiveChannelId(data.channels[0].id);
            }
            return data;
        },
        enabled: !!eventId,
    });

    const channels = chatData?.channels || [];
    const members = chatData?.members || [];
    const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

    // Fetch messages for active channel
    const { data: messages = [] } = useQuery({
        queryKey: ['messages', activeChannelId],
        queryFn: () => api('GET', `/chat/channels/${activeChannelId}/messages`),
        enabled: !!activeChannelId,
    });

    // Real-time subscription for messages
    useEffect(() => {
        if (!activeChannelId) return;

        const channel = supabase
            .channel(`chat:${activeChannelId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `channel_id=eq.${activeChannelId}`,
            }, payload => {
                queryClient.setQueryData(['messages', activeChannelId], (old = []) => {
                    if (old.find(m => m.id === payload.new.id)) return old;
                    return [...old, payload.new];
                });
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [activeChannelId, queryClient]);

    // Send Message Mutation
    const sendMessageMutation = useMutation({
        mutationFn: (text) => api('POST', `/chat/channels/${activeChannelId}/messages`, { content: text, msg_type: 'text' }),
        onMutate: async (newText) => {
            await queryClient.cancelQueries({ queryKey: ['messages', activeChannelId] });
            const previousMessages = queryClient.getQueryData(['messages', activeChannelId]);

            const optimisticMsg = {
                id: `temp-${Date.now()}`,
                content: newText,
                msg_type: 'text',
                sender_id: user?.id,
                created_at: new Date().toISOString(),
                profiles: { username: profile?.username || "You", avatar_url: profile?.avatar_url }
            };

            queryClient.setQueryData(['messages', activeChannelId], (old = []) => [...old, optimisticMsg]);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

            return { previousMessages };
        },
        onError: (err, newText, context) => {
            queryClient.setQueryData(['messages', activeChannelId], context.previousMessages);
        },
    });

    const handleSend = () => {
        if (!msgInput.trim() || !activeChannelId) return;
        haptic();
        sendMessageMutation.mutate(msgInput.trim());
        setMsgInput('');
    };

    const QUICK_REACTIONS = ['🔥', '👏', '😂', '❤️', '😮'];
    const toggleReaction = (msgId, emoji) => {
        haptic();
        setReactions(prev => {
            const key = `${msgId}-${emoji}`;
            return { ...prev, [key]: prev[key] ? prev[key] + 1 : 1 };
        });
    };

    const onlineCount = members.filter(m => m.status === 'online').length;
    const totalCount = members.length;

    if (isLoading) {
        return (
            <div className="chat-loading">
                <div className="spinner"></div>
                <span>CONNECTING TO RTC...</span>
            </div>
        );
    }

    return (
        <div className="chat-layout">
            {/* Left Sidebar: Channels */}
            <aside className={`chat-sidebar-left ${leftPanelVisible ? 'visible' : ''}`}>
                <div className="sidebar-header">
                    <h2>EVENT CONTENT</h2>
                    <button className="panel-toggle" onClick={() => setLeftPanelVisible(false)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                </div>
                <div className="channel-list">
                    <div className="channel-category">TEXT CHANNELS</div>
                    {channels.map(ch => (
                        <button
                            key={ch.id}
                            className={`channel-item ${activeChannelId === ch.id ? 'active' : ''}`}
                            onClick={() => setActiveChannelId(ch.id)}
                        >
                            <span className="hash">#</span>
                            <span className="channel-name">{ch.name}</span>
                        </button>
                    ))}
                </div>
                <div className="user-settings">
                    <div className="current-user">
                        <img src={profile?.avatar_url || 'https://via.placeholder.com/32'} alt="avatar" />
                        <div className="user-info">
                            <span className="username">{profile?.username || 'Player'}</span>
                            <span className="status">Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                <header className="chat-top-bar">
                    <div className="top-bar-left">
                        {!leftPanelVisible && (
                            <button className="panel-toggle-in" onClick={() => setLeftPanelVisible(true)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        )}
                        <span className="hash">#</span>
                        <h1>{activeChannel?.name || 'lobby'}</h1>
                    </div>
                    <div className="top-bar-right">
                        <span className="chat-attendee-count">
                            <span className="chat-online-dot" />
                            {onlineCount}/{totalCount} ONLINE
                        </span>
                        <button onClick={() => setRightPanelVisible(!rightPanelVisible)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </button>
                    </div>
                </header>

                <div className="messages-container">
                    {messages.map((msg, i) => {
                        const prevMsg = messages[i - 1];
                        const isContinuation = prevMsg && prevMsg.sender_id === msg.sender_id &&
                            (new Date(msg.created_at) - new Date(prevMsg.created_at) < 300000);
                        const isSystemMsg = msg.msg_type === 'system' || msg.content?.startsWith('[SYSTEM]');

                        if (isSystemMsg) {
                            return (
                                <div key={msg.id} className="chat-system-msg">
                                    <span>{msg.content?.replace('[SYSTEM]', '').trim() || 'System event'}</span>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`message-item ${isContinuation ? 'continuation' : ''}`}>
                                {!isContinuation && (
                                    <img
                                        src={msg.profiles?.avatar_url || 'https://via.placeholder.com/40'}
                                        alt="avatar"
                                        className="message-avatar"
                                    />
                                )}
                                <div className="message-content">
                                    {!isContinuation && (
                                        <div className="message-header">
                                            <span className="message-author">{msg.profiles?.username || 'Unknown'}</span>
                                            <span className="message-timestamp">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                    <div className="message-text">
                                        {renderContent(msg.content)}
                                    </div>
                                    {msg.attachment_url && (
                                        <div className="message-attachment">
                                            {msg.attachment_url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                                <img
                                                    src={msg.attachment_url}
                                                    alt="attachment"
                                                    className="attachment-preview"
                                                    onClick={() => window.open(msg.attachment_url, '_blank')}
                                                />
                                            ) : (
                                                <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="attachment-file">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                                                    <span>{msg.attachment_url.split('/').pop()}</span>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {/* Quick Reactions */}
                                    <div className="chat-reactions-row">
                                        {QUICK_REACTIONS.map(emoji => {
                                            const count = reactions[`${msg.id}-${emoji}`] || 0;
                                            return (
                                                <motion.button
                                                    key={emoji}
                                                    className={`chat-reaction-btn ${count > 0 ? 'active' : ''}`}
                                                    whileTap={{ scale: 1.3 }}
                                                    onClick={() => toggleReaction(msg.id, emoji)}
                                                >
                                                    {emoji}{count > 0 && <span className="reaction-count">{count}</span>}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                <div className="chat-input-wrapper">
                    <div className="chat-input-container">
                        <button className="attach-btn">+</button>
                        <input
                            type="text"
                            placeholder={`Message #${activeChannel?.name || 'channel'}`}
                            value={msgInput}
                            onChange={e => setMsgInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <div className="input-actions">
                            <button>🎁</button>
                            <button>GIF</button>
                            <button>😀</button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Sidebar: Members */}
            <aside className={`chat-sidebar-right ${rightPanelVisible ? 'visible' : ''}`}>
                <div className="member-list-container">
                    <div className="member-group">ONLINE — {members.filter(m => m.status === 'online').length}</div>
                    {members.filter(m => m.status === 'online').map(member => (
                        <div key={member.id} className="member-item">
                            <div className="member-avatar-wrap">
                                <img src={member.avatar_url || 'https://via.placeholder.com/32'} alt={member.username} />
                                <div className="status-indicator online"></div>
                            </div>
                            <span className="member-name">{member.username}</span>
                        </div>
                    ))}

                    <div className="member-group">OFFLINE — {members.filter(m => m.status !== 'online').length}</div>
                    {members.filter(m => m.status !== 'online').map(member => (
                        <div key={member.id} className="member-item offline">
                            <div className="member-avatar-wrap">
                                <img src={member.avatar_url || 'https://via.placeholder.com/32'} alt={member.username} />
                                <div className="status-indicator offline"></div>
                            </div>
                            <span className="member-name">{member.username}</span>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
