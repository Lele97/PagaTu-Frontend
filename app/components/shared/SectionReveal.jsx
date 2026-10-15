import React, { memo } from 'react';
import { useSectionReveal } from '~/hooks/useSectionReveal';
import sharedStyles from '~/styles/shared.module.css';

const SectionReveal = memo(function SectionReveal({ children, className = '', as: Tag = 'section' }) {
    const { ref, visible } = useSectionReveal();

    return (
        <Tag
            ref={ref}
            className={`${sharedStyles.sectionReveal} ${visible ? sharedStyles.sectionRevealVisible : ''} ${className}`.trim()}
        >
            {children}
        </Tag>
    );
});

export default SectionReveal;