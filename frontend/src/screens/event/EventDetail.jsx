import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useEventStore } from '../../context/EventStore';
import { api } from '../../lib/api';
import { haptic } from '../../lib/haptic';
import { useToast } from '../../components/Toast';
import './EventDetail.css';

const ARTISTS = [
    { name: 'TECHNO PHARAOH', stage: 'MAIN STAGE • HEADLINER', time: '22:00 ○', timeBg: '#f45c25', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop', highlighted: true },
    { name: 'SAHARA ECHOES', stage: 'CULTURAL TENT • LIVE BAND', time: '20:30 ○', timeBg: 'rgba(255,255,255,0.1)', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=64&h=64&fit=crop', highlighted: false },
    { name: 'PULSE GENERATOR', stage: 'THE UNDERGROUND • DJ SET', time: '19:00 ○', timeBg: 'rgba(255,255,255,0.1)', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=64&h=64&fit=crop', highlighted: false },
];

const TIERS = [
    {
        name: 'STANDARD', shape: '□', shapeColor: '#2dd4bf', subtitle: 'GENERAL ADMISSION', price: 'DZD 2,000',
        nameColor: 'white', subtitleColor: '#64748b',
        bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',
        items: ['Entry to Main Festival Grounds', 'Standard Food/Drink Access'],
        itemColor: '#94a3b8', dotColor: '#475569',
        buttonBg: 'rgba(45,212,191,0.2)', buttonBorder: '#2dd4bf', buttonText: 'SELECT □', buttonColor: '#2dd4bf',
        recommended: false,
    },
    {
        name: 'VIP PASS', shape: '△', shapeColor: '#fbbf24', subtitle: 'EXCLUSIVE ACCESS', price: 'DZD 5,000',
        nameColor: '#fbbf24', subtitleColor: 'rgba(251,191,36,0.6)',
        bg: 'rgba(251,191,36,0.05)', border: 'rgba(251,191,36,0.3)',
        items: ['Front Row Stage Access', 'VIP Lounge & Bar', 'Dedicated Restrooms'],
        itemColor: '#cbd5e1', dotColor: '#fbbf24',
        buttonBg: '#fbbf24', buttonBorder: 'transparent', buttonText: 'SELECT △', buttonColor: 'black',
        recommended: true,
    },
    {
        name: 'VVIP ULTIMATE', shape: '○', shapeColor: '#f45c25', subtitle: 'ALL ACCESS MISSION', price: 'DZD 12,000',
        nameColor: 'white', subtitleColor: '#64748b',
        bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',
        items: ['Backstage Access (Meet & Greet)', 'Private Table with Bottle Service', 'Priority Mission Site Parking'],
        itemColor: '#94a3b8', dotColor: '#f45c25',
        buttonBg: '#fbbf24', buttonBorder: 'transparent', buttonText: 'SELECT ○', buttonColor: 'black',
        recommended: false,
    },
];

const TYPE_SHAPES = { sport: '○', science: '△', charity: '□', cultural: '◇' };

// ----- Polymorphic Info Sections -----

function ScienceInfoSection({ event }) {
    const [showUpload, setShowUpload] = useState(false);

    return (
        <>
            {/* Call for Papers */}
            <section className="event-section">
                <div className="event-section-header">
                    <h2 className="event-section-title">CALL FOR PAPERS △</h2>
                    <span className="event-section-count" style={{ color: '#00E5CC' }}>
                        {event.submissions_count != null ? `${event.submissions_count} SUBMISSIONS` : 'OPEN'}
                    </span>
                </div>
                <div style={{ background: 'rgba(0,229,204,0.05)', borderRadius: '12px', border: '1px solid rgba(0,229,204,0.2)', padding: '20px', marginBottom: '16px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                        {event.cfp_description || 'Submit your research abstract for peer review. Accepted papers will be presented at the main conference track.'}
                    </p>
                    {event.cfp_deadline && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E5CC" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            <span style={{ color: '#00E5CC', fontSize: '11px', fontFamily: 'DM Mono, monospace', letterSpacing: '1px' }}>
                                DEADLINE: {new Date(event.cfp_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUpload(!showUpload)}
                        style={{ width: '100%', padding: '14px', background: showUpload ? '#2dd4bf' : 'rgba(0,229,204,0.15)', border: `1px solid ${showUpload ? '#2dd4bf' : 'rgba(0,229,204,0.4)'}`, borderRadius: '8px', color: showUpload ? '#000' : '#00E5CC', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '13px', letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                        {showUpload ? 'CLOSE UPLOAD □' : 'SUBMIT ABSTRACT □'}
                    </motion.button>
                    {showUpload && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" style={{ marginBottom: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            <p style={{ color: '#64748b', fontSize: '12px', fontFamily: 'DM Mono' }}>Drag PDF or DOCX here, or tap to browse</p>
                            <input type="file" accept=".pdf,.docx,.doc" style={{ marginTop: '12px', color: '#94a3b8', fontSize: '12px' }} />
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Sessions / Workshops */}
            <section className="event-section">
                <h2 className="event-section-title">SESSIONS & WORKSHOPS</h2>
                {(event.sessions && event.sessions.length > 0 ? event.sessions : [
                    { title: 'AI IN HEALTHCARE', speaker: 'Dr. Amina Khelil', time: '10:00 - 11:30', track: 'MAIN TRACK' },
                    { title: 'CLIMATE DATA ANALYSIS', speaker: 'Prof. Yacine Bouzid', time: '14:00 - 15:30', track: 'WORKSHOP' },
                ]).map((session, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ width: '4px', height: '40px', borderRadius: '2px', background: '#00E5CC' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '13px' }}>{session.title}</div>
                            <div style={{ color: '#64748b', fontSize: '11px', fontFamily: 'DM Mono' }}>{session.speaker} • {session.time}</div>
                        </div>
                        <span style={{ color: '#00E5CC', fontSize: '10px', fontFamily: 'DM Mono', letterSpacing: '1px', background: 'rgba(0,229,204,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{session.track}</span>
                    </motion.div>
                ))}
            </section>
        </>
    );
}

function CharityInfoSection({ event }) {
    const raised = event.donation_raised ?? 125000;
    const goal = event.donation_goal ?? 500000;
    const percentage = Math.min(100, (raised / goal) * 100);
    const [showDonate, setShowDonate] = useState(false);

    return (
        <>
            {/* Donation Progress */}
            <section className="event-section">
                <div className="event-section-header">
                    <h2 className="event-section-title">DONATION PROGRESS □</h2>
                    <span className="event-section-count" style={{ color: '#FFD700' }}>{percentage.toFixed(0)}% RAISED</span>
                </div>
                <div style={{ background: 'rgba(255,215,0,0.05)', borderRadius: '12px', border: '1px solid rgba(255,215,0,0.2)', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#FFD700', fontSize: '24px', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}>DZD {(raised).toLocaleString()}</span>
                        <span style={{ color: '#64748b', fontSize: '13px', fontFamily: 'DM Mono', alignSelf: 'flex-end' }}>of DZD {(goal).toLocaleString()}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #FFD700, #f45c25)', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                            <div style={{ color: '#FFD700', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '18px' }}>{event.donors_count ?? 42}</div>
                            <div style={{ color: '#64748b', fontSize: '10px', fontFamily: 'DM Mono', letterSpacing: '1px' }}>DONORS</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                            <div style={{ color: '#2dd4bf', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '18px' }}>{event.days_left ?? 14}</div>
                            <div style={{ color: '#64748b', fontSize: '10px', fontFamily: 'DM Mono', letterSpacing: '1px' }}>DAYS LEFT</div>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowDonate(!showDonate)}
                        style={{ width: '100%', padding: '14px', background: '#FFD700', border: 'none', borderRadius: '8px', color: '#000', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px', cursor: 'pointer' }}
                    >
                        DONATE ◇
                    </motion.button>
                    {showDonate && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                            {['500', '1000', '2500', '5000'].map(amount => (
                                <button key={amount} style={{ flex: '1 1 45%', padding: '12px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px', color: '#FFD700', fontFamily: 'Space Grotesk', fontWeight: 'bold', cursor: 'pointer' }}>
                                    DZD {Number(amount).toLocaleString()}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Volunteer Shifts */}
            {event.volunteer_shifts && event.volunteer_shifts.length > 0 && (
                <section className="event-section">
                    <h2 className="event-section-title">VOLUNTEER SHIFTS</h2>
                    {event.volunteer_shifts.map((shift, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div>
                                <div style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '13px' }}>{shift.role_name}</div>
                                <div style={{ color: '#64748b', fontSize: '11px', fontFamily: 'DM Mono' }}>{shift.time_start} – {shift.time_end} • {shift.spots_left ?? shift.count} spots</div>
                            </div>
                            <motion.button whileTap={{ scale: 0.95 }} style={{ padding: '8px 16px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '6px', color: '#FFD700', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer' }}>
                                APPLY △
                            </motion.button>
                        </div>
                    ))}
                </section>
            )}
        </>
    );
}

function SportInfoSection({ event, navigate }) {
    return (
        <section className="event-section">
            <h2 className="event-section-title">TEAM SELECTION ○</h2>
            {event.match_details && (
                <div style={{ background: 'rgba(255,77,77,0.05)', borderRadius: '12px', border: '1px solid rgba(255,77,77,0.2)', padding: '20px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '16px' }}>{event.match_details.team_a || 'TEAM A'}</div>
                            <div style={{ color: '#FF4D4D', fontSize: '24px', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}>{event.match_details.score_a ?? '-'}</div>
                        </div>
                        <span style={{ color: '#475569', fontSize: '14px', fontFamily: 'DM Mono' }}>VS</span>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '16px' }}>{event.match_details.team_b || 'TEAM B'}</div>
                            <div style={{ color: '#2dd4bf', fontSize: '24px', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}>{event.match_details.score_b ?? '-'}</div>
                        </div>
                    </div>
                    {event.match_details.status && (
                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '11px', fontFamily: 'DM Mono', letterSpacing: '1px' }}>{event.match_details.status.toUpperCase()}</div>
                    )}
                </div>
            )}
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '24px', textAlign: 'center' }}>
                {event.teams_count != null ? `${event.teams_count} teams forming.` : 'Teams are forming for this sporting event.'} Join one or create your own.
            </p>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/event/${event.id}/teams`)}
                style={{ width: '100%', borderColor: '#FF4D4D', color: '#FF4D4D', padding: '14px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', fontFamily: 'Space Grotesk', fontSize: '13px', cursor: 'pointer' }}
            >
                JOIN A TEAM △
            </motion.button>
        </section>
    );
}

// ----- Main Component -----

export default function EventDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const { isRegistered: isRegInStore, dispatch } = useEventStore();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('INFO');
    const [selectedTier, setSelectedTier] = useState(null);

    const { data: event, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['event', id],
        queryFn: () => api('GET', `/events/${id}`),
    });

    // Sync registration state from API response to store
    useEffect(() => {
        if (event?.my_registration) {
            dispatch({ type: 'REGISTER_EVENT', id: event.id });
        }
    }, [event, dispatch]);

    const isRegisteredOpt = isRegInStore(id);

    const registerMutation = useMutation({
        mutationFn: () => api('POST', `/events/${id}/register`),
        onMutate: () => {
            haptic();
            dispatch({ type: 'REGISTER_EVENT', id });
        },
        onSuccess: () => {
            showToast('REGISTERED ✓ CHECK YOUR NOTIFICATIONS', 'success');
        },
        onError: () => {
            dispatch({ type: 'UNREGISTER_EVENT', id });
            showToast('REGISTRATION FAILED', 'error');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['event', id] });
        }
    });

    const handleRegister = () => {
        if (!profile) {
            navigate('/auth/participant/login');
            return;
        }
        if (isRegisteredOpt || registerMutation.isPending) return;

        if (event?.require_custom_form) {
            navigate(`/event/${id}/register`);
            return;
        }

        registerMutation.mutate();
    };

    const isOrgOwner = profile?.role === 'organizer' && event?.org_id && profile?.organizations?.some(o => o.id === event.org_id);

    if (isLoading) {
        return (
            <div className="event-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px', animation: 'pulse 1.5s infinite ease-in-out' }}>LOADING MISSION...</span>
            </div>
        );
    }

    if (isError || !event) {
        return (
            <div className="event-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span style={{ color: 'white', fontFamily: 'Space Grotesk', fontSize: '16px', marginBottom: '8px' }}>Mission Data Corrupted</span>
                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px', marginBottom: '24px' }}>{error?.message || "Failed to load"}</span>
                <button onClick={() => refetch()} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}>RETRY MISSION</button>
            </div>
        );
    }

    const org = event.organizations || {};
    const typeShape = TYPE_SHAPES[event.event_type] || '○';

    return (
        <div className="event-root">
            <div className="event-noise" />

            {/* Top Nav */}
            <header className="event-topnav">
                <button className="event-back" onClick={() => navigate(-1)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <span className="event-topnav-title" onClick={() => navigate('/org/' + (org.slug || ''))} style={{ cursor: 'pointer' }}>MISSION: {org.name || 'EVENTFY'} {typeShape}</span>
                <button className="event-share" onClick={() => { if (navigator.share) navigator.share({ title: event.title, url: `/event/${id}` }); }}>
                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                        <path d="M2 10l7-8M9 2l7 8M9 2v14" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </header>

            {/* Hero */}
            <div className="event-hero">
                <motion.img layoutId={`event-image-${id}`} src={event.cover_url || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop"} alt="Event" />
                <div className="event-hero-gradient" />
                <div className="event-hero-content">
                    <div className="event-hero-badge">{typeShape} {event.event_type?.toUpperCase()} MISSION</div>
                    <h1 className="event-hero-title">{event.title?.toUpperCase()}</h1>
                    <div className="event-hero-meta">
                        <span className="event-meta-item">
                            <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><rect x="1" y="1" width="7" height="8" rx="1" stroke="#94a3b8" strokeWidth="1" /><line x1="3" y1="0" x2="3" y2="2" stroke="#94a3b8" strokeWidth="1" /><line x1="6" y1="0" x2="6" y2="2" stroke="#94a3b8" strokeWidth="1" /></svg>
                            {event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'TBD'}
                        </span>
                        <span className="event-meta-item">
                            <svg width="8" height="10" viewBox="0 0 8 10" fill="none"><path d="M4 0C2 0 0 1.5 0 4c0 3 4 6 4 6s4-3 4-6c0-2.5-2-4-4-4z" fill="#94a3b8" /><circle cx="4" cy="4" r="1.5" fill="black" /></svg>
                            {event.venue_name?.toUpperCase() || event.city?.toUpperCase() || 'ONLINE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Attendee Preview Row */}
            <div className="ed-attendee-preview" onClick={() => setActiveTab('COMMUNITY')} style={{ cursor: 'pointer' }}>
                <div className="ed-attendee-avatars">
                    {[1, 2, 3].map((_, i) => (
                        <img key={i} className="ed-attendee-avatar" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}-${i}`} alt="" style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: 3 - i }} />
                    ))}
                </div>
                <span className="ed-attendee-text">+{event.registration_count || 0} players registered</span>
            </div>

            {/* Tabs */}
            <div className="event-tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap', justifyContent: 'flex-start', WebkitOverflowScrolling: 'touch' }}>
                {['INFO', 'COMMUNITY', 'VOLUNTEERS', 'SPONSORS'].map(tab => (
                    <motion.button
                        key={tab}
                        whileTap={{ scale: 0.85 }}
                        className={`event-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                        style={{ position: 'relative' }}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="eventTabIndicator"
                                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#f56e3d' }}
                                transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.8 }}
                            />
                        )}
                        <span style={{ position: 'relative', zIndex: 1 }}>{tab}</span>
                    </motion.button>
                ))}
            </div>

            {/* Content */}
            <div className="event-content">
                {activeTab === 'INFO' && (
                    <>
                        {/* Description */}
                        {event.description && (
                            <section className="event-section">
                                <h2 className="event-section-title">ABOUT THIS MISSION</h2>
                                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.7' }}>{event.description}</p>
                            </section>
                        )}

                        {/* Polymorphic Sections */}
                        {event.event_type === 'cultural' && (
                            <>
                                {/* Lineup */}
                                <section className="event-section">
                                    <div className="event-section-header">
                                        <h2 className="event-section-title">THE LINEUP</h2>
                                        <span className="event-section-count">{String((event.performers || ARTISTS).length).padStart(2, '0')} PERFORMERS</span>
                                    </div>
                                    <div className="event-artists">
                                        {(event.performers && event.performers.length > 0 ? event.performers.map(p => ({
                                            name: p.name?.toUpperCase() || 'PERFORMER',
                                            stage: p.stage || p.role || 'MAIN STAGE',
                                            time: p.time_slot || '',
                                            timeBg: p.sort_order === 0 ? '#f45c25' : 'rgba(255,255,255,0.1)',
                                            image: p.image_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.name}`,
                                            highlighted: p.sort_order === 0,
                                        })) : ARTISTS).map((a, i) => (
                                            <motion.div key={i} className="event-artist" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                                                <div className={`event-artist-avatar ${a.highlighted ? 'highlighted' : ''}`}>
                                                    <img src={a.image} alt={a.name} />
                                                </div>
                                                <div className="event-artist-info">
                                                    <div className="event-artist-row">
                                                        <span className="event-artist-name">{a.name}</span>
                                                        <span className="event-artist-time" style={{ background: a.timeBg }}>{a.time}</span>
                                                    </div>
                                                    <span className="event-artist-stage">{a.stage}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                                {/* Access Tiers */}
                                <section className="event-section">
                                    <h2 className="event-section-title">ACCESS TIERS</h2>
                                    <div className="event-tiers">
                                        {(event.ticket_tiers && event.ticket_tiers.length > 0 ? event.ticket_tiers.map((t, idx) => ({
                                            name: t.name?.toUpperCase() || `TIER ${idx + 1}`,
                                            shape: ['□', '△', '○'][idx % 3],
                                            shapeColor: ['#2dd4bf', '#fbbf24', '#f45c25'][idx % 3],
                                            subtitle: t.description?.toUpperCase() || '',
                                            price: t.price ? `DZD ${Number(t.price).toLocaleString()}` : 'FREE',
                                            nameColor: idx === 1 ? '#fbbf24' : 'white',
                                            subtitleColor: idx === 1 ? 'rgba(251,191,36,0.6)' : '#64748b',
                                            bg: idx === 1 ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.05)',
                                            border: idx === 1 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)',
                                            items: t.perks || t.features || [],
                                            itemColor: '#94a3b8',
                                            dotColor: ['#475569', '#fbbf24', '#f45c25'][idx % 3],
                                            buttonBg: idx > 0 ? '#fbbf24' : 'rgba(45,212,191,0.2)',
                                            buttonBorder: idx > 0 ? 'transparent' : '#2dd4bf',
                                            buttonText: `SELECT ${['□', '△', '○'][idx % 3]}`,
                                            buttonColor: idx > 0 ? 'black' : '#2dd4bf',
                                            recommended: idx === 1,
                                        })) : TIERS).map((tier, i) => (
                                            <motion.div key={i} className="event-tier" style={{ background: tier.bg, borderColor: tier.border }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.12 }}>
                                                {tier.recommended && <div className="tier-recommended">RECOMMENDED</div>}
                                                <div className="tier-header">
                                                    <div className="tier-info">
                                                        <div className="tier-name-row">
                                                            <span className="tier-shape" style={{ color: tier.shapeColor }}>{tier.shape}</span>
                                                            <span className="tier-name" style={{ color: tier.nameColor }}>{tier.name}</span>
                                                        </div>
                                                        <span className="tier-subtitle" style={{ color: tier.subtitleColor }}>{tier.subtitle}</span>
                                                    </div>
                                                    <span className="tier-price">{tier.price}</span>
                                                </div>
                                                <div className="tier-items">
                                                    {tier.items.map((item, j) => (
                                                        <div key={j} className="tier-item">
                                                            <div className="tier-dot" style={{ background: tier.dotColor }} />
                                                            <span style={{ color: tier.itemColor }}>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <motion.button whileTap={{ scale: 0.95 }} className="tier-button"
                                                    onClick={() => { if (navigator.vibrate) navigator.vibrate(50); setSelectedTier(tier.name); }}
                                                    style={{
                                                        background: selectedTier === tier.name ? '#2dd4bf' : tier.buttonBg,
                                                        borderColor: selectedTier === tier.name ? '#2dd4bf' : tier.buttonBorder,
                                                        color: selectedTier === tier.name ? '#000' : tier.buttonColor,
                                                        border: tier.buttonBorder !== 'transparent' ? `1px solid ${selectedTier === tier.name ? '#2dd4bf' : tier.buttonBorder}` : 'none',
                                                    }}
                                                >
                                                    {selectedTier === tier.name ? 'SELECTED ✓' : tier.buttonText}
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                                {/* Mission Site */}
                                <section className="event-section">
                                    <div className="event-section-header">
                                        <h2 className="event-section-title">MISSION SITE</h2>
                                        <span className="event-section-location">
                                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 0C4 0 0 2 0 6.5c0 4 6.5 6.5 6.5 6.5S13 10.5 13 6.5C13 2 9 0 6.5 0z" fill="#64748b" /><circle cx="6.5" cy="6.5" r="2" fill="black" /></svg>
                                            {event.venue_name?.toUpperCase() || 'ALGIERS ARENA'}
                                        </span>
                                    </div>
                                    <div className="event-map-container">
                                        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop&sat=-100" alt="Map" className="event-map-img" />
                                        <div className="event-map-pin"><span>◇</span></div>
                                        <div className="event-map-label">DROP POINT: SECTOR B-4</div>
                                    </div>
                                </section>
                            </>
                        )}

                        {event.event_type === 'sport' && <SportInfoSection event={event} navigate={navigate} />}
                        {event.event_type === 'science' && <ScienceInfoSection event={event} />}
                        {event.event_type === 'charity' && <CharityInfoSection event={event} />}

                        {/* XP Card (all types) */}
                        <section className="event-xp-card">
                            <div className="xp-bg-text">XP</div>
                            <div className="xp-content">
                                <div className="xp-header">
                                    <div className="xp-icon">◇</div>
                                    <div className="xp-info">
                                        <span className="xp-label">MISSION REWARD</span>
                                        <span className="xp-value ed-xp-shimmer">+{event.xp_completion || 200} PLAYER XP</span>
                                    </div>
                                </div>
                                <div className="xp-badge-row">
                                    <div className="xp-badge-icon-shape" style={{ borderColor: TYPE_SHAPES[event.event_type] === '○' ? '#f56e3d' : TYPE_SHAPES[event.event_type] === '△' ? '#fbbf24' : TYPE_SHAPES[event.event_type] === '□' ? '#2dd4bf' : '#3b82f6' }}>
                                        <span style={{ color: TYPE_SHAPES[event.event_type] === '○' ? '#f56e3d' : TYPE_SHAPES[event.event_type] === '△' ? '#fbbf24' : TYPE_SHAPES[event.event_type] === '□' ? '#2dd4bf' : '#3b82f6', fontSize: '16px' }}>{typeShape}</span>
                                    </div>
                                    <div className="xp-badge-info">
                                        <span className="xp-badge-title">{event.event_type?.toUpperCase()} ENTHUSIAST {typeShape}</span>
                                        <span className="xp-badge-sub">COLLECTIBLE BADGE</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {activeTab === 'COMMUNITY' && (
                    <div className="event-section" style={{ padding: '20px 0' }}>
                        {/* Compose bar CTA */}
                        <div className="ed-community-compose" onClick={() => navigate(`/chat/${event.id}`)} style={{ cursor: 'pointer' }}>
                            <img className="ed-compose-avatar" src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'} alt="" />
                            <span className="ed-compose-placeholder">Write something...</span>
                        </div>

                        {/* Skeleton message previews */}
                        <div className="ed-community-messages">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="ed-community-skeleton">
                                    <div className="ed-skel-avatar" />
                                    <div className="ed-skel-lines">
                                        <div className="ed-skel-line" style={{ width: `${60 + i * 15}%` }} />
                                        <div className="ed-skel-line short" style={{ width: `${40 + i * 10}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Open Lobby + See All */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px', marginTop: '16px' }}>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(`/chat/${event.id}`)} style={{ borderColor: '#2dd4bf', color: '#2dd4bf', padding: '14px 24px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', fontFamily: 'Space Grotesk', fontSize: '13px', cursor: 'pointer' }}>
                                OPEN LOBBY ○
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(`/chat/${event.id}`)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', textAlign: 'center' }}>
                                SEE ALL ACTIVITY →
                            </motion.button>
                        </div>
                    </div>
                )}
                {activeTab === 'VOLUNTEERS' && (
                    <div className="event-section" style={{ padding: '40px 0' }}>
                        <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', letterSpacing: '2px', marginBottom: '16px', textAlign: 'center' }}>VOLUNTEER MISSIONS</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', textAlign: 'center', marginBottom: '24px' }}>Help organize the event and earn special XP.</p>
                        {(event.volunteer_shifts || []).map((shift, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div>
                                    <div style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '13px' }}>{shift.role_name}</div>
                                    <div style={{ color: '#64748b', fontSize: '11px', fontFamily: 'DM Mono' }}>{shift.time_start} – {shift.time_end} • {shift.count} needed</div>
                                </div>
                                <motion.button whileTap={{ scale: 0.95 }} style={{ padding: '8px 16px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: '6px', color: '#2dd4bf', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer' }}>
                                    APPLY △
                                </motion.button>
                            </div>
                        ))}
                        {(!event.volunteer_shifts || event.volunteer_shifts.length === 0) && (
                            <div style={{ textAlign: 'center', color: '#475569', fontFamily: 'DM Mono', fontSize: '12px' }}>No volunteer positions listed yet.</div>
                        )}
                    </div>
                )}
                {activeTab === 'SPONSORS' && (
                    <div className="event-section" style={{ textAlign: 'center', padding: '40px 0' }}>
                        <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', letterSpacing: '2px', marginBottom: '16px' }}>EVENT PARTNERS</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Supported by leading brands in the industry.</p>
                    </div>
                )}
            </div>

            {/* Unified Sticky Footer */}
            <div className="event-footer ed-footer-unified">
                {isOrgOwner ? (
                    <div className="ed-footer-row">
                        <motion.button whileTap={{ scale: 0.95 }} className="event-cta ed-cta-half" onClick={() => navigate(`/manage/${id}`)} style={{ background: 'transparent', border: '1px solid #fbbf24', color: '#fbbf24' }}>
                            <span>MANAGE □</span>
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} className="event-cta ed-cta-half" onClick={() => { if (navigator.share) navigator.share({ title: event.title, url: `/event/${id}` }); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                            <span>SHARE ○</span>
                        </motion.button>
                    </div>
                ) : !isRegisteredOpt ? (
                    <motion.button whileTap={{ scale: 0.95 }} className="event-cta" onClick={handleRegister} disabled={registerMutation.isPending}>
                        <span>{registerMutation.isPending ? 'REGISTERING...' : 'ENTER THE GAME'}</span>
                        {!registerMutation.isPending && <div className="cta-circle">○</div>}
                    </motion.button>
                ) : event.my_registration?.checked_in ? (
                    <motion.button className="event-cta" style={{ background: '#2dd4bf', opacity: 0.7, cursor: 'default' }} disabled>
                        <span>CHECKED IN ✓ +{event.xp_checkin || 50}XP</span>
                    </motion.button>
                ) : (
                    <div className="ed-footer-row">
                        <motion.button className="event-cta ed-cta-half" style={{ background: '#2dd4bf', opacity: 0.8, cursor: 'default' }} disabled>
                            <span>YOU'RE IN ✓</span>
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} className="event-cta ed-cta-half" onClick={() => navigate(`/qr/${id}`)} style={{ background: 'transparent', border: '1px solid white' }}>
                            <span>SCAN IN ○</span>
                        </motion.button>
                    </div>
                )}
            </div>
        </div>
    );
}
