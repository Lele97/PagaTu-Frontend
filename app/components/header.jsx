import React from "react";
import styles from '~/styles/header.module.css'
import BuyMeACoffeeButton from '~/components/BuyMeACoffeeButton';

const Header = ({user, logout}) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <BuyMeACoffeeButton></BuyMeACoffeeButton>
                <div className={styles.logoTitleContainer}>
                    <img src="/pagaTu.png" alt="PagaTu - Logo applicazione caffè aziendale" className={styles.pagatu_image}/>
                </div>
                <div className={styles.userInfo}>
                    <i className="bi bi-person-circle" aria-hidden="true"></i>
                    <span className={styles.welcomeText}>Ciao {user}</span>
                    <button onClick={logout} className={styles.logoutBtn} aria-label="Logout" title="Esci dall'applicazione">
                        <img src="/logout-svgrepo-com.svg" alt="" role="presentation"/>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header;