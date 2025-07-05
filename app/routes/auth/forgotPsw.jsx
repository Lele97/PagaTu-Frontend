import ForgotPswForm from './forgotPsw-form.jsx';
import styles from '~/styles/forgotPsw.module.css';

export default function forgotPasswordPage() {

    return (
        <div className={styles.forgotPswPage}>
        <ForgotPswForm/>
        </div>
    )
}