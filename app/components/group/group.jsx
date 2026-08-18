import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
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
import GroupInfoSection from '~/components/group/GroupInfoSection.jsx';
import groupStyles from "~/styles/group.module.css";
import {fetchCoffeeProfile, fetchGroupSummary, leaveGroup} from '~/services/userApi';
import {getMemberForUser, getCurrentTurnMember, memberDisplayName} from '~/utils/groupHelpers';
import {HOME_PATH, WELCOME_PATH} from '~/utils/routes';
import {useGroup} from '~/context/GroupContext.jsx';
import UserSettingsModal from '~/components/settings/modals/UserSettingsModal.jsx';
import GroupSettingsModal from '~/components/settings/modals/GroupSettingsModal.jsx';
import CoffeeSeparator from '~/components/shared/CoffeeSeparator.jsx';
import CoffeePatternIcons from '~/components/shared/CoffeePatternIcons.jsx';
import {useSettings} from '~/context/SettingsContext.jsx';

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
    const { groupName: groupNameParam } = useParams();
    const groupNameFromUrl = groupNameParam ? decodeURIComponent(groupNameParam) : '';
    const { replaceGroup, leaveToHome } = useGroup();
    const { userSettingsOpen, groupSettingsOpen, openGroupSettings } = useSettings();
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
    const [groupRules, setGroupRules] = useState({payForEnabled: true, payForAdminOnly: false, maxSkipPerRound: null});
    const [avatarKey, setAvatarKey] = useState('default');
    const [leavingGroup, setLeavingGroup] = useState(false);
    const [groupSummaryLoading, setGroupSummaryLoading] = useState(false);
    const isAnyModalOpen = showInviteForm || showDeleteModal || showRegisterPaymentModal || showSaltaPaymentModal || showPayForFriendModal || userSettingsOpen || groupSettingsOpen;

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

    const myMembership = useMemo(
        () => (user ? getMemberForUser(groups, user) : null),
        [groups, user]
    );

    const currentTurnMember = useMemo(() => getCurrentTurnMember(groups), [groups]);

    const refreshGroupSummary = useCallback(async (groupName) => {
        if (!groupName || groupName === 'Unnamed Group') return null;
        setGroupSummaryLoading(true);
        try {
            const summary = await fetchGroupSummary(groupName);
            if (!summary) return null;
            const next = {
                ...group,
                ...summary,
                groupName: summary.name || summary.groupName || groupName,
                name: summary.name || summary.groupName || groupName,
            };
            setGroup(next);
            setGroups(next);
            if (summary.maxSkipPerRound !== undefined || summary.payForEnabled !== undefined) {
                setGroupRules({
                    payForEnabled: summary.payForEnabled !== false,
                    payForAdminOnly: summary.payForAdminOnly === true,
                    maxSkipPerRound: summary.maxSkipPerRound ?? null,
                });
            }
            return next;
        } catch {
            return null;
        } finally {
            setGroupSummaryLoading(false);
        }
    }, [group]);

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

            if (!authToken) {
                navigate(WELCOME_PATH);
                return;
            }

            if (!groupNameFromUrl) {
                navigate(HOME_PATH, { replace: true });
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

                let groupObject = {
                    groupName: groupNameFromUrl,
                    name: groupNameFromUrl,
                };

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
                        (g) => g.name === groupNameFromUrl || g.groupName === groupNameFromUrl
                    );

                    if (currentGroup) {
                        groupObject = {
                            id: currentGroup.id,
                            groupName: currentGroup.name || currentGroup.groupName || groupNameFromUrl,
                            name: currentGroup.name || currentGroup.groupName || groupNameFromUrl,
                            ...currentGroup,
                        };
                    }
                }

                setGroup(groupObject);
                setGroups(groupObject);

                const summary = await fetchGroupSummary(groupObject.groupName).catch(() => null);
                if (!summary) {
                    navigate(HOME_PATH, { replace: true });
                    return;
                }

                groupObject = {
                    ...groupObject,
                    ...summary,
                    groupName: summary.name || summary.groupName || groupObject.groupName,
                    name: summary.name || summary.groupName || groupObject.groupName,
                };
                setGroup(groupObject);
                setGroups(groupObject);
                setGroupRules({
                    payForEnabled: summary.payForEnabled !== false,
                    payForAdminOnly: summary.payForAdminOnly === true,
                    maxSkipPerRound: summary.maxSkipPerRound ?? null,
                });
                await getClassificaPaymentsForGroup(groupObject);

                try {
                    const profile = await fetchCoffeeProfile();
                    setAvatarKey(profile?.avatarKey || 'default');
                } catch { /* keep default */
                }
            } catch {
                navigate(WELCOME_PATH);
            }
        };

        fetchData();
    }, [navigate, groupNameFromUrl]);

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
                await Promise.all([
                    getClassificaPaymentsForGroup(group),
                    refreshGroupSummary(group.groupName),
                ]);
            } catch {
                setError('Problema durante la registrazione del pagamento');
            } finally {
                setIsSubmitting(false);
            }
        },
        [clearCache, descrizione, getClassificaPaymentsForGroup, group, importo, refreshGroupSummary]
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
                await Promise.all([
                    getClassificaPaymentsForGroup(group),
                    refreshGroupSummary(group.groupName),
                ]);
            } catch {
                setError('Errore di rete. Riprova più tardi.');
            } finally {
                setIsSkipping(false);
            }
        },
        [clearCache, getClassificaPaymentsForGroup, group, refreshGroupSummary]
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

                setSuccessMessage(`Gruppo "${group.groupName}" eliminato con successo!`);

                setTimeout(() => leaveToHome(), 2000);
            } catch {
                setError("Errore nell'eliminazione del gruppo. Riprova.");
            } finally {
                setIsDeleting(false);
            }
        },
        [group.groupName, leaveToHome]
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
                await Promise.all([
                    getClassificaPaymentsForGroup(group),
                    refreshGroupSummary(group.groupName),
                ]);
            } catch {
                setError('Problema durante la registrazione del pagamento');
            } finally {
                setIsSubmitting(false);
            }
        },
        [clearCache, descrizione, getClassificaPaymentsForGroup, group, importo, refreshGroupSummary]
    );

    const handleSettingsSaved = useCallback((updated) => {
        const nextName = updated?.name || group.groupName;
        if (updated?.name) {
            const next = {...group, groupName: updated.name, name: updated.name};
            setGroup(next);
            setGroups(next);
            if (updated.name !== group.groupName) {
                replaceGroup(updated.name);
            }
        }
        if (updated) {
            setGroupRules({
                payForEnabled: updated.payForEnabled !== false,
                payForAdminOnly: updated.payForAdminOnly === true,
                maxSkipPerRound: updated.maxSkipPerRound ?? null,
            });
        }
        if (nextName) {
            refreshGroupSummary(nextName);
        }
    }, [group, refreshGroupSummary, replaceGroup]);

    const handleLeaveGroup = useCallback(async () => {
        if (!window.confirm(`Vuoi lasciare il gruppo "${group.groupName}"?`)) return;
        setLeavingGroup(true);
        setError(null);
        try {
            await leaveGroup(group.groupName);
            leaveToHome();
        } catch (err) {
            setError(normalizeError(err) || 'Errore durante l\'uscita dal gruppo');
        } finally {
            setLeavingGroup(false);
        }
    }, [group.groupName, leaveToHome]);

    return (
        <div className={styles.groupPage}>
            <CoffeePatternIcons variant="group" />

            <div className={`${styles.container} ${isAnyModalOpen ? 'modal-active' : ''}`}>

                <Header user={user} logout={logout} showGroupSettings={isAdmin} avatarKey={avatarKey}/>

                <main className={styles.main}>
                    <GroupHeader
                        group={group}
                        currentUser={user}
                        onGoBack={goBack}
                        isAdmin={isAdmin}
                        onOpenSettings={openGroupSettings}
                    />

                    <div className={styles.groupGridLayout}>
                        <div className={styles.groupMainCol}>
                            {groupSummaryLoading ? (
                                <p className={sharedStyles.summaryText}>Aggiornamento turno...</p>
                            ) : (
                                <GroupInfoSection group={groups} currentUser={user} />
                            )}

                            {!isAdmin && (
                                <button
                                    type="button"
                                    onClick={handleLeaveGroup}
                                    className={`${sharedStyles.groupButton} ${sharedStyles.secondaryButton} ${sharedStyles.leaveGroupBtn}`}
                                    disabled={leavingGroup}
                                >
                                    <i className="fa-solid fa-right-from-bracket"/> {leavingGroup ? 'Uscita...' : 'Lascia gruppo'}
                                </button>
                            )}
                        </div>

                        <aside className={styles.groupSidebar}>
                            <PaymentActions
                                myTurn={myTurn}
                                canPayFor={canPayFor}
                                maxSkipPerMonth={groups.maxSkipPerMonth ?? 4}
                                maxPayForPerMonth={groups.maxPayForPerMonth ?? 4}
                                myMembership={myMembership}
                                currentTurnUsername={groups.currentTurnUsername || currentTurnMember?.username}
                                currentTurnDisplayName={currentTurnMember ? memberDisplayName(currentTurnMember) : null}
                                onRegisterPayment={registerPayment}
                                onSkipPayment={skipPayment}
                                onPayForFriend={payForFriend}
                                paidCount={groups.roundPaidCount ?? 0}
                                pendingCount={groups.roundPendingCount ?? 0}/>
                        </aside>
                    </div>

                    <CoffeeSeparator />

                    <PaymentCards
                        loading={paymentLoading}
                        error={paymentByGroupError}
                        payments={classificaPaymentsForGroup}
                        onRetry={onRetry}/>

                    <CoffeeSeparator />

                    <GroupStatsSection groupName={group?.groupName}/>

                </main>

            </div>

            {userSettingsOpen && <UserSettingsModal />}

            {groupSettingsOpen && (
                <GroupSettingsModal
                    groupName={group?.groupName}
                    isAdmin={isAdmin}
                    onInviteMember={inviteMember}
                    onDeleteGroup={deleteGroup}
                    onSettingsSaved={handleSettingsSaved}
                />
            )}

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


        </div>
    );
};

export default Group;