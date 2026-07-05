import { useCallback, useEffect, useState } from 'react';
import expansionStyles from '~/styles/expansion.module.css';
import groupStyles from '~/styles/group.module.css';
import { authHeaders, formatCurrency, GATEWAY_URL, parseErrorMessage } from '~/utils/api';

const LoadingSpinner = ({ message }) => (
    <div className={groupStyles.loadingSpinner}>
        <div className={groupStyles.spinner} />
        <span className={groupStyles.spinnerText}>{message}</span>
    </div>
);

const GroupStatsSection = ({ groupName }) => {
    const [balance, setBalance] = useState(null);
    const [gamification, setGamification] = useState(null);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [gamificationLoading, setGamificationLoading] = useState(false);
    const [balanceError, setBalanceError] = useState(null);
    const [gamificationError, setGamificationError] = useState(null);

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

    useEffect(() => {
        fetchBalance();
        fetchGamification();
    }, [fetchBalance, fetchGamification]);

    return (
        <>
            <section className={expansionStyles.section}>
                <h2 className={groupStyles.sectionTitle}>
                    <i className="bi bi-calculator" /> Bilancio — chi deve a chi
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
                                            {m.satispayLink && (
                                                <a href={m.satispayLink} target="_blank" rel="noreferrer" className={expansionStyles.payLinkBtn}>
                                                    <i className="bi bi-phone" /> Satispay
                                                </a>
                                            )}
                                            {m.revolutLink && (
                                                <a href={m.revolutLink} target="_blank" rel="noreferrer" className={expansionStyles.payLinkBtn}>
                                                    <i className="bi bi-bank" /> Revolut
                                                </a>
                                            )}
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
                                            {d.creditorSatispayLink && (
                                                <a href={d.creditorSatispayLink} target="_blank" rel="noreferrer" className={expansionStyles.payLinkBtn}>
                                                    Satispay
                                                </a>
                                            )}
                                            {d.creditorRevolutLink && (
                                                <a href={d.creditorRevolutLink} target="_blank" rel="noreferrer" className={expansionStyles.payLinkBtn}>
                                                    Revolut
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : null}
            </section>

            <div className={groupStyles.separator}>
                <div className={groupStyles.separatorLeft} />
                <img src="/coffee-medium-svgrepo-com.svg" alt="" />
                <div className={groupStyles.separatorRight} />
            </div>

            <section className={expansionStyles.section}>
                <h2 className={groupStyles.sectionTitle}>
                    <i className="bi bi-trophy" /> Award
                </h2>
                {gamificationLoading ? (
                    <LoadingSpinner message="Caricamento statistiche..." />
                ) : gamificationError ? (
                    <p className={expansionStyles.muted}>{gamificationError}</p>
                ) : gamification ? (
                    <>
                        {gamification.coffeeKingOfMonth && (
                            <div className={expansionStyles.kingBanner}>
                                <i className="bi bi-cup-hot-fill" /> Caffè-king del mese: <strong>{gamification.coffeeKingOfMonth}</strong>
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
        </>
    );
};

export default GroupStatsSection;