import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '~/styles/auth.module.css';

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const InvitationHandler = () => {
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [invitationData, setInvitationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
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

            setInvitationData({ username, groupName });

            // Check if user is authenticated
            const authToken = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');

            if (!authToken || !userData) {
                // Store invitation data in localStorage for after login
                localStorage.setItem('pendingInvitation', JSON.stringify({ username, groupName }));
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
                    throw new Error('No user data available');
                }

                setUser(currentUsername);

                // Check if the invitation is for the current user
                if (currentUsername !== username) {
                    setError('Questo invito non è per te. Accedi con l\'account corretto.');
                    setLoading(false);
                    return;
                }

                setLoading(false);
            } catch (err) {
                console.error('Error parsing user data:', err);
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
            console.log('Join group response:', responseMessage);

            setSuccess(true);
            // Clear pending invitation
            localStorage.removeItem('pendingInvitation');

            // Redirect to home after a short delay
            setTimeout(() => {
                navigate('/home');
            }, 2000);

        } catch (err) {
            console.error('Error accepting invitation:', err);
            setError('Errore nell\'accettazione dell\'invito. Riprova.');
        } finally {
            setAccepting(false);
        }
    };

    const declineInvitation = () => {
        // Clear pending invitation and redirect to home
        localStorage.removeItem('pendingInvitation');
        navigate('/home');
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

    if (error) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.container}>
                    <div className={styles.errorCard}>
                        <h2>Errore</h2>
                        <p>{error}</p>
                        <button
                            onClick={() => navigate('/home')}
                            className={styles.button}
                        >
                            Torna alla Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.container}>
                    <div className={styles.successCard}>
                        <h2>Invito Accettato!</h2>
                        <p>Sei stato aggiunto al gruppo "{invitationData.groupName}" con successo.</p>
                        <p>Verrai reindirizzato alla home...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.container}>
                <div className={styles.invitationCard}>
                    <h2>Invito al Gruppo</h2>
                    <div className={styles.invitationDetails}>
                        <p><strong>Gruppo:</strong> {invitationData.groupName}</p>
                        <p><strong>Invitato come:</strong> {invitationData.username}</p>
                        <p><strong>Utente corrente:</strong> {user}</p>
                    </div>

                    <div className={styles.invitationMessage}>
                        <p>Sei stato invitato a partecipare al gruppo "{invitationData.groupName}".</p>
                        <p>Vuoi accettare l'invito?</p>
                    </div>

                    <div className={styles.invitationActions}>
                        <button
                            onClick={declineInvitation}
                            className={`${styles.button} ${styles.declineButton}`}
                            disabled={accepting}
                        >
                            Rifiuta
                        </button>
                        <button
                            onClick={acceptInvitation}
                            className={`${styles.button} ${styles.acceptButton}`}
                            disabled={accepting}
                        >
                            {accepting ? 'Accettando...' : 'Accetta'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvitationHandler;