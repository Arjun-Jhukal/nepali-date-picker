import { BS_MIN, BS_MAX } from './data-loader';
import { isValidBSDate } from './conversion';

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
export function parseDate(
    str: string,
    format: string,
): { year: number; month: number; day: number } {
    // Build a regex from the format string by replacing tokens with named groups
    const regexStr = format
        .replace(/[-/().\\[\]{}|^$*+?]/g, (c) => `\\${c}`)
        .replace('YYYY', '(?<year>\\d{4})')
        .replace('YY', '(?<year>\\d{2})')
        .replace('MM', '(?<month>\\d{2})')
        .replace('M', '(?<month>\\d{1,2})')
        .replace('DD', '(?<day>\\d{2})')
        .replace('D', '(?<day>\\d{1,2})');

    const regex = new RegExp(`^${regexStr}$`);
    const match = regex.exec(str);

    if (!match || !match.groups) {
        throw new Error(
            `Cannot parse '${str}' as date with format '${format}'`,
        );
    }

    const year = parseInt(match.groups['year'] ?? '', 10);
    const month = parseInt(match.groups['month'] ?? '', 10);
    const day = parseInt(match.groups['day'] ?? '', 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error(`Cannot parse string as date: '${str}'`);
    }

    if (year < BS_MIN || year > BS_MAX) {
        throw new RangeError(
            `BS year ${year} not in supported range ${BS_MIN}–${BS_MAX}`,
        );
    }
    if (month < 1 || month > 12) {
        throw new RangeError(`BS month must be 1–12, got ${month}`);
    }
    if (!isValidBSDate(year, month, day)) {
        throw new RangeError(
            `BS day ${day} is invalid for ${year}/${month}`,
        );
    }

    return { year, month, day };
}
