import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/group.module.css';
import Header from '../view/header.jsx';

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const Group = () => {

    const [user, setUser] = useState(null);
    const [group, setGroup] = useState({groupName: ''});
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRegisterPaymentModal, setShowRegisterPaymentModal] = useState(false);
    const [showSaltaPaymentModal, setShowSaltaPaymentModal] = useState(false);
    const [showPayForFriendModal, setShowPayForFriendModal] = useState(false);
    const [groups, setGroups] = useState({});
    const [classificaPaymentsForGroup, setClassificaPaymentsForGroup] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userInvitation, setUserInvitation] = useState('')
    const [successMessage, setSuccessMessage] = useState('');
    const [importo, setImporto] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [error, setError] = useState(null);
    const [paymentByGroupError, setPaymentByGroupError] = useState(null)
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPayForFriend, setIsPayForFriend] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const authToken = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');
            const groupData = localStorage.getItem('group');

            if (!authToken) {
                navigate('/login');
                return;
            }

            try {
                // Parse user data
                let username = null;
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    username = typeof parsedUser === 'object'
                        ? (parsedUser?.username || parsedUser?.name || parsedUser?.email)
                        : parsedUser;
                }

                if (!username) {
                    throw new Error('No user data available');
                }

                setUser(username);

                // Parse group data with better error handling
                let groupObject = {groupName: 'Unnamed Group'};

                if (groupData) {
                    try {
                        const parsedGroup = JSON.parse(groupData);
                        groupObject = {
                            id: parsedGroup.id,
                            groupName: parsedGroup.name || parsedGroup.groupName || 'Unnamed Group',
                            name: parsedGroup.name || parsedGroup.groupName || 'Unnamed Group',
                            ...parsedGroup
                        };
                    } catch (parseError) {
                        console.error('Error parsing group data:', parseError);
                        // Keep default groupObject
                    }
                }

                setGroup(groupObject);
                setGroups(groupObject);

                // Only call API if we have valid group data
                if (groupObject.id || groupObject.groupName !== 'Unnamed Group') {
                    await getClassificaPaymentsForGroup(groupObject);
                }

            } catch (err) {
                console.error('Error initializing data:', err);
                navigate('/login');
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        const container = document.querySelector('.container');
        if (showInviteForm || showDeleteModal || showRegisterPaymentModal || showSaltaPaymentModal || showPayForFriendModal) {
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
    }, [showInviteForm, showDeleteModal, showRegisterPaymentModal, showSaltaPaymentModal, showPayForFriendModal]);

    useEffect(() => {
        if (user && groups && groups.userMembershipsdto) {
            const adminStatus = isUserAdmin(user);
            setIsAdmin(adminStatus);
            console.log('Admin status for', user, ':', adminStatus);
        }
    }, [user, groups]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 1000);

            // Cleanup function to clear timeout if component unmounts or error changes
            return () => clearTimeout(timer);
        }
    }, [error])

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
        setShowSaltaPaymentModal(true);
        setSuccessMessage('');
        setError(null);
    };

    const payForFriend = () => {
        console.log('Pay for friend clicked');
        setShowPayForFriendModal(true);
        setSuccessMessage('');
        setError(null);
    }

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
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage('');

        try {

            console.log('register payment...');

            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No token provided");
                return;
            }

            try {

                const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/pagamento?groupNme=${encodeURIComponent(group.groupName)}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        importo: importo,
                        descrizione: descrizione,
                    })
                });

                if (!response.ok) {
                    setError('Problema durante la registrazione del pagamento');
                    return;
                }

                setSuccessMessage('Pagamento registrato con successo');

                setTimeout(() => {
                    setShowRegisterPaymentModal(false);
                }, 2000);

                await getClassificaPaymentsForGroup(group)

            } catch (err) {
                console.error('Payment register error:', err);
                setError(`Problema durante la registrazione del pagamento`);
                return;
            }

        } catch (err) {
            console.error('Register payment error:', err);
        } finally {
            setIsSubmitting(false);
        }
    }

    const confirmSkipPayment = async (e) => {
        e.preventDefault();
        setIsSkipping(true); // Use the correct state variable
        setError(null);
        setSuccessMessage('');

        try {
            console.log('skip payment...');

            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No token provided");
                return;
            }

            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/salta/pagamento?groupNme=${encodeURIComponent(group.groupName)}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorText = await response.text();
                setError(`Si è verificato un problema: ${errorText || 'Errore sconosciuto'}`);
                return;
            }

            // Set success message and close modal after delay
            setSuccessMessage('Pagamento saltato con successo!');

            setTimeout(() => {
                setShowSaltaPaymentModal(false);
            }, 2000);

        } catch (err) {
            console.error('Skip payment error:', err);
            setError('Errore di rete. Riprova più tardi.');
        } finally {
            setIsSkipping(false); // Use the correct state variable
        }
    };

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
            }, 2000);

        } catch (err) {
            setError('Errore nell\'eliminazione del gruppo. Riprova.');
            console.error('Delete error:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmPayForFriend = async (e) => {
        e.preventDefault();
        setIsPayForFriend(true);
        setError(null);
        setSuccessMessage('');
        console.log("Hello confirmPayForFriend")
    }

    const DeleteGroupModal = () => (
        <div className={styles.modalOverlay} onClick={(e) => handleModalOverlayClick(e, closeDeleteModal)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

                <h2>Elimina Gruppo</h2>
                <p>Sei sicuro di voler eliminare il gruppo <strong
                    className={styles.groupName}>{group.groupName}</strong>?</p>
                <p style={{color: '#dc3545', fontSize: '0.9em', marginTop: '1rem'}}>
                    Questa azione non può essere annullata. Tutti i dati del gruppo verranno persi definitivamente.
                </p>

                {error && <div className={styles.errorMessageModal}>{error}</div>}
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

    const SkipPaymentModal = () => (
        <div className={styles.modalOverlay} onClick={(e) => handleModalOverlayClick(e, closeSaltaPaymentForm)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

                <h2>Salta Pagamento</h2>
                <p>Vuoi saltare il tuo turno di pagamento per questo gruppo?</p>
                <div style={{
                    backgroundColor: 'var(--coffee-50)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    margin: '1rem 0',
                    borderLeft: '3px solid var(--coffee-600)'
                }}>
                    <p style={{margin: '0 0 0.5rem 0', fontWeight: '500'}}>Cosa succede quando salti:</p>
                    <ul style={{margin: '0', paddingLeft: '1.5rem'}}>
                        <li>Il tuo stato verrà marcato come "saltato" per questo turno</li>
                        <li>Verrai automaticamente reinserito nella prossima rotazione</li>
                        <li>Un altro membro del gruppo verrà selezionato casualmente per il prossimo pagamento</li>
                    </ul>
                </div>
                <p style={{color: 'var(--coffee-700)', fontSize: '0.9em', fontStyle: 'italic'}}>
                    Nota: Puoi saltare solo quando è il tuo turno di pagare.
                </p>

                {error && <div className={styles.errorMessageModal}>{error}</div>}
                {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

                <div className={styles.formButtons} style={{marginTop: '2rem'}}>
                    <button
                        type="button"
                        onClick={closeSaltaPaymentForm}
                        className={`${styles.groupButton} ${styles.cancelButton}`}
                        disabled={isSkipping}
                    >
                        Annulla
                    </button>
                    <button
                        type="button"
                        onClick={confirmSkipPayment}
                        className={`${styles.groupButton} ${styles.deleteButton}`}
                        disabled={isSkipping}
                    >
                        {isSkipping ? 'Salto del pagamento in corso...' : 'Salta pagamento'}
                    </button>
                </div>
            </div>
        </div>
    );

    const PayForFriendModal = () => (
        <div className={styles.modalOverlay} onClick={(e) => handleModalOverlayClick(e, closePayForFriendModal)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

                <h2>Paga per un amico</h2>
                <p>Text........</p>
                {/*<p>Sei sicuro di voler eliminare il gruppo <strong>"{group.groupName}"</strong>?</p>
                <p style={{color: '#dc3545', fontSize: '0.9em', marginTop: '1rem'}}>
                    Questa azione non può essere annullata. Tutti i dati del gruppo verranno persi definitivamente.
                </p>*/}

                <form onSubmit={confirmPayForFriend}>

                    {error && <div className={styles.errorMessageModal}>{error}</div>}
                    {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

                    <div className={styles.formButtons} style={{marginTop: '2rem'}}>
                        <button
                            type="button"
                            onClick={closePayForFriendModal}
                            className={`${styles.groupButton} ${styles.cancelButton}`}
                            disabled={isPayForFriend}>
                            Annulla
                        </button>
                        <button
                            type="button"
                            className={`${styles.groupButton} ${styles.deleteButton}`}
                            disabled={isPayForFriend}>
                            {isPayForFriend ? 'Salto del pagamento in corso...' : 'Salta pagamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

    const InviteUserModal = () => (<div
        className={styles.modalOverlay}
        onClick={(e) => handleModalOverlayClick(e, closeInviteForm)}  // Close when clicking outside
    >
        <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}  // Prevent clicks inside modal from closing it
        >
            <h2>Invita un Membro</h2>
            <form onSubmit={submitInvite}>
                <div className={styles.formGroup}>
                    <label htmlFor="user">Utente da invitare nel gruppo:</label>
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
                {error && <div className={styles.errorMessageModal}>{error}</div>}
                {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
                <div>
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

                <div style={{
                    backgroundColor: 'var(--coffee-50)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    margin: '1rem 0',
                    borderLeft: '3px solid var(--coffee-600)'
                }}>
                    <p style={{margin: '0 0 0.5rem 0', fontWeight: '500'}}>Cosa succede quando registri un
                        pagamento:</p>
                    <ul style={{margin: '0', paddingLeft: '1.5rem'}}>
                        <li>Il tuo stato verrà marcato come "pagato" per questo turno</li>
                        <li>Il pagamento verrà registrato con importo, descrizione e data corrente</li>
                        <li>Verrà automaticamente selezionato il prossimo pagatore del gruppo</li>
                        <li>Il pagamento apparirà nella classifica del gruppo</li>
                    </ul>
                </div>

                <form onSubmit={submitPayment}>
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
                            step="0.01"
                            min="0"
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
                        />

                    </div>
                    {error && <div className={styles.errorMessageModal}>{error}</div>}
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
                            {isSubmitting ? 'Registrazione in corso...' : 'Registra Pagamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>);

    const handleModalOverlayClick = () => {};

    const getClassificaPaymentsForGroup = async (groupToUse = group) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError("No token provided");
            return;
        }

        try {
            setPaymentLoading(true);
            setError(null);
            setPaymentByGroupError(null); // Clear previous errors

            // Ensure we have valid group data
            const groupId = groupToUse?.id;
            const groupName = groupToUse?.groupName || groupToUse?.name;

            if (!groupId && !groupName) {
                setPaymentByGroupError("Dati del gruppo mancanti");
                return;
            }

            // Build request body with only defined values
            const requestBody = {};
            if (groupId) requestBody.groupId = groupId;
            if (groupName) requestBody.groupName = groupName;

            console.log('Sending request:', requestBody);

            const response = await fetch(`${NGROK_SERVER_URL}/api/coffee/pagamenti/classifica`, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include'
            });

            console.log('Response status:', response.status);

            if (response.status === 204) {
                // Handle No Content response - this is expected when there are no payments
                console.log('No payments found for group');
                setClassificaPaymentsForGroup([]);
                // Don't set an error message - this is a normal state
            } else if (response.ok) {
                const data = await response.json();
                console.log("Classifica pagamenti", data);
                setClassificaPaymentsForGroup(data);
            } else {
                // Handle other error statuses
                let errorMessage;
                try {
                    // Try to parse JSON error response first
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || `Errore del server (${response.status})`;
                } catch (jsonError) {
                    // If JSON parsing fails, get text response
                    try {
                        errorMessage = await response.text() || `Errore del server (${response.status})`;
                    } catch (textError) {
                        errorMessage = `Errore del server (${response.status})`;
                    }
                }

                console.error(`HTTP ${response.status}:`, errorMessage);

                // Handle specific status codes
                switch (response.status) {
                    case 401:
                        setPaymentByGroupError("Sessione scaduta. Effettua nuovamente il login.");
                        // Redirect to login after a delay
                        setTimeout(() => navigate('/login'), 2000);
                        break;
                    case 403:
                        setPaymentByGroupError(`Accesso negato. Verifica di appartenere al gruppo "${groupName || 'sconosciuto'}"`);
                        break;
                    case 404:
                        if (errorMessage.toLowerCase().includes('group')) {
                            setPaymentByGroupError(`Gruppo "${groupName || 'sconosciuto'}" non trovato`);
                        } else {
                            setPaymentByGroupError("Risorsa non trovata");
                        }
                        break;
                    case 500:
                        setPaymentByGroupError("Errore interno del server. Riprova più tardi.");
                        break;
                    default:
                        setPaymentByGroupError(errorMessage);
                }

                setClassificaPaymentsForGroup([]);
            }

        } catch (err) {
            console.error('Request failed:', err);
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setPaymentByGroupError("Errore di connessione. Verifica la tua connessione internet.");
            } else {
                setPaymentByGroupError("Errore nel recupero dei pagamenti. Riprova più tardi.");
            }
            setClassificaPaymentsForGroup([]);
        } finally {
            setPaymentLoading(false);
        }
    };

    const closeInviteForm = () => {
        setShowInviteForm(false);
        setError(null);
        setSuccessMessage('');
        setUserInvitation('');
        // The useEffect will handle the blur cleanup automatically
    };

    const retryPayment = async () => {
        if (group) {
            await getClassificaPaymentsForGroup(group);
        }
    };

    const closeSaltaPaymentForm = () => {
        setShowSaltaPaymentModal(false);
        setError(null);
        setSuccessMessage('');
    }

    const ErrorMessage = ({message, onRetry}) => (
        <div className={styles.errorMessage}>
            <div className={styles.errorText}>{message}</div>
            <button onClick={onRetry} className={styles.retryButton}>
                Riprova <i className="fa-solid fa-repeat"></i>
            </button>
        </div>
    );

    const LoadingSpinner = ({message}) => (
        <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span className={styles.spinnerText}>{message}</span>
        </div>
    );

    const closeRegisterPaymentModal = () => {
        setShowRegisterPaymentModal(false);
        setError(null);
        setSuccessMessage('');
    }

    const closePayForFriendModal = () => {
        setShowPayForFriendModal(false);
        setError(null);
        setSuccessMessage('');
    }

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setError(null);
        setSuccessMessage('');
        // The useEffect will handle the blur cleanup automatically
    };

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
                        <button onClick={payForFriend} className={`${styles.groupButton} ${styles.actionButton}`}>
                            Paga per un amico
                        </button>
                    </div>
                </section>

                <div className={styles.separator}></div>

                <h2 className={styles.sectionTitle}><i className="fa-solid fa-ranking-star"></i> Classifica
                    pagamenti</h2>

                {paymentLoading ? (<LoadingSpinner message={"Caricamento pagamenti..."}/>) :
                    paymentByGroupError ? (<ErrorMessage message={paymentByGroupError} onRetry={retryPayment}/>) :
                        classificaPaymentsForGroup.length > 0 ? (<>
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
            {showRegisterPaymentModal && <RegisterPaymentModal/>}
            {showSaltaPaymentModal && <SkipPaymentModal/>}
            {showPayForFriendModal && <PayForFriendModal/>}
        </div>
    </div>);
};

export default Group;