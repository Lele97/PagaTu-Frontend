import {useEffect, useState} from 'react';
import styles from '~/styles/resetPsw.module.css';
import {Link, useNavigate} from "react-router-dom";

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;


const ResetPswForm = () => {

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [repetpassword, setRepetpassword] = useState('');

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 1000);

            // Cleanup function to clear timeout if component unmounts or error changes
            return () => clearTimeout(timer);
        }
    }, [error]);

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 6) {
            errors.push('La password deve essere di almeno 6 caratteri');

           return errors;
        }
        if (!/[a-z]/.test(password)) {
            errors.push('La password deve contenere almeno una lettera minuscola');
            return errors;
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('La password deve contenere almeno una lettera maiuscola');
            return errors;
        }
        if (!/[0-9]/.test(password)) {
            errors.push('La password deve contenere almeno un numero');
            return errors;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('La password deve contenere almeno un carattere speciale');
            return errors;
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmail(localStorage.getItem('email'));


        console.log(email);

        // Check if passwords match
        if (password !== repetpassword) {
            setError('Le password non corrispondono');
            return;
        }

        // Validate password strength
        const errors = validatePassword(password);
        if (errors.length > 0) {
            setError(errors);
            return;
        }

        // Clear any previous errors
        setError(null);
        setIsLoading(true);

        try {
            // Here you would typically make your API call to reset the password
            // await resetPasswordAPI(email, password);

            setSuccess('Password resettata con successo!');
            // Redirect to login after 2 seconds
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError('Errore durante il reset della password: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }

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

            <div className={styles.resetPswForm}>
                <h2 className={styles.title}>Esegui il reset della password</h2>

                <div className={styles.rules}>
                    <p className={styles.rule_p}>La password deve:</p>
                    <ul className={styles.rule_ul} style={{}}>
                        <li>essere di almeno 6 caratteri</li>
                        <li>contenere almeno una lettera minuscola</li>
                        <li>contenere almeno una lettera maiuscola</li>
                        <li>contenere almeno un numero</li>
                        <li>contenere almeno un carattere speciale</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.inputField}
                            placeholder="Inserisci la tua nuova password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            required
                        />
                        <label htmlFor="repetpassword" className={styles.label}>Reinserisci Password</label>
                        <input
                            type="password"
                            id="repetpassword"
                            className={styles.inputField}
                            placeholder="Reinserisci la tua nuova password"
                            value={repetpassword}
                            onChange={event => setRepetpassword(event.target.value)}
                            required
                        />
                    </div>

                    {error && <div className={styles.errorMessageModal}>{error}</div>}
                    {success && <div className={styles.successMessage}>{success}</div>}

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Reset in corso...' : 'Reset'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPswForm;