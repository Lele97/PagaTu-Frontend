import styles from "~/styles/signup.module.css";
import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";

const SignupForm = () => {

    const [registration, setRegistration] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const {id, value} = e.target;
        setRegistration(prev => ({...prev, [id]: value}));
    };

    async function hanldeSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        if (!checkValidEmail(registration.email)) {
            alert('Email non valida');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('https://14f7-83-225-20-70.ngrok-free.app/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(registration),
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Login fallito');
            alert('Registrazione Effettuata');
            navigate('/');
        } catch (error) {
            console.error('Errore Registrazione:', error);
            alert('Registrazione fallita');
        } finally {
            setIsLoading(false)
        }
    }

    function checkValidEmail(email) {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    }

    return (
        <div className={styles.container}>

            <img src="/pagaTu.png" alt="Logo" className={styles.pagatu_image}/>

            <div className={styles.signupForm}>

                <h2 className={styles.title}>Crea un Account</h2>

                <form onSubmit={hanldeSubmit}>

                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}>Username</label>
                        <input
                            type="text"
                            id="username"
                            className={styles.inputField}
                            value={registration.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.inputField}
                            value={registration.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            className={styles.inputField}
                            value={registration.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="firstName" className={styles.label}>Nome</label>
                        <input
                            type="text"
                            id="firstName"
                            className={styles.inputField}
                            value={registration.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="lastName" className={styles.label}>Cognome</label>
                        <input
                            type="text"
                            id="lastName"
                            className={styles.inputField}
                            value={registration.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Caricamento...' : 'Registrati'}
                    </button>
                    <div className={styles.loginLink}>
                        Hai già un account?
                        <Link to="/login">Accedi</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignupForm;