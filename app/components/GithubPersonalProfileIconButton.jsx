import React from "react";
import styles from '~/styles/footer.module.css'

const GithubPersonalProfileIconButton = () => {
    return (
        <a href="https://github.com/Lele97">
            <img
                src="/github-142-svgrepo-com.png"
                alt="My Github"
                className={styles.btnimgGitHub}
            />
        </a>
    )
}

export default GithubPersonalProfileIconButton;