import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/group.module.css';
import sharedStyles from '~/styles/shared.module.css';
import Header from '../header/header.jsx';
import GroupHeader from '../group/groupHeader.jsx';
import PaymentActions from '../group/paymentActions.jsx';
import PaymentCards from '../group/paymentCards.jsx';
import jp from 'jsonpath';
import RegisterPaymentModal from '../group/modals/RegisterPaymentModal.jsx'
import DeleteGroupModal from "~/components/group/modals/DeleteGroupModal.jsx";
import InviteUserModal from "~/components/group/modals/InviteUserModal.jsx";
import SkipPaymentModal from "~/components/group/modals/SkipPaymentModal.jsx";
import PayForFriendModal from "~/components/group/modals/PayForFriendModal.jsx";
import GroupStatsSection from '~/components/group/GroupStatsSection.jsx';
import GroupSettingsDrawer from '~/components/settings/GroupSettingsDrawer.jsx';
import groupStyles from "~/styles/group.module.css";
import { fetchCoffeeProfile, leaveGroup } from '~/services/userApi';
import { WELCOME_PATH } from '~/utils/routes';
import UserSettingsModal from '~/components/settings/modals/UserSettingsModal.jsx';
import { useSettings } from '~/context/SettingsContext.jsx';

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

const Group = () => {

    const navigate = useNavigate();
    const { userSettingsOpen } = useSettings();
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
    const [groupRules, setGroupRules] = useState({ payForEnabled: true, payForAdminOnly: false, maxSkipPerRound: null });
    const [avatarKey, setAvatarKey] = useState('default');
    const [leavingGroup, setLeavingGroup] = useState(false);
    const isAnyModalOpen = showInviteForm || showDeleteModal || showRegisterPaymentModal || showSaltaPaymentModal || showPayForFriendModal || userSettingsOpen;

    const canPayFor = groupRules.payForEnabled !== false
        && (!groupRules.payForAdminOnly || isAdmin);
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
                        setTimeout(() => navigate(WELCOME_PATH), 2000);
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
                navigate(WELCOME_PATH);
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
                    try {
                        const rulesRes = await fetch(
                            `${GETAWAY_SERVER_URL}/api/coffee/regole/gruppo?groupName=${encodeURIComponent(groupObject.groupName)}`,
                            { headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' }, credentials: 'include' }
                        );
                        if (rulesRes.ok) {
                            setGroupRules(await rulesRes.json());
                        }
                    } catch { /* keep defaults */ }
                }
                try {
                    const profile = await fetchCoffeeProfile();
                    setAvatarKey(profile?.avatarKey || 'default');
                } catch { /* keep default */ }
            } catch {
                navigate(WELCOME_PATH);
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        if (user && groups && groups.userMembershipsdto) {
            setIsAdmin(isUserAdmin(user));
        }
    }, [groups, isUserAdmin, user]);

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

    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(null), 1000);
        return () => clearTimeout(timer);
    }, [error]);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate(WELCOME_PATH);
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
                    `${GETAWAY_SERVER_URL}/api/coffee/pagamento?groupName=${encodeURIComponent(group.groupName)}`,
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
                    `${GETAWAY_SERVER_URL}/api/coffee/salta/pagamento?groupName=${encodeURIComponent(group.groupName)}`,
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
                    setError('Non è possibile eliminare un gruppo con due o più persone');
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
                    `${GETAWAY_SERVER_URL}/api/coffee/pagamento/pagaPer?groupName=${encodeURIComponent(group.groupName)}`,
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

    const handleSettingsSaved = useCallback((updated) => {
        if (updated?.name) {
            const next = { ...group, groupName: updated.name, name: updated.name };
            setGroup(next);
            setGroups(next);
            localStorage.setItem('group', JSON.stringify(next));
        }
        if (updated) {
            setGroupRules({
                payForEnabled: updated.payForEnabled !== false,
                payForAdminOnly: updated.payForAdminOnly === true,
                maxSkipPerRound: updated.maxSkipPerRound ?? null,
            });
        }
    }, [group]);

    const handleLeaveGroup = useCallback(async () => {
        if (!window.confirm(`Vuoi lasciare il gruppo "${group.groupName}"?`)) return;
        setLeavingGroup(true);
        setError(null);
        try {
            await leaveGroup(group.groupName);
            localStorage.removeItem('group');
            navigate('/home');
        } catch (err) {
            setError(normalizeError(err) || 'Errore durante l\'uscita dal gruppo');
        } finally {
            setLeavingGroup(false);
        }
    }, [group.groupName, navigate]);

    return (
        <div className={styles.groupPage}>
            <div className={`${styles.container} ${isAnyModalOpen ? 'modal-active' : ''}`}>
                <Header user={user} logout={logout} showGroupSettings={isAdmin} avatarKey={avatarKey} />

                <main className={styles.main}>
                    <button onClick={goBack} className={sharedStyles.groupButton} style={{marginBottom: '2rem'}}>
                        <i className="fa-solid fa-arrow-left"></i> <i className="fa-solid fa-house"></i>
                    </button>

                    <GroupHeader group={group} />

                    {!isAdmin && (
                        <button
                            type="button"
                            onClick={handleLeaveGroup}
                            className={sharedStyles.groupButton}
                            disabled={leavingGroup}
                            style={{ marginBottom: '1rem' }}
                        >
                            <i className="bi bi-box-arrow-right" /> {leavingGroup ? 'Uscita...' : 'Lascia gruppo'}
                        </button>
                    )}

                    <PaymentActions
                        myTurn={myTurn}
                        canPayFor={canPayFor}
                        maxSkipPerRound={groupRules.maxSkipPerRound}
                        onRegisterPayment={registerPayment}
                        onSkipPayment={skipPayment}
                        onPayForFriend={payForFriend} />

                    <div className={styles.separator}>
                        <div className={styles.separatorLeft}></div>
                        <img src="/coffee-medium-svgrepo-com.svg" alt="Coffee icon separator"/>
                        <div className={styles.separatorRight}></div>
                    </div>

                    <PaymentCards
                        loading={paymentLoading}
                        error={paymentByGroupError}
                        payments={classificaPaymentsForGroup}
                        onRetry={onRetry} />

                    <div className={groupStyles.separator}>
                        <div className={groupStyles.separatorLeft}></div>
                        <img src="/coffee-medium-svgrepo-com.svg" alt="" />
                        <div className={groupStyles.separatorRight}></div>
                    </div>

                    <GroupStatsSection groupName={group?.groupName} />

                </main>

                <GroupSettingsDrawer
                    groupName={group?.groupName}
                    isAdmin={isAdmin}
                    onInviteMember={inviteMember}
                    onDeleteGroup={deleteGroup}
                    onSettingsSaved={handleSettingsSaved}
                />

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
                        submitPayment={submitPayment}
                        importo={importo}
                        descrizione={descrizione}
                        error={error}
                        successMessage={successMessage}
                        isSubmitting={isSubmitting}
                        closeRegisterPaymentModal={closeRegisterPaymentModal}
                        handleInputChangeImporto={handleInputChangeImporto}
                        handleInputChangeDescrizione={handleInputChangeDescrizione}
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

                {userSettingsOpen && <UserSettingsModal />}
            </div>
        </div>
    );
};

export default Group;