import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/group.module.css';
import Header from '../view/header.jsx';

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const Group = () => {

    const [payment, setPayment] = useState({
        importo: '',
        descrizione: ''
    });
    const [user, setUser] = useState(null);
    const [group, setGroup] = useState({groupName: ''});
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRegisterPaymentModal, setShowRegisterPaymentModal] = useState(false);
    const [groups, setGroups] = useState({});
    const [classificaPaymentsForGroup, setClassificaPaymentsForGroup] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userInvitation, setUserInvitation] = useState('')
    const [successMessage, setSuccessMessage] = useState('');
    const [importo, setImporto] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const authToken = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');
            const groupData = localStorage.getItem('group');
            const parsedGroupData = groupData ? JSON.parse(groupData) : null;

            setGroups(parsedGroupData);

            if (!authToken) {
                navigate('/login');
                return;
            }

            try {
                const parsedUser = userData ? JSON.parse(userData) : null;
                const username = typeof parsedUser === 'object' ? parsedUser?.username || parsedUser?.name || parsedUser?.email : parsedUser;

                if (!username) {
                    throw new Error('No user data available');
                }

                setUser(username);

                if (groupData) {
                    try {
                        const parsedGroup = JSON.parse(groupData);
                        const groupObject = {
                            groupName: parsedGroup.name || 'Unnamed Group', ...parsedGroup
                        };
                        setGroup(groupObject);
                        // Call getClassificaPaymentsForGroup with the parsed group
                        await getClassificaPaymentsForGroup(groupObject);
                    } catch (e) {
                        console.error('Error parsing group data:', e);
                        const fallbackGroup = {groupName: 'Unnamed Group'};
                        setGroup(fallbackGroup);
                        await getClassificaPaymentsForGroup(fallbackGroup);
                    }
                } else {
                    const fallbackGroup = {groupName: 'Unnamed Group'};
                    setGroup(fallbackGroup);
                    await getClassificaPaymentsForGroup(fallbackGroup);
                }

            } catch (err) {
                console.error('Error parsing data:', err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Add blur effect when modals are open
    useEffect(() => {
        const container = document.querySelector('.container');
        if (showInviteForm || showDeleteModal) {
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
    }, [showInviteForm, showDeleteModal]);

    // Separate useEffect to check admin status when user and groups are both available
    useEffect(() => {
        if (user && groups && groups.userMembershipsdto) {
            const adminStatus = isUserAdmin(user);
            setIsAdmin(adminStatus);
            console.log('Admin status for', user, ':', adminStatus);
        }
    }, [user, groups]);

    useEffect(() => {
        if (!user && !loading) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Format currency function
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '€ 0,00';
        try {
            const num = parseFloat(amount);
            return new Intl.NumberFormat('it-IT', {
                style: 'currency', currency: 'EUR'
            }).format(num);
        } catch (error) {
            return `€ ${amount}`;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const goBack = () => navigate('/home');

    const registerPayment = () => {
        console.log('Register payment clicked');
        setShowRegisterPaymentModal(true);
        setSuccessMessage('');
        setError(null);
    };

    const skipPayment = () => {
        console.log('Skip payment clicked');
        // Implement your logic here
    };

    const deleteGroup = () => {
        console.log('Delete group clicked');
        setShowDeleteModal(true)
        setSuccessMessage('');
        setError(null);
    };

    const inviteMember = () => {
        setShowInviteForm(true);
        setSuccessMessage('');
        setError(null);
    };

    const isUserAdmin = (user) => {
        if (!groups || !user || !groups.userMembershipsdto) {
            return false;
        }

        const currentUserMembership = groups.userMembershipsdto.find(member => member.username === user);

        return currentUserMembership ? currentUserMembership.isAdmin : false;
    }

    const submitInvite = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage('');

        try {
            console.log('Inviting:', userInvitation, 'to group:', group.groupName);

            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No token provided");
                return;
            }

            // First check if user exists in the system using the backend endpoint
            try {
                const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/user/by-username?username=${encodeURIComponent(userInvitation)}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({}) // Empty body as required by your backend
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const userData = await response.json();

                // Check if user data exists (assuming your endpoint returns Optional)
                if (!userData || (userData && Object.keys(userData).length === 0)) {
                    setError(`L'utente "${userInvitation}" non esiste nel sistema`);
                    return;
                }

                // Client-side check if user is already in the group
                if (groups && groups.userMembershipsdto) {
                    const isAlreadyMember = groups.userMembershipsdto.some(
                        member => member.username === userInvitation
                    );

                    if (isAlreadyMember) {
                        setError(`L'utente "${userInvitation}" è già membro del gruppo`);
                        return;
                    }
                }

            } catch (userCheckError) {
                console.error('User check error:', userCheckError);
                setError(`L'utente "${userInvitation}" non esiste nel sistema`);
                return;
            }

            // If checks pass, send the invitation
            const requestBody = {
                username: userInvitation,
                groupName: group.groupName,
            }

            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/group/update/invitation`, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                setError(`HTTP ${response.status}: ${errorText}`);
                return;
            }

            const responseMessage = await response.text();
            console.log('Invitation response:', responseMessage);

            setSuccessMessage(`Invito inviato a ${userInvitation}!`);
            setUserInvitation('');

            setTimeout(() => {
                setShowInviteForm(false);
            }, 2000);

        } catch (err) {
            setError(err.message || 'Errore nell\'invio dell\'invito. Riprova.');
            console.error('Invite error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitPayment = async (e) => {
        e.preventDefault();

    }

    const confirmDeleteGroup = async (e) => {
        e.preventDefault();
        setIsDeleting(true);
        setError(null);
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No token provided");
                return;
            }

            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/group/delete/${group.groupName}`, {
                method: 'DELETE', headers: {
                    'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token,
                }, credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                setError(`Il gruppo è composto da due o piu persone`);
                return;
            }

            const responseMessage = await response.text();
            console.log('Delete response:', responseMessage);

            // Clear group data from localStorage
            localStorage.removeItem('group');

            setSuccessMessage(`Gruppo "${group.groupName}" eliminato con successo!`);

            // Navigate back to home after a short delay
            setTimeout(() => {
                navigate('/home');
                // Navigation will unmount the component, triggering useEffect cleanup
            }, 2000);

        } catch (err) {
            setError('Errore nell\'eliminazione del gruppo. Riprova.');
            console.error('Delete error:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const DeleteGroupModal = () => (
        <div className={styles.modalOverlay} onClick={(e) => handleModalOverlayClick(e, closeDeleteModal)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

                <h2>Elimina Gruppo</h2>
                <p>Sei sicuro di voler eliminare il gruppo <strong>"{group.groupName}"</strong>?</p>
                <p style={{color: '#dc3545', fontSize: '0.9em', marginTop: '1rem'}}>
                    Questa azione non può essere annullata. Tutti i dati del gruppo verranno persi definitivamente.
                </p>

                {error && <div className={styles.errorMessage}>{error}</div>}
                {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

                <div className={styles.formButtons} style={{marginTop: '2rem'}}>
                    <button
                        type="button"
                        onClick={closeDeleteModal}
                        className={`${styles.groupButton} ${styles.cancelButton}`}
                        disabled={isDeleting}
                    >
                        Annulla
                    </button>
                    <button
                        type="button"
                        onClick={confirmDeleteGroup}
                        className={`${styles.groupButton} ${styles.deleteButton}`}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Eliminazione in corso...' : 'Elimina Gruppo'}
                    </button>
                </div>
            </div>
        </div>);

    const InviteUserModal = () => (<div
        className={styles.modalOverlay}
        onClick={(e) => handleModalOverlayClick(e, closeInviteForm)}  // Close when clicking outside
    >
        <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}  // Prevent clicks inside modal from closing it
        >
            <h2>Invita un Membro</h2>
            <form onSubmit={submitPayment}>
                <div className={styles.formGroup}>
                    <label htmlFor="user">Utente da invitare:</label>
                    <input
                        type="text"
                        id="user"
                        value={userInvitation}
                        onChange={(e) => setUserInvitation(e.target.value)}
                        required
                        className={styles.formInput}
                        placeholder="Inserisci username..."
                        autoFocus
                    />
                </div>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
                <div className={styles.formButtons}>
                    <button
                        type="button"
                        onClick={closeInviteForm}
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
                        {isSubmitting ? 'Registrando il pagamento..' : 'Registra pagamento'}
                    </button>
                </div>
            </form>
        </div>
    </div>);

    const RegisterPaymentModal = () => (
        <div className={styles.modalOverlay} onClick={(e) => handleModalOverlayClick(e, closeRegisterPaymentModal)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

                <h2>Registra il pagamento</h2>

                <form onSubmit={submitInvite}>
                    <div className={styles.formGroup}>

                        <label htmlFor="importo">Importo:</label>
                        <input
                            type="number"
                            id="importo"
                            value={importo}
                            onChange={(e) => setImporto(e.target.value)}
                            required
                            className={styles.formInput}
                            placeholder="Inserisci importo..."
                            autoFocus
                        />

                        <label htmlFor="descrizione">Descrizione:</label>
                        <input
                            type="text"
                            id="descrizione"
                            value={descrizione}
                            onChange={(e) => setDescrizione(e.target.value)}
                            required
                            className={styles.formInput}
                            placeholder="Inserisci una descrizione del pagamento..."
                            autoFocus
                        />

                    </div>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
                    <div className={styles.formButtons}>
                        <button
                            type="button"
                            onClick={closeRegisterPaymentModal}
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
                            {isSubmitting ? 'Invio in corso...' : 'Invia Invito'}
                        </button>
                    </div>
                </form>
            </div>
        </div>)

    // Enhanced modal click outside to close functionality
    const handleModalOverlayClick = (e, closeFunction) => {};

    // Fixed function to accept group parameter
    const getClassificaPaymentsForGroup = async (groupToUse = group) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError("No token provided");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/pagamenti/classifica`, {
                method: 'POST', body: JSON.stringify({
                    groupId: groupToUse.id, groupName: groupToUse.groupName || groupToUse.name
                }), headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }, credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json();
                console.log("Classifica pagamenti", data);
                setClassificaPaymentsForGroup(data);
            } else if (response.status === 204) {
                console.log('No payments found for group');
                setClassificaPaymentsForGroup([]);
            }

        } catch (err) {
            console.error('Error in fetch call:', err);
            setError("Errore nel recupero dei pagamenti per il gruppo");
        } finally {
            setLoading(false);
        }
    }

    // Enhanced modal close functions with blur cleanup
    const closeInviteForm = () => {
        setShowInviteForm(false);
        setError(null);
        setSuccessMessage('');
        setUserInvitation('');
        // The useEffect will handle the blur cleanup automatically
    };

    const closeRegisterPaymentModal = () => {
        setShowRegisterPaymentModal(false);
        setError(null);
        setSuccessMessage('');
    }

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setError(null);
        setSuccessMessage('');
        // The useEffect will handle the blur cleanup automatically
    };

    if (loading) {
        return (<div className={styles.container}>
            <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <span>Caricamento...</span>
            </div>
        </div>);
    }

    return (<div className={styles.groupPage}>
        <div className={styles.container}>

            <Header user={user} logout={logout}/>

            {/* Main */}
            <main className={styles.main}>
                <button onClick={goBack} className={styles.groupButton} style={{marginBottom: '2rem'}}>
                    <i className="fa-solid fa-arrow-left"></i> <i className="fa-solid fa-house"></i>
                </button>

                <div className={styles.groupHeader}>
                    <h1 className={styles.sectionTitle} style={{textAlign: 'left', margin: 0}}>
                        <i className="fa-solid fa-user-group"></i> {group?.groupName || 'No Group Name'}
                    </h1>

                    {isAdmin && (<div className={styles.groupAdminButtons}>
                        <button
                            onClick={deleteGroup}
                            className={`${styles.groupButton} ${styles.deleteButton}`}
                        >
                            <i className="fa-solid fa-trash"></i> Elimina Gruppo
                        </button>

                        <button
                            onClick={inviteMember}
                            className={`${styles.groupButton} ${styles.inviteButton}`}
                        >
                            <i className="fa-solid fa-user-plus"></i> Invita Membro
                        </button>
                    </div>)}

                </div>

                {/* Azioni gruppo */}
                <section className={styles.groupSection} style={{marginTop: '2rem'}}>
                    <div className={styles.actionButtons}>
                        <button onClick={registerPayment}
                                className={`${styles.groupButton} ${styles.actionButton}`}>
                            Registra Pagamento
                        </button>
                        <button onClick={skipPayment} className={`${styles.groupButton} ${styles.actionButton}`}>
                            Salta Pagamento
                        </button>
                        <button onClick={skipPayment} className={`${styles.groupButton} ${styles.actionButton}`}>
                            Paga per un amico
                        </button>
                    </div>
                </section>

                <div className={styles.separator}></div>

                <h2 className={styles.sectionTitle}><i className="fa-solid fa-ranking-star"></i> Classifica
                    pagamenti</h2>

                {classificaPaymentsForGroup.length > 0 ? (<>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.tableHeader}>
                            <tr>
                                <th className={styles.tableHeaderCell}>Utente</th>
                                <th className={styles.tableHeaderCell}>Totale Speso</th>
                                <th className={styles.tableHeaderCell}>Pagamenti effetuati</th>
                            </tr>
                            </thead>
                            <tbody className={styles.tableBody}>
                            {classificaPaymentsForGroup.map((payment, index) => (
                                <tr key={index} className={styles.tableRow}>
                                    <td className={styles.tableCell}>
                                        {payment.username}
                                    </td>
                                    <td className={styles.tableCell}>
                                        {formatCurrency(payment.totaleImporto)}
                                    </td>
                                    <td className={styles.tableCell}>
                                        {payment.totalePagamenti}
                                    </td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </>) : (<div className={styles.textEmpty}>
                    Nessun pagamento trovato
                </div>)}

            </main>

            {showInviteForm && <InviteUserModal/>}
            {showDeleteModal && <DeleteGroupModal/>}
            {setShowRegisterPaymentModal && <RegisterPaymentModal/>}
        </div>
    </div>);
};

export default Group;