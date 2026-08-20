import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import styles from '~/styles/auth.module.css';
import {GATEWAY_URL, parseErrorMessage} from '~/utils/api';

const verificationCache = new Map();

const readKey = () => new URLSearchParams(window.location.search).get('key');

const parseBody = async (res) => {
    const raw = await res.text();
    if (!raw) {
        return res.ok ? 'Email verificata con successo!' : 'Token non valido o scaduto';
    }
    try {
        const data = JSON.parse(raw);
        return data.message || data.error || raw;
    } catch {
        return raw;
    }
};

const verifyToken = (key) => {
    const cached = verificationCache.get(key);
    if (cached) {
        return cached;
    }

    const promise = fetch(
        `${GATEWAY_URL}/api/auth/verify-email?key=${encodeURIComponent(key)}`,
        {credentials: 'include'},
    ).then(async (res) => {
        const text = await parseBody(res);
        if (res.ok) {
            return {status: 'success', message: text || 'Email verificata con successo!'};
        }
        return {status: 'error', message: text || 'Token non valido o scaduto'};
    }).catch(() => ({
        status: 'error',
        message: 'Errore di connessione al server',
    }));

    verificationCache.set(key, promise);
    return promise;
};

const VerifyEmail = () => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('');

    useEffect(() => {
        const key = readKey();
        if (!key) {
            setStatus('error');
            setMessage('Link di verifica non valido');
            return;
        }

        let cancelled = false;
        verifyToken(key).then((result) => {
            if (cancelled) {
                return;
            }
            setStatus(result.status);
            setMessage(result.message);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const resendVerification = async () => {
        if (!resendEmail.trim()) {
            setResendStatus('Inserisci la tua email');
            return;
        }
        try {
            const response = await fetch(
                `${GATEWAY_URL}/api/auth/resend-verification?email=${encodeURIComponent(resendEmail.trim())}`,
                {method: 'POST', credentials: 'include'}
            );
            setResendStatus(await parseErrorMessage(response, response.ok ? 'Email inviata!' : 'Invio non riuscito'));
        } catch {
            setResendStatus('Errore di connessione');
        }
    };

    return (
        <div className={styles.verifyPage}>
            <div className={styles.verifyContainer}>
                <div className={styles.verifyContent}>
                    <img src="/pagaTu.svg" alt="PagaTu Logo" className={styles.logoMessageVerify}/>
                    <div className={styles.verifyMessageContainer}>
                        <h2 className={styles.title}>Verifica Account</h2>
                        {status === 'loading' && <p>Verifica in corso...</p>}
                        {status === 'success' && (
                            <>
                                <div className={styles.verifyMessageText}>{message}</div>
                                <Link to="/welcome" className={styles.secondaryVerifyButton}
                                      style={{display: 'inline-block', textAlign: 'center', marginTop: '1rem'}}>
                                    <i className="fa-solid fa-arrow-left"></i> Vai al login
                                </Link>
                            </>
                        )}
                        {status === 'error' && (
                            <>
                                <div className={styles.verifyMessageText}>{message}</div>
                                <div className={styles.resendBox}>
                                    <p>Non hai ricevuto l&apos;email o il link è scaduto?</p>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        placeholder="La tua email"
                                        value={resendEmail}
                                        onChange={(e) => setResendEmail(e.target.value)}
                                    />
                                    <button type="button" className={styles.secondaryButton} onClick={resendVerification}>
                                        Reinvia verifica
                                    </button>
                                    {resendStatus && <p className={styles.resendStatus}>{resendStatus}</p>}
                                </div>
                                <Link to="/welcome" className={styles.secondaryVerifyButton}
                                      style={{display: 'inline-block', textAlign: 'center', marginTop: '1rem'}}>
                                    <i className="fa-solid fa-arrow-left"></i> Vai al login
                                </Link>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
