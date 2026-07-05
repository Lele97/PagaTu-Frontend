import styles from "~/styles/home.module.css";
import React from "react";
import LoadingSpinner from "~/components/shared/loadingSpinner.jsx";

const HomeAwards = React.memo(function HomeAwards({ awards, loading }) {
    if (loading) {
        return <LoadingSpinner message="Caricamento award..." />;
    }

    const displayAwards = awards && awards.length > 0 ? awards : [
        { id: 1, name: "Caffè King del mese", level: "gold", icon: "bi-cup-hot-fill" },
        { id: 2, name: "Streak 7 giorni", level: "silver", icon: "bi-star-fill" },
        { id: 3, name: "Primo gruppo creato", level: "bronze", icon: "bi-people-fill" },
    ];

    return (
        <section className={styles.awardSection}>
            <h2 className={styles.awardTitle}>
                <i className="bi bi-trophy-fill" /> I tuoi Award
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
                            <i className={`bi ${award.icon}`} />
                            <span>{award.name}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
});

export default HomeAwards;