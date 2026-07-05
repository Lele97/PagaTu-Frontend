import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import LoginForm from '~/components/login/login-form.jsx';
import SignupForm from '~/components/signup/signup-form.jsx';
import styles from '~/styles/signup.module.css';
import logostyle from '~/styles/logo.module.css';

const AuthLanding = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            navigate('/home', {replace: true});
        }
    }, [navigate]);

    useEffect(() => {
        setSearchParams(activeTab === 'signup' ? {tab: 'signup'} : {}, {replace: true});
    }, [activeTab, setSearchParams]);

    const switchTab = (tab) => setActiveTab(tab);

    return (
        <div className={styles.container}>
            <div className={styles.pageBrand}>
                <img src="/pagaTu.png" alt="Logo PagaTu" className={logostyle.logo} />
                <div className={logostyle.appTitle}>
                    <h1 className={logostyle.appTitlecolorP}>P</h1>
                    <h1 className={logostyle.appTitlecolor2a}>a</h1>
                    <h1 className={logostyle.appTitlecolorg}>g</h1>
                    <h1 className={logostyle.appTitlecolor2a}>a</h1>
                    <h1 className={logostyle.appTitlecolorT}>T</h1>
                    <h1 className={logostyle.appTitlecolor2u}>u</h1>
                </div>
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

                        {activeTab === 'login' ? (
                            <LoginForm embedded onSwitchToSignup={() => switchTab('signup')} />
                        ) : (
                            <SignupForm embedded onSwitchToLogin={() => switchTab('login')} />
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