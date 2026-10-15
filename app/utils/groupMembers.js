/**
 * Accesso ai membri di un gruppo e ai dati che li descrivono.
 * Il backend espone i membri in `userMembershipsdto`: qui si normalizza
 * l'accesso per non ripetere il fallback in ogni componente.
 */

export const getMembers = (group) => group?.userMembershipsdto || [];

export const getCurrentTurnMember = (group) =>
    getMembers(group).find((m) => m.myTurn);

export const getMemberForUser = (group, username) =>
    getMembers(group).find((m) => m.username === username);

export const isMyTurn = (group, username) =>
    Boolean(getMemberForUser(group, username)?.myTurn);

export const memberInitial = (member) => {
    const label = member?.name || member?.username || '?';
    return label.charAt(0).toUpperCase();
};

export const memberDisplayName = (member) => {
    const full = [member?.name, member?.lastname].filter(Boolean).join(' ').trim();
    return full || member?.username || '';
};

// Alias mantenuto per i componenti che usano il nome "getDisplayName".
export const getDisplayName = memberDisplayName;