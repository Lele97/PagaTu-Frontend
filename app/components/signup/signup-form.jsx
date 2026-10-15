import styles from "~/styles/signup.module.css";
import { useEffect, useRef, useState } from "react";
import { register } from '~/utils/apiService';
import DatePickerModal from "./modal/datePickerModal";

const SignupForm = ({ onSwitchToLogin }) => {
    const [registration, setRegistration] = useState({
        username: "",
        password: "",
        email: "",
        dateOfBirth: "",
        firstName: "",
        lastName: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");



    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleDateSelect = (date) => {
        setRegistration((prev) => ({ ...prev, dateOfBirth: date }));
        setShowDatePickerModal(false);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setRegistration((prev) => ({ ...prev, [id]: value }));
    };


    const formatDate = (dateString) => {
        if (!dateString)
            return (
                <div className={styles.PlaceholderDiv}>
                    <p className={styles.PlaceholderText}>DD/MONTH/YYYY</p>
                    <i className="fa-solid fa-calendar"></i>
                </div>
            );
        const date = new Date(dateString);
        return date.toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const datePickerOpenModal = () => {
        setShowDatePickerModal(true);
    };

    const validateUsername = (username) => {
        if (!username) return "la username è obbligatoria";
        if (username.length < 6 || username.length > 20)
            return "la username deve essere lunga tra 8 e 20 caratteri";
        if (!/^[a-zA-Z0-9_]+$/.test(username))
            return "la username può contenere solo lettere , numeri, e underscore";
        return "";
    };

    const validatePassword = (password) => {
        if (!password) return "La password è obbligatoria";
        if (password.length < 8 || password.length > 50)
            return "La password deve essere lunga tra 8 e 50 caratteri";
        if (
            !/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#&()[\]{}:;',?/*~$^+=<>-])/.test(
                password
            )
        ) {
            return "La password deve contenere almeno una cifra, una lettera minuscola, una maiuscola e un carattere speciale";
        }
        return "";
    };

    const validateEmail = (email) => {
        if (!email) return "L'email è obbligatoria";
        if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(email))
            return "Inserisci un'email valida";
        return "";
    };

    const validateDateOfBirth = (dateOfBirth) => {
        if (!dateOfBirth) return "La data di nascita è obbligatoria";

        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        if (birthDate >= today) return "La data di nascita deve essere nel passato";

        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const adjustedAge =
            monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ? age - 1
                : age;

        if (adjustedAge < 13) return "Devi avere almeno 13 anni";

        return "";
    };

    const validateFirstName = (name) => {
        if (name && name.length > 50)
            return "Il nome non può superare i 50 caratteri";
        if (name && !/^[A-Za-zÀ-ÖØ-öø-ÿ' -]*$/.test(name))
            return "Il nome contiene caratteri non validi";
        return "";
    };

    const validateLastName = (lastname) => {
        if (lastname && lastname.length > 50)
            return "Il cognome non può superare i 50 caratteri";
        if (lastname && !/^[A-Za-zÀ-ÖØ-öø-ÿ' -]*$/.test(lastname))
            return "Il cognome contiene caratteri non validi";
        return "";
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        const usernameError = validateUsername(registration.username);
        if (usernameError) {
            setError(usernameError);
            setIsLoading(false);
            return;
        }

        const passwordError = validatePassword(registration.password);
        if (passwordError) {
            setError(passwordError);
            setIsLoading(false);
            return;
        }

        const emailError = validateEmail(registration.email);
        if (emailError) {
            setError(emailError);
            setIsLoading(false);
            return;
        }

        const dobError = validateDateOfBirth(registration.dateOfBirth);
        if (dobError) {
            setError(dobError);
            setIsLoading(false);
            return;
        }

        const firstNameError = validateFirstName(registration.firstName);
        if (firstNameError) {
            setError(firstNameError);
            setIsLoading(false);
            return;
        }

        const lastNameError = validateLastName(registration.lastName);
        if (lastNameError) {
            setError(lastNameError);
            setIsLoading(false);
            return;
        }

        setError("");

        try {
            const { ok, status, body: data } = await register(registration);

            if (!ok) {
                if (status === 405) {
                    setError("Errore di connessione al server.");
                } else if (status === 409) {
                    switch (data.message) {
                        case "Email already exists":
                            setError(
                                "Un'utenza con questa email è già presente nel sistema."
                            );
                            break;
                        case "Username already exists":
                            setError(
                                "Un'utenza con questo username è già presente nel sistema."
                            );
                            break;
                        default:
                            setError("Registrazione fallita.");
                    }
                } else {
                    setError("Registrazione fallita.");
                }
                return;
            }

            setSuccessMessage("Registrazione completata! Controlla la tua email per verificare l'account prima di accedere.");

            setTimeout(() => {
                onSwitchToLogin?.();
            }, 4000);
        } catch (err) {
            setError("Errore di registrazione. " + err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const signupForm = (
        <form onSubmit={handleSubmit}>
            <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                    <label htmlFor="username" className={styles.label}>Username*</label>
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
                    <label htmlFor="email" className={styles.label}>Email*</label>
                    <input
                        type="email"
                        id="email"
                        className={styles.inputField}
                        value={registration.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                    <label htmlFor="password" className={styles.label}>Password*</label>
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
                    <label htmlFor="dateOfBirth" className={styles.label}>Data di nascita</label>
                    <button
                        type="button"
                        id="dateOfBirth"
                        className={`${styles.inputField} ${styles.buttonInputField}`}
                        onClick={datePickerOpenModal}
                    >
                        {formatDate(registration.dateOfBirth)}
                    </button>
                </div>
            </div>

            {showDatePickerModal && (
                <DatePickerModal
                    initialDate={registration.dateOfBirth}
                    onConfirm={handleDateSelect}
                    onClose={() => setShowDatePickerModal(false)}
                />
            )}
            <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                    <label htmlFor="firstName" className={styles.label}>Nome*</label>
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
                    <label htmlFor="lastName" className={styles.label}>Cognome*</label>
                    <input
                        type="text"
                        id="lastName"
                        className={styles.inputField}
                        value={registration.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
        </form>
    );

    return (
        <>
            {signupForm}
        </>
    );
};

export default SignupForm;
