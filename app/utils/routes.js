/**
 * Percorsi dell'applicazione e costruttori di URL.
 * Unico posto dove le rotte sono definite: main.jsx duplica i path come
 * stringhe perche' la configurazione del router deve restare statica.
 */

export const WELCOME_PATH = '/welcome';
export const HOME_PATH = '/home';
export const ERROR_PATH = '/error';

export const groupPath = (groupName) => {
    if (!groupName) {
        return HOME_PATH;
    }
    return `/group/${encodeURIComponent(groupName)}`;
};

export const invitationPath = ({ username, groupName, invitationId } = {}) => {
    if (!username || !groupName || !invitationId) {
        return null;
    }
    const params = new URLSearchParams({ username, groupName, invitationId });
    return `/invitation?${params.toString()}`;
};