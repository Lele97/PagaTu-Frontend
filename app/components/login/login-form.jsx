import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authStyles from '~/styles/auth.module.css';
import signupStyles from '~/styles/signup.module.css';
import { messageFromBody } from '~/utils/api';
import { login, loginWithGithub, loginWithDiscord, resendVerification } from '~/utils/apiService';
import { HOME_PATH, invitationPath, readPendingInvitation } from '~/utils/groupHelpers';
import Oauth2LoginButton from '~/components/buttons/Oauth2LoginButton';

/**
 * Rende leggibile un fallimento del login OAuth.
 *
 * Un 503 puo' arrivare da due layer diversi e la sola parola "503" non basta:
 * il fallback del gateway ha il body {"error":"Authentication Service Unavailable"},
 * mentre auth-service risponde con il suo ErrorResponse (che contiene timestamp).
 */
const describeOauthFailure = (status, body) => {
    const message = messageFromBody(body, `Login GitHub non riuscito (HTTP ${status}).`);

    if (body?.error === 'Authentication Service Unavailable') {
        const cause = body.cause ? ` Causa: ${body.cause}` : '';
        return `Gateway: il servizio di autenticazione non ha risposto (fallback del circuit breaker).${cause}`;
    }

    return message;
};

const LoginForm = ({ onSwitchToForgot }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('');
    const oauthCallbackHandled = useRef(false);
    const navigate = useNavigate();

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

    // Callback GitHub e Discord, si controlla prima il provider per vedere quale callback lanciare
    // Il code tornato dai provider e' lo stesso, non cambia nulla
    // In futuro se si aggiungera' un altro provider, si dovra' solo aggiungere un if
    //: torna su /welcome?code=... (o ?error=... si l'utente
    // nega l'accesso). Lo scambio del code lo fa il backend.
    // Il ref serve perche' in sviluppo React StrictMode monta due volte gli
    // effect: senza guardia il code verrebbe scambiato due volte
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const oauthError = params.get('error');
        const oauthErrorDescription = params.get('error_description');

        // Consumato dal click del pulsante prima di lasciare la SPA.
        const provider = sessionStorage.getItem('oauth_provider');

        if (oauthCallbackHandled.current) return;

        if (!provider || !['github', 'discord'].includes(provider)) {
            if (code || oauthError) {
                window.history.replaceState(null, '', window.location.pathname);
                setError('Provider OAuth mancante o non riconosciuto. Riprova il login.');
            }
            return;
        }

        oauthCallbackHandled.current = true;
        sessionStorage.removeItem('oauth_provider');

        // Rimuovi code/error dall'URL prima di proseguire.
        window.history.replaceState(null, '', window.location.pathname);

        if (oauthError) {
            setError(
                oauthErrorDescription ||
                `Login con ${provider === 'github' ? 'GitHub' : 'Discord'} non completato.`
            );
            return;
        }

        if (!code) {
            setError('Codice OAuth mancante.');
            return;
        }

        const redirectUri = `${window.location.origin}/welcome`;
        const loginRequest = provider === 'github'
            ? loginWithGithub(code, redirectUri)
            : loginWithDiscord(code, redirectUri);

        setIsLoading(true);

        loginRequest
            .then(({ ok, status, body }) => {
                if (!ok) {
                    console.error(`[${provider} OAuth] risposta non ok`, { status, body });
                    throw new Error(describeOauthFailure(status, body));
                }

                const { token: authToken, username, email } = body;
                handleLoginSuccess({ username, email }, authToken);
            })
            .catch((err) => {
                setError(
                    err.message ||
                    `Errore durante il login con ${provider === 'github' ? 'GitHub' : 'Discord'}.`
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

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

            <Oauth2LoginButton onLoginSuccess={handleLoginSuccess} />
        </div>
    );
};

export default LoginForm;