import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCoffeeProfile, fetchGroupSummary, KARMA_OPS, leaveGroup, updateCoffeeKarma } from '~/services/userApi';
import { getCurrentTurnMember, getMemberForUser } from '~/utils/groupHelpers';
import { HOME_PATH, WELCOME_PATH } from '~/utils/routes';
import { createCachedFetcher, messageFromBody } from '~/utils/api';
import {
    deleteGroup as deleteGroupRequest,
    getGroupsByUsername,
    getPaymentRanking,
    getUserByUsername,
    getUserByUsernamePost,
    payForFriend as payForFriendRequest,
    registerPayment as registerPaymentRequest,
    sendGroupInvitation,
    skipPayment as skipPaymentRequest,
} from '~/services/requestApi';
import { useGroup } from '~/context/GroupContext.jsx';
import { useSettings } from '~/context/SettingsContext.jsx';

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

const useGroupPage = () => {
    const navigate = useNavigate();
    const { groupName: groupNameParam } = useParams();
    const groupNameFromUrl = groupNameParam ? decodeURIComponent(groupNameParam) : '';
    const { replaceGroup, leaveToHome } = useGroup();
    const { userSettingsOpen, groupSettingsOpen, openGroupSettings } = useSettings();

    const [user, setUser] = useState(null);
    const [group, setGroup] = useState({ groupName: 'Unnamed Group' });
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
    const [groupSummaryLoading, setGroupSummaryLoading] = useState(false);

    const isAnyModalOpen = showInviteForm || showDeleteModal || showRegisterPaymentModal
        || showSaltaPaymentModal || showPayForFriendModal || userSettingsOpen || groupSettingsOpen;

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

    const cachedFetchJson = useMemo(
        () => createCachedFetcher(requestCacheRef.current),
        []
    );

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
            const requestBody = { groupId: groupToUse?.id, groupName };

            try {
                setPaymentLoading(true);
                setPaymentByGroupError(null);

                const data = await cachedFetchJson(cacheKey, () => getPaymentRanking(requestBody));
                const errorMessage = normalizeError(data?.body?.message || data?.body);

                switch (data.status) {
                    case 200: {
                        let payload;
                        if (Array.isArray(data.body)) {
                            payload = data.body;
                        } else if (data.body) {
                            payload = [data.body];
                        } else {
                            payload = [];
                        }
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
            } catch {
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

                const { ok, body: allGroups } = await getGroupsByUsername(username);

                if (ok && Array.isArray(allGroups)) {
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
                } catch {
                    /* keep default */
                }
            } catch {
                navigate(WELCOME_PATH);
            }
        };

        fetchData();
    }, [navigate, groupNameFromUrl]);

    useEffect(() => {
        if (user && groups.userMembershipsdto) {
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

        const friendUsername = getCurrentTurnMember(groups)?.username;
        if (!friendUsername) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('No token provided');
                return;
            }

            const { ok, body: userData } = await getUserByUsername(friendUsername);
            if (!ok) {
                setFriend('');
                return;
            }

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
                    const { ok, status, body: userData } = await getUserByUsernamePost(userInvitation);
                    if (!ok) throw new Error(`HTTP ${status}`);
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

                const requestBody = { username: userInvitation, groupName: group.groupName };
                const { ok, status, body } = await sendGroupInvitation(requestBody);

                if (!ok) {
                    setError(`HTTP ${status}: ${messageFromBody(body, 'Errore nell\'invio dell\'invito')}`);
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

                const { ok } = await registerPaymentRequest(group.groupName, { importo, descrizione });
                if (!ok) {
                    setError('Problema durante la registrazione del pagamento');
                    return;
                }

                try {
                    await updateCoffeeKarma(KARMA_OPS.PAYMENT, importo);
                } catch {
                    /* il pagamento è già registrato */
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

                const { ok, body } = await skipPaymentRequest(group.groupName);
                if (!ok) {
                    setError(`Si è verificato un problema: ${messageFromBody(body, 'Errore sconosciuto')}`);
                    return;
                }

                try {
                    await updateCoffeeKarma(KARMA_OPS.JUMP_TURN);
                } catch {
                    /* lo skip è già registrato */
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

                const { ok } = await deleteGroupRequest(group.groupName);
                if (!ok) {
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

                const { ok } = await payForFriendRequest(group.groupName, { importo, descrizione });
                if (!ok) {
                    setError('Problema durante la registrazione del pagamento');
                    return;
                }

                try {
                    await updateCoffeeKarma(KARMA_OPS.PAYMENT_FOR, importo);
                } catch {
                    /* il paga-per è già registrato */
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
            const next = { ...group, groupName: updated.name, name: updated.name };
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

    return {
        user,
        avatarKey,
        group,
        groups,
        isAdmin,
        myTurn,
        myMembership,
        currentTurnMember,
        canPayFor,
        groupRules,
        groupSummaryLoading,
        classificaPaymentsForGroup,
        paymentLoading,
        paymentByGroupError,
        onRetry,
        importo,
        descrizione,
        userInvitation,
        friend,
        error,
        successMessage,
        isSubmitting,
        isSkipping,
        isDeleting,
        leavingGroup,
        showInviteForm,
        showDeleteModal,
        showRegisterPaymentModal,
        showSaltaPaymentModal,
        showPayForFriendModal,
        isAnyModalOpen,
        userSettingsOpen,
        groupSettingsOpen,
        openGroupSettings,
        logout,
        goBack,
        inviteMember,
        registerPayment,
        skipPayment,
        payForFriend,
        deleteGroup,
        submitInvite,
        submitPayment,
        confirmSkipPayment,
        confirmDeleteGroup,
        confirmPayForFriend,
        handleLeaveGroup,
        handleSettingsSaved,
        closeInviteForm,
        closeRegisterPaymentModal,
        closePayForFriendModal,
        closeDeleteModal,
        closeSaltaPaymentForm,
        handleInputChangeImporto,
        handleInputChangeDescrizione,
        handleInputChangeInvitation,
    };
};

export default useGroupPage;
