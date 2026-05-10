import { NepaliDate } from '../core/nepali-date';
import { getDaysInMonth, BS_MIN, BS_MAX } from '../core/data-loader';
import {
    MONTH_NAMES_EN, MONTH_NAMES_NP,
    DAY_NAMES_SHORT_EN, DAY_NAMES_SHORT_NP,
    toNepaliNumeral,
} from '../core/format';
import type { PickerOptions } from './options';

/**
 * Renders the full picker popover in day-selection mode.
 */
export function renderGrid(
    viewYear: number,
    viewMonth: number,
    selected: NepaliDate | null,
    today: NepaliDate,
    opts: PickerOptions,
): HTMLElement {
    const np = opts.language === 'np';
    const monthNames = np ? MONTH_NAMES_NP : MONTH_NAMES_EN;
    const dayNamesShort = np ? DAY_NAMES_SHORT_NP : DAY_NAMES_SHORT_EN;

    const popover = _makePopover('Date picker');

    const titleText = `${monthNames[viewMonth - 1]} ${np ? toNepaliNumeral(viewYear) : viewYear}`;
    popover.appendChild(_buildHeader(titleText, 'view-months', true, np));

    // --- Weekday headers ---
    const grid = document.createElement('div');
    grid.className = 'ndp-grid';
    grid.setAttribute('role', 'grid');

    const headerRow = document.createElement('div');
    headerRow.className = 'ndp-weekdays';
    headerRow.setAttribute('role', 'row');

    const orderedDays: number[] = [];
    for (let i = 0; i < 7; i++) {
        orderedDays.push((opts.firstDayOfWeek + i) % 7);
    }
    for (const dayIdx of orderedDays) {
        const th = document.createElement('div');
        th.className = 'ndp-weekday';
        th.setAttribute('role', 'columnheader');
        th.setAttribute('aria-label', DAY_NAMES_SHORT_EN[dayIdx]);
        th.textContent = dayNamesShort[dayIdx];
        headerRow.appendChild(th);
    }
    grid.appendChild(headerRow);

    // --- Day cells ---
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = new NepaliDate(viewYear, viewMonth, 1).getDay();
    const startOffset = (firstDay - opts.firstDayOfWeek + 7) % 7;

    let dayNum = 1;
    let cellRow = _makeRow();

    for (let i = 0; i < startOffset; i++) {
        cellRow.appendChild(_makeEmptyCell());
    }

    let cellCount = startOffset;

    while (dayNum <= daysInMonth) {
        const cellDate = new NepaliDate(viewYear, viewMonth, dayNum);
        const cell = document.createElement('div');
        cell.className = 'ndp-cell ndp-day';
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('tabindex', '-1');
        cell.setAttribute('data-bs-year', String(viewYear));
        cell.setAttribute('data-bs-month', String(viewMonth));
        cell.setAttribute('data-bs-day', String(dayNum));

        const dayOfWeek = cellDate.getDay();
        const isToday = cellDate.isSame(today);
        const isSelected = selected ? cellDate.isSame(selected) : false;
        const isWeekend = opts.weekendDays.includes(dayOfWeek);
        const isDisabledDow = opts.disabledDaysOfWeek.includes(dayOfWeek);
        const isBeforeMin = opts.minDate ? cellDate.isBefore(opts.minDate) : false;
        const isAfterMax = opts.maxDate ? cellDate.isAfter(opts.maxDate) : false;
        const isDisabledDate = opts.disabledDates.some((d) => d.isSame(cellDate));
        const isDisabled = isDisabledDow || isBeforeMin || isAfterMax || isDisabledDate;

        if (isToday) { cell.classList.add('ndp-day--today'); cell.setAttribute('aria-current', 'date'); }
        if (isSelected) { cell.classList.add('ndp-day--selected'); cell.setAttribute('aria-selected', 'true'); }
        if (isWeekend) { cell.classList.add('ndp-day--weekend'); }
        if (isDisabled) {
            cell.classList.add('ndp-day--disabled');
            cell.setAttribute('aria-disabled', 'true');
            cell.removeAttribute('tabindex');
        }

        cell.textContent = opts.useNepaliNumerals ? toNepaliNumeral(dayNum) : String(dayNum);
        cellRow.appendChild(cell);
        cellCount++;

        if (cellCount % 7 === 0) {
            grid.appendChild(cellRow);
            cellRow = _makeRow();
        }
        dayNum++;
    }

    if (cellCount % 7 !== 0) {
        const remaining = 7 - (cellCount % 7);
        for (let i = 0; i < remaining; i++) {
            cellRow.appendChild(_makeEmptyCell());
        }
        grid.appendChild(cellRow);
    }

    popover.appendChild(grid);
    popover.appendChild(_buildFooter(np));
    return popover;
}

