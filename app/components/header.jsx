import React from "react";
import styles from '~/styles/header.module.css'
import BuyMeACoffeeButton from '~/components/BuyMeACoffeeButton';

const Header = ({user, logout}) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <BuyMeACoffeeButton></BuyMeACoffeeButton>
                <div className={styles.logoTitleContainer}>
                    <img src="/pagaTu.png" alt="Logo" className={styles.pagatu_image}/>
                </div>
                <div className={styles.userInfo}>
                    <i className="bi bi-person-circle"></i>
                    <span className={styles.welcomeText}>Ciao {user}</span>
                    <img onClick={logout} className={styles.logoutBtn} src="/logout-svgrepo-com.svg"/>
                </div>
            </div>
        </header>
    )
}

export default Header;