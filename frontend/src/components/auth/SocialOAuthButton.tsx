import React from 'react';
import { ShieldCheck, LogIn, ExternalLink } from 'lucide-react';
import { OAUTH_PROVIDERS, OAuthProviderConfig } from '../../services/socialAuthEngine';

interface SocialOAuthButtonProps {
    providerKey: 'google' | 'github';
    onInitiate: (providerKey: 'google' | 'github') => void;
    isLoading?: boolean;
}

export const SocialOAuthButton: React.FC<SocialOAuthButtonProps> = ({
    providerKey,
    onInitiate,
    isLoading = false
}) => {
    const provider: OAuthProviderConfig = OAUTH_PROVIDERS[providerKey];

    return (
        <button
            type="button"
            onClick={() => onInitiate(providerKey)}
            disabled={isLoading}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 disabled:opacity-50 text-slate-200 text-xs font-bold transition-all shadow-md group"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-slate-700">
                    {providerKey === 'google' ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9z"/>
                            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 fill-slate-200" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                    )}
                </div>

                <div className="text-left">
                    <span className="block font-bold text-slate-100">Continue with {provider.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">OAuth 2.0 Single Sign-On</span>
                </div>
            </div>

            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </button>
    );
};
