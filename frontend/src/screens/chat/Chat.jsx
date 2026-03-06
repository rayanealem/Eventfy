import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import './Chat.css';

const MESSAGES = [
    {
        type: 'system',
        text: '○ Ahmed joined the lobby.',
    },
    {
        type: 'announcement',
        sender: 'ORGANIZER',
        senderColor: '#11d4c4',
        time: '10:42 AM',
        image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=320&fit=crop',
        title: 'TOURNAMENT UPDATE',
        body: 'Welcome to the Squid Game tournament! Rules are simple: Survive each round to climb the leaderboard. Team play is encouraged but watch your back.',
        cta: 'READ FULL RULES ⬡',
    },
    {
        type: 'other',
        sender: 'Player #456',
        senderColor: '#ff7f7f',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        text: 'Is anyone else nervous? The arena looks massive from the lobby entrance. △',
    },
    {
        type: 'poll',
        title: 'COMMUNITY POLL △',
        question: 'Favorite first game? ○',
        options: [
            { text: 'RED LIGHT GREEN LIGHT', percent: 68, voted: true },
            { text: 'GLASS BRIDGE', percent: 32, voted: false },
        ],
    },
    {
        type: 'own',
        text: "Just stay focused on the objective.\nWe've got this team! □",
        time: '10:48 AM',
    },
];

