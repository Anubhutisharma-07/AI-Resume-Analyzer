import React from 'react';
import { CurrencyConverterWidget } from '../components/billing/CurrencyConverterWidget';

export const CurrencyConverterPageView: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans">
            <CurrencyConverterWidget />
        </div>
    );
};

export default CurrencyConverterPageView;
