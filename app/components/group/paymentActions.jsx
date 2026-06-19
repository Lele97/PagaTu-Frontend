import React from "react";
import styles from "~/styles/group.module.css";
import sharedStyles from "~/styles/shared.module.css";

const PaymentActions = React.memo(function PaymentActions({
    myTurn,
    canPayFor = true,
    maxSkipPerRound,
    onRegisterPayment,
    onSkipPayment,
    onPayForFriend,
}) {
    const payForAction = {
        label: 'Paga per un amico',
        onClick: onPayForFriend,
        disabled: !canPayFor,
    };

    const actions = myTurn
        ? [
            { label: 'Registra Pagamento', onClick: onRegisterPayment, disabled: false },
            { label: 'Salta Pagamento', onClick: onSkipPayment, disabled: false },
            payForAction,
        ]
        : [
            { label: 'Registra Pagamento', onClick: onRegisterPayment, disabled: true },
            { label: 'Salta Pagamento', onClick: onSkipPayment, disabled: true },
            payForAction,
        ];

    return (
        <section className={styles.groupSection}>
            <h1>{myTurn ? 'È il tuo turno di pagare il caffè' : 'Non è il tuo turno di pagare il caffè'}</h1>
            <p>{myTurn ? 'Puoi fare queste azioni' : 'Attendi il tuo turno per effettuare un pagamento'}</p>
            {myTurn && maxSkipPerRound != null && (
                <p style={{ color: 'var(--coffee-700)', fontSize: '0.9rem' }}>
                    Limite skip per giro: {maxSkipPerRound}
                </p>
            )}
            <div className={styles.actionButtons}>
                {actions.map(({ label, onClick, disabled }, i) => (
                    <button
                        key={i}
                        onClick={onClick}
                        disabled={disabled}
                        className={`${sharedStyles.groupButton} ${styles.actionButton}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </section>
    );
});

export default PaymentActions;