import React from 'react'
import styles from '~/styles/footer.module.css'

const BuyMeACoffeeIconButton = () => {
    return (
        <a href="https://buymeacoffee.com/lele_97">
            <img
                src="/bmc-logo-yellow.png"
                alt="BuyMeACoffee"
                className={styles.btnimg}
            />
        </a>
    )
}

export default BuyMeACoffeeIconButton