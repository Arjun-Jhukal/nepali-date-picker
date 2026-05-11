// src/data/bs-calendar.json
var bs_calendar_default = {
  _comment: "Month lengths for BS years 2082-2090. Each array = 12 months (Baishakh to Chaitra). Source: data-source.md",
  _anchor: "BS 2083-01-01 = AD 2026-04-14 (Tuesday). Verified against hamropatro.com and bsdate.com.",
  "2082": [
    31,
    31,
    32,
    32,
    31,
    30,
    30,
    29,
    30,
    29,
    30,
    30
  ],
  "2083": [
    31,
    31,
    32,
    32,
    31,
    30,
    30,
    30,
    30,
    29,
    30,
    30
  ],
  "2084": [
    31,
    31,
    32,
    32,
    31,
    30,
    30,
    30,
    29,
    29,
    30,
    30
  ],
  "2085": [
    31,
    32,
    31,
    32,
    31,
    30,
    30,
    30,
    29,
    30,
    30,
    30
  ],
  "2086": [
    31,
    31,
    32,
    32,
    31,
    30,
    30,
    29,
    30,
    29,
    30,
    30
  ],
  "2087": [
    31,
    32,
    31,
    32,
    31,
    30,
    30,
    30,
    29,
    29,
    30,
    30
  ],
  "2088": [
    31,
    31,
    32,
    32,
    31,
    30,
    30,
    30,
    30,
    29,
    30,
    30
  ],
  "2089": [
    31,
    31,
    32,
    31,
    31,
    31,
    30,
    29,
    30,
    29,
    30,
    30
  ],
  "2090": [
    31,
    31,
    32,
    32,
    31,
    30,
    30,
    29,
    30,
    29,
    30,
    30
  ],
  "2091": [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  "2092": [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  "2093": [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  "2094": [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  "2095": [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  "2096": [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  "2097": [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  "2098": [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  "2099": [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  "2100": [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31]
};

// src/core/data-loader.ts
var BS_MIN = 2082;
var BS_MAX = 2090;
var BS_AD_ANCHOR = {
  bs: { year: 2083, month: 1, day: 1 },
  ad: new Date(2026, 3, 14)
  // April 14, 2026 — month is 0-indexed
};
var calendar = bs_calendar_default;
function getDaysInMonth(year, month) {
  if (year < BS_MIN || year > BS_MAX) {
    throw new RangeError(
      `BS year ${year} not in supported range ${BS_MIN}\u2013${BS_MAX}`
    );
  }
  if (month < 1 || month > 12) {
    throw new RangeError(`BS month must be 1\u201312, got ${month}`);
  }
  return calendar[String(year)][month - 1];
}
function getDaysInYear(year) {
  if (year < BS_MIN || year > BS_MAX) {
    throw new RangeError(
      `BS year ${year} not in supported range ${BS_MIN}\u2013${BS_MAX}`
    );
  }
  return calendar[String(year)].reduce((a, b) => a + b, 0);
}

// src/core/conversion.ts
var AD_ANCHOR_TIME = (() => {
  const d = new Date(BS_AD_ANCHOR.ad);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();
function assertInt(value, name) {
  if (typeof value !== "number") {
    throw new TypeError(`BS ${name} must be a number, got ${typeof value}`);
  }
  if (Number.isNaN(value)) {
    throw new TypeError(`BS ${name} must be a number, got NaN`);
  }
  if (!Number.isInteger(value)) {
    throw new TypeError(`BS ${name} must be an integer, got ${value}`);
  }
}
function assertYearInRange(year) {
  if (year < BS_MIN || year > BS_MAX) {
    throw new RangeError(
      `BS year ${year} not in supported range ${BS_MIN}\u2013${BS_MAX}`
    );
  }
}
function assertMonthInRange(month) {
  if (month < 1 || month > 12) {
    throw new RangeError(`BS month must be 1\u201312, got ${month}`);
  }
}
function assertDayInRange(year, month, day) {
  const maxDay = getDaysInMonth(year, month);
  if (day < 1 || day > maxDay) {
    throw new RangeError(
      `BS day must be 1\u2013${maxDay} for ${year}/${month}, got ${day}`
    );
  }
}
function daysFromEra(year, month, day) {
  let days = 0;
  for (let y = BS_MIN; y < year; y++) {
    days += getDaysInYear(y);
  }
  for (let m = 1; m < month; m++) {
    days += getDaysInMonth(year, m);
  }
  days += day - 1;
  return days;
}
var ANCHOR_OFFSET = daysFromEra(
  BS_AD_ANCHOR.bs.year,
  BS_AD_ANCHOR.bs.month,
  BS_AD_ANCHOR.bs.day
);
function bsToAd(year, month, day) {
  assertInt(year, "year");
  assertInt(month, "month");
  assertInt(day, "day");
  assertYearInRange(year);
  assertMonthInRange(month);
  assertDayInRange(year, month, day);
  const offset = daysFromEra(year, month, day) - ANCHOR_OFFSET;
  const adTime = AD_ANCHOR_TIME + offset * 864e5;
  return new Date(adTime);
}
function adToBs(date) {
  if (!(date instanceof Date)) {
    throw new TypeError(
      `Expected Date object, got ${date === null ? "null" : typeof date}`
    );
  }
  if (isNaN(date.getTime())) {
    throw new RangeError("Invalid Date");
  }
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  const offset = Math.round((midnight.getTime() - AD_ANCHOR_TIME) / 864e5);
  let year = BS_AD_ANCHOR.bs.year;
  let month = BS_AD_ANCHOR.bs.month;
  let day = BS_AD_ANCHOR.bs.day;
  let remaining = offset;
  if (remaining > 0) {
    while (remaining > 0) {
      const daysLeft = getDaysInMonth(year, month) - day;
      if (remaining <= daysLeft) {
        day += remaining;
        remaining = 0;
      } else {
        remaining -= daysLeft + 1;
        day = 1;
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
        if (year > BS_MAX) {
          throw new RangeError(
            `AD date ${date.toDateString()} exceeds supported BS range (max ${BS_MAX})`
          );
        }
      }
    }
  } else if (remaining < 0) {
    while (remaining < 0) {
      if (day + remaining >= 1) {
        day += remaining;
        remaining = 0;
      } else {
        remaining += day;
        month--;
        if (month < 1) {
          month = 12;
          year--;
        }
        if (year < BS_MIN) {
          throw new RangeError(
            `AD date ${date.toDateString()} predates supported BS range (min ${BS_MIN})`
          );
        }
        day = getDaysInMonth(year, month);
      }
    }
  }
  return { year, month, day };
}
function isValidBSDate(year, month, day) {
  if (typeof year !== "number" || typeof month !== "number" || typeof day !== "number") {
    return false;
  }
  if (year < BS_MIN || year > BS_MAX)
    return false;
  if (month < 1 || month > 12)
    return false;
  const maxDay = getDaysInMonth(year, month);
  return day >= 1 && day <= maxDay;
}

// src/core/format.ts
var MONTH_NAMES_EN = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra"
];
var MONTH_NAMES_NP = [
  "\u092C\u0948\u0936\u093E\u0916",
  "\u091C\u0947\u0937\u094D\u0920",
  "\u0905\u0938\u093E\u0930",
  "\u0936\u094D\u0930\u093E\u0935\u0923",
  "\u092D\u093E\u0926\u094D\u0930",
  "\u0906\u0936\u094D\u0935\u093F\u0928",
  "\u0915\u093E\u0930\u094D\u0924\u093F\u0915",
  "\u092E\u0902\u0938\u093F\u0930",
  "\u092A\u094C\u0937",
  "\u092E\u093E\u0918",
  "\u092B\u093E\u0932\u094D\u0917\u0941\u0928",
  "\u091A\u0948\u0924\u094D\u0930"
];
var DAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
var DAY_NAMES_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var DAY_NAMES_NP = [
  "\u0906\u0907\u0924\u092C\u093E\u0930",
  "\u0938\u094B\u092E\u092C\u093E\u0930",
  "\u092E\u0902\u0917\u0932\u092C\u093E\u0930",
  "\u092C\u0941\u0927\u092C\u093E\u0930",
  "\u092C\u093F\u0939\u093F\u092C\u093E\u0930",
  "\u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930",
  "\u0936\u0928\u093F\u092C\u093E\u0930"
];
var DAY_NAMES_SHORT_NP = [
  "\u0906\u0907\u0924",
  "\u0938\u094B\u092E",
  "\u092E\u0902\u0917\u0932",
  "\u092C\u0941\u0927",
  "\u092C\u093F\u0939\u093F",
  "\u0936\u0941\u0915\u094D\u0930",
  "\u0936\u0928\u093F"
];
var NP_DIGITS = ["\u0966", "\u0967", "\u0968", "\u0969", "\u096A", "\u096B", "\u096C", "\u096D", "\u096E", "\u096F"];
function toNepaliNumeral(n) {
  return String(n).split("").map((c) => NP_DIGITS[parseInt(c)] ?? c).join("");
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function formatDate(token, ctx) {
  let check = token;
  check = check.replace(/YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd/g, "");
  const badToken = check.match(/[A-Z]{2,}|[a-z]{3,}/);
  if (badToken) {
    throw new Error(`Unknown format token '${badToken[0]}'`);
  }
  const monthNamesLong = ctx.locale === "np" ? MONTH_NAMES_NP : MONTH_NAMES_EN;
  const dayNamesLong = ctx.locale === "np" ? DAY_NAMES_NP : DAY_NAMES_EN;
  const dayNamesShort = ctx.locale === "np" ? DAY_NAMES_SHORT_NP : DAY_NAMES_SHORT_EN;
  const np = ctx.locale === "np";
  return token.replace(/YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd/g, (t) => {
    switch (t) {
      case "YYYY":
        return np ? toNepaliNumeral(ctx.year) : String(ctx.year);
      case "YY":
        return np ? toNepaliNumeral(ctx.year % 100) : pad2(ctx.year % 100);
      case "MMMM":
        return monthNamesLong[ctx.month - 1];
      case "MMM":
        return monthNamesLong[ctx.month - 1].slice(0, 3);
      case "MM":
        return np ? toNepaliNumeral(ctx.month).padStart(2, "\u0966") : pad2(ctx.month);
      case "M":
        return np ? toNepaliNumeral(ctx.month) : String(ctx.month);
      case "DD":
        return np ? toNepaliNumeral(ctx.day).padStart(2, "\u0966") : pad2(ctx.day);
      case "D":
        return np ? toNepaliNumeral(ctx.day) : String(ctx.day);
      case "dddd":
        return dayNamesLong[ctx.dayOfWeek];
      case "ddd":
        return dayNamesShort[ctx.dayOfWeek];
      default:
        return t;
    }
  });
}

// src/core/parse.ts
function parseDate(str, format) {
  const regexStr = format.replace(/[-/().\\[\]{}|^$*+?]/g, (c) => `\\${c}`).replace("YYYY", "(?<year>\\d{4})").replace("YY", "(?<year>\\d{2})").replace("MM", "(?<month>\\d{2})").replace("M", "(?<month>\\d{1,2})").replace("DD", "(?<day>\\d{2})").replace("D", "(?<day>\\d{1,2})");
  const regex = new RegExp(`^${regexStr}$`);
  const match = regex.exec(str);
  if (!match || !match.groups) {
    throw new Error(
      `Cannot parse '${str}' as date with format '${format}'`
    );
  }
  const year = parseInt(match.groups["year"] ?? "", 10);
  const month = parseInt(match.groups["month"] ?? "", 10);
  const day = parseInt(match.groups["day"] ?? "", 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Cannot parse string as date: '${str}'`);
  }
  if (year < BS_MIN || year > BS_MAX) {
    throw new RangeError(
      `BS year ${year} not in supported range ${BS_MIN}\u2013${BS_MAX}`
    );
  }
  if (month < 1 || month > 12) {
    throw new RangeError(`BS month must be 1\u201312, got ${month}`);
  }
  if (!isValidBSDate(year, month, day)) {
    throw new RangeError(
      `BS day ${day} is invalid for ${year}/${month}`
    );
  }
  return { year, month, day };
}

// src/core/nepali-date.ts
function assertIntArg(value, name) {
  if (typeof value !== "number") {
    throw new TypeError(`${name} must be a number, got ${typeof value}`);
  }
  if (Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number, got NaN`);
  }
  if (!Number.isInteger(value)) {
    throw new TypeError(`${name} must be an integer, got ${value}`);
  }
}
var NepaliDate = class _NepaliDate {
  /**
   * @param year  - BS year (2082–2090)
   * @param month - BS month (1–12)
   * @param day   - BS day (1–N)
   * @throws {TypeError}  For non-integer inputs
   * @throws {RangeError} For out-of-range values
   */
  constructor(year, month, day) {
    if (year === void 0 || month === void 0 || day === void 0) {
      throw new TypeError("NepaliDate requires year, month, and day arguments");
    }
    assertIntArg(year, "year");
    assertIntArg(month, "month");
    assertIntArg(day, "day");
    if (year < BS_MIN || year > BS_MAX) {
      throw new RangeError(
        `BS year ${year} not in supported range ${BS_MIN}\u2013${BS_MAX}`
      );
    }
    if (month < 1 || month > 12) {
      throw new RangeError(`BS month must be 1\u201312, got ${month}`);
    }
    const maxDay = getDaysInMonth(year, month);
    if (day < 1 || day > maxDay) {
      throw new RangeError(
        `BS day must be 1\u2013${maxDay} for ${year}/${month}, got ${day}`
      );
    }
    this._year = year;
    this._month = month;
    this._day = day;
  }
  // ---------------------------------------------------------------------------
  // Static factories
  // ---------------------------------------------------------------------------
  /**
   * Constructs a NepaliDate from an AD Date object.
   * @throws {TypeError} If date is not a Date
   * @throws {RangeError} If date is outside supported BS range
   */
  static fromAD(date) {
    const { year, month, day } = adToBs(date);
    return new _NepaliDate(year, month, day);
  }
  /**
   * Returns today's date in BS (based on the local system clock).
   */
  static today() {
    return _NepaliDate.fromAD(/* @__PURE__ */ new Date());
  }
  /**
   * Parses a formatted date string into a NepaliDate.
   *
   * @param str    - Formatted date string
   * @param format - Format token (e.g. 'YYYY-MM-DD')
   * @throws {Error}      If the string cannot be parsed
   * @throws {RangeError} If the parsed date is out of range
   *
   * @example
   * NepaliDate.parse('2083-01-15', 'YYYY-MM-DD')
   */
  static parse(str, format) {
    const { year, month, day } = parseDate(str, format);
    return new _NepaliDate(year, month, day);
  }
  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  /** BS year */
  getYear() {
    return this._year;
  }
  /** BS month (1–12) */
  getMonth() {
    return this._month;
  }
  /** BS day (1–N) */
  getDate() {
    return this._day;
  }
  /**
   * Day of week (0=Sunday … 6=Saturday), derived from the AD equivalent.
   */
  getDay() {
    return bsToAd(this._year, this._month, this._day).getDay();
  }
  /** Returns the corresponding AD Date object (midnight local time). */
  toAD() {
    return bsToAd(this._year, this._month, this._day);
  }
  // ---------------------------------------------------------------------------
  // Arithmetic — all return new NepaliDate instances
  // ---------------------------------------------------------------------------
  /**
   * Adds an amount to the date.
   * @param amount - Integer number of units to add
   * @param unit   - 'day' | 'month' | 'year'
   * @returns New NepaliDate
   * @throws {TypeError}  If amount is not an integer
   * @throws {RangeError} If unit is invalid or result is out of supported range
   */
  add(amount, unit) {
    assertIntArg(amount, "amount");
    if (typeof unit !== "string" || !["day", "month", "year"].includes(unit)) {
      throw new RangeError(
        `Invalid unit '${String(unit)}'. Must be 'day', 'month', or 'year'`
      );
    }
    if (unit === "day") {
      return this._addDays(amount);
    } else if (unit === "month") {
      return this._addMonths(amount);
    } else {
      return this._addYears(amount);
    }
  }
  /**
   * Subtracts an amount from the date.
   * @param amount - Integer number of units to subtract
   * @param unit   - 'day' | 'month' | 'year'
   */
  subtract(amount, unit) {
    assertIntArg(amount, "amount");
    return this.add(-amount, unit);
  }
  /**
   * Returns the difference from this date to another, in the given unit.
   * Positive if other is after this; negative if other is before this.
   *
   * @param other - Another NepaliDate
   * @param unit  - 'day' | 'month' | 'year'
   */
  diff(other, unit) {
    if (!(other instanceof _NepaliDate)) {
      throw new TypeError("diff() requires a NepaliDate argument");
    }
    if (unit === "day") {
      const thisAd = this.toAD().getTime();
      const otherAd = other.toAD().getTime();
      return Math.round((otherAd - thisAd) / 864e5);
    } else if (unit === "month") {
      return (other._year - this._year) * 12 + (other._month - this._month);
    } else {
      return other._year - this._year;
    }
  }
  _addDays(days) {
    let year = this._year;
    let month = this._month;
    let day = this._day + days;
    while (day > getDaysInMonth(year, month)) {
      day -= getDaysInMonth(year, month);
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      if (year > BS_MAX) {
        throw new RangeError(`Result year ${year} exceeds maximum supported year ${BS_MAX}`);
      }
    }
    while (day < 1) {
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      if (year < BS_MIN) {
        throw new RangeError(`Result year ${year} is below minimum supported year ${BS_MIN}`);
      }
      day += getDaysInMonth(year, month);
    }
    return new _NepaliDate(year, month, day);
  }
  _addMonths(months) {
    let year = this._year;
    let month = this._month + months;
    while (month > 12) {
      month -= 12;
      year++;
    }
    while (month < 1) {
      month += 12;
      year--;
    }
    if (year > BS_MAX || year < BS_MIN) {
      throw new RangeError(`Result year ${year} is outside supported range ${BS_MIN}\u2013${BS_MAX}`);
    }
    const maxDay = getDaysInMonth(year, month);
    const day = Math.min(this._day, maxDay);
    return new _NepaliDate(year, month, day);
  }
  _addYears(years) {
    const year = this._year + years;
    if (year > BS_MAX || year < BS_MIN) {
      throw new RangeError(`Result year ${year} is outside supported range ${BS_MIN}\u2013${BS_MAX}`);
    }
    const maxDay = getDaysInMonth(year, this._month);
    const day = Math.min(this._day, maxDay);
    return new _NepaliDate(year, this._month, day);
  }
  // ---------------------------------------------------------------------------
  // Comparisons
  // ---------------------------------------------------------------------------
  /** Returns true if this date comes before other. */
  isBefore(other) {
    return this._toOrdinal() < other._toOrdinal();
  }
  /** Returns true if this date comes after other. */
  isAfter(other) {
    return this._toOrdinal() > other._toOrdinal();
  }
  /** Returns true if this date is the same day as other. */
  isSame(other) {
    return this._toOrdinal() === other._toOrdinal();
  }
  _toOrdinal() {
    return this._year * 1e4 + this._month * 100 + this._day;
  }
  // ---------------------------------------------------------------------------
  // Boundary helpers
  // ---------------------------------------------------------------------------
  /** Returns a new NepaliDate at the first day of this month. */
  startOfMonth() {
    return new _NepaliDate(this._year, this._month, 1);
  }
  /** Returns a new NepaliDate at the last day of this month. */
  endOfMonth() {
    return new _NepaliDate(
      this._year,
      this._month,
      getDaysInMonth(this._year, this._month)
    );
  }
  /** Returns a new NepaliDate at Baishakh 1 of this year. */
  startOfYear() {
    return new _NepaliDate(this._year, 1, 1);
  }
  /** Returns a new NepaliDate at Chaitra (last day) of this year. */
  endOfYear() {
    return new _NepaliDate(this._year, 12, getDaysInMonth(this._year, 12));
  }
  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------
  /**
   * Formats the date using a token string.
   * Tokens: YYYY YY MM M DD D MMMM MMM dddd ddd
   *
   * @param token  - Format string (e.g. 'YYYY-MM-DD')
   * @param locale - 'en' (default) or 'np' for Nepali/Devanagari
   * @throws {Error} For unknown format tokens
   *
   * @example
   * d.format('MMMM DD, YYYY', 'np') // 'बैशाख ०१, २०८३'
   */
  format(token, locale = "en") {
    return formatDate(token, {
      year: this._year,
      month: this._month,
      day: this._day,
      dayOfWeek: this.getDay(),
      locale
    });
  }
  toString() {
    return this.format("YYYY-MM-DD");
  }
  toJSON() {
    return this.toString();
  }
  // ---------------------------------------------------------------------------
  // Internal helpers used by picker layer
  // ---------------------------------------------------------------------------
  /** @internal */
  _getDaysInYear() {
    return getDaysInYear(this._year);
  }
};

// src/picker/options.ts
var DEFAULT_OPTIONS = {
  mode: "bs",
  format: "YYYY-MM-DD",
  language: "en",
  useNepaliNumerals: false,
  weekendDays: [0, 6],
  minDate: null,
  maxDate: null,
  disabledDates: [],
  disabledDaysOfWeek: [],
  defaultDate: null,
  closeOnSelect: true,
  theme: "light",
  position: "auto",
  zIndex: 1e3,
  firstDayOfWeek: 0,
  onChange: null,
  onOpen: null,
  onClose: null,
  onMonthChange: null
};
function resolveOptions(partial) {
  const opts = { ...DEFAULT_OPTIONS, ...partial };
  if (!["en", "np"].includes(opts.language)) {
    throw new RangeError(
      `Supported languages: en, np. Got '${opts.language}'`
    );
  }
  if (typeof opts.theme === "string" && !["light", "dark"].includes(opts.theme)) {
    throw new RangeError(`Built-in themes: light, dark. Got '${opts.theme}'`);
  }
  if (typeof opts.theme === "object" && opts.theme !== null) {
    const t = opts.theme;
    if (t.colors !== void 0 && typeof t.colors !== "object") {
      throw new TypeError("theme.colors must be object");
    }
    if (t.colors) {
      for (const [, v] of Object.entries(t.colors)) {
        if (typeof v !== "string") {
          throw new TypeError("color values must be strings");
        }
      }
    }
  }
  if (!["auto", "top", "bottom"].includes(opts.position)) {
    throw new RangeError(
      `position must be 'auto', 'top', or 'bottom'. Got '${opts.position}'`
    );
  }
  if (!Array.isArray(opts.weekendDays)) {
    throw new TypeError("weekendDays must be number array");
  }
  for (const d of opts.weekendDays) {
    if (typeof d !== "number" || d < 0 || d > 6) {
      throw new RangeError(`weekendDays must be 0\u20136, got ${d}`);
    }
  }
  if (typeof opts.firstDayOfWeek !== "number" || opts.firstDayOfWeek < 0 || opts.firstDayOfWeek > 6) {
    throw new RangeError(
      `firstDayOfWeek must be 0\u20136, got ${opts.firstDayOfWeek}`
    );
  }
  for (const key of ["onChange", "onOpen", "onClose", "onMonthChange"]) {
    if (opts[key] !== null && typeof opts[key] !== "function") {
      throw new TypeError(`${key} must be a function`);
    }
  }
  if (opts.minDate && opts.maxDate && opts.minDate.isAfter(opts.maxDate)) {
    throw new RangeError("minDate cannot be after maxDate");
  }
  return opts;
}

// src/picker/instance-registry.ts
var InstanceRegistry = class {
  static {
    this.map = /* @__PURE__ */ new WeakMap();
  }
  static set(el, instance) {
    this.map.set(el, instance);
  }
  static get(el) {
    return this.map.get(el) ?? null;
  }
  static has(el) {
    return this.map.has(el);
  }
  static delete(el) {
    this.map.delete(el);
  }
};

// src/picker/grid.ts
function renderGrid(viewYear, viewMonth, selected, today, opts) {
  const np = opts.language === "np";
  const monthNames = np ? MONTH_NAMES_NP : MONTH_NAMES_EN;
  const dayNamesShort = np ? DAY_NAMES_SHORT_NP : DAY_NAMES_SHORT_EN;
  const popover = _makePopover("Date picker");
  const titleText = `${monthNames[viewMonth - 1]} ${np ? toNepaliNumeral(viewYear) : viewYear}`;
  popover.appendChild(_buildHeader(titleText, "view-months", true, np));
  const grid = document.createElement("div");
  grid.className = "ndp-grid";
  grid.setAttribute("role", "grid");
  const headerRow = document.createElement("div");
  headerRow.className = "ndp-weekdays";
  headerRow.setAttribute("role", "row");
  const orderedDays = [];
  for (let i = 0; i < 7; i++) {
    orderedDays.push((opts.firstDayOfWeek + i) % 7);
  }
  for (const dayIdx of orderedDays) {
    const th = document.createElement("div");
    th.className = "ndp-weekday";
    th.setAttribute("role", "columnheader");
    th.setAttribute("aria-label", DAY_NAMES_SHORT_EN[dayIdx]);
    th.textContent = dayNamesShort[dayIdx];
    headerRow.appendChild(th);
  }
  grid.appendChild(headerRow);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = new NepaliDate(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstDay - opts.firstDayOfWeek + 7) % 7;
  let dayNum = 1;
  let cellRow = _makeRow();
  for (let i = 0; i < startOffset; i++) {
    cellRow.appendChild(_makeEmptyCell());
  }
  let cellCount = startOffset;
  while (dayNum <= daysInMonth) {
    const cellDate = new NepaliDate(viewYear, viewMonth, dayNum);
    const cell = document.createElement("div");
    cell.className = "ndp-cell ndp-day";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("tabindex", "-1");
    cell.setAttribute("data-bs-year", String(viewYear));
    cell.setAttribute("data-bs-month", String(viewMonth));
    cell.setAttribute("data-bs-day", String(dayNum));
    const dayOfWeek = cellDate.getDay();
    const isToday = cellDate.isSame(today);
    const isSelected = selected ? cellDate.isSame(selected) : false;
    const isWeekend = opts.weekendDays.includes(dayOfWeek);
    const isDisabledDow = opts.disabledDaysOfWeek.includes(dayOfWeek);
    const isBeforeMin = opts.minDate ? cellDate.isBefore(opts.minDate) : false;
    const isAfterMax = opts.maxDate ? cellDate.isAfter(opts.maxDate) : false;
    const isDisabledDate = opts.disabledDates.some((d) => d.isSame(cellDate));
    const isDisabled = isDisabledDow || isBeforeMin || isAfterMax || isDisabledDate;
    if (isToday) {
      cell.classList.add("ndp-day--today");
      cell.setAttribute("aria-current", "date");
    }
    if (isSelected) {
      cell.classList.add("ndp-day--selected");
      cell.setAttribute("aria-selected", "true");
    }
    if (isWeekend) {
      cell.classList.add("ndp-day--weekend");
    }
    if (isDisabled) {
      cell.classList.add("ndp-day--disabled");
      cell.setAttribute("aria-disabled", "true");
      cell.removeAttribute("tabindex");
    }
    cell.textContent = opts.useNepaliNumerals ? toNepaliNumeral(dayNum) : String(dayNum);
    cellRow.appendChild(cell);
    cellCount++;
    if (cellCount % 7 === 0) {
      grid.appendChild(cellRow);
      cellRow = _makeRow();
    }
    dayNum++;
  }
  if (cellCount % 7 !== 0) {
    const remaining = 7 - cellCount % 7;
    for (let i = 0; i < remaining; i++) {
      cellRow.appendChild(_makeEmptyCell());
    }
    grid.appendChild(cellRow);
  }
  popover.appendChild(grid);
  popover.appendChild(_buildFooter(np));
  return popover;
}
function renderMonthGrid(viewYear, selectedMonth, opts) {
  const np = opts.language === "np";
  const monthNames = np ? MONTH_NAMES_NP : MONTH_NAMES_EN;
  const popover = _makePopover("Month picker");
  popover.appendChild(_buildHeader(
    np ? toNepaliNumeral(viewYear) : String(viewYear),
    "view-years",
    true,
    np
  ));
  const grid = document.createElement("div");
  grid.className = "ndp-month-grid";
  for (let m = 1; m <= 12; m++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ndp-month-cell" + (m === selectedMonth ? " ndp-month-cell--selected" : "");
    btn.textContent = monthNames[m - 1];
    btn.setAttribute("data-action", "select-month");
    btn.setAttribute("data-month", String(m));
    grid.appendChild(btn);
  }
  popover.appendChild(grid);
  return popover;
}
function renderYearGrid(selectedYear, opts) {
  const np = opts.language === "np";
  const rangeLabel = np ? `${toNepaliNumeral(BS_MIN)}\u2013${toNepaliNumeral(BS_MAX)}` : `${BS_MIN}\u2013${BS_MAX}`;
  const popover = _makePopover("Year picker");
  popover.appendChild(_buildHeader(rangeLabel, null, false, np));
  const grid = document.createElement("div");
  grid.className = "ndp-year-grid";
  for (let y = BS_MIN; y <= BS_MAX; y++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ndp-year-cell" + (y === selectedYear ? " ndp-year-cell--selected" : "");
    btn.textContent = np ? toNepaliNumeral(y) : String(y);
    btn.setAttribute("data-action", "select-year");
    btn.setAttribute("data-year", String(y));
    grid.appendChild(btn);
  }
  popover.appendChild(grid);
  return popover;
}
function _makePopover(label) {
  const el = document.createElement("div");
  el.className = "ndp-popover";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "false");
  el.setAttribute("aria-label", label);
  return el;
}
function _buildHeader(titleText, titleAction, showNavBtns, np) {
  const header = document.createElement("div");
  header.className = "ndp-header";
  if (showNavBtns) {
    const prev = document.createElement("button");
    prev.className = "ndp-nav-btn ndp-prev";
    prev.type = "button";
    prev.setAttribute("aria-label", np ? "\u0905\u0918\u093F\u0932\u094D\u0932\u094B" : "Previous");
    prev.setAttribute("data-action", "prev");
    prev.innerHTML = "&#8249;";
    header.appendChild(prev);
  }
  const title = document.createElement("div");
  title.className = "ndp-title" + (titleAction ? " ndp-title--clickable" : "");
  title.setAttribute("aria-live", "polite");
  if (titleAction)
    title.setAttribute("data-action", titleAction);
  title.textContent = titleText;
  header.appendChild(title);
  if (showNavBtns) {
    const next = document.createElement("button");
    next.className = "ndp-nav-btn ndp-next";
    next.type = "button";
    next.setAttribute("aria-label", np ? "\u0905\u0930\u094D\u0915\u094B" : "Next");
    next.setAttribute("data-action", "next");
    next.innerHTML = "&#8250;";
    header.appendChild(next);
  }
  return header;
}
function _buildFooter(np) {
  const footer = document.createElement("div");
  footer.className = "ndp-footer";
  const todayBtn = document.createElement("button");
  todayBtn.type = "button";
  todayBtn.className = "ndp-footer-btn ndp-today-btn";
  todayBtn.textContent = np ? "\u0906\u091C" : "Today";
  todayBtn.setAttribute("data-action", "today");
  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "ndp-footer-btn ndp-clear-btn";
  clearBtn.textContent = np ? "\u0939\u091F\u093E\u0909\u0928\u0941\u0938\u094D" : "Clear";
  clearBtn.setAttribute("data-action", "clear");
  footer.appendChild(todayBtn);
  footer.appendChild(clearBtn);
  return footer;
}
function _makeRow() {
  const row = document.createElement("div");
  row.className = "ndp-row";
  row.setAttribute("role", "row");
  return row;
}
function _makeEmptyCell() {
  const cell = document.createElement("div");
  cell.className = "ndp-cell ndp-cell--empty";
  cell.setAttribute("role", "gridcell");
  cell.setAttribute("aria-disabled", "true");
  return cell;
}
function getCellDate(cell) {
  const y = cell.getAttribute("data-bs-year");
  const m = cell.getAttribute("data-bs-month");
  const d = cell.getAttribute("data-bs-day");
  if (!y || !m || !d)
    return null;
  try {
    return new NepaliDate(parseInt(y, 10), parseInt(m, 10), parseInt(d, 10));
  } catch {
    return null;
  }
}

// src/picker/popover.ts
function positionPopover(popover, input, position) {
  const inputRect = input.getBoundingClientRect();
  const popoverHeight = popover.offsetHeight || 320;
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  let top;
  let shouldBeAbove = false;
  if (position === "top") {
    shouldBeAbove = true;
  } else if (position === "bottom") {
    shouldBeAbove = false;
  } else {
    const spaceBelow = viewportHeight - inputRect.bottom;
    shouldBeAbove = spaceBelow < popoverHeight + 8 && inputRect.top > popoverHeight + 8;
  }
  if (shouldBeAbove) {
    top = scrollY + inputRect.top - popoverHeight - 4;
  } else {
    top = scrollY + inputRect.bottom + 4;
  }
  const left = Math.max(
    8,
    Math.min(
      scrollX + inputRect.left,
      scrollX + window.innerWidth - (popover.offsetWidth || 280) - 8
    )
  );
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}

// src/picker/theme.ts
var LIGHT_VARS = {
  "--ndp-bg": "#ffffff",
  "--ndp-bg-secondary": "#f9fafb",
  "--ndp-border": "#e5e7eb",
  "--ndp-text": "#111827",
  "--ndp-text-muted": "#6b7280",
  "--ndp-primary": "#3b82f6",
  "--ndp-primary-text": "#ffffff",
  "--ndp-today-bg": "#eff6ff",
  "--ndp-today-text": "#1d4ed8",
  "--ndp-hover-bg": "#f3f4f6",
  "--ndp-selected-bg": "#3b82f6",
  "--ndp-selected-text": "#ffffff",
  "--ndp-weekend-text": "#ef4444",
  "--ndp-disabled-text": "#d1d5db",
  "--ndp-range-bg": "#dbeafe",
  "--ndp-range-text": "#1d4ed8",
  "--ndp-header-bg": "#ffffff",
  "--ndp-shadow": "0 4px 24px rgba(0,0,0,0.12)",
  "--ndp-radius": "10px",
  "--ndp-cell-radius": "6px",
  "--ndp-font-family": "system-ui, -apple-system, sans-serif",
  "--ndp-font-size": "14px"
};
var DARK_VARS = {
  "--ndp-bg": "#1f2937",
  "--ndp-bg-secondary": "#111827",
  "--ndp-border": "#374151",
  "--ndp-text": "#f9fafb",
  "--ndp-text-muted": "#9ca3af",
  "--ndp-primary": "#60a5fa",
  "--ndp-primary-text": "#1e3a5f",
  "--ndp-today-bg": "#1e3a5f",
  "--ndp-today-text": "#93c5fd",
  "--ndp-hover-bg": "#374151",
  "--ndp-selected-bg": "#60a5fa",
  "--ndp-selected-text": "#111827",
  "--ndp-weekend-text": "#f87171",
  "--ndp-disabled-text": "#4b5563",
  "--ndp-range-bg": "#1e3a5f",
  "--ndp-range-text": "#93c5fd",
  "--ndp-header-bg": "#1f2937",
  "--ndp-shadow": "0 4px 24px rgba(0,0,0,0.5)",
  "--ndp-radius": "10px",
  "--ndp-cell-radius": "6px",
  "--ndp-font-family": "system-ui, -apple-system, sans-serif",
  "--ndp-font-size": "14px"
};
function applyTheme(el, theme) {
  const base = theme === "dark" ? DARK_VARS : LIGHT_VARS;
  for (const [key, value] of Object.entries(base)) {
    el.style.setProperty(key, value);
  }
  if (typeof theme === "object" && theme !== null) {
    const t = theme;
    if (t.colors) {
      for (const [key, value] of Object.entries(t.colors)) {
        el.style.setProperty(`--ndp-${key}`, value);
      }
    }
    if (t.fonts) {
      for (const [key, value] of Object.entries(t.fonts)) {
        el.style.setProperty(`--ndp-${key}`, value);
      }
    }
    if (t.spacing) {
      for (const [key, value] of Object.entries(t.spacing)) {
        el.style.setProperty(`--ndp-${key}`, value);
      }
    }
  }
}

// src/picker/keyboard.ts
function handleGridKeydown(e, focused, minDate, maxDate) {
  let next = null;
  let select = false;
  let close = false;
  switch (e.key) {
    case "ArrowRight":
      next = safeAdd(focused, 1, "day");
      break;
    case "ArrowLeft":
      next = safeAdd(focused, -1, "day");
      break;
    case "ArrowDown":
      next = safeAdd(focused, 7, "day");
      break;
    case "ArrowUp":
      next = safeAdd(focused, -7, "day");
      break;
    case "PageDown":
      next = e.shiftKey ? safeAdd(focused, 1, "year") : safeAdd(focused, 1, "month");
      break;
    case "PageUp":
      next = e.shiftKey ? safeAdd(focused, -1, "year") : safeAdd(focused, -1, "month");
      break;
    case "Home":
      next = safeAdd(focused, -focused.getDay(), "day");
      break;
    case "End":
      next = safeAdd(focused, 6 - focused.getDay(), "day");
      break;
    case "Enter":
    case " ":
      select = true;
      next = focused;
      break;
    case "Escape":
      close = true;
      next = focused;
      break;
    default:
      return null;
  }
  if (!next)
    return null;
  if (minDate && next.isBefore(minDate))
    next = minDate;
  if (maxDate && next.isAfter(maxDate))
    next = maxDate;
  return { date: next, select, close };
}
function safeAdd(date, amount, unit) {
  try {
    const result = date.add(amount, unit);
    if (result.getYear() < BS_MIN || result.getYear() > BS_MAX)
      return date;
    return result;
  } catch {
    return date;
  }
}

// src/picker/picker-class.ts
var DetachedError = class extends Error {
  constructor() {
    super("Picker has been detached");
  }
};
var Picker = class {
  constructor(input, opts) {
    this._value = null;
    this._popover = null;
    this._focused = null;
    this._viewMode = "days";
    this._detached = false;
    this._input = input;
    this._opts = opts;
    this._today = NepaliDate.today();
    const start = opts.defaultDate ?? this._today;
    this._viewYear = start.getYear();
    this._viewMonth = start.getMonth();
    this._onInputClick = () => this.toggle();
    this._onDocClick = (e) => {
      if (this._popover && !this._popover.contains(e.target) && e.target !== this._input) {
        this.close();
      }
    };
    this._onKeydown = (e) => this._handleKey(e);
    this._onScroll = () => {
      if (this._popover)
        positionPopover(this._popover, this._input, this._opts.position);
    };
    this._onResize = () => {
      if (this._popover)
        positionPopover(this._popover, this._input, this._opts.position);
    };
    this._input.addEventListener("click", this._onInputClick);
    document.addEventListener("click", this._onDocClick, true);
    document.addEventListener("keydown", this._onKeydown);
    window.addEventListener("scroll", this._onScroll, { passive: true });
    window.addEventListener("resize", this._onResize, { passive: true });
    this._input.setAttribute("readonly", "");
    this._input.setAttribute("autocomplete", "off");
    this._input.style.cursor = "pointer";
  }
  open() {
    this._assertNotDetached();
    if (this._popover)
      return;
    this._today = NepaliDate.today();
    this._viewMode = "days";
    const inputVal = this._input.value;
    if (inputVal && !this._value) {
      try {
        this._value = NepaliDate.parse(inputVal, this._opts.format);
        this._viewYear = this._value.getYear();
        this._viewMonth = this._value.getMonth();
      } catch {
      }
    }
    this._render();
    this._opts.onOpen?.();
    document.querySelectorAll(".ndp-popover").forEach((p) => {
      if (p !== this._popover)
        p.remove();
    });
  }
  close() {
    if (!this._popover)
      return;
    this._popover.remove();
    this._popover = null;
    this._input.focus();
    this._opts.onClose?.();
  }
  toggle() {
    this._assertNotDetached();
    if (this._popover)
      this.close();
    else
      this.open();
  }
  getValue() {
    this._assertNotDetached();
    return this._value;
  }
  setValue(date) {
    this._assertNotDetached();
    if (date !== null && !(date instanceof NepaliDate)) {
      throw new TypeError("setValue requires a NepaliDate or null");
    }
    this._value = date;
    this._syncInputValue();
    if (date) {
      this._viewYear = date.getYear();
      this._viewMonth = date.getMonth();
    }
    if (this._popover)
      this._render();
  }
  clear() {
    this._assertNotDetached();
    this._value = null;
    this._input.value = "";
    this._opts.onChange?.(null);
  }
  setOptions(partial) {
    this._assertNotDetached();
    this._opts = resolveOptions({ ...this._opts, ...partial });
    if (this._popover)
      this._render();
  }
  refresh() {
    this._assertNotDetached();
    if (this._popover)
      this._render();
  }
  detach() {
    if (this._detached)
      return;
    this._detached = true;
    this.close();
    this._input.removeEventListener("click", this._onInputClick);
    document.removeEventListener("click", this._onDocClick, true);
    document.removeEventListener("keydown", this._onKeydown);
    window.removeEventListener("scroll", this._onScroll);
    window.removeEventListener("resize", this._onResize);
    this._input.removeAttribute("readonly");
    this._input.style.cursor = "";
    InstanceRegistry.delete(this._input);
  }
  destroy() {
    this.detach();
  }
  _render() {
    const existing = this._popover;
    let popover;
    if (this._viewMode === "months") {
      popover = renderMonthGrid(this._viewYear, this._viewMonth, this._opts);
    } else if (this._viewMode === "years") {
      popover = renderYearGrid(this._viewYear, this._opts);
    } else {
      popover = renderGrid(
        this._viewYear,
        this._viewMonth,
        this._value,
        this._today,
        this._opts
      );
    }
    popover.style.position = "absolute";
    popover.style.zIndex = String(this._opts.zIndex);
    applyTheme(popover, this._opts.theme);
    this._wirePopoverEvents(popover);
    if (existing) {
      existing.replaceWith(popover);
    } else {
      document.body.appendChild(popover);
    }
    this._popover = popover;
    positionPopover(popover, this._input, this._opts.position);
    if (this._viewMode === "days") {
      const focused = this._value ?? this._today;
      this._focusCell(focused);
    }
  }
  _wirePopoverEvents(popover) {
    popover.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = e.target;
      const actionEl = target.closest("[data-action]");
      const action = actionEl?.getAttribute("data-action");
      switch (action) {
        case "prev":
          this._navigate(-1);
          break;
        case "next":
          this._navigate(1);
          break;
        case "view-months":
          this._viewMode = "months";
          this._render();
          break;
        case "view-years":
          this._viewMode = "years";
          this._render();
          break;
        case "select-month": {
          const m = parseInt(actionEl.getAttribute("data-month") ?? "1", 10);
          this._viewMonth = m;
          this._viewMode = "days";
          this._render();
          break;
        }
        case "select-year": {
          const y = parseInt(actionEl.getAttribute("data-year") ?? String(BS_MIN), 10);
          this._viewYear = y;
          this._viewMode = "months";
          this._render();
          break;
        }
        case "today": {
          this._viewMode = "days";
          this._viewYear = this._today.getYear();
          this._viewMonth = this._today.getMonth();
          if (!this._isDisabled(this._today)) {
            this._select(this._today);
          } else {
            this._render();
          }
          break;
        }
        case "clear":
          this.clear();
          this.close();
          break;
        default: {
          const cell = target.closest(".ndp-day");
          if (!cell)
            return;
          if (cell.getAttribute("aria-disabled") === "true")
            return;
          const date = getCellDate(cell);
          if (!date)
            return;
          this._select(date);
        }
      }
    });
    popover.addEventListener("mouseenter", (e) => {
      const cell = e.target.closest(".ndp-day:not([aria-disabled])");
      if (cell)
        cell.focus();
    }, true);
  }
  _navigate(direction) {
    if (this._viewMode === "months") {
      this._viewYear = Math.max(BS_MIN, Math.min(BS_MAX, this._viewYear + direction));
    } else {
      this._viewMonth += direction;
      if (this._viewMonth > 12) {
        this._viewMonth = 1;
        this._viewYear++;
      }
      if (this._viewMonth < 1) {
        this._viewMonth = 12;
        this._viewYear--;
      }
      this._opts.onMonthChange?.(this._viewYear, this._viewMonth);
    }
    this._render();
  }
  _select(date) {
    this._value = date;
    this._syncInputValue();
    this._opts.onChange?.(date);
    if (this._opts.closeOnSelect)
      this.close();
    else
      this._render();
  }
  _syncInputValue() {
    if (!this._value)
      return;
    if (this._opts.mode === "ad") {
      const ad = this._value.toAD();
      const y = ad.getFullYear();
      const m = String(ad.getMonth() + 1).padStart(2, "0");
      const d = String(ad.getDate()).padStart(2, "0");
      this._input.value = `${y}-${m}-${d}`;
    } else {
      this._input.value = this._value.format(
        this._opts.format,
        this._opts.language
      );
    }
  }
  _handleKey(e) {
    if (!this._popover) {
      if (e.key === "Enter" || e.key === " ") {
        if (document.activeElement === this._input) {
          e.preventDefault();
          this.open();
        }
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      this.close();
      return;
    }
    if (this._viewMode !== "days")
      return;
    const current = this._focused ?? this._value ?? this._today;
    const result = handleGridKeydown(e, current, this._opts.minDate, this._opts.maxDate);
    if (!result)
      return;
    e.preventDefault();
    this._focused = result.date;
    if (result.close) {
      this.close();
      return;
    }
    if (result.select) {
      if (!this._isDisabled(result.date)) {
        this._select(result.date);
        return;
      }
    }
    if (result.date.getYear() !== this._viewYear || result.date.getMonth() !== this._viewMonth) {
      this._viewYear = result.date.getYear();
      this._viewMonth = result.date.getMonth();
      this._render();
    } else {
      this._focusCell(result.date);
    }
  }
  _focusCell(date) {
    if (!this._popover)
      return;
    const cell = this._popover.querySelector(
      `[data-bs-year="${date.getYear()}"][data-bs-month="${date.getMonth()}"][data-bs-day="${date.getDate()}"]`
    );
    cell?.focus();
  }
  _isDisabled(date) {
    const dayOfWeek = date.getDay();
    if (this._opts.disabledDaysOfWeek.includes(dayOfWeek))
      return true;
    if (this._opts.minDate && date.isBefore(this._opts.minDate))
      return true;
    if (this._opts.maxDate && date.isAfter(this._opts.maxDate))
      return true;
    if (this._opts.disabledDates.some((d) => d.isSame(date)))
      return true;
    return false;
  }
  _assertNotDetached() {
    if (this._detached)
      throw new DetachedError();
  }
};

// src/picker/inline.ts
var INLINE_DEFAULTS = {
  months: 1,
  language: "en",
  useNepaliNumerals: false,
  weekendDays: [0, 6],
  firstDayOfWeek: 0,
  minDate: null,
  maxDate: null,
  disabledDates: [],
  disabledDaysOfWeek: [],
  showAdDate: true,
  theme: "light",
  selectionMode: "single",
  rangeLength: null,
  onChange: null,
  onRangeChange: null,
  onMonthChange: null
};
var AD_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var InlineCalendar = class {
  constructor(container, opts = {}) {
    this._value = null;
    this._rangeStart = null;
    this._rangeEnd = null;
    this._hoverDate = null;
    this._viewMode = "days";
    this._inner = null;
    if (!(container instanceof HTMLElement)) {
      throw new TypeError("InlineCalendar: container must be an HTMLElement");
    }
    this._container = container;
    this._opts = { ...INLINE_DEFAULTS, ...opts };
    this._today = NepaliDate.today();
    this._viewYear = this._today.getYear();
    this._viewMonth = this._today.getMonth();
    this._yearGridStart = this._snapYearGrid(this._viewYear);
    this._render();
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  /** Returns the currently selected date (single mode), or the range start (range mode). */
  getValue() {
    return this._value;
  }
  /**
   * Returns the current range selection {start, end}.
   * Both are null when nothing is selected.
   */
  getRange() {
    return { start: this._rangeStart, end: this._rangeEnd };
  }
  /**
   * Sets the selected date (single mode) and re-renders. Pass null to clear.
   * @throws {TypeError} if the value is not a NepaliDate or null.
   */
  setValue(date) {
    if (date !== null && !(date instanceof NepaliDate)) {
      throw new TypeError("setValue requires a NepaliDate or null");
    }
    this._value = date;
    this._rangeStart = null;
    this._rangeEnd = null;
    if (date) {
      this._viewYear = date.getYear();
      this._viewMonth = date.getMonth();
    }
    this._render();
  }
  /**
   * Sets the range selection programmatically and re-renders.
   * @throws {TypeError} if arguments are not NepaliDate or null.
   */
  setRange(start, end) {
    if (start !== null && !(start instanceof NepaliDate)) {
      throw new TypeError("setRange: start must be a NepaliDate or null");
    }
    if (end !== null && !(end instanceof NepaliDate)) {
      throw new TypeError("setRange: end must be a NepaliDate or null");
    }
    this._rangeStart = start;
    this._rangeEnd = end;
    this._value = start;
    if (start) {
      this._viewYear = start.getYear();
      this._viewMonth = start.getMonth();
    }
    this._render();
  }
  /** Merges partial options and re-renders. */
  setOptions(partial) {
    this._opts = { ...this._opts, ...partial };
    this._render();
  }
  /** Removes the calendar from the DOM. */
  destroy() {
    if (this._inner) {
      this._inner.remove();
      this._inner = null;
    }
  }
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  _render() {
    this._today = NepaliDate.today();
    const el = this._buildCalendar();
    if (this._inner) {
      this._inner.replaceWith(el);
    } else {
      this._container.appendChild(el);
    }
    this._inner = el;
    this._wireEvents(el);
  }
  _buildCalendar() {
    const isDual = this._opts.months === 2;
    const root = document.createElement("div");
    root.className = "ndp-inline" + (isDual ? " ndp-inline--dual" : "");
    root.setAttribute("role", "application");
    root.setAttribute("aria-label", "Nepali date picker");
    applyTheme(root, this._opts.theme);
    root.appendChild(this._buildNav());
    if (this._viewMode === "months") {
      root.appendChild(this._buildMonthPicker());
    } else if (this._viewMode === "years") {
      root.appendChild(this._buildYearPicker());
    } else {
      const body = document.createElement("div");
      body.className = "ndp-inline-body";
      body.appendChild(this._buildMonth(this._viewYear, this._viewMonth));
      if (isDual) {
        const [ny, nm] = this._nextMonth(this._viewYear, this._viewMonth);
        body.appendChild(this._buildMonth(ny, nm));
      }
      root.appendChild(body);
    }
    return root;
  }
  _buildNav() {
    const { language, useNepaliNumerals, months } = this._opts;
    const np = language === "np";
    const monthNames = np ? MONTH_NAMES_NP : MONTH_NAMES_EN;
    const nav = document.createElement("div");
    nav.className = "ndp-inline-nav";
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "ndp-inline-nav-btn";
    prevBtn.setAttribute("data-action", "prev");
    prevBtn.setAttribute("aria-label", np ? "\u0905\u0918\u093F\u0932\u094D\u0932\u094B" : "Previous");
    prevBtn.innerHTML = "&#8249;";
    const titles = document.createElement("div");
    titles.className = "ndp-inline-nav-titles";
    if (this._viewMode === "months") {
      const yearSpan = document.createElement("span");
      yearSpan.className = "ndp-inline-nav-title ndp-inline-nav-title--clickable";
      yearSpan.setAttribute("data-action", "view-years");
      yearSpan.setAttribute("aria-label", np ? "\u0935\u0930\u094D\u0937 \u091B\u093E\u0928\u094D\u0928\u0941\u0939\u094B\u0938\u094D" : "Select year");
      const yr = useNepaliNumerals ? toNepaliNumeral(this._viewYear) : String(this._viewYear);
      yearSpan.textContent = yr;
      titles.appendChild(yearSpan);
    } else if (this._viewMode === "years") {
      const rangeSpan = document.createElement("span");
      rangeSpan.className = "ndp-inline-nav-title";
      const endY = Math.min(this._yearGridStart + 8, BS_MAX);
      const s = useNepaliNumerals ? toNepaliNumeral(this._yearGridStart) : String(this._yearGridStart);
      const e = useNepaliNumerals ? toNepaliNumeral(endY) : String(endY);
      rangeSpan.textContent = `${s} \u2013 ${e}`;
      titles.appendChild(rangeSpan);
    } else {
      const makeTitle = (year, month) => {
        const span = document.createElement("span");
        span.className = "ndp-inline-nav-title ndp-inline-nav-title--clickable";
        span.setAttribute("data-action", "view-months");
        span.setAttribute("aria-label", np ? "\u092E\u0939\u093F\u0928\u093E \u0930 \u0935\u0930\u094D\u0937 \u091B\u093E\u0928\u094D\u0928\u0941\u0939\u094B\u0938\u094D" : "Select month and year");
        const yr = useNepaliNumerals ? toNepaliNumeral(year) : String(year);
        span.textContent = `${monthNames[month - 1]} ${yr}`;
        return span;
      };
      titles.appendChild(makeTitle(this._viewYear, this._viewMonth));
      if (months === 2) {
        const [ny, nm] = this._nextMonth(this._viewYear, this._viewMonth);
        titles.appendChild(makeTitle(ny, nm));
      }
    }
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "ndp-inline-nav-btn";
    nextBtn.setAttribute("data-action", "next");
    nextBtn.setAttribute("aria-label", np ? "\u0905\u0930\u094D\u0915\u094B" : "Next");
    nextBtn.innerHTML = "&#8250;";
    nav.appendChild(prevBtn);
    nav.appendChild(titles);
    nav.appendChild(nextBtn);
    return nav;
  }
  /** Renders the 12-month grid overlay (replaces the calendar body). */
  _buildMonthPicker() {
    const { language } = this._opts;
    const np = language === "np";
    const monthNames = np ? MONTH_NAMES_NP : MONTH_NAMES_EN;
    const wrap = document.createElement("div");
    wrap.className = "ndp-inline-picker-overlay";
    const grid = document.createElement("div");
    grid.className = "ndp-month-grid";
    for (let m = 1; m <= 12; m++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ndp-month-cell";
      if (m === this._viewMonth)
        btn.classList.add("ndp-month-cell--selected");
      btn.setAttribute("data-action", "select-month");
      btn.setAttribute("data-month", String(m));
      btn.textContent = monthNames[m - 1];
      grid.appendChild(btn);
    }
    wrap.appendChild(grid);
    return wrap;
  }
  /** Renders the year-grid overlay (replaces the calendar body). */
  _buildYearPicker() {
    const wrap = document.createElement("div");
    wrap.className = "ndp-inline-picker-overlay";
    const grid = document.createElement("div");
    grid.className = "ndp-year-grid";
    const endYear = Math.min(this._yearGridStart + 8, BS_MAX);
    for (let y = this._yearGridStart; y <= endYear; y++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ndp-year-cell";
      if (y === this._viewYear)
        btn.classList.add("ndp-year-cell--selected");
      btn.setAttribute("data-action", "select-year");
      btn.setAttribute("data-year", String(y));
      btn.textContent = String(y);
      grid.appendChild(btn);
    }
    wrap.appendChild(grid);
    return wrap;
  }
  _buildMonth(year, month) {
    const {
      language,
      useNepaliNumerals,
      weekendDays,
      firstDayOfWeek,
      disabledDaysOfWeek,
      disabledDates,
      minDate,
      maxDate,
      showAdDate
    } = this._opts;
    const np = language === "np";
    const dayNamesShort = np ? DAY_NAMES_SHORT_NP : DAY_NAMES_SHORT_EN;
    const { displayStart, displayEnd } = this._getDisplayRange();
    const panel = document.createElement("div");
    panel.className = "ndp-inline-month";
    const weekdaysRow = document.createElement("div");
    weekdaysRow.className = "ndp-inline-weekdays";
    weekdaysRow.setAttribute("role", "row");
    const orderedDays = [];
    for (let i = 0; i < 7; i++) {
      orderedDays.push((firstDayOfWeek + i) % 7);
    }
    for (const idx of orderedDays) {
      const th = document.createElement("div");
      th.className = "ndp-inline-weekday";
      th.setAttribute("role", "columnheader");
      th.setAttribute("aria-label", DAY_NAMES_SHORT_EN[idx]);
      th.textContent = dayNamesShort[idx];
      weekdaysRow.appendChild(th);
    }
    panel.appendChild(weekdaysRow);
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new NepaliDate(year, month, 1).getDay();
    const startOffset = (firstDay - firstDayOfWeek + 7) % 7;
    let dayNum = 1;
    let cellRow = this._makeRow();
    let cellCount = 0;
    for (let i = 0; i < startOffset; i++) {
      cellRow.appendChild(this._makeEmptyCell());
      cellCount++;
    }
    while (dayNum <= daysInMonth) {
      const cellDate = new NepaliDate(year, month, dayNum);
      const adDate = cellDate.toAD();
      const dayOfWeek = cellDate.getDay();
      const isToday = cellDate.isSame(this._today);
      const isWeekend = weekendDays.includes(dayOfWeek);
      const isDisabledDow = disabledDaysOfWeek.includes(dayOfWeek);
      const isBeforeMin = minDate ? cellDate.isBefore(minDate) : false;
      const isAfterMax = maxDate ? cellDate.isAfter(maxDate) : false;
      const isDisabledDate = disabledDates.some((d) => d.isSame(cellDate));
      const isDisabled = isDisabledDow || isBeforeMin || isAfterMax || isDisabledDate;
      const isSelected = this._opts.selectionMode === "single" && this._value ? cellDate.isSame(this._value) : false;
      const isRangeStart = displayStart ? cellDate.isSame(displayStart) : false;
      const isRangeEnd = displayEnd ? cellDate.isSame(displayEnd) : false;
      const isInRange = displayStart && displayEnd ? !cellDate.isBefore(displayStart) && !cellDate.isAfter(displayEnd) : false;
      const isSingleDayRange = isRangeStart && isRangeEnd;
      const cell = document.createElement("div");
      cell.className = "ndp-inline-cell";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("data-bs-year", String(year));
      cell.setAttribute("data-bs-month", String(month));
      cell.setAttribute("data-bs-day", String(dayNum));
      if (isToday)
        cell.classList.add("ndp-inline-cell--today");
      if (isSelected)
        cell.classList.add("ndp-inline-cell--selected");
      if (isWeekend)
        cell.classList.add("ndp-inline-cell--weekend");
      if (isSingleDayRange) {
        cell.classList.add("ndp-inline-cell--range-start");
        cell.classList.add("ndp-inline-cell--range-end");
      } else {
        if (isRangeStart)
          cell.classList.add("ndp-inline-cell--range-start");
        if (isRangeEnd)
          cell.classList.add("ndp-inline-cell--range-end");
      }
      if (isInRange && !isRangeStart && !isRangeEnd) {
        cell.classList.add("ndp-inline-cell--in-range");
      }
      if (isDisabled) {
        cell.classList.add("ndp-inline-cell--disabled");
        cell.setAttribute("aria-disabled", "true");
      } else {
        cell.setAttribute("tabindex", "-1");
      }
      if (isSelected || isRangeStart)
        cell.setAttribute("aria-selected", "true");
      if (isToday)
        cell.setAttribute("aria-current", "date");
      const bsSpan = document.createElement("span");
      bsSpan.className = "ndp-inline-bs";
      bsSpan.textContent = useNepaliNumerals ? toNepaliNumeral(dayNum) : String(dayNum);
      cell.appendChild(bsSpan);
      if (showAdDate) {
        const adSpan = document.createElement("span");
        adSpan.className = "ndp-inline-ad";
        adSpan.textContent = `${AD_MONTHS_SHORT[adDate.getMonth()]} ${adDate.getDate()}`;
        cell.appendChild(adSpan);
      }
      cellRow.appendChild(cell);
      cellCount++;
      if (cellCount % 7 === 0) {
        panel.appendChild(cellRow);
        cellRow = this._makeRow();
      }
      dayNum++;
    }
    if (cellCount % 7 !== 0) {
      const remaining = 7 - cellCount % 7;
      for (let i = 0; i < remaining; i++) {
        cellRow.appendChild(this._makeEmptyCell());
      }
      panel.appendChild(cellRow);
    }
    return panel;
  }
  // ---------------------------------------------------------------------------
  // Event wiring
  // ---------------------------------------------------------------------------
  _wireEvents(el) {
    el.addEventListener("click", (e) => {
      const target = e.target;
      const actionEl = target.closest("[data-action]");
      const action = actionEl?.getAttribute("data-action");
      if (action === "prev") {
        this._navigate(-1);
        return;
      }
      if (action === "next") {
        this._navigate(1);
        return;
      }
      if (action === "view-months") {
        this._viewMode = "months";
        this._render();
        return;
      }
      if (action === "view-years") {
        this._viewMode = "years";
        this._render();
        return;
      }
      if (action === "select-month") {
        const m2 = parseInt(actionEl.getAttribute("data-month") ?? "1", 10);
        this._viewMonth = m2;
        this._viewMode = "days";
        this._render();
        return;
      }
      if (action === "select-year") {
        const y2 = parseInt(actionEl.getAttribute("data-year") ?? String(this._viewYear), 10);
        this._viewYear = y2;
        this._viewMode = "months";
        this._render();
        return;
      }
      const cell = target.closest(
        ".ndp-inline-cell:not(.ndp-inline-cell--empty):not(.ndp-inline-cell--disabled)"
      );
      if (!cell)
        return;
      const y = cell.getAttribute("data-bs-year");
      const m = cell.getAttribute("data-bs-month");
      const d = cell.getAttribute("data-bs-day");
      if (!y || !m || !d)
        return;
      try {
        const date = new NepaliDate(parseInt(y, 10), parseInt(m, 10), parseInt(d, 10));
        this._handleCellClick(date);
      } catch {
      }
    });
    if (this._opts.selectionMode === "range" && this._opts.rangeLength === null) {
      el.addEventListener("mouseover", (e) => {
        if (!this._rangeStart || this._rangeEnd)
          return;
        const cell = e.target.closest(
          ".ndp-inline-cell:not(.ndp-inline-cell--empty):not(.ndp-inline-cell--disabled)"
        );
        if (!cell)
          return;
        const y = cell.getAttribute("data-bs-year");
        const m = cell.getAttribute("data-bs-month");
        const d = cell.getAttribute("data-bs-day");
        if (!y || !m || !d)
          return;
        try {
          const hovered = new NepaliDate(parseInt(y, 10), parseInt(m, 10), parseInt(d, 10));
          if (this._hoverDate && hovered.isSame(this._hoverDate))
            return;
          this._hoverDate = hovered;
          this._updateRangeHighlight(el);
        } catch {
        }
      });
      el.addEventListener("mouseleave", () => {
        if (!this._rangeStart || this._rangeEnd)
          return;
        this._hoverDate = null;
        this._updateRangeHighlight(el);
      });
    }
  }
  _handleCellClick(date) {
    if (this._opts.selectionMode === "single") {
      this._value = date;
      this._opts.onChange?.(date);
      this._render();
      return;
    }
    if (this._opts.rangeLength !== null) {
      let rangeEnd;
      try {
        rangeEnd = date.add(this._opts.rangeLength - 1, "day");
      } catch {
        rangeEnd = new NepaliDate(BS_MAX, 12, getDaysInMonth(BS_MAX, 12));
      }
      this._rangeStart = date;
      this._rangeEnd = rangeEnd;
      this._value = date;
      this._opts.onRangeChange?.(date, rangeEnd);
      this._render();
    } else {
      if (!this._rangeStart || this._rangeStart && this._rangeEnd) {
        this._rangeStart = date;
        this._rangeEnd = null;
        this._hoverDate = null;
        this._value = date;
        this._opts.onRangeChange?.(date, null);
        this._render();
      } else {
        let start = this._rangeStart;
        let end = date;
        if (end.isBefore(start)) {
          [start, end] = [end, start];
        }
        this._rangeStart = start;
        this._rangeEnd = end;
        this._value = start;
        this._hoverDate = null;
        this._opts.onRangeChange?.(start, end);
        this._render();
      }
    }
  }
  /**
   * Updates only the range-related CSS classes on existing cells, without
   * a full re-render. Used for efficient hover preview updates.
   */
  _updateRangeHighlight(el) {
    const { displayStart, displayEnd } = this._getDisplayRange();
    const cells = el.querySelectorAll(".ndp-inline-cell[data-bs-day]");
    cells.forEach((cell) => {
      const y = parseInt(cell.getAttribute("data-bs-year") ?? "0", 10);
      const m = parseInt(cell.getAttribute("data-bs-month") ?? "0", 10);
      const d = parseInt(cell.getAttribute("data-bs-day") ?? "0", 10);
      if (!y || !m || !d)
        return;
      try {
        const date = new NepaliDate(y, m, d);
        const isStart = displayStart ? date.isSame(displayStart) : false;
        const isEnd = displayEnd ? date.isSame(displayEnd) : false;
        const inRange = displayStart && displayEnd ? !date.isBefore(displayStart) && !date.isAfter(displayEnd) : false;
        cell.classList.toggle("ndp-inline-cell--range-start", isStart);
        cell.classList.toggle("ndp-inline-cell--range-end", isEnd && !isStart);
        cell.classList.toggle("ndp-inline-cell--in-range", inRange && !isStart && !isEnd);
      } catch {
      }
    });
  }
  /**
   * Returns the effective {displayStart, displayEnd} for rendering range highlights,
   * taking into account hover preview when the end hasn't been confirmed yet.
   */
  _getDisplayRange() {
    if (this._opts.selectionMode !== "range") {
      return { displayStart: null, displayEnd: null };
    }
    let displayStart = this._rangeStart;
    let displayEnd = this._rangeEnd;
    if (displayStart && !displayEnd && this._hoverDate) {
      if (this._hoverDate.isBefore(displayStart)) {
        displayEnd = displayStart;
        displayStart = this._hoverDate;
      } else {
        displayEnd = this._hoverDate;
      }
    }
    return { displayStart, displayEnd };
  }
  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  _navigate(direction) {
    if (this._viewMode === "months") {
      this._viewYear = Math.max(BS_MIN, Math.min(BS_MAX, this._viewYear + direction));
      this._render();
      return;
    }
    if (this._viewMode === "years") {
      const newStart = this._yearGridStart + direction * 9;
      this._yearGridStart = Math.max(BS_MIN, Math.min(BS_MAX - 8, newStart));
      this._render();
      return;
    }
    this._viewMonth += direction;
    if (this._viewMonth > 12) {
      this._viewMonth = 1;
      this._viewYear++;
    }
    if (this._viewMonth < 1) {
      this._viewMonth = 12;
      this._viewYear--;
    }
    if (this._viewYear < BS_MIN) {
      this._viewYear = BS_MIN;
      this._viewMonth = 1;
    }
    if (this._viewYear > BS_MAX) {
      this._viewYear = BS_MAX;
      this._viewMonth = 12;
    }
    this._opts.onMonthChange?.(this._viewYear, this._viewMonth);
    this._render();
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  _nextMonth(year, month) {
    if (month === 12)
      return [year + 1, 1];
    return [year, month + 1];
  }
  /** Returns the start of the 9-year grid window that contains the given year. */
  _snapYearGrid(year) {
    return Math.floor((year - BS_MIN) / 9) * 9 + BS_MIN;
  }
  _makeRow() {
    const row = document.createElement("div");
    row.className = "ndp-inline-row";
    row.setAttribute("role", "row");
    return row;
  }
  _makeEmptyCell() {
    const cell = document.createElement("div");
    cell.className = "ndp-inline-cell ndp-inline-cell--empty";
    cell.setAttribute("aria-hidden", "true");
    return cell;
  }
};

// src/picker/index.ts
var globalDefaults = {};
function getOrCreate(el, opts) {
  if (InstanceRegistry.has(el)) {
    return InstanceRegistry.get(el);
  }
  const picker = new Picker(el, opts);
  InstanceRegistry.set(el, picker);
  return picker;
}
var NepaliDatePicker = {
  version: "2.2.0",
  /**
   * Attaches a date picker to one or more inputs.
   *
   * @example
   * NepaliDatePicker.attach('#dob', { language: 'np' });
   */
  attach(target, options = {}) {
    const opts = resolveOptions({ ...globalDefaults, ...options });
    if (typeof target === "string") {
      if (target.startsWith("#") && !target.includes(" ") && !target.includes(".")) {
        const el = document.getElementById(target.slice(1));
        return el ? getOrCreate(el, opts) : null;
      }
      const els = Array.from(document.querySelectorAll(target));
      if (els.length === 0)
        return null;
      if (els.length === 1)
        return getOrCreate(els[0], opts);
      return els.map((el) => getOrCreate(el, opts));
    }
    if (target instanceof HTMLElement)
      return getOrCreate(target, opts);
    if (target instanceof NodeList || Array.isArray(target)) {
      return Array.from(target).map((el) => getOrCreate(el, opts));
    }
    if (target === null || target === void 0) {
      throw new TypeError("target must be string, Element, or NodeList");
    }
    throw new TypeError(`target must be string, Element, or NodeList, got ${typeof target}`);
  },
  detach(target) {
    const elements = [];
    if (typeof target === "string") {
      elements.push(...Array.from(document.querySelectorAll(target)));
    } else if (target instanceof HTMLElement) {
      elements.push(target);
    }
    for (const el of elements) {
      InstanceRegistry.get(el)?.detach();
    }
  },
  getInstance(element) {
    return InstanceRegistry.get(element) ?? null;
  },
  setDefaults(options) {
    globalDefaults = { ...globalDefaults, ...options };
  },
  /**
   * Mounts an inline (embedded) calendar into a container element.
   *
   * @example
   * NepaliDatePicker.attachInline('#cal', { months: 2, showAdDate: true });
   */
  attachInline(container, options = {}) {
    let el = null;
    if (typeof container === "string") {
      el = document.querySelector(container);
    } else if (container instanceof HTMLElement) {
      el = container;
    }
    return el ? new InlineCalendar(el, options) : null;
  },
  InlineCalendar,
  bsToAd,
  adToBs,
  NepaliDate
};
export {
  InlineCalendar,
  NepaliDate,
  NepaliDatePicker,
  Picker,
  adToBs,
  bsToAd,
  getDaysInMonth,
  isValidBSDate
};
