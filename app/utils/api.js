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

const parseBody = async (response) => {
    if (response.status === 204) {
        return null;
    }
    const text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

export const messageFromBody = (body, fallback = 'Errore del server') => {
    if (body == null || body === '') {
        return fallback;
    }
    if (typeof body === 'string') {
        return body;
    }
    return body.message || body.error || fallback;
};

export const parseErrorMessage = async (response, fallback = 'Errore del server') => {
    try {
        return messageFromBody(await parseBody(response), fallback);
    } catch {
        return fallback;
    }
};

export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '€ 0,00';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const sendRequest = async (url, options = {}) => {
    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: authHeaders(options.headers),
    });
    const body = await parseBody(response);
    return {
        ok: response.ok,
        status: response.status,
        body,
    };
};

export const createCachedFetcher = (cache) => async (cacheKey, requestFn, ttl = 30000) => {
    const now = Date.now();
    const cached = cacheKey ? cache.get(cacheKey) : null;

    if (cached && now - cached.timestamp < ttl) {
        return cached.data;
    }

    const data = await requestFn();
    if (cacheKey) {
        cache.set(cacheKey, { data, timestamp: now });
    }
    return data;
};