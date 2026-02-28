import { motion } from 'framer-motion';
import './QREntry.css';

export default function QREntry() {
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

                        {/* QR placeholder */}
                        <div className="qr-placeholder">
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                                <rect x="2" y="2" width="10" height="10" stroke="rgba(255,255,255,.3)" strokeWidth="2" />
                                <rect x="18" y="2" width="10" height="10" stroke="rgba(255,255,255,.3)" strokeWidth="2" />
                                <rect x="2" y="18" width="10" height="10" stroke="rgba(255,255,255,.3)" strokeWidth="2" />
                                <rect x="18" y="18" width="4" height="4" fill="rgba(255,255,255,.3)" />
                                <rect x="24" y="18" width="4" height="4" fill="rgba(255,255,255,.3)" />
                                <rect x="18" y="24" width="4" height="4" fill="rgba(255,255,255,.3)" />
                            </svg>
                        </div>

                        {/* Scan line */}
                        <div className="qr-scan-line" />
                    </div>

                    <motion.div className="qr-scan-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        <span className="qr-scan-text">SCAN EVENT QR TO EARN ○</span>
                    </motion.div>
                </motion.div>

                {/* Bottom section */}
                <div className="qr-bottom">
                    {/* Player card */}
                    <div className="qr-player-card">
                        <div className="qr-player-info">
                            <div className="qr-player-avatar">
                                <img src="https://i.pravatar.cc/56?img=68" alt="" />
                            </div>
                            <div className="qr-player-details">
                                <span className="qr-player-name">AHMED BENALI</span>
                                <span className="qr-player-id">#4821</span>
                            </div>
                        </div>
                        <div className="qr-player-badge">○ PARTICIPANT</div>
                    </div>

                    {/* Open Scanner button */}
                    <button className="qr-open-btn">
                        <span className="qr-cam-icon">📷</span>
                        <span>OPEN SCANNER □</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
