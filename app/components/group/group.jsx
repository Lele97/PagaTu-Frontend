import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/group.module.css';
import sharedStyles from '~/styles/shared.module.css';
import Header from '../header/header.jsx';
import GroupHeader from '../group/groupHeader.jsx';
import PaymentActions from '../group/paymentActions.jsx';
import PaymentCards from '../group/paymentCards.jsx';
import jp from 'jsonpath';

const GETAWAY_SERVER_URL = import.meta.env.VITE_GETAWAY_SERVER_URL;

const normalizeError = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (typeof err === 'number') return String(err);
    if (err?.message && typeof err.message === 'string') return err.message;
    try {
        return JSON.stringify(err);
    } catch {
        return 'Errore sconosciuto';
    }
};

const InviteUserModal = React.memo(
    ({
         closeInviteForm,
         submitInvite,
         userInvitation,
         error,
         successMessage,
         isSubmitting,
         handleInputChangeInvitation,
     }) => {
        const errorText = normalizeError(error);

        return (
            <div
                className={sharedStyles.modalOverlay}
                onClick={(e) => {
                    if (e.target === e.currentTarget) closeInviteForm();
                }}
            >
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
                                autoFocus
                            />
                        </div>

                        {errorText && <div className={sharedStyles.errorMessageModal}>{errorText}</div>}
                        {successMessage && <div className={sharedStyles.successMessage}>{successMessage}</div>}

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
            </div>
        );
    }
);

const RegisterPaymentModal = React.memo(
    ({
         submitPayment,
         importo,
         descrizione,
         error,
         successMessage,
         isSubmitting,
         closeRegisterPaymentModal,
         handleInputChangeImporto,
         handleInputChangeDescrizione,
     }) => {
        const errorText = normalizeError(error);

        return (
            <div
                className={sharedStyles.modalOverlay}
                onClick={(e) => {
                    if (e.target === e.currentTarget) closeRegisterPaymentModal();
                }}
            >
                <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h2>Registra il pagamento</h2>

                    <div
                        style={{
                            backgroundColor: 'var(--coffee-50)',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            margin: '1rem 0',
                            borderLeft: '3px solid var(--coffee-600)',
                        }}
                    >
                        <p style={{margin: '0 0 0.5rem 0', fontWeight: '500'}}>
                            Cosa succede quando registri un pagamento:
                        </p>
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

                        {errorText && <div className={sharedStyles.errorMessageModal}>{errorText}</div>}
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
        );
    }
);

const PayForFriendModal = React.memo(
    ({
         confirmPayForFriend,
         friend,
         importo,
         descrizione,
         error,
         successMessage,
         isSubmitting,
         closePayForFriendModal,
         handleInputChangeImporto,
         handleInputChangeDescrizione,
     }) => {
        const errorText = normalizeError(error);

        return (
            <div
                className={sharedStyles.modalOverlay}
                onClick={(e) => {
                    if (e.target === e.currentTarget) closePayForFriendModal();
                }}
            >
                <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h2>Paga per un amico</h2>

                    <h6>
                        Stai pagando al posto di <strong>{friend || '...'}</strong>
                    </h6>

                    <div
                        style={{
                            backgroundColor: 'var(--coffee-50)',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            margin: '1rem 0',
                            borderLeft: '3px solid var(--coffee-600)',
                        }}
                    >
                        <p style={{margin: '0 0 0.5rem 0', fontWeight: '500'}}>
                            Cosa succede quando registri un pagamento:
                        </p>
                        <ul style={{margin: '0', paddingLeft: '1.5rem'}}>
                            <li>Il tuo stato verrà marcato come "pagato" per questo turno</li>
                            <li>Il pagamento verrà registrato con importo, descrizione e data corrente</li>
                            <li>Verrà automaticamente selezionato il prossimo pagatore del gruppo</li>
                            <li>Il pagamento apparirà nella classifica del gruppo</li>
                        </ul>
                    </div>

                    <form onSubmit={confirmPayForFriend}>
                        <div className={styles.formGroup}>
                            <label htmlFor="importoFriend">Importo:</label>
                            <input
                                type="number"
                                id="importoFriend"
                                value={importo}
                                onChange={handleInputChangeImporto}
                                required
                                className={sharedStyles.formInput}
                                placeholder="Inserisci importo..."
                                step="0.01"
                                min="0"
                                autoFocus
                            />

                            <label htmlFor="descrizioneFriend">Descrizione:</label>
                            <input
                                type="text"
                                id="descrizioneFriend"
                                value={descrizione}
                                onChange={handleInputChangeDescrizione}
                                required
                                className={sharedStyles.formInput}
                                placeholder="Inserisci una descrizione del pagamento..."
                            />
                        </div>

                        {errorText && <div className={sharedStyles.errorMessageModal}>{errorText}</div>}
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
        );
    }
);

