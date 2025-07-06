import {useState} from 'react';
import styles from '~/styles/auth.module.css';
import {Link, useNavigate} from "react-router-dom";
const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;


const LoginForm = () => {
    const [credentials, setCredentials] = useState({username: '', password: ''});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const {id, value} = e.target;
        setCredentials(prev => ({...prev, [id]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${NGROK_SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(credentials),
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Login fallito');
                alert('Accesso fallito. Controlla le credenziali.');
                return;
            }

            const {token, username, email} = await response.json();
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(username));
            localStorage.setItem('email', JSON.stringify(email));

            navigate('/home');
        } catch (error) {
            console.error('Errore login:', error);
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
                        />
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Caricamento...' : 'Accedi'}
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

export default LoginForm
