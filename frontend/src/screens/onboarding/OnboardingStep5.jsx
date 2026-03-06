import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import './OnboardingSteps.css';

export default function OnboardingStep5() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [orgs, setOrgs] = useState([]);
    const [followedIds, setFollowedIds] = useState(new Set());
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchOrgs = async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name, follower_count, logo_url')
                .eq('status', 'approved')
                .limit(4);

            if (!error && data) {
                setOrgs(data);
                // Pre-select all by default to encourage following
                setFollowedIds(new Set(data.map(o => o.id)));
            }
            setLoadingData(false);
        };
        fetchOrgs();
    }, []);

    const toggleFollow = (id) => {
        setFollowedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleNext = async () => {
        if (!user || followedIds.size === 0) {
            navigate('/onboarding/6');
            return;
        }

        setSaving(true);
        try {
            // Prepare insert array
            const inserts = Array.from(followedIds).map(orgId => ({
                user_id: user.id,
                org_id: orgId
            }));

            // Ignore conflicts if already following
            const { error } = await supabase
                .from('org_followers')
                .upsert(inserts, { onConflict: 'user_id,org_id' });

            if (error) throw error;
            navigate('/onboarding/6');
        } catch (err) {
            console.error('Failed to save follows:', err);
            navigate('/onboarding/6');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="obs-root">
            <header className="obs-sticky-header">
                <span className="obs-brand">EVENTFY</span>
                <div className="obs-header-shapes">
                    <span className="obs-h-shape">○</span>
                    <span className="obs-h-shape">△</span>
                    <span className="obs-h-shape">□</span>
                    <span className="obs-h-shape active">◇</span>
                </div>
            </header>

            <div className="obs-progress-wrap">
                <div className="obs-progress-bar">
                    <div className="obs-progress-fill" style={{ width: '83%' }} />
                </div>
                <span className="obs-progress-label">STEP 5 OF 6</span>
            </div>

            <div className="obs-main single-step">
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 5: CHOOSE YOUR<br />ALLIES ◇</h2>

                    {loadingData ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Scanning radar...</div>
                    ) : (
                        <div className="obs-allies-grid">
                            {orgs.map((org) => {
                                const isFollowing = followedIds.has(org.id);
                                return (
                                    <div key={org.id} className="obs-ally-card" style={{ borderColor: isFollowing ? '#13ecec' : 'rgba(255,255,255,0.1)' }}>
                                        <div className="obs-ally-avatar" style={{ background: 'rgba(19,236,236,0.1)' }}>
                                            <img src={org.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${org.name}`} alt="" />
                                        </div>
                                        <span className="obs-ally-name">{org.name}</span>
                                        <span className="obs-ally-members">{org.follower_count || 0} MEMBERS</span>
                                        <button
                                            className="obs-follow-btn"
                                            onClick={() => toggleFollow(org.id)}
                                            style={{
                                                background: isFollowing ? '#13ecec' : 'transparent',
                                                color: isFollowing ? '#000' : '#13ecec'
                                            }}
                                        >
                                            {isFollowing ? '✓ Selected' : '+ Select'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <button className="obs-cta-btn cyan-outline round" onClick={handleNext} disabled={saving}>
                        {saving ? 'LINKING...' : (followedIds.size > 0 ? `FOLLOW ${followedIds.size} ALLIES △` : 'SKIP FOR NOW △')}
                    </button>
                </section>
            </div>

            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}
