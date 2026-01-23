import styles from "~/styles/home.module.css";
import React from "react";

const HomeHeader = React.memo(function HomeHeader({
}) {
    return (
        <section className={styles.heroSection}>
            <h1 className={styles.heroTitle}>Il caffè che unisce il team</h1>
            <p className={styles.heroSubtitle}>Crea gruppi e controlla i pagamenti in modo semplice veloce
                e divertente</p>
        </section>
    )
})

export default HomeHeader;