import { useEffect, useMemo, useState } from 'react';
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

const BEAN_COUNT = 20;
// Raggio corona chicchi, in % dello stage (0 = centro, 50 = bordo).
const BEAN_RADIUS_PERCENT = 43;
const BEAN_APPEAR_STAGGER_MS = 90;

const buildBeans = () => Array.from({ length: BEAN_COUNT }, (_, i) => {
    const step = 360 / BEAN_COUNT;
    // Offset di mezzo passo: lascia libero il centro-basso per la tagline.
    const angle = -90 + step / 2 + i * step;
    const rad = (angle * Math.PI) / 180;
    const left = 50 + BEAN_RADIUS_PERCENT * Math.cos(rad);
    const top = 50 + BEAN_RADIUS_PERCENT * Math.sin(rad);
    const rotate = angle + 90;
    return { id: i, left, top, rotate, delay: i * BEAN_APPEAR_STAGGER_MS };
});

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
    const beans = useMemo(buildBeans, []);

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
            {/* Sottofondo: tile di icone sparse, mai sovrapposte */}
            <div className={styles.patternLayer} aria-hidden="true" />

            <div className={styles.content}>
                {/*
                  * Stage circolare: tutto vive qui dentro.
                  * Coordinate in % dello stage -> il layout scala insieme.
                  */}
                <div className={styles.beanStage}>
                    {/* Corona fissa: i chicchi appaiono in sequenza, non ruotano */}
                    <div className={styles.beanOrbit} aria-hidden="true">
                        {beans.map((bean) => (
                            <img
                                key={bean.id}
                                src="/coffee-medium-svgrepo-com.svg"
                                alt=""
                                className={styles.bean}
                                style={{
                                    left: `${bean.left}%`,
                                    top: `${bean.top}%`,
                                    '--bean-rot': `${bean.rotate}deg`,
                                    animationDelay: `${bean.delay}ms`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Logo vettoriale ritagliato: nitido a qualsiasi risoluzione */}
                    <img
                        src="/pagaTu-mark.svg"
                        alt="Logo PagaTu"
                        className={styles.logo}
                    />

                    {/*
                      * "PagaTu" su arco: textPath SVG, così le lettere seguono
                      * il bordo inferiore del logo.
                      */}
                    <svg
                        className={styles.arcSvg}
                        viewBox="0 0 200 200"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <defs>
                            <path id="pagatuArc" d="M 42 76 A 58 58 0 0 0 158 76" fill="none" />
                        </defs>
                        <text className={styles.arcText}>
                            <textPath href="#pagatuArc" startOffset="50%" textAnchor="middle">
                                {TITLE_LETTERS.map(({ char, tone, delay }, i) => (
                                    <tspan
                                        key={`${char}-${i}`}
                                        className={`${styles.arcLetter} ${tone === 'dark' ? styles.arcLetterDark : styles.arcLetterLight}`}
                                        style={{ animationDelay: `${delay}ms` }}
                                    >
                                        {char}
                                    </tspan>
                                ))}
                            </textPath>
                        </text>
                    </svg>

                    <p className={styles.tagline}>Il caffè che unisce il team</p>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
