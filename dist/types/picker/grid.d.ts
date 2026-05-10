import { NepaliDate } from '../core/nepali-date';
import type { PickerOptions } from './options';
/**
 * Renders the full picker popover in day-selection mode.
 */
export declare function renderGrid(viewYear: number, viewMonth: number, selected: NepaliDate | null, today: NepaliDate, opts: PickerOptions): HTMLElement;
/**
 * Renders the month-selection popover (12 month buttons).
 */
export declare function renderMonthGrid(viewYear: number, selectedMonth: number | null, opts: PickerOptions): HTMLElement;
/**
 * Renders the year-selection popover (all supported BS years).
 */
export declare function renderYearGrid(selectedYear: number, opts: PickerOptions): HTMLElement;
/** Extracts BS date from a cell element's data attributes */
export declare function getCellDate(cell: HTMLElement): NepaliDate | null;
