/**
 * IIFE bundle — everything (popover picker + inline + range).
 *
 * Exposes window.NepaliDatePicker with the full API surface. This is
 * the convenience bundle for users who want every feature in one file.
 *
 * Bundle files:
 *   dist/nepali-date-picker.all.min.js
 *   dist/nepali-date-picker.iife.min.js  (alias, kept for backwards compat)
 */
import { NepaliDatePicker } from './picker/index';
import './picker/auto-init';

const FullAPI = { ...NepaliDatePicker, version: '2.2.0' as const, bundle: 'all' as const };

(window as unknown as { NepaliDatePicker: typeof FullAPI }).NepaliDatePicker = FullAPI;
