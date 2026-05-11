import { NepaliDate } from '../core/nepali-date';
import { BS_MIN, BS_MAX } from '../core/data-loader';
import { resolveOptions } from './options';
import type { PickerOptions } from './options';
import { renderGrid, renderMonthGrid, renderYearGrid, getCellDate } from './grid';
import { positionPopover } from './popover';
import { applyTheme } from './theme';
import { handleGridKeydown } from './keyboard';
import { InstanceRegistry } from './instance-registry';

type ViewMode = 'days' | 'months' | 'years';

class DetachedError extends Error {
    constructor() { super('Picker has been detached'); }
}

export class Picker {
    private _input: HTMLElement;
    private _opts: PickerOptions;
    private _value: NepaliDate | null = null;
    private _popover: HTMLElement | null = null;
    private _focused: NepaliDate | null = null;
    private _viewYear: number;
    private _viewMonth: number;
    private _viewMode: ViewMode = 'days';
    private _detached = false;
    private _today: NepaliDate;

    private _onInputClick: () => void;
    private _onDocClick: (e: MouseEvent) => void;
    private _onKeydown: (e: KeyboardEvent) => void;
    private _onScroll: () => void;
    private _onResize: () => void;

    constructor(input: HTMLElement, opts: PickerOptions) {
        this._input = input;
        this._opts = opts;
        this._today = NepaliDate.today();
        const start = opts.defaultDate ?? this._today;
        this._viewYear = start.getYear();
        this._viewMonth = start.getMonth();

        this._onInputClick = () => this.toggle();
        this._onDocClick = (e: MouseEvent) => {
            if (
                this._popover &&
                !this._popover.contains(e.target as Node) &&
                e.target !== this._input
            ) {
                this.close();
            }
        };
        this._onKeydown = (e: KeyboardEvent) => this._handleKey(e);
        this._onScroll = () => { if (this._popover) positionPopover(this._popover, this._input, this._opts.position); };
        this._onResize = () => { if (this._popover) positionPopover(this._popover, this._input, this._opts.position); };

        this._input.addEventListener('click', this._onInputClick);
        document.addEventListener('click', this._onDocClick, true);
        document.addEventListener('keydown', this._onKeydown);
        window.addEventListener('scroll', this._onScroll, { passive: true });
        window.addEventListener('resize', this._onResize, { passive: true });

        this._input.setAttribute('readonly', '');
        this._input.setAttribute('autocomplete', 'off');
        this._input.style.cursor = 'pointer';
    }

    open(): void {
        this._assertNotDetached();
        if (this._popover) return;

        this._today = NepaliDate.today();
        this._viewMode = 'days';

        const inputVal = (this._input as HTMLInputElement).value;
        if (inputVal && !this._value) {
            try {
                this._value = NepaliDate.parse(inputVal, this._opts.format);
                this._viewYear = this._value.getYear();
                this._viewMonth = this._value.getMonth();
            } catch { /* ignore */ }
        }

        this._render();
        this._opts.onOpen?.();

        document.querySelectorAll<HTMLElement>('.ndp-popover').forEach((p) => {
            if (p !== this._popover) p.remove();
        });
    }

    close(): void {
        if (!this._popover) return;
        this._popover.remove();
        this._popover = null;
        this._input.focus();
        this._opts.onClose?.();
    }

    toggle(): void {
        this._assertNotDetached();
        if (this._popover) this.close(); else this.open();
    }

    getValue(): NepaliDate | null {
        this._assertNotDetached();
        return this._value;
    }

    setValue(date: NepaliDate | null): void {
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
        if (this._popover) this._render();
    }

    clear(): void {
        this._assertNotDetached();
        this._value = null;
        (this._input as HTMLInputElement).value = '';
        this._opts.onChange?.(null);
    }

    setOptions(partial: Partial<PickerOptions>): void {
        this._assertNotDetached();
        this._opts = resolveOptions({ ...this._opts, ...partial });
        if (this._popover) this._render();
    }

    refresh(): void {
        this._assertNotDetached();
        if (this._popover) this._render();
    }

