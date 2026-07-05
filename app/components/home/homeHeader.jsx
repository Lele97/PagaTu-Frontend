import styles from "~/styles/home.module.css";
import React from "react";

const HomeHeader = React.memo(function HomeHeader({
}) {
    return (
        <section className={styles.heroSection}>
            <h1 className={styles.heroTitle}>La tua home</h1>
            <p className={styles.heroSubtitle}>I tuoi gruppi e gli ultimi pagamenti</p>
        </section>
    )
})

export default HomeHeader;