import React from "react";
import styles from "~/styles/group.module.css";
import sharedStyles from "~/styles/shared.module.css";
import { formatPayForRemaining, formatSkipsRemaining } from "~/utils/groupHelpers";
import { fa } from "~/utils/icons";

const ACTION_ICONS = {
    'Registra Pagamento': 'coins',
    'Salta Pagamento': 'forward',
    'Paga per un amico': 'user-plus',
};

const PaymentActions = React.memo(function PaymentActions({
                                                              myTurn,
                                                              canPayFor = true,
                                                              maxSkipPerMonth = 4,
                                                              maxPayForPerMonth = 4,
                                                              myMembership,
                                                              currentTurnUsername,
                                                              currentTurnDisplayName,
                                                              onRegisterPayment,
                                                              onSkipPayment,
                                                              onPayForFriend,
                                                          }) {
    const payForRemaining = myMembership?.monthlyPayForRemaining;
    const payForDisabled = !canPayFor || payForRemaining === 0;

    const payForAction = {
        label: 'Paga per un amico',
        onClick: onPayForFriend,
        disabled: payForDisabled,
    };

    const actions = myTurn
        ? [
            {label: 'Registra Pagamento', onClick: onRegisterPayment, disabled: false},
            {label: 'Salta Pagamento', onClick: onSkipPayment, disabled: myMembership?.monthlySkipsRemaining === 0},
            payForAction,
        ]
        : [
            {label: 'Registra Pagamento', onClick: onRegisterPayment, disabled: true},
            {label: 'Salta Pagamento', onClick: onSkipPayment, disabled: true},
            payForAction,
        ];

    const turnLabel = currentTurnDisplayName || currentTurnUsername;

    return (
        <section className={styles.groupSection}>
            <h2 className={styles.turnHeading}>
                {myTurn ? 'È il tuo turno di pagare il caffè' : 'Non è il tuo turno di pagare il caffè'}
            </h2>
            {myTurn ? (
                <p>Puoi registrare il pagamento o saltare il turno.</p>
            ) : turnLabel ? (
                <p>Turno attuale: <strong>{turnLabel}</strong>. Attendi il tuo turno per pagare.</p>
            ) : (
                <p>Attendi il tuo turno per effettuare un pagamento.</p>
            )}
            <p className={styles.turnHint}>
                {formatSkipsRemaining(myMembership, maxSkipPerMonth)}
            </p>
            {canPayFor && (
                <p className={styles.turnHint}>
                    {formatPayForRemaining(myMembership, maxPayForPerMonth)}
                </p>
            )}
            <div className={styles.actionButtons}>
                {actions.map(({label, onClick, disabled}, i) => (
                    <button
                        key={i}
                        onClick={onClick}
                        disabled={disabled}
                        className={`${sharedStyles.groupButton} ${styles.actionButton}`}
                    >
                        <i className={fa(ACTION_ICONS[label])} />
                        {label}
                    </button>
                ))}
            </div>
        </section>
    );
});

export default PaymentActions;