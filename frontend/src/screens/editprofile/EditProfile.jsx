import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import './EditProfile.css';

const SHAPES = ['○', '△', '□', '◇'];
const COLORS = ['#13ecec', '#ff4d4d', '#ffcc00', '#fff', '#f4257b'];

export default function EditProfile() {
    const navigate = useNavigate();
    const { profile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form state — loaded from profile
    const [form, setForm] = useState({
        full_name: '',
        username: '',
        bio: '',
        wilaya: '',
        university: '',
        shape: '△',
        shape_color: '#13ecec',
    });
    const [skillsLoaded, setSkillsLoaded] = useState([]);
    const [activeSkills, setActiveSkills] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Load profile data into form
    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile.full_name || '',
                username: profile.username || '',
                bio: profile.bio || '',
                wilaya: profile.wilaya || '',
                university: profile.university || '',
                shape: profile.shape || '△',
                shape_color: profile.shape_color || '#13ecec',
            });
        }

        const fetchSkillsData = async () => {
            if (!profile) return;
            // Fetch available skills
            const { data: allSkills } = await supabase
                .from('skills')
                .select('id, name');
            if (allSkills) setSkillsLoaded(allSkills);

            // Fetch user's skills
            const { data: userSkills } = await supabase
                .from('user_skills')
                .select('skill_id')
                .eq('user_id', profile.id);
            if (userSkills) {
                setActiveSkills(userSkills.map(us => us.skill_id));
            }
            setLoadingData(false);
        };
        fetchSkillsData();

    }, [profile]);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await api('PATCH', '/auth/me', {
                full_name: form.full_name,
                username: form.username,
                bio: form.bio,
                wilaya: form.wilaya || null,
                university: form.university || null,
                shape: form.shape,
                shape_color: form.shape_color,
            });

            // Update user_skills via Supabase client directly
            if (profile) {
                const loadedSkillIds = skillsLoaded.map(s => s.id);
                if (loadedSkillIds.length > 0) {
                    await supabase
                        .from('user_skills')
                        .delete()
                        .eq('user_id', profile.id)
                        .in('skill_id', loadedSkillIds);
                }

                if (activeSkills.length > 0) {
                    const inserts = activeSkills.map(skillId => ({
                        user_id: profile.id,
                        skill_id: skillId,
                        verified: false
                    }));
                    await supabase
                        .from('user_skills')
                        .insert(inserts);
                }
            }

            await refreshProfile();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save profile:', err);
            alert('Failed to save: ' + (err.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const toggleSkill = (label) => {
        setActiveSkills(prev =>
            prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
        );
    };

    return (
        <div className="edp-root">
            {/* Header */}
            <header className="edp-header">
                <span className="edp-back" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>‹</span>
                <h1 className="edp-title">EDIT PROFILE ◇</h1>
                <span className="edp-save" onClick={handleSave} style={{ cursor: 'pointer', color: saving ? '#64748b' : saved ? '#2dd4bf' : undefined }}>
                    {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE'}
                </span>
            </header>

            <div className="edp-main">
                {/* Avatar Section */}
                <section className="edp-avatar-section">
                    <div className="edp-hex-avatar">
                        <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${form.username}`} alt="avatar" />
                        <div className="edp-avatar-overlay">
                            <span className="edp-cam-icon">📷</span>
                        </div>
                    </div>
                    <div className="edp-badge">#{String(profile?.id || '').slice(-4) || '0000'}</div>
                </section>

                {/* Name */}
                <section className="edp-field-group">
                    <label className="edp-label">DISPLAY NAME</label>
                    <input
                        className="edp-input"
                        value={form.full_name}
                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    />
                </section>

                {/* Username */}
                <section className="edp-field-group">
                    <label className="edp-label">USERNAME</label>
                    <div className="edp-input-wrap">
                        <input
                            className="edp-input"
                            value={form.username ? `@${form.username}` : '@'}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value.replace('@', '') }))}
                        />
                    </div>
                </section>

                {/* Bio */}
                <section className="edp-field-group">
                    <label className="edp-label">BIO</label>
                    <textarea
                        className="edp-textarea"
                        rows={3}
                        value={form.bio}
                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    />
                </section>

                {/* Location */}
                <section className="edp-field-group">
                    <label className="edp-label">LOCATION (Wilaya)</label>
                    <input
                        className="edp-input"
                        value={form.wilaya}
                        onChange={e => setForm(f => ({ ...f, wilaya: e.target.value }))}
                        placeholder="e.g. 16"
                    />
                </section>

                {/* Institution */}
                <section className="edp-field-group">
                    <label className="edp-label">INSTITUTION</label>
                    <input
                        className="edp-input"
                        value={form.university}
                        onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                        placeholder="e.g. USTHB University"
                    />
                </section>

                {/* Skills */}
                <section className="edp-field-group">
                    <label className="edp-label">SKILLS & ATTRIBUTES △</label>
                    {loadingData ? (
                        <div style={{ color: '#64748b' }}>Loading skills...</div>
                    ) : (
                        <div className="edp-skills">
                            {skillsLoaded.map((s) => (
                                <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    key={s.id}
                                    className={`edp-skill ${activeSkills.includes(s.id) ? 'active' : ''}`}
                                    onClick={() => toggleSkill(s.id)}
                                >
                                    {s.name}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Symbol Picker */}
                <section className="edp-field-group">
                    <label className="edp-label">YOUR SYMBOL</label>
                    <div className="edp-symbols">
                        {SHAPES.map((shape) => (
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                key={shape}
                                className={`edp-sym-btn ${form.shape === shape ? 'active' : ''}`}
                                onClick={() => setForm(f => ({ ...f, shape }))}
                            >
                                {shape}
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Color Picker */}
                <section className="edp-field-group">
                    <label className="edp-label">ACCENT COLOR</label>
                    <div className="edp-colors">
                        {COLORS.map((color) => (
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                key={color}
                                className={`edp-color ${form.shape_color === color ? 'active' : ''}`}
                                style={{ background: color }}
                                onClick={() => setForm(f => ({ ...f, shape_color: color }))}
                            />
                        ))}
                    </div>
                </section>

                {/* Save Button */}
                <motion.button whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} className="edp-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE CHANGES △'}
                </motion.button>
            </div>
        </div>
    );
}
