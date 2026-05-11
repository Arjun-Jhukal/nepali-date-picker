import { NepaliDate } from '../core/nepali-date';
import { getDaysInMonth, BS_MIN, BS_MAX } from '../core/data-loader';
import {
    MONTH_NAMES_EN, MONTH_NAMES_NP,
    DAY_NAMES_SHORT_EN, DAY_NAMES_SHORT_NP,
    toNepaliNumeral,
} from '../core/format';
import { applyTheme } from './theme';
import type { PickerTheme } from './options';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

const INLINE_DEFAULTS: InlineCalendarOptions = {
    months: 1,
    language: 'en',
    useNepaliNumerals: false,
    weekendDays: [0, 6],
    firstDayOfWeek: 0,
    minDate: null,
    maxDate: null,
    disabledDates: [],
    disabledDaysOfWeek: [],
    showAdDate: true,
    theme: 'light',
    selectionMode: 'single',
    rangeLength: null,
    onChange: null,
    onRangeChange: null,
    onMonthChange: null,
};

/** Abbreviated AD month names used for the sub-label in each cell */
const AD_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type ViewMode = 'days' | 'months' | 'years';

// ---------------------------------------------------------------------------
// InlineCalendar class
// ---------------------------------------------------------------------------

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
export class InlineCalendar {
    private _container: HTMLElement;
    private _opts: InlineCalendarOptions;
    private _value: NepaliDate | null = null;
    private _rangeStart: NepaliDate | null = null;
    private _rangeEnd: NepaliDate | null = null;
    private _hoverDate: NepaliDate | null = null;
    private _viewYear: number;
    private _viewMonth: number;
    private _viewMode: ViewMode = 'days';
    private _yearGridStart: number;
    private _today: NepaliDate;
    private _inner: HTMLElement | null = null;

    constructor(container: HTMLElement, opts: Partial<InlineCalendarOptions> = {}) {
        if (!(container instanceof HTMLElement)) {
            throw new TypeError('InlineCalendar: container must be an HTMLElement');
        }
        this._container = container;
        this._opts = { ...INLINE_DEFAULTS, ...opts };
        this._today = NepaliDate.today();
        this._viewYear = this._today.getYear();
        this._viewMonth = this._today.getMonth();
        this._yearGridStart = this._snapYearGrid(this._viewYear);
        this._render();
    }

    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------

    /** Returns the currently selected date (single mode), or the range start (range mode). */
    getValue(): NepaliDate | null {
        return this._value;
    }

    /**
     * Returns the current range selection {start, end}.
     * Both are null when nothing is selected.
     */
    getRange(): { start: NepaliDate | null; end: NepaliDate | null } {
        return { start: this._rangeStart, end: this._rangeEnd };
    }

    /**
     * Sets the selected date (single mode) and re-renders. Pass null to clear.
     * @throws {TypeError} if the value is not a NepaliDate or null.
     */
    setValue(date: NepaliDate | null): void {
        if (date !== null && !(date instanceof NepaliDate)) {
            throw new TypeError('setValue requires a NepaliDate or null');
        }
        this._value = date;
        this._rangeStart = null;
        this._rangeEnd = null;
        if (date) {
            this._viewYear = date.getYear();
            this._viewMonth = date.getMonth();
        }
        this._render();
    }

    /**
     * Sets the range selection programmatically and re-renders.
     * @throws {TypeError} if arguments are not NepaliDate or null.
     */
    setRange(start: NepaliDate | null, end: NepaliDate | null): void {
        if (start !== null && !(start instanceof NepaliDate)) {
            throw new TypeError('setRange: start must be a NepaliDate or null');
        }
        if (end !== null && !(end instanceof NepaliDate)) {
            throw new TypeError('setRange: end must be a NepaliDate or null');
        }
        this._rangeStart = start;
        this._rangeEnd = end;
        this._value = start;
        if (start) {
            this._viewYear = start.getYear();
            this._viewMonth = start.getMonth();
        }
        this._render();
    }

    /** Merges partial options and re-renders. */
    setOptions(partial: Partial<InlineCalendarOptions>): void {
        this._opts = { ...this._opts, ...partial };
        this._render();
    }

