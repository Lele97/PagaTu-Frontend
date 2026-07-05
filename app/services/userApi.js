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

export const fetchThemePresets = () =>
    request(`${GATEWAY_URL}/api/coffee/user/theme-presets`);

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

// === BACKEND IMPLEMENTATION REQUIRED ===
// Endpoints to add in the backend (GET, authenticated):
//
// 1. GET /api/coffee/user/statistics
//    Returns fun + useful stats for the logged user.
//    Example response:
//    {
//      "totalPaid": 52.75,
//      "totalCoffeesForOthers": 31,
//      "timesKing": 4,
//      "currentStreak": 6,
//      "skippedCount": 1,
//      "coffeeKarma": 92,
//      "funTitle": "Coffee Legend",
//      "monthlySavedForFriends": 15.80
//    }
//
// 2. GET /api/coffee/user/awards
//    Returns list of earned awards/badges.
//    Example:
//    [
//      { "id": 1, "name": "Caffè King del mese", "level": "gold", "icon": "mug-hot" },
//      { "id": 2, "name": "Streak 7 giorni", "level": "silver", "icon": "star" },
//      { "id": 3, "name": "Ha pagato per 5 amici in un giro", "level": "gold", "icon": "heart" }
//    ]
//
// Fun stats ideas to compute server-side:
// - totalPaid / totalCoffeesForOthers
// - times you were the highest payer in a round (king)
// - current consecutive rounds paid without skip
// - total skips
// - coffeeKarma = 100 - (skips / total_rounds * 60) or similar
// - funTitle based on thresholds (Coffee Legend, The Reliable One, Skip Master, Coffee Newbie, etc.)
// - monthlySavedForFriends = sum of "paga per" this month
export const fetchUserStatistics = () =>
    request(`${GATEWAY_URL}/api/coffee/user/statistics`);

export const fetchUserAwards = () =>
    request(`${GATEWAY_URL}/api/coffee/user/awards`);