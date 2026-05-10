/** Supported BS year range */
export declare const BS_MIN = 2082;
export declare const BS_MAX = 2090;
/**
 * Anchor: BS 2083-01-01 = AD 2026-04-14 (Tuesday).
 * This value is verified against multiple independent sources (see data-source.md).
 * DO NOT change without re-verifying all conversion tests.
 */
export declare const BS_AD_ANCHOR: {
    bs: {
        year: number;
        month: number;
        day: number;
    };
    ad: Date;
};
/**
 * Returns the number of days in a given BS month.
 * Reads exclusively from bs-calendar.json — no hardcoded values.
 *
 * @param year - BS year (2082–2090)
 * @param month - BS month (1–12)
 * @returns Number of days in that month (28–32)
 * @throws {RangeError} If year is outside supported range or month outside 1–12
 */
export declare function getDaysInMonth(year: number, month: number): number;
/**
 * Returns the total number of days in a BS year.
 *
 * @param year - BS year (2082–2090)
 * @returns 365 or 366
 * @throws {RangeError} If year is outside supported range
 */
export declare function getDaysInYear(year: number): number;
