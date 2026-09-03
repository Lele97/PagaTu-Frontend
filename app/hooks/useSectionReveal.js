import { useEffect, useRef, useState } from 'react';

const DEFAULT_OPTIONS = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

/**
 * Fade-in on scroll via IntersectionObserver (UX_LAST I1).
 * Observer is created once: a fresh `options` object every render
 * used to reconnect it on every parent update.
 */
export const useSectionReveal = (options) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { ...DEFAULT_OPTIONS, ...optionsRef.current }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
};