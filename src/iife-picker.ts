/**
 * IIFE bundle — popover picker only.
 *
 * Exposes window.NepaliDatePicker with .attach(), conversion helpers and
 * the NepaliDate class, but does NOT include the inline calendar / range
 * picker. Use this when you only need the popover datepicker.
 *
 * Bundle file: dist/nepali-date-picker.min.js
 */
import { Picker } from './picker/picker-class';
import { resolveOptions, parseDataAttributes } from './picker/options';
import type { PickerOptions } from './picker/options';
import { InstanceRegistry } from './picker/instance-registry';
import { NepaliDate } from './core/nepali-date';
import { bsToAd, adToBs, getDaysInMonth, isValidBSDate } from './core/conversion';

let globalDefaults: Partial<PickerOptions> = {};

function getOrCreate(el: HTMLElement, opts: PickerOptions): Picker {
    if (InstanceRegistry.has(el)) return InstanceRegistry.get(el) as Picker;
    const picker = new Picker(el, opts);
    InstanceRegistry.set(el, picker);
    return picker;
}

const NepaliDatePicker = {
    version: '2.2.0' as const,
    bundle: 'picker' as const,

    attach(
        target: string | HTMLElement | NodeList | HTMLElement[],
        options: Partial<PickerOptions> = {},
    ): Picker | Picker[] | null {
        const opts = resolveOptions({ ...globalDefaults, ...options });

        if (typeof target === 'string') {
            if (target.startsWith('#') && !target.includes(' ') && !target.includes('.')) {
                const el = document.getElementById(target.slice(1));
                return el ? getOrCreate(el, opts) : null;
            }
            const els = Array.from(document.querySelectorAll<HTMLElement>(target));
            if (els.length === 0) return null;
            if (els.length === 1) return getOrCreate(els[0], opts);
            return els.map((el) => getOrCreate(el, opts));
        }
        if (target instanceof HTMLElement) return getOrCreate(target, opts);
        if (target instanceof NodeList || Array.isArray(target)) {
            return Array.from(target as Iterable<HTMLElement>).map((el) => getOrCreate(el, opts));
        }
        if (target === null || target === undefined) {
            throw new TypeError('target must be string, Element, or NodeList');
        }
        throw new TypeError(`target must be string, Element, or NodeList, got ${typeof target}`);
    },

    detach(target: string | HTMLElement): void {
        const elements: HTMLElement[] = [];
        if (typeof target === 'string') {
            elements.push(...Array.from(document.querySelectorAll<HTMLElement>(target)));
        } else if (target instanceof HTMLElement) {
            elements.push(target);
        }
        for (const el of elements) {
            (InstanceRegistry.get(el) as Picker | null)?.detach();
        }
    },

    getInstance(element: HTMLElement): Picker | null {
        return (InstanceRegistry.get(element) as Picker | null) ?? null;
    },

    setDefaults(options: Partial<PickerOptions>): void {
        globalDefaults = { ...globalDefaults, ...options };
    },

    bsToAd,
    adToBs,
    getDaysInMonth,
    isValidBSDate,
    NepaliDate,
};

(window as unknown as { NepaliDatePicker: typeof NepaliDatePicker }).NepaliDatePicker =
    NepaliDatePicker;

function autoInit(): void {
    if (document.querySelectorAll('script[data-nepali-no-autoinit]').length > 0) return;
    document.querySelectorAll<HTMLElement>('[data-nepali-datepicker]').forEach((el) => {
        NepaliDatePicker.attach(el, parseDataAttributes(el));
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
} else {
    autoInit();
}
