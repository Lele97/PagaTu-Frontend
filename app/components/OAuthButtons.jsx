import { useEffect, useRef, useState } from 'react';
import styles from '~/styles/auth.module.css';
import { GATEWAY_URL } from '~/utils/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

const OAuthButtons = ({ onLoginSuccess }) => {
    const googleRef = useRef(null);
    const [oauthError, setOauthError] = useState('');
    const [msLoading, setMsLoading] = useState(false);

    const completeOAuthLogin = async (endpoint, token) => {
        const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
            credentials: 'include',
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || 'Login OAuth fallito');
        }

        const { token: authToken, username, email } = await response.json();
        onLoginSuccess({ username, email }, authToken);
    };

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash.includes('access_token=') || !MICROSOFT_CLIENT_ID) return;

        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        if (!accessToken) return;

        setMsLoading(true);
        window.history.replaceState(null, '', window.location.pathname);

        completeOAuthLogin('/api/auth/oauth/microsoft', accessToken)
            .catch((err) => setOauthError(err.message || 'Login Microsoft fallito'))
            .finally(() => setMsLoading(false));
    }, []);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !googleRef.current) return;

        const handleCredential = async (response) => {
            setOauthError('');
            try {
                await completeOAuthLogin('/api/auth/oauth/google', response.credential);
            } catch (err) {
                setOauthError(err.message || 'Login Google fallito');
            }
        };

        const initGoogle = () => {
            if (!window.google?.accounts?.id) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredential,
            });
            window.google.accounts.id.renderButton(googleRef.current, {
                theme: 'outline',
                size: 'large',
                width: 280,
                text: 'continue_with',
                locale: 'it',
            });
        };

        if (window.google?.accounts?.id) {
            initGoogle();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = initGoogle;
        document.body.appendChild(script);
    }, []);

    const loginWithMicrosoft = () => {
        if (!MICROSOFT_CLIENT_ID) {
            setOauthError('Login Microsoft non configurato');
            return;
        }
        const redirectUri = `${window.location.origin}/login`;
        const scope = encodeURIComponent('User.Read openid profile email');
        const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_mode=fragment`;
        window.location.href = url;
    };

    if (!GOOGLE_CLIENT_ID && !MICROSOFT_CLIENT_ID) return null;

    return (
        <div className={styles.oauthSection}>
            <div className={styles.oauthDivider}>
                <span>oppure</span>
            </div>
            {GOOGLE_CLIENT_ID && <div ref={googleRef} className={styles.oauthButtonWrap} />}
            {MICROSOFT_CLIENT_ID && (
                <button
                    type="button"
                    className={styles.microsoftButton}
                    onClick={loginWithMicrosoft}
                    disabled={msLoading}
                >
                    {msLoading ? 'Accesso Microsoft...' : 'Accedi con Microsoft'}
                </button>
            )}
            {oauthError && <div className={styles.error}>{oauthError}</div>}
        </div>
    );
};

export default OAuthButtons;