    /** Removes the calendar from the DOM. */
    destroy(): void {
        if (this._inner) {
            this._inner.remove();
            this._inner = null;
        }
    }

    // ---------------------------------------------------------------------------
    // Rendering
    // ---------------------------------------------------------------------------

    private _render(): void {
        this._today = NepaliDate.today();
        const el = this._buildCalendar();
        if (this._inner) {
            this._inner.replaceWith(el);
        } else {
            this._container.appendChild(el);
        }
        this._inner = el;
        this._wireEvents(el);
    }

    private _buildCalendar(): HTMLElement {
        const isDual = this._opts.months === 2;

        const root = document.createElement('div');
        root.className = 'ndp-inline' + (isDual ? ' ndp-inline--dual' : '');
        root.setAttribute('role', 'application');
        root.setAttribute('aria-label', 'Nepali date picker');

        applyTheme(root, this._opts.theme);

        root.appendChild(this._buildNav());

        if (this._viewMode === 'months') {
            root.appendChild(this._buildMonthPicker());
        } else if (this._viewMode === 'years') {
            root.appendChild(this._buildYearPicker());
        } else {
            const body = document.createElement('div');
            body.className = 'ndp-inline-body';

            body.appendChild(this._buildMonth(this._viewYear, this._viewMonth));

            if (isDual) {
                const [ny, nm] = this._nextMonth(this._viewYear, this._viewMonth);
                body.appendChild(this._buildMonth(ny, nm));
            }

            root.appendChild(body);
        }

        return root;
    }

    private _buildNav(): HTMLElement {
        const { language, useNepaliNumerals, months } = this._opts;
        const np = language === 'np';
        const monthNames = np ? MONTH_NAMES_NP : MONTH_NAMES_EN;

        const nav = document.createElement('div');
        nav.className = 'ndp-inline-nav';

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'ndp-inline-nav-btn';
        prevBtn.setAttribute('data-action', 'prev');
        prevBtn.setAttribute('aria-label', np ? 'अघिल्लो' : 'Previous');
        prevBtn.innerHTML = '&#8249;';

        const titles = document.createElement('div');
        titles.className = 'ndp-inline-nav-titles';

        if (this._viewMode === 'months') {
            // In month-picker mode: show the year, clicking navigates to year-picker
            const yearSpan = document.createElement('span');
            yearSpan.className = 'ndp-inline-nav-title ndp-inline-nav-title--clickable';
            yearSpan.setAttribute('data-action', 'view-years');
            yearSpan.setAttribute('aria-label', np ? 'वर्ष छान्नुहोस्' : 'Select year');
            const yr = useNepaliNumerals ? toNepaliNumeral(this._viewYear) : String(this._viewYear);
            yearSpan.textContent = yr;
            titles.appendChild(yearSpan);
        } else if (this._viewMode === 'years') {
            // In year-picker mode: show the year range (non-clickable)
            const rangeSpan = document.createElement('span');
            rangeSpan.className = 'ndp-inline-nav-title';
            const endY = Math.min(this._yearGridStart + 8, BS_MAX);
            const s = useNepaliNumerals ? toNepaliNumeral(this._yearGridStart) : String(this._yearGridStart);
            const e = useNepaliNumerals ? toNepaliNumeral(endY) : String(endY);
            rangeSpan.textContent = `${s} – ${e}`;
            titles.appendChild(rangeSpan);
        } else {
            // Day view: show "Month Year" title(s) — clicking opens month-picker
            const makeTitle = (year: number, month: number): HTMLElement => {
                const span = document.createElement('span');
                span.className = 'ndp-inline-nav-title ndp-inline-nav-title--clickable';
                span.setAttribute('data-action', 'view-months');
                span.setAttribute('aria-label', np ? 'महिना र वर्ष छान्नुहोस्' : 'Select month and year');
                const yr = useNepaliNumerals ? toNepaliNumeral(year) : String(year);
                span.textContent = `${monthNames[month - 1]} ${yr}`;
                return span;
            };

            titles.appendChild(makeTitle(this._viewYear, this._viewMonth));
            if (months === 2) {
                const [ny, nm] = this._nextMonth(this._viewYear, this._viewMonth);
                titles.appendChild(makeTitle(ny, nm));
            }
        }

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'ndp-inline-nav-btn';
        nextBtn.setAttribute('data-action', 'next');
        nextBtn.setAttribute('aria-label', np ? 'अर्को' : 'Next');
        nextBtn.innerHTML = '&#8250;';

        nav.appendChild(prevBtn);
        nav.appendChild(titles);
        nav.appendChild(nextBtn);
        return nav;
    }

