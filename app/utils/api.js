export const GATEWAY_URL = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_GATEWAY_SERVER_URL || '');

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

const euroFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '€ 0,00';
    return euroFormatter.format(amount);
};

export const sendRequest = async (url, options = {}) => {
    let response;
    try {
        response = await fetch(url, {
            credentials: 'include',
            ...options,
            headers: authHeaders(options.headers),
        });
    } catch {
        throw new Error('Server non raggiungibile. Avvia il gateway (porta 8080) e riprova.');
    }
    const body = await parseBody(response);
    return {
        ok: response.ok,
        status: response.status,
        body,
    };
};

const responseCache = new Map();
const inFlight = new Map();

const isErrorResponse = (data) =>
    Boolean(data && typeof data.status === 'number' && data.status >= 400);

export const clearRequestCache = (cacheKey) => {
    if (!cacheKey) {
        responseCache.clear();
        inFlight.clear();
        return;
    }
    responseCache.delete(cacheKey);
    inFlight.delete(cacheKey);
};

export const createCachedFetcher = (cache = responseCache) => async (cacheKey, requestFn, ttl = 30000) => {
    const now = Date.now();
    const cached = cacheKey ? cache.get(cacheKey) : null;

    if (cached && now - cached.timestamp < ttl) {
        return cached.data;
    }

    if (cacheKey && cache === responseCache && inFlight.has(cacheKey)) {
        return inFlight.get(cacheKey);
    }

    const request = Promise.resolve()
        .then(requestFn)
        .then((data) => {
            if (cacheKey && !isErrorResponse(data)) {
                cache.set(cacheKey, { data, timestamp: Date.now() });
            }
            return data;
        })
        .finally(() => {
            if (cacheKey && cache === responseCache) {
                inFlight.delete(cacheKey);
            }
        });

    if (cacheKey && cache === responseCache) {
        inFlight.set(cacheKey, request);
    }

    return request;
};