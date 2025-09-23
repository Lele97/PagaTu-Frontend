import React from "react";
import {Link} from "react-router-dom";
import styles from "~/styles/footer.module.css";

const Footer = () => {
    return (

        <footer>
            <div className={styles.footerContainer}>

                <div className={styles.footerCenter}>

                    <p className={styles.footerText}>PagaTu - Il caffè che unisce il
                        team</p>

                    <div className={styles.footerLinks}>
                        <p>Hai bisogno di supporto?</p>
                        <Link to="mailto:support@pagatu.app" className={styles.footerLink}>Contact Us</Link>
                    </div>



                    <div>
                        <h1>Scopri il progetto PagaTu</h1>
                        <span>
                            <p>Repository applicativo backend</p>
                            <a href="https://github.com/Lele97/PagaTu-Backend">
                            <img src="/github-svgrepo-com.svg" className={styles.gitbtn}/>
                            </a>
                        </span>
                    <span>
                        <p>Repository applicativo frontend</p>
                         <a href="https://github.com/Lele97/PagaTu-Frontend">
                        <img src="/github-svgrepo-com.svg" className={styles.gitbtn}/>
                    </a>
                    </span>

                        <h2></h2>

                    </div>


                    <p className={styles.footerText_}>
                        Built with <i className={styles.heart}></i> using Java & React
                    </p>
                    <p className={styles.footerText}>© {new Date().getFullYear()} PagaTu.app All rights reserved.</p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
