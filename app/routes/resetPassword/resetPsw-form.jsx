import {useEffect, useState} from "react";
import styles from "~/styles/resetPsw.module.css";
import {useNavigate, useSearchParams} from "react-router-dom";

const NGROK_SERVER_URL = import.meta.env.VITE_GETAWAY_SERVER_URL;

const ResetPswForm = () => {

    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repetpassword, setRepetpassword] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const checkTokenExpired = async () => {
            const token = searchParams.get("key");
            setToken(token);

            if (!token) {
                navigate("/errore-token", {
                    replace: true,
                    state: {errorMessage: "Token mancante"}
                });
                return;
            }

            try {
                const response = await fetch(
                    `${NGROK_SERVER_URL}/api/auth/reset-password?key=${encodeURIComponent(token)}`,
                    {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                            "ngrok-skip-browser-warning": "true",
                        },
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        navigate("/errore-token", {
                            replace: true,
                            state: {errorMessage: "Token invalido o scaduto"}
                        });
                        return;
                    }

                    if (response.status === 503) {
                        navigate("/errore-token", {
                            replace: true,
                            state: {errorMessage: "Errore di connessione al server."}
                        });
                        return;
                    }
                }

                const contentType = response.headers.get("content-type");

                if (!contentType || !contentType.includes("application/json")) {
                    navigate("/errore-token", {
                        replace: true,
                        state: {errorMessage: "Risposta non valida dal server"}
                    });
                    return;
                }

                const data = await response.json();

                if (!data?.valid) {
                    navigate("/errore-token", {
                        replace: true,
                        state: {errorMessage: "Token non valido"}
                    });
                    return;
                }

                localStorage.setItem("email", data.email);
                setEmail(data.email);

            } catch (err) {
                navigate("/errore-token", {
                    replace: true,
                    state: {errorMessage: "Errore di connessione al server"}
                });
            }
        };

        checkTokenExpired();
    }, [searchParams, navigate]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const validatePassword = (password) => {
        if (password.length < 6) return "La password deve essere di almeno 6 caratteri";
        if (!/[a-z]/.test(password)) return "La password deve contenere almeno una lettera minuscola";
        if (!/[A-Z]/.test(password)) return "La password deve contenere almeno una lettera maiuscola";
        if (!/[0-9]/.test(password)) return "La password deve contenere almeno un numero";
        if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
            return "La password deve contenere almeno un carattere speciale";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        const userEmail = localStorage.getItem("email");
        setEmail(userEmail);

        if (password !== repetpassword) {
            setError("Le password non corrispondono");
            return;
        }

        const validationError = validatePassword(password);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            const response = await fetch(`${NGROK_SERVER_URL}/api/auth/resetPassword`, {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Reset-Token': token
                },
                body: JSON.stringify({email: email, password: password}),
            })

            if (!response.ok) {
                switch (response.status) {
                    case 401:
                    case 400:
                        setError("Errore durante il reset della password. Riprova più tardi");
                        break;
                    default:
                        setError("Errore durante il reset della password. Riprova più tardi");
                        break;
                }
            }

            setSuccess("Password resettata con successo");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError("Errore durante il reset della password, " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles["header-container"]}>
                <img src="/pagaTu.png" alt="Logo" className={styles.logo}/>
                <div className={styles.appTitle}>
                    <h1 className={styles.appTitlecolor}>P</h1>
                    <h1 className={styles.appTitlecolor2}>a</h1>
                    <h1 className={styles.appTitlecolor}>g</h1>
                    <h1 className={styles.appTitlecolor2}>a</h1>
                    <br/>
                    <h1 className={styles.appTitlecolor}>T</h1>
                    <h1 className={styles.appTitlecolor2}>u</h1>
                </div>
            </div>

            <div className={styles.resetPswForm}>
                <h2 className={styles.title}>Esegui il reset della password</h2>

                <div className={styles.rules}>
                    <p className={styles.rule_p}>La password deve:</p>
                    <ul className={styles.rule_ul}>
                        <li>essere di almeno 6 caratteri</li>
                        <li>contenere almeno una lettera minuscola</li>
                        <li>contenere almeno una lettera maiuscola</li>
                        <li>contenere almeno un numero</li>
                        <li>contenere almeno un carattere speciale</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className={styles.inputField}
                            placeholder="Inserisci la tua nuova password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                        <label htmlFor="repetpassword" className={styles.label}>
                            Reinserisci Password
                        </label>
                        <input
                            type="password"
                            id="repetpassword"
                            className={styles.inputField}
                            placeholder="Reinserisci la tua nuova password"
                            value={repetpassword}
                            onChange={(event) => setRepetpassword(event.target.value)}
                            required
                        />
                    </div>

                    {error && <div className={styles.errorMessageModal}>{error}</div>}
                    {success && <div className={styles.successMessage}>{success}</div>}

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? "Reset in corso..." : "Reset"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPswForm;
