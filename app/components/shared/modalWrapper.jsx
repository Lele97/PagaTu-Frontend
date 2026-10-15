import React, { useEffect } from 'react';
import sharedStyles from '~/styles/shared.module.css';

const ModalWrapper = React.memo(({ children, onClose, title, wide = false }) => {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            className={sharedStyles.modalOverlay}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="presentation"
        >
            <div
                className={`${sharedStyles.modalContent} ${wide ? sharedStyles.modalContentWide : ''}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title || 'Modale'}
            >
                {title && <h2>{title}</h2>}
                {children}
            </div>
        </div>
    );
});

ModalWrapper.displayName = 'ModalWrapper';
export default ModalWrapper;