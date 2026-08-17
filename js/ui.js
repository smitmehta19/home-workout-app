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

/** A bottom sheet for exercise detail. Returns a close function. */
export function openSheet(build, { onClose } = {}) {
  const body = h('div', { class: 'sheet-body' });
  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' },
    h('button', { class: 'sheet-grab', 'aria-label': 'Close', onclick: () => close() }),
    body,
  );
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: (e) => { if (e.target === backdrop) close(); } }, sheet);

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    backdrop.classList.add('is-closing');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => {
      backdrop.remove();
      document.body.classList.remove('sheet-open');
      onClose?.();
    }, 180);
  }
  const onKey = (e) => e.key === 'Escape' && close();

  document.addEventListener('keydown', onKey);
  document.body.classList.add('sheet-open');
  document.body.append(backdrop);
  append(body, [build(close)]);
  requestAnimationFrame(() => backdrop.classList.add('is-open'));
  return close;
}

/** Confirm dialog that reads better than window.confirm on a phone. */
export function confirmSheet(title, message, confirmLabel = 'Confirm') {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => { if (!settled) { settled = true; resolve(value); } };
    const close = openSheet((dismiss) => h('div', { class: 'confirm' },
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
