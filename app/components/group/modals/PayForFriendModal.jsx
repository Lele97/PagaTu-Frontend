import React from "react";
import sharedStyles from "~/styles/shared.module.css";
import ModalWrapper from "~/components/shared/modalWrapper.jsx";
import ModalButtons from "~/components/shared/modalButtons.jsx";
import ErrorSuccessMessages from "~/components/shared/errorSuccessMessages.jsx";
import styles from '~/styles/group.module.css';
import InfoBox from "~/components/shared/infoBox.jsx";

const PAY_FOR_FRIEND_INFO_ITEMS = [
    'Il tuo stato verrà marcato come "pagato" per questo turno',
    'Il pagamento verrà registrato con importo, descrizione e data corrente',
    'Verrà automaticamente selezionato il prossimo pagatore del gruppo',
    'Il pagamento apparirà nella classifica del gruppo'
];

const PayForFriendModal = React.memo(
    ({
         confirmPayForFriend,
         friend,
         importo,
         descrizione,
         error,
         successMessage,
         isSubmitting,
         closePayForFriendModal,
         handleInputChangeImporto,
         handleInputChangeDescrizione,
     }) => {


        return (
            <ModalWrapper title="Paga per un amico"
                          onClose={closePayForFriendModal}>

                <h6>
                    Stai pagando al posto di <strong>{friend || '...'}</strong>
                </h6>

                <InfoBox title="Cosa succede quando paghi per un amico:"
                         items={PAY_FOR_FRIEND_INFO_ITEMS}/>


                <form onSubmit={confirmPayForFriend}>
                    <div className={styles.formGroup}>
                        <label htmlFor="importoFriend">Importo:</label>
                        <input
                            type="number"
                            id="importoFriend"
                            value={importo}
                            onChange={handleInputChangeImporto}
                            required
                            className={sharedStyles.formInput}
                            placeholder="Inserisci importo..."
                            step="0.01"
                            min="0"
                            autoFocus
                        />

                        <label htmlFor="descrizioneFriend">Descrizione:</label>
                        <input
                            type="text"
                            id="descrizioneFriend"
                            value={descrizione}
                            onChange={handleInputChangeDescrizione}
                            required
                            className={sharedStyles.formInput}
                            placeholder="Inserisci una descrizione del pagamento..."
                        />
                    </div>

                    <ErrorSuccessMessages error={error}
                                          successMessage={successMessage}/>

                    <ModalButtons modalHaveForm={true}
                                  isSubmitting={isSubmitting}
                                  submitLoadingText="Registrazione in corso..."
                                  submitText="Registra Pagamento"
                                  onCancel={closePayForFriendModal}/>


                </form>


            </ModalWrapper>

        );
    });

export default PayForFriendModal;