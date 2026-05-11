/**
 * IIFE bundle — inline calendar + range picker only.
 *
 * Exposes window.NepaliDatePicker with .attachInline() and the
 * InlineCalendar class. Does NOT include the popover picker — use
 * the picker or all bundles for that.
 *
 * Bundle file: dist/nepali-date-range-picker.min.js
 */
import { InlineCalendar } from './picker/inline';
import type { InlineCalendarOptions } from './picker/inline';
import { NepaliDate } from './core/nepali-date';
import { bsToAd, adToBs, getDaysInMonth, isValidBSDate } from './core/conversion';

const NepaliDatePicker = {
    version: '2.2.0' as const,
    bundle: 'range' as const,

    attachInline(
        container: string | HTMLElement,
        options: Partial<InlineCalendarOptions> = {},
    ): InlineCalendar | null {
        let el: HTMLElement | null = null;
        if (typeof container === 'string') {
            el = document.querySelector<HTMLElement>(container);
        } else if (container instanceof HTMLElement) {
            el = container;
        }
        return el ? new InlineCalendar(el, options) : null;
    },

    InlineCalendar,
    bsToAd,
    adToBs,
    getDaysInMonth,
    isValidBSDate,
    NepaliDate,
};

(window as unknown as { NepaliDatePicker: typeof NepaliDatePicker }).NepaliDatePicker =
    NepaliDatePicker;
