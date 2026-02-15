import React from 'react';
import ModalWrapper from "~/components/shared/modalWrapper.jsx";
import ModalButtons from "~/components/shared/modalButtons.jsx";
import ErrorSuccessMessages from "~/components/shared/errorSuccessMessages.jsx";
import styles from '~/styles/group.module.css';

const DeleteGroupModal = React.memo(({
                                         groupName,
                                         closeDeleteModal,
                                         confirmDeleteGroup,
                                         isDeleting,
                                         error,
                                         successMessage
                                     }) => {

    return (
        <ModalWrapper
            title="Elimina il gruppo"
            onClose={closeDeleteModal}
        >

            <p>
                Sei sicuro di voler eliminare il gruppo{' '}
                <strong className={styles.groupName}>{groupName}</strong>?
            </p>

            <p style={{color: '#dc3545', fontSize: '0.9em', marginTop: '1rem'}}>
                Questa azione non può essere annullata. Tutti i dati del gruppo verranno persi definitivamente.
            </p>

            <ErrorSuccessMessages
                error={error}
                successMessage={successMessage}/>


            <ModalButtons onCancel={closeDeleteModal}
                          isSubmitting={isDeleting}
                          submitText="Elimina Gruppo"
                          submitLoadingText="Eliminazione Gruppo"
                          modalHaveForm={false}
                          onClick={confirmDeleteGroup}
                          isDelete={true}
            />

        </ModalWrapper>
    );
});

export default DeleteGroupModal;