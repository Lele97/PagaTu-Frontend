import styles from "~/styles/signup.module.css";
import {useEffect, useState, useRef} from "react";
import {useNavigate, Link} from "react-router-dom";

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const SignupForm = () => {

    const [registration, setRegistration] = useState({
        username: '',
        password: '',
        email: '',
        dateOfBirth: '',
        firstName: '',
        lastName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const container = document.querySelector('.container');
        if (showDatePickerModal) {
            container?.classList.add('modal-active');
            document.body.style.overflow = 'hidden';
        } else {
            container?.classList.remove('modal-active');
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            container?.classList.remove('modal-active');
        };
    }, [showDatePickerModal]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 1000);

            // Cleanup function to clear timeout if component unmounts or error changes
            return () => clearTimeout(timer);
        }
    }, [error])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
        // Add arrow key navigation logic here
    };

    const CustomSelect = ({value, options, onChange, visibleItems = 8, className = ""}) => {
        const [isOpen, setIsOpen] = useState(false);
        const selectRef = useRef(null);
        const optionsRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (e) => {
                if (selectRef.current && !selectRef.current.contains(e.target)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        useEffect(() => {
            if (isOpen && selectRef.current && optionsRef.current) {
                const selectRect = selectRef.current.getBoundingClientRect();
                let topPosition = selectRect.bottom;
                const bottomSpace = window.innerHeight - selectRect.bottom;

                // If not enough space below, show above
                if (bottomSpace < 320 && selectRect.top > 320) {
                    topPosition = selectRect.top - 320;
                }

                optionsRef.current.style.top = `${topPosition}px`;
                optionsRef.current.style.left = `${selectRect.left}px`;
                optionsRef.current.style.width = `${selectRect.width}px`;
            }
        }, [isOpen]);

        const selectedOption = options.find(opt => opt.value === value) || options[0];

        return (
            <div className={`${styles.customSelectContainer} ${className}`} ref={selectRef}>
                <div
                    className={styles.customSelectHeader}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{selectedOption?.label}</span>
                    <span className={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
                </div>
                {isOpen && (
                    <div
                        ref={optionsRef}
                        className={`${styles.customSelectOptions} ${isOpen ? styles.open : ''}`}
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`${styles.customSelectOption} ${value === option.value ? styles.selectedOption : ""}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const handleChange = (e) => {
        const {id, value} = e.target;
        setRegistration(prev => ({...prev, [id]: value}));
    };

    const handleDateSelect = (date) => {
        setRegistration(prev => ({...prev, dateOfBirth: date}));
        setShowDatePickerModal(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return (
            <div className={styles.PlaceholderDiv}>
                <p className={styles.PlaceholderText}>DD/MONTH/YYYY</p>
                <i className="bi bi-calendar2"></i>
            </div>);
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const generateCalendar = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const years = [];
        for (let year = currentYear; year >= 1940; year--) {
            years.push({value: year, label: year});
        }
        const months = [
            {value: 0, label: "Gennaio"},
            {value: 1, label: "Febbraio"},
            {value: 2, label: "Marzo"},
            {value: 3, label: "Aprile"},
            {value: 4, label: "Maggio"},
            {value: 5, label: "Giugno"},
            {value: 6, label: "Luglio"},
            {value: 7, label: "Agosto"},
            {value: 8, label: "Settembre"},
            {value: 9, label: "Ottobre"},
            {value: 10, label: "Novembre"},
            {value: 11, label: "Dicembre"}
        ];
        return {years, months};
    };

    const handleModalOverlayClick = () => {
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const datePikerOpenModal = () => {
        setShowDatePickerModal(true);
    };

    const datePikerCloseModal = () => {
        setShowDatePickerModal(false);
    }

    const checkValidEmail = (email) => {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        if (!checkValidEmail(registration.email)) {
            setError("Email non valida")
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${NGROK_SERVER_URL}/api/auth/register`, {
                method: 'POST',
                body: JSON.stringify(registration),
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
            });

            let data = null;
            try {
                // Prova a leggere il body in JSON
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                if (response.status === 409) {
                    switch (data.message) {
                        case 'Email already exists':
                            setError("Un'utenza con questa email è già presente nel sistema.");
                            break;
                        case 'Username already exists':
                            setError("Un'utenza con questo username è già presente nel sistema.");
                            break;
                        default:
                            setError("Registrazione fallita.");
                    }
                } else {
                    setError("Registrazione fallita.");
                }
                return; // Evita di proseguire
            }

            setSuccessMessage("Registrazione Effettuata")
            navigate('/');

        } catch (error) {
            setError("Errore di registrazione. " + error)
        } finally {
            setIsLoading(false);
        }
    }

    const DatePickerModal = () => {
        const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 25);
        const [selectedMonth, setSelectedMonth] = useState(0);
        const [selectedDay, setSelectedDay] = useState(1);

        const {years, months} = generateCalendar();
        const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
        const days = Array.from({length: daysInMonth}, (_, i) => ({
            value: i + 1,
            label: i + 1
        }));

        const handleConfirm = () => {
            const date = new Date(selectedYear, selectedMonth, selectedDay + 1);
            const formattedDate = date.toISOString().split("T")[0];
            handleDateSelect(formattedDate);
        };

        return (
            <div className={styles.modalContainer} onClick={(e) => handleModalOverlayClick(e, datePikerCloseModal)}>
                <div className={styles.modalContent}>
                    <div className={styles.selectContainer}>
                        <div className={styles.daySelect}>
                            <label className={styles.labelStyle}>Giorno</label>
                            <CustomSelect
                                value={selectedDay}
                                options={days}
                                onChange={setSelectedDay}
                                className={styles.customSelect}
                                visibleItems={8}
                            />
                        </div>

                        <div className={styles.monthSelect}>
                            <label className={styles.labelStyle}>Mese</label>
                            <CustomSelect
                                value={selectedMonth}
                                options={months}
                                onChange={setSelectedMonth}
                                className={styles.customSelect}
                                visibleItems={8}
                            />
                        </div>

                        <div className={styles.yearSelect}>
                            <label className={styles.labelStyle}>Anno</label>
                            <CustomSelect
                                value={selectedYear}
                                options={years}
                                onChange={setSelectedYear}
                                className={styles.customSelect}
                                visibleItems={8}
                            />
                        </div>
                    </div>

                    <div className={styles.buttonContainer}>
                        <button
                            onClick={datePikerCloseModal}
                            className={`${styles.buttonStyle} ${styles.cancelButton}`}>
                            Annulla
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`${styles.buttonStyle} ${styles.confirmButton}`}>
                            Conferma
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>

            <div className={styles['header-container']}>
                <img src="/pagaTu.png" alt="Logo" className={styles.logo}/>
                <div className={styles.appTitle}>
                    <h1 className={styles.appTitlecolor}>P</h1>
                    <h1 className={styles.appTitlecolor2}>a</h1>
                    <h1 className={styles.appTitlecolor}>g</h1>
                    <h1 className={styles.appTitlecolor2}>a</h1>
                    <h1 className={styles.appTitlecolor}>T</h1>
                    <h1 className={styles.appTitlecolor2}>u</h1>
                </div>
            </div>



            <div className={styles.signupForm}>
                <h2 className={styles.title}>Crea un Account</h2>

                <form onSubmit={handleSubmit}>
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
                        <label htmlFor="dateOfBirth" className={styles.label}>Data di nascita</label>
                        <button
                            type="button"
                            id="dateOfBirth"
                            className={`${styles.inputField} ${styles.buttonInputField}`}
                            onClick={datePikerOpenModal}>
                            {formatDate(registration.dateOfBirth)}
                        </button>
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
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Registrazione in corso...' : 'Registrati'}
                    </button>

                    <div className={styles.loginLink}>
                        Hai già un account?
                        <Link to="/login">Accedi</Link>
                    </div>
                </form>
            </div>

            {showDatePickerModal && <DatePickerModal/>}
        </div>
    );
};

export default SignupForm;