    /** Renders the 12-month grid overlay (replaces the calendar body). */
    private _buildMonthPicker(): HTMLElement {
        const { language } = this._opts;
        const np = language === 'np';
        const monthNames = np ? MONTH_NAMES_NP : MONTH_NAMES_EN;

        const wrap = document.createElement('div');
        wrap.className = 'ndp-inline-picker-overlay';

        const grid = document.createElement('div');
        grid.className = 'ndp-month-grid';

        for (let m = 1; m <= 12; m++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ndp-month-cell';
            if (m === this._viewMonth) btn.classList.add('ndp-month-cell--selected');
            btn.setAttribute('data-action', 'select-month');
            btn.setAttribute('data-month', String(m));
            btn.textContent = monthNames[m - 1];
            grid.appendChild(btn);
        }

        wrap.appendChild(grid);
        return wrap;
    }

    /** Renders the year-grid overlay (replaces the calendar body). */
    private _buildYearPicker(): HTMLElement {
        const wrap = document.createElement('div');
        wrap.className = 'ndp-inline-picker-overlay';

        const grid = document.createElement('div');
        grid.className = 'ndp-year-grid';

        const endYear = Math.min(this._yearGridStart + 8, BS_MAX);
        for (let y = this._yearGridStart; y <= endYear; y++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ndp-year-cell';
            if (y === this._viewYear) btn.classList.add('ndp-year-cell--selected');
            btn.setAttribute('data-action', 'select-year');
            btn.setAttribute('data-year', String(y));
            btn.textContent = String(y);
            grid.appendChild(btn);
        }

        wrap.appendChild(grid);
        return wrap;
    }

