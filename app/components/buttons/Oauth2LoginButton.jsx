import { useEffect, useRef, useState } from 'react';
import styles from '~/styles/signup.module.css';
import { messageFromBody } from '~/utils/api';
import { loginWithGoogle } from '~/utils/apiService';
import { ENABLED_OAUTH_PROVIDERS, buildAuthorizeUrl, providerCssSuffix } from '~/config/oauth';
import { PROVIDER_ICONS } from './OAuthIcons';

/**
 * Avvia il flusso di autorizzazione e lascia la SPA: il backend scambia il code
 * al ritorno su /welcome. Il provider viene ricordato in sessionStorage perche'
 * il reload distrugga lo stato React.
 */
const startOAuthRedirect = (provider) => {
    sessionStorage.setItem('oauth_provider', provider.id);
    window.location.assign(buildAuthorizeUrl(provider));
};

/**
 * Carica Google Identity Services e monta il pulsante ufficiale dentro il
 * contenitore indicato. GIS non usa il redirect: il credential arriva
 * direttamente al callback JS.
 *
 * Il callback e' tenuto in un ref perche' l'effect dipenda solo dal client id:
 * altrimenti verrebbe ricreato a ogni render e rimonterebbe il pulsante.
 * Lo script non viene rimosso al cleanup perche' e' condiviso e idempotente.
 */
const useGoogleIdentity = (containerRef, clientId, onCredential) => {
    const onCredentialRef = useRef(onCredential);
    onCredentialRef.current = onCredential;

    useEffect(() => {
        if (!clientId || !containerRef.current) return undefined;

        const initGoogle = () => {
            if (!window.google?.accounts?.id || !containerRef.current) return;
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: ({ credential }) => onCredentialRef.current(credential),
            });
            window.google.accounts.id.renderButton(containerRef.current, {
                theme: 'outline',
                size: 'large',
                width: 320,
            });
        };

        if (window.google?.accounts?.id) {
            initGoogle();
            return undefined;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = initGoogle;
        document.body.appendChild(script);

        return undefined;
    }, [clientId, containerRef]);
};

/**
 * Pulsanti di login social (GitHub, Google, Discord, Slack).
 *
 * I provider usano due flussi diversi:
 *  - Google: credential ID restituito dalla libreria GIS, senza redirect.
 *  - GitHub, Discord, Slack: authorization code. Il browser viene reindirizzato
 *    al provider e torna su /welcome?code=...; lo scambio del code e' fatto dal
 *    backend ed e' gestito da LoginForm, perche' richiede un reload della SPA.
 *
 * Provider, scope e URL sono definiti in ~/config/oauth.
 */
const Oauth2LoginButton = ({ onLoginSuccess, withDivider = true }) => {
    const googleRef = useRef(null);
    const [error, setError] = useState('');

    const providers = ENABLED_OAUTH_PROVIDERS;
    const googleProvider = providers.find((p) => p.id === 'google');

    /**
     * Scambia il token del provider con il JWT PagaTu tramite il backend.
     * @param {function} send La funzione da chiamare per inviare il token al backend.
     * @param {string} token Il token del provider.
     * @param {string} providerLabel Il nome del provider.
     */
    const completeOAuthLogin = async (send, token, providerLabel) => {
        const { ok, body } = await send(token);
        if (!ok) {
            throw new Error(messageFromBody(body, `Login ${providerLabel} fallito`));
        }
        const { token: authToken, username, email } = body;
        onLoginSuccess({ username, email }, authToken);
    };

    const handleGoogleCredential = async (credential) => {
        setError('');
        try {
            await completeOAuthLogin(loginWithGoogle, credential, 'Google');
        } catch (err) {
            setError(err.message || 'Login Google fallito');
        }
    };

    useGoogleIdentity(googleRef, googleProvider?.clientId, handleGoogleCredential);

    if (providers.length === 0) return null;

    return (
        <div className={styles.oauthSigninContainer}>
            {withDivider && (
                <div className={styles.oauthDivider}>
                    <span>oppure</span>
                </div>
            )}

            {providers.map((provider) => {
                const Icon = PROVIDER_ICONS[provider.id];
                if (!Icon) return null;

                // Google usa l'overlay ufficiale di GIS, gli altri un semplice click.
                if (provider.sdk === 'gis') {
                    return (
                        <div key={provider.id} className={styles.oauthGoogleWrap}>
                            <button
                                type="button"
                                className={`${styles.oauthSigninBtn} ${styles.oauthBtnGoogle}`}
                                aria-label={`Accedi con ${provider.label}`}
                            >
                                <span className={styles.oauthIconWrap}>
                                    <Icon />
                                </span>
                                <span>Accedi con {provider.label}</span>
                            </button>
                            <div
                                ref={googleRef}
                                className={styles.oauthGoogleOverlay}
                            />
                        </div>
                    );
                }

                return (
                    <button
                        key={provider.id}
                        type="button"
                        className={`${styles.oauthSigninBtn} ${styles[`oauthBtn${providerCssSuffix(provider.id)}`] || ''}`}
                        onClick={() => startOAuthRedirect(provider)}
                        aria-label={`Accedi con ${provider.label}`}
                    >
                        <span className={styles.oauthIconWrap}>
                            <Icon />
                        </span>
                        <span>Accedi con {provider.label}</span>
                    </button>
                );
            })}

            {error && <div className={styles.oauthError}>{error}</div>}
        </div>
    );
};

export default Oauth2LoginButton;