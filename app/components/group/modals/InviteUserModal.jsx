import React from 'react';
import ModalWrapper from "~/components/shared/modalWrapper.jsx";
import ModalButtons from "~/components/shared/modalButtons.jsx";
import ErrorSuccessMessages from "~/components/shared/errorSuccessMessages.jsx";
import styles from '~/styles/group.module.css';
import sharedStyles from '~/styles/shared.module.css';

const InviteUserModal = React.memo(
    ({
         closeInviteForm,
         submitInvite,
         userInvitation,
         error,
         successMessage,
         isSubmitting,
         handleInputChangeInvitation,
     }) => {

        return (
            <ModalWrapper
                title="Invita un amico nel gruppo"
                onClose={closeInviteForm}>


                <form onSubmit={submitInvite}>
                    <div className={styles.formGroup}>
                        <label htmlFor="user">Utente da invitare nel gruppo:</label>
                        <input
                            type="text"
                            id="user"
                            value={userInvitation}
                            onChange={handleInputChangeInvitation}
                            required
                            className={sharedStyles.formInput}
                            placeholder="Inserisci username..."
                            autoFocus
                        />
                    </div>

                    <ErrorSuccessMessages error={error}
                                          successMessage={successMessage}/>

                    <ModalButtons isSubmitting={isSubmitting}
                                  submitText="Invita"
                                  submitLoadingText="Invito in corso..."
                                  modalHaveForm={true}
                                  onCancel={closeInviteForm}

                    />

                </form>

            </ModalWrapper>
        );
    });

export default InviteUserModal;