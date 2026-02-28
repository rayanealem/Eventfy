import { useState } from 'react';
import { motion } from 'framer-motion';
import './TeamLobby.css';

const TEAMS = [
    { name: 'VANGUARD_X', count: '3/4', countColor: '#2dd4bf', skills: ['STRENGTH', 'LUCK'], avatars: 2, borderColor: '#2dd4bf', opacity: 1 },
    { name: 'NULL_VOID', count: '1/4', countColor: 'rgba(255,255,255,.4)', skills: ['AGILITY'], avatars: 1, borderColor: 'rgba(255,255,255,.2)', opacity: 0.8 },
    { name: 'REBEL_SQUAD', count: '2/4', countColor: 'rgba(255,255,255,.4)', skills: ['INTEL'], avatars: 2, borderColor: 'rgba(255,255,255,.2)', opacity: 0.8 },
    { name: 'PLAYER_ONE', count: '1/4', countColor: 'rgba(255,255,255,.4)', skills: ['LUCK'], avatars: 1, borderColor: 'rgba(255,255,255,.2)', opacity: 0.8 },
];

export default function TeamLobby() {
    const [teamName, setTeamName] = useState('');

    return (
        <div className="tl-root">
            <div className="tl-noise" />

            {/* Header */}
            <header className="tl-header">
                <div className="tl-header-top">
                    <div className="tl-title-wrap">
                        <h1 className="tl-title">TEAM FORMATION</h1>
                        <span className="tl-title-shape">○</span>
                    </div>
                    <div className="tl-countdown">
                        <span className="tl-cd-label">STARTS IN</span>
                        <span className="tl-cd-time">5:00</span>
                    </div>
                </div>

                <div className="tl-event-row">
                    <div className="tl-event-badge">SQUID GAME EVENT</div>
                    <div className="tl-online">
                        <div className="tl-online-dot" />
                        <span>24 PLAYERS IN LOBBY ○</span>
                    </div>
                </div>

                <div className="tl-create-section">
                    <input
                        className="tl-input"
                        placeholder="ENTER TEAM NAME..."
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                    />
                    <div className="tl-create-btns">
                        <button className="tl-create-btn">CREATE TEAM □</button>
                        <button className="tl-copy-btn">COPY LINK △</button>
                    </div>
                </div>
            </header>

            {/* Teams Grid */}
            <div className="tl-main">
                <div className="tl-section-head">
                    <span className="tl-section-title">AVAILABLE TEAMS</span>
                    <span className="tl-section-layout">GRID 2xN</span>
                </div>

                <div className="tl-grid">
                    {TEAMS.map((team, i) => (
                        <motion.div
                            key={i}
                            className="tl-team-card"
                            style={{ borderLeftColor: team.borderColor, opacity: team.opacity }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: team.opacity, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <div className="tl-team-header">
                                <span className="tl-team-name">{team.name}</span>
                                <span className="tl-team-count" style={{ color: team.countColor }}>{team.count}</span>
                            </div>
                            <div className="tl-team-avatars">
                                {[...Array(team.avatars)].map((_, j) => (
                                    <div key={j} className="tl-team-avatar">
                                        <img src={`https://i.pravatar.cc/32?img=${i * 3 + j + 10}`} alt="" />
                                        {j === 0 && <span className="tl-star">★</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="tl-team-skills">
                                {team.skills.map((skill, j) => (
                                    <span key={j} className="tl-skill-pill">{skill}</span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Your Team */}
                <motion.div
                    className="tl-your-team"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="tl-yt-header">
                        <span className="tl-yt-title">YOUR TEAM: ALPHA_7</span>
                        <span className="tl-yt-badge">ACTIVE</span>
                    </div>

                    <div className="tl-yt-members">
                        <div className="tl-yt-avatars">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className={`tl-yt-avatar ${i === 0 ? 'leader' : ''}`}>
                                    <img src={`https://i.pravatar.cc/48?img=${20 + i}`} alt="" />
                                </div>
                            ))}
                            <div className="tl-yt-avatar-placeholder">+</div>
                        </div>
                        <div className="tl-yt-capacity">
                            <span className="tl-yt-cap-label">CAPACITY</span>
                            <span className="tl-yt-cap-value">3/4 PLAYERS</span>
                        </div>
                    </div>

                    <div className="tl-yt-skills">
                        <div className="tl-yt-skills-label">
                            <span>TEAM SKILLS COVERAGE</span>
                            <span>75%</span>
                        </div>
                        <div className="tl-yt-bar">
                            <div className="tl-yt-bar-fill" />
                        </div>
                    </div>

                    <div className="tl-yt-actions">
                        <button className="tl-leave-btn">LEAVE △</button>
                        <button className="tl-ready-btn">READY ○</button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
