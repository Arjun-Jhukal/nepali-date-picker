/**
 * @nepali-date/picker
 * Vanilla JS Bikram Sambat date picker.
 * Zero runtime dependencies.
 *
 * Public API surface — everything exported here is a stable contract.
 */
export { bsToAd, adToBs, getDaysInMonth, isValidBSDate } from './core/conversion';
export { NepaliDate } from './core/nepali-date';
export { NepaliDatePicker, Picker } from './picker/index';
export type { PickerOptions, PickerTheme, PickerLanguage, PickerPosition } from './picker/options';
