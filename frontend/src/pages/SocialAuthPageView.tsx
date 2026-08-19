import React from 'react';
import { SocialOAuthLoginPanel } from '../components/auth/SocialOAuthLoginPanel';

export const SocialAuthPageView: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
            <SocialOAuthLoginPanel />
        </div>
    );
};

export default SocialAuthPageView;
