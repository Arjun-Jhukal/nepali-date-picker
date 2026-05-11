import { NepaliDate } from '../core/nepali-date';
import type { PickerTheme } from './options';
export type InlineSelectionMode = 'single' | 'range';
export interface InlineCalendarOptions {
    /** Number of months to display side by side (mobile always shows 1) */
    months: 1 | 2;
    language: 'en' | 'np';
    useNepaliNumerals: boolean;
    /** Day indices (0=Sun…6=Sat) that are highlighted as weekends */
    weekendDays: number[];
    /** Day index to start the week on (0=Sun…6=Sat) */
    firstDayOfWeek: number;
    minDate: NepaliDate | null;
    maxDate: NepaliDate | null;
    disabledDates: NepaliDate[];
    disabledDaysOfWeek: number[];
    /** Show the corresponding AD date below the BS day number */
    showAdDate: boolean;
    theme: PickerTheme;
    /**
     * 'single' — one date selected at a time (default).
     * 'range'  — a start+end date range.
     */
    selectionMode: InlineSelectionMode;
    /**
     * Fixed range length in days. Only used when selectionMode is 'range'.
     * When set, clicking a start date automatically selects rangeLength
     * consecutive days (e.g. 7 for a 7-day trek itinerary).
     * When null, the user clicks once for the start and again for the end.
     */
    rangeLength: number | null;
    onChange: ((date: NepaliDate | null) => void) | null;
    onRangeChange: ((start: NepaliDate | null, end: NepaliDate | null) => void) | null;
    onMonthChange: ((year: number, month: number) => void) | null;
}
/**
 * Renders an inline (embedded) Bikram Sambat calendar directly into a
 * container element — no popover, no input required.
 *
 * Supports single date or date-range selection. When selectionMode is 'range'
 * and rangeLength is set, clicking a day auto-selects that many consecutive
 * days (useful for availability / trek booking calendars).
 * Supports 1 or 2 side-by-side months. On mobile (≤600 px) the calendar
 * always collapses to a single month regardless of the `months` option.
 *
 * @example
 * // 7-day availability calendar
 * const cal = new InlineCalendar(document.getElementById('cal'), {
 *     months: 2,
 *     selectionMode: 'range',
 *     rangeLength: 7,
 *     onRangeChange: (start, end) => console.log(start?.format('YYYY-MM-DD'), end?.format('YYYY-MM-DD')),
 * });
 */
export declare class InlineCalendar {
    private _container;
    private _opts;
    private _value;
    private _rangeStart;
    private _rangeEnd;
    private _hoverDate;
    private _viewYear;
    private _viewMonth;
    private _viewMode;
    private _yearGridStart;
    private _today;
    private _inner;
    constructor(container: HTMLElement, opts?: Partial<InlineCalendarOptions>);
    /** Returns the currently selected date (single mode), or the range start (range mode). */
    getValue(): NepaliDate | null;
    /**
     * Returns the current range selection {start, end}.
     * Both are null when nothing is selected.
     */
    getRange(): {
        start: NepaliDate | null;
        end: NepaliDate | null;
    };
    /**
     * Sets the selected date (single mode) and re-renders. Pass null to clear.
     * @throws {TypeError} if the value is not a NepaliDate or null.
     */
    setValue(date: NepaliDate | null): void;
    /**
     * Sets the range selection programmatically and re-renders.
     * @throws {TypeError} if arguments are not NepaliDate or null.
     */
    setRange(start: NepaliDate | null, end: NepaliDate | null): void;
    /** Merges partial options and re-renders. */
    setOptions(partial: Partial<InlineCalendarOptions>): void;
    /** Removes the calendar from the DOM. */
    destroy(): void;
    private _render;
    private _buildCalendar;
    private _buildNav;
    /** Renders the 12-month grid overlay (replaces the calendar body). */
    private _buildMonthPicker;
    /** Renders the year-grid overlay (replaces the calendar body). */
    private _buildYearPicker;
    private _buildMonth;
    private _wireEvents;
    private _handleCellClick;
    /**
     * Updates only the range-related CSS classes on existing cells, without
     * a full re-render. Used for efficient hover preview updates.
     */
    private _updateRangeHighlight;
    /**
     * Returns the effective {displayStart, displayEnd} for rendering range highlights,
     * taking into account hover preview when the end hasn't been confirmed yet.
     */
    private _getDisplayRange;
    private _navigate;
    private _nextMonth;
    /** Returns the start of the 9-year grid window that contains the given year. */
    private _snapYearGrid;
    private _makeRow;
    private _makeEmptyCell;
}
