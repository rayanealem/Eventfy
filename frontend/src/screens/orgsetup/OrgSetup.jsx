import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, apiUpload } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import './OrgSetup.css';

const STEPS = [
    { id: 1, icon: '○', label: 'IDENTITY' },
    { id: 2, icon: '△', label: 'TEAM' },
    { id: 3, icon: '□', label: 'EVENT' },
    { id: 4, icon: '◇', label: 'GAMIFY' },
    { id: 5, icon: '⬡', label: 'DISCOVER' },
];

const CATEGORIES = [
    { label: 'TECH' },
    { label: 'SPORT' },
    { label: 'ART' },
    { label: 'GAMING' },
    { label: 'MUSIC' },
];

export default function OrgSetup() {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [tagline, setTagline] = useState('');
    const [website, setWebsite] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    // Team State
    const [team, setTeam] = useState([]);
    const [inviteQuery, setInviteQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedRole, setSelectedRole] = useState('member');

    useEffect(() => {
        loadOrg();
    }, []);

    const loadOrg = async () => {
        try {
            const data = await api('GET', '/auth/me');
            if (data?.managed_orgs?.length > 0) {
                const myOrg = data.managed_orgs[0];
                setOrg(myOrg);
                setTagline(myOrg.description || '');
                setWebsite(myOrg.website || '');
                setLogoUrl(myOrg.logo_url || '');
            } else {
                navigate('/splash'); // No org found
            }
        } catch (error) {
            console.error("Failed to load org:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file || !org) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await apiUpload(`/orgs/${org.id}/${type}`, file, 'file');
            if (type === 'logo') setLogoUrl(res.logo_url);
            if (type === 'cover') setCoverUrl(res.cover_url);
        } catch (error) {
            console.error(`Upload ${type} failed:`, error);
        }
    };

    const saveIdentity = async () => {
        if (!org) return;
        setSaving(true);
        try {
            await api('PATCH', `/orgs/${org.id}`, {
                description: tagline,
                website: website
            });
            setStep(2);
        } catch (error) {
            console.error("Error saving identity:", error);
        } finally {
            setSaving(false);
        }
    };

    // User Search for Team
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (inviteQuery.length > 2) {
                try {
                    const res = await api('GET', `/search?q=${inviteQuery}&type=users`);
                    setSearchResults(res.users || []);
                } catch (error) {
                    console.error("Search error:", error);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [inviteQuery]);

    const inviteMember = async (user) => {
        if (!org) return;
        try {
            await api('POST', `/orgs/${org.id}/members`, {
                user_id: user.id,
                role: selectedRole
            });
            setTeam([...team, { ...user, org_role: selectedRole }]);
            setInviteQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error("Invite failed:", error);
        }
    };

    if (loading) return <div style={{ color: 'var(--color-teal)', padding: '2rem' }}>INITIALIZING SECURE LINK...</div>;

    return (
        <div className="orgset-root">
            <div className="orgset-noise" />

            {/* Header */}
            <header className="orgset-header">
                <div className="orgset-header-top">
                    <span className="orgset-back" onClick={() => step > 1 ? setStep(step - 1) : navigate('/explore')}>‹</span>
                    <h1 className="orgset-title">WELCOME TO THE<br />ARENA □</h1>
                    <span className="orgset-menu">⊕</span>
                </div>

                {/* Progress Bar */}
                <div className="orgset-progress">
                    {STEPS.map((s, i) => (
                        <div key={i} className="orgset-prog-item">
                            <div className={`orgset-prog-icon ${step >= s.id ? 'active' : ''}`}>
                                <span>{s.icon}</span>
                            </div>
                            {i < STEPS.length - 1 && <div className={`orgset-prog-line ${step > s.id ? 'active' : ''}`} />}
                        </div>
                    ))}
                </div>
            </header>

            {/* Main Form */}
            <div className="orgset-main">
                {/* Step 1: Identity */}
                {step === 1 && (
                    <section className="orgset-section">
                        <div className="orgset-section-head">
                            <span className="orgset-section-label active">Step 1 ○ IDENTITY</span>
                            <span className="orgset-section-status">INITIATING PROTOCOL</span>
                        </div>

                        {/* Cover Upload */}
                        <label className="orgset-cover-upload" style={{
                            backgroundImage: coverUrl ? `url(${coverUrl})` : 'none',
                            backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer'
                        }}>
                            {!coverUrl && (
                                <>
                                    <span className="orgset-upload-icon">↑</span>
                                    <span className="orgset-upload-title">UPLOAD COVER IMAGE</span>
                                    <span className="orgset-upload-hint">16:9 RATIO REQUIRED</span>
                                </>
                            )}
                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
                        </label>


                        {/* Logo + Tagline */}
                        <div className="orgset-logo-row">
                            <label className="orgset-logo-upload" style={{
                                backgroundImage: logoUrl ? `url(${logoUrl})` : 'none',
                                backgroundSize: 'cover', cursor: 'pointer'
                            }}>
                                {!logoUrl && <span className="orgset-logo-icon">+</span>}
                                <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                            </label>
                            <div className="orgset-tagline-field">
                                <label className="orgset-label">Tagline □</label>
                                <input className="orgset-input" placeholder="Enter Arena Slogan..." value={tagline} onChange={e => setTagline(e.target.value)} />
                            </div>
                        </div>

                        {/* Social */}
                        <div className="orgset-social-row">
                            <div className="orgset-social-input">
                                <span className="orgset-social-icon">🌐</span>
                                <input className="orgset-input sm" placeholder="Website / Link" value={website} onChange={e => setWebsite(e.target.value)} />
                            </div>
                        </div>

                        <button className="btn btn-teal" onClick={saveIdentity} disabled={saving} style={{ marginTop: 24, alignSelf: 'flex-end' }}>
                            {saving ? 'SAVING...' : 'PROCEED △'}
                        </button>
                    </section>
                )}

                {/* Step 2: Team */}
                {step === 2 && (
                    <section className="orgset-section">
                        <div className="orgset-section-head">
                            <span className="orgset-section-label active">Step 2 △ TEAM</span>
                            <span className="orgset-skip-link" onClick={() => setStep(3)}>SKIP FOR NOW</span>
                        </div>

                        <label className="orgset-label">INVITE PLAYERS △</label>
                        <div className="orgset-invite-row">
                            <input className="orgset-input flex1" placeholder="Search by username..." value={inviteQuery} onChange={e => setInviteQuery(e.target.value)} />
                            <select className="orgset-role-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ background: 'transparent', color: 'var(--color-teal)', border: '1px solid var(--color-teal)', padding: '0 8px' }}>
                                <option value="member">Member ○</option>
                                <option value="admin">Admin △</option>
                                <option value="owner">Owner □</option>
                            </select>
                        </div>

                        {searchResults.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginTop: 12 }}>
                                {searchResults.map(u => (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <img src={u.avatar_url || "https://i.pravatar.cc/40?img=1"} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                                            <span>{u.username}</span>
                                        </div>
                                        <button onClick={() => inviteMember(u)} style={{ background: 'var(--color-teal)', color: '#000', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}>+</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="orgset-team-grid">
                            <div className="orgset-team-card active">
                                <div className="orgset-team-avatar"><span>{org.name.substring(0, 2)}</span></div>
                                <div className="orgset-team-info">
                                    <span className="orgset-team-name">{org.name}</span>
                                    <span className="orgset-team-role">OWNER □</span>
                                </div>
                            </div>
                            {team.map(member => (
                                <div key={member.id} className="orgset-team-card">
                                    <div className="orgset-team-avatar" style={{ backgroundImage: `url(${member.avatar_url})`, backgroundSize: 'cover' }}></div>
                                    <div className="orgset-team-info">
                                        <span className="orgset-team-name">{member.username}</span>
                                        <span className="orgset-team-role">{member.org_role.toUpperCase()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-teal" onClick={() => setStep(3)} style={{ marginTop: 24, alignSelf: 'flex-end' }}>
                            PROCEED □
                        </button>
                    </section>
                )}

                {/* Step 3: First Event */}
                {step === 3 && (
                    <section className="orgset-section">
                        <div className="orgset-section-head">
                            <span className="orgset-section-label active">Step 3 □ FIRST EVENT</span>
                        </div>
                        <div className="orgset-event-card">
                            <span className="orgset-event-icon">📅</span>
                            <span className="orgset-event-title">READY TO COMMENCE?</span>
                            <span className="orgset-event-desc">Initialize your first challenge to attract<br />participants to your arena.</span>
                            <button className="orgset-event-btn primary" onClick={() => navigate('/event/create')}>CREATE EVENT NOW □</button>
                            <button className="orgset-event-btn outline" onClick={() => setStep(4)}>SKIP FOR NOW</button>
                        </div>
                    </section>
                )}

                {/* Step 4: Gamification */}
                {step === 4 && (
                    <section className="orgset-section">
                        <div className="orgset-section-head">
                            <span className="orgset-section-label active">Step 4 ◇ GAMIFICATION</span>
                            <span className="orgset-skip-link" onClick={() => setStep(5)}>SKIP</span>
                        </div>
                        <div className="orgset-xp-header">
                            <span className="orgset-label">XP ALLOCATION ◇</span>
                            <span className="orgset-xp-value">2,500 XP</span>
                        </div>
                        <div className="orgset-xp-bar">
                            <div className="orgset-xp-fill" />
                        </div>
                        <div className="orgset-multiplier-row">
                            <div className="orgset-multiplier-info">
                                <span className="orgset-mult-name">VOLUNTEER MULTIPLIER</span>
                                <span className="orgset-mult-desc">Boost XP for support roles</span>
                            </div>
                            <div className="orgset-mult-toggle">
                                <button className="orgset-mult-btn active">2×</button>
                                <button className="orgset-mult-btn">3×</button>
                            </div>
                        </div>
                        <button className="btn btn-teal" onClick={() => setStep(5)} style={{ marginTop: 24, alignSelf: 'flex-end' }}>
                            PROCEED ⬡
                        </button>
                    </section>
                )}

                {/* Step 5: Discovery & Completion */}
                {step === 5 && (
                    <section className="orgset-section">
                        <div className="orgset-section-head">
                            <span className="orgset-section-label active">Step 5 ⬡ DISCOVERY</span>
                        </div>
                        <span className="orgset-label">CATEGORIES ⬡</span>
                        <div className="orgset-cat-row">
                            {CATEGORIES.map((c, i) => (
                                <button key={i} className={`orgset-cat-btn ${c.label === 'TECH' ? 'active' : ''}`}>{c.label}</button>
                            ))}
                        </div>
                        <div className="orgset-toggle-list">
                            <div className="orgset-toggle-item">
                                <span className="orgset-toggle-label">ENABLE ORG STORIES □</span>
                                <div className="orgset-toggle on"><div className="orgset-toggle-knob" /></div>
                            </div>
                            <div className="orgset-toggle-item">
                                <span className="orgset-toggle-label">ALLOW SPONSORSHIPS ◇</span>
                                <div className="orgset-toggle off"><div className="orgset-toggle-knob" /></div>
                            </div>
                        </div>

                        {/* Completion Card */}
                        <div className="orgset-completion" style={{ marginTop: 48 }}>
                            <div className="orgset-comp-gold-line" />
                            <div className="orgset-comp-icon">🏛</div>
                            <h2 className="orgset-comp-title">YOUR ARENA IS<br />READY ◇</h2>
                            <p className="orgset-comp-quote">"The games are about to begin. May<br />the odds favor your organization."</p>
                            <button className="orgset-comp-btn" onClick={async () => {
                                try {
                                    if (user) {
                                        await supabase.from('profiles').update({ onboarding_done: true }).eq('id', user.id);
                                        if (refreshProfile) await refreshProfile();
                                    }
                                } catch (e) {
                                    console.error('Error completing org onboarding', e);
                                }
                                navigate(`/org/dashboard`);
                            }}>GO TO ORG DASHBOARD □</button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
