import React from 'react';
import ModalWrapper from "~/components/shared/modalWrapper.jsx";
import ModalButtons from "~/components/shared/modalButtons.jsx";
import ErrorSuccessMessages from "~/components/shared/errorSuccessMessages.jsx";
import sharedStyles from '~/styles/shared.module.css';
import styles from "~/styles/group.module.css";

const AddGroupModal = React.memo(({
                                      payload,
                                      handleChangeName,
                                      handleChangeDescription,
                                      confirmCreateGroup,
                                      closeAddGroupModal,
                                      error,
                                      success,
                                      isSubmitting
                                  }) => {
    return (
        <ModalWrapper onClose={closeAddGroupModal}
                      title="Crea un gruppo">


            <form onSubmit={confirmCreateGroup}>
                <div className={styles.formGroup}>
                    <label htmlFor="nome">Nome:</label>
                    <input
                        type="text"
                        id="nome"
                        placeholder="Inserisci il nome del gruppo"
                        value={payload.name}
                        onChange={handleChangeName}
                        className={sharedStyles.formInput}
                        required
                    />

                    <label htmlFor="descrizione">Descrizione:</label>
                    <input
                        type="text"
                        id="descrizione"
                        placeholder="Inserisci la descrizione del gruppo"
                        value={payload.description}
                        onChange={handleChangeDescription}
                        className={sharedStyles.formInput}
                    />
                </div>

                <ErrorSuccessMessages error={error}
                                      successMessage={success}/>

                <ModalButtons modalHaveForm={true}
                              isSubmitting={isSubmitting}
                              submitLoadingText="Creazione del gruppo..."
                              submitText="Crea gruppo"
                              onCancel={closeAddGroupModal}/>
            </form>

        </ModalWrapper>
    );
});

AddGroupModal.displayName = 'AddGroupModal';
export default AddGroupModal;

