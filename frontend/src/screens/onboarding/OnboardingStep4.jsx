import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './OnboardingSteps.css';

const WILAYAS = [
    '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna',
    '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
    '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou',
    '16 - Algiers', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
    '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine',
    '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
    '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès',
    '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
    '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma',
    '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - Timimoun', '50 - Bordj Badji Mokhtar',
    '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah', '54 - In Guezzam', '55 - Touggourt',
    '56 - Djanet', '57 - El M\'Ghair', '58 - El Meniaa'
];

export default function OnboardingStep4() {
    const navigate = useNavigate();
    const { user, profile, refreshProfile } = useAuth();

    // Default to Algiers (16) if nothing is picked
    const [wilaya, setWilaya] = useState(profile?.wilaya || '16 - Algiers');
    const [university, setUniversity] = useState(profile?.university || 'USTHB');
    const [radius, setRadius] = useState('25KM');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            if (profile.wilaya) setWilaya(profile.wilaya);
            if (profile.university) setUniversity(profile.university);
        }
    }, [profile]);

    const handleNext = async () => {
        if (!user) {
            navigate('/onboarding/5');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ wilaya, university })
                .eq('id', user.id);

            if (error) throw error;
            await refreshProfile();
            navigate('/onboarding/5');
        } catch (err) {
            console.error('Error updating profile loc:', err);
            navigate('/onboarding/5');
        } finally {
            setLoading(false);
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
                    <div className="obs-progress-fill" style={{ width: '66%' }} />
                </div>
                <span className="obs-progress-label">STEP 4 OF 6</span>
            </div>

            <div className="obs-main single-step">
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 4: WHERE DO YOU<br />PLAY? □</h2>

                    <div className="obs-field">
                        <span className="obs-field-label">Region Select</span>
                        <div className="obs-input-wrap">
                            <select
                                className="obs-text-input"
                                style={{ width: '100%', appearance: 'auto', background: 'rgba(255, 255, 255, 0.05)', color: '#fff' }}
                                value={wilaya}
                                onChange={(e) => setWilaya(e.target.value)}
                            >
                                <option value="" disabled>Select Wilaya</option>
                                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="obs-field">
                        <span className="obs-field-label">Base of Operations (University/Work)</span>
                        <div className="obs-input-wrap">
                            <input
                                className="obs-text-input"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                placeholder="e.g. USTHB University"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div className="obs-field">
                        <span className="obs-field-label">Radar Radius</span>
                        <div className="obs-radar">
                            <motion.button whileTap={{ scale: 0.85 }} className={`obs-radar-btn ${radius === '10KM' ? 'active' : ''}`} onClick={() => setRadius('10KM')}>10KM</motion.button>
                            <motion.button whileTap={{ scale: 0.85 }} className={`obs-radar-btn ${radius === '25KM' ? 'active' : ''}`} onClick={() => setRadius('25KM')}>25KM</motion.button>
                            <motion.button whileTap={{ scale: 0.85 }} className={`obs-radar-btn ${radius === '50KM' ? 'active' : ''}`} onClick={() => setRadius('50KM')}>50KM</motion.button>
                        </div>
                    </div>

                    <button className="obs-cta-btn gold round" onClick={handleNext} disabled={loading}>
                        {loading ? 'SAVING...' : 'CONTINUE ◇'}
                    </button>
                </section>
            </div>

            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}
