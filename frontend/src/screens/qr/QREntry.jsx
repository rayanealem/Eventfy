import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Html5Qrcode } from 'html5-qrcode';
import './QREntry.css';

export default function QREntry() {
    const { profile } = useAuth();
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    const qrRegionRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    // Default mock event (or take from params in a real flow)
    const activeEventId = 'e2b5e28d-19cd-4a37-b6f7-bcca155e88d0'; // Fallback UUID

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const startScanner = async () => {
        setIsScanning(true);
        setScanResult(null);
        setScanError('');

        try {
            html5QrCodeRef.current = new Html5Qrcode("qr-reader");
            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    // Success callback
                    html5QrCodeRef.current.stop().catch(console.error);
                    setIsScanning(false);
                    processScan(decodedText);
                },
                (errorMessage) => {
                    // Ignored
                }
            );
        } catch (err) {
            console.error("Scanner setup failed", err);
            setScanError('Camera permission denied or not found.');
            setIsScanning(false);
        }
    };

    const processScan = async (urlStr) => {
        // Expecting format: eventfy://checkin/{event_id}/{token}
        try {
            const parts = urlStr.split('/');
            const token = parts[parts.length - 1];
            const eventId = parts[parts.length - 2] || activeEventId;

            const res = await api('POST', `/qr/${eventId}/scan`, { token });
            setScanResult({
                success: true,
                user: res.user,
                xp: res.xp_earned,
                leveledUp: res.leveled_up
            });
        } catch (e) {
            console.error("Scan API Error", e);
            setScanResult({
                success: false,
                message: e.message || 'Invalid or expired QR code'
            });
        }
    };

    return (
        <div className="qr-root">
            <div className="qr-noise" />

            {/* Decorative shapes */}
            <div className="qr-deco">
                <span className="qr-deco-shape qr-d1">○</span>
                <span className="qr-deco-shape qr-d2">◇</span>
                <span className="qr-deco-shape qr-d3">□</span>
            </div>

            <div className="qr-content">
                {/* Header */}
                <div className="qr-header">
                    <motion.h1 className="qr-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        MISSION CHECK-IN<br />○
                    </motion.h1>
                    <div className="qr-title-line" />
                </div>

                {/* Scanner */}
                <motion.div className="qr-scanner-wrap" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    <div className="qr-scanner">
                        {/* Corner brackets */}
                        <div className="qr-corner qr-tl" />
                        <div className="qr-corner qr-tr" />
                        <div className="qr-corner qr-bl" />
                        <div className="qr-corner qr-br" />

                        {/* Scanner Area */}
                        <div className="qr-reader-container" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                            <div id="qr-reader" ref={qrRegionRef} style={{ width: '100%', height: '100%' }}></div>

                            {!isScanning && !scanResult && (
                                <div className="qr-placeholder" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="40" height="40" viewBox="0 0 30 30" fill="none">
                                        <rect x="2" y="2" width="10" height="10" stroke="rgba(255,255,255,.3)" strokeWidth="2" />
                                        <rect x="18" y="2" width="10" height="10" stroke="rgba(255,255,255,.3)" strokeWidth="2" />
                                        <rect x="2" y="18" width="10" height="10" stroke="rgba(255,255,255,.3)" strokeWidth="2" />
                                        <rect x="18" y="18" width="4" height="4" fill="rgba(255,255,255,.3)" />
                                        <rect x="24" y="18" width="4" height="4" fill="rgba(255,255,255,.3)" />
                                        <rect x="18" y="24" width="4" height="4" fill="rgba(255,255,255,.3)" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Scan line visual */}
                        {isScanning && <div className="qr-scan-line" />}
                    </div>

                    <motion.div className="qr-scan-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        {isScanning ? (
                            <span className="qr-scan-text" style={{ color: '#13ecda' }}>SCANNING... ○</span>
                        ) : scanResult ? (
                            <span className="qr-scan-text" style={{ color: scanResult.success ? '#2dd4bf' : '#f44725' }}>
                                {scanResult.success ? `SUCCESS: +${scanResult.xp} XP` : `ERROR: ${scanResult.message}`}
                            </span>
                        ) : scanError ? (
                            <span className="qr-scan-text" style={{ color: '#f44725' }}>{scanError}</span>
                        ) : (
                            <span className="qr-scan-text">SCAN EVENT QR TO EARN ○</span>
                        )}
                    </motion.div>
                </motion.div>

                {/* Bottom section */}
                <div className="qr-bottom">
                    {/* Player card */}
                    <div className="qr-player-card">
                        <div className="qr-player-info">
                            <div className="qr-player-avatar">
                                <img src={profile?.avatar_url || "https://i.pravatar.cc/56?img=68"} alt="" />
                            </div>
                            <div className="qr-player-details">
                                <span className="qr-player-name">{profile?.full_name || 'GUEST USER'}</span>
                                <span className="qr-player-id">#{profile?.player_number || '0000'}</span>
                            </div>
                        </div>
                        <div className="qr-player-badge">○ {profile?.role?.toUpperCase() || 'PARTICIPANT'}</div>
                    </div>

                    {/* Open Scanner button */}
                    {!isScanning ? (
                        <button className="qr-open-btn" onClick={startScanner}>
                            <span className="qr-cam-icon">📷</span>
                            <span>OPEN SCANNER □</span>
                        </button>
                    ) : (
                        <button className="qr-open-btn" style={{ background: '#333' }} onClick={() => {
                            if (html5QrCodeRef.current?.isScanning) {
                                html5QrCodeRef.current.stop().catch(console.error);
                            }
                            setIsScanning(false);
                            setScanResult(null);
                        }}>
                            <span className="qr-cam-icon">⏹</span>
                            <span>STOP SCANNER</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