export default function Chat() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { user } = useAuth();
    const [msgInput, setMsgInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [channelId, setChannelId] = useState(null);
    const bottomRef = useRef(null);

    // New state for missing features
    const [showDMModal, setShowDMModal] = useState(false);
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const fileRef = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
        if (!eventId) return;
        // 1. Load channel + message history
        api('GET', `/chat/channels/${eventId}`).then(data => {
            setChannelId(data.general_channel_id);
            setMessages(data.messages);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }).catch(err => console.error("Failed to load chat", err));
    }, [eventId]);

    useEffect(() => {
        if (!channelId) return;
        // 2. Subscribe to realtime new messages
        const channelConfig = supabase
            .channel(`chat:${channelId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `channel_id=eq.${channelId}`,
            }, payload => {
                // Fetch the sender profile manually or just append the minimal data
                // In a true production app, we might want to attach profile data
                // For simplicity, we just append it
                setMessages(prev => [...prev, payload.new]);
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            })
            .subscribe();

        return () => supabase.removeChannel(channelConfig);
    }, [channelId]);

    const handleSend = async () => {
        if (!msgInput.trim() || !channelId) return;
        const text = msgInput.trim();
        setMsgInput(''); // clear immediately
        try {
            await api('POST', `/chat/channels/${channelId}/messages`, { content: text, msg_type: 'text' });
        } catch (e) {
            console.error("Failed to send message", e);
        }
    };

    return (
        <div className="chat-root">
            <div className="chat-noise" />

            {/* Header */}
            <header className="chat-header">
                <div className="chat-header-left">
                    <button className="chat-back" onClick={() => navigate(-1)}>
                        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                            <path d="M6 1L1 6l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="chat-header-info">
                        <div className="chat-header-title-row">
                            <h1 className="chat-header-title">EVENTFY #general ○</h1>
                            <span className="chat-header-badge">○ SPORT</span>
                        </div>
                        <div className="chat-header-online">
                            <div className="chat-online-dot" />
                            <span>487 ONLINE</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="chat-members-btn" onClick={() => setShowDMModal(true)} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                        + NEW DM ○
                    </button>
                    <button className="chat-members-btn" onClick={() => setShowBroadcast(s => !s)} style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '4px 8px', borderRadius: '4px' }}>
                        ALERT 🔴
                    </button>
                    <button className="chat-members-btn">
                        <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                            <circle cx="8" cy="5" r="3" stroke="white" strokeWidth="1.2" />
                            <path d="M1 14c0-3 3.5-5 7-5s7 2 7 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                            <circle cx="17" cy="5" r="2" stroke="white" strokeWidth="1" />
                            <path d="M16 14c0-2 1.5-3.5 3.5-3.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Broadcast Area */}
            <AnimatePresence>
                {showBroadcast && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ padding: '16px', background: '#330000', borderBottom: '1px solid #ff4444' }}>
                        <textarea style={{ width: '100%', background: 'black', color: 'white', padding: '8px', minHeight: '60px', border: '1px solid #ff4444' }} placeholder="Enter flash alert..." />
                        <button onClick={() => setShowBroadcast(false)} style={{ background: '#ff4444', color: 'black', padding: '8px 16px', marginTop: '8px', fontWeight: 'bold' }}>BROADCAST △</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Area */}
            <div className="chat-area">
                {/* Today Divider */}
                <div className="chat-divider">—— TODAY ——</div>

                {messages.map((msg, i) => {
                    const isOwn = msg.sender_id === user?.id;
                    const dateObj = new Date(msg.created_at);
                    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const senderName = msg.profiles?.username || 'Unknown';
                    const avatar = msg.profiles?.avatar_url || 'https://via.placeholder.com/32';

                    if (msg.msg_type === 'system') {
                        return (
                            <div key={msg.id || i} className="chat-system-msg">{msg.content}</div>
                        );
                    }

                    if (msg.msg_type === 'announcement') {
                        return (
                            <motion.div
                                key={msg.id || i}
                                className="chat-announcement"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="announce-header">
                                    <span className="announce-badge">ORGANIZER</span>
                                    <span className="announce-time">{time}</span>
                                </div>
                                <h3 className="announce-title">📢 ANNOUNCEMENT</h3>
                                <p className="announce-body">{msg.content}</p>
                            </motion.div>
                        );
                    }

                    if (isOwn) {
                        return (
                            <motion.div
                                key={msg.id || i}
                                className="chat-own-msg"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="own-bubble">{msg.content}</div>
                                <span className="own-time">{time}</span>
                            </motion.div>
                        );
                    } else {
                        return (
                            <motion.div
                                key={msg.id || i}
                                className="chat-other-msg"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="other-avatar" onClick={() => navigate(`/profile/${senderName}`)} style={{ cursor: 'pointer' }}>
                                    <img src={avatar} alt={senderName} />
                                </div>
                                <div className="other-content">
                                    <span className="other-sender" style={{ color: msg.profiles?.shape_color || '#ff7f7f' }}>{senderName}</span>
                                    <div className="other-bubble">{msg.content}</div>
                                </div>
                            </motion.div>
                        );
                    }
                })}

                <div ref={bottomRef} />

                {/* Typing Indicator */}
                <div className="chat-typing">
                    <span className="typing-dots">○ ◇ □</span>
                    <span className="typing-text">Several players are typing...</span>
                </div>
            </div>

            {/* Input Bar */}
            <div className="chat-input-bar">
                <input type="file" ref={fileRef} style={{ display: 'none' }} />
                <input type="file" ref={imgRef} accept="image/*" style={{ display: 'none' }} />
                <div className="chat-input-actions">
                    <div onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6.5" stroke="#64748b" strokeWidth="1" /><path d="M7.5 4.5v6M4.5 7.5h6" stroke="#64748b" strokeWidth="1" strokeLinecap="round" /></svg>
                    </div>
                    <div onClick={() => imgRef.current?.click()} style={{ cursor: 'pointer' }}>
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="1" y="1" width="15" height="15" rx="2" stroke="#64748b" strokeWidth="1" /><circle cx="5.5" cy="5.5" r="1.5" fill="#64748b" /><path d="M1 12l4-4 3 3 2-2 6 6" stroke="#64748b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div onClick={() => setShowPollModal(true)} style={{ cursor: 'pointer', fontSize: '12px', color: '#64748b' }}>
                        △ POLL
                    </div>
                </div>
                <div className="chat-input-field">
                    <input
                        type="text"
                        placeholder="Message #general..."
                        value={msgInput}
                        onChange={e => setMsgInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        style={{ background: 'transparent', border: 'none', color: '#f1f5f9', fontFamily: "'DM Mono', monospace", fontSize: '11px', width: '100%', outline: 'none' }}
                    />
                </div>
                <button className="chat-send-btn" onClick={handleSend}>
                    SEND
                    <span className="send-shape">□</span>
                </button>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showDMModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDMModal(false)}>
                        <div style={{ background: '#111', padding: '24px', border: '1px solid #333', width: '300px' }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: 'white', marginBottom: '16px' }}>NEW DM ○</h3>
                            <input type="text" placeholder="Search users..." style={{ width: '100%', padding: '8px', background: '#222', color: 'white', border: 'none', marginBottom: '16px' }} />
                            <button onClick={() => setShowDMModal(false)} style={{ background: '#2dd4bf', color: 'black', padding: '8px 16px', width: '100%', fontWeight: 'bold' }}>START CHAT</button>
                        </div>
                    </div>
                )}
                {showPollModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPollModal(false)}>
                        <div style={{ background: '#111', padding: '24px', border: '1px solid #333', width: '300px' }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: 'white', marginBottom: '16px' }}>CREATE POLL △</h3>
                            <input type="text" placeholder="Question" style={{ width: '100%', padding: '8px', background: '#222', color: 'white', border: 'none', marginBottom: '8px' }} />
                            <input type="text" placeholder="Option 1" style={{ width: '100%', padding: '8px', background: '#222', color: 'white', border: 'none', marginBottom: '8px' }} />
                            <input type="text" placeholder="Option 2" style={{ width: '100%', padding: '8px', background: '#222', color: 'white', border: 'none', marginBottom: '16px' }} />
                            <button onClick={() => setShowPollModal(false)} style={{ background: '#fbbf24', color: 'black', padding: '8px 16px', width: '100%', fontWeight: 'bold' }}>SEND POLL △</button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