/**
 * Renders the month-selection popover (12 month buttons).
 */
export function renderMonthGrid(
    viewYear: number,
    selectedMonth: number | null,
    opts: PickerOptions,
): HTMLElement {
    const np = opts.language === 'np';
    const monthNames = np ? MONTH_NAMES_NP : MONTH_NAMES_EN;

    const popover = _makePopover('Month picker');
    popover.appendChild(_buildHeader(
        np ? toNepaliNumeral(viewYear) : String(viewYear),
        'view-years',
        true,
        np,
    ));

    const grid = document.createElement('div');
    grid.className = 'ndp-month-grid';

    for (let m = 1; m <= 12; m++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ndp-month-cell' + (m === selectedMonth ? ' ndp-month-cell--selected' : '');
        btn.textContent = monthNames[m - 1];
        btn.setAttribute('data-action', 'select-month');
        btn.setAttribute('data-month', String(m));
        grid.appendChild(btn);
    }

    popover.appendChild(grid);
    return popover;
}

/**
 * Renders the year-selection popover (all supported BS years).
 */
export function renderYearGrid(selectedYear: number, opts: PickerOptions): HTMLElement {
    const np = opts.language === 'np';
    const rangeLabel = np
        ? `${toNepaliNumeral(BS_MIN)}–${toNepaliNumeral(BS_MAX)}`
        : `${BS_MIN}–${BS_MAX}`;

    const popover = _makePopover('Year picker');
    popover.appendChild(_buildHeader(rangeLabel, null, false, np));

    const grid = document.createElement('div');
    grid.className = 'ndp-year-grid';

    for (let y = BS_MIN; y <= BS_MAX; y++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ndp-year-cell' + (y === selectedYear ? ' ndp-year-cell--selected' : '');
        btn.textContent = np ? toNepaliNumeral(y) : String(y);
        btn.setAttribute('data-action', 'select-year');
        btn.setAttribute('data-year', String(y));
        grid.appendChild(btn);
    }

    popover.appendChild(grid);
    return popover;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _makePopover(label: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ndp-popover';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-label', label);
    return el;
}

function _buildHeader(
    titleText: string,
    titleAction: string | null,
    showNavBtns: boolean,
    np: boolean,
): HTMLElement {
    const header = document.createElement('div');
    header.className = 'ndp-header';

    if (showNavBtns) {
        const prev = document.createElement('button');
        prev.className = 'ndp-nav-btn ndp-prev';
        prev.type = 'button';
        prev.setAttribute('aria-label', np ? 'अघिल्लो' : 'Previous');
        prev.setAttribute('data-action', 'prev');
        prev.innerHTML = '&#8249;';
        header.appendChild(prev);
    }

    const title = document.createElement('div');
    title.className = 'ndp-title' + (titleAction ? ' ndp-title--clickable' : '');
    title.setAttribute('aria-live', 'polite');
    if (titleAction) title.setAttribute('data-action', titleAction);
    title.textContent = titleText;
    header.appendChild(title);

    if (showNavBtns) {
        const next = document.createElement('button');
        next.className = 'ndp-nav-btn ndp-next';
        next.type = 'button';
        next.setAttribute('aria-label', np ? 'अर्को' : 'Next');
        next.setAttribute('data-action', 'next');
        next.innerHTML = '&#8250;';
        header.appendChild(next);
    }

    return header;
}

function _buildFooter(np: boolean): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'ndp-footer';

    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'ndp-footer-btn ndp-today-btn';
    todayBtn.textContent = np ? 'आज' : 'Today';
    todayBtn.setAttribute('data-action', 'today');

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'ndp-footer-btn ndp-clear-btn';
    clearBtn.textContent = np ? 'हटाउनुस्' : 'Clear';
    clearBtn.setAttribute('data-action', 'clear');

    footer.appendChild(todayBtn);
    footer.appendChild(clearBtn);
    return footer;
}

function _makeRow(): HTMLElement {
    const row = document.createElement('div');
    row.className = 'ndp-row';
    row.setAttribute('role', 'row');
    return row;
}

function _makeEmptyCell(): HTMLElement {
    const cell = document.createElement('div');
    cell.className = 'ndp-cell ndp-cell--empty';
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-disabled', 'true');
    return cell;
}

/** Extracts BS date from a cell element's data attributes */
export function getCellDate(cell: HTMLElement): NepaliDate | null {
    const y = cell.getAttribute('data-bs-year');
    const m = cell.getAttribute('data-bs-month');
    const d = cell.getAttribute('data-bs-day');
    if (!y || !m || !d) return null;
    try {
        return new NepaliDate(parseInt(y, 10), parseInt(m, 10), parseInt(d, 10));
    } catch {
        return null;
    }
}
