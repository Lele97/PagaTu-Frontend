import { useEffect, useRef, useState } from 'react';

/**
 * Fade-in on scroll via IntersectionObserver (UX_LAST I1).
 */
export const useSectionReveal = (options = {}) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

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
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [options]);

    return { ref, visible };
};