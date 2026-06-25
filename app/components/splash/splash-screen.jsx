import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WELCOME_PATH } from '~/utils/routes';
import styles from '~/styles/splash.module.css';

const SPLASH_MIN_DURATION_MS = 2500;
const FADE_OUT_DURATION_MS = 600;

const TITLE_LETTERS = [
    { char: 'P', tone: 'dark', delay: 200 },
    { char: 'a', tone: 'light', delay: 280 },
    { char: 'g', tone: 'dark', delay: 360 },
    { char: 'a', tone: 'light', delay: 440 },
    { char: 'T', tone: 'dark', delay: 560 },
    { char: 'u', tone: 'light', delay: 640 },
];

const getRedirectPath = () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        return WELCOME_PATH;
    }

    const pendingInvitation = localStorage.getItem('pendingInvitation');

    if (pendingInvitation) {
        try {
            const { username, groupName } = JSON.parse(pendingInvitation);
            return `/invitation?username=${encodeURIComponent(username)}&groupName=${encodeURIComponent(groupName)}`;
        } catch {
            localStorage.removeItem('pendingInvitation');
        }
    }

    return '/home';
};

const SplashScreen = () => {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const redirectPath = getRedirectPath();
        const exitTimer = setTimeout(() => setIsExiting(true), SPLASH_MIN_DURATION_MS);
        const navigateTimer = setTimeout(
            () => navigate(redirectPath, { replace: true }),
            SPLASH_MIN_DURATION_MS + FADE_OUT_DURATION_MS
        );

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(navigateTimer);
        };
    }, [navigate]);

    return (
        <div
            className={`${styles.splash} ${isExiting ? styles.splashExiting : ''}`}
            role="status"
            aria-live="polite"
            aria-label="Caricamento PagaTu"
        >
            <div className={styles.content}>
                <div className={styles.logoWrapper}>
                    <img
                        src="/pagaTu.webp"
                        alt="Logo PagaTu"
                        className={styles.logo}
                    />
                </div>

                <div className={styles.appTitle} aria-hidden="true">
                    {TITLE_LETTERS.map(({ char, tone, delay }) => (
                        <h1
                            key={`${char}-${delay}`}
                            className={`${styles.letter} ${tone === 'dark' ? styles.letterDark : styles.letterLight}`}
                            style={{ animationDelay: `${delay}ms` }}
                        >
                            {char}
                        </h1>
                    ))}
                </div>

                <p className={styles.tagline}>Il caffè che unisce il team</p>

                <div className={styles.loader}>
                    <div className={styles.progressTrack} aria-hidden="true">
                        <div className={styles.progressBar} />
                    </div>
                    <p className={styles.loaderText}>Preparando il tuo caffè...</p>
                </div>
            </div>

            <div className={styles.steam} aria-hidden="true">
                <span className={styles.steamLine} />
                <span className={styles.steamLine} />
                <span className={styles.steamLine} />
            </div>
        </div>
    );
};

export default SplashScreen;