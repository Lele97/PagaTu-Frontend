import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import styles from '~/styles/invitation.module.css';
import Header from '../../components/header.jsx';

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const InvitationHandler = () => {
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [invitationData, setInvitationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [notAccepting, setNotAccepting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleInvitation = async () => {
            // Get invitation parameters from URL
            const username = searchParams.get('username');
            const groupName = searchParams.get('groupName');

            if (!username || !groupName) {
                setError('Link di invito non valido');
                setLoading(false);
                return;
            }

            setInvitationData({username, groupName});

            // Check if user is authenticated
            const authToken = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');

            if (!authToken || !userData) {
                // Store invitation data in localStorage for after login
                localStorage.setItem('pendingInvitation', JSON.stringify({username, groupName}));
                // Redirect to login
                navigate('/login');
                return;
            }

            try {
                // Parse user data
                const parsedUser = userData ? JSON.parse(userData) : null;
                const currentUsername = typeof parsedUser === 'object'
                    ? (parsedUser?.username || parsedUser?.name || parsedUser?.email)
                    : parsedUser;

                if (!currentUsername) {
                    throw new Error("Errore nell\'elaborazione dei dati utente");
                }

                setUser(currentUsername);

                // Check if the invitation is for the current user
                if (currentUsername !== username) {
                    setError('Questo invito non è per te. accedi con l\'account corretto.');
                    setLoading(false);
                    return;
                }

                setLoading(false);
            } catch (err) {
                setError('Errore nell\'elaborazione dei dati utente');
                setLoading(false);
            }
        };

        handleInvitation();
    }, [searchParams, navigate]);

    const acceptInvitation = async () => {
        if (!invitationData) return;

        setAccepting(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');

            if (!authToken) {
                throw new Error('Token di autenticazione non trovato');
            }

            const response = await fetch(
                `${NGROK_SERVER_URL}/api/coffee/group/update/addtogroup?username=${encodeURIComponent(invitationData.username)}&groupName=${encodeURIComponent(invitationData.groupName)}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const responseMessage = await response.text();

            setSuccess(true);
            // Clear pending invitation
            localStorage.removeItem('pendingInvitation');

            // Redirect to home after a short delay
            setTimeout(() => {
                navigate('/home');
            }, 2000);

        } catch (err) {
            setError('Errore nell\'accettazione dell\'invito. Riprova.');
        } finally {
            setAccepting(false);
        }
    };

    const declineInvitation = () => {
        setNotAccepting(true);
        localStorage.removeItem('pendingInvitation');
        navigate('/home');
        setNotAccepting(false);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.container}>
                    <div className={styles.loadingSpinner}>
                        <div className={styles.spinner}></div>
                        <span>Caricamento invito...</span>
                    </div>
                </div>
            </div>
        );
    }

    const Error = ({error}) => {
        navigate("/errore-token", {
            replace: true,
            state: {errorInvitation: error}
        });
    }

    if (success) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.container}>
                    <Header user={user} logout={logout}/>
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}><i className="bi bi-check-circle-fill"></i>
                        </div>
                        <h2>Invito Accettato!</h2>
                        <p>Sei stato aggiunto al gruppo "{invitationData.groupName}" con successo.</p>
                        <p>A breve verrai reindirizzato alla tua home</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.invitationPage}>
            <div className={styles.container}>

                <Header user={user} logout={logout}/>

                {error ? (<Error error={error}/>)
                    : (
                        <>
                            <div className={styles.invitationCard}>
                                <h2 className={styles.title}>Invito al Gruppo</h2>

                                <div className={styles.details}>
                                    <h3>Dettagli</h3>
                                    <p><strong>Gruppo:</strong> {invitationData.groupName}</p>
                                    <p><strong>Invitato come:</strong> {invitationData.username}</p>
                                    <p><strong>Utente corrente:</strong> {user}</p>
                                </div>

                                <div className={styles.message}>
                                    <p>Sei stato invitato a far parte del gruppo.</p>
                                    <p>Vuoi accettare l'invito?</p>
                                </div>

                                {error && (
                                    <div className={styles.errorMessageModal}>
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className={styles.successMessage}>
                                        {success}
                                    </div>
                                )}

                                <div className={styles.actions}>
                                    <button
                                        onClick={declineInvitation}
                                        className={`${styles.button} ${styles.decline}`}
                                        disabled={notAccepting}
                                    >
                                        {notAccepting ? 'Rifiutando...' : 'Rifiuta'}
                                    </button>
                                    <button
                                        onClick={acceptInvitation}
                                        className={`${styles.button} ${styles.accept}`}
                                        disabled={accepting}
                                    >
                                        {accepting ? 'Accettando...' : 'Accetta'}
                                    </button>
                                </div>
                            </div>
                        </>)}
            </div>
        </div>
    );
};

export default InvitationHandler;