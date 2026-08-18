import { authHeaders, GATEWAY_URL, parseErrorMessage } from '~/utils/api';

const request = async (url, options = {}) => {
    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: authHeaders(options.headers),
    });
    if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
};

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

export const fetchUserStatistics = () =>
    request(`${GATEWAY_URL}/api/coffee/user/statistics`);

export const fetchUserAwards = () =>
    request(`${GATEWAY_URL}/api/coffee/user/awards`);