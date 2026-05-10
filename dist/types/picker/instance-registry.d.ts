/**
 * Tracks all active Picker instances keyed by their input element.
 * Ensures at most one picker per input element.
 */
export declare class InstanceRegistry {
    private static readonly map;
    static set(el: HTMLElement, instance: unknown): void;
    static get(el: HTMLElement): unknown;
    static has(el: HTMLElement): boolean;
    static delete(el: HTMLElement): void;
}
