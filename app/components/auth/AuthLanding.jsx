import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginForm from '~/components/login/login-form.jsx';
import SignupForm from '~/components/signup/signup-form.jsx';
import ForgotPswForm from '~/components/resetPassword/forgotPsw-form.jsx';
import styles from '~/styles/signup.module.css';
import CoffeePatternIcons from '~/components/shared/CoffeePatternIcons.jsx';

const AUTH_TABS = new Set(['login', 'signup', 'forgot']);
const tabFromSearch = (value) => (AUTH_TABS.has(value) ? value : 'login');

const TITLE_LETTERS = [
    { char: 'P', tone: 'dark' },
    { char: 'a', tone: 'light' },
    { char: 'g', tone: 'dark' },
    { char: 'a', tone: 'light' },
    { char: 'T', tone: 'dark' },
    { char: 'u', tone: 'light' },
];

const AuthLanding = () => {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => tabFromSearch(searchParams.get('tab')));

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            navigate('/home', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        setSearchParams(activeTab === 'login' ? {} : { tab: activeTab }, { replace: true });
    }, [activeTab, setSearchParams]);

    const switchTab = (tab) => setActiveTab(tab);

    return (
        <div className={styles.container}>
            <CoffeePatternIcons />

            <div className={styles.pageBrand} role="img" aria-label="PagaTu">
                <img src="/pagaTu.svg" alt="" className={styles.brandLogo} />
                <svg
                    className={styles.brandArcSvg}
                    viewBox="0 0 200 200"
                    aria-hidden="true"
                    focusable="false"
                >
                    <defs>
                        <path id="pagatuArcLanding" d="M 10 88 A 90 90 0 0 0 190 88" fill="none" />
                    </defs>
                    <text className={styles.brandArcText}>
                        <textPath href="#pagatuArcLanding" startOffset="50%" textAnchor="middle">
                            {TITLE_LETTERS.map(({ char, tone }, i) => (
                                <tspan
                                    key={`${char}-${i}`}
                                    className={tone === 'dark' ? styles.brandLetterDark : styles.brandLetterLight}
                                >
                                    {char}
                                </tspan>
                            ))}
                        </textPath>
                    </text>
                </svg>
            </div>

            <section className={styles.heroSection}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <span className={styles.eyebrow}>La pausa caffè, finalmente in ordine</span>
                        <h2 className={styles.heroTitle}>Il caffè di oggi non si dimentica più.</h2>
                        <p className={styles.heroSubtitle}>
                            PagaTu organizza gruppi, turni e pagamenti della colazione in modo semplice,
                            leggero e divertente.
                        </p>
                        <div className={styles.heroFeatures}>
                            <div className={styles.heroFeature}>
                                <i className="fa-solid fa-user-group" />
                                <span>Crea il tuo gruppo</span>
                            </div>
                            <div className={styles.heroFeature}>
                                <i className="fa-solid fa-mug-hot" />
                                <span>Scopri a chi tocca offrire</span>
                            </div>
                            <div className={styles.heroFeature}>
                                <i className="fa-solid fa-receipt" />
                                <span>Registra ogni pagamento</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.authPanel}>
                        {activeTab !== 'forgot' && (
                            <div className={styles.authTabs} role="tablist" aria-label="Accesso o registrazione">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === 'login'}
                                    className={`${styles.authTab} ${activeTab === 'login' ? styles.authTabActive : ''}`}
                                    onClick={() => switchTab('login')}
                                >
                                    Accedi
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === 'signup'}
                                    className={`${styles.authTab} ${activeTab === 'signup' ? styles.authTabActive : ''}`}
                                    onClick={() => switchTab('signup')}
                                >
                                    Registrati
                                </button>
                            </div>
                        )}

                        {activeTab === 'login' && (
                            <LoginForm onSwitchToForgot={() => switchTab('forgot')} />
                        )}
                        {activeTab === 'signup' && (
                            <SignupForm onSwitchToLogin={() => switchTab('login')} />
                        )}
                        {activeTab === 'forgot' && (
                            <ForgotPswForm onSwitchToLogin={() => switchTab('login')} />
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.infoSection}>
                <div className={styles.infoCard}>
                    <i className="fa-solid fa-user-group" />
                    <h3>Crea il tuo gruppo</h3>
                    <p>Organizza amici o colleghi e prepara il prossimo giro di caffè.</p>
                </div>
                <div className={styles.infoCard}>
                    <i className="fa-solid fa-arrows-rotate" />
                    <h3>Segui il turno</h3>
                    <p>Scopri in un attimo chi offre oggi, senza più confusione.</p>
                </div>
                <div className={styles.infoCard}>
                    <i className="fa-solid fa-wallet" />
                    <h3>Registra i pagamenti</h3>
                    <p>Tieni tutto ordinato e chiaro, dalla colazione al caffè del pomeriggio.</p>
                </div>
            </section>

            <section className={styles.zigzagSection}>
                <div className={styles.zigzagRow}>
                    <div className={styles.zigzagVisual}>
                        <i className="fa-solid fa-list-ol" />
                        <strong>Turni automatici</strong>
                    </div>
                    <div className={styles.zigzagText}>
                        <h3>Chi paga oggi? Lo sa già l&apos;app</h3>
                        <p>
                            PagaTu gestisce la coda dei turni per il gruppo: niente più messaggi
                            su WhatsApp o post-it sul bollitore. Ogni membro sa quando tocca a sé.
                        </p>
                    </div>
                </div>

                <div className={`${styles.zigzagRow} ${styles.zigzagRowReverse}`}>
                    <div className={styles.zigzagVisual}>
                        <i className="fa-solid fa-hand-holding-dollar" />
                        <strong>Paga per un amico</strong>
                    </div>
                    <div className={styles.zigzagText}>
                        <h3>Salta, paga o anticipa per i colleghi</h3>
                        <p>
                            In vacanza o in riunione? Salta il turno. Vuoi fare un gesto per il team?
                            Registra un pagamento anche per un altro membro del gruppo.
                        </p>
                    </div>
                </div>

                <div className={styles.zigzagRow}>
                    <div className={styles.zigzagVisual}>
                        <i className="fa-solid fa-trophy" />
                        <strong>Award e statistiche</strong>
                    </div>
                    <div className={styles.zigzagText}>
                        <h3>Trasforma la pausa caffè in un gioco di squadra</h3>
                        <p>
                            Karma, streak, titoli divertenti e award: PagaTu rende la routine del caffè
                            più leggera e coinvolgente per tutto l&apos;ufficio.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AuthLanding;