/**
 * Formattazione dei dati di gruppo e dei turni, per la UI.
 * Separata dai dati grezzi cosi' i testi mostrati all'utente si modificano
 * in un solo punto.
 */

export const formatRoundNumber = (group) => {
    const round = group?.currentRoundNumber;
    if (round == null) return '';
    return `Giro ${round}`;
};

export const formatRoundProgress = (group) => {
    const roundLabel = formatRoundNumber(group);
    const paid = group?.roundPaidCount;
    const pending = group?.roundPendingCount;
    if (!roundLabel && paid == null && pending == null) return '';
    const total = (paid ?? 0) + (pending ?? 0);
    const progress = total ? `${paid ?? 0}/${total} pagati` : '';
    return [roundLabel, progress].filter(Boolean).join(' · ');
};

export const formatPaymentStatus = (status) => {
    switch (status) {
        case 'PAGATO':
            return 'Pagato';
        case 'SALTATO':
            return 'Saltato';
        case 'NON_PAGATO':
        default:
            return 'In attesa';
    }
};

// Le due funzioni accettano sia il numero residuo sia il membro completo:
// il backend invia l'uno o l'altro a seconda dell'endpoint.
export const formatSkipsRemaining = (memberOrRemaining, maxSkipPerMonth = 4) => {
    if (memberOrRemaining != null && typeof memberOrRemaining === 'object') {
        const remaining = memberOrRemaining.monthlySkipsRemaining;
        const max = memberOrRemaining.maxSkipPerMonth ?? maxSkipPerMonth;
        if (remaining == null) return `Max ${max} skip/mese`;
        return `${remaining} skip rimanenti questo mese`;
    }
    if (memberOrRemaining == null) return `Max ${maxSkipPerMonth} skip/mese`;
    return `${memberOrRemaining} skip rimanenti questo mese`;
};

export const formatPayForRemaining = (memberOrRemaining, maxPayForPerMonth = 4) => {
    if (memberOrRemaining != null && typeof memberOrRemaining === 'object') {
        const remaining = memberOrRemaining.monthlyPayForRemaining;
        const max = memberOrRemaining.maxPayForPerMonth ?? maxPayForPerMonth;
        if (remaining == null) return `Max ${max} paga per/mese`;
        return `${remaining} paga per rimanenti questo mese`;
    }
    if (memberOrRemaining == null) return `Max ${maxPayForPerMonth} paga per/mese`;
    return `${memberOrRemaining} paga per rimanenti questo mese`;
};