import { useCallback, useEffect, useState } from 'react';
import ModalWrapper from '~/components/shared/modalWrapper.jsx';
import ModalButtons from '~/components/shared/modalButtons.jsx';
import ErrorSuccessMessages from '~/components/shared/errorSuccessMessages.jsx';
import { useSettings } from '~/context/SettingsContext.jsx';
import styles from '~/styles/settings.module.css';
import sharedStyles from '~/styles/shared.module.css';
import { fetchGroupSettings, updateGroupSettings } from '~/services/userApi';
import { GATEWAY_URL, authHeaders, parseErrorMessage } from '~/utils/api';

const TABS = [
    { id: 'general', label: 'Generale' },
    { id: 'rules', label: 'Regole' },
    { id: 'members', label: 'Membri' },
];

const GroupSettingsModal = ({
    groupName,
    isAdmin,
    onInviteMember,
    onDeleteGroup,
    onSettingsSaved,
}) => {
    const { groupSettingsOpen, closeGroupSettings } = useSettings();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [settings, setSettings] = useState({
        name: '',
        description: '',
        newGroupName: '',
        maxSkipPerRound: '',
        payForEnabled: true,
        payForAdminOnly: false,
        members: [],
    });

    const loadSettings = useCallback(async () => {
        if (!groupName) return;
        setLoading(true);
        setError('');
        try {
            const data = await fetchGroupSettings(groupName);
            setSettings({
                name: data.name || groupName,
                description: data.description || '',
                newGroupName: data.name || groupName,
                maxSkipPerRound: data.maxSkipPerRound ?? '',
                payForEnabled: data.payForEnabled !== false,
                payForAdminOnly: data.payForAdminOnly === true,
                members: data.members || [],
            });
        } catch (err) {
            setError(err.message || 'Errore nel caricamento');
        } finally {
            setLoading(false);
        }
    }, [groupName]);

    useEffect(() => {
        if (groupSettingsOpen && isAdmin) loadSettings();
    }, [groupSettingsOpen, isAdmin, loadSettings]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const switchTab = (tabId) => {
        setActiveTab(tabId);
        setError('');
        setSuccess('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const body = {
                currentGroupName: groupName,
                description: settings.description,
                payForEnabled: settings.payForEnabled,
                payForAdminOnly: settings.payForAdminOnly,
            };
            if (settings.newGroupName && settings.newGroupName !== groupName) {
                body.newGroupName = settings.newGroupName;
            }
            if (settings.maxSkipPerRound !== '') {
                body.maxSkipPerRound = parseInt(settings.maxSkipPerRound, 10);
            } else {
                body.maxSkipPerRound = null;
            }

            const updated = await updateGroupSettings(body);
            showSuccess('Impostazioni salvate');
            onSettingsSaved?.(updated);
            if (updated?.name && updated.name !== groupName) {
                const stored = JSON.parse(localStorage.getItem('group') || '{}');
                localStorage.setItem('group', JSON.stringify({ ...stored, name: updated.name, groupName: updated.name }));
            }
            await loadSettings();
        } catch (err) {
            setError(err.message || 'Errore nel salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const removeMember = async (username) => {
        if (!window.confirm(`Rimuovere ${username} dal gruppo?`)) return;
        setSaving(true);
        setError('');
        try {
            const response = await fetch(`${GATEWAY_URL}/api/coffee/group/update/member`, {
                method: 'DELETE',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({ groupName, username }),
            });
            if (!response.ok) throw new Error(await parseErrorMessage(response));
            showSuccess(`Membro ${username} rimosso`);
            await loadSettings();
        } catch (err) {
            setError(err.message || 'Errore nella rimozione');
        } finally {
            setSaving(false);
        }
    };

    if (!groupSettingsOpen || !isAdmin) return null;

    const renderContent = () => {
        if (loading) return <p className={styles.loading}>Caricamento...</p>;

        switch (activeTab) {
            case 'general':
                return (
                    <form onSubmit={handleSave}>
                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label htmlFor="groupName">Nome gruppo</label>
                                <input
                                    id="groupName"
                                    className={sharedStyles.formInput}
                                    value={settings.newGroupName}
                                    onChange={(e) => setSettings((s) => ({ ...s, newGroupName: e.target.value }))}
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="description">Descrizione</label>
                                <textarea
                                    id="description"
                                    className={sharedStyles.formInput}
                                    rows={3}
                                    value={settings.description}
                                    onChange={(e) => setSettings((s) => ({ ...s, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        <ErrorSuccessMessages error={error} successMessage={success} />
                        <ModalButtons
                            modalHaveForm
                            isSubmitting={saving}
                            submitText="Salva"
                            submitLoadingText="Salvataggio..."
                            onCancel={closeGroupSettings}
                        />
                        <button
                            type="button"
                            className={styles.dangerBtn}
                            onClick={() => {
                                closeGroupSettings();
                                onDeleteGroup?.();
                            }}
                        >
                            <i className="fa-solid fa-trash" /> Elimina gruppo
                        </button>
                    </form>
                );

            case 'rules':
                return (
                    <form onSubmit={handleSave}>
                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label htmlFor="maxSkip">Max skip per giro (vuoto = illimitato)</label>
                                <input
                                    id="maxSkip"
                                    type="number"
                                    min="0"
                                    className={sharedStyles.formInput}
                                    value={settings.maxSkipPerRound}
                                    onChange={(e) => setSettings((s) => ({ ...s, maxSkipPerRound: e.target.value }))}
                                />
                            </div>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={settings.payForEnabled}
                                    onChange={(e) => setSettings((s) => ({ ...s, payForEnabled: e.target.checked }))}
                                />
                                Abilita &quot;paga per&quot;
                            </label>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={settings.payForAdminOnly}
                                    onChange={(e) => setSettings((s) => ({ ...s, payForAdminOnly: e.target.checked }))}
                                    disabled={!settings.payForEnabled}
                                />
                                Solo admin può usare &quot;paga per&quot;
                            </label>
                        </div>
                        <ErrorSuccessMessages error={error} successMessage={success} />
                        <ModalButtons
                            modalHaveForm
                            isSubmitting={saving}
                            submitText="Salva regole"
                            submitLoadingText="Salvataggio..."
                            onCancel={closeGroupSettings}
                        />
                    </form>
                );

            case 'members':
                return (
                    <>
                        <div className={styles.modalBody}>
                            <button
                                type="button"
                                className={styles.saveBtn}
                                onClick={() => {
                                    closeGroupSettings();
                                    onInviteMember?.();
                                }}
                            >
                                <i className="fa-solid fa-user-plus" /> Invita membro
                            </button>
                            <div className={styles.memberList}>
                                {settings.members.map((m) => (
                                    <div key={m.username} className={styles.memberRow}>
                                        <div>
                                            <span className={styles.memberName}>{m.username}</span>
                                            {m.isAdmin && <span className={styles.memberBadge}>Admin</span>}
                                        </div>
                                        {!m.isAdmin && (
                                            <button
                                                type="button"
                                                className={styles.closeBtn}
                                                onClick={() => removeMember(m.username)}
                                                disabled={saving}
                                                title="Rimuovi membro"
                                            >
                                                <i className="fa-solid fa-user-xmark" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <ErrorSuccessMessages error={error} successMessage={success} />
                        <ModalButtons
                            isSubmitting={saving}
                            submitText="Chiudi"
                            onClick={closeGroupSettings}
                            onCancel={closeGroupSettings}
                        />
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <ModalWrapper onClose={closeGroupSettings} title="Impostazioni gruppo" wide>
            <nav className={styles.tabList} aria-label="Sezioni gruppo">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                        onClick={() => switchTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            {renderContent()}
        </ModalWrapper>
    );
};

export default GroupSettingsModal;