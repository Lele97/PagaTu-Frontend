import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuthButtons from '~/components/OAuthButtons.jsx';
import authStyles from '~/styles/auth.module.css';
import signupStyles from '~/styles/signup.module.css';
import logostyle from '~/styles/logo.module.css';
import { GATEWAY_URL, parseErrorMessage } from '~/utils/api';
import { HOME_PATH, invitationPath, readPendingInvitation } from '~/utils/routes';

const GETAWAY_SERVER_URL = GATEWAY_URL;

const LoginForm = ({ embedded = false, onSwitchToSignup }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('');
    const navigate = useNavigate();

    const styles = embedded ? signupStyles : authStyles;

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            return;
        }

        const pending = readPendingInvitation();
        navigate(pending ? invitationPath(pending) : HOME_PATH);
    }, [navigate]);

    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(''), 3000);
        return () => clearTimeout(timer);
    }, [error]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setCredentials((prev) => ({ ...prev, [id]: value }));
        if (error) setError('');
    };

    const handleLoginSuccess = (userData, authToken) => {
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));

        const pending = readPendingInvitation();
        if (!pending) {
            navigate(HOME_PATH);
            return;
        }

        if (userData.username === pending.username) {
            navigate(invitationPath(pending));
            return;
        }

        localStorage.removeItem('pendingInvitation');
        navigate(HOME_PATH);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${GETAWAY_SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorMsg = await parseErrorMessage(response, 'Login non riuscito. Controlla le credenziali.');
                if (errorMsg.toLowerCase().includes('verifica')) {
                    setShowResend(true);
                }
                throw new Error(errorMsg);
            }

            const { token, username, email } = await response.json();
            setShowResend(false);
            handleLoginSuccess({ username, email }, token);
        } catch (err) {
            setError(err.message || 'Si è verificato un errore durante il login');
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerification = async () => {
        if (!resendEmail.trim()) {
            setResendStatus('Inserisci la tua email');
            return;
        }
        try {
            const response = await fetch(
                `${GETAWAY_SERVER_URL}/api/auth/resend-verification?email=${encodeURIComponent(resendEmail.trim())}`,
                { method: 'POST', credentials: 'include' }
            );
            const text = await response.text();
            setResendStatus(response.ok ? (text || 'Email inviata!') : text);
        } catch {
            setResendStatus('Errore di connessione');
        }
    };

    const formContent = (
        <>
            {!embedded && <h2 className={authStyles.title}>Accedi al tuo account</h2>}

            <form onSubmit={handleSubmit} className={embedded ? undefined : authStyles.form}>
                <div className={embedded ? signupStyles.inputGroup : authStyles.inputGroup}>
                    <label htmlFor="username" className={styles.label}>
                        Username*
                    </label>
                    <input
                        type="text"
                        id="username"
                        className={embedded ? signupStyles.inputField : authStyles.input}
                        placeholder="Il tuo username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className={embedded ? signupStyles.inputGroup : authStyles.inputGroup}>
                    <div
                        className={embedded ? undefined : authStyles.passwordHeader}
                        style={embedded ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' } : undefined}
                    >
                        <label htmlFor="password" className={styles.label}>
                            Password*
                        </label>
                        <Link
                            to="/forgotPassword"
                            className={embedded ? undefined : authStyles.link}
                            style={embedded ? { fontSize: '0.85rem', fontWeight: 700, color: 'var(--coffee-700)', textDecoration: 'none' } : undefined}
                        >
                            Password dimenticata?
                        </Link>
                    </div>
                    <input
                        type="password"
                        id="password"
                        className={embedded ? signupStyles.inputField : authStyles.input}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                {error && (
                    <div className={embedded ? signupStyles.errorMessage : authStyles.error}>
                        {error}
                    </div>
                )}

                {showResend && (
                    <div className={authStyles.resendBox}>
                        <p>Non hai ricevuto l&apos;email di verifica?</p>
                        <input
                            type="email"
                            className={embedded ? signupStyles.inputField : authStyles.input}
                            placeholder="La tua email"
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                        />
                        <button type="button" className={authStyles.secondaryButton} onClick={resendVerification}>
                            Reinvia verifica
                        </button>
                        {resendStatus && <p className={authStyles.resendStatus}>{resendStatus}</p>}
                    </div>
                )}

                <button
                    type="submit"
                    className={embedded ? signupStyles.submitButton : authStyles.primaryButton}
                    disabled={isLoading}
                >
                    {isLoading ? 'Accesso...' : 'Accedi'}
                </button>

                {!embedded && (
                    <div className={authStyles.footer}>
                        Non hai un account?
                        <Link to="/welcome?tab=signup" className={authStyles.link}>
                            Registrati
                        </Link>
                    </div>
                )}
            </form>

            <OAuthButtons onLoginSuccess={handleLoginSuccess} embedded={embedded} />
        </>
    );

    if (embedded) {
        return <div>{formContent}</div>;
    }

    return (
        <div className={authStyles.container}>
            <div className={authStyles['header-container']}>
                <img src="/pagaTu.svg" alt="Logo" className={logostyle.logo} />
                <div className={logostyle.appTitle}>
                    <h1 className={logostyle.appTitlecolor}>P</h1>
                    <h1 className={logostyle.appTitlecolor2}>a</h1>
                    <h1 className={logostyle.appTitlecolor}>g</h1>
                    <h1 className={logostyle.appTitlecolor2}>a</h1>
                    <br />
                    <h1 className={logostyle.appTitlecolor}>T</h1>
                    <h1 className={logostyle.appTitlecolor2}>u</h1>
                </div>
            </div>
            <div className={authStyles.formContainer}>{formContent}</div>
        </div>
    );
};

export default LoginForm;