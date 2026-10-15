import React from 'react'
import styles from '~/styles/footer.module.css'

/** Bottone che linka la pagina BuyMeACoffee del creatore dell'app. */
const BuyMeACoffeeIconButton = () => {
    return (
        <a href="https://buymeacoffee.com/lele_97">
            <img
                src="/bmc-logo-yellow.webp"
                alt="BuyMeACoffee"
                className={styles.btnimg}
            />
        </a>
    )
}

export default BuyMeACoffeeIconButton