import React from "react";
import { Link, useLocation, useRouteError } from "react-router-dom";
import styles from '~/styles/error.module.css';

export default function ErrorPage() {
    const error = useRouteError();
    const location = useLocation();
    const passedError = location.state?.errorMessage
    const invitationError = location.state?.errorInvitation;

    const getErrorInfo = () => {
        if (invitationError) {
            return {
                title: "Oops! Qualcosa è andato storto",
                message: invitationError
            }
        }
        if (passedError) {
            return {
                title: "Errore nel Reset Password",
                message: passedError,
            };
        }
        if (error?.status === 404) {
            return {
                title: "404 - Pagina Non Trovata",
                message: "La pagina che stai cercando non esiste.",
            };
        } else if (error?.status === 500) {
            return {
                title: "500 - Errore del Server",
                message: "Si è verificato un errore interno del server.",
            };
        } else {
            return {
                title: "Oops! Qualcosa è andato storto",
                message: error?.statusText || error?.message || "Si è verificato un errore imprevisto.",
            };
        }
    };

    const errorInfo = getErrorInfo();

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <img src="/pagaTu.png" alt="PagaTu Logo" className={styles.logo} />

                    <h1 className={styles.errorTitle}>{errorInfo.title}</h1>
                    <p className={styles.errorMessage}>{errorInfo.message}</p>

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

                    <div className={styles.actionButtons}>
                        <button onClick={() => window.history.back()} className={styles.secondaryButton}>
                            <i className="fa-solid fa-arrow-left"></i> Torna Indietro
                        </button>
                    </div>

                    <div className={styles.separator}>
                        <div className={styles.separatorLeft}></div>
                        <img src="/coffee-medium-svgrepo-com.svg" alt="Coffee icon separator" />
                        <div className={styles.separatorRight}></div>
                    </div>

                    <div className={styles.helpMessage}>
                        <p>Se il problema persiste, contatta il <a className={styles.support}
                            href="mailto:someone@example.com">supporto tecnico <i
                                className="bi bi-envelope-at-fill"></i></a></p>
                        <p className={styles.coffeeMessage}>
                            Nel frattempo, che ne dici di un caffè? <i className="bi bi-cup-hot-fill"></i>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
