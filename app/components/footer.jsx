import React from "react";
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
                        <p className={styles.footerSupportTitle}>Hai bisogno di supporto? <a
                            href="mailto:support@pagatu.app" className={styles.footerLink}>Contattaci</a></p>
                        <div className={styles.footerSocial}>
                            <p className={styles.socialTitle}>Seguimi nel mio viaggio</p>
                            <div className={styles.socialButtons}>
                                <BuyMeACoffeeIconButton/>
                                <GithubPersonalProfileIconButton/>
                                <LinkedinPersonalProfileIconButton/>
                            </div>
                        </div>
                    </div>
                    <div className={styles.footerRight}>
                        <h3>Scopri il progetto su <strong>Github</strong></h3>
                        <nav className={styles.repoGrid} aria-label="Repository GitHub">
                            <a href="https://github.com/Lele97/PagaTu-Backend" className={styles.repoCardBackEnd}
                               target="_blank" rel="noopener noreferrer"
                               aria-label="Vai al repository Backend su GitHub">
                                <img src="/server-minimalistic-svgrepo-com.svg" alt="Icona server"
                                     className={styles.cardIcon}/>
                                <div className={styles.cardContent}>
                                    <strong>Backend</strong>
                                </div>
                                <img src="/github-svgrepo-com.svg" alt="GitHub" className={styles.cardGithub}/>
                            </a>
                            <a href="https://github.com/Lele97/PagaTu-Frontend" className={styles.repoCardFrontEnd}
                               target="_blank" rel="noopener noreferrer"
                               aria-label="Vai al repository Frontend su GitHub">
                                <img src="/tablet-laptop-2-svgrepo-com.svg" alt="Icona dispositivi"
                                     className={styles.cardIcon}/>
                                <div className={styles.cardContent}>
                                    <strong>Frontend</strong>
                                </div>
                                <img src="/github-svgrepo-com.svg" alt="GitHub" className={styles.cardGithub}/>
                            </a>
                        </nav>
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