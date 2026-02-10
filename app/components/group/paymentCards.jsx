import React from "react";
import styles from "~/styles/group.module.css";
import LoadingSpinner from "~/components/shared/loadingSpinner.jsx";
import ErrorMessage from "~/components/shared/errorMessage.jsx";

const PaymentCards = React.memo(function PaymentCards({
                                                          loading,
                                                          error,
                                                          payments,
                                                          onRetry,
                                                      }) {
    if (loading) return <LoadingSpinner message="Caricamento pagamenti..." />;

    if (error) {
        const msg =
            typeof error === "string"
                ? error
                : error?.message || JSON.stringify(error);

        return <ErrorMessage message={msg} onRetry={onRetry} />;
    }

    if (!payments?.length) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                    <i className="fa-solid fa-ranking-star" />
                </div>
                <h3>Non sono stati ancora registrati pagamenti per questo gruppo</h3>
                <p>Registra i pagamenti per i gruppi di cui fai parte</p>
            </div>
        );
    }

    return (
        <div className={styles.paymentCardsContainer}>
            {payments.map((payment, index) => (
                <div key={index} className={styles.paymentCard}>
                    <div className={styles.paymentCardHeader}>
                        <i className="bi bi-ticket-perforated-fill" />
                        <span className={styles.paymentLabel}>Utente</span>
                        <span className={styles.paymentData}>{payment.username}</span>
                    </div>

                    <div className={styles.paymentCardBody}>
                        <div className={styles.paymentInfo}>
                            <span className={styles.paymentLabel}>Totale pagamenti</span>
                            <span className={styles.paymentDescription}>
                {payment.totalPayments}
              </span>
                        </div>
                    </div>

                    <div className={styles.paymentCardFooter}>
                        <span className={styles.paymentLabel}>Totale speso</span>
                        <span className={styles.paymentAmount}>€{payment.totalAmount}</span>
                    </div>
                </div>
            ))}
        </div>
    );
});

export default PaymentCards;