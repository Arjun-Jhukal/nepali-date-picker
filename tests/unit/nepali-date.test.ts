import { describe, it, expect } from 'vitest';
import { NepaliDate } from '../../src/core/nepali-date';
import { getDaysInMonth } from '../../src/core/data-loader';

// ---------------------------------------------------------------------------
// S2-P — MUST PASS
// ---------------------------------------------------------------------------

describe('NepaliDate — construction and getters', () => {
    it('S2-P1: getYear()', () => {
        expect(new NepaliDate(2083, 1, 1).getYear()).toBe(2083);
    });

    it('S2-P2: getMonth()', () => {
        expect(new NepaliDate(2083, 1, 1).getMonth()).toBe(1);
    });

    it('S2-P3: getDate()', () => {
        expect(new NepaliDate(2083, 1, 1).getDate()).toBe(1);
    });

    it('S2-P4: getDay() for 2083/1/1 = 2 (Tuesday)', () => {
        expect(new NepaliDate(2083, 1, 1).getDay()).toBe(2);
    });

    it('S2-P5: NepaliDate.fromAD(new Date(2026, 3, 14)).getYear() = 2083', () => {
        expect(NepaliDate.fromAD(new Date(2026, 3, 14)).getYear()).toBe(2083);
    });

    it('S2-P6: NepaliDate.today() returns a valid NepaliDate', () => {
        const today = NepaliDate.today();
        expect(today).toBeInstanceOf(NepaliDate);
        expect(today.getYear()).toBeGreaterThanOrEqual(2082);
    });
});

describe('NepaliDate — arithmetic', () => {
    const base = new NepaliDate(2083, 1, 31); // Baishakh 31

    it('S2-P7: add(1, day) on Baishakh 31, 2083 = Jestha 1, 2083', () => {
        const result = base.add(1, 'day');
        expect(result.getYear()).toBe(2083);
        expect(result.getMonth()).toBe(2);
        expect(result.getDate()).toBe(1);
    });

    it('S2-P8: add(1, month) on Baishakh 1, 2083 = Jestha 1, 2083', () => {
        const d = new NepaliDate(2083, 1, 1);
        const result = d.add(1, 'month');
        expect(result.getYear()).toBe(2083);
        expect(result.getMonth()).toBe(2);
        expect(result.getDate()).toBe(1);
    });

    it('S2-P9: add(1, year) on Baishakh 1, 2083 = Baishakh 1, 2084', () => {
        const d = new NepaliDate(2083, 1, 1);
        const result = d.add(1, 'year');
        expect(result.getYear()).toBe(2084);
        expect(result.getMonth()).toBe(1);
    });

    it('S2-P10: add(365, day) on Baishakh 1, 2083 → near Baishakh 1, 2084', () => {
        const d = new NepaliDate(2083, 1, 1);
        const result = d.add(365, 'day');
        // 2083 has 366 days, so 365 days forward lands on Chaitra 30, 2083
        expect(result.getYear()).toBe(2083);
        expect(result.getMonth()).toBe(12);
    });

    it('S2-P11: subtract(1, day) on Baishakh 1, 2083 = Chaitra 30, 2082', () => {
        const d = new NepaliDate(2083, 1, 1);
        const result = d.subtract(1, 'day');
        expect(result.getYear()).toBe(2082);
        expect(result.getMonth()).toBe(12);
        expect(result.getDate()).toBe(getDaysInMonth(2082, 12));
    });

    it('S2-P12: diff in days for two dates 100 days apart = 100', () => {
        const a = new NepaliDate(2083, 1, 1);
        const b = a.add(100, 'day');
        expect(a.diff(b, 'day')).toBe(100);
    });

    it('S2-P13: diff where d is later = negative number', () => {
        const a = new NepaliDate(2083, 6, 1);
        const b = new NepaliDate(2083, 1, 1);
        expect(a.diff(b, 'day')).toBeLessThan(0);
    });
});

describe('NepaliDate — boundary helpers', () => {
    const d = new NepaliDate(2083, 3, 15);

    it('S2-P14: startOfMonth()', () => {
        const r = d.startOfMonth();
        expect(r.getMonth()).toBe(3);
        expect(r.getDate()).toBe(1);
    });

    it('S2-P15: endOfMonth()', () => {
        const r = d.endOfMonth();
        expect(r.getMonth()).toBe(3);
        expect(r.getDate()).toBe(getDaysInMonth(2083, 3)); // 32
    });
});

describe('NepaliDate — comparisons', () => {
    const a = new NepaliDate(2083, 1, 1);
    const b = new NepaliDate(2083, 6, 15);

    it('S2-P16: isBefore', () => {
        expect(a.isBefore(b)).toBe(true);
        expect(b.isBefore(a)).toBe(false);
    });

    it('S2-P17: isSame', () => {
        expect(a.isSame(new NepaliDate(2083, 1, 1))).toBe(true);
        expect(a.isSame(b)).toBe(false);
    });

    it('isAfter', () => {
        expect(b.isAfter(a)).toBe(true);
    });
});

