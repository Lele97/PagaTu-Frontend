import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '~/components/header/header.jsx';
import styles from '~/styles/profile.module.css';
import { authHeaders, GATEWAY_URL, parseErrorMessage } from '~/utils/api';

const PaymentLinks = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState('');
    const [satispayLink, setSatispayLink] = useState('');
    const [revolutLink, setRevolutLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            navigate('/login');
            return;
        }
        try {
            const parsed = JSON.parse(userData);
            setUser(parsed.username || parsed.email || '');
        } catch {
            navigate('/login');
            return;
        }

        fetch(`${GATEWAY_URL}/api/coffee/user/payment-links`, {
            headers: authHeaders(),
            credentials: 'include',
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await parseErrorMessage(res));
                return res.json();
            })
            .then((data) => {
                setSatispayLink(data.satispayLink || '');
                setRevolutLink(data.revolutLink || '');
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${GATEWAY_URL}/api/coffee/user/payment-links`, {
                method: 'PUT',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({ satispayLink, revolutLink }),
            });
            if (!response.ok) {
                setError(await parseErrorMessage(response, 'Errore nel salvataggio'));
                return;
            }
            const data = await response.json();
            setSatispayLink(data.satispayLink || '');
            setRevolutLink(data.revolutLink || '');
            setSuccess('Link aggiornati! I membri del gruppo potranno usarli per rimborsarti.');
            setTimeout(() => setSuccess(''), 4000);
        } catch {
            setError('Errore di connessione');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header user={user} logout={logout} />
            <main className={styles.main}>
                <button type="button" onClick={() => navigate('/home')} className={styles.backBtn}>
                    <i className="fa-solid fa-arrow-left"></i> Home
                </button>
                <h1><i className="bi bi-wallet2"></i> Link per rimborsi</h1>
                <p className={styles.subtitle}>
                    Aggiungi i tuoi link Satispay o Revolut. PagaTu resta solo un tracker — i pagamenti avvengono fuori dall&apos;app.
                </p>
                {loading ? (
                    <p>Caricamento...</p>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <label>
                            Link Satispay
                            <input type="url" value={satispayLink} onChange={(e) => setSatispayLink(e.target.value)} placeholder="https://..." className={styles.input} />
                        </label>
                        <label>
                            Link Revolut
                            <input type="url" value={revolutLink} onChange={(e) => setRevolutLink(e.target.value)} placeholder="https://..." className={styles.input} />
                        </label>
                        {error && <p className={styles.error}>{error}</p>}
                        {success && <p className={styles.success}>{success}</p>}
                        <button type="submit" className={styles.submitBtn} disabled={saving}>
                            {saving ? 'Salvataggio...' : 'Salva link'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
};

export default PaymentLinks;