const DeleteGroupModal = React.memo(
    ({groupName, closeDeleteModal, confirmDeleteGroup, isDeleting, error, successMessage}) => {
        const errorText = normalizeError(error);

        return (
            <div
                className={sharedStyles.modalOverlay}
                onClick={(e) => {
                    if (e.target === e.currentTarget) closeDeleteModal();
                }}
            >
                <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h2>Elimina Gruppo</h2>

                    <p>
                        Sei sicuro di voler eliminare il gruppo{' '}
                        <strong className={styles.groupName}>{groupName}</strong>?
                    </p>

                    <p style={{color: '#dc3545', fontSize: '0.9em', marginTop: '1rem'}}>
                        Questa azione non può essere annullata. Tutti i dati del gruppo verranno persi definitivamente.
                    </p>

                    {errorText && <div className={sharedStyles.errorMessageModal}>{errorText}</div>}
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
        );
    }
);

const SkipPaymentModal = React.memo(
    ({closeSaltaPaymentForm, confirmSkipPayment, isSkipping, error, successMessage}) => {
        const errorText = normalizeError(error);

        return (
            <div
                className={sharedStyles.modalOverlay}
                onClick={(e) => {
                    if (e.target === e.currentTarget) closeSaltaPaymentForm();
                }}
            >
                <div className={sharedStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h2>Salta Pagamento</h2>
                    <p>Vuoi saltare il tuo turno di pagamento per questo gruppo?</p>

                    <div
                        style={{
                            backgroundColor: 'var(--coffee-50)',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            margin: '1rem 0',
                            borderLeft: '3px solid var(--coffee-600)',
                        }}
                    >
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

                    {errorText && <div className={sharedStyles.errorMessageModal}>{errorText}</div>}
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
        );
    }
);

const Group = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [group, setGroup] = useState({groupName: 'Unnamed Group'});
    const [groups, setGroups] = useState({});
    const [classificaPaymentsForGroup, setClassificaPaymentsForGroup] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRegisterPaymentModal, setShowRegisterPaymentModal] = useState(false);
    const [showSaltaPaymentModal, setShowSaltaPaymentModal] = useState(false);
    const [showPayForFriendModal, setShowPayForFriendModal] = useState(false);
    const [userInvitation, setUserInvitation] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [importo, setImporto] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [error, setError] = useState(null);
    const [paymentByGroupError, setPaymentByGroupError] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [friend, setFriend] = useState('');
    const isAnyModalOpen = showInviteForm || showDeleteModal || showRegisterPaymentModal || showSaltaPaymentModal || showPayForFriendModal;
    const requestCacheRef = useRef(new Map());

    const clearCache = useCallback((cacheKey) => {
        if (!cacheKey) {
            requestCacheRef.current.clear();
            return;
        }
        requestCacheRef.current.delete(cacheKey);
    }, []);

    const cachedFetchJson = useCallback(async (url, options = {}, cacheKey, ttl = 30000) => {
        const now = Date.now();
        const cached = requestCacheRef.current.get(cacheKey);

        if (cached && now - cached.timestamp < ttl) {
            return cached.data;
        }

        const response = await fetch(url, options);

        let body = null;
        try {
            body = await response.json();
        } catch {
            body = null;
        }

        const data = {status: response.status, body};

        requestCacheRef.current.set(cacheKey, {data, timestamp: now});
        return data;
    }, []);

    const isUserAdmin = useCallback(
        (username) => {
            if (!groups || !username || !groups.userMembershipsdto) return false;
            const m = groups.userMembershipsdto.find((member) => member.username === username);
            return Boolean(m?.isAdmin);
        },
        [groups]
    );

    const myTurn = useMemo(() => {
        if (!groups || !user || !groups.userMembershipsdto) return false;
        const currentUserMembership = groups.userMembershipsdto.find((member) => member.username === user);
        return Boolean(currentUserMembership?.myTurn);
    }, [groups, user]);

    const getClassificaPaymentsForGroup = useCallback(
        async (groupToUse = group) => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setPaymentByGroupError('No token provided');
                return;
            }

            const groupName = groupToUse?.groupName || '';
            const cacheKey = `classifica_${groupToUse?.id || groupName || 'unknown'}`;
            const requestBody = {groupId: groupToUse?.id, groupName};

            try {
                setPaymentLoading(true);
                setPaymentByGroupError(null);

                const data = await cachedFetchJson(
                    `${GETAWAY_SERVER_URL}/api/coffee/pagamenti/classifica`,
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(requestBody),
                        credentials: 'include',
                    },
                    cacheKey
                );

                const errorMessage = normalizeError(data?.body?.message || data?.body);

                switch (data.status) {
                    case 200: {
                        const payload = Array.isArray(data.body) ? data.body : data.body ? [data.body] : [];
                        setClassificaPaymentsForGroup(payload);
                        break;
                    }
                    case 204:
                        setClassificaPaymentsForGroup([]);
                        break;
                    case 401:
                        setPaymentByGroupError('Sessione scaduta. Effettua nuovamente il login.');
                        setTimeout(() => navigate('/login'), 2000);
                        break;
                    case 403:
                        setPaymentByGroupError(`Accesso negato. Verifica di appartenere al gruppo "${groupName || 'sconosciuto'}"`);
                        break;
                    case 404:
                        setPaymentByGroupError(errorMessage || `Gruppo "${groupName || 'sconosciuto'}" non trovato`);
                        break;
                    default:
                        setPaymentByGroupError(errorMessage || 'Errore nel recupero dei pagamenti. Riprova più tardi.');
                        setClassificaPaymentsForGroup([]);
                        break;
                }
            } catch (err) {
                setPaymentByGroupError('Errore di connessione. Verifica la tua connessione internet.');
                setClassificaPaymentsForGroup([]);
            } finally {
                setPaymentLoading(false);
            }
        },
        [cachedFetchJson, group, navigate]
    );

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
                    username =
                        typeof parsedUser === 'object'
                            ? parsedUser?.username || parsedUser?.name || parsedUser?.email
                            : parsedUser;
                }
                if (!username) throw new Error('No user data available');

                setUser(username);

                let groupObject = {groupName: 'Unnamed Group'};
                let parsedGroup = null;

                if (groupData) {
                    parsedGroup = JSON.parse(groupData);
                    const groupName = parsedGroup?.name || parsedGroup?.groupName;

                    // NOTE: mantenuto endpoint come nel tuo file
                    const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group/get/${username}`, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                        credentials: 'include',
                        body: JSON.stringify({username}),
                    });

                    if (response.ok) {
                        const allGroups = await response.json();
                        const currentGroup = allGroups.find(
                            (g) =>
                                g.name === groupName ||
                                g.groupName === groupName ||
                                g.id?.toString() === parsedGroup?.id?.toString()
                        );

                        if (currentGroup) {
                            groupObject = {
                                id: currentGroup.id,
                                groupName: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                                name: currentGroup.name || currentGroup.groupName || 'Unnamed Group',
                                ...currentGroup,
                            };
                            localStorage.setItem('group', JSON.stringify(groupObject));
                        } else {
                            groupObject = {
                                id: parsedGroup.id,
                                groupName: parsedGroup.name || parsedGroup.groupName || 'Unnamed Group',
                                name: parsedGroup.name || parsedGroup.groupName || 'Unnamed Group',
                                ...parsedGroup,
                            };
                        }
                    } else {
                        groupObject = {
                            id: parsedGroup?.id,
                            groupName: parsedGroup?.name || parsedGroup?.groupName || 'Unnamed Group',
                            name: parsedGroup?.name || parsedGroup?.groupName || 'Unnamed Group',
                            ...parsedGroup,
                        };
                    }
                }

                setGroup(groupObject);
                setGroups(groupObject);

                // Fix: condizione corretta (prima era sempre true per via di "||")
                if (groupObject?.id && groupObject?.groupName && groupObject.groupName !== 'Unnamed Group') {
                    await getClassificaPaymentsForGroup(groupObject);
                }
            } catch {
                navigate('/login');
            }
        };

        fetchData();
    }, [getClassificaPaymentsForGroup, navigate]);

    useEffect(() => {
        if (user && groups && groups.userMembershipsdto) {
            setIsAdmin(isUserAdmin(user));
        }
    }, [groups, isUserAdmin, user]);

    // Scroll lock mentre modale aperta (senza querySelector su classi CSS module)
    useEffect(() => {
        if (!isAnyModalOpen) {
            document.body.style.overflow = 'unset';
            return;
        }
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAnyModalOpen]);

    // Auto-clear error (come nel tuo file)
    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(null), 1000);
        return () => clearTimeout(timer);
    }, [error]);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    }, [navigate]);

    const goBack = useCallback(() => navigate('/home'), [navigate]);

    const registerPayment = useCallback(() => {
        setShowRegisterPaymentModal(true);
        setSuccessMessage('');
        setError(null);
    }, []);

    const skipPayment = useCallback(() => {
        setShowSaltaPaymentModal(true);
        setSuccessMessage('');
        setError(null);
    }, []);

    const deleteGroup = useCallback(() => {
        setShowDeleteModal(true);
        setSuccessMessage('');
        setError(null);
    }, []);

    const inviteMember = useCallback(() => {
        setShowInviteForm(true);
        setSuccessMessage('');
        setError(null);
    }, []);

    const handleInputChangeInvitation = useCallback((e) => setUserInvitation(e.target.value), []);

    const handleInputChangeImporto = useCallback((e) => setImporto(e.target.value), []);

    const handleInputChangeDescrizione = useCallback((e) => setDescrizione(e.target.value), []);

    const getFriend = useCallback(async () => {
        setFriend('');

        const userMember = jp.query(groups, '$..[?(@.myTurn== true)]');
        if (!userMember?.length) return;

        const friendUsername = userMember[0]?.username;
        if (!friendUsername) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('No token provided');
                return;
            }

            const response = await fetch(
                `${GETAWAY_SERVER_URL}/api/coffee/user?username=${encodeURIComponent(friendUsername)}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                    },
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                setFriend('');
                return;
            }

            const userData = await response.json();
            const fullName = `${userData?.name || ''} ${userData?.lastname || ''}`.trim();
            setFriend(fullName);
        } catch {
            setFriend('');
        }
    }, [groups]);

    const payForFriend = useCallback(() => {
        setShowPayForFriendModal(true);
        setSuccessMessage('');
        setError(null);
        getFriend();
    }, [getFriend]);

    const closeInviteForm = useCallback(() => {
        setShowInviteForm(false);
        setError(null);
        setSuccessMessage('');
        setUserInvitation('');
    }, []);

    const closeSaltaPaymentForm = useCallback(() => {
        setShowSaltaPaymentModal(false);
        setError(null);
        setSuccessMessage('');
    }, []);

    const closeRegisterPaymentModal = useCallback(() => {
        setShowRegisterPaymentModal(false);
        setError(null);
        setSuccessMessage('');
    }, []);

    const closePayForFriendModal = useCallback(() => {
        setShowPayForFriendModal(false);
        setError(null);
        setSuccessMessage('');
    }, []);

    const closeDeleteModal = useCallback(() => {
        setShowDeleteModal(false);
        setError(null);
        setSuccessMessage('');
    }, []);

    const onRetry = useCallback(async () => {
        if (group) await getClassificaPaymentsForGroup(group);
    }, [getClassificaPaymentsForGroup, group]);

    const submitInvite = useCallback(
        async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            setError(null);
            setSuccessMessage('');

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No token provided');
                    return;
                }

                // Check user exists
                try {
                    const response = await fetch(
                        `${GETAWAY_SERVER_URL}/api/coffee/user/by-username?username=${encodeURIComponent(userInvitation)}`,
                        {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({}),
                        }
                    );

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const userData = await response.json();
                    if (!userData || Object.keys(userData).length === 0) {
                        setError(`L'utente "${userInvitation}" non esiste nel sistema`);
                        return;
                    }

                    if (groups?.userMembershipsdto?.some((m) => m.username === userInvitation)) {
                        setError(`L'utente "${userInvitation}" è già membro del gruppo`);
                        return;
                    }
                } catch {
                    setError(`L'utente "${userInvitation}" non esiste nel sistema`);
                    return;
                }

                const requestBody = {username: userInvitation, groupName: group.groupName};

                const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group/update/invitation`, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    setError(`HTTP ${response.status}: ${errorText}`);
                    return;
                }

                setSuccessMessage(`Invito inviato a ${userInvitation}!`);
                setUserInvitation('');

                setTimeout(() => setShowInviteForm(false), 2000);
            } catch (err) {
                setError(normalizeError(err) || "Errore nell'invio dell'invito. Riprova.");
            } finally {
                setIsSubmitting(false);
            }
        },
        [group.groupName, groups?.userMembershipsdto, userInvitation]
    );

    const submitPayment = useCallback(
        async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            setError(null);
            setSuccessMessage('');

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No token provided');
                    return;
                }

                const response = await fetch(
                    `${GETAWAY_SERVER_URL}/api/coffee/pagamento?groupNme=${encodeURIComponent(group.groupName)}`,
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: 'include',
                        body: JSON.stringify({importo, descrizione}),
                    }
                );

                if (!response.ok) {
                    setError('Problema durante la registrazione del pagamento');
                    return;
                }

                setSuccessMessage('Pagamento registrato con successo');
                setImporto('');
                setDescrizione('');

                // Invalida cache classifica e ricarica
                clearCache(`classifica_${group.id || group.groupName || 'unknown'}`);

                setTimeout(() => setShowRegisterPaymentModal(false), 2000);
                await getClassificaPaymentsForGroup(group);
            } catch {
                setError('Problema durante la registrazione del pagamento');
            } finally {
                setIsSubmitting(false);
            }
        },
        [clearCache, descrizione, getClassificaPaymentsForGroup, group, importo]
    );

    const confirmSkipPayment = useCallback(
        async (e) => {
            e.preventDefault();
            setIsSkipping(true);
            setError(null);
            setSuccessMessage('');

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No token provided');
                    return;
                }

                const response = await fetch(
                    `${GETAWAY_SERVER_URL}/api/coffee/salta/pagamento?groupNme=${encodeURIComponent(group.groupName)}`,
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: 'include',
                        body: JSON.stringify({}),
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    setError(`Si è verificato un problema: ${errorText || 'Errore sconosciuto'}`);
                    return;
                }

                setSuccessMessage('Pagamento saltato con successo!');

                clearCache(`classifica_${group.id || group.groupName || 'unknown'}`);

                setTimeout(() => setShowSaltaPaymentModal(false), 2000);
                await getClassificaPaymentsForGroup(group);
            } catch {
                setError('Errore di rete. Riprova più tardi.');
            } finally {
                setIsSkipping(false);
            }
        },
        [clearCache, getClassificaPaymentsForGroup, group]
    );

    const confirmDeleteGroup = useCallback(
        async (e) => {
            e.preventDefault();
            setIsDeleting(true);
            setError(null);
            setSuccessMessage('');

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No token provided');
                    return;
                }

                const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group/delete/${group.groupName}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    setError('Il gruppo è composto da due o più persone');
                    return;
                }

                localStorage.removeItem('group');
                setSuccessMessage(`Gruppo "${group.groupName}" eliminato con successo!`);

                setTimeout(() => navigate('/home'), 2000);
            } catch {
                setError("Errore nell'eliminazione del gruppo. Riprova.");
            } finally {
                setIsDeleting(false);
            }
        },
        [group.groupName, navigate]
    );

    const confirmPayForFriend = useCallback(
        async (e) => {
            e.preventDefault();
            setError(null);
            setSuccessMessage('');
            setIsSubmitting(true);

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No token provided');
                    return;
                }

                const response = await fetch(
                    `${GETAWAY_SERVER_URL}/api/coffee/pagamento/pagaPer?groupNme=${encodeURIComponent(group.groupName)}`,
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: 'include',
                        body: JSON.stringify({importo, descrizione}),
                    }
                );

                if (!response.ok) {
                    setError('Problema durante la registrazione del pagamento');
                    return;
                }

                setSuccessMessage('Pagamento registrato con successo');
                setImporto('');
                setDescrizione('');

                clearCache(`classifica_${group.id || group.groupName || 'unknown'}`);

                setTimeout(() => setShowPayForFriendModal(false), 2000);
                await getClassificaPaymentsForGroup(group);
            } catch {
                setError('Problema durante la registrazione del pagamento');
            } finally {
                setIsSubmitting(false);
            }
        },
        [clearCache, descrizione, getClassificaPaymentsForGroup, group, importo]
    );

    return (
        <div className={styles.groupPage}>
            {/* Fix blur: aggiungo "modal-active" come classe globale quando serve */}
            <div className={`${styles.container} ${isAnyModalOpen ? 'modal-active' : ''}`}>
                <Header user={user} logout={logout}/>

                <main className={styles.main}>
                    <button onClick={goBack} className={sharedStyles.groupButton} style={{marginBottom: '2rem'}}>
                        <i className="fa-solid fa-arrow-left"></i> <i className="fa-solid fa-house"></i>
                    </button>

                    <GroupHeader
                        isAdmin={isAdmin}
                        deleteGroup={deleteGroup}
                        group={group}
                        inviteMenber={inviteMember}/>

                    <PaymentActions
                        myTurn={myTurn}
                        onRegisterPayment={registerPayment}
                        onSkipPayment={skipPayment}
                        onPayForFriend={payForFriend}/>

                    <div className={styles.separator}>
                        <div className={styles.separatorLeft}></div>
                        <img src="/coffee-medium-svgrepo-com.svg" alt="Coffee icon separator"/>
                        <div className={styles.separatorRight}></div>
                    </div>

                    <PaymentCards
                        loading={paymentLoading}
                        error={paymentByGroupError}
                        payments={classificaPaymentsForGroup}
                        onRetry={onRetry}/>

                </main>

                {showInviteForm && (
                    <InviteUserModal
                        closeInviteForm={closeInviteForm}
                        submitInvite={submitInvite}
                        userInvitation={userInvitation}
                        isSubmitting={isSubmitting}
                        error={error}
                        successMessage={successMessage}
                        handleInputChangeInvitation={handleInputChangeInvitation}
                    />
                )}

                {showPayForFriendModal && (
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
                )}

                {showRegisterPaymentModal && (
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
                )}

                {showDeleteModal && (
                    <DeleteGroupModal
                        groupName={group?.groupName || 'Unnamed Group'}
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
};

export default Group;
