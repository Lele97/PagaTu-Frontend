import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/home.module.css';
import Header from '../../components/header.jsx';

const NGROK_SERVER_URL = import.meta.env.VITE_GETAWAY_SERVER_URL;

const AddGroupModal = ({
                           payload,
                           handleChangeName,
                           handleChangeDescription,
                           confirmCreateGroup,
                           closeAddGroupModal,
                           error,
                           success,
                           isSubmitting
                       }) => (
    <div className={styles.modalOverlay}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Crea un nuovo gruppo</h2>
            <form onSubmit={confirmCreateGroup}>
                <div className={styles.formGroup}>
                    <label htmlFor="nome">Nome</label>
                    <input
                        type="text"
                        id="nome"
                        value={payload.name}
                        onChange={handleChangeName}
                        required
                        className={styles.formInput}
                        placeholder="Inserisci un nome per il gruppo..."
                        autoFocus
                    />

                    <label htmlFor="descrizione">Descrizione</label>
                    <input
                        type="text"
                        id="descrizione"
                        value={payload.description}
                        onChange={handleChangeDescription}
                        className={styles.formInput}
                        placeholder="Inserisci una breve descrizione..."
                    />
                </div>

                {error && <div className={styles.errorMessageModal}>{error}</div>}
                {success && <div className={styles.successMessage}>{success}</div>}

                <div>
                    <button
                        type="button"
                        onClick={closeAddGroupModal}
                        className={`${styles.groupButton} ${styles.cancelButton}`}
                        disabled={isSubmitting}
                    >
                        Annulla
                    </button>
                    <button
                        type="submit"
                        className={`${styles.groupButton} ${styles.submitButton}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creando il gruppo..." : "Crea gruppo"}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

const Home = () => {

    const initialPayload = {name: '', description: ''};
    const [payload, setPayload] = useState(initialPayload);
    const GROUPS_PER_PAGE = 6;
    const PAYMENTS_PER_PAGE = 4;
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [pagamentis, setPagamentis] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupsLoading, setGroupsLoading] = useState(true);
    const [paymentsLoading, setPaymentsLoading] = useState(true);
    const [groupsError, setGroupsError] = useState(null);
    const [paymentsError, setPaymentsError] = useState(null);
    const [currentGroupPage, setCurrentGroupPage] = useState(1);
    const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeData = async () => {
            const authToken = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');
            if (!authToken || !userData) {
                navigate('/login');
                return;
            }
            try {
                const parsedUser = JSON.parse(userData);
                const username = parsedUser?.username || parsedUser?.name || parsedUser?.email;
                if (!username) {
                    navigate('/login');
                    return;
                }
                setUser(username);
                await Promise.all([getGroupsByUser(username), getHistoryPayments(username)]);
            } catch {
                navigate('/login');
            }
        };
        initializeData();
    }, [navigate]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 1000);

            // Cleanup function to clear timeout if component unmounts or error changes
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        document.body.style.overflow = showAddGroupModal ? "hidden" : "unset";
    }, [showAddGroupModal]);

    const handleChangeName = useCallback((e) => {
        setPayload(prev => ({...prev, name: e.target.value}));
        if (error) setError(null);
    }, [error]);

    const handleChangeDescription = useCallback((e) => {
        setPayload(prev => ({...prev, description: e.target.value}));
        if (error) setError(null);
    }, [error]);

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const confirmCreateGroup = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("No token provided");
                return;
            }
            if (!payload.name.trim()) {
                setError("Il nome del gruppo non può essere vuoto");
                return;
            }
            if (payload.name.trim().length < 6) {
                setError("Il nome del gruppo deve avere minimo 6 caratteri");
                return;
            }

            if (!/^[a-zA-Z0-9_]+$/.test(payload.name.trim())) {
                setError("il nome del gruppo può contenere solo lettere , numeri, e underscore");
                return;
            }

            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/group`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: payload.name.trim(),
                    description: payload.description.trim(),
                })
            });
            if (!response.ok) {
                setError(response.status === 400 ? "Gruppo già esistente" : "Problema durante la creazione del gruppo");
                return;
            }
            setSuccess("Gruppo creato con successo");
            setPayload(initialPayload);

            setTimeout(() => {
                setShowAddGroupModal(false);
            }, 3000);
            await getGroupsByUser(user);
        } catch (err) {
            setError(err.message || "Errore durante la creazione");
        } finally {
            setIsSubmitting(false);
        }
    };

    const addGroup = () => {
        setShowAddGroupModal(true);
        setError(null);
        setSuccess('');
    };

    const closeAddGroupModal = useCallback(() => {
        setShowAddGroupModal(false);
        setSuccess('');
        setError(null);
        setPayload(initialPayload);
    }, [initialPayload]);

    const handleGroupSelect = (groupName) => {

        // More robust group finding
        const gruppo = groups.find(g =>
            g.name === groupName ||
            g.groupName === groupName ||
            g.id?.toString() === groupName?.toString()
        );

        if (gruppo) {
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
        const token = localStorage.getItem('authToken');
        if (!token) return logout();
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
                body: JSON.stringify({username})
            });
            if (response.ok) {
                const data = await response.json();
                setGroups(Array.isArray(data) ? data : []);
                setCurrentGroupPage(1);
            } else if (response.status === 401) {
                logout();
            } else if (response.status === 404) {
                setGroups([]);
            } else {
                setGroups([]);
                setGroupsError("Errore nel recupero dei gruppi");
            }
        } catch {
            setGroups([]);
            setGroupsError("Errore nel recupero dei gruppi");
        } finally {
            setGroupsLoading(false);
        }
    };

    const getHistoryPayments = async (username) => {
        const token = localStorage.getItem('authToken');
        if (!token) return logout();
        try {
            setPaymentsLoading(true);
            setPaymentsError(null);
            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/ultimi/pagamenti/${username}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify({})
            });
            if (response.status === 204) {
                setPagamentis([]);
                return;
            }
            if (!response.ok) {
                setPaymentsError("Errore nel recupero dei pagamenti");
                return;
            }
            const data = await response.json();
            setPagamentis(Array.isArray(data) ? data : []);
        } catch {
            setPaymentsError("Errore nel recupero dei pagamenti");
        } finally {
            setPaymentsLoading(false);
        }
    };

    const getPaginatedGroups = () => {
        const startIndex = (currentGroupPage - 1) * GROUPS_PER_PAGE;
        return groups.slice(startIndex, startIndex + GROUPS_PER_PAGE);
    };

    const getPaginatedPayments = () => {
        const startIndex = (currentPaymentPage - 1) * PAYMENTS_PER_PAGE;
        return pagamentis.slice(startIndex, startIndex + PAYMENTS_PER_PAGE);
    };

    const getTotalGroupPages = () => Math.ceil(groups.length / GROUPS_PER_PAGE);

    const getTotalPaymentPages = () => Math.ceil(pagamentis.length / PAYMENTS_PER_PAGE);

    const PaginationControls = ({currentPage, totalPages, onPageChange, className}) => {
        if (totalPages <= 1) return null;
        return (
            <div className={`${styles.paginationControls} ${className}`}>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                        className={styles.paginationButton}><i className="bi bi-arrow-left"></i></button>
                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => onPageChange(page)}
                            className={`${styles.paginationButton} ${currentPage === page ? styles.paginationButtonActive : ''}`}>
                        {page}
                    </button>
                ))}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                        className={styles.paginationButton}><i className="bi bi-arrow-right"></i>
                </button>
            </div>
        );
    };

    const LoadingSpinner = ({message}) => (
        <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.spinnerText}>{message}</span>
        </div>
    );

    const ErrorMessage = ({message, onRetry}) => (
        <div className={styles.errorMessage}>
            <div className={styles.errorText}>{message}</div>
            <button onClick={onRetry} className={styles.retryButton}>Riprova <i className="fa-solid fa-repeat"></i>
            </button>
        </div>
    );

    return (
        <div className={styles.homePage}>
            <div className={`${styles.container} ${showAddGroupModal ? styles.modalActive : ''}`}>

                <Header user={user} logout={logout}/>

                <main className={styles.main}>

                    <div className={styles.heroSection}>
                        <h1 className={styles.heroTitle}>Il caffè che unisce il team</h1>
                        <h5 className={styles.heroSubtitle}>Crea gruppi e controlla i pagamenti in modo semplice veloce
                            e divertente</h5>
                    </div>

                    <section className={styles.groupSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <i className="bi bi-people-fill"></i> I tuoi gruppi
                            </h2>

                            { groups.length > 0 ?(  <button onClick={addGroup} className={styles.createGroupButton}>
                                <i className="bi bi-plus-lg"></i>
                                Crea nuovo gruppo
                            </button>):( <button onClick={addGroup} className={styles.createGroupButton}>
                                <i className="bi bi-plus-lg"></i>
                                Crea il tuo primo gruppo
                            </button>)}

                        </div>

                        {groupsLoading ? (
                            <LoadingSpinner message="Caricamento gruppi..."/>
                        ) : groupsError ? (
                            <ErrorMessage message={groupsError} onRetry={() => getGroupsByUser(user)}/>
                        ) : groups.length > 0 ? (
                            <>
                                <div className={styles.groupGrid}>
                                    {getPaginatedGroups().map((group, index) => (
                                        <div
                                            key={index}
                                            className={`${styles.groupCard} ${
                                                selectedGroup === group.name ? styles.groupCardSelected : ''
                                            }`}
                                            onClick={() => handleGroupSelect(group.name)}
                                        >
                                            <div className={styles.groupIcon}>
                                                <i className="fa-solid fa-user-group"></i>
                                            </div>
                                            <div className={styles.groupInfo}>
                                                <h3 className={styles.groupName}>{group.name}</h3>
                                                {group.description && (
                                                    <p className={styles.groupDescription}>{group.description}</p>
                                                )}
                                            </div>
                                            <div className={styles.groupAction}>
                                                <i className="bi bi-arrow-right"></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <PaginationControls currentPage={currentGroupPage} totalPages={getTotalGroupPages()}
                                                    onPageChange={setCurrentGroupPage}/>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <i className="bi bi-people"></i>
                                </div>
                                <h3>Non fai parte di nessun gruppo</h3>
                                <p>Inizia creando il tuo primo gruppo per gestire i pagamenti del caffè</p>
                            </div>
                        )}
                    </section>

                    <div className={styles.separator}>
                        <div className={styles.separatorLeft}></div>
                        <img src="/coffee-medium-svgrepo-com.svg" alt=""/>
                        <div className={styles.separatorRight}></div>
                    </div>

                    <section className={styles.recentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}><i className="bi bi-credit-card-fill"></i> I tuoi ultimi
                                pagamenti</h2>
                        </div>
                        {paymentsLoading ? (
                            <LoadingSpinner message="Caricamento pagamenti..."/>
                        ) : paymentsError ? (
                            <ErrorMessage message={paymentsError} onRetry={() => getHistoryPayments(user)}/>
                        ) : pagamentis.length > 0 ? (
                            <>
                                <div className={styles.paymentCardsContainer}>
                                    {getPaginatedPayments().map((payment, index) => (
                                        <div key={index} className={styles.paymentCard}>
                                            <div className={styles.paymentCardHeader}>
                                                <i className="bi bi-ticket-perforated-fill"></i>
                                                <span className={styles.paymentGroup}>{payment.groupName}</span>
                                            </div>
                                            <div className={styles.paymentCardBody}>
                                                <div className={styles.paymentInfo}>
                                                    <span className={styles.paymentLabel}>Descrizione:</span>
                                                    <span
                                                        className={styles.paymentDescription}>{payment.descrizione}</span>
                                                </div>
                                                <div className={styles.paymentInfo}>
                                                    <span className={styles.paymentLabel}>Data:</span>
                                                    <span className={styles.paymentData}>{payment.dataPagamento}</span>
                                                </div>
                                            </div>
                                            <div className={styles.paymentCardFooter}>
                                                <span className={styles.paymentAmount}>€{payment.importo}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <PaginationControls currentPage={currentPaymentPage} totalPages={getTotalPaymentPages()}
                                                    onPageChange={setCurrentPaymentPage}/>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <i className="bi bi-credit-card"></i>
                        </div>
                        <h3>Non hai effettuato ancora un pagamento</h3>
                        <p>Registra i pagamenti per i gruppi di cui fai parte</p>
                            </div>
                        )}
                    </section>

                </main>
            </div>

            {showAddGroupModal && (
                <AddGroupModal
                    payload={payload}
                    handleChangeName={handleChangeName}
                    handleChangeDescription={handleChangeDescription}
                    confirmCreateGroup={confirmCreateGroup}
                    closeAddGroupModal={closeAddGroupModal}
                    error={error}
                    success={success}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
};

export default Home;