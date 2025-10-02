import React from "react";
import {Link} from "react-router-dom";
import styles from "~/styles/footer.module.css";
import BuyMeACoffeeIconButton from "~/components/BuyMeACoffeeIconButton.jsx";
import GithubPersonalProfileIconButton from "~/components/GithubPersonalProfileIconButton.jsx";
import LinkedinPersonalProfileIconButton from "~/components/LinkedinPersonalProfileIconButton.jsx";

const Footer = () => {
    return (
        <footer>
            <div className={styles.footerContainer}>
                <div className={styles.footerCenter}>
                    <h6 className={styles.footerText}>PagaTu - Il caffè che unisce il team</h6>
                </div>
                <div className={styles.footerSplit}>
                    <div className={styles.footerLeft}>
                        <p className={styles.footerSupportTitle}>Hai bisogno di supporto? <Link to="mailto:support@pagatu.app" className={styles.footerLink}>Contattaci</Link></p>
                        <div className={styles.footerSocial}>
                            <p className={styles.socialTitle}>Follow the my journey</p>
                            <div className={styles.socialButtons}>
                                <BuyMeACoffeeIconButton/>
                                <GithubPersonalProfileIconButton/>
                                <LinkedinPersonalProfileIconButton/>
                            </div>
                        </div>
                    </div>
                    <div className={styles.footerRight}>
                        <h3>Scopri il progetto su <strong>Github</strong></h3>
                        <div className={styles.repoGrid}>
                            <a href="https://github.com/Lele97/PagaTu-Backend" className={styles.repoCardBackEnd}>
                                <img src="/server-minimalistic-svgrepo-com.svg" alt="" className={styles.cardIcon}/>
                                <div className={styles.cardContent}>
                                    <strong>Backend</strong>
                                </div>
                                <img src="/github-svgrepo-com.svg" className={styles.cardGithub}/>
                            </a>
                            <a href="https://github.com/Lele97/PagaTu-Frontend" className={styles.repoCardFrontEnd}>
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
    );
};

export default Footer;
