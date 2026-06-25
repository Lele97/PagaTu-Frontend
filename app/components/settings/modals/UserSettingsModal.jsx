import React, { useCallback, useEffect, useState } from 'react';
import ModalWrapper from '~/components/shared/modalWrapper.jsx';
import ModalButtons from '~/components/shared/modalButtons.jsx';
import ErrorSuccessMessages from '~/components/shared/errorSuccessMessages.jsx';
import { useSettings } from '~/context/SettingsContext.jsx';
import { useTheme } from '~/context/ThemeContext.jsx';
import styles from '~/styles/settings.module.css';
import sharedStyles from '~/styles/shared.module.css';
import {
    AVATAR_PRESETS,
    changePassword,
    fetchAuthProfile,
    fetchCoffeeProfile,
    fetchPaymentLinks,
    fetchPreferences,
    updateAuthProfile,
    updateCoffeeProfile,
    updatePaymentLinks,
    updatePreferences,
} from '~/services/userApi';

const TABS = [
    { id: 'profile', label: 'Profilo', icon: 'bi-person' },
    { id: 'appearance', label: 'Aspetto', icon: 'bi-palette' },
    { id: 'payments', label: 'Pagamenti', icon: 'bi-wallet2' },
    { id: 'preferences', label: 'Preferenze', icon: 'bi-bell' },
    { id: 'security', label: 'Sicurezza', icon: 'bi-shield-lock' },
];

const THEME_SWATCHES = {
    classic: ['#6f4e37', '#faf7f2', '#c8a882'],
    espresso: ['#3b2314', '#1f1510', '#d4a574'],
    latte: ['#a67b5b', '#fffcf7', '#e8c9a0'],
    office: ['#4a5568', '#f7fafc', '#718096'],
};

