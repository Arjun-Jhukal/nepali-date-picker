import {
    BS_MIN,
    BS_MAX,
    BS_AD_ANCHOR,
    getDaysInMonth,
    getDaysInYear,
} from './data-loader';

/** Midnight UTC representation of the AD anchor date */
const AD_ANCHOR_TIME = (() => {
    const d = new Date(BS_AD_ANCHOR.ad);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
})();

// ---------------------------------------------------------------------------
// Input validation helpers
// ---------------------------------------------------------------------------

function assertInt(value: unknown, name: string): asserts value is number {
    if (typeof value !== 'number') {
        throw new TypeError(`BS ${name} must be a number, got ${typeof value}`);
    }
    if (Number.isNaN(value)) {
        throw new TypeError(`BS ${name} must be a number, got NaN`);
    }
    if (!Number.isInteger(value)) {
        throw new TypeError(`BS ${name} must be an integer, got ${value}`);
    }
}

function assertYearInRange(year: number): void {
    if (year < BS_MIN || year > BS_MAX) {
        throw new RangeError(
            `BS year ${year} not in supported range ${BS_MIN}–${BS_MAX}`,
        );
    }
}

function assertMonthInRange(month: number): void {
    if (month < 1 || month > 12) {
        throw new RangeError(`BS month must be 1–12, got ${month}`);
    }
}

function assertDayInRange(year: number, month: number, day: number): void {
    const maxDay = getDaysInMonth(year, month);
    if (day < 1 || day > maxDay) {
        throw new RangeError(
            `BS day must be 1–${maxDay} for ${year}/${month}, got ${day}`,
        );
    }
}

// ---------------------------------------------------------------------------
// Internal offset calculation
// ---------------------------------------------------------------------------

/**
 * Returns the number of days from the start of BS_MIN to the given BS date.
 * Day 0 = the first day of BS_MIN (Baishakh 1, 2082).
 */
function daysFromEra(year: number, month: number, day: number): number {
    let days = 0;
    for (let y = BS_MIN; y < year; y++) {
        days += getDaysInYear(y);
    }
    for (let m = 1; m < month; m++) {
        days += getDaysInMonth(year, m);
    }
    days += day - 1;
    return days;
}

/** Days from BS era start to the anchor BS date (constant) */
const ANCHOR_OFFSET = daysFromEra(
    BS_AD_ANCHOR.bs.year,
    BS_AD_ANCHOR.bs.month,
    BS_AD_ANCHOR.bs.day,
);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

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
export function bsToAd(year: unknown, month: unknown, day: unknown): Date {
    assertInt(year, 'year');
    assertInt(month, 'month');
    assertInt(day, 'day');
    assertYearInRange(year);
    assertMonthInRange(month);
    assertDayInRange(year, month, day);

    const offset = daysFromEra(year, month, day) - ANCHOR_OFFSET;
    const adTime = AD_ANCHOR_TIME + offset * 86400000;
    return new Date(adTime);
}

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
export function adToBs(date: unknown): { year: number; month: number; day: number } {
    if (!(date instanceof Date)) {
        throw new TypeError(
            `Expected Date object, got ${date === null ? 'null' : typeof date}`,
        );
    }
    if (isNaN(date.getTime())) {
        throw new RangeError('Invalid Date');
    }

    // Strip time component — work with date-only
    const midnight = new Date(date);
    midnight.setHours(0, 0, 0, 0);
    const offset = Math.round((midnight.getTime() - AD_ANCHOR_TIME) / 86400000);

    // Start from anchor and walk forward/backward
    let year = BS_AD_ANCHOR.bs.year;
    let month = BS_AD_ANCHOR.bs.month;
    let day = BS_AD_ANCHOR.bs.day;

    let remaining = offset;

    if (remaining > 0) {
        while (remaining > 0) {
            const daysLeft = getDaysInMonth(year, month) - day;
            if (remaining <= daysLeft) {
                day += remaining;
                remaining = 0;
            } else {
                remaining -= daysLeft + 1;
                day = 1;
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                }
                if (year > BS_MAX) {
                    throw new RangeError(
                        `AD date ${date.toDateString()} exceeds supported BS range (max ${BS_MAX})`,
                    );
                }
            }
        }
    } else if (remaining < 0) {
        while (remaining < 0) {
            if (day + remaining >= 1) {
                day += remaining;
                remaining = 0;
            } else {
                remaining += day;
                month--;
                if (month < 1) {
                    month = 12;
                    year--;
                }
                if (year < BS_MIN) {
                    throw new RangeError(
                        `AD date ${date.toDateString()} predates supported BS range (min ${BS_MIN})`,
                    );
                }
                day = getDaysInMonth(year, month);
            }
        }
    }

    return { year, month, day };
}

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
export function isValidBSDate(year: number, month: number, day: number): boolean {
    if (
        typeof year !== 'number' ||
        typeof month !== 'number' ||
        typeof day !== 'number'
    ) {
        return false;
    }
    if (year < BS_MIN || year > BS_MAX) return false;
    if (month < 1 || month > 12) return false;
    const maxDay = getDaysInMonth(year, month);
    return day >= 1 && day <= maxDay;
}

// Re-export getDaysInMonth as part of public API
export { getDaysInMonth } from './data-loader';
