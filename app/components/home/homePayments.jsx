import styles from "~/styles/home.module.css";
import React from "react";

const formatAmount = (amount) => {
    const num = Number(amount);
    return Number.isFinite(num) ? num.toFixed(2) : amount;
};
import ErrorMessage from "~/components/shared/errorMessage.jsx";
import LoadingSpinner from "~/components/shared/loadingSpinner.jsx";
import PaginationControls from "~/components/shared/paginationControls.jsx";

const HomePayments = React.memo(function HomePayments({
    paymentsLoading,
    paymentsError,
    payments,
    currentPaymentPage,
    getTotalPaymentPages,
    setCurrentPaymentPage,
    onRetry
}) {

    if (paymentsLoading) {
        return <LoadingSpinner message="Caricamento pagamenti..." />
    }

    if (paymentsError) {

        const error =
            typeof paymentsError === "string"
                ? paymentsError
                : paymentsError?.message || JSON.stringify(paymentsError);

        return <ErrorMessage message={error} onRetry={onRetry} />

    }

    if (!payments?.length) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                    <i className="fa-solid fa-credit-card"></i>
                </div>
                <h3>Non hai effettuato ancora un pagamento</h3>
                <p>Registra i pagamenti per i gruppi di cui fai parte</p>
            </div>
        )
    }

    return (
        <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}><i className="fa-solid fa-credit-card"></i> I tuoi pagamenti</h2>
            </div>
            <div className={styles.paymentCardsContainer}>
                {payments.map((payment) => (
                    <div key={payment.id} className={styles.paymentCard}>
                        <div className={styles.paymentCardHeader}>
                            <i className="fa-solid fa-receipt" />
                            <span className={styles.paymentGroup}>{payment.groupName}</span>
                        </div>
                        <div className={styles.paymentCardBody}>
                            <div className={styles.paymentInfo}>
                                <span className={styles.paymentLabel}>Descrizione:</span>
                                <span
                                    className={styles.paymentDescription}>{payment.description}</span>
                            </div>
                            <div className={styles.paymentInfo}>
                                <span className={styles.paymentLabel}>Data:</span>
                                <span className={styles.paymentData}>{payment.paymentDate}</span>
                            </div>
                        </div>
                        <div className={styles.paymentCardFooter}>
                            <span className={styles.paymentAmount}>
                                €{formatAmount(payment.amount)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <PaginationControls currentPage={currentPaymentPage} totalPages={getTotalPaymentPages}
                onPageChange={setCurrentPaymentPage} />
        </section>
    )
})

export default HomePayments;