const UserSettingsModal = () => {
    const { userSettingsOpen, userSettingsTab, closeUserSettings } = useSettings();
    const { presets, themeKey, setTheme, reloadTheme } = useTheme();

    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [authProfile, setAuthProfile] = useState({ firstName: '', lastName: '', email: '', username: '' });
    const [coffeeProfile, setCoffeeProfile] = useState({ name: '', lastname: '', avatarKey: 'default' });
    const [satispayLink, setSatispayLink] = useState('');
    const [revolutLink, setRevolutLink] = useState('');
    const [emailTurnReminders, setEmailTurnReminders] = useState(true);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (userSettingsOpen) setActiveTab(userSettingsTab);
    }, [userSettingsOpen, userSettingsTab]);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [auth, coffee, prefs, links] = await Promise.all([
                fetchAuthProfile(),
                fetchCoffeeProfile(),
                fetchPreferences(),
                fetchPaymentLinks(),
            ]);
            setAuthProfile({
                firstName: auth?.firstName || '',
                lastName: auth?.lastName || '',
                email: auth?.email || '',
                username: auth?.username || '',
            });
            setCoffeeProfile({
                name: coffee?.name || '',
                lastname: coffee?.lastname || '',
                avatarKey: coffee?.avatarKey || 'default',
            });
            setEmailTurnReminders(prefs?.emailTurnReminders !== false);
            setSatispayLink(links?.satispayLink || '');
            setRevolutLink(links?.revolutLink || '');
        } catch (err) {
            setError(err.message || 'Errore nel caricamento');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userSettingsOpen) loadData();
    }, [userSettingsOpen, loadData]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const switchTab = (tabId) => {
        setActiveTab(tabId);
        setError('');
        setSuccess('');
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await Promise.all([
                updateAuthProfile({
                    firstName: authProfile.firstName,
                    lastName: authProfile.lastName,
                }),
                updateCoffeeProfile({
                    name: coffeeProfile.name,
                    lastname: coffeeProfile.lastname,
                    avatarKey: coffeeProfile.avatarKey,
                }),
            ]);
            showSuccess('Profilo aggiornato');
        } catch (err) {
            setError(err.message || 'Errore nel salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const saveAppearance = async (key) => {
        setSaving(true);
        setError('');
        try {
            await updatePreferences({ themeKey: key });
            setTheme(key);
            await reloadTheme();
            showSuccess('Tema aggiornato');
        } catch (err) {
            setError(err.message || 'Errore nel salvataggio del tema');
        } finally {
            setSaving(false);
        }
    };

    const savePayments = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const data = await updatePaymentLinks({ satispayLink, revolutLink });
            setSatispayLink(data?.satispayLink || '');
            setRevolutLink(data?.revolutLink || '');
            showSuccess('Link aggiornati');
        } catch (err) {
            setError(err.message || 'Errore nel salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const savePreferences = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await updatePreferences({ emailTurnReminders });
            showSuccess('Preferenze aggiornate');
        } catch (err) {
            setError(err.message || 'Errore nel salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Le password non coincidono');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showSuccess('Password aggiornata');
        } catch (err) {
            setError(err.message || 'Errore nel cambio password');
        } finally {
            setSaving(false);
        }
    };

    const themeOptions = presets?.length ? presets : [
        { key: 'classic', label: 'Classic' },
        { key: 'espresso', label: 'Espresso' },
        { key: 'latte', label: 'Latte' },
        { key: 'office', label: 'Office' },
    ];

    const renderContent = () => {
        if (loading) return <p className={styles.loading}>Caricamento...</p>;

        switch (activeTab) {
            case 'profile':
                return (
                    <form onSubmit={saveProfile}>
                        <div className={styles.modalBody}>
                            <p className={styles.sectionHint}>
                                Aggiorna i tuoi dati personali. L&apos;username non è modificabile.
                            </p>
                            <div className={styles.field}>
                                <label>Username</label>
                                <input className={sharedStyles.formInput} value={authProfile.username} disabled />
                            </div>
                            <div className={styles.field}>
                                <label>Email</label>
                                <input className={sharedStyles.formInput} value={authProfile.email} disabled />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="firstName">Nome</label>
                                <input
                                    id="firstName"
                                    className={sharedStyles.formInput}
                                    value={coffeeProfile.name || authProfile.firstName}
                                    onChange={(e) => {
                                        setCoffeeProfile((p) => ({ ...p, name: e.target.value }));
                                        setAuthProfile((p) => ({ ...p, firstName: e.target.value }));
                                    }}
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="lastName">Cognome</label>
                                <input
                                    id="lastName"
                                    className={sharedStyles.formInput}
                                    value={coffeeProfile.lastname || authProfile.lastName}
                                    onChange={(e) => {
                                        setCoffeeProfile((p) => ({ ...p, lastname: e.target.value }));
                                        setAuthProfile((p) => ({ ...p, lastName: e.target.value }));
                                    }}
                                />
                            </div>
                            <div className={styles.field}>
                                <span className={styles.sectionTitle}>Avatar</span>
                                <div className={styles.avatarGrid}>
                                    {AVATAR_PRESETS.map((a) => (
                                        <button
                                            key={a.key}
                                            type="button"
                                            className={`${styles.avatarBtn} ${coffeeProfile.avatarKey === a.key ? styles.avatarBtnActive : ''}`}
                                            onClick={() => setCoffeeProfile((p) => ({ ...p, avatarKey: a.key }))}
                                            title={a.label}
                                        >
                                            <i className={`bi ${a.icon}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <ErrorSuccessMessages error={error} successMessage={success} />
                        <ModalButtons
                            modalHaveForm
                            isSubmitting={saving}
                            submitText="Salva profilo"
                            submitLoadingText="Salvataggio..."
                            onCancel={closeUserSettings}
                        />
                    </form>
                );

            case 'appearance':
                return (
                    <>
                        <div className={styles.modalBody}>
                            <p className={styles.sectionHint}>
                                Scegli un tema preset per personalizzare l&apos;aspetto dell&apos;app.
                            </p>
                            <div className={styles.themeGrid}>
                                {themeOptions.map((t) => (
                                    <button
                                        key={t.key}
                                        type="button"
                                        className={`${styles.themeCard} ${themeKey === t.key ? styles.themeCardActive : ''}`}
                                        onClick={() => saveAppearance(t.key)}
                                        disabled={saving}
                                    >
                                        <strong>{t.label || t.key}</strong>
                                        <div
                                            className={styles.themeSwatch}
                                            style={{
                                                background: `linear-gradient(90deg, ${(THEME_SWATCHES[t.key] || THEME_SWATCHES.classic).join(', ')})`,
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ErrorSuccessMessages error={error} successMessage={success} />
                        <ModalButtons
                            isSubmitting={saving}
                            submitText="Chiudi"
                            onClick={closeUserSettings}
                            onCancel={closeUserSettings}
                        />
                    </>
                );

            case 'payments':
                return (
                    <form onSubmit={savePayments}>
                        <div className={styles.modalBody}>
                            <p className={styles.sectionHint}>
                                Aggiungi i tuoi link Satispay o Revolut. I membri del gruppo li vedranno nel bilancio per rimborsarti.
                            </p>
                            <div className={styles.field}>
                                <label htmlFor="satispay">Link Satispay</label>
                                <input
                                    id="satispay"
                                    type="url"
                                    className={sharedStyles.formInput}
                                    value={satispayLink}
                                    onChange={(e) => setSatispayLink(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="revolut">Link Revolut</label>
                                <input
                                    id="revolut"
                                    type="url"
                                    className={sharedStyles.formInput}
                                    value={revolutLink}
                                    onChange={(e) => setRevolutLink(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <ErrorSuccessMessages error={error} successMessage={success} />
                        <ModalButtons
                            modalHaveForm
                            isSubmitting={saving}
                            submitText="Salva link"
                            submitLoadingText="Salvataggio..."
                            onCancel={closeUserSettings}
                        />
                    </form>
                );

            case 'preferences':
                return (
                    <form onSubmit={savePreferences}>
                        <div className={styles.modalBody}>
                            <p className={styles.sectionHint}>Gestisci le notifiche e le preferenze dell&apos;app.</p>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={emailTurnReminders}
                                    onChange={(e) => setEmailTurnReminders(e.target.checked)}
                                />
                                Ricevi promemoria email quando è il tuo turno
                            </label>
                        </div>
                        <ErrorSuccessMessages error={error} successMessage={success} />
                        <ModalButtons
                            modalHaveForm
                            isSubmitting={saving}
                            submitText="Salva preferenze"
                            submitLoadingText="Salvataggio..."
                            onCancel={closeUserSettings}
                        />
                    </form>
                );

            case 'security':
                return (
                    <form onSubmit={savePassword}>
                        <div className={styles.modalBody}>
                            <p className={styles.sectionHint}>Cambia la password del tuo account.</p>
                            <div className={styles.field}>
                                <label htmlFor="currentPassword">Password attuale</label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    className={sharedStyles.formInput}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="newPassword">Nuova password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    className={sharedStyles.formInput}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="confirmPassword">Conferma password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className={sharedStyles.formInput}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                        <ErrorSuccessMessages error={error} successMessage={success} />
                        <ModalButtons
                            modalHaveForm
                            isSubmitting={saving}
                            submitText="Cambia password"
                            submitLoadingText="Salvataggio..."
                            onCancel={closeUserSettings}
                        />
                    </form>
                );

            default:
                return null;
        }
    };

    if (!userSettingsOpen) return null;

    return (
        <ModalWrapper onClose={closeUserSettings} title="Impostazioni" wide>
            <nav className={styles.tabList} aria-label="Sezioni impostazioni">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                        onClick={() => switchTab(tab.id)}
                    >
                        <i className={`bi ${tab.icon}`} /> {tab.label}
                    </button>
                ))}
            </nav>
            {renderContent()}
        </ModalWrapper>
    );
};

export default UserSettingsModal;