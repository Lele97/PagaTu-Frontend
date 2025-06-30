import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/home.module.css';

const Home = () => {


    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    /*
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recentPayments, setRecentPayments] = useState([
        { name: 'Marco', date: '15/05/2023', time: '09:15' },
        { name: 'Laura', date: '14/05/2023', time: '10:30' },
        { name: 'Giovanni', date: '13/05/2023', time: '08:45' },
        { name: 'Sofia', date: '12/05/2023', time: '11:20' },
        { name: 'Luca', date: '11/05/2023', time: '09:05' }
    ]);

    */

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('email');
        navigate('/login');
    };

    useEffect(() => {
        // Check if user is logged in
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (!authToken || !userData) {
            navigate('/login');
            return;
        }

        try {
            setUser(JSON.parse(userData));
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);
    /*
            const handlePayment = async () => {
                setIsLoading(true);
                try {
                    // Simulate API call for payment
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    setStatusMessage("Grazie! Hai registrato che oggi offrirai il caffè.");

                    // Add current user payment to the top of the list
                    const now = new Date();
                    const newPayment = {
                        name: user || 'Tu',
                        date: now.toLocaleDateString('it-IT'),
                        time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                    };

                    setRecentPayments(prev => [newPayment, ...prev.slice(0, 4)]);

                    // Clear status message after 5 seconds
                    setTimeout(() => setStatusMessage(''), 5000);

                } catch (error) {
                    console.error('Payment error:', error);
                    setStatusMessage("Errore durante la registrazione. Riprova.");
                } finally {
                    setIsLoading(false);
                }
            };

            const handleSkip = () => {
                setStatusMessage("Nessun problema! Ci vediamo la prossima volta.");
                setTimeout(() => setStatusMessage(''), 5000);
            };



            if (!user) {
                return (
                    <div class
                    Name={styles.container}>
                        <div className={styles.loading}>Caricamento...</div>
                    </div>
                );
            }
        */

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.headerTitle}>Dashboard</h1>
                    <div className={styles.userInfo}>
                        <span className={styles.welcomeText}>Ciao, {user}!</span>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Esci
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Home;
