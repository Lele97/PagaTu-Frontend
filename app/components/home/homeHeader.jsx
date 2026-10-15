import styles from "~/styles/home.module.css";
import React from "react";

const HomeHeader = React.memo(function HomeHeader({ user, groupsCount = 0 }) {
    const greeting = user ? `Ciao, ${user}!` : 'Bentornato!';
    const subtitle = groupsCount > 0
        ? `Hai ${groupsCount} ${groupsCount === 1 ? 'gruppo' : 'gruppi'}`
        : 'Crea il tuo primo gruppo per iniziare';

    return (
        <section className={styles.heroSection}>
            <h1 className={styles.heroTitle}>{greeting}</h1>
            <p className={styles.heroSubtitle}>{subtitle}</p>
        </section>
    );
});

export default HomeHeader;