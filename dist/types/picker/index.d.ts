import { NepaliDate } from '../core/nepali-date';
import { bsToAd, adToBs } from '../core/conversion';
import type { PickerOptions } from './options';
export declare class Picker {
    private _input;
    private _opts;
    private _value;
    private _popover;
    private _focused;
    private _viewYear;
    private _viewMonth;
    private _viewMode;
    private _detached;
    private _today;
    private _onInputClick;
    private _onDocClick;
    private _onKeydown;
    private _onScroll;
    private _onResize;
    constructor(input: HTMLElement, opts: PickerOptions);
    open(): void;
    close(): void;
    toggle(): void;
    getValue(): NepaliDate | null;
    setValue(date: NepaliDate | null): void;
    clear(): void;
    setOptions(partial: Partial<PickerOptions>): void;
    refresh(): void;
    detach(): void;
    /** Alias for detach() */
    destroy(): void;
    private _render;
    private _wirePopoverEvents;
    private _navigate;
    private _select;
    private _syncInputValue;
    private _handleKey;
    private _focusCell;
    private _isDisabled;
    private _assertNotDetached;
}
export declare const NepaliDatePicker: {
    version: "0.1.0";
    /**
     * Attaches a date picker to one or more inputs.
     *
     * @param target  - CSS selector, HTMLElement, NodeList, or HTMLElement[]
     * @param options - Optional configuration (merged with setDefaults)
     * @returns A single Picker or array of Pickers
     * @throws {TypeError} For invalid target types
     *
     * @example
     * NepaliDatePicker.attach('#dob', { language: 'np' });
     */
    attach(target: string | HTMLElement | NodeList | HTMLElement[], options?: Partial<PickerOptions>): Picker | Picker[] | null;
    /**
     * Detaches pickers from the given target(s).
     */
    detach(target: string | HTMLElement): void;
    /**
     * Returns the Picker instance for the given element, or null.
     */
    getInstance(element: HTMLElement): Picker | null;
    /**
     * Sets global defaults that apply to all future attach() calls.
     */
    setDefaults(options: Partial<PickerOptions>): void;
    bsToAd: typeof bsToAd;
    adToBs: typeof adToBs;
    NepaliDate: typeof NepaliDate;
};
