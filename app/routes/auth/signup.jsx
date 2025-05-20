import SignupForm from "./signup-form.jsx";
import styles from "~/styles/signup.module.css";

const SignupPage = () => {
    return (
        <div className={styles.signupPage}>
            <SignupForm/>
        </div>
    );
}

export default SignupPage;