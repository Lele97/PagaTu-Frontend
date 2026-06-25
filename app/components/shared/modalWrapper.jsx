import React from 'react';
import sharedStyles from '~/styles/shared.module.css';

const ModalWrapper = React.memo(({ children, onClose, title, wide = false }) => {
    return (
        <div
            className={sharedStyles.modalOverlay}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={`${sharedStyles.modalContent} ${wide ? sharedStyles.modalContentWide : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && <h2>{title}</h2>}
                {children}
            </div>
        </div>
    );
});

ModalWrapper.displayName = 'ModalWrapper';
export default ModalWrapper;