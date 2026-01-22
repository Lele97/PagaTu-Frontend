import React, {cache, useCallback, useEffect, useMemo, useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/group.module.css';
import sharedStyles from '~/styles/shared.module.css';
import Header from '../../components/header.jsx';
import jp from "jsonpath";

const GETAWAY_SERVER_URL = import.meta.env.VITE_GETAWAY_SERVER_URL;

const InviteUserModal = React.memo(({
                                        closeInviteForm,
                                        submitInvite,
                                        userInvitation,
                                        error,
                                        successMessage,
                                        isSubmitting,
                                        handleInputChangeInvitation
                                    }) => {
    return (
        <div className={sharedStyles.modalOverlay}>
            <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Invita un Membro</h2>
                <form onSubmit={submitInvite}>
                    <div className={styles.formGroup}>
                        <label htmlFor="user">Utente da invitare nel gruppo:</label>
                        <input
                            type="text"
                            id="user"
                            value={userInvitation}
                            onChange={handleInputChangeInvitation}
                            required
                            className={sharedStyles.formInput}
                            placeholder="Inserisci username..."
                            autoFocus/>
                    </div>
                    {error && <div className={sharedStyles.errorMessageModal}>{error}</div>
                    }
                    {successMessage &&
                        <div className={sharedStyles.successMessage}>{successMessage}</div>
                    }
                    <div>
                        <button
                            type="button"
                            onClick={closeInviteForm}
                            className={`${sharedStyles.groupButton} ${styles.cancelButton}`}
                            disabled={isSubmitting}
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            className={`${sharedStyles.groupButton} ${styles.submitButton}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Invito in corso...' : 'Invita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>)
});

const RegisterPaymentModal = React.memo(({
                                             submitPayment,
                                             importo,
                                             descrizione,
                                             error,
                                             successMessage,
                                             isSubmitting,
                                             closeRegisterPaymentModal,
                                             handleInputChangeImporto,
                                             handleInputChangeDescrizione
                                         }) => {
    return (
        <div className={sharedStyles.modalOverlay}>
            <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>

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
                            onChange={handleInputChangeImporto}
                            required
                            className={sharedStyles.formInput}
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
                            onChange={handleInputChangeDescrizione}
                            required
                            className={sharedStyles.formInput}
                            placeholder="Inserisci una descrizione del pagamento..."
                        />

                    </div>
                    {error && <div className={sharedStyles.errorMessageModal}>{error}</div>}
                    {successMessage && <div className={sharedStyles.successMessage}>{successMessage}</div>}
                    <div className={styles.formButtons}>
                        <button
                            type="button"
                            onClick={closeRegisterPaymentModal}
                            className={`${sharedStyles.groupButton} ${styles.cancelButton}`}
                            disabled={isSubmitting}
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            className={`${sharedStyles.groupButton} ${styles.submitButton}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registrazione in corso...' : 'Registra Pagamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
});

const PayForFriendModal = React.memo(({
                                          confirmPayForFriend,
                                          friend,
                                          importo,
                                          descrizione,
                                          error,
                                          successMessage,
                                          isSubmitting,
                                          closePayForFriendModal,
                                          handleInputChangeImporto,
                                          handleInputChangeDescrizione
                                      }) => {
    return (
        <div className={sharedStyles.modalOverlay}>
            <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>

                <h2>Paga per un amico</h2>

                <h6>Stai pagando al posto di <strong>{friend}</strong></h6>

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

                <form onSubmit={confirmPayForFriend}>
                    <div className={styles.formGroup}>

                        <label htmlFor="importo">Importo:</label>
                        <input
                            type="number"
                            id="importo"
                            value={importo}
                            onChange={handleInputChangeImporto}
                            required
                            className={sharedStyles.formInput}
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
                            onChange={handleInputChangeDescrizione}
                            required
                            className={sharedStyles.formInput}
                            placeholder="Inserisci una descrizione del pagamento..."
                        />

                    </div>
                    {error && <div className={sharedStyles.errorMessageModal}>{error}</div>}
                    {successMessage && <div className={sharedStyles.successMessage}>{successMessage}</div>}
                    <div className={styles.formButtons}>
                        <button
                            type="button"
                            onClick={closePayForFriendModal}
                            className={`${sharedStyles.groupButton} ${styles.cancelButton}`}
                            disabled={isSubmitting}
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            className={`${sharedStyles.groupButton} ${styles.submitButton}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registrazione in corso...' : 'Registra Pagamento'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
})

const DeleteGroupModal = React.memo(({
                                         closeDeleteModal,
                                         confirmDeleteGroup,
                                         isDeleting,
                                         error,
                                         successMessage
                                     }) => {
    return (
        <div className={sharedStyles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
        }}>
            <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>

                <h2>Elimina Gruppo</h2>
                <p>Sei sicuro di voler eliminare il gruppo <strong
                    className={styles.groupName}>{group.groupName}</strong>?</p>
                <p style={{color: '#dc3545', fontSize: '0.9em', marginTop: '1rem'}}>
                    Questa azione non può essere annullata. Tutti i dati del gruppo verranno persi definitivamente.
                </p>

                {error && <div className={sharedStyles.errorMessageModal}>{error}</div>}
                {successMessage && <div className={sharedStyles.successMessage}>{successMessage}</div>}

                <div className={styles.formButtons} style={{marginTop: '2rem'}}>
                    <button
                        type="button"
                        onClick={closeDeleteModal}
                        className={`${sharedStyles.groupButton} ${styles.cancelButton}`}
                        disabled={isDeleting}
                    >
                        Annulla
                    </button>
                    <button
                        type="button"
                        onClick={confirmDeleteGroup}
                        className={`${sharedStyles.groupButton} ${styles.deleteButton}`}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Eliminazione in corso...' : 'Elimina Gruppo'}
                    </button>
                </div>
            </div>
        </div>
    )
})

const SkipPaymentModal = React.memo(({
                                         closeSaltaPaymentForm,
                                         confirmSkipPayment,
                                         isSkipping,
                                         error,
                                         successMessage
                                     }) => {
    return (
        <div className={sharedStyles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) closeSaltaPaymentForm();
        }}>
            <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>

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

                {error && <div className={sharedStyles.errorMessageModal}>{error}</div>}
                {successMessage && <div className={sharedStyles.successMessage}>{successMessage}</div>}

                <div className={styles.formButtons} style={{marginTop: '2rem'}}>
                    <button
                        type="button"
                        onClick={closeSaltaPaymentForm}
                        className={`${sharedStyles.groupButton} ${styles.cancelButton}`}
                        disabled={isSkipping}
                    >
                        Annulla
                    </button>
                    <button
                        type="button"
                        onClick={confirmSkipPayment}
                        className={`${sharedStyles.groupButton} ${styles.deleteButton}`}
                        disabled={isSkipping}
                    >
                        {isSkipping ? 'Salto del pagamento in corso...' : 'Salta pagamento'}
                    </button>
                </div>
            </div>
        </div>
    )
})

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
    const [friend, setFriend] = useState('');

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
                let username = null;
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    username = typeof parsedUser === 'object'
                        ? (parsedUser?.username || parsedUser?.name || parsedUser?.email)
                        : parsedUser;
                }

                if (!username) throw new Error('No user data available');

                setUser(username);

                let groupObject = {groupName: 'Unnamed Group'};
                let parsedGroup = null;

                if (groupData) {
                    try {
                        parsedGroup = JSON.parse(groupData);
                        const groupName = parsedGroup.name || parsedGroup.groupName;

                        // Fetch the latest group data from the server
                        const token = localStorage.getItem('authToken');
                        const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group/get/${username}`, {
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
                            const allGroups = await response.json();

                            // Find the specific group we're looking for
                            const currentGroup = allGroups.find(g =>
                                g.name === groupName ||
                                g.groupName === groupName ||
                                g.id?.toString() === parsedGroup.id?.toString()
                            );

                            if (currentGroup) {
                                groupObject = {
                                    id: currentGroup.id,
                                    groupName: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                                    name: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                                    ...currentGroup
                                };

                                // Update localStorage with the latest data
                                localStorage.setItem('group', JSON.stringify(groupObject));
                            } else {
                                // Fallback to localStorage data if group not found in response
                                groupObject = {
                                    id: parsedGroup.id,
                                    groupName: parsedGroup.name || parsedGroup.groupName || 'Unnamed Group',
                                    name: parsedGroup.name || parsedGroup.groupName || 'Unnamed Group',
                                    ...parsedGroup
                                };
                            }
                        } else {
                            // Fallback to localStorage data if server fetch fails
                            groupObject = {
                                id: parsedGroup.id,
                                groupName: parsedGroup.name || parsedGroup.groupName || 'Unnamed Group',
                                name: parsedGroup.name || parsedGroup.groupName || 'Unnamed Group',
                                ...parsedGroup
                            };
                        }
                    } catch (parseError) {
                        throw new Error('Error parsing group data: ' + parseError.message);
                    }
                }

                setGroup(groupObject);
                setGroups(groupObject);

                if (groupObject.id || groupObject.groupName !== 'Unnamed Group') {
                    await getClassificaPaymentsForGroup(groupObject);
                }

            } catch (err) {
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

    const useFetchWithCache = () => {
        const cache = useRef(new Map());

        return async (url, options = {}, cacheKey, ttl = 30000) => {
            const now = Date.now();
            const cached = cache.current.get(cacheKey);

            if (cached && (now - cached.timestamp) < ttl) {
                return cached.data;
            }

            const response = await fetch(url, options);
            const body = await response.json();

            const data = {
                status: response.status,
                body: body,
            }

            console.log("data", data);

            cache.current.set(cacheKey, {
                data,
                timestamp: now
            });

            return data;
        };
    };

    const cachedFetch = useFetchWithCache();

    const getClassificaPaymentsForGroup = useCallback(async (groupToUse = group) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError("No token provided");
            return;
        }

        const cacheKey = `classifica_${groupToUse?.id || groupToUse?.groupName}`;

        const requestBody = {
            groupId: groupToUse.id,
            groupName: groupToUse.groupName,
        }

        try {
            setPaymentLoading(true);
            const data = await cachedFetch(
                `${GETAWAY_SERVER_URL}/api/coffee/pagamenti/classifica`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody),
                    credentials: 'include',
                },
                cacheKey
            );

            switch (data.status) {
                case 200:
                    const payload = Array.isArray(data.body) ? data.body : [data.body];
                    console.log('API body ===>', data.body);
                    setClassificaPaymentsForGroup(payload);
                    break;
                case 204:
                    setClassificaPaymentsForGroup([]);
                    break;
                case 401:
                    setPaymentByGroupError("Sessione scaduta. Effettua nuovamente il login.");
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
            }

        } catch (err) {
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setPaymentByGroupError("Errore di connessione. Verifica la tua connessione internet.");
            } else {
                setPaymentByGroupError("Errore nel recupero dei pagamenti. Riprova più tardi.");
            }
            setClassificaPaymentsForGroup([]);
        } finally {
            setPaymentLoading(false);
        }
    }, [group?.id, group?.groupName])

    const myTurn = useMemo(() => {
        if (!groups || !user || !groups.userMembershipsdto) return false;

        const currentUserMembership = groups.userMembershipsdto.find(
            member => member.username === user
        );

        return currentUserMembership ? currentUserMembership.myTurn : false;
    }, [groups, user])

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
        setShowRegisterPaymentModal(true);
        setSuccessMessage('');
        setError(null);
    };

    const getFriend = async () => {
        setFriend('');

        const userMember = jp.query(groups, '$..[?(@.myTurn== true)]')

        if (userMember.length > 0) {
            const friendUsername = userMember[0].username;

            try {
                const token = localStorage.getItem('authToken');

                if (!token) {
                    setError("No token provided");
                    return;
                }

                const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/user?username=${encodeURIComponent(friendUsername)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true",
                    },
                    credentials: 'include'
                })

                if (!response.ok) {
                    setFriend('');
                }

                const userData = await response.json();
                setFriend(userData.name + ' ' + userData.lastname || '');

            } catch (error) {
                setFriend('');
            }
        } else {
            setFriend('');
        }
    }

    const skipPayment = () => {
        setShowSaltaPaymentModal(true);
        setSuccessMessage('');
        setError(null);
    };

    const payForFriend = () => {
        setShowPayForFriendModal(true);
        setSuccessMessage('');
        setError(null)
        getFriend()
    }

    const deleteGroup = () => {
        setShowDeleteModal(true)
        setSuccessMessage('');
        setError(null);
    };

    const inviteMember = () => {
        setShowInviteForm(true);
        setSuccessMessage('');
        setError(null);
    };

    const handleInputChangeInvitation = (e) => {
        setUserInvitation(e.target.value);
    }

    const handleInputChangeImporto = (e) => {
        setImporto(e.target.value);
    }

    const handleInputChangeDescrizione = (e) => {
        setDescrizione(e.target.value);
    }

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
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No token provided");
                return;
            }

            // First check if user exists in the system using the backend endpoint
            try {
                const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/user/by-username?username=${encodeURIComponent(userInvitation)}`, {
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
                setError(`L'utente "${userInvitation}" non esiste nel sistema`);
                return;
            }

            // If checks pass, send the invitation
            const requestBody = {
                username: userInvitation,
                groupName: group.groupName,
            }

            const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group/update/invitation`, {
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

            setSuccessMessage(`Invito inviato a ${userInvitation}!`);
            setUserInvitation('');

            setTimeout(() => {
                setShowInviteForm(false);
            }, 2000);

        } catch (err) {
            setError(err.message || 'Errore nell\'invio dell\'invito. Riprova.');
        } finally {
            setIsSubmitting(false);

        }
    };

    const confirmSkipPayment = async (e) => {
        e.preventDefault();
        setIsSkipping(true); // Use the correct state variable
        setError(null);
        setSuccessMessage('');

        try {

            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No token provided");
                return;
            }

            const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/salta/pagamento?groupNme=${encodeURIComponent(group.groupName)}`, {
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

            const cacheKey = `classifica_${group.id || group.groupName}`;
            clearCache(cacheKey);

            // Fetch the latest group data after payment
            const groupResponse = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group/get/${user}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify({username: user})
            });

            if (groupResponse.ok) {
                const allGroups = await groupResponse.json();
                const currentGroupName = group.groupName;

                // Find the current group in the list of groups
                const currentGroup = allGroups.find(g =>
                    g.name === currentGroupName ||
                    g.groupName === currentGroupName
                );

                if (currentGroup) {
                    const updatedGroup = {
                        id: currentGroup.id,
                        groupName: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                        name: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                        ...currentGroup
                    };

                    setGroup(updatedGroup);
                    setGroups(updatedGroup);
                    localStorage.setItem('group', JSON.stringify(updatedGroup));
                }
            }

            setTimeout(() => {
                setShowSaltaPaymentModal(false);
            }, 2000);

            await getClassificaPaymentsForGroup(group)

        } catch (err) {
            setError('Errore di rete. Riprova più tardi.');
        } finally {
            setIsSkipping(false);
            setMyTurn(checkMyTurn());
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

            const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group/delete/${group.groupName}`, {
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

            // Clear group data from localStorage
            localStorage.removeItem('group');

            setSuccessMessage(`Gruppo "${group.groupName}" eliminato con successo!`);

            // Navigate back to home after a short delay
            setTimeout(() => {
                navigate('/home');
            }, 2000);

        } catch (err) {
            setError('Errore nell\'eliminazione del gruppo. Riprova.');
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmPayForFriend = async (e) => {
        e.preventDefault();
        setIsPayForFriend(true);
        setError(null);
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No token provided");
                return;
            }

            const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/pagamento/pagaPer?groupNme=${encodeURIComponent(group.groupName)}`, {
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
            })

            if (!response.ok) {
                switch (response.status) {
                    case 500:
                        throw new Error('Problema durante la registrazione del pagamento');
                    case 400:
                    case 401:
                        throw new Error('Problema durante la registrazione del pagamento');
                }
            }

            setSuccessMessage('Pagamento registrato con successo')
            setImporto('')
            setDescrizione('')

            const cacheKey = `classifica_${group.id || group.groupName}`
            clearCache(cacheKey)

            // Fetch the latest group data after payment
            const groupResponse = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group/get/${user}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify({username: user})
            });

            if (groupResponse.ok) {
                const allGroups = await groupResponse.json();
                const currentGroupName = group.groupName;

                // Find the current group in the list of groups
                const currentGroup = allGroups.find(g =>
                    g.name === currentGroupName ||
                    g.groupName === currentGroupName
                );

                if (currentGroup) {
                    const updatedGroup = {
                        id: currentGroup.id,
                        groupName: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                        name: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                        ...currentGroup
                    };

                    setGroup(updatedGroup);
                    setGroups(updatedGroup);
                    localStorage.setItem('group', JSON.stringify(updatedGroup));
                }
            }

            setTimeout(() => {
                setShowPayForFriendModal(false);
            }, 2000);

            await getClassificaPaymentsForGroup(group)

        } catch (e) {
            setError('Problema durante la registrazione del pagamento')
        } finally {
            setIsSubmitting(false);
        }
    }

    const closeInviteForm = () => {
        setShowInviteForm(false);
        setError(null);
        setSuccessMessage('');
        setUserInvitation('');
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
        <div className={sharedStyles.loadingSpinner}>
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
    };

    const handleModalOverlayClick = (e, closeFunction) => {
        if (e.target === e.currentTarget) {
            closeFunction();
        }
    };

    const renderPaymentCards = () => {
        console.log('classificaPaymentsForGroup ===>', classificaPaymentsForGroup);
        if (!classificaPaymentsForGroup || classificaPaymentsForGroup.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <i className="fa-solid fa-ranking-star"></i>
                    </div>
                    <h3>Non sono stati ancora registrati pagamenti per questo gruppo</h3>
                    <p>Registra i pagamenti per i gruppi di cui fai parte</p>
                </div>
            );
        }

        return (
            <div className={styles.paymentCardsContainer}>
                {classificaPaymentsForGroup.map((payment, index) => (
                    <div key={index} className={styles.paymentCard}>
                        <div className={styles.paymentCardHeader}>
                            <i className="bi bi-ticket-perforated-fill"></i>
                            <span className={styles.paymentLabel}>Utente:</span>
                            <span className={styles.paymentData}>{payment.username}</span>
                        </div>
                        <div className={styles.paymentCardBody}>
                            <div className={styles.paymentInfo}>
                                <span className={styles.paymentLabel}>Totale pagamenti:</span>
                                <span className={styles.paymentDescription}>{payment.totalePagamenti}</span>
                            </div>
                        </div>
                        <div className={styles.paymentCardFooter}>
                            <span className={styles.paymentLabel}>Totale speso:</span>
                            <span className={styles.paymentAmount}>€{payment.totaleImporto}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // 2. Aggiungi una funzione per pulire la cache quando necessario
    const clearCache = (cacheKey) => {
        if (cacheKey) {
            cache.current.delete(cacheKey);
        } else {
            cache.current.clear();
        }
    };

    // 3. Aggiorna le funzioni che modificano il gruppo per pulire la cache
    const submitPayment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No token provided");
                return;
            }

            try {
                const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/pagamento?groupNme=${encodeURIComponent(group.groupName)}`, {
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
                setImporto('')
                setDescrizione('')

                // Fetch the latest group data after payment
                const groupResponse = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group/get/${user}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                    body: JSON.stringify({username: user})
                });

                if (groupResponse.ok) {
                    const allGroups = await groupResponse.json();
                    const currentGroupName = group.groupName;

                    // Find the current group in the list of groups
                    const currentGroup = allGroups.find(g =>
                        g.name === currentGroupName ||
                        g.groupName === currentGroupName
                    );

                    if (currentGroup) {
                        const updatedGroup = {
                            id: currentGroup.id,
                            groupName: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                            name: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                            ...currentGroup
                        };

                        setGroup(updatedGroup);
                        setGroups(updatedGroup);
                        localStorage.setItem('group', JSON.stringify(updatedGroup));
                    }
                }

                setTimeout(() => {
                    setShowRegisterPaymentModal(false);
                }, 2000);

                const cacheKey = `classifica_${group.id || group.groupName || group.name}`;
                clearCache(cacheKey);

                await getClassificaPaymentsForGroup(group);

            } catch (err) {
                setError(`Problema durante la registrazione del pagamento`);
            }
        } catch (err) {
            setError('Problema durante la registrazione del pagamento');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.groupPage}>
            <div className={styles.container}>

                <Header user={user} logout={logout}/>

                {/* Main */}
                <main className={styles.main}>
                    <button onClick={goBack} className={sharedStyles.groupButton} style={{marginBottom: '2rem'}}>
                        <i className="fa-solid fa-arrow-left"></i> <i className="fa-solid fa-house"></i>
                    </button>

                    <div className={styles.groupHeader}>
                        <h1 className={styles.sectionTitle} style={{textAlign: 'left', margin: 0}}>
                            <i className="fa-solid fa-user-group"></i> {group?.groupName || 'No Group Name'}
                        </h1>

                        {isAdmin && (<div className={styles.groupAdminButtons}>
                            <button
                                onClick={deleteGroup}
                                className={`${sharedStyles.groupButton} ${styles.deleteButton}`}
                            >
                                <i className="fa-solid fa-trash"></i> Elimina Gruppo
                            </button>

                            <button
                                onClick={inviteMember}
                                className={`${sharedStyles.groupButton} ${styles.inviteButton}`}
                            >
                                <i className="fa-solid fa-user-plus"></i> Invita Membro
                            </button>
                        </div>)}

                    </div>

                    {myTurn ? (
                        <>
                            <h1>È il tuo turno di pagare il caffè</h1>
                            <p>Puoi fare queste azioni</p>
                            <section className={styles.groupSection} style={{marginTop: '2rem'}}>
                                <div className={styles.actionButtons}>
                                    <button onClick={registerPayment}
                                            className={`${sharedStyles.groupButton} ${styles.actionButton}`}>
                                        Registra Pagamento
                                    </button>
                                    <button onClick={skipPayment}
                                            className={`${sharedStyles.groupButton} ${styles.actionButton}`}>
                                        Salta Pagamento
                                    </button>
                                    <button onClick={payForFriend}
                                            className={`${sharedStyles.groupButton} ${styles.actionButton}`}>
                                        Paga per un amico
                                    </button>
                                </div>
                            </section>
                        </>
                    ) : (
                        <>
                            <h1>Non è il tuo turno di pagare il caffè</h1>
                            <p>Non puoi fare queste azioni</p>
                            <p>Attendi il tuo turno per effettuare un pagamento</p>
                            <section className={styles.groupSection} style={{marginTop: '2rem'}}>
                                <div className={styles.actionButtons}>
                                    <button disabled={true} onClick={registerPayment}
                                            className={`${sharedStyles.groupButton} ${styles.actionButton}`}>
                                        Registra Pagamento
                                    </button>
                                    <button disabled={true} onClick={skipPayment}
                                            className={`${sharedStyles.groupButton} ${styles.actionButton}`}>
                                        Salta Pagamento
                                    </button>
                                    <button onClick={payForFriend}
                                            className={`${sharedStyles.groupButton} ${styles.actionButton}`}>
                                        Paga per un amico
                                    </button>
                                </div>
                            </section>
                        </>
                    )}

                    <div className={styles.separator}>
                        <div className={styles.separatorLeft}></div>
                        <img src="/coffee-medium-svgrepo-com.svg" alt=""/>
                        <div className={styles.separatorRight}></div>
                    </div>

                    <section className={styles.recentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}><i className="fa-solid fa-ranking-star"></i> Classifica
                                pagamenti</h2>
                        </div>

                        {paymentLoading ? (
                            <LoadingSpinner message={"Caricamento pagamenti..."}/>
                        ) : paymentByGroupError ? (
                            <ErrorMessage message={paymentByGroupError} onRetry={retryPayment}/>
                        ) : (
                            renderPaymentCards()
                        )}
                    </section>
                </main>

                {showInviteForm && (
                    <div className={sharedStyles.modalOverlay} onClick={(e) => handleModalOverlayClick(e, closeInviteForm)}>
                        <InviteUserModal
                            closeInviteForm={closeInviteForm}
                            submitInvite={submitInvite}
                            userInvitation={userInvitation}
                            isSubmitting={isSubmitting}
                            error={error}
                            successMessage={successMessage}
                            handleInputChangeInvitation={handleInputChangeInvitation}
                        />
                    </div>
                )}

                {showPayForFriendModal && (
                    <div className={sharedStyles.modalOverlay}
                         onClick={(e) => handleModalOverlayClick(e, closePayForFriendModal)}>
                        <PayForFriendModal
                            closePayForFriendModal={closePayForFriendModal}
                            handleInputChangeImporto={handleInputChangeImporto}
                            confirmPayForFriend={confirmPayForFriend}
                            importo={importo}
                            descrizione={descrizione}
                            handleInputChangeDescrizione={handleInputChangeDescrizione}
                            isSubmitting={isSubmitting}
                            error={error}
                            friend={friend}
                            successMessage={successMessage}
                        />
                    </div>
                )}

                {showRegisterPaymentModal && (
                    <div className={sharedStyles.modalOverlay}
                         onClick={(e) => handleModalOverlayClick(e, closeRegisterPaymentModal)}>
                        <RegisterPaymentModal
                            closeRegisterPaymentModal={closeRegisterPaymentModal}
                            handleInputChangeImporto={handleInputChangeImporto}
                            submitPayment={submitPayment}
                            importo={importo}
                            descrizione={descrizione}
                            handleInputChangeDescrizione={handleInputChangeDescrizione}
                            isSubmitting={isSubmitting}
                            error={error}
                            successMessage={successMessage}
                        />
                    </div>
                )}

                {showDeleteModal && (
                    <DeleteGroupModal
                        closeDeleteModal={closeDeleteModal}
                        confirmDeleteGroup={confirmDeleteGroup}
                        isDeleting={isDeleting}
                        error={error}
                        successMessage={successMessage}
                    />
                )}

                {showSaltaPaymentModal && (
                    <SkipPaymentModal
                        closeSaltaPaymentForm={closeSaltaPaymentForm}
                        confirmSkipPayment={confirmSkipPayment}
                        isSkipping={isSkipping}
                        error={error}
                        successMessage={successMessage}
                    />
                )}

            </div>
        </div>
    );

}

export default Group;