import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '~/styles/home.module.css';

const Home = () => {
    const [user, setUser] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recentPayments, setRecentPayments] = useState([
        { name: 'Marco', date: '15/05/2023', time: '09:15' },
        { name: 'Laura', date: '14/05/2023', time: '10:30' },
        { name: 'Giovanni', date: '13/05/2023', time: '08:45' },
        { name: 'Sofia', date: '12/05/2023', time: '11:20' },
        { name: 'Luca', date: '11/05/2023', time: '09:05' }
    ]);
    const navigate = useNavigate();

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

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('email');
        navigate('/login');
    };

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Caricamento...</div>
            </div>
        );
    }

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

            {/* Main Content */}
            <main className={styles.main}>
                {/* Payment Section */}
                <section className={styles.paymentSection}>
                    <h2 className={styles.sectionTitle}>Oggi vuoi offrire il caffè?</h2>
                    <div className={styles.buttonGroup}>
                        <button 
                            onClick={handlePayment} 
                            className={`${styles.payButton} ${styles.coffeeButton}`}
                            disabled={isLoading}
                        >
                            <svg className={styles.buttonIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            {isLoading ? 'Caricamento...' : 'Pago io'}
                        </button>
                        <button 
                            onClick={handleSkip} 
                            className={`${styles.skipButton} ${styles.coffeeButton}`}
                        >
                            <svg className={styles.buttonIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Oggi non riesco
                        </button>
                    </div>
                    {statusMessage && (
                        <div className={styles.statusMessage}>
                            {statusMessage}
                        </div>
                    )}
                </section>

                {/* Recent Payments Section */}
                <section className={styles.recentSection}>
                    <h2 className={styles.sectionTitle}>Ultimi generosi</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.tableHeader}>
                                <tr>
                                    <th className={styles.tableHeaderCell}>Nome</th>
                                    <th className={styles.tableHeaderCell}>Data</th>
                                    <th className={styles.tableHeaderCell}>Ora</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tableBody}>
                                {recentPayments.map((payment, index) => (
                                    <tr key={index} className={styles.tableRow}>
                                        <td className={styles.tableCell}>{payment.name}</td>
                                        <td className={styles.tableCellSecondary}>{payment.date}</td>
                                        <td className={styles.tableCellSecondary}>{payment.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <a href="#" className={styles.footerLink}>Classifica Completa</a>
                    <p className={styles.footerText}>Grazie per rendere più dolce la giornata!</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
