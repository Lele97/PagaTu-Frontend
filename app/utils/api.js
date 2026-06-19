export const GATEWAY_URL = import.meta.env.VITE_GETAWAY_SERVER_URL;

export const getAuthToken = () => localStorage.getItem('authToken');

export const authHeaders = (extra = {}) => {
    const token = getAuthToken();
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...extra,
    };
};

export const parseErrorMessage = async (response, fallback = 'Errore del server') => {
    try {
        const data = await response.json();
        return data.message || data.error || fallback;
    } catch {
        try {
            const text = await response.text();
            return text || fallback;
        } catch {
            return fallback;
        }
    }
};

export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '€ 0,00';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};