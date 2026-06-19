import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import OAuthButtons from '~/components/OAuthButtons.jsx';
import styles from '~/styles/auth.module.css';
import logostyle from '~/styles/logo.module.css';
import { GATEWAY_URL, parseErrorMessage } from '~/utils/api';

const GETAWAY_SERVER_URL = GATEWAY_URL;

const LoginForm = () => {
    const [credentials, setCredentials] = useState({username: '', password: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const pendingInvitation = localStorage.getItem('pendingInvitation');

        if (authToken) {
            if (pendingInvitation) {
                try {
                    const {username, groupName} = JSON.parse(pendingInvitation);
                    navigate(`/invitation?username=${encodeURIComponent(username)}&groupName=${encodeURIComponent(groupName)}`);
                } catch (error) {
                    localStorage.removeItem('pendingInvitation');
                    navigate('/home');
                }
            } else {
                navigate('/home');
            }
        }
    }, [navigate]);

    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => setError(''), 1000);
        return () => clearTimeout(timer);
    }, [error]);

    const handleChange = (e) => {
        const {id, value} = e.target;
        setCredentials(prev => ({...prev, [id]: value}));
        if (error) setError('');
    };

    const handleLoginSuccess = (userData, authToken) => {
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));

        const pendingInvitation = localStorage.getItem('pendingInvitation');
        if (!pendingInvitation) {
            navigate('/home');
            return;
        }

        try {
            const {username: invitedUser, groupName} = JSON.parse(pendingInvitation);
            const currentUsername = userData.username;

            if (currentUsername === invitedUser) {
                navigate(`/invitation?username=${encodeURIComponent(invitedUser)}&groupName=${encodeURIComponent(groupName)}`);
            } else {
                localStorage.removeItem('pendingInvitation');
                navigate('/home');
            }
        } catch {
            localStorage.removeItem('pendingInvitation');
            navigate('/home');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${GETAWAY_SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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

            const {token, username, email} = await response.json();
            setShowResend(false);
            handleLoginSuccess({username, email}, token);
        } catch (err) {
            // Extract the error message instead of the whole error object
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

    return (
        <div className={styles.container}>

            <div className={styles['header-container']}>
                <img src="/pagaTu.png" alt="Logo" className={logostyle.logo}/>
                <div className={logostyle.appTitle}>
                    <h1 className={logostyle.appTitlecolor}>P</h1>
                    <h1 className={logostyle.appTitlecolor2}>a</h1>
                    <><h1 className={logostyle.appTitlecolor}>g</h1></>
                    <h1 className={logostyle.appTitlecolor2}>a</h1>
                    <br></br>
                    <h1 className={logostyle.appTitlecolor}>T</h1>
                    <h1 className={logostyle.appTitlecolor2}>u</h1>
                </div>
            </div>

            <div className={styles.formContainer}>
                <h2 className={styles.title}>Accedi al tuo account</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}>
                            Username*
                        </label>
                        <input
                            type="text"
                            id="username"
                            className={styles.input}
                            placeholder="Il tuo username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.passwordHeader}>
                            <label htmlFor="password" className={styles.label}>
                                Password*
                            </label>
                            <Link to="/forgotPassword" className={styles.link}>
                                Password dimenticata?
                            </Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            placeholder="••••••••"
                            autoComplete={"current-password"}
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    {showResend && (
                        <div className={styles.resendBox}>
                            <p>Non hai ricevuto l&apos;email di verifica?</p>
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="La tua email"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                            />
                            <button type="button" className={styles.secondaryButton} onClick={resendVerification}>
                                Reinvia verifica
                            </button>
                            {resendStatus && <p className={styles.resendStatus}>{resendStatus}</p>}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.primaryButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Accesso...' : 'Accedi'}
                    </button>

                    <div className={styles.footer}>
                        Non hai un account?
                        <Link to="/signup" className={styles.link}>
                            Registrati
                        </Link>
                    </div>
                </form>

                <OAuthButtons onLoginSuccess={handleLoginSuccess} />
            </div>
        </div>
    );
};

export default LoginForm;