    private _buildMonth(year: number, month: number): HTMLElement {
        const {
            language, useNepaliNumerals, weekendDays, firstDayOfWeek,
            disabledDaysOfWeek, disabledDates, minDate, maxDate, showAdDate,
        } = this._opts;
        const np = language === 'np';
        const dayNamesShort = np ? DAY_NAMES_SHORT_NP : DAY_NAMES_SHORT_EN;

        // Compute effective display range (incl. hover preview for free-range)
        const { displayStart, displayEnd } = this._getDisplayRange();

        const panel = document.createElement('div');
        panel.className = 'ndp-inline-month';

        // --- Weekday header row ---
        const weekdaysRow = document.createElement('div');
        weekdaysRow.className = 'ndp-inline-weekdays';
        weekdaysRow.setAttribute('role', 'row');

        const orderedDays: number[] = [];
        for (let i = 0; i < 7; i++) {
            orderedDays.push((firstDayOfWeek + i) % 7);
        }
        for (const idx of orderedDays) {
            const th = document.createElement('div');
            th.className = 'ndp-inline-weekday';
            th.setAttribute('role', 'columnheader');
            th.setAttribute('aria-label', DAY_NAMES_SHORT_EN[idx]);
            th.textContent = dayNamesShort[idx];
            weekdaysRow.appendChild(th);
        }
        panel.appendChild(weekdaysRow);

        // --- Day cells ---
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = new NepaliDate(year, month, 1).getDay();
        const startOffset = (firstDay - firstDayOfWeek + 7) % 7;

        let dayNum = 1;
        let cellRow = this._makeRow();
        let cellCount = 0;

        // Leading empty cells
        for (let i = 0; i < startOffset; i++) {
            cellRow.appendChild(this._makeEmptyCell());
            cellCount++;
        }

        while (dayNum <= daysInMonth) {
            const cellDate = new NepaliDate(year, month, dayNum);
            const adDate = cellDate.toAD();

            const dayOfWeek = cellDate.getDay();
            const isToday = cellDate.isSame(this._today);
            const isWeekend = weekendDays.includes(dayOfWeek);
            const isDisabledDow = disabledDaysOfWeek.includes(dayOfWeek);
            const isBeforeMin = minDate ? cellDate.isBefore(minDate) : false;
            const isAfterMax = maxDate ? cellDate.isAfter(maxDate) : false;
            const isDisabledDate = disabledDates.some((d) => d.isSame(cellDate));
            const isDisabled = isDisabledDow || isBeforeMin || isAfterMax || isDisabledDate;

            // Single-mode selection state
            const isSelected =
                this._opts.selectionMode === 'single' && this._value
                    ? cellDate.isSame(this._value)
                    : false;

            // Range states
            const isRangeStart = displayStart ? cellDate.isSame(displayStart) : false;
            const isRangeEnd = displayEnd ? cellDate.isSame(displayEnd) : false;
            const isInRange =
                displayStart && displayEnd
                    ? !cellDate.isBefore(displayStart) && !cellDate.isAfter(displayEnd)
                    : false;
            // Single-day range: both start & end on same cell
            const isSingleDayRange = isRangeStart && isRangeEnd;

            const cell = document.createElement('div');
            cell.className = 'ndp-inline-cell';
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('data-bs-year', String(year));
            cell.setAttribute('data-bs-month', String(month));
            cell.setAttribute('data-bs-day', String(dayNum));

            if (isToday) cell.classList.add('ndp-inline-cell--today');
            if (isSelected) cell.classList.add('ndp-inline-cell--selected');
            if (isWeekend) cell.classList.add('ndp-inline-cell--weekend');
            if (isSingleDayRange) {
                cell.classList.add('ndp-inline-cell--range-start');
                cell.classList.add('ndp-inline-cell--range-end');
            } else {
                if (isRangeStart) cell.classList.add('ndp-inline-cell--range-start');
                if (isRangeEnd) cell.classList.add('ndp-inline-cell--range-end');
            }
            if (isInRange && !isRangeStart && !isRangeEnd) {
                cell.classList.add('ndp-inline-cell--in-range');
            }

            if (isDisabled) {
                cell.classList.add('ndp-inline-cell--disabled');
                cell.setAttribute('aria-disabled', 'true');
            } else {
                cell.setAttribute('tabindex', '-1');
            }
            if (isSelected || isRangeStart) cell.setAttribute('aria-selected', 'true');
            if (isToday) cell.setAttribute('aria-current', 'date');

            const bsSpan = document.createElement('span');
            bsSpan.className = 'ndp-inline-bs';
            bsSpan.textContent = useNepaliNumerals ? toNepaliNumeral(dayNum) : String(dayNum);
            cell.appendChild(bsSpan);

            if (showAdDate) {
                const adSpan = document.createElement('span');
                adSpan.className = 'ndp-inline-ad';
                adSpan.textContent = `${AD_MONTHS_SHORT[adDate.getMonth()]} ${adDate.getDate()}`;
                cell.appendChild(adSpan);
            }

            cellRow.appendChild(cell);
            cellCount++;

            if (cellCount % 7 === 0) {
                panel.appendChild(cellRow);
                cellRow = this._makeRow();
            }
            dayNum++;
        }

        // Trailing empty cells to complete last row
        if (cellCount % 7 !== 0) {
            const remaining = 7 - (cellCount % 7);
            for (let i = 0; i < remaining; i++) {
                cellRow.appendChild(this._makeEmptyCell());
            }
            panel.appendChild(cellRow);
        }

        return panel;
    }

    // ---------------------------------------------------------------------------
    // Event wiring
    // ---------------------------------------------------------------------------

