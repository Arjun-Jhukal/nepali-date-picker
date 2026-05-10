import { type Locale } from './format';
/**
 * Immutable Bikram Sambat date class.
 * All methods that "mutate" return a new instance; the original is unchanged.
 *
 * @example
 * const d = new NepaliDate(2083, 1, 1);
 * d.format('YYYY-MM-DD'); // '2083-01-01'
 */
export declare class NepaliDate {
    private readonly _year;
    private readonly _month;
    private readonly _day;
    /**
     * @param year  - BS year (2082–2090)
     * @param month - BS month (1–12)
     * @param day   - BS day (1–N)
     * @throws {TypeError}  For non-integer inputs
     * @throws {RangeError} For out-of-range values
     */
    constructor(year: unknown, month: unknown, day: unknown);
    /**
     * Constructs a NepaliDate from an AD Date object.
     * @throws {TypeError} If date is not a Date
     * @throws {RangeError} If date is outside supported BS range
     */
    static fromAD(date: Date): NepaliDate;
    /**
     * Returns today's date in BS (based on the local system clock).
     */
    static today(): NepaliDate;
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
    static parse(str: string, format: string): NepaliDate;
    /** BS year */
    getYear(): number;
    /** BS month (1–12) */
    getMonth(): number;
    /** BS day (1–N) */
    getDate(): number;
    /**
     * Day of week (0=Sunday … 6=Saturday), derived from the AD equivalent.
     */
    getDay(): number;
    /** Returns the corresponding AD Date object (midnight local time). */
    toAD(): Date;
    /**
     * Adds an amount to the date.
     * @param amount - Integer number of units to add
     * @param unit   - 'day' | 'month' | 'year'
     * @returns New NepaliDate
     * @throws {TypeError}  If amount is not an integer
     * @throws {RangeError} If unit is invalid or result is out of supported range
     */
    add(amount: unknown, unit: unknown): NepaliDate;
    /**
     * Subtracts an amount from the date.
     * @param amount - Integer number of units to subtract
     * @param unit   - 'day' | 'month' | 'year'
     */
    subtract(amount: unknown, unit: unknown): NepaliDate;
    /**
     * Returns the difference from this date to another, in the given unit.
     * Positive if other is after this; negative if other is before this.
     *
     * @param other - Another NepaliDate
     * @param unit  - 'day' | 'month' | 'year'
     */
    diff(other: unknown, unit: 'day' | 'month' | 'year'): number;
    private _addDays;
    private _addMonths;
    private _addYears;
    /** Returns true if this date comes before other. */
    isBefore(other: NepaliDate): boolean;
    /** Returns true if this date comes after other. */
    isAfter(other: NepaliDate): boolean;
    /** Returns true if this date is the same day as other. */
    isSame(other: NepaliDate): boolean;
    private _toOrdinal;
    /** Returns a new NepaliDate at the first day of this month. */
    startOfMonth(): NepaliDate;
    /** Returns a new NepaliDate at the last day of this month. */
    endOfMonth(): NepaliDate;
    /** Returns a new NepaliDate at Baishakh 1 of this year. */
    startOfYear(): NepaliDate;
    /** Returns a new NepaliDate at Chaitra (last day) of this year. */
    endOfYear(): NepaliDate;
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
    format(token: string, locale?: Locale): string;
    toString(): string;
    toJSON(): string;
    /** @internal */
    _getDaysInYear(): number;
}
