import { bsToAd, adToBs, isValidBSDate } from './conversion';
import { getDaysInMonth, getDaysInYear, BS_MIN, BS_MAX } from './data-loader';
import { formatDate, type Locale } from './format';
import { parseDate } from './parse';

// ---------------------------------------------------------------------------
// Validation helpers (class-level, no DOM)
// ---------------------------------------------------------------------------

function assertIntArg(value: unknown, name: string): asserts value is number {
    if (typeof value !== 'number') {
        throw new TypeError(`${name} must be a number, got ${typeof value}`);
    }
    if (Number.isNaN(value)) {
        throw new TypeError(`${name} must be a number, got NaN`);
    }
    if (!Number.isInteger(value)) {
        throw new TypeError(`${name} must be an integer, got ${value}`);
    }
}

// ---------------------------------------------------------------------------
// NepaliDate class
// ---------------------------------------------------------------------------

/**
 * Immutable Bikram Sambat date class.
 * All methods that "mutate" return a new instance; the original is unchanged.
 *
 * @example
 * const d = new NepaliDate(2083, 1, 1);
 * d.format('YYYY-MM-DD'); // '2083-01-01'
 */
export class NepaliDate {
    private readonly _year: number;
    private readonly _month: number;
    private readonly _day: number;

    /**
     * @param year  - BS year (2082–2090)
     * @param month - BS month (1–12)
     * @param day   - BS day (1–N)
     * @throws {TypeError}  For non-integer inputs
     * @throws {RangeError} For out-of-range values
     */
    constructor(year: unknown, month: unknown, day: unknown) {
        if (year === undefined || month === undefined || day === undefined) {
            throw new TypeError('NepaliDate requires year, month, and day arguments');
        }
        assertIntArg(year, 'year');
        assertIntArg(month, 'month');
        assertIntArg(day, 'day');

        if (year < BS_MIN || year > BS_MAX) {
            throw new RangeError(
                `BS year ${year} not in supported range ${BS_MIN}–${BS_MAX}`,
            );
        }
        if (month < 1 || month > 12) {
            throw new RangeError(`BS month must be 1–12, got ${month}`);
        }
        const maxDay = getDaysInMonth(year, month);
        if (day < 1 || day > maxDay) {
            throw new RangeError(
                `BS day must be 1–${maxDay} for ${year}/${month}, got ${day}`,
            );
        }

        this._year = year;
        this._month = month;
        this._day = day;
    }

    // ---------------------------------------------------------------------------
    // Static factories
    // ---------------------------------------------------------------------------

    /**
     * Constructs a NepaliDate from an AD Date object.
     * @throws {TypeError} If date is not a Date
     * @throws {RangeError} If date is outside supported BS range
     */
    static fromAD(date: Date): NepaliDate {
        const { year, month, day } = adToBs(date);
        return new NepaliDate(year, month, day);
    }

    /**
     * Returns today's date in BS (based on the local system clock).
     */
    static today(): NepaliDate {
        return NepaliDate.fromAD(new Date());
    }

    /**
     * Parses a formatted date string into a NepaliDate.
     *
     * @param str    - Formatted date string
     * @param format - Format token (e.g. 'YYYY-MM-DD')
     * @throws {Error}      If the string cannot be parsed
     * @throws {RangeError} If the parsed date is out of range
     *
     * @example
     * NepaliDate.parse('2083-01-15', 'YYYY-MM-DD')
     */
    static parse(str: string, format: string): NepaliDate {
        const { year, month, day } = parseDate(str, format);
        return new NepaliDate(year, month, day);
    }

    // ---------------------------------------------------------------------------
    // Getters
    // ---------------------------------------------------------------------------

    /** BS year */
    getYear(): number { return this._year; }

    /** BS month (1–12) */
    getMonth(): number { return this._month; }

    /** BS day (1–N) */
    getDate(): number { return this._day; }

    /**
     * Day of week (0=Sunday … 6=Saturday), derived from the AD equivalent.
     */
    getDay(): number {
        return bsToAd(this._year, this._month, this._day).getDay();
    }

    /** Returns the corresponding AD Date object (midnight local time). */
    toAD(): Date {
        return bsToAd(this._year, this._month, this._day);
    }

    // ---------------------------------------------------------------------------
    // Arithmetic — all return new NepaliDate instances
    // ---------------------------------------------------------------------------

    /**
     * Adds an amount to the date.
     * @param amount - Integer number of units to add
     * @param unit   - 'day' | 'month' | 'year'
     * @returns New NepaliDate
     * @throws {TypeError}  If amount is not an integer
     * @throws {RangeError} If unit is invalid or result is out of supported range
     */
    add(amount: unknown, unit: unknown): NepaliDate {
        assertIntArg(amount, 'amount');
        if (typeof unit !== 'string' || !['day', 'month', 'year'].includes(unit)) {
            throw new RangeError(
                `Invalid unit '${String(unit)}'. Must be 'day', 'month', or 'year'`,
            );
        }

        if (unit === 'day') {
            return this._addDays(amount);
        } else if (unit === 'month') {
            return this._addMonths(amount);
        } else {
            return this._addYears(amount);
        }
    }

    /**
     * Subtracts an amount from the date.
     * @param amount - Integer number of units to subtract
     * @param unit   - 'day' | 'month' | 'year'
     */
    subtract(amount: unknown, unit: unknown): NepaliDate {
        assertIntArg(amount, 'amount');
        return this.add(-amount, unit);
    }

