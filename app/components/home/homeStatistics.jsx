import styles from "~/styles/home.module.css";
import React from "react";
import LoadingSpinner from "~/components/shared/loadingSpinner.jsx";

const formatEuro = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num.toFixed(2) : '0.00';
};

const HomeStatistics = React.memo(function HomeStatistics({ statistics, loading }) {
    if (loading) {
        return <LoadingSpinner message="Caricamento statistiche..." />;
    }

    const stats = statistics || {};

    return (
        <>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    <i className="fa-solid fa-chart-line"></i> Le tue statistiche
                </h2>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>€{formatEuro(stats.totalPaid)}</div>
                    <div className={styles.statLabel}>Totale speso in caffè</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.totalCoffeesForOthers || 0}</div>
                    <div className={styles.statLabel}>Caffè pagati per amici</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.skippedCount || 0}</div>
                    <div className={styles.statLabel}>Giri saltati</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>€{formatEuro(stats.averagePayment)}</div>
                    <div className={styles.statLabel}>Media per pagamento</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>€{formatEuro(stats.mostExpensive)}</div>
                    <div className={styles.statLabel}>Pagamento più alto</div>
                </div>
                <div className={`${styles.statCard} ${styles.fullWidth} ${styles.titleCard}`}>
                    <div className={styles.titleCardHeading}>
                        Coffee Karma: <strong>{stats.coffeeKarma ?? 50}</strong>/100
                    </div>
                    <div className={styles.titleCardSubtext}>
                        Sale quando paghi il caffè e copri il turno degli amici, scende quando salti.
                    </div>
                </div>
            </div>
        </>
    );
});

export default HomeStatistics;
