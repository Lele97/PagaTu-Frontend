import {useEffect, useState} from 'react';
import signupStyles from '~/styles/signup.module.css';
import { forgotPassword } from '~/services/requestApi';

const ForgotPswForm = ({ onSwitchToLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (!success) {
            return undefined;
        }

        const timer = setTimeout(() => {
            onSwitchToLogin?.();
        }, 2000);

        return () => clearTimeout(timer);
    }, [success, onSwitchToLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { status } = await forgotPassword(email);

            switch (status) {
                case 200:
                    setSuccess('Richiesta inviata. Controlla la tua email: tornerai all\'accesso tra poco.');
                    localStorage.setItem("email", email);
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
        <>
            <div className={signupStyles.authPanelHeader}>
                <h2 className={signupStyles.title}>Hai dimenticato la password?</h2>
                <p className={signupStyles.authSubtitle}>
                    Inserisci l&apos;email con cui ti sei registrato: ti invieremo il link per reimpostare la password.
                </p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className={signupStyles.inputGroup}>
                    <label htmlFor="forgot-email" className={signupStyles.label}>Email</label>
                    <input
                        type="email"
                        id="forgot-email"
                        className={signupStyles.inputField}
                        placeholder="Inserisci la tua email"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        required
                    />
                </div>

                {error && <div className={signupStyles.errorMessage}>{error}</div>}
                {success && <div className={signupStyles.successMessage}>{success}</div>}

                <button type="submit" className={signupStyles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Invio in corso...' : 'Invia'}
                </button>
                {onSwitchToLogin && (
                    <div className={signupStyles.loginLink}>
                        Hai già un account?{' '}
                        <button type="button" onClick={onSwitchToLogin}>Accedi</button>
                    </div>
                )}
            </form>
        </>
    );
}

export default ForgotPswForm;
