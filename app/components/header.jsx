import React from "react";
import styles from "~/styles/header.module.css";
import BuyMeACoffeeButton from "~/components/BuyMeACoffeeButton";

const Header = ({user, logout}) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <BuyMeACoffeeButton/>

                <div className={styles.logoTitleContainer}>
                        <img
                            src="/pagaTu.webp"
                            alt="PagaTu - Logo applicazione caffè aziendale"
                            width={200}
                            height={300}
                            className={styles.pagatu_image}
                        />
                </div>


                <div className={styles.userInfo}>
                    <div
                        className={styles.coffeeAvatar}
                        aria-label={`Utente ${user}`}>
                        <img
                            src="/coffee-cup-coffee-svgrepo-com.webp"
                            alt=""
                            width={45}
                            height={45}
                            className={styles.coffeeImg}
                        />
                        <span className={styles.coffeeLetter}>
              {user?.charAt(0).toUpperCase()}
            </span>
                    </div>

                    {/*  <button
                        onClick={logout}
                        className={styles.logoutBtn}
                        aria-label="Logout"
                        title="Esci dall'applicazione">
                        <img
                            src="/logout-svgrepo-com.svg"
                            alt=""
                            role="presentation"/>
                    </button>*/}

                    <div className={styles.door_container}>
                        <div className={styles.top_bar}></div>
                        <div className={styles.door_frame}></div>
                        <div className={styles.door_panel}></div>
                        <div className={styles.doorknob}>
                            <div className={styles.doorknob_inner}></div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;