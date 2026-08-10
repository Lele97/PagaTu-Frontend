import React from "react";
import styles from "~/styles/group.module.css";
import { formatPayForRemaining, formatSkipsRemaining } from "~/utils/groupHelpers";
import { fa } from "~/utils/icons";

const ACTION_ICONS = {
    'Registra Pagamento': 'cash-register',
    'Salta Pagamento': 'forward-step',
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
                                                              paidCount = 0,
                                                              pendingCount = 0,
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
        <div className={styles.actionsCard}>
            <h2 className={styles.actionsCardHeading}>
                {myTurn ? 'È il tuo turno di pagare il caffè' : 'Non è il tuo turno di pagare il caffè'}
            </h2>
            {myTurn ? (
                <p className={styles.actionsCardHint}>Puoi registrare il pagamento o saltare il turno.</p>
            ) : turnLabel ? (
                <p className={styles.actionsCardHint}>Turno attuale: <strong>{turnLabel}</strong>. Attendi il tuo turno per pagare.</p>
            ) : (
                <p className={styles.actionsCardHint}>Attendi il tuo turno per effettuare un pagamento.</p>
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
                        className={styles.actionButton}
                    >
                        <i className={fa(ACTION_ICONS[label])} />
                        {label}
                    </button>
                ))}
            </div>

            <div className={styles.roundSummaryCard}>
                <div className={styles.roundSummaryTitle}>Round attuale</div>
                <div className={styles.roundSummaryRow}>
                    <span>Pagati</span><strong>{paidCount}</strong>
                </div>
                <div className={styles.roundSummaryRow}>
                    <span>In attesa</span><strong>{pendingCount}</strong>
                </div>
            </div>
        </div>
    );
});

export default PaymentActions;