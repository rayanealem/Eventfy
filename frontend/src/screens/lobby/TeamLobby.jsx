import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import './TeamLobby.css';

export default function TeamLobby() {
    const { profile } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [teams, setTeams] = useState([]);

    // Default active event or use params
    const activeEventId = 'e2b5e28d-19cd-4a37-b6f7-bcca155e88d0';

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            const data = await api('GET', `/teams/${activeEventId}`);
            setTeams(data || []);
        } catch (e) {
            console.error("Failed to load teams", e);
            // Fallback empty UI instead of mock
            setTeams([]);
        }
    };

    const handleCreateTeam = async () => {
        if (!teamName.trim()) return;
        try {
            await api('POST', '/teams', {
                event_id: activeEventId,
                name: teamName.trim()
            });
            setTeamName('');
            loadTeams();
        } catch (e) {
            console.error("Error creating team:", e);
        }
    };

    const handleJoinTeam = async (teamId) => {
        try {
            await api('POST', `/teams/${teamId}/join`);
            loadTeams();
        } catch (e) {
            console.error("Error joining team:", e);
        }
    };

    // Find my team
    const myTeam = teams.find(t => t.members?.some(m => m.user_id === profile?.id));

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
                        <button className="tl-create-btn" onClick={handleCreateTeam}>CREATE TEAM □</button>
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
                    {teams.filter(t => t.id !== myTeam?.id).map((team, i) => {
                        const count = team.members?.length || 0;
                        const max = team.max_members || 5;
                        const borderColor = count >= max ? 'rgba(255,255,255,.2)' : '#2dd4bf';
                        const countColor = count >= max ? 'rgba(255,255,255,.4)' : '#2dd4bf';

                        return (
                            <motion.div
                                key={team.id || i}
                                className="tl-team-card"
                                style={{ borderLeftColor: borderColor, cursor: count < max ? 'pointer' : 'default' }}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                onClick={() => count < max ? handleJoinTeam(team.id) : null}
                            >
                                <div className="tl-team-header">
                                    <span className="tl-team-name">{team.name}</span>
                                    <span className="tl-team-count" style={{ color: countColor }}>{count}/{max}</span>
                                </div>
                                <div className="tl-team-avatars">
                                    {(team.members || []).map((m, j) => (
                                        <div key={j} className="tl-team-avatar">
                                            <img src={m.profiles?.avatar_url || `https://i.pravatar.cc/32?u=${m.user_id}`} alt="" />
                                            {m.user_id === team.leader_id && <span className="tl-star">★</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="tl-team-skills">
                                    {(team.skills_needed || []).map((skill, j) => (
                                        <span key={j} className="tl-skill-pill">{skill}</span>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Your Team */}
                {myTeam && (
                    <motion.div
                        className="tl-your-team"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="tl-yt-header">
                            <span className="tl-yt-title">YOUR TEAM: {myTeam.name}</span>
                            <span className="tl-yt-badge">ACTIVE</span>
                        </div>

                        <div className="tl-yt-members">
                            <div className="tl-yt-avatars">
                                {(myTeam.members || []).map((m, i) => (
                                    <div key={i} className={`tl-yt-avatar ${m.user_id === myTeam.leader_id ? 'leader' : ''}`}>
                                        <img src={m.profiles?.avatar_url || `https://i.pravatar.cc/48?u=${m.user_id}`} alt="" />
                                    </div>
                                ))}
                                {(myTeam.members?.length || 0) < (myTeam.max_members || 5) && (
                                    <div className="tl-yt-avatar-placeholder">+</div>
                                )}
                            </div>
                            <div className="tl-yt-capacity">
                                <span className="tl-yt-cap-label">CAPACITY</span>
                                <span className="tl-yt-cap-value">{myTeam.members?.length || 0}/{myTeam.max_members || 5} PLAYERS</span>
                            </div>
                        </div>

                        <div className="tl-yt-skills">
                            <div className="tl-yt-skills-label">
                                <span>TEAM SKILLS COVERAGE</span>
                                <span>{Math.round(((myTeam.members?.length || 0) / (myTeam.max_members || 5)) * 100)}%</span>
                            </div>
                            <div className="tl-yt-bar">
                                <div className="tl-yt-bar-fill" style={{ width: `${Math.round(((myTeam.members?.length || 0) / (myTeam.max_members || 5)) * 100)}%` }} />
                            </div>
                        </div>

                        <div className="tl-yt-actions">
                            <button className="tl-leave-btn" onClick={async () => {
                                await api('DELETE', `/teams/${myTeam.id}/members/${profile?.id}`);
                                loadTeams();
                            }}>LEAVE △</button>
                            {profile?.id === myTeam.leader_id && (
                                <button className="tl-ready-btn" onClick={async () => {
                                    await api('PATCH', `/teams/${myTeam.id}/ready`);
                                    loadTeams();
                                }}>READY ○</button>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
