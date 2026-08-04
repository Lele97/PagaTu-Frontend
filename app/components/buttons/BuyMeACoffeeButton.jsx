import React from "react";
import styles from '~/styles/header.module.css'

const BuyMeACoffeeButton = () => {
    return (
        <a href="https://buymeacoffee.com/lele_97">
            <img
                src="/yellow-button.webp"
                alt="BuyMeACoffee"
                className={styles.btnimg}
            />
        </a>
    )
}

export default BuyMeACoffeeButton;