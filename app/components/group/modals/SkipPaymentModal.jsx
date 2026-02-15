import React from "react";
import ModalWrapper from "~/components/shared/modalWrapper.jsx";
import InfoBox from "~/components/shared/infoBox.jsx";
import ErrorSuccessMessages from "~/components/shared/errorSuccessMessages.jsx";
import ModalButtons from "~/components/shared/modalButtons.jsx";

const SKIP_PAYMENT_INFO_ITEMS = [
    'Il tuo stato verrà marcato come "saltato" per questo turno',
    'Verrai automaticamente reinserito nella prossima rotazione',
    'Un altro membro del gruppo verrà selezionato casualmente per il prossimo pagamento',
];

const SkipPaymentModal = React.memo(
    ({
         closeSaltaPaymentForm,
         confirmSkipPayment,
         isSkipping,
         error,
         successMessage
     }) => {

        return (
            <ModalWrapper title="Salta Pagamento"
                          onClose={closeSaltaPaymentForm}>


                <InfoBox
                    title="Cosa succede quando salti un pagamento:"
                    items={SKIP_PAYMENT_INFO_ITEMS}
                />

                <p style={{color: 'var(--coffee-700)', fontSize: '0.9em', fontStyle: 'italic'}}>
                    Nota: Puoi saltare solo quando è il tuo turno di pagare.
                </p>

                <ErrorSuccessMessages error={error}
                                      successMessage={successMessage} />


                <ModalButtons modalHaveForm={false}
                              onCancel={closeSaltaPaymentForm}
                              submitText="Salta pagamento"
                              submitLoadingText="Salto del pagamento in corso..."
                              isSubmitting={isSkipping}
                              onClick={confirmSkipPayment}/>

            </ModalWrapper>

        );
    }
);

export default SkipPaymentModal;