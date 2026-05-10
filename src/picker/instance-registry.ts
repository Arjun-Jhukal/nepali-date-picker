/**
 * Tracks all active Picker instances keyed by their input element.
 * Ensures at most one picker per input element.
 */
export class InstanceRegistry {
    private static readonly map = new WeakMap<HTMLElement, unknown>();

    static set(el: HTMLElement, instance: unknown): void {
        this.map.set(el, instance);
    }

    static get(el: HTMLElement): unknown {
        return this.map.get(el) ?? null;
    }

    static has(el: HTMLElement): boolean {
        return this.map.has(el);
    }

    static delete(el: HTMLElement): void {
        this.map.delete(el);
    }
}
