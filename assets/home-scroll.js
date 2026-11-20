// Limit large wheel steps on the long home page in desktop Windows browsers.
(() => {
  const platform = navigator.userAgentData?.platform || navigator.platform;
  if (!/^Win/i.test(platform) || !matchMedia('(any-pointer: fine)').matches) return;

  const maxStep = 120;
  const burstRecoveryMs = 60;
  let previousTime = -Infinity;
  let previousDirection = 0;
  let remaining = maxStep;

  document.addEventListener('wheel', event => {
    if (!event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey ||
        event.shiftKey || event.altKey || event.deltaX !== 0 || !event.deltaY) return;

    const mode = event.deltaMode;
    // Respect the browser/OS preference for scrolling a page at a time.
    if (mode === WheelEvent.DOM_DELTA_PAGE) return;
    const pixels = event.deltaY * (mode === WheelEvent.DOM_DELTA_LINE ? 16 : 1);
    if (Math.abs(pixels) <= maxStep) return;

    // A nested scroller, open dialog or form control owns its wheel input.
    for (let el = event.target; el instanceof Element && el !== document.body; el = el.parentElement) {
      if (el.matches('dialog, input, textarea, select, [contenteditable=true]')) return;
      if (el.scrollHeight > el.clientHeight && /^(auto|scroll)$/.test(getComputedStyle(el).overflowY)) return;
    }

    const now = performance.now();
    const direction = Math.sign(pixels);
    remaining = direction === previousDirection
      ? Math.min(maxStep, remaining + (now - previousTime) * maxStep / burstRecoveryMs)
      : maxStep;
    const step = Math.floor(remaining);
    previousTime = now;
    previousDirection = direction;
    remaining -= step;
    event.preventDefault();
    if (step) window.scrollBy({top: direction * step, behavior: 'instant'});
  }, {passive: false});
})();
