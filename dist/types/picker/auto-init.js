import { NepaliDatePicker } from './index';
import { parseDataAttributes } from './options';
/**
 * Auto-initializes pickers on elements with [data-nepali-datepicker].
 * Runs on DOMContentLoaded unless the loading <script> has data-nepali-no-autoinit.
 */
function autoInit() {
    // Check if auto-init is disabled
    const scripts = document.querySelectorAll('script[data-nepali-no-autoinit]');
    if (scripts.length > 0)
        return;
    const elements = document.querySelectorAll('[data-nepali-datepicker]');
    elements.forEach((el) => {
        const dataOpts = parseDataAttributes(el);
        NepaliDatePicker.attach(el, dataOpts);
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
}
else {
    autoInit();
}
