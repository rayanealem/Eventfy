import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import './EditProfile.css';

const AVAILABLE_SKILLS = [
    'Python', 'React', 'Design', 'Cybersec', 'Marketing',
    'Gaming', 'AI/ML', 'Blockchain', 'Node.js', 'Data Science',
];

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
    const [activeSkills, setActiveSkills] = useState([]);

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
                    <div className="edp-skills">
                        {AVAILABLE_SKILLS.map((s, i) => (
                            <button
                                key={i}
                                className={`edp-skill ${activeSkills.includes(s) ? 'active' : ''}`}
                                onClick={() => toggleSkill(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Symbol Picker */}
                <section className="edp-field-group">
                    <label className="edp-label">YOUR SYMBOL</label>
                    <div className="edp-symbols">
                        {SHAPES.map((shape) => (
                            <button
                                key={shape}
                                className={`edp-sym-btn ${form.shape === shape ? 'active' : ''}`}
                                onClick={() => setForm(f => ({ ...f, shape }))}
                            >
                                {shape}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Color Picker */}
                <section className="edp-field-group">
                    <label className="edp-label">ACCENT COLOR</label>
                    <div className="edp-colors">
                        {COLORS.map((color) => (
                            <div
                                key={color}
                                className={`edp-color ${form.shape_color === color ? 'active' : ''}`}
                                style={{ background: color }}
                                onClick={() => setForm(f => ({ ...f, shape_color: color }))}
                            />
                        ))}
                    </div>
                </section>

                {/* Save Button */}
                <button className="edp-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE CHANGES △'}
                </button>
            </div>
        </div>
    );
}
