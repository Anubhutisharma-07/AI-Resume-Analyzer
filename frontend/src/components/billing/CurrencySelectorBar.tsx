import React from 'react';
import { Globe, ArrowRightLeft, Percent } from 'lucide-react';
import { SUPPORTED_CURRENCIES, ConversionResult } from '../../services/currencyEngine';

interface CurrencySelectorBarProps {
    selectedCurrency: string;
    onCurrencyChange: (code: string) => void;
}

export const CurrencySelectorBar: React.FC<CurrencySelectorBarProps> = ({
    selectedCurrency,
    onCurrencyChange
}) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Select Display Currency:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                    <button
                        key={curr.code}
                        type="button"
                        onClick={() => onCurrencyChange(curr.code)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedCurrency === curr.code
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-500'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                    >
                        <span>{curr.flagEmoji}</span>
                        <span>{curr.code}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
