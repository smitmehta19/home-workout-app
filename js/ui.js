// Minimal DOM helpers. No framework — the app is small enough that a tiny
// hyperscript function and full re-renders per route are simpler and faster
// than pulling in a library.

export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  append(node, children);
  return node;
}

function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export const frag = (...children) => append(document.createDocumentFragment(), children);

// ── bottom sheet ────────────────────────────────────────────────────────────
//
// Sheets are part of the history stack. Opening one pushes a state, so the
// phone's back gesture closes the sheet instead of navigating the page
// underneath it — which is what everyone expects and what back is for.
//
// They can also be dragged down to dismiss, and paged left/right when the
// caller supplies neighbours, so you can move between exercises without
// closing and reopening.

const sheetStack = [];

window.addEventListener('popstate', () => {
  // Back was pressed. Close the topmost sheet and swallow the navigation.
  const top = sheetStack.pop();
  if (top) top.dismiss();
});

/**
 * @param {(close: Function) => Node} build  renders the sheet contents
 * @param {object} opts
 * @param {Function} opts.onClose
 * @param {Function} opts.onPrev  called on swipe right / prev button
 * @param {Function} opts.onNext  called on swipe left / next button
 * Returns { close, setContent }.
 */
export function openSheet(build, { onClose, onPrev, onNext } = {}) {
  const body = h('div', { class: 'sheet-body' });
  const handle = h('button', { class: 'sheet-grab', 'aria-label': 'Close' });
  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' }, handle, body);
  const backdrop = h('div', { class: 'sheet-backdrop' }, sheet);

  let closed = false;
  let poppedBySelf = false;

  // Actually remove the sheet. Called either by popstate (back) or by us after
  // asking history to go back, so the two paths never double-count.
  const dismiss = () => {
    if (closed) return;
    closed = true;
    backdrop.classList.remove('is-open');
    backdrop.classList.add('is-closing');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => {
      backdrop.remove();
      if (!sheetStack.length) document.body.classList.remove('sheet-open');
      onClose?.();
    }, 220);
  };

  // Public close: rewind history so the pushed entry does not linger.
  const close = () => {
    if (closed || poppedBySelf) return;
    const i = sheetStack.indexOf(entry);
    if (i !== -1) {
      poppedBySelf = true;
      sheetStack.splice(i, 1);
      history.back();          // fires popstate, but our entry is already gone
      dismiss();
    } else {
      dismiss();
    }
  };

  const onKey = (e) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') onPrev?.();
    else if (e.key === 'ArrowRight') onNext?.();
  };

  const entry = { dismiss };
  sheetStack.push(entry);
  history.pushState({ sheet: sheetStack.length }, '');

  handle.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);

  attachGestures(sheet, body, { close, onPrev, onNext });

  document.body.classList.add('sheet-open');
  document.body.append(backdrop);

  const setContent = (node) => {
    body.replaceChildren();
    append(body, [node]);
    body.scrollTop = 0;
  };
  setContent(build(close));

  requestAnimationFrame(() => backdrop.classList.add('is-open'));
  return { close, setContent };
}

/** Drag down to dismiss; drag sideways to page, when paging is available. */
function attachGestures(sheet, body, { close, onPrev, onNext }) {
  let x0 = 0, y0 = 0, dx = 0, dy = 0, active = false, axis = null;

  sheet.addEventListener('pointerdown', (e) => {
    // Ignore drags that start on a control, and vertical drags that should
    // scroll the content instead of moving the sheet.
    if (e.target.closest('button, a, input, select, textarea')) return;
    x0 = e.clientX; y0 = e.clientY; dx = 0; dy = 0; axis = null; active = true;
    sheet.style.transition = 'none';
  });

  sheet.addEventListener('pointermove', (e) => {
    if (!active) return;
    dx = e.clientX - x0;
    dy = e.clientY - y0;

    if (!axis) {
      if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        // Only take over vertical dragging when the content is already at the
        // top, so a drag inside a scrolled list still scrolls it.
        if (axis === 'y' && (body.scrollTop > 0 || dy < 0)) { active = false; return; }
        if (axis === 'x' && !onPrev && !onNext) { active = false; return; }
      } else return;
    }

    if (axis === 'y') sheet.style.transform = `translateY(${Math.max(0, dy)}px)`;
    else sheet.style.transform = `translateX(${dx * 0.35}px)`;
  });

  const release = () => {
    if (!active) return;
    active = false;
    sheet.style.transition = '';
    sheet.style.transform = '';
    if (axis === 'y' && dy > 90) close();
    else if (axis === 'x' && dx < -60) onNext?.();
    else if (axis === 'x' && dx > 60) onPrev?.();
  };
  sheet.addEventListener('pointerup', release);
  sheet.addEventListener('pointercancel', release);
}

/** Confirm dialog that reads better than window.confirm on a phone. */
export function confirmSheet(title, message, confirmLabel = 'Confirm') {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => { if (!settled) { settled = true; resolve(value); } };
    const { close } = openSheet((dismiss) => h('div', { class: 'confirm' },
      h('h2', {}, title),
      h('p', { class: 'muted' }, message),
      h('div', { class: 'confirm-actions' },
        h('button', { class: 'btn btn-ghost', onclick: () => { done(false); dismiss(); } }, 'Cancel'),
        h('button', { class: 'btn btn-danger', onclick: () => { done(true); dismiss(); } }, confirmLabel),
      ),
    ), { onClose: () => done(false) });
    return close;
  });
}

export function toast(message) {
  const node = h('div', { class: 'toast' }, message);
  document.body.append(node);
  requestAnimationFrame(() => node.classList.add('is-on'));
  setTimeout(() => {
    node.classList.remove('is-on');
    setTimeout(() => node.remove(), 250);
  }, 2200);
}

export const fmtWeight = (w, unit = 'kg') =>
  w === null || w === undefined ? '—' : `${Number(w) % 1 === 0 ? w : Number(w).toFixed(2).replace(/0$/, '')} ${unit}`;

export function relativeDate(iso) {
  const then = new Date(iso + 'T00:00:00');
  const days = Math.round((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
