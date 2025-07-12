import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '~/styles/home.module.css';

const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

const Group = () => {

    const [user, setUser] = useState(null);
    const [group, setGroup] = useState({groupName: ''});
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [groups, setGroups] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [userInvitation, setUserInvitation] = useState('')
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
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
            const username =
                typeof parsedUser === 'object'
                    ? parsedUser?.username || parsedUser?.name || parsedUser?.email
                    : parsedUser;

            if (!username) {
                throw new Error('No user data available');
            }

            setUser(username);

            if (groupData) {
                try {
                    const parsedGroup = JSON.parse(groupData);
                    setGroup({
                        groupName: parsedGroup.name || 'Unnamed Group',
                        ...parsedGroup
                    });
                } catch (e) {
                    console.error('Error parsing group data:', e);
                    setGroup({groupName: 'Unnamed Group'});
                }
            } else {
                setGroup({groupName: 'Unnamed Group'});
            }
        } catch (err) {
            console.error('Error parsing data:', err);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Separate useEffect to check admin status when user and groups are both available
    useEffect(() => {
        if (user && groups && groups.userMembershipsdto) {
            const adminStatus = isUserAdmin(user);
            setIsAdmin(adminStatus);
            console.log('Admin status for', user, ':', adminStatus); // Debug log
        }
    }, [user, groups]);

    useEffect(() => {
        if (!user && !loading) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const goBack = () => navigate('/home');

    const registerPayment = () => {
        console.log('Register payment clicked');
        // Implement your logic here
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

        const currentUserMembership = groups.userMembershipsdto.find(
            member => member.username === user
        );

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
                return; // Add return here
            }

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
            })

            if (!response.ok) {
                const errorText = await response.text();
                setError(`HTTP ${response.status}: ${errorText}`);
                return; // Add return here
            }

            const responseMessage = await response.text();
            console.log('Invitation response:', responseMessage);

            setSuccessMessage(`Invito inviato a ${userInvitation}!`);
            setUserInvitation('');
            setShowInviteForm(false);
        } catch (err) {
            setError('Errore nell\'invio dell\'invito. Riprova.');
            console.error('Invite error:', err);
        } finally {
            setIsSubmitting(false);
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
                method: 'DELETE',
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
            // Always reset isDeleting state
            setIsDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setError(null);
        setSuccessMessage('');
    };

    const closeInviteForm = () => {
        setShowInviteForm(false);
        setError(null);
        setSuccessMessage('');
        setUserInvitation('');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <span>Caricamento...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.homePage}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.logoTitleContainer}>
                            <h1 className={styles.headerTitle}>Paga</h1>
                            <img src="/pagaTu.png" alt="Logo" className={styles.pagatu_image}/>
                            <h1 className={styles.headerTitle}>Tu</h1>
                        </div>
                        <div className={styles.userInfo}>
                            <div className={styles.avatar}>
                                <div className={styles.head}></div>
                                <div className={styles.body}></div>
                            </div>
                            <span className={styles.welcomeText}>Ciao, {user}!</span>
                            <button onClick={logout} className={styles.logoutButton}>Esci</button>
                        </div>
                    </div>
                </header>

                {/* Main */}
                <main className={styles.main}>
                    <button onClick={goBack} className={styles.groupButton} style={{marginBottom: '2rem'}}>
                        ← Torna alla Home
                    </button>

                    <div className={styles.groupHeader}>
                        <h1 className={styles.sectionTitle} style={{textAlign: 'left', margin: 0}}>
                            {group?.groupName || 'No Group Name'}
                        </h1>

                        {isAdmin && (
                            <div className={styles.groupAdminButtons}>
                                <button
                                    onClick={deleteGroup}
                                    className={`${styles.groupButton} ${styles.deleteButton}`}
                                >
                                    Elimina Gruppo
                                </button>

                                <button
                                    onClick={inviteMember}
                                    className={`${styles.groupButton} ${styles.inviteButton}`}
                                >
                                    Invita Membro
                                </button>
                            </div>
                        )}

                    </div>

                    {/* Azioni gruppo */}
                    <section className={styles.groupSection} style={{marginTop: '2rem'}}>
                        <div className={styles.actionButtons}>
                            <button
                                onClick={registerPayment}
                                className={`${styles.groupButton} ${styles.actionButton}`}
                            >
                                Registra Pagamento
                            </button>
                            <button
                                onClick={skipPayment}
                                className={`${styles.groupButton} ${styles.actionButton}`}
                            >
                                Salta Pagamento
                            </button>
                        </div>
                    </section>

                    {/* Modale invito */}
                    {showInviteForm && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2>Invita un Membro</h2>
                                <form onSubmit={submitInvite}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="email">Utente da invitare:</label>
                                        <input
                                            type="text"
                                            id="user"
                                            value={userInvitation}
                                            onChange={(e) => setUserInvitation(e.target.value)}
                                            required
                                            className={styles.formInput}
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
                                            {isSubmitting ? 'Invio in corso...' : 'Invia Invito'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modale eliminazione gruppo */}
                    {showDeleteModal && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2>Elimina Gruppo</h2>
                                <p>Sei sicuro di voler eliminare il gruppo <strong>"{group.groupName}"</strong>?</p>
                                <p style={{color: '#dc3545', fontSize: '0.9em', marginTop: '1rem'}}>
                                    ⚠️ Questa azione non può essere annullata. Tutti i dati del gruppo verranno persi
                                    definitivamente.
                                </p>

                                {error && <div className={styles.errorMessage}>{error}</div>}
                                {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

                                <div className={styles.formButtons} style={{marginTop: '2rem'}}>
                                    <button
                                        type="button"
                                        onClick={closeDeleteModal}
                                        className={`${styles.groupButton} ${styles.cancelButton}`}
                                        disabled={isDeleting}>
                                        Annulla
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDeleteGroup}
                                        className={`${styles.groupButton} ${styles.deleteButton}`}
                                        disabled={isDeleting}
                                        style={{backgroundColor: '#dc3545'}}>
                                        {isDeleting ? 'Eliminazione in corso...' : 'Elimina Gruppo'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Group;