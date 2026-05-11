import { NepaliDate } from '../core/nepali-date';
import { bsToAd, adToBs } from '../core/conversion';
import type { PickerOptions } from './options';
import { Picker } from './picker-class';
import { InlineCalendar } from './inline';
import type { InlineCalendarOptions } from './inline';
export { Picker };
export declare const NepaliDatePicker: {
    version: "2.2.0";
    /**
     * Attaches a date picker to one or more inputs.
     *
     * @example
     * NepaliDatePicker.attach('#dob', { language: 'np' });
     */
    attach(target: string | HTMLElement | NodeList | HTMLElement[], options?: Partial<PickerOptions>): Picker | Picker[] | null;
    detach(target: string | HTMLElement): void;
    getInstance(element: HTMLElement): Picker | null;
    setDefaults(options: Partial<PickerOptions>): void;
    /**
     * Mounts an inline (embedded) calendar into a container element.
     *
     * @example
     * NepaliDatePicker.attachInline('#cal', { months: 2, showAdDate: true });
     */
    attachInline(container: string | HTMLElement, options?: Partial<InlineCalendarOptions>): InlineCalendar | null;
    InlineCalendar: typeof InlineCalendar;
    bsToAd: typeof bsToAd;
    adToBs: typeof adToBs;
    NepaliDate: typeof NepaliDate;
};
