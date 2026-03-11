import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { haptic } from '../../lib/haptic';
import ChatHub from './ChatHub';
import './Chat.css';

// Simple Markdown Renderer for Chat
const renderContent = (content) => {
    if (!content) return null;

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

        let text = part;
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

export default function Chat({ eventId: propEventId, isHomeView }) {
    const { eventId: paramEventId } = useParams();
    const eventId = propEventId || paramEventId;
    const navigate = useNavigate();

    const { user, profile } = useAuth();
    const queryClient = useQueryClient();

    // Mobile specific layout controls
    const [leftPanelVisible, setLeftPanelVisible] = useState(false);
    const [rightPanelVisible, setRightPanelVisible] = useState(false);
    const [showHubsVisible, setShowHubsVisible] = useState(false);

    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [msgInput, setMsgInput] = useState('');
    const bottomRef = useRef(null);

    const [contextMsg, setContextMsg] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const longPressTimer = useRef(null);

    // Fetch channels for the selected Event Hub
    const { data: chatData, isLoading, isError } = useQuery({
        queryKey: ['chat', eventId, isHomeView],
        queryFn: async () => {
            if (isHomeView) {
                const data = await api('GET', '/chat/dm');
                return { channels: data || [], members: [] };
            }

            if (!eventId) return { channels: [], members: [] };
            
            const data = await api('GET', `/chat/channels/${eventId}`);
            return data;
        },
        enabled: isHomeView ? true : !!eventId,
    });

    const channels = chatData?.channels || [];
    const members = chatData?.members || [];
    const activeChannelId = selectedChannelId || (channels.length > 0 ? channels[0].id : null);
    const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

    // Reset selected channel when event changes
    useEffect(() => {
        setSelectedChannelId(null);
    }, [eventId]);

    // Fetch messages
    const { data: messages = [] } = useQuery({
        queryKey: ['messages', activeChannelId],
        queryFn: async () => {
            const data = await api('GET', `/chat/channels/${activeChannelId}/messages`);
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.messages)) return data.messages;
            return [];
        },
        enabled: !!activeChannelId,
    });

    const [presenceState, setPresenceState] = useState({});
    const presenceChannelRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!activeChannelId || !user) return;

        const messageChannel = supabase
            .channel(`chat_messages:${activeChannelId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `channel_id=eq.${activeChannelId}`,
            }, async payload => {
                let newMsg = payload.new;
                try {
                    const fullMsg = await api('GET', `/chat/messages/${newMsg.id}`);
                    if (fullMsg) newMsg = fullMsg;
                } catch (error) {
                    newMsg.profiles = null;
                }

                queryClient.setQueryData(['messages', activeChannelId], (old = []) => {
                    if (old.find(m => m.id === newMsg.id)) return old;
                    return [...old, newMsg];
                });
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            })
            .subscribe();

        const presenceChannel = supabase.channel(`presence:${activeChannelId}`);
        presenceChannelRef.current = presenceChannel;

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                setPresenceState(presenceChannel.presenceState());
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presenceChannel.track({
                        user_id: user.id,
                        username: profile?.username || 'Player',
                        avatar_url: profile?.avatar_url,
                        typing: false
                    });
                }
            });

        return () => {
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(presenceChannel);
        };
    }, [activeChannelId, user, profile, queryClient]);

    const uniqueOnlineUsers = Array.from(new Map(Object.values(presenceState).flat().map(p => [p.user_id, p])).values());
    const typingUsers = uniqueOnlineUsers.filter(p => p.typing && p.user_id !== user?.id);
    const onlineCount = uniqueOnlineUsers.length;
    const totalCount = members.length;

    const handleInputChange = (e) => {
        setMsgInput(e.target.value);
        if (presenceChannelRef.current && user) {
            presenceChannelRef.current.track({
                user_id: user.id,
                username: profile?.username || 'Player',
                avatar_url: profile?.avatar_url,
                typing: true
            });

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                if (presenceChannelRef.current) {
                    presenceChannelRef.current.track({
                        user_id: user.id,
                        username: profile?.username || 'Player',
                        avatar_url: profile?.avatar_url,
                        typing: false
                    });
                }
            }, 2000);
        }
    };

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
        let content = msgInput.trim();
        if (replyingTo) {
            const quoted = replyingTo.content.slice(0, 60);
            content = `> ${quoted}\n${content}`;
            setReplyingTo(null);
        }
        if (editingMsg) {
            api('PATCH', `/chat/messages/${editingMsg.id}`, { content }).catch(() => { });
            queryClient.setQueryData(['messages', activeChannelId], (old = []) =>
                old.map(m => m.id === editingMsg.id ? { ...m, content, edited_at: new Date().toISOString() } : m)
            );
            setEditingMsg(null);
            setMsgInput('');
            return;
        }
        sendMessageMutation.mutate(content);
        setMsgInput('');
    };

    const QUICK_REACTIONS = ['❤', '😂', '👍', '🔥', '👀', '✅'];

    const reactMutation = useMutation({
        mutationFn: ({ msgId, emoji }) => api('POST', `/chat/messages/${msgId}/react`, { emoji }),
        onMutate: async ({ msgId, emoji }) => {
            await queryClient.cancelQueries({ queryKey: ['messages', activeChannelId] });
            const prev = queryClient.getQueryData(['messages', activeChannelId]);
            queryClient.setQueryData(['messages', activeChannelId], (old = []) =>
                old.map(m => {
                    if (m.id !== msgId) return m;
                    const existing = (m.reactions || []).find(r => r.emoji === emoji && r.user_id === user?.id);
                    if (existing) {
                        return { ...m, reactions: (m.reactions || []).filter(r => !(r.emoji === emoji && r.user_id === user?.id)) };
                    }
                    return { ...m, reactions: [...(m.reactions || []), { emoji, user_id: user?.id }] };
                })
            );
            return { prev };
        },
        onError: (err, vars, ctx) => {
            if (ctx?.prev) queryClient.setQueryData(['messages', activeChannelId], ctx.prev);
        },
    });

    const toggleReaction = (msgId, emoji) => {
        if (String(msgId).startsWith('temp-')) return;
        haptic();
        reactMutation.mutate({ msgId, emoji });
    };

    const handleDeleteMessage = (msgId) => {
        if (String(msgId).startsWith('temp-')) return;
        api('DELETE', `/chat/messages/${msgId}`).catch(() => { });
        queryClient.setQueryData(['messages', activeChannelId], (old = []) =>
            old.filter(m => m.id !== msgId)
        );
        setContextMsg(null);
    };

    const handleEditMessage = (msg) => {
        setEditingMsg(msg);
        setMsgInput(msg.content);
        setContextMsg(null);
    };

    const handleReply = (msg) => {
        setReplyingTo(msg);
        setContextMsg(null);
    };

    const handleCopy = (text) => {
        navigator.clipboard?.writeText(text);
        haptic();
        setContextMsg(null);
    };

    const onTouchStartMsg = (msg) => {
        longPressTimer.current = setTimeout(() => {
            haptic();
            setContextMsg(msg);
        }, 500);
    };
    const onTouchEndMsg = () => clearTimeout(longPressTimer.current);
    const onContextMenuMsg = (e, msg) => {
        e.preventDefault();
        haptic();
        setContextMsg(msg);
    };

    if (isLoading && eventId) {
        return (
            <div className="chat-loading">
                <div className="spinner"></div>
                <h3 className="heading-3">SYNCING SIGNAL...</h3>
            </div>
        );
    }

    return (
        <div className="chat-native-layout">
            
            {/* Nav Mobile Overlay */}
            <AnimatePresence>
                {(leftPanelVisible || rightPanelVisible || showHubsVisible) && (
                    <motion.div
                        className="chat-mobile-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setLeftPanelVisible(false);
                            setRightPanelVisible(false);
                            setShowHubsVisible(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* PANE 1: Server/Hub Selection (Desktop: slim far-left) */}
            <aside className={`chat-pane-hub ${showHubsVisible ? 'visible' : ''}`}>
                <ChatHub 
                    onSelectHub={(id) => {
                        navigate(`/chat/${id}`);
                        setShowHubsVisible(false);
                        setLeftPanelVisible(true);
                    }} 
                    activeHubId={eventId} 
                />
            </aside>

            {/* PANE 2: Channels List (Context of Selected Hub) */}
            {eventId && (
                <aside className={`chat-pane-channels ${leftPanelVisible ? 'visible' : ''}`}>
                    <div className="sidebar-header">
                        <h2 className="text-label">{isHomeView ? 'DIRECT MESSAGES' : 'EVENT CHANNELS'}</h2>
                        <button className="panel-toggle" onClick={() => setLeftPanelVisible(false)}>
                            ✕
                        </button>
                    </div>

                    <div className="channel-list">
                        {channels.map(ch => {
                            let displayName = ch.name;
                            if (isHomeView) {
                                const otherUserId = ch.name.split(':').find(id => id !== user?.id);
                                displayName = 'User ' + otherUserId?.slice(0, 4);
                            }

                            return (
                                <button
                                    key={ch.id}
                                    className={`channel-item ${activeChannelId === ch.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedChannelId(ch.id);
                                        setLeftPanelVisible(false);
                                    }}
                                >
                                    <span className="hash">#</span>
                                    <span className="channel-name">{displayName}</span>
                                </button>
                            );
                        })}
                    </div>
                </aside>
            )}

            {/* PANE 3: Main Messages Area */}
            {eventId ? (
                <main className="chat-pane-main">
                    <header className="chat-top-bar">
                        <div className="top-bar-left">
                            <button className="panel-toggle-in btn-outline" onClick={() => setLeftPanelVisible(true)}>
                                ☰ CHANNELS
                            </button>
                            <span className="hash">#</span>
                            <h1 className="heading-2">{activeChannel?.name || 'conversation'}</h1>
                        </div>

                        <div className="top-bar-right">
                            {!isHomeView && (
                                <span className="chat-attendee-count">
                                    <span className="chat-online-dot" />
                                    {onlineCount} ACTIVE
                                </span>
                            )}
                            <button className="btn-outline btn-small" onClick={() => setRightPanelVisible(!rightPanelVisible)}>
                                ATTENDEES
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

                            const reactionCounts = {};
                            (msg.reactions || []).forEach(r => {
                                if (!reactionCounts[r.emoji]) reactionCounts[r.emoji] = { count: 0, hasOwn: false };
                                reactionCounts[r.emoji].count++;
                                if (r.user_id === user?.id) reactionCounts[r.emoji].hasOwn = true;
                            });

                            return (
                                <div
                                    key={msg.id}
                                    className={`message-item ${isContinuation ? 'continuation' : ''}`}
                                    onTouchStart={() => onTouchStartMsg(msg)}
                                    onTouchEnd={onTouchEndMsg}
                                    onTouchCancel={onTouchEndMsg}
                                    onContextMenu={(e) => onContextMenuMsg(e, msg)}
                                >
                                    {!isContinuation && (
                                        <div className="message-avatar-wrap">
                                            <img
                                                src={msg.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.profiles?.username || 'U')}&background=0A0A0F&color=fff`}
                                                alt="avatar"
                                                className="message-avatar"
                                            />
                                        </div>
                                    )}
                                    <div className="message-content">
                                        {!isContinuation && (
                                            <div className="message-header">
                                                <span className="message-author">{msg.profiles?.username || 'Unknown'}</span>
                                                <span className="message-timestamp">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {msg.edited_at && <span className="chat-edited-label"> (edited)</span>}
                                                </span>
                                            </div>
                                        )}
                                        <div className="message-text">
                                            {renderContent(msg.content)}
                                        </div>
                                        {msg.attachment_url && (
                                            <div className="message-attachment">
                                                {msg.attachment_url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                                    <img src={msg.attachment_url} alt="attachment" className="attachment-preview" onClick={() => window.open(msg.attachment_url, '_blank')} />
                                                ) : (
                                                    <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="attachment-file btn-outline btn-small">
                                                        <span>{msg.attachment_url.split('/').pop()}</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        
                                        {Object.keys(reactionCounts).length > 0 && (
                                            <div className="chat-reaction-pills">
                                                {Object.entries(reactionCounts).map(([emoji, { count, hasOwn }]) => (
                                                    <button
                                                        key={emoji}
                                                        className={`chat-reaction-pill ${hasOwn ? 'own' : ''}`}
                                                        onClick={() => toggleReaction(msg.id, emoji)}
                                                    >
                                                        {emoji} {count}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div className="chat-reactions-row">
                                            {QUICK_REACTIONS.map(emoji => (
                                                <button key={emoji} className="chat-reaction-btn" onClick={() => toggleReaction(msg.id, emoji)}>
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    <div className="chat-input-wrapper">
                        {typingUsers.length > 0 && (
                            <div className="chat-typing-indicator">
                                <span className="chat-online-dot"></span>
                                {typingUsers.length === 1 ? `${typingUsers[0].username.toUpperCase()} IS TYPING` : 'MULTIPLE COMMS ENCRYPTING'}
                            </div>
                        )}
                        {editingMsg && (
                            <div className="chat-context-banner edit">
                                <span><span className="hash">✎</span> EDITING</span>
                                <button onClick={() => { setEditingMsg(null); setMsgInput(''); }}>✕</button>
                            </div>
                        )}
                        {replyingTo && (
                            <div className="chat-context-banner reply">
                                <span><span className="hash">↩</span> {replyingTo.content.slice(0, 40)}...</span>
                                <button onClick={() => setReplyingTo(null)}>✕</button>
                            </div>
                        )}
                        <div className="chat-input-container glass-card">
                            <button className="attach-btn btn-outline">+</button>
                            <input
                                type="text"
                                placeholder={editingMsg ? 'OVERRIDE PROTOCOL...' : `MESSAGE #${activeChannel?.name || 'CHANNEL'}`}
                                value={msgInput}
                                onChange={handleInputChange}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                        </div>
                    </div>
                </main>
            ) : (
                <main className="chat-pane-main chat-empty-hub">
                    <h2 className="heading-display">SELECT A HUB</h2>
                    <p className="text-body text-small">Choose an event from the far left panel to join the comms.</p>
                    {/* On mobile, show a button to open hubs */}
                    <button className="btn btn-coral panel-toggle-in" onClick={() => setShowHubsVisible(true)}>BROWSE HUBS</button>
                </main>
            )}

            {/* PANE 4: Members List (Right) */}
            {eventId && !isHomeView && (
                <aside className={`chat-pane-members ${rightPanelVisible ? 'visible' : ''}`}>
                    <div className="sidebar-header">
                        <h2 className="text-label">MEMBERS — {onlineCount}</h2>
                        <button className="panel-toggle" onClick={() => setRightPanelVisible(false)}>✕</button>
                    </div>
                    <div className="member-list-container">
                        {uniqueOnlineUsers.map(member => (
                            <div key={member.user_id} className="member-item">
                                <div className="member-avatar-wrap">
                                    <img src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.username || 'U')}&background=0A0A0F&color=fff`} alt={member.username} />
                                    <div className="status-indicator online"></div>
                                </div>
                                <span className="member-name text-body">{member.username}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            {/* Context Menu Bottom Sheet */}
            <AnimatePresence>
                {contextMsg && (
                    <>
                        <motion.div
                            className="chat-context-overlay"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setContextMsg(null)}
                        />
                        <motion.div
                            className="chat-context-sheet glass-card"
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div className="chat-context-handle" />
                            <div className="chat-context-emoji-row">
                                {QUICK_REACTIONS.map(emoji => (
                                    <button key={emoji} className="chat-context-emoji-btn btn-outline"
                                        onClick={() => { toggleReaction(contextMsg.id, emoji); setContextMsg(null); }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            <div className="chat-context-actions">
                                <button className="btn-outline" onClick={() => handleReply(contextMsg)}>REPLY</button>
                                <button className="btn-outline" onClick={() => handleCopy(contextMsg.content)}>COPY TEXT</button>
                                {contextMsg.sender_id === user?.id && !String(contextMsg.id).startsWith('temp-') && (
                                    <>
                                        <button className="btn-outline" onClick={() => handleEditMessage(contextMsg)}>EDIT</button>
                                        <button className="btn-outline" style={{ borderColor: 'var(--color-coral)', color: 'var(--color-coral)'}} onClick={() => handleDeleteMessage(contextMsg.id)}>DELETE</button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
