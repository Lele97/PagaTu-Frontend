import { useEffect } from 'react';
import styles from '~/styles/settings.module.css';

const Drawer = ({ open, onClose, title, children, side = 'right' }) => {
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose} role="presentation">
            <aside
                className={`${styles.drawer} ${side === 'left' ? styles.drawerLeft : ''}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <header className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>{title}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Chiudi">
                        <i className="fa-solid fa-xmark" />
                    </button>
                </header>
                <div className={styles.drawerBody}>{children}</div>
            </aside>
        </div>
    );
};

export default Drawer;