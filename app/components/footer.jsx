import React from "react";
import {Link} from "react-router-dom";
import styles from "~/styles/footer.module.css";

const Footer = () => {
    return (
        <footer>
            <div className={styles.footerContainer}>

                <img className={styles.footerImage} src="/webstorm-svgrepo-com.svg" alt="WebStorm Logo"/>

                <div className={styles.footerCenter}>

                    <p className={styles.footerText}>PagaTu - Il caffè che unisce il
                        team</p>

                    <div className={styles.footerLinks}>
                        <Link to="/leaderboard" className={styles.footerLink}>
                            Classifica Completa
                        </Link>

                        <Link to="#" className={styles.footerLink}>Privacy Policy</Link>
                        <Link to="#" className={styles.footerLink}>Terms of Service</Link>
                        <Link to="#" className={styles.footerLink}>Contact Us</Link>
                    </div>


                    <p className={styles.footerText_}>
                        Built with <i className={styles.heart}></i> using React & Express
                    </p>
                    <p className={styles.footerText}>© {new Date().getFullYear()} PagaTu. All rights reserved.</p>
                </div>

                <img className={styles.footerImage} src="/react-16-svgrepo-com.svg" alt="React Logo"/>
            </div>
        </footer>
    );
};

export default Footer;
