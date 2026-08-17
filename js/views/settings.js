// Settings. Mostly about describing your gear accurately — the progression
// engine can only suggest weights you are physically able to load.

import { h, toast, confirmSheet } from '../ui.js';
import { getSettings, saveSettings, exportJSON, importJSON, resetAll, todayISO } from '../state.js';
import { SPLITS } from '../data/plans.js';

function field(label, hint, control) {
  return h('div', { class: 'field' },
    h('label', {}, label),
    control,
    hint && h('p', { class: 'muted small' }, hint),
  );
}

function numberInput(key, { step = 0.25, min = 0 } = {}, onChange) {
  return h('input', {
    type: 'number', value: getSettings()[key], step, min, inputmode: 'decimal',
    onchange: (e) => {
      const value = Number(e.target.value);
      if (Number.isFinite(value) && value >= min) {
        saveSettings({ [key]: value });
        onChange?.();
        toast('Saved');
      }
    },
  });
}

function toggle(key, label) {
  const s = getSettings();
  return h('label', { class: 'switch-row' },
    h('span', {}, label),
    h('input', {
      type: 'checkbox', checked: s[key],
      onchange: (e) => { saveSettings({ [key]: e.target.checked }); toast('Saved'); },
    }),
  );
}

export function renderSettings(root, params, rerender) {
  const s = getSettings();

  const daysControl = h('div', { class: 'seg seg-wide' },
    ...[3, 4, 5].map((n) => h('button', {
      class: `seg-btn${s.daysPerWeek === n ? ' is-on' : ''}`,
      onclick: () => { saveSettings({ daysPerWeek: n }); rerender(); toast('Plan updated'); },
    }, `${n} days`)),
  );

  const split = SPLITS[s.daysPerWeek];

  const importInput = h('input', {
    type: 'file', accept: 'application/json', style: { display: 'none' },
    onchange: async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        importJSON(await file.text());
        toast('Backup restored');
        rerender();
      } catch (err) {
        toast(err.message ?? 'Could not read that file');
      }
    },
  });

  const doExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: `home-workout-backup-${todayISO()}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  root.replaceChildren(
    h('header', { class: 'page-head' },
      h('h1', {}, 'Settings'),
      h('p', { class: 'muted' }, 'Describe your gear accurately and the app will never suggest a weight you cannot load.'),
    ),

    h('section', { class: 'card' },
      h('h3', {}, 'Training days'),
      daysControl,
      h('p', { class: 'muted small' }, split.summary),
    ),

    h('section', { class: 'card' },
      h('h3', {}, 'Your equipment'),
      field('Empty rod weight', 'What the bar weighs with no plates on it.', numberInput('rodWeight', { step: 0.5 })),
      field('Most the rod can hold', 'Total loaded weight, including the rod itself.', numberInput('rodMax', { step: 2.5 })),
      field('Most one dumbbell can hold', 'Per dumbbell, including the handle.', numberInput('dumbbellMax', { step: 1 })),
      field('Smallest rod jump', 'One plate on each side. With 1.25 kg plates that is 2.5 kg.', numberInput('barbellIncrement', { step: 0.25 })),
      field('Smallest dumbbell jump', 'Per dumbbell. Whatever your smallest pair of plates adds.', numberInput('dumbbellIncrement', { step: 0.25 })),
    ),

    h('section', { class: 'card' },
      h('h3', {}, 'During a workout'),
      toggle('restAutoStart', 'Start the rest timer automatically'),
      toggle('sound', 'Sound cues'),
      toggle('vibrate', 'Vibration'),
    ),

    h('section', { class: 'card' },
      h('h3', {}, 'Your data'),
      h('p', { class: 'muted small' },
        'Everything is stored in this browser only — no account, no server. That also means clearing your browsing data erases your training history, so export a backup now and then.'),
      h('div', { class: 'card-actions' },
        h('button', { class: 'btn btn-ghost', onclick: doExport }, 'Export backup'),
        h('button', { class: 'btn btn-ghost', onclick: () => importInput.click() }, 'Restore backup'),
        importInput,
      ),
      h('button', { class: 'btn btn-danger btn-block', onclick: async () => {
        if (await confirmSheet('Erase everything?', 'All logged sessions and settings will be permanently deleted from this device. This cannot be undone.', 'Erase everything')) {
          resetAll();
          rerender();
          toast('All data erased');
        }
      } }, 'Erase all data'),
    ),

    h('p', { class: 'colophon' },
      'Built for a home gym with two loadable dumbbells, a rod, bands and a mat. No bench required, anywhere.'),
  );
}
