import React from "react";
import styles from "~/styles/group.module.css";
import sharedStyles from "~/styles/shared.module.css";

const PaymentActions = React.memo(function PaPaymentActions({myTurn, onRegisterPayment, onSkipPayment, onPayForFriend}) {
    const actions = myTurn ? [{
        label: 'Registra Pagamento',
        onClick: onRegisterPayment,
        disabled: false
    }, {label: 'Salta Pagamento', onClick: onSkipPayment, disabled: false}, {
        label: 'Paga per un amico',
        onClick: onPayForFriend,
        disabled: false
    }] : [{label: 'Registra Pagamento', onClick: onRegisterPayment, disabled: true}, {
        label: 'Salta Pagamento',
        onClick: onSkipPayment,
        disabled: true
    }, {label: 'Paga per un amico', onClick: onPayForFriend, disabled: false}];

    return (
        <section className={styles.groupSection}>
            <h1>{myTurn ? 'È il tuo turno di pagare il caffè' : 'Non è il tuo turno di pagare il caffè'}</h1>
            <p>{myTurn ? 'Puoi fare queste azioni' : 'Attendi il tuo turno per effettuare un pagamento'}</p>
            <div className={styles.actionButtons}>
                {actions.map(({label, onClick, disabled}, i) => (<button key={i} onClick={onClick} disabled={disabled}
                                                                         className={`${sharedStyles.groupButton} ${styles.actionButton}`}>
                    {label}
                </button>))}
            </div>
        </section>)
})

export default PaymentActions