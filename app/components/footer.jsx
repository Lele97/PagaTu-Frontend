import React from "react";
import {Link} from "react-router-dom";
import styles from "~/styles/footer.module.css";
import BuyMeACoffeeIconButton from "~/components/BuyMeACoffeeIconButton.jsx";
import GithubPersonalProfileIconButton from "~/components/GithubPersonalProfileIconButton.jsx";

const Footer = () => {
    return (

        <footer>
            <div className={styles.footerContainer}>

                <div className={styles.footerCenter}>
                    <h6 className={styles.footerText}>PagaTu - Il caffè che unisce il team</h6>
                </div>

                <div className={styles.footerSplit}>

                    <div className={styles.footerLeft}>
                        <p>Hai bisogno di supporto? <Link to="mailto:support@pagatu.app" className={styles.footerLink}>Contact
                            Us</Link></p>
                        <div className={styles.footerSocial}>
                            <h6>Social <BuyMeACoffeeIconButton/> <GithubPersonalProfileIconButton/></h6>
                        </div>
                    </div>

                    <div className={styles.footerRight}>

                        <h3>Scopri il progetto su <strong>Github</strong></h3>
                        <div className={styles.repoGrid}>

                            <a href="https://github.com/Lele97/PagaTu-Backend" className={styles.repoCard}>
                                <img src="/server-minimalistic-svgrepo-com.svg" alt="" className={styles.cardIcon}/>
                                <div className={styles.cardContent}>
                                    <strong>Backend</strong>
                                </div>
                                <img src="/github-svgrepo-com.svg" className={styles.cardGithub}/>
                            </a>

                            <a href="https://github.com/Lele97/PagaTu-Frontend" className={styles.repoCard}>
                                <img src="/tablet-laptop-2-svgrepo-com.svg" alt="" className={styles.cardIcon}/>
                                <div className={styles.cardContent}>
                                    <strong>Frontend</strong>
                                </div>
                                <img src="/github-svgrepo-com.svg" className={styles.cardGithub}/>
                            </a>


                        </div>
                    </div>

                </div>
                <div className={styles.footerBottom}>
                    <p className={styles.footerBottomText}>
                        Built with <i className={styles.heart}></i> using Java & React
                    </p>
                    <p className={styles.footerBottomCopyright}>
                        © {new Date().getFullYear()} pagatu.app — All rights reserved.
                    </p>
                </div>

            </div>

        </footer>
    )
        ;
};

export default Footer;
