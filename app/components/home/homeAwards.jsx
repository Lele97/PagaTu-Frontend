import styles from "~/styles/home.module.css";
import React from "react";
import LoadingSpinner from "~/components/shared/loadingSpinner.jsx";
import { fa } from "~/utils/icons";

const HomeAwards = React.memo(function HomeAwards({ awards, loading }) {
    if (loading) {
        return <LoadingSpinner message="Caricamento award..." />;
    }

    const displayAwards = awards?.length > 0 ? awards : [];

    if (!displayAwards.length) {
        return (
            <section className={styles.awardSection}>
                <h2 className={styles.awardTitle}>
                    <i className="fa-solid fa-trophy" /> I tuoi Award
                </h2>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <i className="fa-solid fa-trophy" />
                    </div>
                    <h3>Nessun award ancora</h3>
                    <p>Continua a pagare il caffè e partecipare ai gruppi per sbloccare traguardi!</p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.awardSection}>
            <h2 className={styles.awardTitle}>
                <i className="fa-solid fa-trophy" /> I tuoi Award
            </h2>
            <div className={styles.awardGrid}>
                {displayAwards.map((award) => {
                    const bannerClass = award.level === 'gold'
                        ? styles.awardBannerGold
                        : award.level === 'silver'
                            ? styles.awardBannerSilver
                            : styles.awardBannerBronze;
                    return (
                        <div key={award.id} className={`${styles.awardBanner} ${bannerClass}`}>
                            <i className={fa(award.icon)} />
                            <span>{award.name}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
});

export default HomeAwards;