import sharedStyles from "~/styles/shared.module.css";
import styles from "~/styles/group.module.css";
import React from "react";

const LoadingSpinner = React.memo(function LoadingSpinner({
    message}
) {
    return (
        <div className={sharedStyles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.spinnerText}>{message}</span>
        </div>
    )
})

export default LoadingSpinner;