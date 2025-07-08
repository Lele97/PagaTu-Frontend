import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/group.module.css';

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const Home = () => {

    const GROUPS_PER_PAGE = 6;
    const PAYMENTS_PER_PAGE = 8;
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [pagamentis, setPagamentis] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupsLoading, setGroupsLoading] = useState(true);
    const [paymentsLoading, setPaymentsLoading] = useState(true)
    const [groupsError, setGroupsError] = useState(null);
    const [paymentsError, setPaymentsError] = useState(null);
    const [currentGroupPage, setCurrentGroupPage] = useState(1);
    const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
    const navigate = useNavigate();

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Format currency function
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '€ 0,00';
        try {
            const num = parseFloat(amount);
            return new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: 'EUR'
            }).format(num);
        } catch (error) {
            return `€ ${amount}`;
        }
    };

    // Pagination helper functions
    const getPaginatedGroups = () => {
        const startIndex = (currentGroupPage - 1) * GROUPS_PER_PAGE;
        const endIndex = startIndex + GROUPS_PER_PAGE;
        return groups.slice(startIndex, endIndex);
    };

    const getPaginatedPayments = () => {
        const startIndex = (currentPaymentPage - 1) * PAYMENTS_PER_PAGE;
        const endIndex = startIndex + PAYMENTS_PER_PAGE;
        return pagamentis.slice(startIndex, endIndex);
    };

    const getTotalGroupPages = () => Math.ceil(groups.length / GROUPS_PER_PAGE);

    const getTotalPaymentPages = () => Math.ceil(pagamentis.length / PAYMENTS_PER_PAGE);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleGroupSelect = (groupName) => {
        console.log('Selected group name:', groupName);
        // Find the complete group object from the groups array
        const gruppo = groups.find(g => g.name === groupName);
        console.log('Found group object:', gruppo);

        if (gruppo) {
            setSelectedGroup(groupName);
            localStorage.setItem('group', JSON.stringify(gruppo));
            navigate(`/group`);
        } else {
            console.error('Group not found:', groupName);
        }
    };

    const getGroupsByUser = async (username) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.error('No auth token found');
            navigate('/login');
            return;
        }

        try {
            setGroupsLoading(true);
            setGroupsError(null);

            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/group/get/${username}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify({})
            });

            if (response.ok) {
                const data = await response.json();
                setGroups(Array.isArray(data) ? data : []);
                setCurrentGroupPage(1);
            } else if (response.status === 401) {
                handleLogout();
            } else if (response.status === 403) {
                setGroupsError("Not authorized to view these groups");
            } else {
                const errorText = await response.text();
                setGroupsError("Error fetching groups");
            }
        } catch (error) {
            setGroupsError('Connection error');
        } finally {
            setGroupsLoading(false);
        }
    };

    const getHistoryPayments = async (username) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.error('No auth token found');
            navigate('/login');
            return;
        }

        try {
            setPaymentsLoading(true);
            setPaymentsError(null);

            console.log('Fetching payments for username:', username);
            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/ultimi/pagamenti/${username}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify({}) // Empty body for POST request
            });

            console.log('Payments response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Payments data received:', data);
                setPagamentis(Array.isArray(data) ? data : []);
            } else if (response.status === 204) {
                // Handle no content response
                console.log('No payments found for user');
                setPagamentis([]);
            } else if (response.status === 401) {
                console.error('Unauthorized - invalid token');
                handleLogout();
            } else if (response.status === 403) {
                console.error('Forbidden - not authorized to access these payments');
                setPaymentsError("Non autorizzato ad accedere a questi pagamenti");
            } else {
                const errorText = await response.text();
                console.error('Error fetching payments:', response.status, errorText);
                setPaymentsError("Errore nel recupero dei pagamenti");
            }
        } catch (error) {
            console.error('Error in fetch call:', error);
            setPaymentsError("Errore di connessione nel recupero dei pagamenti");
        } finally {
            setPaymentsLoading(false);
        }
    };

    // Retry functions
    const retryGroups = async () => {
        if (user) {
            await getGroupsByUser(user);
        }
    };

    const retryPayments = async () => {
        if (user) {
            await getHistoryPayments(user);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            const authToken = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');

            console.log('Auth token exists:', !!authToken);
            console.log('User data:', userData);

            if (!authToken || !userData) {
                console.log('Missing auth token or user data, redirecting to login');
                navigate('/login');
                return;
            }

            try {
                // Parse user data - it might be a JSON string or just a username
                let parsedUser;
                try {
                    parsedUser = JSON.parse(userData);
                    console.log('Parsed user object:', parsedUser);
                } catch (parseError) {
                    // If parsing fails, assume it's just a username string
                    parsedUser = userData;
                    console.log('Using user data as string:', parsedUser);
                }

                // Extract username from user object or use the string directly
                const username = typeof parsedUser === 'object' ?
                    (parsedUser.username || parsedUser.name || parsedUser.email) :
                    parsedUser;

                console.log('Final username for API calls:', username);

                if (!username) {
                    console.error('No username found in user data');
                    navigate('/login');
                    return;
                }

                setUser(username);

                // Fetch data
                await Promise.all([
                    getGroupsByUser(username),
                    getHistoryPayments(username)
                ]);

            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login');
            }
        };

        initializeData();
    }, [navigate]);

    // Pagination component
    const PaginationControls = ({currentPage, totalPages, onPageChange, className}) => {
        if (totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }

        return (
            <div className={`${styles.paginationControls} ${className}`}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.paginationButton}
                >
                    ←
                </button>
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`${styles.paginationButton} ${currentPage === page ? styles.paginationButtonActive : ''}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.paginationButton}
                >
                    →
                </button>
            </div>
        );
    };

    // Loading component
    const LoadingSpinner = ({message}) => (
        <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span>{message}</span>
        </div>
    );

    // Error component
    const ErrorMessage = ({message, onRetry}) => (
        <div className={styles.errorMessage}>
            <div className={styles.errorText}>{message}</div>
            <button onClick={onRetry} className={styles.retryButton}>
                Riprova
            </button>
        </div>
    );

    return (
        <div className={styles.homePage}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.logoTitleContainer}>
                            <h1 className={styles.headerTitle}>Paga</h1>
                            <img src="/pagaTu.png" alt="Logo" className={styles.pagatu_image}/>
                            <h1 className={styles.headerTitle}>Tu</h1>
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
                        <h2 className={styles.sectionTitle}>I tuoi gruppi</h2>

                        {groupsLoading ? (
                            <LoadingSpinner message="Caricamento gruppi..."/>
                        ) : groupsError ? (
                            <ErrorMessage message={groupsError} onRetry={retryGroups}/>
                        ) : groups.length > 0 ? (
                            <>
                                <div className={styles.groupGrid}>
                                    {getPaginatedGroups().map((group, index) => (
                                        <button
                                            key={index}
                                            className={`${styles.groupButton} ${selectedGroup === group.name ? styles.groupButtonSelected : ''}`}
                                            onClick={() => handleGroupSelect(group.name)}
                                        >
                                            {group.name}
                                        </button>
                                    ))}
                                </div>
                                <PaginationControls
                                    currentPage={currentGroupPage}
                                    totalPages={getTotalGroupPages()}
                                    onPageChange={setCurrentGroupPage}
                                    className={styles.groupPagination}
                                />
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
                        <h2 className={styles.sectionTitle}>I tuoi ultimi pagamenti</h2>

                        {paymentsLoading ? (
                            <LoadingSpinner message="Caricamento pagamenti..."/>
                        ) : paymentsError ? (
                            <ErrorMessage message={paymentsError} onRetry={retryPayments}/>
                        ) : pagamentis.length > 0 ? (
                            <>
                                <div className={styles.tableContainer}>
                                    <table className={styles.table}>
                                        <thead className={styles.tableHeader}>
                                        <tr>
                                            <th className={styles.tableHeaderCell}>Data</th>
                                            <th className={styles.tableHeaderCell}>Importo</th>
                                            <th className={styles.tableHeaderCell}>Descrizione</th>
                                            <th className={styles.tableHeaderCell}>Gruppo</th>
                                        </tr>
                                        </thead>
                                        <tbody className={styles.tableBody}>
                                        {getPaginatedPayments().map((payment, index) => (
                                            <tr key={index} className={styles.tableRow}>
                                                <td className={styles.tableCell}>
                                                    {formatDate(payment.dataPagamento)}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {formatCurrency(payment.importo)}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {payment.descrizione}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {payment.groupName}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                <PaginationControls
                                    currentPage={currentPaymentPage}
                                    totalPages={getTotalPaymentPages()}
                                    onPageChange={setCurrentPaymentPage}
                                    className={styles.paymentPagination}
                                />
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