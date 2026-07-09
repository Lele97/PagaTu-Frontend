import React, {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import styles from '~/styles/auth.module.css';
import {GATEWAY_URL} from '~/utils/api';

const VerifyEmail = () => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    // Memoria che sopravvive al remount di Strict Mode (useState si resetta, questo no)
    const verificationRef = useRef({
        started: false,
        completed: false,
        status: 'loading',
        message: '',
        promise: null,
    });

    useEffect(() => {
        const applyResult = (nextStatus, nextMessage) => {
            verificationRef.current.completed = true;
            verificationRef.current.status = nextStatus;
            verificationRef.current.message = nextMessage;
            setStatus(nextStatus);
            setMessage(nextMessage);
        };

        // Remount dopo Strict Mode: ripristina subito il risultato se già arrivato
        if (verificationRef.current.completed) {
            setStatus(verificationRef.current.status);
            setMessage(verificationRef.current.message);
            return;
        }

        // Fetch già in corso dal mount precedente: riattacca alla stessa promise
        if (verificationRef.current.started) {
            verificationRef.current.promise
                ?.then(({ok, text}) => {
                    if (ok) {
                        applyResult('success', text || 'Email verificata con successo!');
                    } else {
                        applyResult('error', text || 'Token non valido o scaduto');
                    }
                })
                .catch(() => applyResult('error', 'Errore di connessione al server'));
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const key = params.get('key');

        if (!key) {
            applyResult('error', 'Link di verifica non valido');
            return;
        }

        verificationRef.current.started = true;

        const promise = fetch(
            `${GATEWAY_URL}/api/auth/verify-email?key=${encodeURIComponent(key)}`,
            {credentials: 'include'},
        ).then(async (res) => {
            const text = await res.text();
            return {ok: res.ok, text};
        });

        verificationRef.current.promise = promise;

        promise
            .then(({ok, text}) => {
                if (ok) {
                    applyResult('success', text || 'Email verificata con successo!');
                } else {
                    applyResult('error', text || 'Token non valido o scaduto');
                }
            })
            .catch(() => applyResult('error', 'Errore di connessione al server'));
    }, []);

    return (
        <div className={styles.verifyPage}>
            <div className={styles.verifyContainer}>
                <div className={styles.verifyContent}>
                    <img src="/pagaTu.png" alt="PagaTu Logo" className={styles.logoMessageVerify}/>
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