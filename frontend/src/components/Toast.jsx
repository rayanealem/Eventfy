import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Toast.css';

const ToastContext = createContext(null);

const ICONS = {
    success: '✓',
    error: '✕',
    info: '○',
};

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // Fallback if used outside provider — silent no-op
        return { showToast: () => { } };
    }
    return ctx;
}

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);
    const [key, setKey] = useState(0);

    const showToast = useCallback((message, type = 'info') => {
        setKey(k => k + 1);
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                <AnimatePresence mode="wait">
                    {toast && (
                        <motion.div
                            key={key}
                            className={`toast toast-${toast.type}`}
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                        >
                            <span className="toast-icon">{ICONS[toast.type] || '○'}</span>
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
