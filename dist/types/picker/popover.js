/**
 * Positions the popover element relative to the input element.
 * Flips above/below based on available viewport space.
 */
export function positionPopover(popover, input, position) {
    const inputRect = input.getBoundingClientRect();
    const popoverHeight = popover.offsetHeight || 320;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    let top;
    let shouldBeAbove = false;
    if (position === 'top') {
        shouldBeAbove = true;
    }
    else if (position === 'bottom') {
        shouldBeAbove = false;
    }
    else {
        // auto: check if there's enough room below
        const spaceBelow = viewportHeight - inputRect.bottom;
        shouldBeAbove = spaceBelow < popoverHeight + 8 && inputRect.top > popoverHeight + 8;
    }
    if (shouldBeAbove) {
        top = scrollY + inputRect.top - popoverHeight - 4;
    }
    else {
        top = scrollY + inputRect.bottom + 4;
    }
    const left = Math.max(8, Math.min(scrollX + inputRect.left, scrollX + window.innerWidth - (popover.offsetWidth || 280) - 8));
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
}
