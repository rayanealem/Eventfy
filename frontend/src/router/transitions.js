// Framer Motion page transition variants for Eventfy

export const pageVariants = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { x: '-30%', opacity: 0, transition: { duration: 0.2 } }
};

export const modalVariants = {
    initial: { y: '100%' },
    animate: { y: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
    exit: { y: '100%', transition: { duration: 0.2 } }
};

export const slideRightVariants = {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { x: '30%', opacity: 0, transition: { duration: 0.2 } }
};

export const fadeTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const morphExpand = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } }
};

export const slideUpTransition = {
    initial: { y: 24, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { y: 24, opacity: 0, transition: { duration: 0.2 } }
};
