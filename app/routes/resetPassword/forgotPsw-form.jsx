import {useEffect, useState} from 'react';
import styles from '~/styles/forgotPsw.module.css';
import {Link, useNavigate} from "react-router-dom";

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const ForgotPswForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 1000); // Increased to 5 seconds for better readability
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate('/');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${NGROK_SERVER_URL}/api/auth/forgotPassword?email=${encodeURIComponent(email)}`, {
                method: 'POST',
                credentials: 'include',
            });

            switch (response.status) {
                case 200:
                    setSuccess('Invio della richiesta avvenuto con successo. Verrai reindirizzato alla pagina di login.');
                    localStorage.setItem("email", email);
                    // Navigation is now handled by the useEffect above
                    break;
                case 404:
                    setError('Email non presente nel sistema');
                    break;
                case 429:
                    setError('Troppe richieste al server. Riprova più tardi.');
                    break;
                default:
                    throw new Error('Problema durante l\'invio. Riprovare più tardi');
            }
        } catch (error) {
            setError(error.message || 'Errore di connessione');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles['header-container']}>
                <img src="/pagaTu.png" alt="Logo" className={styles.logo}/>
                <div className={styles.appTitle}>
                    <h1 className={styles.appTitlecolor}>P</h1>
                    <h1 className={styles.appTitlecolor2}>a</h1>
                    <h1 className={styles.appTitlecolor}>g</h1>
                    <h1 className={styles.appTitlecolor2}>a</h1>
                    <br></br>
                    <h1 className={styles.appTitlecolor}>T</h1>
                    <h1 className={styles.appTitlecolor2}>u</h1>
                </div>
            </div>

            <div className={styles.forgotPswForm}>
                <h2 className={styles.title}>Hai dimenticato la password?</h2>
                <p className={styles.text}>Inserisci qui sotto l'indirizzo email che hai utilizzato per registrarti,
                    riceverai una mail con
                    il link per reimpostare la tua password in modo sicuro.</p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            className={styles.inputField}
                            placeholder="Inserisci la tua email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    {error && <div className={styles.errorMessageModal}>{error}</div>}
                    {success && <div className={styles.successMessage}>{success}</div>}

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Invio in corso...' : 'Invia'}
                    </button>
                    <div className={styles.signupLink}>
                        Hai già un account?
                        <Link to="/" className={styles.link}>Accedi</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ForgotPswForm;