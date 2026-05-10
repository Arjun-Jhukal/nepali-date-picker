import calendarJson from '../data/bs-calendar.json';
/** Supported BS year range */
export const BS_MIN = 2082;
export const BS_MAX = 2090;
/**
 * Anchor: BS 2083-01-01 = AD 2026-04-14 (Tuesday).
 * This value is verified against multiple independent sources (see data-source.md).
 * DO NOT change without re-verifying all conversion tests.
 */
export const BS_AD_ANCHOR = {
    bs: { year: 2083, month: 1, day: 1 },
    ad: new Date(2026, 3, 14), // April 14, 2026 — month is 0-indexed
};
const calendar = calendarJson;
/**
 * Returns the number of days in a given BS month.
 * Reads exclusively from bs-calendar.json — no hardcoded values.
 *
 * @param year - BS year (2082–2090)
 * @param month - BS month (1–12)
 * @returns Number of days in that month (28–32)
 * @throws {RangeError} If year is outside supported range or month outside 1–12
 */
export function getDaysInMonth(year, month) {
    if (year < BS_MIN || year > BS_MAX) {
        throw new RangeError(`BS year ${year} not in supported range ${BS_MIN}–${BS_MAX}`);
    }
    if (month < 1 || month > 12) {
        throw new RangeError(`BS month must be 1–12, got ${month}`);
    }
    return calendar[String(year)][month - 1];
}
/**
 * Returns the total number of days in a BS year.
 *
 * @param year - BS year (2082–2090)
 * @returns 365 or 366
 * @throws {RangeError} If year is outside supported range
 */
export function getDaysInYear(year) {
    if (year < BS_MIN || year > BS_MAX) {
        throw new RangeError(`BS year ${year} not in supported range ${BS_MIN}–${BS_MAX}`);
    }
    return calendar[String(year)].reduce((a, b) => a + b, 0);
}
