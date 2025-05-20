import React from "react";
import { Link } from "react-router-dom";
import styles from "~/styles/footer.module.css";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* WebStorm Logo (sx) */}
                <div className={styles.logoWrapper}>
                    <img src="/webstorm-svgrepo-com.svg" alt="WebStorm Logo" className={styles.logo} />
                </div>

                {/* Testo Centrale */}
                <div className={styles.centerContent}>
                    <Link to="/leaderboard" className={styles.link}>
                        Classifica Completa
                    </Link>
                    <p className={styles.tagline}>PagaTu - Il caffè che unisce il team</p>
                    <p className={styles.copy}>© {new Date().getFullYear()} PagaTu. All rights reserved.</p>
                    <p className={styles.built}>
                        Built with <i className={styles.heart}></i> using React & Express
                    </p>
                    <div className={styles.policyLinks}>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Us</a>
                    </div>
                </div>

                {/* React Logo (dx) */}
                <div className={styles.logoWrapper}>
                    <img src="/react-16-svgrepo-com.svg" alt="React Logo" className={styles.logo} />
                </div>
            </div>
        </footer>
    );
};

export default Footer;