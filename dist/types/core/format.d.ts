import { getDaysInMonth } from './data-loader';
export declare const MONTH_NAMES_EN: string[];
export declare const MONTH_NAMES_NP: string[];
export declare const DAY_NAMES_EN: string[];
export declare const DAY_NAMES_SHORT_EN: string[];
export declare const DAY_NAMES_NP: string[];
export declare const DAY_NAMES_SHORT_NP: string[];
export declare function toNepaliNumeral(n: number): string;
export type Locale = 'en' | 'np';
export interface FormatContext {
    year: number;
    month: number;
    day: number;
    dayOfWeek: number;
    locale: Locale;
}
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
export declare function formatDate(token: string, ctx: FormatContext): string;
export { getDaysInMonth };
