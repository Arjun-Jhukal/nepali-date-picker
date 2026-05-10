import { NepaliDate } from '../core/nepali-date';
import { BS_MIN, BS_MAX } from '../core/data-loader';

/**
 * Handles keyboard navigation within the date grid.
 * Returns a new focused NepaliDate, or null if the event should be handled elsewhere.
 */
export function handleGridKeydown(
    e: KeyboardEvent,
    focused: NepaliDate,
    minDate: NepaliDate | null,
    maxDate: NepaliDate | null,
): { date: NepaliDate; select: boolean; close: boolean } | null {
    let next: NepaliDate | null = null;
    let select = false;
    let close = false;

    switch (e.key) {
        case 'ArrowRight':
            next = safeAdd(focused, 1, 'day');
            break;
        case 'ArrowLeft':
            next = safeAdd(focused, -1, 'day');
            break;
        case 'ArrowDown':
            next = safeAdd(focused, 7, 'day');
            break;
        case 'ArrowUp':
            next = safeAdd(focused, -7, 'day');
            break;
        case 'PageDown':
            next = e.shiftKey
                ? safeAdd(focused, 1, 'year')
                : safeAdd(focused, 1, 'month');
            break;
        case 'PageUp':
            next = e.shiftKey
                ? safeAdd(focused, -1, 'year')
                : safeAdd(focused, -1, 'month');
            break;
        case 'Home':
            // Move to first day of the current week (Sun or configured firstDay)
            next = safeAdd(focused, -(focused.getDay()), 'day');
            break;
        case 'End':
            // Move to last day of the current week
            next = safeAdd(focused, 6 - focused.getDay(), 'day');
            break;
        case 'Enter':
        case ' ':
            select = true;
            next = focused;
            break;
        case 'Escape':
            close = true;
            next = focused;
            break;
        default:
            return null;
    }

    if (!next) return null;

    // Clamp to range bounds
    if (minDate && next.isBefore(minDate)) next = minDate;
    if (maxDate && next.isAfter(maxDate)) next = maxDate;

    return { date: next, select, close };
}

function safeAdd(
    date: NepaliDate,
    amount: number,
    unit: 'day' | 'month' | 'year',
): NepaliDate | null {
    try {
        const result = date.add(amount, unit);
        if (result.getYear() < BS_MIN || result.getYear() > BS_MAX) return date;
        return result;
    } catch {
        return date;
    }
}
