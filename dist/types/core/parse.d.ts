/**
 * Parses a formatted BS date string back into { year, month, day }.
 * Supports the same tokens as formatDate: YYYY MM DD M D
 *
 * @param str - The date string to parse (e.g. '2083-01-15')
 * @param format - The format string (e.g. 'YYYY-MM-DD')
 * @returns Parsed { year, month, day }
 * @throws {Error} If the string does not match the format
 * @throws {RangeError} If the parsed date is outside the supported range
 *
 * @example
 * parseDate('2083-01-01', 'YYYY-MM-DD') // → { year: 2083, month: 1, day: 1 }
 */
export declare function parseDate(str: string, format: string): {
    year: number;
    month: number;
    day: number;
};
