import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import './OnboardingSteps.css';

export default function OnboardingStep3() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [skills, setSkills] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            const { data, error } = await supabase
                .from('skills')
                .select('id, name, category')
                .limit(20);

            if (!error && data) {
                setSkills(data);
            }
            setLoadingData(false);
        };
        fetchSkills();
    }, []);

    const toggleSkill = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleNext = async () => {
        if (!user || selectedIds.size === 0) {
            navigate('/onboarding/4');
            return;
        }

        setSaving(true);
        try {
            const inserts = Array.from(selectedIds).map(skillId => ({
                user_id: user.id,
                skill_id: skillId,
                verified: false
            }));

            // Upsert user skills
            const { error } = await supabase
                .from('user_skills')
                .upsert(inserts, { onConflict: 'user_id,skill_id' });

            if (error) throw error;
            navigate('/onboarding/4');
        } catch (err) {
            console.error('Error saving skills:', err);
            navigate('/onboarding/4');
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
                    <span className="obs-h-shape active">□</span>
                    <span className="obs-h-shape">◇</span>
                </div>
            </header>

            <div className="obs-progress-wrap">
                <div className="obs-progress-bar">
                    <div className="obs-progress-fill" style={{ width: '50%' }} />
                </div>
                <span className="obs-progress-label">STEP 3 OF 6</span>
            </div>

            <div className="obs-main single-step">
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 3: WHAT ARE YOU<br />MADE OF? △</h2>

                    {loadingData ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading skill matrix...</div>
                    ) : (
                        <div className="obs-skills-cloud">
                            {skills.map((s) => {
                                const isActive = selectedIds.has(s.id);
                                return (
                                    <button
                                        key={s.id}
                                        className={`obs-pill ${isActive ? 'active' : ''}`}
                                        onClick={() => toggleSkill(s.id)}
                                    >
                                        {s.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <button className="obs-cta-btn outline round" onClick={handleNext} disabled={saving}>
                        {saving ? 'SAVING...' : 'CONTINUE □'}
                    </button>
                </section>
            </div>

            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}
