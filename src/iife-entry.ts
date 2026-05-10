/**
 * IIFE bundle entry point.
 * Sets window.NepaliDatePicker to the picker API object directly —
 * no namespace wrapper, works exactly like jQuery or Slick Slider.
 *
 * Usage in browser:
 *   NepaliDatePicker.attach('#my-input', { language: 'np' });
 *   new NepaliDatePicker.NepaliDate(2083, 1, 1);
 */
import { NepaliDatePicker } from './picker/index';
import './picker/auto-init';

(window as Window & { NepaliDatePicker: typeof NepaliDatePicker }).NepaliDatePicker =
    NepaliDatePicker;
