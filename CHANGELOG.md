# Changelog

All notable changes to `@nepali-date/picker` will be documented here.

## [2.2.0] — 2026-05-11

### Added
- Inline calendar (`NepaliDatePicker.attachInline`) with single and dual-month layouts
- Range selection mode for itinerary / availability use cases
  - `selectionMode: 'range'` + `rangeLength: N` for fixed-length ranges (e.g. 7-day trek)
  - `rangeLength: null` for free start→end picking with hover preview
  - Cross-month highlighting in the dual-month layout
  - `onRangeChange(start, end)` callback and `getRange()` / `setRange()` methods
- Clickable month/year title in the inline calendar — opens month-picker and year-picker overlays
- Calendar data extended to **2082–2100** (was 2082–2090)
- Bundle split — three IIFE outputs so consumers only pay for what they use:
  - `nepali-date-picker.all.min.js` — full bundle (38.7 KB / 10.8 KB gz)
  - `nepali-date-picker.min.js` — popover only (39.6 KB / 10.9 KB gz)
  - `nepali-date-range-picker.min.js` — inline + range only (22.9 KB / 6.8 KB gz)
  - `nepali-date-picker.iife.min.js` kept as an alias of `.all.min.js` for backwards compat
- CSS custom properties `--ndp-range-bg` and `--ndp-range-text` for range styling
- SEO: meta description, keywords, Open Graph, Twitter Card, JSON-LD `SoftwareApplication` schema in `index.html`

### Changed
- Demo page (`index.html`) loads `nepali-date-picker.all.min.js` (previously `.iife.min.js`)
- `package.json` version bumped from 2.1.0 to 2.2.0

## [Unreleased]

### Added
- Sprint 0: Project foundation, folder structure, build pipeline (esbuild)
- Sprint 0: `src/data/bs-calendar.json` — verified month lengths for BS 2082–2090
- Sprint 1: Core engine — `bsToAd`, `adToBs`, `getDaysInMonth`, `isValidBSDate`
- Sprint 1: Anchor: BS 2083-01-01 = AD 2026-04-14 (verified against multiple sources)
- Sprint 2: `NepaliDate` class — construction, arithmetic, comparison, format, parse
- Sprint 2: `format.ts` — token-based formatting with `en` and `np` locale support
- Sprint 2: `parse.ts` — `NepaliDate.parse(str, format)` round-trip
- Sprint 3: Picker DOM layer — `NepaliDatePicker.attach()`, popover, month grid
- Sprint 3: Keyboard navigation (Arrow keys, PageUp/Down, Home/End, Enter, Escape)
- Sprint 3: ARIA roles — `role="dialog"`, `role="grid"`, `aria-selected`, `aria-disabled`, `aria-current`
- Sprint 4: All 18 configuration options with validation
- Sprint 4: `data-*` attribute auto-parsing
- Sprint 5: CSS custom properties (`--ndp-*`) with light + dark theme presets
- Sprint 5: Auto-init via `[data-nepali-datepicker]` attribute
- Sprint 7: Build output — IIFE (25KB raw / 7.9KB gzip), ESM, UMD, CSS
- 90 unit tests across conversion, NepaliDate, and format modules

## [0.1.0] — 2026-05-10

Initial development release. Not yet published to npm.
