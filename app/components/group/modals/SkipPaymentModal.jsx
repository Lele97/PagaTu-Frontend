import React from "react";
import sharedStyles from "~/styles/shared.module.css";
import styles from "~/styles/group.module.css";

const SkipPaymentModal = React.memo(
    ({closeSaltaPaymentForm, confirmSkipPayment, isSkipping, error, successMessage}) => {
        const errorText = normalizeError(error);

        return (
            <div
                className={sharedStyles.modalOverlay}
                onClick={(e) => {
                    if (e.target === e.currentTarget) closeSaltaPaymentForm();
                }}
            >
                <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h2>Salta Pagamento</h2>
                    <p>Vuoi saltare il tuo turno di pagamento per questo gruppo?</p>

                    <div
                        style={{
                            backgroundColor: 'var(--coffee-50)',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            margin: '1rem 0',
                            borderLeft: '3px solid var(--coffee-600)',
                        }}
                    >
                        <p style={{margin: '0 0 0.5rem 0', fontWeight: '500'}}>Cosa succede quando salti:</p>
                        <ul style={{margin: '0', paddingLeft: '1.5rem'}}>
                            <li>Il tuo stato verrà marcato come "saltato" per questo turno</li>
                            <li>Verrai automaticamente reinserito nella prossima rotazione</li>
                            <li>Un altro membro del gruppo verrà selezionato casualmente per il prossimo pagamento</li>
                        </ul>
                    </div>

                    <p style={{color: 'var(--coffee-700)', fontSize: '0.9em', fontStyle: 'italic'}}>
                        Nota: Puoi saltare solo quando è il tuo turno di pagare.
                    </p>

                    {errorText && <div className={sharedStyles.errorMessageModal}>{errorText}</div>}
                    {successMessage && <div className={sharedStyles.successMessage}>{successMessage}</div>}

                    <div className={styles.formButtons} style={{marginTop: '2rem'}}>
                        <button
                            type="button"
                            onClick={closeSaltaPaymentForm}
                            className={`${sharedStyles.groupButton} ${styles.cancelButton}`}
                            disabled={isSkipping}
                        >
                            Annulla
                        </button>
                        <button
                            type="button"
                            onClick={confirmSkipPayment}
                            className={`${sharedStyles.groupButton} ${styles.deleteButton}`}
                            disabled={isSkipping}
                        >
                            {isSkipping ? 'Salto del pagamento in corso...' : 'Salta pagamento'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
);