    private _wireEvents(el: HTMLElement): void {
        el.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const actionEl = target.closest<HTMLElement>('[data-action]');
            const action = actionEl?.getAttribute('data-action');

            if (action === 'prev') { this._navigate(-1); return; }
            if (action === 'next') { this._navigate(1); return; }

            if (action === 'view-months') {
                this._viewMode = 'months';
                this._render();
                return;
            }
            if (action === 'view-years') {
                this._viewMode = 'years';
                this._render();
                return;
            }
            if (action === 'select-month') {
                const m = parseInt(actionEl!.getAttribute('data-month') ?? '1', 10);
                this._viewMonth = m;
                this._viewMode = 'days';
                this._render();
                return;
            }
            if (action === 'select-year') {
                const y = parseInt(actionEl!.getAttribute('data-year') ?? String(this._viewYear), 10);
                this._viewYear = y;
                this._viewMode = 'months';
                this._render();
                return;
            }

            const cell = target.closest<HTMLElement>(
                '.ndp-inline-cell:not(.ndp-inline-cell--empty):not(.ndp-inline-cell--disabled)',
            );
            if (!cell) return;

            const y = cell.getAttribute('data-bs-year');
            const m = cell.getAttribute('data-bs-month');
            const d = cell.getAttribute('data-bs-day');
            if (!y || !m || !d) return;

            try {
                const date = new NepaliDate(parseInt(y, 10), parseInt(m, 10), parseInt(d, 10));
                this._handleCellClick(date);
            } catch { /* ignore invalid cells */ }
        });

        // Hover preview — only for free range selection (rangeLength=null)
        if (this._opts.selectionMode === 'range' && this._opts.rangeLength === null) {
            el.addEventListener('mouseover', (e) => {
                if (!this._rangeStart || this._rangeEnd) return; // only while picking end
                const cell = (e.target as HTMLElement).closest<HTMLElement>(
                    '.ndp-inline-cell:not(.ndp-inline-cell--empty):not(.ndp-inline-cell--disabled)',
                );
                if (!cell) return;

                const y = cell.getAttribute('data-bs-year');
                const m = cell.getAttribute('data-bs-month');
                const d = cell.getAttribute('data-bs-day');
                if (!y || !m || !d) return;

                try {
                    const hovered = new NepaliDate(parseInt(y, 10), parseInt(m, 10), parseInt(d, 10));
                    if (this._hoverDate && hovered.isSame(this._hoverDate)) return; // no change
                    this._hoverDate = hovered;
                    this._updateRangeHighlight(el);
                } catch { /* skip */ }
            });

            el.addEventListener('mouseleave', () => {
                if (!this._rangeStart || this._rangeEnd) return;
                this._hoverDate = null;
                this._updateRangeHighlight(el);
            });
        }
    }

    private _handleCellClick(date: NepaliDate): void {
        if (this._opts.selectionMode === 'single') {
            this._value = date;
            this._opts.onChange?.(date);
            this._render();
            return;
        }

        // --- Range mode ---
        if (this._opts.rangeLength !== null) {
            // Fixed-length range: auto-compute end
            let rangeEnd: NepaliDate;
            try {
                rangeEnd = date.add(this._opts.rangeLength - 1, 'day');
            } catch {
                // Range extends beyond supported BS_MAX — clamp
                rangeEnd = new NepaliDate(BS_MAX, 12, getDaysInMonth(BS_MAX, 12));
            }
            this._rangeStart = date;
            this._rangeEnd = rangeEnd;
            this._value = date;
            this._opts.onRangeChange?.(date, rangeEnd);
            this._render();
        } else {
            // Free range: first click = start, second click = end
            if (!this._rangeStart || (this._rangeStart && this._rangeEnd)) {
                // Start a fresh selection
                this._rangeStart = date;
                this._rangeEnd = null;
                this._hoverDate = null;
                this._value = date;
                this._opts.onRangeChange?.(date, null);
                this._render();
            } else {
                // Complete the range — ensure start <= end
                let start = this._rangeStart;
                let end = date;
                if (end.isBefore(start)) {
                    [start, end] = [end, start];
                }
                this._rangeStart = start;
                this._rangeEnd = end;
                this._value = start;
                this._hoverDate = null;
                this._opts.onRangeChange?.(start, end);
                this._render();
            }
        }
    }

    /**
     * Updates only the range-related CSS classes on existing cells, without
     * a full re-render. Used for efficient hover preview updates.
     */
    private _updateRangeHighlight(el: HTMLElement): void {
        const { displayStart, displayEnd } = this._getDisplayRange();
        const cells = el.querySelectorAll<HTMLElement>('.ndp-inline-cell[data-bs-day]');

        cells.forEach((cell) => {
            const y = parseInt(cell.getAttribute('data-bs-year') ?? '0', 10);
            const m = parseInt(cell.getAttribute('data-bs-month') ?? '0', 10);
            const d = parseInt(cell.getAttribute('data-bs-day') ?? '0', 10);
            if (!y || !m || !d) return;

            try {
                const date = new NepaliDate(y, m, d);
                const isStart = displayStart ? date.isSame(displayStart) : false;
                const isEnd = displayEnd ? date.isSame(displayEnd) : false;
                const inRange =
                    displayStart && displayEnd
                        ? !date.isBefore(displayStart) && !date.isAfter(displayEnd)
                        : false;

                cell.classList.toggle('ndp-inline-cell--range-start', isStart);
                cell.classList.toggle('ndp-inline-cell--range-end', isEnd && !isStart);
                cell.classList.toggle('ndp-inline-cell--in-range', inRange && !isStart && !isEnd);
            } catch { /* skip */ }
        });
    }

    /**
     * Returns the effective {displayStart, displayEnd} for rendering range highlights,
     * taking into account hover preview when the end hasn't been confirmed yet.
     */
    private _getDisplayRange(): { displayStart: NepaliDate | null; displayEnd: NepaliDate | null } {
        if (this._opts.selectionMode !== 'range') {
            return { displayStart: null, displayEnd: null };
        }

        let displayStart = this._rangeStart;
        let displayEnd = this._rangeEnd;

        // Hover preview: show tentative range while end is being chosen
        if (displayStart && !displayEnd && this._hoverDate) {
            if (this._hoverDate.isBefore(displayStart)) {
                displayEnd = displayStart;
                displayStart = this._hoverDate;
            } else {
                displayEnd = this._hoverDate;
            }
        }

        return { displayStart, displayEnd };
    }

    // ---------------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------------

    private _navigate(direction: -1 | 1): void {
        if (this._viewMode === 'months') {
            // Prev/next changes the year shown in month-picker
            this._viewYear = Math.max(BS_MIN, Math.min(BS_MAX, this._viewYear + direction));
            this._render();
            return;
        }
        if (this._viewMode === 'years') {
            // Prev/next pages through the year grid
            const newStart = this._yearGridStart + direction * 9;
            this._yearGridStart = Math.max(BS_MIN, Math.min(BS_MAX - 8, newStart));
            this._render();
            return;
        }
        // Days view: navigate months
        this._viewMonth += direction;
        if (this._viewMonth > 12) { this._viewMonth = 1; this._viewYear++; }
        if (this._viewMonth < 1) { this._viewMonth = 12; this._viewYear--; }
        if (this._viewYear < BS_MIN) { this._viewYear = BS_MIN; this._viewMonth = 1; }
        if (this._viewYear > BS_MAX) { this._viewYear = BS_MAX; this._viewMonth = 12; }
        this._opts.onMonthChange?.(this._viewYear, this._viewMonth);
        this._render();
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    private _nextMonth(year: number, month: number): [number, number] {
        if (month === 12) return [year + 1, 1];
        return [year, month + 1];
    }

    /** Returns the start of the 9-year grid window that contains the given year. */
    private _snapYearGrid(year: number): number {
        return Math.floor((year - BS_MIN) / 9) * 9 + BS_MIN;
    }

    private _makeRow(): HTMLElement {
        const row = document.createElement('div');
        row.className = 'ndp-inline-row';
        row.setAttribute('role', 'row');
        return row;
    }

    private _makeEmptyCell(): HTMLElement {
        const cell = document.createElement('div');
        cell.className = 'ndp-inline-cell ndp-inline-cell--empty';
        cell.setAttribute('aria-hidden', 'true');
        return cell;
    }
}
