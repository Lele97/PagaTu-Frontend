export const WELCOME_PATH = '/welcome';
export const HOME_PATH = '/home';
export const ERROR_PATH = '/error';
export const TOKEN_ERROR_PATH = '/errore-token';

export const groupPath = (groupName) => {
    if (!groupName) {
        return HOME_PATH;
    }
    return `/group/${encodeURIComponent(groupName)}`;
};

export const authRedirect = (navigate) => navigate(WELCOME_PATH, { replace: true });

export const invitationPath = ({ username, groupName, invitationId } = {}) => {
    if (!username || !groupName || !invitationId) {
        return null;
    }
    const params = new URLSearchParams({ username, groupName, invitationId });
    return `/invitation?${params.toString()}`;
};

export const readPendingInvitation = () => {
    const raw = localStorage.getItem('pendingInvitation');
    if (!raw) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw);
        return invitationPath(parsed) ? parsed : null;
    } catch {
        localStorage.removeItem('pendingInvitation');
        return null;
    }
};

export const pendingInvitationPath = () => invitationPath(readPendingInvitation() || {});