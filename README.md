# Nepali Date Picker

A lightweight, zero-dependency Bikram Sambat (BS) date picker for the web. Supports Nepali (BS) and English display, dark mode, keyboard navigation, and full ARIA accessibility.

**BS year range: 2082 – 2090**

---

## Quick start (CDN)

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Arjun-Jhukal/nepali-date-picker@v1.0.0/dist/nepali-date-picker.min.css">

<!-- JS -->
<script src="https://cdn.jsdelivr.net/gh/Arjun-Jhukal/nepali-date-picker@v1.0.0/dist/nepali-date-picker.iife.min.js"></script>
```

```html
<input id="date" type="text" placeholder="YYYY-MM-DD">

<script>
  NepaliDatePicker.attach('#date');
</script>
```

---

## Install via npm

```bash
npm install @nepali-date/picker
```

```js
import { NepaliDatePicker } from '@nepali-date/picker';

NepaliDatePicker.attach('#date');
```

---

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `language` | `'en' \| 'np'` | `'en'` | Display language |
| `format` | `string` | `'YYYY-MM-DD'` | Date format string |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Color theme |
| `minDate` | `NepaliDate` | — | Earliest selectable date |
| `maxDate` | `NepaliDate` | — | Latest selectable date |
| `disabledDates` | `NepaliDate[]` | `[]` | Specific dates to disable |
| `disabledDaysOfWeek` | `number[]` | `[]` | 0=Sun … 6=Sat |
| `weekendDays` | `number[]` | `[6]` | Days styled as weekends |
| `firstDayOfWeek` | `0–6` | `0` | First column of the grid |
| `closeOnSelect` | `boolean` | `true` | Close picker after selection |
| `position` | `'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right'` | `'bottom-left'` | Popover placement |
| `zIndex` | `number` | `9999` | CSS z-index of popover |
| `useNepaliNumerals` | `boolean` | `false` | Show Devanagari digits |

---

## Events / callbacks

```js
NepaliDatePicker.attach('#date', {
  onChange(date) {
    console.log(date.format('YYYY-MM-DD')); // NepaliDate or null
  },
  onOpen() {},
  onClose() {},
  onMonthChange(year, month) {},
});
```

---

## Auto-init via data attributes

```html
<input
  type="text"
  data-ndp
  data-ndp-language="np"
  data-ndp-theme="dark"
  data-ndp-format="YYYY/MM/DD"
>
```

---

## Programmatic API

```js
const picker = NepaliDatePicker.attach('#date');

picker.open();
picker.close();
picker.toggle();

picker.getValue();          // NepaliDate | null
picker.setValue(date);      // NepaliDate | null
picker.clear();

picker.setOptions({ language: 'np' });
picker.destroy();

// Get existing instance
NepaliDatePicker.getInstance(document.getElementById('date'));

// Set global defaults
NepaliDatePicker.setDefaults({ theme: 'dark', language: 'np' });
```

---

## NepaliDate API

```js
const { NepaliDate, bsToAd, adToBs } = NepaliDatePicker;

const d = new NepaliDate(2082, 1, 15);
d.getYear();    // 2082
d.getMonth();   // 1
d.getDate();    // 15
d.getDay();     // 0–6 (day of week)

d.format('YYYY-MM-DD');          // '2082-01-15'
d.format('MMMM D, YYYY', 'np'); // Nepali month name

d.toAD();               // JS Date
NepaliDate.today();     // today in BS
NepaliDate.fromAD(new Date());

d.isBefore(other);
d.isAfter(other);
d.isSame(other);

bsToAd(2082, 1, 15);   // { year, month, day } in AD
adToBs(2025, 4, 29);   // { year, month, day } in BS
```

---

## Theming

The picker uses CSS custom properties. Override any variable to match your design:

```css
:root {
  --ndp-primary: #your-color;
  --ndp-bg: #ffffff;
  --ndp-text: #1e293b;
  /* see dist/nepali-date-picker.min.css for full list */
}
```

Dark mode:

```html
<link rel="stylesheet" href="nepali-date-picker.min.css">
<link rel="stylesheet" href="nepali-date-picker.dark.min.css">
```

---

## Building from source

```bash
npm install
npm run build   # outputs to dist/
npm test        # runs unit + integration tests
```

---

## License

MIT © Arjun Jhukal
