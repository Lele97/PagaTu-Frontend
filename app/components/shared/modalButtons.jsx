import React from 'react';
import styles from '~/styles/group.module.css';
import sharedStyles from '~/styles/shared.module.css';

const ModalButtons = React.memo(({
                                     modalHaveForm,
                                     onClick,
                                     onCancel,
                                     isSubmitting,
                                     cancelText = 'Annulla',
                                     submitText = 'Conferma',
                                     submitLoadingText = 'Caricamento...',
                                     isDelete = false
                                 }) => {
    return (
        <div className={styles.formButtons}>
            <button
                type="button"
                onClick={onCancel}
                className={`${sharedStyles.groupButton} ${styles.cancelButton}`}
                disabled={isSubmitting}
            >
                {cancelText}
            </button>

            {modalHaveForm ? <button
                type="submit"
                className={`${sharedStyles.groupButton} ${isDelete ? styles.deleteButton : styles.submitButton}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? submitLoadingText : submitText}
            </button> : <button
                type="button"
                onClick={onClick}
                className={`${sharedStyles.groupButton} ${isDelete ? styles.deleteButton : styles.submitButton}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? submitLoadingText : submitText}
            </button>}


        </div>
    );
});

ModalButtons.displayName = 'ModalButtons';
export default ModalButtons;