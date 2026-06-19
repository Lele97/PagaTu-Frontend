import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '~/styles/auth.module.css';
import { GATEWAY_URL } from '~/utils/api';

const VerifyEmail = () => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const key = params.get('key');

        if (!key) {
            setStatus('error');
            setMessage('Link di verifica non valido');
            return;
        }

        fetch(`${GATEWAY_URL}/api/auth/verify-email?key=${encodeURIComponent(key)}`, {
            credentials: 'include',
        })
            .then(async (res) => {
                const text = await res.text();
                if (res.ok) {
                    setStatus('success');
                    setMessage(text || 'Email verificata con successo!');
                } else {
                    setStatus('error');
                    setMessage(text || 'Token non valido o scaduto');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Errore di connessione al server');
            });
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h2 className={styles.title}>Verifica email</h2>
                {status === 'loading' && <p>Verifica in corso...</p>}
                {status === 'success' && (
                    <>
                        <div className={styles.verifySuccess}>{message}</div>
                        <Link to="/login" className={styles.primaryButton} style={{ display: 'inline-block', textAlign: 'center', marginTop: '1rem' }}>
                            Vai al login
                        </Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className={styles.error}>{message}</div>
                        <p style={{ marginTop: '1rem' }}>
                            <Link to="/login">Torna al login</Link> per richiedere una nuova email di verifica.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;