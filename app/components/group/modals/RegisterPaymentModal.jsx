import React from 'react';
import ModalWrapper from "~/components/shared/modalWrapper.jsx";
import InfoBox from "~/components/shared/infoBox.jsx";
import ModalButtons from "~/components/shared/modalButtons.jsx";
import ErrorSuccessMessages from "~/components/shared/errorSuccessMessages.jsx";
import styles from '~/styles/group.module.css';
import sharedStyles from '~/styles/shared.module.css';

const PAYMENT_INFO_ITEMS = [
    'Il tuo stato verrà marcato come "pagato" per questo turno',
    'Il pagamento verrà registrato con importo, descrizione e data corrente',
    'Verrà automaticamente selezionato il prossimo pagatore del gruppo',
    'Il pagamento apparirà nella classifica del gruppo'
];

const RegisterPaymentModal = React.memo(({
                                             submitPayment,
                                             importo,
                                             descrizione,
                                             error,
                                             successMessage,
                                             isSubmitting,
                                             closeRegisterPaymentModal,
                                             handleInputChangeImporto,
                                             handleInputChangeDescrizione,
                                         }) => {
    return (
        <ModalWrapper
            onClose={closeRegisterPaymentModal}
            title="Registra il pagamento"
        >
            <InfoBox
                title="Cosa succede quando registri un pagamento:"
                items={PAYMENT_INFO_ITEMS}
            />

            <form onSubmit={submitPayment}>
                <div className={styles.formGroup}>
                    <label htmlFor="importo">Importo:</label>
                    <input
                        type="number"
                        id="importo"
                        value={importo}
                        onChange={handleInputChangeImporto}
                        required
                        className={sharedStyles.formInput}
                        placeholder="Inserisci importo..."
                        step="0.01"
                        min="0"
                        autoFocus
                    />

                    <label htmlFor="descrizione">Descrizione:</label>
                    <input
                        type="text"
                        id="descrizione"
                        value={descrizione}
                        onChange={handleInputChangeDescrizione}
                        required
                        className={sharedStyles.formInput}
                        placeholder="Inserisci una descrizione del pagamento..."
                    />
                </div>

                <ErrorSuccessMessages
                    error={error}
                    successMessage={successMessage}
                />

                <ModalButtons
                    onCancel={closeRegisterPaymentModal}
                    isSubmitting={isSubmitting}
                    submitText="Registra Pagamento"
                    submitLoadingText="Registrazione in corso..."
                    modalHaveForm={true}
                />
            </form>
        </ModalWrapper>
    );
});

RegisterPaymentModal.displayName = 'RegisterPaymentModal';
export default RegisterPaymentModal;