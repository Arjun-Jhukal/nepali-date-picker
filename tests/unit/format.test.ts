import { describe, it, expect } from 'vitest';
import { formatDate } from '../../src/core/format';
import type { FormatContext } from '../../src/core/format';

const ctx: FormatContext = {
    year: 2083,
    month: 1,
    day: 1,
    dayOfWeek: 2, // Tuesday
    locale: 'en',
};

describe('formatDate — tokens', () => {
    it('YYYY', () => expect(formatDate('YYYY', ctx)).toBe('2083'));
    it('YY', () => expect(formatDate('YY', ctx)).toBe('83'));
    it('MM', () => expect(formatDate('MM', ctx)).toBe('01'));
    it('M', () => expect(formatDate('M', ctx)).toBe('1'));
    it('DD', () => expect(formatDate('DD', ctx)).toBe('01'));
    it('D', () => expect(formatDate('D', ctx)).toBe('1'));
    it('MMMM', () => expect(formatDate('MMMM', ctx)).toBe('Baisakh'));
    it('MMM', () => expect(formatDate('MMM', ctx)).toBe('Bai'));
    it('dddd', () => expect(formatDate('dddd', ctx)).toBe('Tuesday'));
    it('ddd', () => expect(formatDate('ddd', ctx)).toBe('Tue'));
    it('YYYY-MM-DD combined', () => expect(formatDate('YYYY-MM-DD', ctx)).toBe('2083-01-01'));
});

describe('formatDate — Nepali locale', () => {
    const npCtx: FormatContext = { ...ctx, locale: 'np' };
    it('YYYY np', () => expect(formatDate('YYYY', npCtx)).toBe('२०८३'));
    it('MMMM np', () => expect(formatDate('MMMM', npCtx)).toBe('बैशाख'));
    it('dddd np', () => expect(formatDate('dddd', npCtx)).toBe('मंगलबार'));
});

describe('formatDate — unknown token', () => {
    it('throws on unknown token ZZZZ', () => {
        expect(() => formatDate('ZZZZ', ctx)).toThrowError('Unknown format token');
    });
    it('known tokens mixed with separators do not throw', () => {
        expect(() => formatDate('YYYY-MM-DD', ctx)).not.toThrow();
        expect(() => formatDate('MMMM DD, YYYY', ctx)).not.toThrow();
    });
});
