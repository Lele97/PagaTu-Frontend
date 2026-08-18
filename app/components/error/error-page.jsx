import React from "react";
import { useLocation, useRouteError } from "react-router-dom";
import styles from '~/styles/error.module.css';
import CoffeeSeparator from '~/components/shared/CoffeeSeparator.jsx';

export function RouterErrorPage() {
    const error = useRouteError();
    return <ErrorPage routeError={error} />;
}

export default function ErrorPage({ routeError }) {
    const location = useLocation();
    const passedError = location.state?.errorMessage;
    const invitationError = location.state?.errorInvitation;
    const isNotFound = location.pathname !== '/error' && location.pathname !== '/errore-token' && !routeError;

    const getErrorInfo = () => {
        if (invitationError) {
            return {
                title: "Oops! Qualcosa è andato storto",
                message: invitationError,
            };
        }
        if (passedError) {
            const isTokenError = location.pathname === '/errore-token';
            return {
                title: isTokenError ? "Errore nel Reset Password" : "Oops! Qualcosa è andato storto",
                message: passedError,
            };
        }
        if (isNotFound || routeError?.status === 404) {
            return {
                title: "404 - Pagina Non Trovata",
                message: "La pagina che stai cercando non esiste.",
            };
        }
        if (routeError?.status === 500) {
            return {
                title: "500 - Errore del Server",
                message: "Si è verificato un errore interno del server.",
            };
        }
        return {
            title: "Oops! Qualcosa è andato storto",
            message: routeError?.statusText || routeError?.message || "Si è verificato un errore imprevisto.",
        };
    };

    const errorInfo = getErrorInfo();

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <img src="/pagaTu.png" alt="PagaTu Logo" className={styles.logo} />

                    <h1 className={styles.errorTitle}>{errorInfo.title}</h1>
                    <p className={styles.errorMessage}>{errorInfo.message}</p>

                    {import.meta.env.DEV && routeError?.stack && (
                        <details className={styles.errorDetails}>
                            <summary className={styles.errorSummary}>
                                Dettagli Tecnici (Solo in Sviluppo)
                            </summary>
                            <pre className={styles.errorStack}>
                                {routeError.stack}
                            </pre>
                        </details>
                    )}

                    <div className={styles.actionButtons}>
                        <button onClick={() => window.history.back()} className={styles.secondaryButton}>
                            <i className="fa-solid fa-arrow-left"></i> Torna Indietro
                        </button>
                    </div>

                    <CoffeeSeparator />

                    <div className={styles.helpMessage}>
                        <p>Se il problema persiste, contatta il <a className={styles.support}
                            href="mailto:support@pagatu.app">supporto tecnico <i
                                className="fa-solid fa-at"></i></a></p>
                        <p className={styles.coffeeMessage}>
                            Nel frattempo, che ne dici di un caffè? <i className="fa-solid fa-mug-hot"></i>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
