import {useEffect, useState} from 'react';
import styles from '~/styles/auth.module.css';

/**
 * Generates the OAuth authorization URL for a given provider.
 * @param {string} provider - The OAuth provider ('github', 'discord', 'slack')
 * @returns {string} The full authorization URL to redirect the user to
 */
const getOAuthUrl = (provider) => {
    const clientId = import.meta.env[`VITE_${provider.toUpperCase()}_CLIENT_ID`];
    const redirectUri = import.meta.env[`VITE_${provider.toUpperCase()}_REDIRECT_URI`];

    if (!clientId || !redirectUri) {
        console.warn(`OAuth configuration missing for ${provider}`);
        return null;
    }

    const scopes = {
        github: 'read:user user:email',
        discord: 'identify email',
        slack: 'identity:read users:read users:read.email'
    };

    const baseUrls = {
        github: 'https://github.com/login/oauth/authorize',
        discord: 'https://discord.com/api/oauth2/authorize',
        slack: 'https://slack.com/oauth/v2/authorize'
    };

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes[provider] || '',
        state: provider // Used to identify the provider in the callback
    });

    return `${baseUrls[provider]}?${params.toString()}`;
};

/**
 * OAuthButtons component renders login buttons for each configured OAuth provider.
 * Only renders buttons for providers that have valid configuration.
 */
const OAuthButtons = () => {
    const [providers, setProviders] = useState([]);

    useEffect(() => {
        const configuredProviders = ['github', 'discord', 'slack'].filter(provider => {
            const url = getOAuthUrl(provider);
            return url !== null;
        });
        setProviders(configuredProviders);
    }, []);

    if (providers.length === 0) {
        return null;
    }

    const providerLabels = {
        github: 'GitHub',
        discord: 'Discord',
        slack: 'Slack'
    };

    const providerIcons = {
        github: 'bi-github',
        discord: 'bi-discord',
        slack: 'bi-slack'
    };

    return (
        <div className={styles.oauthContainer}>
            <div className={styles.divider}>
                <span>o continua con</span>
            </div>
            <div className={styles.oauthButtons}>
                {providers.map(provider => (
                    <a
                        key={provider}
                        href={getOAuthUrl(provider)}
                        className={`${styles.oauthButton} ${styles[`oauth-${provider}`]}`}
                        title={`Accedi con ${providerLabels[provider]}`}
                    >
                        <i className={`bi ${providerIcons[provider]} ${styles.oauthIcon}`}></i>
                        <span>{providerLabels[provider]}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default OAuthButtons;