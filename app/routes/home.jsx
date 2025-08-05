import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/home.module.css';
import Header from '../view/header.jsx';

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
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

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

                const parsedUser = userData ? JSON.parse(userData) : null;
                const username =
                    typeof parsedUser === 'object'
                        ? parsedUser?.username || parsedUser?.name || parsedUser?.email
                        : parsedUser;


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

    useEffect(() => {
        const container = document.querySelector('.container');
        if (showAddGroupModal) {
            container?.classList.add('modal-active');
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            container?.classList.remove('modal-active');
            // Restore body scroll when modal is closed
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to ensure scroll is restored when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
            container?.classList.remove('modal-active');
        };
    }, [showAddGroupModal]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 1000);

            // Cleanup function to clear timeout if component unmounts or error changes
            return () => clearTimeout(timer);
        }
    }, [error])

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

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleGroupSelect = (groupName) => {
        console.log('Selected group name:', groupName);

        // More robust group finding
        const gruppo = groups.find(g =>
            g.name === groupName ||
            g.groupName === groupName ||
            g.id?.toString() === groupName?.toString()
        );

        if (gruppo) {
            // Ensure consistent data structure
            const normalizedGroup = {
                id: gruppo.id,
                name: gruppo.name || gruppo.groupName,
                groupName: gruppo.name || gruppo.groupName,
                ...gruppo
            };

            try {
                localStorage.setItem('group', JSON.stringify(normalizedGroup));
                setSelectedGroup(groupName);
                navigate('/group');
            } catch (error) {
                console.error('Failed to save group data:', error);
                // Handle localStorage failure
            }
        } else {
            console.error('Group not found:', groupName);
            // Show user-friendly error message
        }
    };

    const getGroupsByUser = async (username) => {

        setTimeout(() => {
            console.log("wait.....");
        }, 30000);
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.error('No auth token found');
            navigate('/login');
            return;
        }

        try {
            setGroupsLoading(true);
            setGroupsError(null);

            setTimeout(() => {
                console.log("wait.....");
            }, 30000);

            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/groupiii/get/${username}`, {
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
                logout();
            } else if (response.status === 403) {
                setGroupsError("Not authorized to view these groups");
            } else {
                const errorText = await response.text();
                setGroupsError("Errore nel recupero dei gruppi");
            }
        } catch (error) {
            setGroupsError('Connection error');
        } finally {
            setGroupsLoading(true);
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

            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/ultimiii/pagamenti/${username}`, {
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

            if (!response.ok) {
                switch (response.status) {
                    case 401:
                        console.error('Unauthorized - invalid token');
                        logout();
                        break;
                    case 403:
                        console.error('Forbidden - not authorized to access these payments');
                        setPaymentsError("Non autorizzato ad accedere a questi pagamenti");
                        break;
                    default:
                        const errorText = await response.text();
                        console.error('Error fetching payments:', response.status, errorText);
                        setPaymentsError("Errore nel recupero dei pagamenti");
                        break;
                }
            }

            if (response.status === 204) {
                // Handle no content response
                console.log('No payments found for user');
                setPagamentis([]);
                return;
            }

            const data = await response.json();
            console.log('Payments data received:', data);
            setPagamentis(Array.isArray(data) ? data : []);

        } catch (error) {
            console.error('Error in fetch call:', error);
            setPaymentsError("Errore nel recupero dei pagamenti");
        } finally {
            setPaymentsLoading(false);
        }
    };

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

    const LoadingSpinner = ({message}) => (
        <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span>{message}</span>
        </div>
    );

    const confirmCreateGroup = async (e) => {
        e.preventDefault()
        setIsSubmitting(true);
        setError(null);
        setSuccess('')

        try {

            console.log('Creating new group.....');

            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No token provided");
                return;
            }

            // Validate input fields
            if (!name.trim()) {
                setError("Group name is required");
                return;
            }

            if (name.trim().length < 2) {
                setError("Group name must be at least 2 characters long");
                return;
            }

            try {

                const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/group`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim(),
                    })
                })

                if (!response.ok) {
                    if (response.status === 400) {
                        setError("Gruppo già esistente");
                        return;
                    } else {
                        setError("Problema durante la creazione del gruppo  ");
                        return;
                    }
                }

                setSuccess("Gruppo creato con successo")

                setTimeout(() => {
                    setShowAddGroupModal(false);
                }, 2000);

                await getGroupsByUser(user)

            } catch (err) {
                setError(err);
                console.log(err);
            }

        } catch (networkError) {
            console.error('Network error creating group:', networkError);

            // Handle different types of network errors
            if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
                setError('Network error. Please check your internet connection and try again.');
            } else if (networkError.name === 'AbortError') {
                setError('Request was cancelled. Please try again.');
            } else {
                setError('Connection error. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleModalOverlayClick = () => {
    };

    const ErrorMessage = ({message, onRetry}) => (
        <div className={styles.errorMessage} >
            <div className={styles.errorText}>{message}</div>
            <button onClick={onRetry} className={styles.retryButton}>
                Riprova <i className="fa-solid fa-repeat"></i>
            </button>
        </div>
    );

    const addGroup = () => {
        setShowAddGroupModal(true);
        setError(false);
        setSuccess('')
    }

    const AddGroupModal = () => (

        <div
            className={styles.modalOverlay}
            onClick={(e) => handleModalOverlayClick(e, closeAddGroupModal)}>

            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}>

                <h2>Crea un nuovo gruppo</h2>
                <form onSubmit={confirmCreateGroup}>

                    <div className={styles.formGroup}>
                        <label htmlFor="nome">Nome del gruppo</label>
                        <input
                            type="text"
                            id="nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={styles.formInput}
                            placeholder="Inserisci un nome per il gruppo..."
                            autoFocus
                        />

                        <label htmlFor="descrizione">Descrizione</label>
                        <input
                            type="text"
                            id="descrizione"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.formInput}
                            placeholder="Inserisci una breve descrizione..."
                            autoFocus
                        />
                    </div>

                    {error && <div className={styles.errorMessageModal}>{error}</div>}
                    {success && <div className={styles.successMessage}>{success}</div>}

                    <div>
                        <button
                            type="button"
                            onClick={closeAddGroupModal}
                            className={`${styles.groupButton} ${styles.cancelButton}`}
                            disabled={isSubmitting}>
                            Annulla
                        </button>
                        <button
                            type="submit"
                            className={`${styles.groupButton} ${styles.submitButton}`}
                            disabled={isSubmitting}>
                            {isSubmitting ? 'Registrando il pagamento..' : 'Registra pagamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

    const closeAddGroupModal = () => {
        setShowAddGroupModal(false);
        setSuccess('')
        setError(false);
    }

    return (
        <div className={styles.homePage}>
            <div className={styles.container}>

                <Header user={user} logout={logout}/>

                {/* Main Content */}
                <main className={styles.main}>
                    <div className={styles.heroSection}>
                        <h1 className={styles.heroTitle}>Il caffè che unisce il team</h1>
                    </div>


                    <button onClick={addGroup} className={styles.groupButton}><i className="bi bi-plus"></i><i
                        className="bi bi-people-fill"></i> Crea un nuovo gruppo
                    </button>


                    {/* Group Selection Section */}
                    <section className={styles.groupSection}>
                        <h2 className={styles.sectionTitle}><i className="bi bi-people-fill"></i> I tuoi gruppi</h2>

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
                                            onClick={() => handleGroupSelect(group.name)}>
                                            <i className="fa-solid fa-user-group"></i>
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
                        <h2 className={styles.sectionTitle}><i className="bi bi-credit-card-fill"></i> I tuoi ultimi
                            pagamenti</h2>

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

                {showAddGroupModal && <AddGroupModal/>}
            </div>
        </div>
    );
};

export default Home;