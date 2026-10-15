/**
 * Configurazione centralizzata dei provider OAuth2.
 *
 * Ogni provider viene mostrato solo se il rispettivo client id e' configurato.
 * Aggiungere un provider = una voce in questo file + (se necessario) un'icona
 * in OAuthIcons.jsx. Nessun'altra modifica e' richiesta.
 */

export const CALLBACK_PATH = '/welcome';

/**
 * Deve coincidere con la redirect_uri registrata nelle app OAuth dei provider.
 * Derivarla da window.location.origin la rende corretta in sviluppo e in
 * produzione senza toccare il codice.
 */
export const callbackUrl = () => `${window.location.origin}${CALLBACK_PATH}`;

const env = import.meta.env;

export const OAUTH_PROVIDERS = [
    {
        id: 'github',
        label: 'GitHub',
        clientId: env.VITE_GITHUB_CLIENT_ID,
        authorizeUrl: 'https://github.com/login/oauth/authorize',
        scope: 'read:user user:email',
        icon: 'github',
    },
    {
        id: 'google',
        label: 'Google',
        clientId: env.VITE_GOOGLE_CLIENT_ID,
        // Google Identity Services non usa il redirect: il credential arriva
        // direttamente al callback JS, quindi non servono URL/scope.
        sdk: 'gis',
        icon: 'google',
    },
    {
        id: 'discord',
        label: 'Discord',
        clientId: env.VITE_DISCORD_CLIENT_ID,
        authorizeUrl: 'https://discord.com/oauth2/authorize',
        scope: 'identify email',
        extraParams: { response_type: 'code' },
        icon: 'discord',
    },
    {
        id: 'slack',
        label: 'Slack',
        clientId: env.VITE_SLACK_CLIENT_ID,
        authorizeUrl: 'https://slack.com/oauth/v2/authorize',
        scope: 'users:read identity:read users:read.email',
        extraParams: { user_scope: 'chat:write users:read' },
        icon: 'slack',
    },
];

/**
 * Suffisso della classe CSS del pulsante, definita in signup.module.css
 * come .oauthBtn<suffix> (es. oauthBtnGithub). Va tenuto allineato a mano:
 * i CSS module sono case-sensitive.
 */
export const providerCssSuffix = (id) => ({
    github: 'Github',
    google: 'Google',
    discord: 'Discord',
    slack: 'Slack',
}[id] || '');

/** Provider effettivamente disponibili, in ordine di rendering. */
export const ENABLED_OAUTH_PROVIDERS = OAUTH_PROVIDERS.filter((p) => Boolean(p.clientId));

export const isProviderEnabled = (id) =>
    ENABLED_OAUTH_PROVIDERS.some((provider) => provider.id === id);

/** Costruisce l'URL di autorizzazione per un provider. */
export const buildAuthorizeUrl = (provider) => {
    const params = new URLSearchParams({
        client_id: provider.clientId,
        redirect_uri: callbackUrl(),
        scope: provider.scope,
        ...(provider.extraParams || {}),
    });
    return `${provider.authorizeUrl}?${params.toString()}`;
};

/** Label leggibile del provider, con fallback sul parametro ricevuto. */
export const providerLabel = (id) =>
    OAUTH_PROVIDERS.find((provider) => provider.id === id)?.label || id;