// Framer Motion page transition variants for Eventfy

export const instaSpring = { type: "spring", stiffness: 400, damping: 35, mass: 0.8 };

export const pageVariants = {
    initial: { x: '100%', opacity: 1 },
    animate: { x: 0, opacity: 1, transition: instaSpring },
    exit: { x: '-20%', opacity: 0.5, transition: instaSpring }
};

export const pushTransition = {
    initial: { x: '100%', opacity: 1 },
    animate: { x: 0, opacity: 1, transition: instaSpring },
    exit: { x: '-20%', opacity: 0.5, transition: instaSpring }
};

export const modalVariants = {
    initial: { y: '100%' },
    animate: { y: 0, transition: instaSpring },
    exit: { y: '100%', transition: instaSpring }
};

export const slideRightVariants = {
    initial: { x: '-100%', opacity: 1 },
    animate: { x: 0, opacity: 1, transition: instaSpring },
    exit: { x: '30%', opacity: 0.5, transition: instaSpring }
};

export const fadeTransition = {
    initial: { opacity: 0, scale: 0.99 },
    animate: { opacity: 1, scale: 1, transition: instaSpring },
    exit: { opacity: 0, scale: 0.99, transition: instaSpring }
};

export const morphExpand = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: instaSpring },
    exit: { scale: 0.9, opacity: 0, transition: instaSpring }
};

export const slideUpTransition = {
    initial: { y: 24, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: instaSpring },
    exit: { y: 24, opacity: 0, transition: instaSpring }
};
export const slideUpSheet = {
    initial: { y: '100%', opacity: 1 },
    animate: { y: 0, opacity: 1, transition: instaSpring },
    exit: { y: '100%', opacity: 1, transition: instaSpring }
};

export const tabTransition = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.1 } }
};
