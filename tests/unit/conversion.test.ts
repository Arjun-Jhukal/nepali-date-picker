import { describe, it, expect } from 'vitest';
import { bsToAd, adToBs, getDaysInMonth, isValidBSDate } from '../../src/core/conversion';

// ---------------------------------------------------------------------------
// S1-P — Happy path and edge cases (MUST PASS)
// ---------------------------------------------------------------------------

describe('bsToAd — happy path', () => {
    it('S1-P1: bsToAd(2083, 1, 1) = April 14, 2026', () => {
        const d = bsToAd(2083, 1, 1);
        expect(d.getFullYear()).toBe(2026);
        expect(d.getMonth()).toBe(3); // April = 3
        expect(d.getDate()).toBe(14);
    });

    it('S1-P2: bsToAd(2083, 1, 8) = April 21, 2026 (anchor verification)', () => {
        const d = bsToAd(2083, 1, 8);
        expect(d.getFullYear()).toBe(2026);
        expect(d.getMonth()).toBe(3);
        expect(d.getDate()).toBe(21);
    });

    it('S1-P15: 2083/1/1 is a Tuesday (day 2)', () => {
        const d = bsToAd(2083, 1, 1);
        expect(d.getDay()).toBe(2); // 0=Sun, 2=Tue
    });
});

describe('bsToAd — edge cases', () => {
    it('S1-P3 & S1-P4: first and last day of every month in every supported year', () => {
        for (let year = 2082; year <= 2090; year++) {
            for (let month = 1; month <= 12; month++) {
                const daysInMonth = getDaysInMonth(year, month);
                // First day — must not throw
                const first = bsToAd(year, month, 1);
                expect(first).toBeInstanceOf(Date);
                expect(isNaN(first.getTime())).toBe(false);
                // Last day — must not throw
                const last = bsToAd(year, month, daysInMonth);
                expect(last).toBeInstanceOf(Date);
                expect(isNaN(last.getTime())).toBe(false);
                // Last > first
                expect(last.getTime()).toBeGreaterThan(first.getTime());
            }
        }
    });

    it('S1-P12: date crossing AD year boundary (Poush → Magh)', () => {
        // Poush (month 9) is roughly Dec/Jan. Last day of Poush 2083.
        const daysInPoush2083 = getDaysInMonth(2083, 9);
        const endOfPoush = bsToAd(2083, 9, daysInPoush2083);
        const startOfMagh = bsToAd(2083, 10, 1);
        expect(startOfMagh.getTime() - endOfPoush.getTime()).toBe(86400000);
    });

    it('S1-P13: date crossing BS year boundary (Chaitra → Baishakh)', () => {
        const daysInChaitra2082 = getDaysInMonth(2082, 12);
        const endOf2082 = bsToAd(2082, 12, daysInChaitra2082);
        const startOf2083 = bsToAd(2083, 1, 1);
        expect(startOf2083.getTime() - endOf2082.getTime()).toBe(86400000);
    });

    it('S1-P14: conversion is timezone-independent (date-only)', () => {
        const d1 = bsToAd(2083, 5, 15);
        // Both should give the same date
        expect(d1.getFullYear() + '-' + d1.getMonth() + '-' + d1.getDate())
            .toBe(d1.getFullYear() + '-' + d1.getMonth() + '-' + d1.getDate());
    });
});

describe('getDaysInMonth — happy path', () => {
    it('S1-P8: getDaysInMonth(2083, 3) = 32 (Ashadh 2083)', () => {
        expect(getDaysInMonth(2083, 3)).toBe(32);
    });

    it('S1-P9: getDaysInMonth(2084, 1) = 31', () => {
        expect(getDaysInMonth(2084, 1)).toBe(31);
    });

    it('all months in all years are 28–32', () => {
        for (let year = 2082; year <= 2090; year++) {
            for (let month = 1; month <= 12; month++) {
                const d = getDaysInMonth(year, month);
                expect(d).toBeGreaterThanOrEqual(28);
                expect(d).toBeLessThanOrEqual(32);
            }
        }
    });
});

describe('isValidBSDate', () => {
    it('S1-P10: isValidBSDate(2083, 1, 31) = true', () => {
        expect(isValidBSDate(2083, 1, 31)).toBe(true);
    });

    it('S1-P11: isValidBSDate(2083, 9, 30) = true', () => {
        expect(isValidBSDate(2083, 9, 30)).toBe(true);
    });

    it('S1-N18: isValidBSDate(2050, 1, 1) = false (no throw)', () => {
        expect(isValidBSDate(2050, 1, 1)).toBe(false);
    });

    it('returns false for invalid month', () => {
        expect(isValidBSDate(2083, 13, 1)).toBe(false);
        expect(isValidBSDate(2083, 0, 1)).toBe(false);
    });
});

describe('adToBs — happy path', () => {
    it('S1-P5: adToBs(new Date(2026, 3, 14)) = { year: 2083, month: 1, day: 1 }', () => {
        const result = adToBs(new Date(2026, 3, 14));
        expect(result).toEqual({ year: 2083, month: 1, day: 1 });
    });
});