    detach(): void {
        if (this._detached) return;
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

    destroy(): void { this.detach(); }

    private _render(): void {
        const existing = this._popover;
        let popover: HTMLElement;

        if (this._viewMode === 'months') {
            popover = renderMonthGrid(this._viewYear, this._viewMonth, this._opts);
        } else if (this._viewMode === 'years') {
            popover = renderYearGrid(this._viewYear, this._opts);
        } else {
            popover = renderGrid(
                this._viewYear,
                this._viewMonth,
                this._value,
                this._today,
                this._opts,
            );
        }

        popover.style.position = 'absolute';
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

        if (this._viewMode === 'days') {
            const focused = this._value ?? this._today;
            this._focusCell(focused);
        }
    }

    private _wirePopoverEvents(popover: HTMLElement): void {
        popover.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = e.target as HTMLElement;
            const actionEl = target.closest<HTMLElement>('[data-action]');
            const action = actionEl?.getAttribute('data-action');

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
                    const m = parseInt(actionEl!.getAttribute('data-month') ?? '1', 10);
                    this._viewMonth = m;
                    this._viewMode = 'days';
                    this._render();
                    break;
                }
                case 'select-year': {
                    const y = parseInt(actionEl!.getAttribute('data-year') ?? String(BS_MIN), 10);
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
                    } else {
                        this._render();
                    }
                    break;
                }
                case 'clear':
                    this.clear();
                    this.close();
                    break;
                default: {
                    const cell = target.closest<HTMLElement>('.ndp-day');
                    if (!cell) return;
                    if (cell.getAttribute('aria-disabled') === 'true') return;
                    const date = getCellDate(cell);
                    if (!date) return;
                    this._select(date);
                }
            }
        });

        popover.addEventListener('mouseenter', (e) => {
            const cell = (e.target as HTMLElement).closest<HTMLElement>('.ndp-day:not([aria-disabled])');
            if (cell) cell.focus();
        }, true);
    }

    private _navigate(direction: -1 | 1): void {
        if (this._viewMode === 'months') {
            this._viewYear = Math.max(BS_MIN, Math.min(BS_MAX, this._viewYear + direction));
        } else {
            this._viewMonth += direction;
            if (this._viewMonth > 12) { this._viewMonth = 1; this._viewYear++; }
            if (this._viewMonth < 1) { this._viewMonth = 12; this._viewYear--; }
            this._opts.onMonthChange?.(this._viewYear, this._viewMonth);
        }
        this._render();
    }

    private _select(date: NepaliDate): void {
        this._value = date;
        this._syncInputValue();
        this._opts.onChange?.(date);
        if (this._opts.closeOnSelect) this.close(); else this._render();
    }

    private _syncInputValue(): void {
        if (!this._value) return;
        if (this._opts.mode === 'ad') {
            const ad = this._value.toAD();
            const y = ad.getFullYear();
            const m = String(ad.getMonth() + 1).padStart(2, '0');
            const d = String(ad.getDate()).padStart(2, '0');
            (this._input as HTMLInputElement).value = `${y}-${m}-${d}`;
        } else {
            (this._input as HTMLInputElement).value = this._value.format(
                this._opts.format,
                this._opts.language,
            );
        }
    }

    private _handleKey(e: KeyboardEvent): void {
        if (!this._popover) {
            if (e.key === 'Enter' || e.key === ' ') {
                if (document.activeElement === this._input) {
                    e.preventDefault();
                    this.open();
                }
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
            return;
        }

        if (this._viewMode !== 'days') return;

        const current = this._focused ?? this._value ?? this._today;
        const result = handleGridKeydown(e, current, this._opts.minDate, this._opts.maxDate);
        if (!result) return;

        e.preventDefault();
        this._focused = result.date;

        if (result.close) { this.close(); return; }
        if (result.select) {
            if (!this._isDisabled(result.date)) {
                this._select(result.date);
                return;
            }
        }

        if (
            result.date.getYear() !== this._viewYear ||
            result.date.getMonth() !== this._viewMonth
        ) {
            this._viewYear = result.date.getYear();
            this._viewMonth = result.date.getMonth();
            this._render();
        } else {
            this._focusCell(result.date);
        }
    }

    private _focusCell(date: NepaliDate): void {
        if (!this._popover) return;
        const cell = this._popover.querySelector<HTMLElement>(
            `[data-bs-year="${date.getYear()}"][data-bs-month="${date.getMonth()}"][data-bs-day="${date.getDate()}"]`,
        );
        cell?.focus();
    }

    private _isDisabled(date: NepaliDate): boolean {
        const dayOfWeek = date.getDay();
        if (this._opts.disabledDaysOfWeek.includes(dayOfWeek)) return true;
        if (this._opts.minDate && date.isBefore(this._opts.minDate)) return true;
        if (this._opts.maxDate && date.isAfter(this._opts.maxDate)) return true;
        if (this._opts.disabledDates.some((d) => d.isSame(date))) return true;
        return false;
    }

    private _assertNotDetached(): void {
        if (this._detached) throw new DetachedError();
    }
}
