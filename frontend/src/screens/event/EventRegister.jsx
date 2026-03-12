import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { haptic } from '../../lib/haptic';
import { useToast } from '../../components/Toast';

export default function EventRegister() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const [formReady, setFormReady] = useState(false);

    // Form Fields
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [extraInfo, setExtraInfo] = useState('');

    const { data: event, isLoading: eventLoading, isError } = useQuery({
        queryKey: ['event', id],
        queryFn: () => api('GET', `/events/${id}`),
    });

    // Auto-fill using known Supabase Profile data
    useEffect(() => {
        if (profile && !formReady) {
            setFullName(profile.full_name || profile.username || '');
            setFormReady(true);
        }
    }, [profile, formReady]);

    const registerMutation = useMutation({
        mutationFn: async (payload) => api('POST', `/events/${id}/register`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', id] });
            showToast('YOUR REGISTRATION IS DONE, GOOD GAME!', 'success');
            haptic();
            navigate(`/event/${id}`, { replace: true });
        },
        onError: (err) => {
            const msg = err.message || 'Mission failed';
            if (msg.includes('expired') || msg.includes('Unauthorized') || msg.includes('Session')) {
                showToast('SESSION EXPIRED: PLEASE LOG IN AGAIN', 'error');
            } else {
                showToast(msg.toUpperCase() + ' ✕', 'error');
            }
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fullName.trim() || !phoneNumber.trim()) {
            showToast('PLEASE FILL ALL REQUIRED FIELDS', 'error');
            return;
        }

        haptic();
        const payload = {
            fullName,
            phoneNumber,
            extraInfo: extraInfo || null
        };
        registerMutation.mutate(payload);
    };

    if (eventLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ color: '#2dd4bf', fontFamily: 'DM Mono', animation: 'pulse 1.5s infinite' }}>DECRYPTING FORM...</span>
            </div>
        );
    }

    if (isError || !event) {
        return (
            <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#ef4444' }}>
                <span style={{ fontSize: '40px', marginBottom: '16px' }}>✕</span>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 'bold' }}>EVENT NOT FOUND</span>
                <button onClick={() => navigate(-1)} style={{ marginTop: '24px', padding: '12px 24px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer' }}>ABORT MISSION</button>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(45,212,191,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(244,92,37,0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

            <header style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                <button
                    onClick={() => { haptic(); navigate(-1); }}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                >
                    ‹
                </button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ color: '#2dd4bf', fontFamily: 'DM Mono', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>REGISTRATION SECURE</span>
                    <h1 style={{ color: 'white', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '16px', margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.title}
                    </h1>
                </div>
                <div style={{ width: '40px' }} /> {/* Spacer */}
            </header>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                {/* Event Summary Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '32px',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={event.cover_url || 'https://images.unsplash.com/photo-1540039155733-d7696c278160?w=200&h=200&fit=crop'} alt="Event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'DM Mono', marginBottom: '4px', textTransform: 'uppercase' }}>{event.event_type} EVENT □</div>
                        <div style={{ color: '#f1f5f9', fontWeight: 'bold', fontFamily: 'Space Grotesk', fontSize: '14px', marginBottom: '4px' }}>{new Date(event.starts_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}</div>
                        <div style={{ color: '#2dd4bf', fontSize: '12px', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}>{event.venue_name?.toUpperCase() || 'ALGIERS ARENA'}</div>
                    </div>
                </div>

                {/* The Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'DM Mono', letterSpacing: '1px' }}>LEGAL SURNAME & FIRST NAME *</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="e.g. John Doe"
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontFamily: 'Space Grotesk',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = '#2dd4bf'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'DM Mono', letterSpacing: '1px' }}>PHONE NUMBER *</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            placeholder="e.g. 0555 12 34 56"
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontFamily: 'Space Grotesk',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = '#2dd4bf'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'DM Mono', letterSpacing: '1px' }}>ADDITIONAL INFORMATION (OPTIONAL)</label>
                        <textarea
                            value={extraInfo}
                            onChange={e => setExtraInfo(e.target.value)}
                            placeholder="Allergies, emergency contacts, or special requests..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontFamily: 'Space Grotesk',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                resize: 'none'
                            }}
                            onFocus={e => e.target.style.borderColor = '#2dd4bf'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                        <p style={{ color: '#64748b', fontSize: '11px', textAlign: 'center', marginBottom: '16px', fontFamily: 'DM Mono' }}>
                            By entering the game, you agree to the organization's registration terms.
                        </p>
                        <motion.button
                            type="submit"
                            whileTap={{ scale: 0.95 }}
                            disabled={registerMutation.isPending}
                            style={{
                                width: '100%',
                                padding: '18px',
                                background: registerMutation.isPending ? 'rgba(45,212,191,0.5)' : '#2dd4bf',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#000',
                                fontFamily: 'Space Grotesk',
                                fontWeight: 'bold',
                                fontSize: '15px',
                                letterSpacing: '2px',
                                cursor: registerMutation.isPending ? 'default' : 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {registerMutation.isPending ? 'SECURING POSITION...' : 'FINALIZE REGISTRATION ◇'}
                        </motion.button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
}
