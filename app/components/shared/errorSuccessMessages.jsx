import React from 'react';
import styles from '~/styles/group.module.css';
import sharedStyles from '~/styles/shared.module.css';

const normalizeError = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (typeof err === 'number') return String(err);
    if (err?.message && typeof err.message === 'string') return err.message;
    try {
        return JSON.stringify(err);
    } catch {
        return 'Errore sconosciuto';
    }
};

const ErrorSuccessMessages = React.memo(({error, successMessage}) => {
    const errorText = React.useMemo(() => normalizeError(error), [error]);

    if (!errorText && !successMessage) return null;

    return (
        <>
            {errorText && (
                <div className={sharedStyles.errorMessageModal}>
                    {errorText}
                </div>
            )}
            {successMessage && (
                <div className={sharedStyles.successMessage}>
                    {successMessage}
                </div>
            )}
        </>
    );
});

export default ErrorSuccessMessages