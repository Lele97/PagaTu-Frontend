import React from "react";
import { useRouteError, Link } from "react-router-dom";
import styles from '~/styles/error.module.css';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    // Determine error type and message
    const getErrorInfo = () => {
        if (error?.status === 404) {
            return {
                title: "404 - Pagina Non Trovata",
                message: "La pagina che stai cercando non esiste.",
                icon: "🔍"
            };
        } else if (error?.status === 500) {
            return {
                title: "500 - Errore del Server",
                message: "Si è verificato un errore interno del server.",
                icon: "⚠️"
            };
        } else {
            return {
                title: "Oops! Qualcosa è andato storto",
                message: error?.statusText || error?.message || "Si è verificato un errore imprevisto.",
                icon: "☕"
            };
        }
    };

    const errorInfo = getErrorInfo();

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    {/* Logo */}
                    <img src="/pagaTu.png" alt="PagaTu Logo" className={styles.logo} />
                    
                    {/* Error Icon */}
                    <div className={styles.errorIcon}>{errorInfo.icon}</div>
                    
                    {/* Error Title */}
                    <h1 className={styles.errorTitle}>{errorInfo.title}</h1>
                    
                    {/* Error Message */}
                    <p className={styles.errorMessage}>{errorInfo.message}</p>
                    
                    {/* Error Details (only in development) */}
                    {process.env.NODE_ENV === 'development' && error?.stack && (
                        <details className={styles.errorDetails}>
                            <summary className={styles.errorSummary}>
                                Dettagli Tecnici (Solo in Sviluppo)
                            </summary>
                            <pre className={styles.errorStack}>
                                {error.stack}
                            </pre>
                        </details>
                    )}
                    
                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        <Link to="/" className={styles.primaryButton}>
                            🏠 Torna alla Home
                        </Link>
                        <button 
                            onClick={() => window.history.back()} 
                            className={styles.secondaryButton}
                        >
                            ← Torna Indietro
                        </button>
                    </div>
                    
                    {/* Helpful Message */}
                    <div className={styles.helpMessage}>
                        <p>Se il problema persiste, contatta il supporto tecnico.</p>
                        <p className={styles.coffeeMessage}>
                            Nel frattempo, che ne dici di un caffè? ☕
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
