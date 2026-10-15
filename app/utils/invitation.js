/**
 * Invito pendente: conserva l'invito di gruppo a cui l'utente stava per
 * entrare quando si e' autenticato con un provider diverso.
 */

import { invitationPath } from '~/utils/routes';

const STORAGE_KEY = 'pendingInvitation';

export const readPendingInvitation = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw);
        // invitationPath restituisce null se manca un campo obbligatorio:
        // e' il modo piu' economico per validare senza un secondo schema.
        return invitationPath(parsed) ? parsed : null;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
};

export const pendingInvitationPath = () => invitationPath(readPendingInvitation() || {});