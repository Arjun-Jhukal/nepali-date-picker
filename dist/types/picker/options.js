import { NepaliDate } from '../core/nepali-date';
export const DEFAULT_OPTIONS = {
    mode: 'bs',
    format: 'YYYY-MM-DD',
    language: 'en',
    useNepaliNumerals: false,
    weekendDays: [0, 6],
    minDate: null,
    maxDate: null,
    disabledDates: [],
    disabledDaysOfWeek: [],
    defaultDate: null,
    closeOnSelect: true,
    theme: 'light',
    position: 'auto',
    zIndex: 1000,
    firstDayOfWeek: 0,
    onChange: null,
    onOpen: null,
    onClose: null,
    onMonthChange: null,
};
/**
 * Validates and merges user options with defaults.
 * @throws {TypeError | RangeError} For invalid option values
 */
export function resolveOptions(partial) {
    const opts = Object.assign(Object.assign({}, DEFAULT_OPTIONS), partial);
    // Validate language
    if (!['en', 'np'].includes(opts.language)) {
        throw new RangeError(`Supported languages: en, np. Got '${opts.language}'`);
    }
    // Validate theme
    if (typeof opts.theme === 'string' &&
        !['light', 'dark'].includes(opts.theme)) {
        throw new RangeError(`Built-in themes: light, dark. Got '${opts.theme}'`);
    }
    if (typeof opts.theme === 'object' && opts.theme !== null) {
        const t = opts.theme;
        if (t.colors !== undefined && typeof t.colors !== 'object') {
            throw new TypeError('theme.colors must be object');
        }
        if (t.colors) {
            for (const [, v] of Object.entries(t.colors)) {
                if (typeof v !== 'string') {
                    throw new TypeError('color values must be strings');
                }
            }
        }
    }
    // Validate position
    if (!['auto', 'top', 'bottom'].includes(opts.position)) {
        throw new RangeError(`position must be 'auto', 'top', or 'bottom'. Got '${opts.position}'`);
    }
    // Validate weekendDays
    if (!Array.isArray(opts.weekendDays)) {
        throw new TypeError('weekendDays must be number array');
    }
    for (const d of opts.weekendDays) {
        if (typeof d !== 'number' || d < 0 || d > 6) {
            throw new RangeError(`weekendDays must be 0–6, got ${d}`);
        }
    }
    // Validate firstDayOfWeek
    if (typeof opts.firstDayOfWeek !== 'number' ||
        opts.firstDayOfWeek < 0 ||
        opts.firstDayOfWeek > 6) {
        throw new RangeError(`firstDayOfWeek must be 0–6, got ${opts.firstDayOfWeek}`);
    }
    // Validate callbacks
    for (const key of ['onChange', 'onOpen', 'onClose', 'onMonthChange']) {
        if (opts[key] !== null && typeof opts[key] !== 'function') {
            throw new TypeError(`${key} must be a function`);
        }
    }
    // Validate minDate/maxDate ordering
    if (opts.minDate && opts.maxDate && opts.minDate.isAfter(opts.maxDate)) {
        throw new RangeError('minDate cannot be after maxDate');
    }
    return opts;
}
/**
 * Parses data-* attributes from an HTMLElement into a partial PickerOptions object.
 * Silently ignores attributes that cannot be parsed (with console.warn).
 */
export function parseDataAttributes(el) {
    const opts = {};
    const dataset = el.dataset;
    if (dataset['mode']) {
        opts.mode = dataset['mode'];
    }
    if (dataset['format']) {
        opts.format = dataset['format'];
    }
    if (dataset['language']) {
        opts.language = dataset['language'];
    }
    if (dataset['useNepaliNumerals']) {
        opts.useNepaliNumerals = dataset['useNepaliNumerals'] !== 'false';
    }
    if (dataset['weekendDays']) {
        try {
            opts.weekendDays = dataset['weekendDays']
                .split(',')
                .map((s) => parseInt(s.trim(), 10));
        }
        catch (_a) {
            console.warn('[NepaliDatePicker] Invalid data-weekend-days, ignoring');
        }
    }
    if (dataset['minDate']) {
        try {
            opts.minDate = NepaliDate.parse(dataset['minDate'], 'YYYY-MM-DD');
        }
        catch (_b) {
            console.warn(`[NepaliDatePicker] Invalid data-min-date="${dataset['minDate']}", ignoring`);
        }
    }
    if (dataset['maxDate']) {
        try {
            opts.maxDate = NepaliDate.parse(dataset['maxDate'], 'YYYY-MM-DD');
        }
        catch (_c) {
            console.warn(`[NepaliDatePicker] Invalid data-max-date="${dataset['maxDate']}", ignoring`);
        }
    }
    if (dataset['disabledDates']) {
        opts.disabledDates = dataset['disabledDates']
            .split(',')
            .flatMap((s) => {
            try {
                return [NepaliDate.parse(s.trim(), 'YYYY-MM-DD')];
            }
            catch (_a) {
                console.warn(`[NepaliDatePicker] Cannot parse disabled date '${s}', ignoring`);
                return [];
            }
        });
    }
    if (dataset['closeOnSelect']) {
        opts.closeOnSelect = dataset['closeOnSelect'] !== 'false';
    }
    if (dataset['theme']) {
        opts.theme = dataset['theme'];
    }
    if (dataset['position']) {
        opts.position = dataset['position'];
    }
    if (dataset['zIndex']) {
        opts.zIndex = parseInt(dataset['zIndex'], 10);
    }
    if (dataset['firstDayOfWeek']) {
        opts.firstDayOfWeek = parseInt(dataset['firstDayOfWeek'], 10);
    }
    return opts;
}