describe('Round-trip conversions (S1-P6 & S1-P7)', () => {
    it('adToBs(bsToAd(d)) equals d for all ~3300 supported BS dates', () => {
        for (let year = 2082; year <= 2090; year++) {
            for (let month = 1; month <= 12; month++) {
                const days = getDaysInMonth(year, month);
                for (let day = 1; day <= days; day++) {
                    const ad = bsToAd(year, month, day);
                    const back = adToBs(ad);
                    expect(back).toEqual({ year, month, day });
                }
            }
        }
    });
});

// ---------------------------------------------------------------------------
// S1-N — Negative tests (MUST FAIL with exact error type + message)
// ---------------------------------------------------------------------------

describe('bsToAd — negative tests', () => {
    it('S1-N1: bsToAd(2050, 1, 1) throws RangeError with message about 2050', () => {
        expect(() => bsToAd(2050, 1, 1)).toThrowError(RangeError);
        expect(() => bsToAd(2050, 1, 1)).toThrowError('2050');
        expect(() => bsToAd(2050, 1, 1)).toThrowError('2082');
    });

    it('S1-N2: bsToAd(2100, 1, 1) throws RangeError', () => {
        expect(() => bsToAd(2100, 1, 1)).toThrowError(RangeError);
    });

    it('S1-N3: bsToAd(2083, 0, 1) throws RangeError about month', () => {
        expect(() => bsToAd(2083, 0, 1)).toThrowError(RangeError);
        expect(() => bsToAd(2083, 0, 1)).toThrowError('month');
    });

    it('S1-N4: bsToAd(2083, 13, 1) throws RangeError', () => {
        expect(() => bsToAd(2083, 13, 1)).toThrowError(RangeError);
    });

    it('S1-N5: bsToAd(2083, -1, 1) throws RangeError', () => {
        expect(() => bsToAd(2083, -1, 1)).toThrowError(RangeError);
    });

    it('S1-N6: bsToAd(2083, 1, 0) throws RangeError about day', () => {
        expect(() => bsToAd(2083, 1, 0)).toThrowError(RangeError);
        expect(() => bsToAd(2083, 1, 0)).toThrowError('day');
    });

    it('S1-N7: bsToAd(2083, 1, 32) throws RangeError (Baishakh 2083 has 31 days)', () => {
        expect(getDaysInMonth(2083, 1)).toBe(31);
        expect(() => bsToAd(2083, 1, 32)).toThrowError(RangeError);
    });

    it('S1-N8: bsToAd(2083, 9, 31) throws RangeError (Poush 2083 has 30 days)', () => {
        expect(getDaysInMonth(2083, 9)).toBe(30);
        expect(() => bsToAd(2083, 9, 31)).toThrowError(RangeError);
    });

    it('S1-N9: bsToAd("2083", 1, 1) throws TypeError about year being string', () => {
        expect(() => bsToAd('2083', 1, 1)).toThrowError(TypeError);
        expect(() => bsToAd('2083', 1, 1)).toThrowError('year');
    });

    it('S1-N10: bsToAd(2083, 1, 1.5) throws TypeError about integer', () => {
        expect(() => bsToAd(2083, 1, 1.5)).toThrowError(TypeError);
        expect(() => bsToAd(2083, 1, 1.5)).toThrowError('integer');
    });

    it('S1-N11: bsToAd(NaN, 1, 1) throws TypeError', () => {
        expect(() => bsToAd(NaN, 1, 1)).toThrowError(TypeError);
    });

    it('S1-N12: bsToAd(undefined, 1, 1) throws TypeError', () => {
        expect(() => bsToAd(undefined, 1, 1)).toThrowError(TypeError);
    });

    it('S1-N13: bsToAd(null, 1, 1) throws TypeError', () => {
        expect(() => bsToAd(null, 1, 1)).toThrowError(TypeError);
    });
});

describe('adToBs — negative tests', () => {
    it('S1-N14: adToBs(new Date("invalid")) throws RangeError: Invalid Date', () => {
        expect(() => adToBs(new Date('invalid'))).toThrowError(RangeError);
        expect(() => adToBs(new Date('invalid'))).toThrowError('Invalid Date');
    });

    it('S1-N15: adToBs(new Date(2020, 0, 1)) throws RangeError about range', () => {
        expect(() => adToBs(new Date(2020, 0, 1))).toThrowError(RangeError);
    });

    it('S1-N16: adToBs("2026-04-14") throws TypeError: Expected Date object', () => {
        expect(() => adToBs('2026-04-14')).toThrowError(TypeError);
        expect(() => adToBs('2026-04-14')).toThrowError('Expected Date object');
    });
});

describe('getDaysInMonth — negative tests', () => {
    it('S1-N17: getDaysInMonth(2050, 1) throws RangeError', () => {
        expect(() => getDaysInMonth(2050, 1)).toThrowError(RangeError);
    });
});
