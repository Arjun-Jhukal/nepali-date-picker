import { bsToAd, adToBs } from './conversion';
import { getDaysInMonth, getDaysInYear, BS_MIN, BS_MAX } from './data-loader';
import { formatDate } from './format';
import { parseDate } from './parse';
// ---------------------------------------------------------------------------
// Validation helpers (class-level, no DOM)
// ---------------------------------------------------------------------------
function assertIntArg(value, name) {
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
    /**
     * @param year  - BS year (2082–2090)
     * @param month - BS month (1–12)
     * @param day   - BS day (1–N)
     * @throws {TypeError}  For non-integer inputs
     * @throws {RangeError} For out-of-range values
     */
    constructor(year, month, day) {
        if (year === undefined || month === undefined || day === undefined) {
            throw new TypeError('NepaliDate requires year, month, and day arguments');
        }
        assertIntArg(year, 'year');
        assertIntArg(month, 'month');
        assertIntArg(day, 'day');
        if (year < BS_MIN || year > BS_MAX) {
            throw new RangeError(`BS year ${year} not in supported range ${BS_MIN}–${BS_MAX}`);
        }
        if (month < 1 || month > 12) {
            throw new RangeError(`BS month must be 1–12, got ${month}`);
        }
        const maxDay = getDaysInMonth(year, month);
        if (day < 1 || day > maxDay) {
            throw new RangeError(`BS day must be 1–${maxDay} for ${year}/${month}, got ${day}`);
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
    static fromAD(date) {
        const { year, month, day } = adToBs(date);
        return new NepaliDate(year, month, day);
    }
    /**
     * Returns today's date in BS (based on the local system clock).
     */
    static today() {
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
    static parse(str, format) {
        const { year, month, day } = parseDate(str, format);
        return new NepaliDate(year, month, day);
    }
    // ---------------------------------------------------------------------------
    // Getters
    // ---------------------------------------------------------------------------
    /** BS year */
    getYear() { return this._year; }
    /** BS month (1–12) */
    getMonth() { return this._month; }
    /** BS day (1–N) */
    getDate() { return this._day; }
    /**
     * Day of week (0=Sunday … 6=Saturday), derived from the AD equivalent.
     */
    getDay() {
        return bsToAd(this._year, this._month, this._day).getDay();
    }
    /** Returns the corresponding AD Date object (midnight local time). */
    toAD() {
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
    add(amount, unit) {
        assertIntArg(amount, 'amount');
        if (typeof unit !== 'string' || !['day', 'month', 'year'].includes(unit)) {
            throw new RangeError(`Invalid unit '${String(unit)}'. Must be 'day', 'month', or 'year'`);
        }
        if (unit === 'day') {
            return this._addDays(amount);
        }
        else if (unit === 'month') {
            return this._addMonths(amount);
        }
        else {
            return this._addYears(amount);
        }
    }
    /**
     * Subtracts an amount from the date.
     * @param amount - Integer number of units to subtract
     * @param unit   - 'day' | 'month' | 'year'
     */
    subtract(amount, unit) {
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
    diff(other, unit) {
        if (!(other instanceof NepaliDate)) {
            throw new TypeError('diff() requires a NepaliDate argument');
        }
        if (unit === 'day') {
            const thisAd = this.toAD().getTime();
            const otherAd = other.toAD().getTime();
            return Math.round((otherAd - thisAd) / 86400000);
        }
        else if (unit === 'month') {
            return ((other._year - this._year) * 12 + (other._month - this._month));
        }
        else {
            return other._year - this._year;
        }
    }
    _addDays(days) {
        let year = this._year;
        let month = this._month;
        let day = this._day + days;
        while (day > getDaysInMonth(year, month)) {
            day -= getDaysInMonth(year, month);
            month++;
            if (month > 12) {
                month = 1;
                year++;
            }
            if (year > BS_MAX) {
                throw new RangeError(`Result year ${year} exceeds maximum supported year ${BS_MAX}`);
            }
        }
        while (day < 1) {
            month--;
            if (month < 1) {
                month = 12;
                year--;
            }
            if (year < BS_MIN) {
                throw new RangeError(`Result year ${year} is below minimum supported year ${BS_MIN}`);
            }
            day += getDaysInMonth(year, month);
        }
        return new NepaliDate(year, month, day);
    }
    _addMonths(months) {
        let year = this._year;
        let month = this._month + months;
        while (month > 12) {
            month -= 12;
            year++;
        }
        while (month < 1) {
            month += 12;
            year--;
        }
        if (year > BS_MAX || year < BS_MIN) {
            throw new RangeError(`Result year ${year} is outside supported range ${BS_MIN}–${BS_MAX}`);
        }
        // Clamp day to the number of days in the resulting month
        const maxDay = getDaysInMonth(year, month);
        const day = Math.min(this._day, maxDay);
        return new NepaliDate(year, month, day);
    }
    _addYears(years) {
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
    isBefore(other) {
        return this._toOrdinal() < other._toOrdinal();
    }
    /** Returns true if this date comes after other. */
    isAfter(other) {
        return this._toOrdinal() > other._toOrdinal();
    }
    /** Returns true if this date is the same day as other. */
    isSame(other) {
        return this._toOrdinal() === other._toOrdinal();
    }
    _toOrdinal() {
        return this._year * 10000 + this._month * 100 + this._day;
    }
    // ---------------------------------------------------------------------------
    // Boundary helpers
    // ---------------------------------------------------------------------------
    /** Returns a new NepaliDate at the first day of this month. */
    startOfMonth() {
        return new NepaliDate(this._year, this._month, 1);
    }
    /** Returns a new NepaliDate at the last day of this month. */
    endOfMonth() {
        return new NepaliDate(this._year, this._month, getDaysInMonth(this._year, this._month));
    }
    /** Returns a new NepaliDate at Baishakh 1 of this year. */
    startOfYear() {
        return new NepaliDate(this._year, 1, 1);
    }
    /** Returns a new NepaliDate at Chaitra (last day) of this year. */
    endOfYear() {
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
    format(token, locale = 'en') {
        return formatDate(token, {
            year: this._year,
            month: this._month,
            day: this._day,
            dayOfWeek: this.getDay(),
            locale,
        });
    }
    toString() {
        return this.format('YYYY-MM-DD');
    }
    toJSON() {
        return this.toString();
    }
    // ---------------------------------------------------------------------------
    // Internal helpers used by picker layer
    // ---------------------------------------------------------------------------
    /** @internal */
    _getDaysInYear() {
        return getDaysInYear(this._year);
    }
}
