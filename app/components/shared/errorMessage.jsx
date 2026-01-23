import React from "react";
import styles from "~/styles/group.module.css";

const ErrorMessage = React.memo(function ErrorMessage({ onRetry, message }) {
    const text =
        typeof message === "string" ? message : message?.message || JSON.stringify(message);

    return (
        <div className={styles.errorMessage}>
            <div className={styles.errorText}>{text}</div>
            <button onClick={onRetry} className={styles.retryButton}>
                Riprova <i className="fa-solid fa-repeat"></i>
            </button>
        </div>
    );
});

export default ErrorMessage;