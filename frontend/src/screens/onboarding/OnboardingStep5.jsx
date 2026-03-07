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
        const fetchData = async () => {
            // Fetch suggested organizations
            const { data: orgsData, error: orgsError } = await supabase
                .from('organizations')
                .select('id, name, follower_count, logo_url')
                .eq('status', 'approved')
                .limit(10); // Show more than 4 for better onboarding

            if (!orgsError && orgsData) {
                setOrgs(orgsData);

                if (user) {
                    // Fetch existing follows
                    const { data: userFollows } = await supabase
                        .from('org_followers')
                        .select('org_id')
                        .eq('user_id', user.id);

                    if (userFollows && userFollows.length > 0) {
                        setFollowedIds(new Set(userFollows.map(f => f.org_id)));
                    } else {
                        // If no follows, pre-select suggestions to encourage following
                        setFollowedIds(new Set(orgsData.map(o => o.id)));
                    }
                }
            }
            setLoadingData(false);
        };
        fetchData();
    }, [user]);

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
            // 1. Delete existing follows for the currently displayed orgs
            const loadedOrgIds = orgs.map(o => o.id);
            if (loadedOrgIds.length > 0) {
                const { error: deleteError } = await supabase
                    .from('org_followers')
                    .delete()
                    .eq('user_id', user.id)
                    .in('org_id', loadedOrgIds);
                if (deleteError) throw deleteError;
            }

            // 2. Insert new follows
            if (followedIds.size > 0) {
                const inserts = Array.from(followedIds).map(orgId => ({
                    user_id: user.id,
                    org_id: orgId
                }));

                const { error: insertError } = await supabase
                    .from('org_followers')
                    .insert(inserts);
                if (insertError) throw insertError;
            }


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
