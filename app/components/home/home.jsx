import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/home.module.css';
import Header from '../header/header.jsx';
import HomeHeader from "~/components/home/homeHeader.jsx";
import HomeGroups from "~/components/home/homeGroups.jsx";
import HomePayments from "~/components/home/homePayments.jsx";
import AddGroupModal from "~/components/home/modals/AddGroupModal.jsx";

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

        let body;
        try {
            body = await response.json();
        } catch {
            body = null;
        }

        const data = {status: response.status, body};

        requestCacheRef.current.set(cacheKey, {data, timestamp: now});
        return data;
    }, []);

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

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    }, [navigate]);

    const confirmCreateGroup = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess('');

        try {
            const token = localStorage.getItem('authToken');

            if (!token)
                new Error("Sessione scaduta");

            if (!payload.name.trim()) {
                setError("Il nome del gruppo non puÃ² essere vuoto");
                return;
            }

            if (payload.name.trim().length < 6) {
                setError("Il nome del gruppo deve avere minimo 6 caratteri");
                return;
            }

            if (payload.name.trim().length > 20) {
                setError("Il nome del gruppo deve avere massimo 20 caratteri");
                return;
            }

            if (!/^[a-zA-Z0-9_]+$/.test(payload.name.trim())) {
                setError("il nome del gruppo puÃ² contenere solo lettere , numeri, e underscore");
                return;
            }

            const response = await fetch(`${GETAWAY_SERVER_URL}/api/coffee/group`, {
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

            switch (response.status) {
                case 200:
                    setSuccess("Gruppo creato con successo");
                    setPayload(initialPayload);
                    break;
                case 400:
                    setError("Gruppo giÃ  esistente");
                    break;
                default:
                    new Error("Problema durante la creazione del gruppo")
            }

            clearCache(`gruppi_by_Id_${user || 'unknown'}`);

            setTimeout(() => {
                setShowAddGroupModal(false);
            }, 3000);

            await getGroupsByUser(user);

        } catch (err) {
            navigate('/error', {state: {errorMessage: err.message || "Errore di connessione"}});
        } finally {
            setIsSubmitting(false);
        }

    }, [payload, user, navigate, initialPayload, clearCache]);

    const addGroup = useCallback(() => {
        setShowAddGroupModal(true);
        setError(null);
        setSuccess('');
    }, []);

    const closeAddGroupModal = useCallback(() => {
        setShowAddGroupModal(false);
        setSuccess('');
        setError(null);
        setPayload(initialPayload);
    }, [initialPayload]);

    const handleGroupSelect = useCallback((groupName) => {
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
            localStorage.setItem('group', JSON.stringify(normalizedGroup));
            setSelectedGroup(groupName);
            navigate('/group');
        }
    }, [groups, navigate]);

    const getGroupsByUser = useCallback(async (username = user) => {
        const token = localStorage.getItem('authToken');
        if (!token) return logout();


        const cacheKey = `gruppi_by_Id_${username || 'unknown'}`;

        try {
            setGroupsLoading(true);
            setGroupsError(null);

            const data = await cachedFetchJson(`${GETAWAY_SERVER_URL}/api/coffee/group/get/${username}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({username}),
                credentials: 'include',
            }, cacheKey);

            const errorMessage = normalizeError(data?.body?.message || data?.body);

            switch (data.status) {
                case 200:
                    const groupsList = Array.isArray(data.body) ? data.body : [];
                    setGroups(groupsList);
                    setCurrentGroupPage(1);
                    break;
                case 401:
                    logout()
                    break;
                case 404:
                    setGroups([]);
                    break;
                default:
                    setGroups([]);
                    setGroupsError(errorMessage);
            }

        } catch {
            setGroups([]);
            setGroupsError("Errore nel recupero dei gruppi");
        } finally {
            setGroupsLoading(false);
        }
    }, [cachedFetchJson, user]);

    const getHistoryPayments = useCallback(async (username) => {
        const token = localStorage.getItem('authToken');
        if (!token) return logout();

        const cacheKey = `payments_by_Id_${username || 'unknown'}`;

        try {
            setPaymentsLoading(true);
            setPaymentsError(null);

            const data = await cachedFetchJson(`${GETAWAY_SERVER_URL}/api/coffee/ultimi/pagamenti/${username}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: JSON.stringify({username}),
            }, cacheKey);

            const errorMessage = normalizeError(data?.body?.message || data?.body);

            switch (data.status) {
                case 200:
                    setPagamentis(Array.isArray(data.body) ? data.body : []);
                    break;
                case 204:
                    setPagamentis([]);
                    break;
                default:
                    setPaymentsError(errorMessage);
            }
        } catch {
            setPaymentsError("Errore nel recupero dei pagamenti");
        } finally {
            setPaymentsLoading(false);
        }
    }, [cachedFetchJson, user]);

    const getPaginatedGroups = useMemo(() => {
        const startIndex = (currentGroupPage - 1) * GROUPS_PER_PAGE;
        return groups.slice(startIndex, startIndex + GROUPS_PER_PAGE);
    }, [currentGroupPage, groups]);

    const getPaginatedPayments = useMemo(() => {
        const startIndex = (currentPaymentPage - 1) * PAYMENTS_PER_PAGE;
        return pagamentis.slice(startIndex, startIndex + PAYMENTS_PER_PAGE);
    }, [currentPaymentPage, pagamentis]);

    const getTotalGroupPages = () => Math.ceil(groups.length / GROUPS_PER_PAGE);

    const getTotalPaymentPages = () => Math.ceil(pagamentis.length / PAYMENTS_PER_PAGE);

    const onRetry = useCallback(async () => {
        if (user) await getGroupsByUser(user);
    }, [getGroupsByUser, user])

    return (
        <div className={styles.homePage}>
            <div className={`${styles.container} ${showAddGroupModal ? styles.modalActive : ''}`}>

                <Header user={user} logout={logout}/>

                <main className={styles.main}>

                    <HomeHeader/>

                    <HomeGroups groups={getPaginatedGroups}
                                groupsLoading={groupsLoading}
                                groupsError={groupsError}
                                onRetry={onRetry}
                                addGroup={addGroup}
                                selectedGroup={selectedGroup}
                                handleGroupSelect={handleGroupSelect}
                                currentGroupPage={currentGroupPage}
                                getTotalGroupPages={getTotalGroupPages()}
                                setCurrentGroupPage={setCurrentGroupPage}
                    />

                    <div className={styles.separator}>
                        <div className={styles.separatorLeft}></div>
                        <img src="/coffee-medium-svgrepo-com.svg" alt="Coffee icon separator"/>
                        <div className={styles.separatorRight}></div>
                    </div>

                    <HomePayments onRetry={onRetry}
                                  payments={getPaginatedPayments}
                                  paymentsError={paymentsError}
                                  currentPaymentPage={currentPaymentPage}
                                  paymentsLoading={paymentsLoading}
                                  getTotalPaymentPages={getTotalPaymentPages()}
                                  setCurrentPaymentPage={setCurrentPaymentPage}/>

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