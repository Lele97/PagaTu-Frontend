import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/home.module.css';

const Home = () => {
    const [user, setUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const navigate = useNavigate();

    const groups = ["gruppo 1", "gruppo 2", "gruppo 3", "gruppo 4", "gruppo 5", "gruppo 6", "gruppo 1"];
    const historyPayment = [
        {name: 'Marco', date: '15/05/2023', time: '09:15'},
        {name: 'Laura', date: '14/05/2023', time: '10:30'},
        {name: 'Giovanni', date: '13/05/2023', time: '08:45'},
        {name: 'Sofia', date: '12/05/2023', time: '11:20'},
        {name: 'Luca', date: '11/05/2023', time: '09:05'}
    ];

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('email');
        navigate('/login');
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        // Here you can add navigation or other logic when a group is selected
        console.log('Selected group:', group);
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
                <div className={styles.heroSection}>
                    <h1 className={styles.heroTitle}>Il caffè che unisce il team</h1>
                </div>

                {/* Group Selection Section */}
                <section className={styles.groupSection}>
                    <h2 className={styles.sectionTitle}>I tuoi gruppi</h2>
                    <div className={styles.groupGrid}>
                        {groups.map((group, index) => (
                            <button
                                key={index}
                                className={`${styles.groupButton} ${selectedGroup === group ? styles.groupButtonSelected : ''}`}
                                onClick={() => handleGroupSelect(group)}>
                                {group}
                            </button>
                        ))}
                    </div>
                </section>

                <div className={styles.separator}></div>

                {/* Payment History Section */}
                <section className={styles.recentSection}>
                    <h2 className={styles.sectionTitle}>I tuoi ultimi pagamenti</h2>

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
                            {historyPayment.map((payment, index) => (
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
        </div>
    );
};

export default Home;