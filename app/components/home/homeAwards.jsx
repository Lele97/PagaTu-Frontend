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
            <>
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
            </>
        );
    }

    const ringClass = (level) => level === 'gold'
        ? styles.awardMedalRingGold
        : level === 'silver'
            ? styles.awardMedalRingSilver
            : styles.awardMedalRingBronze;

    const iconClass = (level) => level === 'gold'
        ? styles.awardMedalIconGold
        : level === 'silver'
            ? styles.awardMedalIconSilver
            : styles.awardMedalIconBronze;

    return (
        <>
            <h2 className={styles.awardTitle}>
                <i className="fa-solid fa-trophy" /> I tuoi Award
            </h2>
            <div className={styles.awardMedalGrid}>
                {displayAwards.map((award) => (
                    <div key={award.id} className={styles.awardMedal} title={award.name}>
                        <div className={`${styles.awardMedalRing} ${ringClass(award.level)}`}>
                            <div className={styles.awardMedalInner}>
                                <i className={`${fa(award.icon)} ${iconClass(award.level)}`} />
                            </div>
                        </div>
                        <span className={styles.awardMedalLabel}>{award.name}</span>
                        {award.earnedAt && (
                            <span className={styles.awardMedalDate}>
                                {new Date(award.earnedAt).toLocaleDateString('it-IT')}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
});

export default HomeAwards;