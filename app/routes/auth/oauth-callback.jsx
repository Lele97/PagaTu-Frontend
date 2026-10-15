import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';

/**
 * OAuthCallback handles the redirect from OAuth providers after user authorization.
 * It receives the authorization code, exchanges it for a token via the backend,
 * and then redirects the user to the appropriate page.
 */
const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const NGROK_SERVER_URL = import.meta.env.VITE_NGROK_SERVER_URL;

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state'); // This identifies the provider
            const error = searchParams.get('error');

            if (error) {
                console.error(`OAuth error from ${state}:`, error);
                navigate('/login?error=oauth_failed');
                return;
            }

            if (!code || !state) {
                console.error('Missing code or state in OAuth callback');
                navigate('/login?error=invalid_callback');
                return;
            }

            try {
                const provider = state; // 'github', 'discord', or 'slack'
                const redirectUri = import.meta.env[`VITE_${provider.toUpperCase()}_REDIRECT_URI`];

                const response = await fetch(`${NGROK_SERVER_URL}/api/auth/oauth/${provider}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        code: code,
                        redirect_uri: redirectUri
                    }),
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Errore durante il login con ${provider}`);
                }

                const {token, username, email} = await response.json();

                // Store auth data
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify({username, email}));

                // Handle pending invitation
                const pendingInvitation = localStorage.getItem('pendingInvitation');
                if (pendingInvitation) {
                    try {
                        const {username: invitedUser, groupName} = JSON.parse(pendingInvitation);
                        const currentUsername = username;

                        if (currentUsername === invitedUser) {
                            navigate(`/invitation?username=${encodeURIComponent(invitedUser)}&groupName=${encodeURIComponent(groupName)}`);
                            return;
                        }
                    } catch {
                        // Ignore parsing errors
                    }
                    localStorage.removeItem('pendingInvitation');
                }

                navigate('/home');
            } catch (err) {
                console.error('OAuth callback error:', err);
                navigate('/login?error=oauth_failed');
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </div>
                <p className="mt-3">Completamento accesso...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;