import React from "react";
import styles from '~/styles/header.module.css'

const Header = ({user, logout}) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.logoTitleContainer}>
                    <h1 className={styles.headerTitle}>Paga</h1>
                    <img src="/pagaTu.png" alt="Logo" className={styles.pagatu_image}/>
                    <h1 className={styles.headerTitle}>Tu</h1>
                </div>
                <div className={styles.userInfo}>
                    <i className="fa-solid fa-user"></i>
                    <span className={styles.welcomeText}>Ciao, {user}!</span>
                    <button onClick={logout} className={styles.logoutButton}>Esci</button>
                </div>
            </div>
        </header>
    )
}

export default Header;