    /**
     * Returns the difference from this date to another, in the given unit.
     * Positive if other is after this; negative if other is before this.
     *
     * @param other - Another NepaliDate
     * @param unit  - 'day' | 'month' | 'year'
     */
    diff(other: unknown, unit: 'day' | 'month' | 'year'): number {
        if (!(other instanceof NepaliDate)) {
            throw new TypeError('diff() requires a NepaliDate argument');
        }
        if (unit === 'day') {
            const thisAd = this.toAD().getTime();
            const otherAd = other.toAD().getTime();
            return Math.round((otherAd - thisAd) / 86400000);
        } else if (unit === 'month') {
            return (
                (other._year - this._year) * 12 + (other._month - this._month)
            );
        } else {
            return other._year - this._year;
        }
    }

    private _addDays(days: number): NepaliDate {
        let year = this._year;
        let month = this._month;
        let day = this._day + days;

        while (day > getDaysInMonth(year, month)) {
            day -= getDaysInMonth(year, month);
            month++;
            if (month > 12) { month = 1; year++; }
            if (year > BS_MAX) {
                throw new RangeError(`Result year ${year} exceeds maximum supported year ${BS_MAX}`);
            }
        }
        while (day < 1) {
            month--;
            if (month < 1) { month = 12; year--; }
            if (year < BS_MIN) {
                throw new RangeError(`Result year ${year} is below minimum supported year ${BS_MIN}`);
            }
            day += getDaysInMonth(year, month);
        }
        return new NepaliDate(year, month, day);
    }

    private _addMonths(months: number): NepaliDate {
        let year = this._year;
        let month = this._month + months;

        while (month > 12) { month -= 12; year++; }
        while (month < 1) { month += 12; year--; }

        if (year > BS_MAX || year < BS_MIN) {
            throw new RangeError(`Result year ${year} is outside supported range ${BS_MIN}–${BS_MAX}`);
        }

        // Clamp day to the number of days in the resulting month
        const maxDay = getDaysInMonth(year, month);
        const day = Math.min(this._day, maxDay);
        return new NepaliDate(year, month, day);
    }

    private _addYears(years: number): NepaliDate {
        const year = this._year + years;
        if (year > BS_MAX || year < BS_MIN) {
            throw new RangeError(`Result year ${year} is outside supported range ${BS_MIN}–${BS_MAX}`);
        }
        const maxDay = getDaysInMonth(year, this._month);
        const day = Math.min(this._day, maxDay);
        return new NepaliDate(year, this._month, day);
    }

    // ---------------------------------------------------------------------------
    // Comparisons
    // ---------------------------------------------------------------------------

    /** Returns true if this date comes before other. */
    isBefore(other: NepaliDate): boolean {
        return this._toOrdinal() < other._toOrdinal();
    }

    /** Returns true if this date comes after other. */
    isAfter(other: NepaliDate): boolean {
        return this._toOrdinal() > other._toOrdinal();
    }

    /** Returns true if this date is the same day as other. */
    isSame(other: NepaliDate): boolean {
        return this._toOrdinal() === other._toOrdinal();
    }

    private _toOrdinal(): number {
        return this._year * 10000 + this._month * 100 + this._day;
    }

    // ---------------------------------------------------------------------------
    // Boundary helpers
    // ---------------------------------------------------------------------------

    /** Returns a new NepaliDate at the first day of this month. */
    startOfMonth(): NepaliDate {
        return new NepaliDate(this._year, this._month, 1);
    }

    /** Returns a new NepaliDate at the last day of this month. */
    endOfMonth(): NepaliDate {
        return new NepaliDate(
            this._year,
            this._month,
            getDaysInMonth(this._year, this._month),
        );
    }

    /** Returns a new NepaliDate at Baishakh 1 of this year. */
    startOfYear(): NepaliDate {
        return new NepaliDate(this._year, 1, 1);
    }

    /** Returns a new NepaliDate at Chaitra (last day) of this year. */
    endOfYear(): NepaliDate {
        return new NepaliDate(this._year, 12, getDaysInMonth(this._year, 12));
    }

    // ---------------------------------------------------------------------------
    // Formatting
    // ---------------------------------------------------------------------------

    /**
     * Formats the date using a token string.
     * Tokens: YYYY YY MM M DD D MMMM MMM dddd ddd
     *
     * @param token  - Format string (e.g. 'YYYY-MM-DD')
     * @param locale - 'en' (default) or 'np' for Nepali/Devanagari
     * @throws {Error} For unknown format tokens
     *
     * @example
     * d.format('MMMM DD, YYYY', 'np') // 'बैशाख ०१, २०८३'
     */
    format(token: string, locale: Locale = 'en'): string {
        return formatDate(token, {
            year: this._year,
            month: this._month,
            day: this._day,
            dayOfWeek: this.getDay(),
            locale,
        });
    }

    toString(): string {
        return this.format('YYYY-MM-DD');
    }

    toJSON(): string {
        return this.toString();
    }

    // ---------------------------------------------------------------------------
    // Internal helpers used by picker layer
    // ---------------------------------------------------------------------------

    /** @internal */
    _getDaysInYear(): number {
        return getDaysInYear(this._year);
    }
}
