import { NepaliDate } from '../core/nepali-date';
export type PickerLanguage = 'en' | 'np';
export type PickerMode = 'bs' | 'ad';
export type PickerTheme = 'light' | 'dark' | ThemeObject;
export type PickerPosition = 'auto' | 'top' | 'bottom';
export interface ThemeObject {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    spacing?: Record<string, string>;
}
export interface PickerOptions {
    mode: PickerMode;
    format: string;
    language: PickerLanguage;
    useNepaliNumerals: boolean;
    weekendDays: number[];
    minDate: NepaliDate | null;
    maxDate: NepaliDate | null;
    disabledDates: NepaliDate[];
    disabledDaysOfWeek: number[];
    defaultDate: NepaliDate | null;
    closeOnSelect: boolean;
    theme: PickerTheme;
    position: PickerPosition;
    zIndex: number;
    firstDayOfWeek: number;
    onChange: ((date: NepaliDate | null) => void) | null;
    onOpen: (() => void) | null;
    onClose: (() => void) | null;
    onMonthChange: ((year: number, month: number) => void) | null;
}
export declare const DEFAULT_OPTIONS: PickerOptions;
/**
 * Validates and merges user options with defaults.
 * @throws {TypeError | RangeError} For invalid option values
 */
export declare function resolveOptions(partial: Partial<PickerOptions>): PickerOptions;
/**
 * Parses data-* attributes from an HTMLElement into a partial PickerOptions object.
 * Silently ignores attributes that cannot be parsed (with console.warn).
 */
export declare function parseDataAttributes(el: HTMLElement): Partial<PickerOptions>;
