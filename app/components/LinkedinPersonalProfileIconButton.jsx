import React from "react";
import styles from '~/styles/footer.module.css'

const LinkedinPersonalProfileIconButton = () => {
    return (
        <a href="https://www.linkedin.com/in/gabriele-grandinetti/">
            <img
                src="/linkedin-rounded-svgrepo-com.png"
                alt="My Linkedin"
                className={styles.btnimgLinkedin}
            />
        </a>
    )
}

export default LinkedinPersonalProfileIconButton;
