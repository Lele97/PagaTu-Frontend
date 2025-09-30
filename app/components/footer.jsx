import React from "react";
import {Link} from "react-router-dom";
import styles from "~/styles/footer.module.css";

const Footer = () => {
    return (

        <footer>
            <div className={styles.footerContainer}>
                <div className={styles.footer-split}>
                    <div className={styles.footerCenter}>
                        {/* On the center footer*/}
                        <p className={styles.footerText}>PagaTu - Il caffè che unisce il
                            team</p>

                        {/* On the left footer*/}
                        <div className={styles.footerLinks}>
                            <p>Hai bisogno di supporto?</p>
                            <Link to="mailto:support@pagatu.app" className={styles.footerLink}>Contact Us</Link>
                        </div>

                        {/* On the right footer*/}
                        <div>
                            <div>
                                <h1>Scopri il progetto PagaTu</h1>
                                <img src="/pagaTu.png" alt="Logo" className={styles.pagatuimage}/>
                            </div>

                            <div>
                                <img src="/server-minimalistic-svgrepo-com.svg" alt="" className={styles.backendicon}/>
                                <p><strong>Backend</strong></p>
                                <a href="https://github.com/Lele97/PagaTu-Backend">
                                    <img src="/github-svgrepo-com.svg" className={styles.gitbtn}/>
                                </a>
                            </div>
                            <div>
                                <img src="/tablet-laptop-2-svgrepo-com.svg" alt="" className={styles.frontendicon}/>
                                <p><strong>Frontend</strong></p>
                                <a href="https://github.com/Lele97/PagaTu-Frontend">
                                    <img src="/github-svgrepo-com.svg" className={styles.gitbtn}/>
                                </a>
                            </div>
                        </div>

                        {/* On the center footer*/}
                        <p className={styles.footerText_}>
                            Built with <i className={styles.heart}></i> using Java & React
                        </p>

                        {/* On the center footer*/}
                        <p className={styles.footerText}>© {new Date().getFullYear()} pagatu.app All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
