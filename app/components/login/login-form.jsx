import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OAuthButtons from '~/components/OAuthButtons.jsx';
import authStyles from '~/styles/auth.module.css';
import signupStyles from '~/styles/signup.module.css';
import { messageFromBody } from '~/utils/api';
import { login, resendVerification } from '~/services/requestApi';
import { HOME_PATH, invitationPath, readPendingInvitation } from '~/utils/routes';

const LoginForm = ({ onSwitchToForgot }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('');
    const navigate = useNavigate();

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
            const { ok, body } = await login(credentials);

            if (!ok) {
                const errorMsg = messageFromBody(body, 'Login non riuscito. Controlla le credenziali.');
                if (errorMsg.toLowerCase().includes('verifica')) {
                    setShowResend(true);
                }
                throw new Error(errorMsg);
            }

            const { token, username, email } = body;
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
            const { ok, body } = await resendVerification(resendEmail.trim());
            const text = messageFromBody(body, ok ? 'Email inviata!' : 'Invio non riuscito');
            setResendStatus(ok ? (text || 'Email inviata!') : text);
        } catch {
            setResendStatus('Errore di connessione');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className={signupStyles.inputGroup}>
                    <label htmlFor="username" className={signupStyles.label}>
                        Username*
                    </label>
                    <input
                        type="text"
                        id="username"
                        className={signupStyles.inputField}
                        placeholder="Il tuo username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className={signupStyles.inputGroup}>
                    <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}
                    >
                        <label htmlFor="password" className={signupStyles.label}>
                            Password*
                        </label>
                        {onSwitchToForgot && (
                            <button
                                type="button"
                                className={signupStyles.forgotLink}
                                onClick={onSwitchToForgot}
                            >
                                Password dimenticata?
                            </button>
                        )}
                    </div>
                    <input
                        type="password"
                        id="password"
                        className={signupStyles.inputField}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                {error && (
                    <div className={signupStyles.errorMessage}>
                        {error}
                    </div>
                )}

                {showResend && (
                    <div className={authStyles.resendBox}>
                        <p>Non hai ricevuto l&apos;email di verifica?</p>
                        <input
                            type="email"
                            className={signupStyles.inputField}
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
                    className={signupStyles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? 'Accesso...' : 'Accedi'}
                </button>
            </form>

            <OAuthButtons onLoginSuccess={handleLoginSuccess} embedded />
        </div>
    );
};

export default LoginForm;