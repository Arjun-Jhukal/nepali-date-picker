import { getDaysInMonth } from './data-loader';

// ---------------------------------------------------------------------------
// Locale data
// ---------------------------------------------------------------------------

export const MONTH_NAMES_EN = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];

export const MONTH_NAMES_NP = [
    'बैशाख', 'जेष्ठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र',
];

export const DAY_NAMES_EN = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const DAY_NAMES_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DAY_NAMES_NP = [
    'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार',
];

export const DAY_NAMES_SHORT_NP = [
    'आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि',
];

const NP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toNepaliNumeral(n: number): string {
    return String(n)
        .split('')
        .map((c) => NP_DIGITS[parseInt(c)] ?? c)
        .join('');
}

function pad2(n: number): string {
    return String(n).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Format engine
// ---------------------------------------------------------------------------

export type Locale = 'en' | 'np';

export interface FormatContext {
    year: number;
    month: number;
    day: number;
    dayOfWeek: number; // 0=Sun
    locale: Locale;
}

/** All recognized format tokens */
const KNOWN_TOKENS = new Set([
    'YYYY', 'YY', 'MM', 'M', 'DD', 'D', 'MMMM', 'MMM', 'dddd', 'ddd',
]);

/**
 * Formats a BS date using a token string.
 * Supported tokens: YYYY YY MM M DD D MMMM MMM dddd ddd
 *
 * @param token - Format string, e.g. 'YYYY-MM-DD'
 * @param ctx - Date context (year, month, day, dayOfWeek, locale)
 * @returns Formatted string
 * @throws {Error} If the format string contains an unknown token
 *
 * @example
 * formatDate('YYYY-MM-DD', { year: 2083, month: 1, day: 1, dayOfWeek: 2, locale: 'en' })
 * // → '2083-01-01'
 */
export function formatDate(token: string, ctx: FormatContext): string {
    // Validate: scan for any unknown tokens by consuming known ones
    let check = token;
    check = check.replace(/YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd/g, '');
    // Reject leftover uppercase/lowercase letter sequences that look like tokens
    const badToken = check.match(/[A-Z]{2,}|[a-z]{3,}/);
    if (badToken) {
        throw new Error(`Unknown format token '${badToken[0]}'`);
    }

    const monthNamesLong = ctx.locale === 'np' ? MONTH_NAMES_NP : MONTH_NAMES_EN;
    const dayNamesLong = ctx.locale === 'np' ? DAY_NAMES_NP : DAY_NAMES_EN;
    const dayNamesShort = ctx.locale === 'np' ? DAY_NAMES_SHORT_NP : DAY_NAMES_SHORT_EN;

    const np = ctx.locale === 'np';

    return token.replace(/YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd/g, (t) => {
        switch (t) {
            case 'YYYY': return np ? toNepaliNumeral(ctx.year) : String(ctx.year);
            case 'YY':   return np ? toNepaliNumeral(ctx.year % 100) : pad2(ctx.year % 100);
            case 'MMMM': return monthNamesLong[ctx.month - 1];
            case 'MMM':  return monthNamesLong[ctx.month - 1].slice(0, 3);
            case 'MM':   return np ? toNepaliNumeral(ctx.month).padStart(2, '०') : pad2(ctx.month);
            case 'M':    return np ? toNepaliNumeral(ctx.month) : String(ctx.month);
            case 'DD':   return np ? toNepaliNumeral(ctx.day).padStart(2, '०') : pad2(ctx.day);
            case 'D':    return np ? toNepaliNumeral(ctx.day) : String(ctx.day);
            case 'dddd': return dayNamesLong[ctx.dayOfWeek];
            case 'ddd':  return dayNamesShort[ctx.dayOfWeek];
            default:     return t;
        }
    });
}

export { getDaysInMonth };
void KNOWN_TOKENS; // suppress unused warning — used as documentation
