import { GATEWAY_URL, sendRequest, messageFromBody } from '~/utils/api';

const auth = (path, options) => sendRequest(`${GATEWAY_URL}/api/auth${path}`, options);
const coffee = (path, options) => sendRequest(`${GATEWAY_URL}/api/coffee${path}`, options);

const request = async (url, options = {}) => {
    const { ok, body } = await sendRequest(url, options);
    if (!ok) {
        throw new Error(messageFromBody(body));
    }
    return body;
};

// Exports from requestApi.js
export const login = (credentials) =>
    auth('/login', { method: 'POST', body: JSON.stringify(credentials) });

export const register = (payload) =>
    auth('/register', { method: 'POST', body: JSON.stringify(payload) });

export const loginWithGoogle = (token) =>
    auth('/oauth/google', { method: 'POST', body: JSON.stringify({ token }) });

export const loginWithMicrosoft = (token) =>
    auth('/oauth/microsoft', { method: 'POST', body: JSON.stringify({ token }) });

export const verifyEmail = (key) =>
    auth(`/verify-email?key=${encodeURIComponent(key)}`);

export const resendVerification = (email) =>
    auth(`/resend-verification?email=${encodeURIComponent(email)}`, { method: 'POST' });

export const forgotPassword = (email) =>
    auth(`/forgotPassword?email=${encodeURIComponent(email)}`, { method: 'POST' });

export const validateResetToken = (key) =>
    auth(`/reset-password?key=${encodeURIComponent(key)}`);

export const resetPassword = (resetToken, payload) =>
    auth('/resetPassword', {
        method: 'PUT',
        headers: { 'X-Reset-Token': resetToken },
        body: JSON.stringify(payload),
    });

export const createGroup = (payload) =>
    coffee('/group', { method: 'POST', body: JSON.stringify(payload) });

export const getGroupsByUsername = (username) =>
    coffee(`/group/get/${encodeURIComponent(username)}`, {
        method: 'POST',
        body: JSON.stringify({ username }),
    });

export const deleteGroup = (groupName) =>
    coffee(`/group/delete/${encodeURIComponent(groupName)}`, { method: 'DELETE' });

export const getRecentPayments = (username) =>
    coffee(`/ultimi/pagamenti/${encodeURIComponent(username)}`, {
        method: 'POST',
        body: JSON.stringify({ username }),
    });

export const getUserStatistics = () =>
    coffee('/user/statistics');

export const getUserAwards = () =>
    coffee('/user/awards');

export const getPaymentRanking = ({ groupId, groupName }) =>
    coffee('/pagamenti/classifica', {
        method: 'POST',
        body: JSON.stringify({ groupId, groupName }),
    });

export const getUserByUsername = (username) =>
    coffee(`/user?username=${encodeURIComponent(username)}`);

export const getUserByUsernamePost = (username) =>
    coffee(`/user/by-username?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        body: JSON.stringify({}),
    });

export const sendGroupInvitation = (payload) =>
    coffee('/group/update/invitation', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const acceptInvitation = ({ username, groupName, invitationId }) =>
    coffee(
        `/group/update/addtogroup?username=${encodeURIComponent(username)}&groupName=${encodeURIComponent(groupName)}&invitationId=${encodeURIComponent(invitationId)}`,
        { method: 'PUT' }
    );

export const rejectInvitation = ({ username, groupName, invitationId }) =>
    coffee(
        `/group/update/rejectinvitation?username=${encodeURIComponent(username)}&groupName=${encodeURIComponent(groupName)}&invitationId=${encodeURIComponent(invitationId)}`,
        { method: 'PUT' }
    );

export const registerPayment = (groupName, payload) =>
    coffee(`/pagamento?groupName=${encodeURIComponent(groupName)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const skipPayment = (groupName) =>
    coffee(`/salta/pagamento?groupName=${encodeURIComponent(groupName)}`, {
        method: 'POST',
        body: JSON.stringify({}),
    });

export const payForFriend = (groupName, payload) =>
    coffee(`/pagamento/pagaPer?groupName=${encodeURIComponent(groupName)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const getGroupBalance = (groupName) =>
    coffee('/bilancio/gruppo', {
        method: 'POST',
        body: JSON.stringify({ groupName }),
    });

export const getGroupGamification = (groupName) =>
    coffee('/gamification/gruppo', {
        method: 'POST',
        body: JSON.stringify({ groupName }),
    });

export const removeGroupMember = (groupName, username) =>
    coffee('/group/update/member', {
        method: 'DELETE',
        body: JSON.stringify({ groupName, username }),
    });

// Exports from userApi.js
export const fetchAuthProfile = () =>
    request(`${GATEWAY_URL}/api/auth/profile`);

export const updateAuthProfile = (body) =>
    request(`${GATEWAY_URL}/api/auth/profile`, { method: 'PUT', body: JSON.stringify(body) });

export const changePassword = (body) =>
    request(`${GATEWAY_URL}/api/auth/change-password`, { method: 'PUT', body: JSON.stringify(body) });

export const fetchCoffeeProfile = () =>
    request(`${GATEWAY_URL}/api/coffee/user/profile`);

export const updateCoffeeProfile = (body) =>
    request(`${GATEWAY_URL}/api/coffee/user/profile`, { method: 'PUT', body: JSON.stringify(body) });

export const fetchPreferences = () =>
    request(`${GATEWAY_URL}/api/coffee/user/preferences`);

export const updatePreferences = (body) =>
    request(`${GATEWAY_URL}/api/coffee/user/preferences`, { method: 'PUT', body: JSON.stringify(body) });

export const fetchGroupSummary = (groupName) =>
    request(`${GATEWAY_URL}/api/coffee/group/summary?groupName=${encodeURIComponent(groupName)}`);

export const fetchGroupSettings = (groupName) =>
    request(`${GATEWAY_URL}/api/coffee/group/settings?groupName=${encodeURIComponent(groupName)}`);

export const updateGroupSettings = (body) =>
    request(`${GATEWAY_URL}/api/coffee/group/settings`, { method: 'PUT', body: JSON.stringify(body) });

export const fetchPaymentLinks = () =>
    request(`${GATEWAY_URL}/api/coffee/user/payment-links`);

export const updatePaymentLinks = (body) =>
    request(`${GATEWAY_URL}/api/coffee/user/payment-links`, { method: 'PUT', body: JSON.stringify(body) });

export const leaveGroup = (groupName) =>
    request(`${GATEWAY_URL}/api/coffee/group/update/leave?groupName=${encodeURIComponent(groupName)}`, {
        method: 'PUT',
    });

export const AVATAR_PRESETS = [
    { key: 'default', label: 'Classico', icon: 'mug-hot' },
    { key: 'cup', label: 'Tazza', icon: 'mug-saucer' },
    { key: 'beans', label: 'Chicchi', icon: 'circle' },
    { key: 'steam', label: 'Vapore', icon: 'cloud' },
    { key: 'office', label: 'Ufficio', icon: 'building' },
];

export const KARMA_OPS = {
    PAYMENT: 'payment',
    PAYMENT_FOR: 'payment_for',
    JUMP_TURN: 'jump_turn',
};

export const updateCoffeeKarma = (typeOperation, amount = 0) =>
    request(`${GATEWAY_URL}/api/coffee/user/coffeekarma`, {
        method: 'PUT',
        body: JSON.stringify({
            type_operation: typeOperation,
            amount: Number(amount) || 0,
        }),
    });