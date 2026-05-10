import { NepaliDate } from '../core/nepali-date';
import { bsToAd, adToBs } from '../core/conversion';
import { BS_MIN, BS_MAX } from '../core/data-loader';
import { resolveOptions } from './options';
import { renderGrid, renderMonthGrid, renderYearGrid, getCellDate } from './grid';
import { positionPopover } from './popover';
import { applyTheme } from './theme';
import { handleGridKeydown } from './keyboard';
import { InstanceRegistry } from './instance-registry';
/** Error thrown when calling methods on a detached picker */
class DetachedError extends Error {
    constructor() { super('Picker has been detached'); }
}
export class Picker {
    constructor(input, opts) {
        var _a;
        this._value = null;
        this._popover = null;
        this._focused = null;
        this._viewMode = 'days';
        this._detached = false;
        this._input = input;
        this._opts = opts;
        this._today = NepaliDate.today();
        const start = (_a = opts.defaultDate) !== null && _a !== void 0 ? _a : this._today;
        this._viewYear = start.getYear();
        this._viewMonth = start.getMonth();
        // Bind handlers
        this._onInputClick = () => this.toggle();
        this._onDocClick = (e) => {
            if (this._popover &&
                !this._popover.contains(e.target) &&
                e.target !== this._input) {
                this.close();
            }
        };
        this._onKeydown = (e) => this._handleKey(e);
        this._onScroll = () => { if (this._popover)
            positionPopover(this._popover, this._input, this._opts.position); };
        this._onResize = () => { if (this._popover)
            positionPopover(this._popover, this._input, this._opts.position); };
        // Attach listeners
        this._input.addEventListener('click', this._onInputClick);
        document.addEventListener('click', this._onDocClick, true);
        document.addEventListener('keydown', this._onKeydown);
        window.addEventListener('scroll', this._onScroll, { passive: true });
        window.addEventListener('resize', this._onResize, { passive: true });
        // Make input readonly so the native keyboard doesn't appear on mobile
        this._input.setAttribute('readonly', '');
        this._input.setAttribute('autocomplete', 'off');
        this._input.style.cursor = 'pointer';
    }
    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------
    open() {
        var _a, _b;
        this._assertNotDetached();
        if (this._popover)
            return; // already open
        this._today = NepaliDate.today();
        this._viewMode = 'days'; // always start in day view
        // Try to read existing input value
        const inputVal = this._input.value;
        if (inputVal && !this._value) {
            try {
                this._value = NepaliDate.parse(inputVal, this._opts.format);
                this._viewYear = this._value.getYear();
                this._viewMonth = this._value.getMonth();
            }
            catch ( /* ignore */_c) { /* ignore */ }
        }
        this._render();
        (_b = (_a = this._opts).onOpen) === null || _b === void 0 ? void 0 : _b.call(_a);
        // Close all other open pickers
        document.querySelectorAll('.ndp-popover').forEach((p) => {
            if (p !== this._popover)
                p.remove();
        });
    }
    close() {
        var _a, _b;
        if (!this._popover)
            return;
        this._popover.remove();
        this._popover = null;
        this._input.focus();
        (_b = (_a = this._opts).onClose) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    toggle() {
        this._assertNotDetached();
        if (this._popover) {
            this.close();
        }
        else {
            this.open();
        }
    }
    getValue() {
        this._assertNotDetached();
        return this._value;
    }
    setValue(date) {
        this._assertNotDetached();
        if (date !== null && !(date instanceof NepaliDate)) {
            throw new TypeError('setValue requires a NepaliDate or null');
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
        var _a, _b;
        this._assertNotDetached();
        this._value = null;
        this._input.value = '';
        (_b = (_a = this._opts).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, null);
    }
    setOptions(partial) {
        this._assertNotDetached();
        this._opts = resolveOptions(Object.assign(Object.assign({}, this._opts), partial));
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
        this._input.removeEventListener('click', this._onInputClick);
        document.removeEventListener('click', this._onDocClick, true);
        document.removeEventListener('keydown', this._onKeydown);
        window.removeEventListener('scroll', this._onScroll);
        window.removeEventListener('resize', this._onResize);
        this._input.removeAttribute('readonly');
        this._input.style.cursor = '';
        InstanceRegistry.delete(this._input);
    }
    /** Alias for detach() */
    destroy() { this.detach(); }
    // ---------------------------------------------------------------------------
    // Internal rendering
    // ---------------------------------------------------------------------------
    _render() {
        var _a;
        const existing = this._popover;
        let popover;
        if (this._viewMode === 'months') {
            popover = renderMonthGrid(this._viewYear, this._viewMonth, this._opts);
        }
        else if (this._viewMode === 'years') {
            popover = renderYearGrid(this._viewYear, this._opts);
        }
        else {
            popover = renderGrid(this._viewYear, this._viewMonth, this._value, this._today, this._opts);
        }
        popover.style.position = 'absolute';
        popover.style.zIndex = String(this._opts.zIndex);
        applyTheme(popover, this._opts.theme);
        this._wirePopoverEvents(popover);
        if (existing) {
            existing.replaceWith(popover);
        }
        else {
            document.body.appendChild(popover);
        }
        this._popover = popover;
        positionPopover(popover, this._input, this._opts.position);
        if (this._viewMode === 'days') {
            const focused = (_a = this._value) !== null && _a !== void 0 ? _a : this._today;
            this._focusCell(focused);
        }
    }
    _wirePopoverEvents(popover) {
        // Single delegated click handler for all actions
        popover.addEventListener('click', (e) => {
            var _a, _b;
            e.stopPropagation();
            const target = e.target;
            const actionEl = target.closest('[data-action]');
            const action = actionEl === null || actionEl === void 0 ? void 0 : actionEl.getAttribute('data-action');
            switch (action) {
                case 'prev':
                    this._navigate(-1);
                    break;
                case 'next':
                    this._navigate(1);
                    break;
                case 'view-months':
                    this._viewMode = 'months';
                    this._render();
                    break;
                case 'view-years':
                    this._viewMode = 'years';
                    this._render();
                    break;
                case 'select-month': {
                    const m = parseInt((_a = actionEl.getAttribute('data-month')) !== null && _a !== void 0 ? _a : '1', 10);
                    this._viewMonth = m;
                    this._viewMode = 'days';
                    this._render();
                    break;
                }
                case 'select-year': {
                    const y = parseInt((_b = actionEl.getAttribute('data-year')) !== null && _b !== void 0 ? _b : String(BS_MIN), 10);
                    this._viewYear = y;
                    this._viewMode = 'months';
                    this._render();
                    break;
                }
                case 'today': {
                    this._viewMode = 'days';
                    this._viewYear = this._today.getYear();
                    this._viewMonth = this._today.getMonth();
                    if (!this._isDisabled(this._today)) {
                        this._select(this._today);
                    }
                    else {
                        this._render();
                    }
                    break;
                }
                case 'clear':
                    this.clear();
                    this.close();
                    break;
                default: {
                    // Day cell click
                    const cell = target.closest('.ndp-day');
                    if (!cell)
                        return;
                    if (cell.getAttribute('aria-disabled') === 'true')
                        return;
                    const date = getCellDate(cell);
                    if (!date)
                        return;
                    this._select(date);
                }
            }
        });
        // Focus cells on hover for keyboard users
        popover.addEventListener('mouseenter', (e) => {
            const cell = e.target.closest('.ndp-day:not([aria-disabled])');
            if (cell)
                cell.focus();
        }, true);
    }
    _navigate(direction) {
        var _a, _b;
        if (this._viewMode === 'months') {
            // In month view, prev/next moves by year (clamped to supported range)
            this._viewYear = Math.max(BS_MIN, Math.min(BS_MAX, this._viewYear + direction));
        }
        else {
            this._viewMonth += direction;
            if (this._viewMonth > 12) {
                this._viewMonth = 1;
                this._viewYear++;
            }
            if (this._viewMonth < 1) {
                this._viewMonth = 12;
                this._viewYear--;
            }
            (_b = (_a = this._opts).onMonthChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._viewYear, this._viewMonth);
        }
        this._render();
    }
    _select(date) {
        var _a, _b;
        this._value = date;
        this._syncInputValue();
        (_b = (_a = this._opts).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, date);
        if (this._opts.closeOnSelect) {
            this.close();
        }
        else {
            this._render();
        }
    }
    _syncInputValue() {
        if (!this._value)
            return;
        if (this._opts.mode === 'ad') {
            const ad = this._value.toAD();
            const y = ad.getFullYear();
            const m = String(ad.getMonth() + 1).padStart(2, '0');
            const d = String(ad.getDate()).padStart(2, '0');
            this._input.value = `${y}-${m}-${d}`;
        }
        else {
            this._input.value = this._value.format(this._opts.format, this._opts.language);
        }
    }
    _handleKey(e) {
        var _a, _b;
        if (!this._popover) {
            if (e.key === 'Enter' || e.key === ' ') {
                if (document.activeElement === this._input) {
                    e.preventDefault();
                    this.open();
                }
            }
            return;
        }
        // Escape always closes regardless of view mode
        if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
            return;
        }
        // Only handle grid navigation in day view
        if (this._viewMode !== 'days')
            return;
        const current = (_b = (_a = this._focused) !== null && _a !== void 0 ? _a : this._value) !== null && _b !== void 0 ? _b : this._today;
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
            const isDisabled = this._isDisabled(result.date);
            if (!isDisabled) {
                this._select(result.date);
                return;
            }
        }
        // Navigate to new month if needed
        if (result.date.getYear() !== this._viewYear ||
            result.date.getMonth() !== this._viewMonth) {
            this._viewYear = result.date.getYear();
            this._viewMonth = result.date.getMonth();
            this._render();
        }
        else {
            this._focusCell(result.date);
        }
    }
    _focusCell(date) {
        if (!this._popover)
            return;
        const cell = this._popover.querySelector(`[data-bs-year="${date.getYear()}"][data-bs-month="${date.getMonth()}"][data-bs-day="${date.getDate()}"]`);
        cell === null || cell === void 0 ? void 0 : cell.focus();
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
}
// ---------------------------------------------------------------------------
// NepaliDatePicker static API
// ---------------------------------------------------------------------------
let globalDefaults = {};
export const NepaliDatePicker = {
    version: '0.1.0',
    /**
     * Attaches a date picker to one or more inputs.
     *
     * @param target  - CSS selector, HTMLElement, NodeList, or HTMLElement[]
     * @param options - Optional configuration (merged with setDefaults)
     * @returns A single Picker or array of Pickers
     * @throws {TypeError} For invalid target types
     *
     * @example
     * NepaliDatePicker.attach('#dob', { language: 'np' });
     */
    attach(target, options = {}) {
        const mergedPartial = Object.assign(Object.assign({}, globalDefaults), options);
        const opts = resolveOptions(mergedPartial);
        if (typeof target === 'string') {
            if (target.startsWith('#') && !target.includes(' ') && !target.includes('.')) {
                const id = target.slice(1);
                const el = document.getElementById(id);
                if (!el)
                    return null;
                return getOrCreate(el, opts);
            }
            const els = Array.from(document.querySelectorAll(target));
            if (els.length === 0)
                return null;
            if (els.length === 1)
                return getOrCreate(els[0], opts);
            return els.map((el) => getOrCreate(el, opts));
        }
        if (target instanceof HTMLElement) {
            return getOrCreate(target, opts);
        }
        if (target instanceof NodeList || Array.isArray(target)) {
            const results = [];
            target.forEach((el) => {
                results.push(getOrCreate(el, opts));
            });
            return results;
        }
        if (target === null || target === undefined) {
            throw new TypeError('target must be string, Element, or NodeList');
        }
        throw new TypeError(`target must be string, Element, or NodeList, got ${typeof target}`);
    },
    /**
     * Detaches pickers from the given target(s).
     */
    detach(target) {
        const elements = [];
        if (typeof target === 'string') {
            elements.push(...Array.from(document.querySelectorAll(target)));
        }
        else if (target instanceof HTMLElement) {
            elements.push(target);
        }
        for (const el of elements) {
            const instance = InstanceRegistry.get(el);
            instance === null || instance === void 0 ? void 0 : instance.detach();
        }
    },
    /**
     * Returns the Picker instance for the given element, or null.
     */
    getInstance(element) {
        var _a;
        return (_a = InstanceRegistry.get(element)) !== null && _a !== void 0 ? _a : null;
    },
    /**
     * Sets global defaults that apply to all future attach() calls.
     */
    setDefaults(options) {
        globalDefaults = Object.assign(Object.assign({}, globalDefaults), options);
    },
    // Expose engine functions
    bsToAd,
    adToBs,
    NepaliDate,
};
function getOrCreate(el, opts) {
    if (InstanceRegistry.has(el)) {
        return InstanceRegistry.get(el);
    }
    const picker = new Picker(el, opts);
    InstanceRegistry.set(el, picker);
    return picker;
}
