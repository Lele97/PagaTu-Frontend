import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import styles from '~/styles/auth.module.css';

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => setError(''), 1000);
        return () => clearTimeout(timer);
    }, [error]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setCredentials(prev => ({ ...prev, [id]: value }));
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
            const { username: invitedUser, groupName } = JSON.parse(pendingInvitation);
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
            const response = await fetch(`${NGROK_SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorMsg = response.status === 401 || response.status === 404
                    ? 'Login non riuscito. Controlla le credenziali.'
                    : 'Errore di connessione al server.';
                throw new Error(errorMsg);
            }

            const { token, username, email } = await response.json();
            handleLoginSuccess({ username, email }, token);
        } catch (err) {
            setError("Errore di connessione al server.");
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

            <div className={styles.formContainer}>
                <h2 className={styles.title}>Accedi al tuo account</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}>
                            Username
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
                                Password
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
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

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
            </div>
        </div>
    );
};

export default LoginForm;