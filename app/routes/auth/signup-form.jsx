import styles from "~/styles/signup.module.css";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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

    const handleChange = (e) => {
        const { id, value } = e.target;
        setRegistration(prev => ({ ...prev, [id]: value }));
    };

    const handleDateSelect = (date) => {
        setRegistration(prev => ({ ...prev, dateOfBirth: date }));
        setShowDatePickerModal(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Seleziona data di nascita';
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
            years.push(year);
        }
        const months = [
            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
        ];
        return { years, months };
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const datePikerOpenModal = () => {
        setShowDatePickerModal(true);
    };

    const DatePickerModal = () => {
        const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 25);
        const [selectedMonth, setSelectedMonth] = useState(0);
        const [selectedDay, setSelectedDay] = useState(1);

        const { years, months } = generateCalendar();
        const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const handleConfirm = () => {
            const date = new Date(selectedYear, selectedMonth, selectedDay);
            const formattedDate = date.toISOString().split('T')[0];
            handleDateSelect(formattedDate);
        };

        return (
            <div className={styles.modalContainer} onClick={(e) => {
                if (e.target === e.currentTarget) setShowDatePickerModal(false);
            }}>
                <div className={styles.modalContent}>
                    <h3 className={styles.modalText}>Seleziona Data di Nascita</h3>

                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className={styles.labelStyle}>Giorno</label>
                            <select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                                className={styles.selectStyle}>
                                {days.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ flex: 2 }}>
                            <label className={styles.labelStyle}>Mese</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className={styles.selectStyle}>
                                {months.map((month, index) => (
                                    <option key={index} value={index}>{month}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ flex: 1.5 }}>
                            <label className={styles.labelStyle}>Anno</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className={styles.selectStyle}>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setShowDatePickerModal(false)}
                            className={styles.buttonStyle}
                            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                            Annulla
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={styles.buttonStyle}
                            style={{
                                backgroundColor: '#8B5A3C',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(139, 90, 60, 0.2)'
                            }}>
                            Conferma
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const checkValidEmail = (email) => {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        if (!checkValidEmail(registration.email)) {
            alert('Email non valida');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${NGROK_SERVER_URL}/api/auth/register`, {
                method: 'POST',
                body: JSON.stringify(registration),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Login fallito');
            alert('Registrazione Effettuata');
            navigate('/');
        } catch (error) {
            console.error('Errore Registrazione:', error);
            alert('Registrazione fallita');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={`${styles.container} container`}>
            <img src="/pagaTu.png" alt="Logo" className={styles.pagatu_image} />

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
                            className={styles.inputField}
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

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Caricamento...' : 'Registrati'}
                    </button>

                    <div className={styles.loginLink}>
                        Hai già un account?
                        <Link to="/login">Accedi</Link>
                    </div>
                </form>
            </div>

            {showDatePickerModal && <DatePickerModal />}
        </div>
    );
};

export default SignupForm;
