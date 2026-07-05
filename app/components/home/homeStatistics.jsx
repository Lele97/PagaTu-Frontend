import styles from "~/styles/home.module.css";
import React from "react";
import LoadingSpinner from "~/components/shared/loadingSpinner.jsx";

const HomeStatistics = React.memo(function HomeStatistics({ statistics, loading }) {
    if (loading) {
        return <LoadingSpinner message="Caricamento statistiche..." />;
    }

    const stats = statistics || {
        totalPaid: 0,
        totalCoffeesForOthers: 0,
        timesKing: 0,
        currentStreak: 0,
        longestStreak: 0,
        skippedCount: 0,
        coffeeKarma: 50,
        funTitle: "Coffee Newbie",
        monthlySavedForFriends: 0,
        averagePayment: 0,
        mostExpensive: 0,
    };

    return (
        <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    <i className="bi bi-graph-up"></i> Le tue statistiche
                </h2>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>€{stats.totalPaid?.toFixed(2) || '0.00'}</div>
                    <div className={styles.statLabel}>Totale speso in caffè</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.totalCoffeesForOthers || 0}</div>
                    <div className={styles.statLabel}>Caffè pagati per amici</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.timesKing || 0}</div>
                    <div className={styles.statLabel}>Volte Re del Caffè 👑</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.currentStreak || 0}</div>
                    <div className={styles.statLabel}>Streak attuale 🔥</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.longestStreak || 0}</div>
                    <div className={styles.statLabel}>Streak più lunga</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.skippedCount || 0}</div>
                    <div className={styles.statLabel}>Giri saltati 😅</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{stats.coffeeKarma || 50}</div>
                    <div className={styles.statLabel}>Coffee Karma ☕</div>
                </div>
                <div className={`${styles.statCard} ${styles.fullWidth}`}>
                    <div className={styles.statValue}>€{stats.monthlySavedForFriends?.toFixed(2) || '0.00'}</div>
                    <div className={styles.statLabel}>Risparmiati per gli amici questo mese</div>
                </div>
                <div className={`${styles.statCard} ${styles.fullWidth}`}>
                    <div className={styles.statValue}>€{stats.averagePayment?.toFixed(2) || '0.00'}</div>
                    <div className={styles.statLabel}>Media per pagamento</div>
                </div>
                <div className={`${styles.statCard} ${styles.fullWidth}`}>
                    <div className={styles.statValue}>€{stats.mostExpensive?.toFixed(2) || '0.00'}</div>
                    <div className={styles.statLabel}>Pagamento più alto</div>
                </div>
                <div className={`${styles.statCard} ${styles.fullWidth} ${styles.titleCard}`}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--coffee-700)' }}>
                        🏆 Il tuo titolo: <strong>{stats.funTitle}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--coffee-600)', marginTop: '4px' }}>
                        {stats.funTitle === "Coffee Legend" && "Hai pagato per la squadra più di tutti!"}
                        {stats.funTitle === "The Reliable One" && "Sempre puntuale con i turni."}
                        {stats.funTitle === "Coffee Newbie" && "Stai iniziando il tuo viaggio nel mondo del caffè!"}
                        {stats.funTitle === "Skip Master" && "Specialista nel rimandare il giro 😉"}
                    </div>
                </div>
            </div>
        </section>
    );
});

export default HomeStatistics;