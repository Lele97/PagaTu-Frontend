import React from 'react';
import ModalWrapper from "~/components/shared/modalWrapper.jsx";
import ModalButtons from "~/components/shared/modalButtons.jsx";
import ErrorSuccessMessages from "~/components/shared/errorSuccessMessages.jsx";
import styles from '~/styles/group.module.css';
import sharedStyles from '~/styles/shared.module.css';

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
                      title="">


            <form onSubmit={confirmCreateGroup}>
                <input
                    type="text"
                    placeholder="Nome gruppo"
                    value={payload.name}
                    onChange={handleChangeName}
                    className={sharedStyles.input}
                    required
                />
                <textarea
                    placeholder="Descrizione (opzionale)"
                    value={payload.description}
                    onChange={handleChangeDescription}
                    className={sharedStyles.textarea}
                    rows="3"
                />

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

