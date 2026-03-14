// Framer Motion page transition variants for Eventfy

import { instaSpring } from '../lib/physics';

export const pageVariants = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: instaSpring },
    exit: { x: '-30%', opacity: 0, transition: instaSpring }
};

export const modalVariants = {
    initial: { y: '100%' },
    animate: { y: 0, transition: instaSpring },
    exit: { y: '100%', transition: instaSpring }
};

export const slideRightVariants = {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: instaSpring },
    exit: { x: '30%', opacity: 0, transition: instaSpring }
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
