import React, { useState } from 'react';
import { 
    ShieldCheck, 
    KeyRound, 
    CheckCircle2, 
    AlertCircle, 
    UserCheck 
} from 'lucide-react';
import { 
    OAuthUserProfile, 
    initiateOAuthRedirect, 
    mockHandleOAuthCallback 
} from '../../services/socialAuthEngine';
import { SocialOAuthButton } from './SocialOAuthButton';

export const SocialOAuthLoginPanel: React.FC = () => {
    const [authenticatedUser, setAuthenticatedUser] = useState<OAuthUserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleInitiate = (providerKey: 'google' | 'github') => {
        setIsLoading(true);
        const { state, redirectUrl } = initiateOAuthRedirect(providerKey);

        // Simulate OAuth authorization flow
        setTimeout(() => {
            const user = mockHandleOAuthCallback(providerKey, 'mock_auth_code_9901');
            setAuthenticatedUser(user);
            setIsLoading(false);
        }, 1200);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
                    <ShieldCheck className="w-4 h-4" /> OAuth 2.0 SSO Authentication
                </div>
                <h2 className="text-2xl font-black text-slate-100">Social Account Sign In</h2>
                <p className="text-xs text-slate-400">One-click login for candidates and recruiters.</p>
            </div>

            {authenticatedUser ? (
                <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-5 space-y-4 text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-emerald-400 shadow-lg">
                        <img src={authenticatedUser.avatarUrl} alt={authenticatedUser.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-100">{authenticatedUser.name}</h3>
                        <p className="text-xs text-emerald-400 font-mono mt-0.5">{authenticatedUser.email}</p>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 uppercase tracking-wider mt-2">
                            Authenticated via {authenticatedUser.provider}
                        </span>
                    </div>
                    <button
                        onClick={() => setAuthenticatedUser(null)}
                        className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                        Sign Out Session
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <SocialOAuthButton providerKey="google" onInitiate={handleInitiate} isLoading={isLoading} />
                    <SocialOAuthButton providerKey="github" onInitiate={handleInitiate} isLoading={isLoading} />
                </div>
            )}
        </div>
    );
};
