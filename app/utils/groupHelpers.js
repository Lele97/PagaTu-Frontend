export const getMembers = (group) => group?.userMembershipsdto || [];

export const getCurrentTurnMember = (group) =>
    getMembers(group).find((m) => m.myTurn);

export const getMemberForUser = (group, username) =>
    getMembers(group).find((m) => m.username === username);

export const isMyTurn = (group, username) =>
    Boolean(getMemberForUser(group, username)?.myTurn);

export const formatRoundNumber = (group) => {
    const round = group?.currentRoundNumber;
    if (round == null) return '';
    return `Giro ${round}`;
};

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

export const memberInitial = (member) => {
    const label = member?.name || member?.username || '?';
    return label.charAt(0).toUpperCase();
};

export const memberDisplayName = (member) => {
    const full = [member?.name, member?.lastname].filter(Boolean).join(' ').trim();
    return full || member?.username || '';
};

export const getDisplayName = memberDisplayName;

export const formatRoundProgress = (group) => {
    const roundLabel = formatRoundNumber(group);
    const paid = group?.roundPaidCount;
    const pending = group?.roundPendingCount;
    if (!roundLabel && paid == null && pending == null) return '';
    const total = (paid ?? 0) + (pending ?? 0);
    const progress = total ? `${paid ?? 0}/${total} pagati` : '';
    return [roundLabel, progress].filter(Boolean).join(' · ');
};