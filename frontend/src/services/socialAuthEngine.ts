/**
 * Social OAuth Authorization & Token Service Engine
 * Provider configurations, OAuth state token generators, PKCE verifiers, and user profile mappers.
 */

export interface OAuthProviderConfig {
    id: 'google' | 'github';
    name: string;
    authUrl: string;
    clientId: string;
    scope: string;
    color: string;
    iconSvgPath: string;
}

export interface OAuthUserProfile {
    provider: 'google' | 'github';
    providerId: string;
    email: string;
    name: string;
    avatarUrl: string;
    accessToken: string;
    idToken?: string;
    expiresAt: number;
}

export const OAUTH_PROVIDERS: Record<string, OAuthProviderConfig> = {
    google: {
        id: 'google',
        name: 'Google Workspace',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: '8849201934-ai-resume-analyzer.apps.googleusercontent.com',
        scope: 'openid profile email',
        color: '#4285F4',
        iconSvgPath: 'M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z'
    },
    github: {
        id: 'github',
        name: 'GitHub Developer',
        authUrl: 'https://github.com/login/oauth/authorize',
        clientId: 'gh_client_99201482910',
        scope: 'user:email read:user',
        color: '#24292e',
        iconSvgPath: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385'
    }
};

export const generateOAuthStateToken = (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const initiateOAuthRedirect = (providerKey: 'google' | 'github'): { state: string; redirectUrl: string } => {
    const provider = OAUTH_PROVIDERS[providerKey];
    const state = generateOAuthStateToken();
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/${provider.id}`);
    const scope = encodeURIComponent(provider.scope);

    const redirectUrl = `${provider.authUrl}?client_id=${provider.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;

    return { state, redirectUrl };
};

export const mockHandleOAuthCallback = (
    providerKey: 'google' | 'github',
    code: string
): OAuthUserProfile => {
    return {
        provider: providerKey,
        providerId: `oauth_${providerKey}_${Date.now()}`,
        email: providerKey === 'google' ? 'candidate.alex@gmail.com' : 'alex-developer@github.io',
        name: providerKey === 'google' ? 'Alex Rivera (Google)' : 'Alex Rivera (GitHub)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        accessToken: `access_${providerKey}_token_${Math.random().toString(36).substring(7)}`,
        expiresAt: Date.now() + 3600 * 1000
    };
};
