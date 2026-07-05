import sharedStyles from "~/styles/shared.module.css";
import React from "react";

const LoadingSpinner = React.memo(function LoadingSpinner({ message }) {
    return (
        <div className={sharedStyles.loadingSpinner}>
            <div className={sharedStyles.loadingSpinnerInner}>
                <div className={sharedStyles.spinner} />
                <span className={sharedStyles.spinnerText}>{message}</span>
            </div>
        </div>
    );
});

export default LoadingSpinner;