describe('NepaliDate — format', () => {
    const d = new NepaliDate(2083, 1, 1);

    it('S2-P18: format YYYY-MM-DD = "2083-01-01"', () => {
        expect(d.format('YYYY-MM-DD')).toBe('2083-01-01');
    });

    it('S2-P19: format MMMM DD, YYYY en = "Baisakh 01, 2083"', () => {
        expect(d.format('MMMM DD, YYYY', 'en')).toBe('Baisakh 01, 2083');
    });

    it('S2-P20: format MMMM DD, YYYY np = Nepali script', () => {
        const result = d.format('MMMM DD, YYYY', 'np');
        expect(result).toContain('बैशाख');
        expect(result).toContain('२०८३');
    });

    it('S2-P21: format dddd for Tuesday = "Tuesday" en', () => {
        // 2083/1/1 is Tuesday
        expect(d.format('dddd', 'en')).toBe('Tuesday');
    });

    it('S2-P21 np: format dddd np = "मंगलबार"', () => {
        expect(d.format('dddd', 'np')).toBe('मंगलबार');
    });
});

describe('NepaliDate — parse', () => {
    it('S2-P22: NepaliDate.parse("2083-01-01", "YYYY-MM-DD")', () => {
        const d = NepaliDate.parse('2083-01-01', 'YYYY-MM-DD');
        expect(d.getYear()).toBe(2083);
        expect(d.getMonth()).toBe(1);
        expect(d.getDate()).toBe(1);
    });

    it('S2-P23: round-trip parse(format(d)) = d', () => {
        const original = new NepaliDate(2083, 5, 15);
        const formatted = original.format('YYYY-MM-DD');
        const parsed = NepaliDate.parse(formatted, 'YYYY-MM-DD');
        expect(parsed.isSame(original)).toBe(true);
    });
});

describe('NepaliDate — month overflow clamping', () => {
    it('S2-P24: add(1, month) from last day of long month clamps to max day of target month', () => {
        // Jestha 2083 has 31 days. Adding 1 month → Ashadh. Ashadh has 32 days → day stays 31.
        const d = new NepaliDate(2083, 2, 31);
        const result = d.add(1, 'month');
        expect(result.getMonth()).toBe(3);
        expect(result.getDate()).toBeLessThanOrEqual(getDaysInMonth(2083, 3));
    });
});

describe('NepaliDate — immutability', () => {
    it('S2-P25: add() does not mutate the original', () => {
        const d = new NepaliDate(2083, 1, 1);
        const r = d.add(10, 'day');
        expect(d.getDate()).toBe(1); // unchanged
        expect(r.getDate()).toBe(11);
    });
});

// ---------------------------------------------------------------------------
// S2-N — MUST FAIL
// ---------------------------------------------------------------------------

describe('NepaliDate — negative tests', () => {
    it('S2-N1: new NepaliDate(2050, 1, 1) throws RangeError', () => {
        expect(() => new NepaliDate(2050, 1, 1)).toThrowError(RangeError);
    });

    it('S2-N2: new NepaliDate(2083, 13, 1) throws RangeError', () => {
        expect(() => new NepaliDate(2083, 13, 1)).toThrowError(RangeError);
    });

    it('S2-N3: new NepaliDate(2083, 1, 32) throws RangeError (Baishakh has 31)', () => {
        expect(() => new NepaliDate(2083, 1, 32)).toThrowError(RangeError);
    });

    it('S2-N4: new NepaliDate() (no args) throws TypeError', () => {
        // @ts-expect-error testing runtime behaviour
        expect(() => new NepaliDate()).toThrowError(TypeError);
    });

    it('S2-N5: add("one", "day") throws TypeError', () => {
        const d = new NepaliDate(2083, 1, 1);
        // @ts-expect-error intentional
        expect(() => d.add('one', 'day')).toThrowError(TypeError);
    });

    it('S2-N6: add(1, "fortnight") throws RangeError', () => {
        const d = new NepaliDate(2083, 1, 1);
        // @ts-expect-error intentional
        expect(() => d.add(1, 'fortnight')).toThrowError(RangeError);
    });

    it('S2-N7: add(NaN, "day") throws TypeError', () => {
        const d = new NepaliDate(2083, 1, 1);
        expect(() => d.add(NaN, 'day')).toThrowError(TypeError);
    });

    it('S2-N8: format("ZZZZ") throws Error about unknown token', () => {
        const d = new NepaliDate(2083, 1, 1);
        expect(() => d.format('ZZZZ')).toThrowError('Unknown format token');
    });

    it('S2-N9: parse("not a date", "YYYY-MM-DD") throws Error', () => {
        expect(() => NepaliDate.parse('not a date', 'YYYY-MM-DD')).toThrowError(
            'Cannot parse',
        );
    });

    it('S2-N10: parse("2050-01-01", "YYYY-MM-DD") throws RangeError', () => {
        expect(() => NepaliDate.parse('2050-01-01', 'YYYY-MM-DD')).toThrowError(RangeError);
    });

    it('S2-N11: parse("2083-13-01", "YYYY-MM-DD") throws RangeError', () => {
        expect(() => NepaliDate.parse('2083-13-01', 'YYYY-MM-DD')).toThrowError(RangeError);
    });

    it('S2-N12: diff(notADate) throws TypeError', () => {
        const d = new NepaliDate(2083, 1, 1);
        // @ts-expect-error intentional
        expect(() => d.diff('2083-01-01', 'day')).toThrowError(TypeError);
    });

    it('S2-N13: add(10000, "year") throws RangeError', () => {
        const d = new NepaliDate(2083, 1, 1);
        expect(() => d.add(10000, 'year')).toThrowError(RangeError);
    });

    it('S2-N15: new NepaliDate(2083.5, 1, 1) throws TypeError (non-integer)', () => {
        expect(() => new NepaliDate(2083.5, 1, 1)).toThrowError(TypeError);
    });
});
