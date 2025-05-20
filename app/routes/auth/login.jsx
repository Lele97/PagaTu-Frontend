import LoginForm from './login-form.jsx';
import styles from '~/styles/auth.module.css';

export default function LoginPage() {
    return (
        <div className={styles.loginPage}>
            <LoginForm/>
        </div>
    );
}