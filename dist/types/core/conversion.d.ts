/**
 * Converts a Bikram Sambat (BS) date to an AD Date object.
 * The returned Date is at midnight local time.
 *
 * @param year - BS year (2082–2090)
 * @param month - BS month (1–12)
 * @param day - BS day (1–N, where N is the month length)
 * @returns Corresponding JavaScript Date (midnight local time)
 *
 * @throws {TypeError} For non-number, NaN, or non-integer inputs
 * @throws {RangeError} For out-of-range year, month, or day
 *
 * @example
 * bsToAd(2083, 1, 1) // → Date: April 14, 2026
 */
export declare function bsToAd(year: unknown, month: unknown, day: unknown): Date;
/**
 * Converts an AD Date object to a Bikram Sambat (BS) triple.
 *
 * @param date - A valid JavaScript Date object within the supported BS range
 * @returns Object with { year, month, day } in BS
 *
 * @throws {TypeError} If date is not a Date object
 * @throws {RangeError} If date is invalid (NaN time) or outside supported BS range
 *
 * @example
 * adToBs(new Date(2026, 3, 14)) // → { year: 2083, month: 1, day: 1 }
 */
export declare function adToBs(date: unknown): {
    year: number;
    month: number;
    day: number;
};
/**
 * Returns true if the given BS date is valid and within the supported range.
 * Never throws — returns false for any invalid or out-of-range input.
 *
 * @param year - BS year
 * @param month - BS month
 * @param day - BS day
 *
 * @example
 * isValidBSDate(2083, 1, 31)  // → true
 * isValidBSDate(2083, 9, 31)  // → false (Poush 2083 has 30 days)
 * isValidBSDate(2050, 1, 1)   // → false (out of range)
 */
export declare function isValidBSDate(year: number, month: number, day: number): boolean;
export { getDaysInMonth } from './data-loader';
