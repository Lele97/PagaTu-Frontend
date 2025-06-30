import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './login-form.jsx';
import styles from '~/styles/auth.module.css';

export default function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            navigate('/home');
        }
    }, [navigate]);

    return (
        <div className={styles.loginPage}>
            <LoginForm/>
        </div>
    );
}