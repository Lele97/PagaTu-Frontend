import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '~/styles/home.module.css';

const Group = () => {
    const [user, setUser] = useState(null);
    const [group, setGroup] = useState({ groupName: '' });
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    //const [email, setEmail] = useState('');
    //const [message, setMessage] = useState('');
    const [userInvitation, setUserInvitation] = useState('')
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        const groupData = localStorage.getItem('group');

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
                    setGroup({ groupName: 'Unnamed Group' });
                }
            } else {
                setGroup({ groupName: 'Unnamed Group' });
            }
        } catch (err) {
            console.error('Error parsing data:', err);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

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
        // Implement your logic here
    };

    const inviteMember = () => {
        setShowInviteForm(true);
        setSuccessMessage('');
        setError(null);
    };

    const submitInvite = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage('');

        try {
            console.log('Inviting:', userInvitation, 'to group:', group.groupName);

            const response = await fetch("")

            await new Promise((resolve) => setTimeout(resolve, 1000));

            setSuccessMessage(`Invito inviato a ${email}!`);
            setEmail('');
            setMessage('');
            setShowInviteForm(false);
        } catch (err) {
            setError('Errore nell’invio dell’invito. Riprova.');
            console.error('Invite error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeInviteForm = () => {
        setShowInviteForm(false);
        setEmail('');
        setMessage('');
        setError(null);
        setSuccessMessage('');
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
                            <img src="/pagaTu.png" alt="Logo" className={styles.pagatu_image} />
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
                    <button onClick={goBack} className={styles.groupButton} style={{ marginBottom: '2rem' }}>
                        ← Torna alla Home
                    </button>

                    <div className={styles.groupHeader}>
                        <h1 className={styles.sectionTitle} style={{ textAlign: 'left', margin: 0 }}>
                            {group?.groupName || 'No Group Name'}
                        </h1>

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
                    </div>

                    {/* Azioni gruppo */}
                    <section className={styles.groupSection} style={{ marginTop: '2rem' }}>
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
                </main>
            </div>
        </div>
    );
};

export default Group;
