import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
                <button className="chat-members-btn">
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                        <circle cx="8" cy="5" r="3" stroke="white" strokeWidth="1.2" />
                        <path d="M1 14c0-3 3.5-5 7-5s7 2 7 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx="17" cy="5" r="2" stroke="white" strokeWidth="1" />
                        <path d="M16 14c0-2 1.5-3.5 3.5-3.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                </button>
            </header>

            {/* Chat Area */}
            <div className="chat-area">
                {/* Today Divider */}
                <div className="chat-divider">—— TODAY ——</div>

                {MESSAGES.map((msg, i) => {
                    if (msg.type === 'system') {
                        return (
                            <div key={i} className="chat-system-msg">{msg.text}</div>
                        );
                    }

                    if (msg.type === 'announcement') {
                        return (
                            <motion.div
                                key={i}
                                className="chat-announcement"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="announce-header">
                                    <span className="announce-badge">{msg.sender}</span>
                                    <span className="announce-time">{msg.time}</span>
                                </div>
                                <div className="announce-image-wrap">
                                    <img src={msg.image} alt="" />
                                </div>
                                <h3 className="announce-title">{msg.title}</h3>
                                <p className="announce-body">{msg.body}</p>
                                <button className="announce-cta">{msg.cta}</button>
                            </motion.div>
                        );
                    }

                    if (msg.type === 'other') {
                        return (
                            <motion.div
                                key={i}
                                className="chat-other-msg"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="other-avatar">
                                    <img src={msg.avatar} alt={msg.sender} />
                                </div>
                                <div className="other-content">
                                    <span className="other-sender" style={{ color: msg.senderColor }}>{msg.sender}</span>
                                    <div className="other-bubble">{msg.text}</div>
                                </div>
                            </motion.div>
                        );
                    }

                    if (msg.type === 'poll') {
                        return (
                            <motion.div
                                key={i}
                                className="chat-poll"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="poll-label">{msg.title}</span>
                                <span className="poll-question">{msg.question}</span>
                                <div className="poll-options">
                                    {msg.options.map((opt, j) => (
                                        <div key={j} className={`poll-option ${opt.voted ? 'voted' : ''}`}>
                                            {opt.voted && <div className="poll-fill" style={{ width: `${opt.percent}%` }} />}
                                            <div className="poll-option-content">
                                                <span className={`poll-option-text ${opt.voted ? '' : 'muted'}`}>{opt.text}</span>
                                                <span className={`poll-option-pct ${opt.voted ? '' : 'muted'}`}>{opt.percent}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    }

                    if (msg.type === 'own') {
                        return (
                            <motion.div
                                key={i}
                                className="chat-own-msg"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="own-bubble">{msg.text}</div>
                                <span className="own-time">{msg.time}</span>
                            </motion.div>
                        );
                    }

                    return null;
                })}

                {/* Typing Indicator */}
                <div className="chat-typing">
                    <span className="typing-dots">○ ◇ □</span>
                    <span className="typing-text">Several players are typing...</span>
                </div>
            </div>

            {/* Input Bar */}
            <div className="chat-input-bar">
                <div className="chat-input-actions">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6.5" stroke="#64748b" strokeWidth="1" /><path d="M7.5 4.5v6M4.5 7.5h6" stroke="#64748b" strokeWidth="1" strokeLinecap="round" /></svg>
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="1" y="1" width="15" height="15" rx="2" stroke="#64748b" strokeWidth="1" /><circle cx="5.5" cy="5.5" r="1.5" fill="#64748b" /><path d="M1 12l4-4 3 3 2-2 6 6" stroke="#64748b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <svg width="17" height="13" viewBox="0 0 17 13" fill="none"><path d="M1 1l7.5 5.5L16 1M1 12h15V1H1z" stroke="#64748b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="chat-input-field">
                    <span>Message #general...</span>
                </div>
                <button className="chat-send-btn">
                    SEND
                    <span className="send-shape">□</span>
                </button>
            </div>
        </div>
    );
}
