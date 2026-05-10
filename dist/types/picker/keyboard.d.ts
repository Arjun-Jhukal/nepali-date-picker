import { NepaliDate } from '../core/nepali-date';
/**
 * Handles keyboard navigation within the date grid.
 * Returns a new focused NepaliDate, or null if the event should be handled elsewhere.
 */
export declare function handleGridKeydown(e: KeyboardEvent, focused: NepaliDate, minDate: NepaliDate | null, maxDate: NepaliDate | null): {
    date: NepaliDate;
    select: boolean;
    close: boolean;
} | null;
