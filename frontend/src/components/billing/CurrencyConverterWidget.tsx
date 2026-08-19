import React, { useState } from 'react';
import { 
    Coins, 
    ArrowRightLeft, 
    Globe, 
    Receipt, 
    CheckCircle2, 
    Info 
} from 'lucide-react';
import { 
    SUPPORTED_CURRENCIES, 
    convertCurrency 
} from '../../services/currencyEngine';
import { CurrencySelectorBar } from './CurrencySelectorBar';

export const CurrencyConverterWidget: React.FC = () => {
    const [amount, setAmount] = useState<number>(19);
    const [fromCurrency, setFromCurrency] = useState<string>('USD');
    const [toCurrency, setToCurrency] = useState<string>('EUR');
    const [includeTax, setIncludeTax] = useState<boolean>(true);

    const conversion = convertCurrency(amount, fromCurrency, toCurrency, includeTax);
    const targetConfig = SUPPORTED_CURRENCIES[toCurrency];

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                        <Coins className="w-4 h-4" /> Global Subscription Calculator
                    </div>
                    <h2 className="text-2xl font-black text-slate-100 mt-1">Multi-Currency Converter</h2>
                </div>

                <span className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold">
                    Live FX Engine
                </span>
            </div>

            {/* Input Controls */}
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Subscription Price Amount:</label>
                    <input
                        type="number"
                        min={1}
                        max={10000}
                        value={amount}
                        onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                </div>

                {/* From / To Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                    <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-400 block mb-1">From Currency:</label>
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                            {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flagEmoji} {c.code} - {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-center pt-5">
                        <button
                            type="button"
                            onClick={handleSwap}
                            title="Swap Currencies"
                            className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-indigo-400 transition-colors shadow-md"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-400 block mb-1">To Currency:</label>
                        <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                            {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flagEmoji} {c.code} - {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tax Checkbox */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                        <input
                            type="checkbox"
                            checked={includeTax}
                            onChange={(e) => setIncludeTax(e.target.checked)}
                            className="accent-indigo-600 rounded"
                        />
                        <span>Estimate regional VAT/GST tax ({targetConfig.taxRatePercent}%)</span>
                    </label>
                </div>
            </div>

            {/* Conversion Result Breakdown Card */}
            <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span>Base Amount:</span>
                    <span className="font-mono font-bold text-slate-200">
                        {SUPPORTED_CURRENCIES[fromCurrency].symbol}{amount.toFixed(2)} {fromCurrency}
                    </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Converted Amount:</span>
                    <span className="font-mono font-bold text-slate-200">
                        {targetConfig.symbol}{conversion.convertedAmount.toFixed(2)} {toCurrency}
                    </span>
                </div>

                {includeTax && (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Estimated Regional Tax ({targetConfig.taxRatePercent}%):</span>
                        <span className="font-mono font-bold text-rose-400">
                            +{targetConfig.symbol}{conversion.taxAmount.toFixed(2)} {toCurrency}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm font-bold text-slate-100 pt-2 border-t border-slate-800">
                    <span>Total Billed Amount:</span>
                    <span className="font-mono text-xl text-teal-400 font-black">
                        {conversion.formattedTotal}
                    </span>
                </div>
            </div>

            <p className="text-[11px] text-slate-500 italic flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                FX rates updated live. Actual credit card processing fees may vary based on issuing bank.
            </p>
        </div>
    );
};
