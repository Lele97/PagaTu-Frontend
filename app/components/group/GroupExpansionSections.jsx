import { useCallback, useEffect, useState } from 'react';
import expansionStyles from '~/styles/expansion.module.css';
import groupStyles from '~/styles/group.module.css';
import LoadingSpinner from '~/components/shared/loadingSpinner.jsx';
import CoffeeSeparator from '~/components/shared/CoffeeSeparator.jsx';
import { authHeaders, formatCurrency, GATEWAY_URL, parseErrorMessage } from '~/utils/api';

const GroupExpansionSections = ({ groupName, isAdmin }) => {
    const [balance, setBalance] = useState(null);
    const [gamification, setGamification] = useState(null);
    const [rulesDraft, setRulesDraft] = useState(null);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [gamificationLoading, setGamificationLoading] = useState(false);
    const [rulesLoading, setRulesLoading] = useState(false);
    const [rulesSaving, setRulesSaving] = useState(false);
    const [balanceError, setBalanceError] = useState(null);
    const [gamificationError, setGamificationError] = useState(null);
    const [rulesError, setRulesError] = useState(null);
    const [rulesSuccess, setRulesSuccess] = useState('');

    const fetchBalance = useCallback(async () => {
        if (!groupName) return;
        setBalanceLoading(true);
        setBalanceError(null);
        try {
            const response = await fetch(`${GATEWAY_URL}/api/coffee/bilancio/gruppo`, {
                method: 'POST',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({ groupName }),
            });
            if (response.status === 204) {
                setBalance(null);
                setBalanceError('Non ci sono ancora pagamenti per calcolare il bilancio');
                return;
            }
            if (!response.ok) {
                setBalanceError(await parseErrorMessage(response, 'Errore nel recupero del bilancio'));
                return;
            }
            setBalance(await response.json());
        } catch {
            setBalanceError('Errore di connessione');
        } finally {
            setBalanceLoading(false);
        }
    }, [groupName]);

    const fetchGamification = useCallback(async () => {
        if (!groupName) return;
        setGamificationLoading(true);
        setGamificationError(null);
        try {
            const response = await fetch(`${GATEWAY_URL}/api/coffee/gamification/gruppo`, {
                method: 'POST',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({ groupName }),
            });
            if (!response.ok) {
                setGamificationError(await parseErrorMessage(response, 'Errore nel recupero delle statistiche'));
                return;
            }
            setGamification(await response.json());
        } catch {
            setGamificationError('Errore di connessione');
        } finally {
            setGamificationLoading(false);
        }
    }, [groupName]);

    const fetchRules = useCallback(async () => {
        if (!groupName) return;
        setRulesLoading(true);
        setRulesError(null);
        try {
            const response = await fetch(
                `${GATEWAY_URL}/api/coffee/regole/gruppo?groupName=${encodeURIComponent(groupName)}`,
                { headers: authHeaders(), credentials: 'include' }
            );
            if (!response.ok) {
                setRulesError(await parseErrorMessage(response, 'Errore nel recupero delle regole'));
                return;
            }
            const data = await response.json();
            setRulesDraft({
                maxSkipPerRound: data.maxSkipPerRound ?? '',
                payForEnabled: data.payForEnabled !== false,
                payForAdminOnly: data.payForAdminOnly === true,
            });
        } catch {
            setRulesError('Errore di connessione');
        } finally {
            setRulesLoading(false);
        }
    }, [groupName]);

    useEffect(() => {
        fetchBalance();
        fetchGamification();
        fetchRules();
    }, [fetchBalance, fetchGamification, fetchRules]);

    const saveRules = async (e) => {
        e.preventDefault();
        setRulesSaving(true);
        setRulesError(null);
        setRulesSuccess('');
        try {
            const body = {
                groupName,
                payForEnabled: rulesDraft.payForEnabled,
                payForAdminOnly: rulesDraft.payForAdminOnly,
            };
            if (rulesDraft.maxSkipPerRound !== '') {
                body.maxSkipPerRound = parseInt(rulesDraft.maxSkipPerRound, 10);
            } else {
                body.maxSkipPerRound = null;
            }

            const response = await fetch(`${GATEWAY_URL}/api/coffee/regole/gruppo`, {
                method: 'PUT',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                setRulesError(await parseErrorMessage(response, 'Errore nel salvataggio delle regole'));
                return;
            }
            setRulesSuccess('Regole aggiornate con successo');
            setTimeout(() => setRulesSuccess(''), 3000);
        } catch {
            setRulesError('Errore di connessione');
        } finally {
            setRulesSaving(false);
        }
    };

    return (
        <>
            <section className={expansionStyles.section}>
                <h2 className={groupStyles.sectionTitle}>
                    <i className="fa-solid fa-scale-balanced"></i> Bilancio
                </h2>
                {balanceLoading ? (
                    <LoadingSpinner message="Calcolo bilancio..." />
                ) : balanceError ? (
                    <p className={expansionStyles.muted}>{balanceError}</p>
                ) : balance ? (
                    <>
                        <div className={expansionStyles.summaryRow}>
                            <span>Totale speso: <strong>{formatCurrency(balance.totalSpent)}</strong></span>
                            <span>Membri: <strong>{balance.memberCount}</strong></span>
                        </div>
                        <div className={expansionStyles.cardGrid}>
                            {balance.memberBalances?.map((m) => (
                                <div key={m.username} className={expansionStyles.card}>
                                    <h4>{m.username}</h4>
                                    <p>Pagato: {formatCurrency(m.totalPaid)}</p>
                                    <p>Quota equa: {formatCurrency(m.fairShare)}</p>
                                    <p className={m.netBalance >= 0 ? expansionStyles.positive : expansionStyles.negative}>
                                        Saldo: {m.netBalance >= 0 ? '+' : ''}{formatCurrency(m.netBalance)}
                                    </p>
                                    {(m.satispayLink || m.revolutLink) && (
                                        <div className={expansionStyles.payLinks}>
                                            {m.satispayLink && <a href={m.satispayLink} target="_blank" rel="noreferrer">Satispay</a>}
                                            {m.revolutLink && <a href={m.revolutLink} target="_blank" rel="noreferrer">Revolut</a>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {balance.pairwiseDebts?.length > 0 && (
                            <div className={expansionStyles.debtsBlock}>
                                <h3>Debiti netti</h3>
                                {balance.pairwiseDebts.map((d, i) => (
                                    <div key={i} className={expansionStyles.debtRow}>
                                        <span>
                                            <strong>{d.debtorUsername}</strong> deve a <strong>{d.creditorUsername}</strong>: {formatCurrency(d.amount)}
                                        </span>
                                        <div className={expansionStyles.payLinks}>
                                            {d.creditorSatispayLink && <a href={d.creditorSatispayLink} target="_blank" rel="noreferrer">Satispay</a>}
                                            {d.creditorRevolutLink && <a href={d.creditorRevolutLink} target="_blank" rel="noreferrer">Revolut</a>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : null}
            </section>

            <CoffeeSeparator />

            <section className={expansionStyles.section}>
                <h2 className={groupStyles.sectionTitle}>
                    <i className="fa-solid fa-trophy"></i> Award
                </h2>
                {gamificationLoading ? (
                    <LoadingSpinner message="Caricamento statistiche..." />
                ) : gamificationError ? (
                    <p className={expansionStyles.muted}>{gamificationError}</p>
                ) : gamification ? (
                    <>
                        {gamification.coffeeKingOfMonth && (
                            <div className={expansionStyles.kingBanner}>
                                <i className="fa-solid fa-mug-hot"></i> Caffè-king del mese: <strong>{gamification.coffeeKingOfMonth}</strong>
                            </div>
                        )}
                        <div className={expansionStyles.cardGrid}>
                            {gamification.members?.map((m) => (
                                <div key={m.username} className={expansionStyles.card}>
                                    <h4>
                                        {m.username}
                                        {m.coffeeKingOfMonth && <span className={expansionStyles.crown}> 👑</span>}
                                    </h4>
                                    <p>Pagamenti: {m.paymentCount} · Skip: {m.skipCount}</p>
                                    <p>Streak: {m.paymentStreak} 🔥</p>
                                    <p>Questo mese: {formatCurrency(m.totalPaidThisMonth)}</p>
                                    {m.badges?.length > 0 && (
                                        <div className={expansionStyles.badges}>
                                            {m.badges.map((b) => (
                                                <span key={b.code} className={expansionStyles.badge} title={b.description}>{b.label}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : null}
            </section>

            {isAdmin && (
                <section className={expansionStyles.section}>
                    <h2 className={groupStyles.sectionTitle}>
                        <i className="fa-solid fa-sliders"></i> Regole del gruppo
                    </h2>
                    {rulesLoading ? (
                        <LoadingSpinner message="Caricamento regole..." />
                    ) : rulesDraft ? (
                        <form onSubmit={saveRules} className={expansionStyles.rulesForm}>
                            <label>
                                Max skip per giro (vuoto = illimitato)
                                <input
                                    type="number"
                                    min="0"
                                    value={rulesDraft.maxSkipPerRound}
                                    onChange={(e) => setRulesDraft({ ...rulesDraft, maxSkipPerRound: e.target.value })}
                                    className={expansionStyles.input}
                                />
                            </label>
                            <label className={expansionStyles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={rulesDraft.payForEnabled}
                                    onChange={(e) => setRulesDraft({ ...rulesDraft, payForEnabled: e.target.checked })}
                                />
                                Abilita &quot;paga per&quot;
                            </label>
                            <label className={expansionStyles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={rulesDraft.payForAdminOnly}
                                    onChange={(e) => setRulesDraft({ ...rulesDraft, payForAdminOnly: e.target.checked })}
                                    disabled={!rulesDraft.payForEnabled}
                                />
                                Solo admin può usare &quot;paga per&quot;
                            </label>
                            {rulesError && <p className={expansionStyles.error}>{rulesError}</p>}
                            {rulesSuccess && <p className={expansionStyles.success}>{rulesSuccess}</p>}
                            <button type="submit" className={groupStyles.groupButton} disabled={rulesSaving}>
                                {rulesSaving ? 'Salvataggio...' : 'Salva regole'}
                            </button>
                        </form>
                    ) : rulesError ? (
                        <p className={expansionStyles.muted}>{rulesError}</p>
                    ) : null}
                </section>
            )}
        </>
    );
};

export default GroupExpansionSections;