/**
 * Tracks all active Picker instances keyed by their input element.
 * Ensures at most one picker per input element.
 */
export class InstanceRegistry {
    static set(el, instance) {
        this.map.set(el, instance);
    }
    static get(el) {
        var _a;
        return (_a = this.map.get(el)) !== null && _a !== void 0 ? _a : null;
    }
    static has(el) {
        return this.map.has(el);
    }
    static delete(el) {
        this.map.delete(el);
    }
}
InstanceRegistry.map = new WeakMap();
