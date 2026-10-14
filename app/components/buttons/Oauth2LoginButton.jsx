import { useEffect, useRef, useState } from 'react';
import styles from '~/styles/signup.module.css';
import { messageFromBody } from '~/utils/api';
import { loginWithGoogle } from '~/utils/apiService';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID;

// Il path di callback dove il backend attende il code (o il token/error).
const CALLBACK_PATH = '/welcome';

/**
Deve coincidere con la redirect_uri registrata nelle varie app OAuth dei provider.
Derivarlo da window.location.origin la rende corretta in sviluppo e in produzione
senza toccare il codice.
 */
const callbackUrl = () => `${window.location.origin}${CALLBACK_PATH}`;

const startOAuthRedirect = (provider, url) => {
    sessionStorage.setItem('oauth_provider', provider);
    window.location.assign(url);
};

const GithubIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
    </svg>
);

const SlackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 122.8 122.8" xmlns="http://www.w3.org/2000/svg">
        <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"></path>
        <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"></path>
        <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"></path>
        <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"></path>
    </svg>
)

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
);

const DiscordIcon = () => (
    <svg class="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        width="20" height="20" viewBox="0 -28.5 256 256" version="1.1" preserveAspectRatio="xMidYMid">
        <g>
            <path
                d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                fill="currentColor" fill-rule="nonzero">

            </path>
        </g>
    </svg>
)

/**
 * Pulsanti di login social (GitHub, Google, Discord, Slack).
 *
 * I quattro provider usano due flussi OAuth:
 *  - GitHub: authorization code. Il browser viene reindirizzato a GitHub e
 *    torna su /welcome?code=...; lo scambio del code e' fatto dal backend.
 *    Il codice viene gestito da LoginForm, perche' richiede un reload della SPA.
 *  - Google: credential ID restituito dalla libreria GIS, senza redirect.
 *  - Discord: authorization code. Il browser viene reindirizzato a Discord e
 *    torna su /welcome?code=...; lo scambio del code e' fatto dal backend.
 *    Il codice viene gestito da LoginForm, perche' richiede un reload della SPA.
 *  - Slack: authorization code. Il browser viene reindirizzato a Slack e
 *    torna su /welcome?code=...; lo scambio del code e' fatto dal backend.
 *    Il codice viene gestito da LoginForm, perche' richiede un reload della SPA.
 *
 * Ogni pulsante viene mostrato solo se la rispettiva client id e' configurata.
 */
const Oauth2LoginButton = ({ onLoginSuccess, withDivider = true }) => {

    const googleRef = useRef(null);
    const [error, setError] = useState('');
    const hasGithub = Boolean(GITHUB_CLIENT_ID);
    const hasGoogle = Boolean(GOOGLE_CLIENT_ID);
    const hasDiscord = Boolean(DISCORD_CLIENT_ID);
    const hasSlack = Boolean(SLACK_CLIENT_ID);

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

    /**
     * Inizializza il pulsante di login con Google Identity Services.
     */
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !googleRef.current) return;

        const initGoogle = () => {
            if (!window.google?.accounts?.id) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async ({ credential }) => {
                    setError('');
                    try {
                        await completeOAuthLogin(loginWithGoogle, credential, 'Google');
                    } catch (err) {
                        setError(err.message || 'Login Google fallito');
                    }
                },
            });
            window.google.accounts.id.renderButton(googleRef.current, {
                theme: 'outline',
                size: 'large',
                width: 320,
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

    /**Avvia il login con GitHub. */
    const loginWithGithub = () => {
        const params = new URLSearchParams({
            client_id: GITHUB_CLIENT_ID,
            redirect_uri: callbackUrl(),
            scope: 'read:user user:email',
        });
        startOAuthRedirect(
            'github',
            `https://github.com/login/oauth/authorize?${params.toString()}`
        );
    };

    /**Avvia il login con Slack. */
    const loginWithSlack = () => {
        const params = new URLSearchParams({
            client_id: SLACK_CLIENT_ID,
            redirect_uri: callbackUrl(),
            scope: 'users:read identity:read users:read.email ',
            user_scope: 'chat:write users:read',
        });
        startOAuthRedirect(
            'slack',
            `https://slack.com/oauth/v2/authorize?${params.toString()}`
        );
    };

    /**Avvia il login con Discord. */
    const loginWithDiscord = () => {
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: callbackUrl(),
            response_type: 'code',
            scope: 'identify email',
        });
        startOAuthRedirect(
            'discord',
            `https://discord.com/oauth2/authorize?${params.toString()}`
        );
    };

    if (!hasGithub && !hasGoogle && !hasDiscord && !hasSlack) return null;

    return (
        <div className={styles.oauthSigninContainer}>
            {withDivider && (
                <div className={styles.oauthDivider}>
                    <span>oppure</span>
                </div>
            )}

            {hasGithub && (
                <button
                    type="button"
                    className={`${styles.oauthSigninBtn} ${styles.oauthBtnGithub}`}
                    onClick={loginWithGithub}
                    aria-label="Accedi con GitHub"
                >
                    <span className={styles.oauthIconWrap}>
                        <GithubIcon />
                    </span>
                    <span>Accedi con GitHub</span>
                </button>
            )}


            {hasDiscord && (
                <button
                    type="button"
                    className={`${styles.oauthSigninBtn} ${styles.oauthBtnDiscord}`}
                    onClick={loginWithDiscord}
                    aria-label="Accedi con Discord"
                >

                    <span className={styles.oauthIconWrap}>
                        <DiscordIcon />
                    </span>

                    <span>Accedi con Discord</span>
                </button>
            )}

            {hasSlack && (
                <button
                    type="button"
                    className={`${styles.oauthSigninBtn} ${styles.oauthBtnSlack}`}
                    onClick={loginWithSlack}
                    aria-label="Accedi con Slack"
                >
                    <span className={styles.oauthIconWrap}>
                        <SlackIcon />
                    </span>
                    <span>Accedi con Slack</span>
                </button>
            )}

            {hasGoogle && (
                <div className={styles.oauthGoogleWrap}>
                    <button
                        type="button"
                        className={`${styles.oauthSigninBtn} ${styles.oauthBtnGoogle}`}
                        aria-label="Accedi con Google"
                    >
                        <span className={styles.oauthIconWrap}>
                            <GoogleIcon />
                        </span>
                        <span>Accedi con Google</span>
                    </button>
                    <div
                        ref={googleRef}
                        className={styles.oauthGoogleOverlay}
                    />
                </div>
            )}



            {error && <div className={styles.oauthError}>{error}</div>}
        </div>
    );
};

export default Oauth2LoginButton;