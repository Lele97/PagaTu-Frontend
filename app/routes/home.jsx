import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/home.module.css';
const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const Home = () => {
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [pagamentis, setPagamentis] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        console.log('Selected group:', group);
    };

    const getGroupsByUser = async (username) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/group/get/${username}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            } else {
                console.error('Errore nel recupero dei gruppi');
            }
        } catch (error) {
            console.error('Errore nella chiamata fetch:', error);
        }
    };

    const getHistoryPayments = async (username) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/ultimi/pagamenti/${username}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPagamentis(data);
            } else {
                console.error('Errore nel recupero dei pagamenti');
            }
        } catch (error) {
            console.error('Errore nella chiamata fetch:', error);
        }
    };

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (!authToken || !userData) {
            navigate('/login');
            return;
        }try {

            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            getGroupsByUser(parsedUser);
            getHistoryPayments(parsedUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className={styles.homePage}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <img src="/pagaTu.png" alt="Logo" className={styles.pagatu_image}/>
                            <h1 className={styles.headerTitle}>PagaTu Dashboard</h1>
                        </div>
                        <div className={styles.userInfo}>
                            <div className={styles.avatar}>
                                <div className={styles.head}></div>
                                <div className={styles.body}></div>
                            </div>
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
                        {groups.length > 0 ? (
                            <>
                                <h2 className={styles.sectionTitle}>I tuoi gruppi</h2>
                                <div className={styles.groupGrid}>
                                    {groups.map((group, index) => (
                                        <button
                                            key={index}
                                            className={`${styles.groupButton} ${selectedGroup === group.name ? styles.groupButtonSelected : ''}`}
                                            onClick={() => handleGroupSelect(group.name)}
                                        >
                                            {group.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className={styles.textEmpty}>
                                Non fai parte di nessun gruppo
                            </div>
                        )}
                    </section>

                    <div className={styles.separator}></div>

                    {/* Payment History Section */}
                    <section className={styles.recentSection}>
                        {pagamentis.length > 0 ? (
                            <>
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
                                        {pagamentis.map((payment, index) => (
                                            <tr key={index} className={styles.tableRow}>
                                                <td className={styles.tableCell}>{payment.name}</td>
                                                <td className={styles.tableCellSecondary}>{payment.date}</td>
                                                <td className={styles.tableCellSecondary}>{payment.time}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className={styles.textEmpty}>
                                Nessun pagamento trovato
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Home;
