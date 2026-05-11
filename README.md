# Nepali Date Picker &amp; Range Picker

A vanilla JavaScript **Nepali (Bikram Sambat) date picker** and **Nepali date range picker** for any website. Zero runtime dependencies. Drops into plain HTML, WordPress, React, Vue, or any framework via a single `<script>` tag.

- **BS ↔ AD** conversion you can trust — uses manually verified calendar data (every existing JS lib derives month lengths algorithmically, which is incorrect because Bikram Sambat months are astronomically determined and published yearly).
- **2082 – 2100** calendar data ship in the bundle.
- **Popover** datepicker, **inline** calendar, and **range / availability / itinerary** mode.
- **Light + Dark** themes, full **keyboard** navigation, **ARIA** roles, English + Nepali numerals.
- Three bundles — load only what you use.

```
nepali-date-picker.all.min.js          10.82 KB gz   popover + inline + range
nepali-date-picker.min.js               8.25 KB gz   popover only
nepali-date-range-picker.min.js         6.79 KB gz   inline + range only
```

---

## Install

### CDN / script tag

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nepali-bs-date-picker/dist/nepali-date-picker.min.css">
<script src="https://cdn.jsdelivr.net/npm/nepali-bs-date-picker/dist/nepali-date-picker.all.min.js"></script>
```

Pick the bundle that matches your use case:

| File | When to use |
|---|---|
| `nepali-date-picker.all.min.js` | You need both the popover and the inline / range picker. |
| `nepali-date-picker.min.js` | You only need the popover datepicker on `<input>` fields. |
| `nepali-date-range-picker.min.js` | You only need the inline calendar (with optional range / itinerary mode). |

### npm

```bash
npm install nepali-bs-date-picker
```

```js
import { NepaliDatePicker, NepaliDate, InlineCalendar } from 'nepali-bs-date-picker';
import 'nepali-bs-date-picker/css';
// optional: import 'nepali-bs-date-picker/dark';
```

---

## Quick start

### Popover datepicker

```html
<input type="text" id="dob" placeholder="YYYY-MM-DD">
<script>
  NepaliDatePicker.attach('#dob', {
    language: 'np',
    onChange: (date) => {
      console.log(date.format('YYYY-MM-DD'));   // BS string
      console.log(date.toAD().toISOString());   // native AD Date
    },
  });
</script>
```

### Inline calendar — single or dual month

```html
<div id="cal"></div>
<script>
  NepaliDatePicker.attachInline('#cal', {
    months: 2,
    showAdDate: true,
    onChange: (date) => console.log(date?.format('YYYY-MM-DD')),
  });
</script>
```

### Range / availability calendar (e.g. 7-day trek itinerary)

```html
<div id="cal-range"></div>
<script>
  const cal = NepaliDatePicker.attachInline('#cal-range', {
    months: 2,
    selectionMode: 'range',
    rangeLength: 7,                 // auto-select 7 consecutive days
    onRangeChange: (start, end) => {
      // start and end are NepaliDate instances
      console.log(start.format('YYYY-MM-DD'), '→', end.format('YYYY-MM-DD'));
      // For your API:
      const payload = {
        bs_start: start.format('YYYY-MM-DD'),
        bs_end:   end.format('YYYY-MM-DD'),
        ad_start: start.toAD().toISOString().split('T')[0],
        ad_end:   end.toAD().toISOString().split('T')[0],
        nights:   Math.abs(start.diff(end, 'day')),
      };
    },
  });

  // Free range (click start, then click end):
  cal.setOptions({ rangeLength: null });

  // Set range programmatically:
  const today = NepaliDate.today();
  cal.setRange(today, today.add(6, 'day'));
</script>
```

---

## API surface

### `NepaliDatePicker`

| Method | Bundles | Description |
|---|---|---|
| `attach(target, options?)` | `all`, `picker` | Attach popover picker to one or more inputs. |
| `attachInline(container, options?)` | `all`, `range` | Mount inline calendar inside an element. |
| `detach(target)` | `all`, `picker` | Detach pickers and clean up listeners. |
| `getInstance(el)` | `all`, `picker` | Return the `Picker` instance for an element. |
| `setDefaults(options)` | `all`, `picker` | Set global defaults for future `attach()` calls. |
| `NepaliDate` | all | The `NepaliDate` class. |
| `bsToAd`, `adToBs` | all | Primitive conversion functions. |

### `NepaliDate` instance

```js
date.getYear() / getMonth() / getDate() / getDay()
date.format('YYYY-MM-DD' | 'MMMM DD, YYYY' | …, language?)
date.toAD()              // → native JS Date
date.add(n, 'day')       // → new NepaliDate
date.diff(other, 'day')  // → number
date.isBefore(other) / isAfter(other) / isSame(other)
NepaliDate.today() / NepaliDate.parse(str, format)
```

---

## SEO

This is a **Nepali date picker** library, a **Nepali date range picker** library, and a **Bikram Sambat date picker** for the 2026 / BS 2082+ era. It handles BS to AD conversion, AD to BS conversion, and ships calendar data through BS 2100. Works in WordPress, vanilla HTML, React, Vue, and any modern framework.

---

## License

MIT — © Arjun Jhukal
