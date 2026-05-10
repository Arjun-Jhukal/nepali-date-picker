import type { PickerTheme, ThemeObject } from './options';

const LIGHT_VARS: Record<string, string> = {
    '--ndp-bg': '#ffffff',
    '--ndp-bg-secondary': '#f9fafb',
    '--ndp-border': '#e5e7eb',
    '--ndp-text': '#111827',
    '--ndp-text-muted': '#6b7280',
    '--ndp-primary': '#3b82f6',
    '--ndp-primary-text': '#ffffff',
    '--ndp-today-bg': '#eff6ff',
    '--ndp-today-text': '#1d4ed8',
    '--ndp-hover-bg': '#f3f4f6',
    '--ndp-selected-bg': '#3b82f6',
    '--ndp-selected-text': '#ffffff',
    '--ndp-weekend-text': '#ef4444',
    '--ndp-disabled-text': '#d1d5db',
    '--ndp-header-bg': '#ffffff',
    '--ndp-shadow': '0 4px 24px rgba(0,0,0,0.12)',
    '--ndp-radius': '10px',
    '--ndp-cell-radius': '6px',
    '--ndp-font-family': 'system-ui, -apple-system, sans-serif',
    '--ndp-font-size': '14px',
};

const DARK_VARS: Record<string, string> = {
    '--ndp-bg': '#1f2937',
    '--ndp-bg-secondary': '#111827',
    '--ndp-border': '#374151',
    '--ndp-text': '#f9fafb',
    '--ndp-text-muted': '#9ca3af',
    '--ndp-primary': '#60a5fa',
    '--ndp-primary-text': '#1e3a5f',
    '--ndp-today-bg': '#1e3a5f',
    '--ndp-today-text': '#93c5fd',
    '--ndp-hover-bg': '#374151',
    '--ndp-selected-bg': '#60a5fa',
    '--ndp-selected-text': '#111827',
    '--ndp-weekend-text': '#f87171',
    '--ndp-disabled-text': '#4b5563',
    '--ndp-header-bg': '#1f2937',
    '--ndp-shadow': '0 4px 24px rgba(0,0,0,0.5)',
    '--ndp-radius': '10px',
    '--ndp-cell-radius': '6px',
    '--ndp-font-family': 'system-ui, -apple-system, sans-serif',
    '--ndp-font-size': '14px',
};

/**
 * Applies CSS custom properties to the popover element for the given theme.
 */
export function applyTheme(el: HTMLElement, theme: PickerTheme): void {
    const base = theme === 'dark' ? DARK_VARS : LIGHT_VARS;
    for (const [key, value] of Object.entries(base)) {
        el.style.setProperty(key, value);
    }

    // Apply custom overrides from ThemeObject
    if (typeof theme === 'object' && theme !== null) {
        const t = theme as ThemeObject;
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
