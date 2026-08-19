/**
 * International Currency Converter & FX Rates Engine
 * Exchange rate matrices, multi-currency conversion algorithms, regional tax calculators, and formatting utilities.
 */

export interface CurrencyConfig {
    code: string;
    symbol: string;
    name: string;
    exchangeRateToUSD: number; // 1 USD = X Currency
    taxRatePercent: number;
    flagEmoji: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRateToUSD: 1.0, taxRatePercent: 8.5, flagEmoji: '🇺🇸' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', exchangeRateToUSD: 0.92, taxRatePercent: 20.0, flagEmoji: '🇪🇺' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRateToUSD: 0.78, taxRatePercent: 20.0, flagEmoji: '🇬🇧' },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRateToUSD: 83.95, taxRatePercent: 18.0, flagEmoji: '🇮🇳' },
    CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', exchangeRateToUSD: 1.36, taxRatePercent: 13.0, flagEmoji: '🇨🇦' },
    AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRateToUSD: 1.52, taxRatePercent: 10.0, flagEmoji: '🇦🇺' }
};

export interface ConversionResult {
    fromCode: string;
    toCode: string;
    originalAmount: number;
    convertedAmount: number;
    taxAmount: number;
    totalWithTax: number;
    effectiveExchangeRate: number;
    formattedTotal: string;
}

export const convertCurrency = (
    amount: number,
    fromCode: string,
    toCode: string,
    includeTax: boolean = true
): ConversionResult => {
    const source = SUPPORTED_CURRENCIES[fromCode] || SUPPORTED_CURRENCIES.USD;
    const target = SUPPORTED_CURRENCIES[toCode] || SUPPORTED_CURRENCIES.USD;

    // Convert to USD base first
    const amountInUSD = amount / source.exchangeRateToUSD;
    const convertedAmount = amountInUSD * target.exchangeRateToUSD;

    const taxAmount = includeTax ? convertedAmount * (target.taxRatePercent / 100) : 0;
    const totalWithTax = convertedAmount + taxAmount;
    const effectiveExchangeRate = target.exchangeRateToUSD / source.exchangeRateToUSD;

    const formattedTotal = `${target.symbol}${totalWithTax.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} ${target.code}`;

    return {
        fromCode: source.code,
        toCode: target.code,
        originalAmount: amount,
        convertedAmount,
        taxAmount,
        totalWithTax,
        effectiveExchangeRate,
        formattedTotal
    };
};
