import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/auth.module.css';

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
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(credentials),
            });

            if (!response.ok) throw new Error('Login fallito');

            const {token, user} = await response.json();
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard');
        } catch (error) {
            console.error('Errore login:', error);
            alert('Login fallito. Controlla le credenziali.');
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
                            <a href="#" className={styles.forgotPassword}>Password dimenticata?</a>
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
                        <a href="/signup">Registrati</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm
