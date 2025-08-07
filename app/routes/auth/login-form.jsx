import {useState} from 'react';
import styles from '~/styles/auth.module.css';
import {Link, useNavigate} from "react-router-dom";

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const LoginForm = () => {
    const [credentials, setCredentials] = useState({username: '', password: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const {id, value} = e.target;
        setCredentials(prev => ({...prev, [id]: value}));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleLoginSuccess = (userData, authToken) => {
        try {
            // Store authentication data consistently
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Check for pending invitation
            const pendingInvitation = localStorage.getItem('pendingInvitation');

            if (pendingInvitation) {
                try {
                    const {username, groupName} = JSON.parse(pendingInvitation);
                    navigate(`/invitation?username=${encodeURIComponent(username)}&groupName=${encodeURIComponent(groupName)}`);
                } catch (error) {
                    console.error('Error parsing pending invitation:', error);
                    localStorage.removeItem('pendingInvitation');
                    navigate('/home');
                }
            } else {
                navigate('/home');
            }
        } catch (error) {
            console.error('Error handling login success:', error);
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(credentials),
                credentials: 'include',
            });

            if (!response.ok) {
                switch (response.status) {
                    case 401:
                        throw new Error('Login non riuscito. Controlla le credenziali.');
                    case 404:
                        throw new Error('Login non riuscito. Controlla le credenziali.');
                    default:
                        throw new Error('Errore sconosciuto. Riprova più tardi.');
                }
            }

            const {token, username, email} = await response.json();

            // Create consistent user data object
            const userData = {
                username,
                email
            };

            // Store email separately if needed for backwards compatibility
            localStorage.setItem('email', JSON.stringify(email));

            // Use the consolidated login success handler
            handleLoginSuccess(userData, token);

        } catch (error) {
            console.error('Errore login:', error);
            setError(error.message || 'Errore di rete. Riprova.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <img src="/pagaTu.png" alt="Logo" className={styles.pagatu_image}/>
            <div className={styles.loginForm}>
                <h2 className={styles.title}>Accedi al tuo account</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}>Username</label>
                        <input
                            type="text"
                            id="username"
                            className={styles.inputField}
                            placeholder="Il tuo username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <Link to="/forgotPassword" className={styles.forgotPassword}>Password dimenticata?</Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            className={styles.inputField}
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className={styles.errorMessageModal}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Accesso...' : 'Accedi'}
                    </button>
                    <div className={styles.signupLink}>
                        Non hai un account?
                        <Link to="/signup">Registrati</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;