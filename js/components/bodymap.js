// Interactive muscle chart.
//
// A stylised anatomical figure, front and back, where every muscle group is its
// own tappable region. A plain silhouette is drawn first so the shape reads as a
// body; the muscle regions sit on top of it. Paths are authored for the right
// half only and mirrored about the centre line, so the figure stays symmetrical
// and there is one shape to maintain per muscle.

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}) => {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
};

const MIRROR = 'translate(220,0) scale(-1,1)';

// The body outline. Not selectable — it just gives the muscles something to
// sit on so the figure doesn't read as a pile of floating blobs.
const SILHOUETTE = [
  { tag: 'ellipse', attrs: { cx: 110, cy: 34, rx: 18, ry: 22 } },
  { tag: 'path', attrs: { d: 'M101,48 h18 v22 h-18 Z' } },
  { tag: 'path', mirror: true, attrs: { d: 'M110,58 L133,68 Q143,80 141,106 L137,152 Q134,180 130,201 L110,201 Z' } },
  { tag: 'path', mirror: true, attrs: { d: 'M137,74 Q154,80 156,102 L152,166 Q150,198 146,224 L134,224 Q138,196 140,166 L138,108 Z' } },
  { tag: 'ellipse', mirror: true, attrs: { cx: 140, cy: 233, rx: 8, ry: 11 } },
  { tag: 'path', mirror: true, attrs: { d: 'M111,198 L133,200 Q141,242 136,288 Q132,332 129,372 L114,372 Q113,300 111,250 Z' } },
  { tag: 'path', mirror: true, attrs: { d: 'M114,366 L130,366 Q134,381 128,385 L114,385 Q111,376 114,366 Z' } },
];

// Shared shapes — the arm sits in the same place whichever way the figure faces.
const DELTS    = 'M130,66 Q149,70 154,90 Q155,103 148,108 Q136,101 130,86 Z';
const UPPER_ARM= 'M139,112 Q152,118 152,138 Q151,155 143,158 Q136,136 138,114 Z';
const FOREARM  = 'M143,168 Q153,180 152,202 Q151,215 145,219 Q139,196 141,170 Z';
const CALF     = 'M117,300 Q130,307 129,330 Q127,352 122,364 L115,364 Q114,330 117,300 Z';

const FRONT = [
  { id: 'front-delts', mirror: true,  d: DELTS },
  { id: 'chest',       mirror: true,  d: 'M111,80 L134,84 Q141,95 138,112 Q125,119 111,117 Z' },
  { id: 'biceps',      mirror: true,  d: UPPER_ARM },
  { id: 'forearms',    mirror: true,  d: FOREARM },
  { id: 'obliques',    mirror: true,  d: 'M121,122 Q134,128 133,150 Q131,173 121,192 Q124,157 121,122 Z' },
  { id: 'abs',         mirror: false, d: 'M99,120 L121,120 Q124,158 119,196 L101,196 Q96,158 99,120 Z' },
  { id: 'adductors',   mirror: true,  d: 'M111,206 L117,208 Q116,240 114,264 L110,264 Q110,232 111,206 Z' },
  { id: 'quads',       mirror: true,  d: 'M118,204 Q134,211 135,240 Q133,272 127,294 L118,294 Q115,248 118,204 Z' },
  { id: 'calves',      mirror: true,  d: CALF },
];

const BACK = [
  { id: 'traps',       mirror: false, d: 'M110,58 L132,70 Q138,90 129,106 L110,112 L91,106 Q82,90 88,70 Z' },
  { id: 'rear-delts',  mirror: true,  d: DELTS },
  { id: 'upper-back',  mirror: true,  d: 'M112,112 Q126,116 126,137 L112,142 Z' },
  { id: 'lats',        mirror: true,  d: 'M127,110 Q142,120 143,146 Q137,167 124,175 Q126,142 127,110 Z' },
  { id: 'triceps',     mirror: true,  d: UPPER_ARM },
  { id: 'forearms',    mirror: true,  d: FOREARM },
  { id: 'lower-back',  mirror: false, d: 'M99,146 L121,146 Q125,168 121,190 L99,190 Q95,168 99,146 Z' },
  { id: 'glutes',      mirror: true,  d: 'M111,198 Q132,201 134,219 Q131,237 114,239 Q109,219 111,198 Z' },
  { id: 'hamstrings',  mirror: true,  d: 'M117,243 Q133,249 133,274 Q130,293 124,303 L116,303 Q114,273 117,243 Z' },
  { id: 'calves',      mirror: true,  d: CALF },
];

/**
 * Build one side of the chart.
 * @param {'front'|'back'} view
 * @param {{selected?: string, onSelect?: (muscleId: string) => void}} opts
 */
export function createBodyMap(view, { selected = null, onSelect } = {}) {
  const regions = view === 'front' ? FRONT : BACK;

  const svg = el('svg', {
    viewBox: '0 0 220 396',
    class: 'bodymap',
    role: 'group',
    'aria-label': `${view === 'front' ? 'Front' : 'Back'} of body — select a muscle`,
  });

  for (const part of SILHOUETTE) {
    svg.appendChild(el(part.tag, { ...part.attrs, class: 'bm-silhouette' }));
    if (part.mirror) svg.appendChild(el(part.tag, { ...part.attrs, class: 'bm-silhouette', transform: MIRROR }));
  }

  const add = (region, mirrored) => {
    const path = el('path', {
      d: region.d,
      class: `bm-region${selected === region.id ? ' is-selected' : ''}`,
      'data-muscle': region.id,
      // Only the left-hand copy takes keyboard focus, so tabbing hits each
      // muscle once rather than twice.
      tabindex: mirrored ? '-1' : '0',
      role: 'button',
      'aria-label': region.id.replace(/-/g, ' '),
      'aria-pressed': selected === region.id ? 'true' : 'false',
    });
    if (mirrored) path.setAttribute('transform', MIRROR);
    path.addEventListener('click', () => onSelect?.(region.id));
    path.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect?.(region.id);
      }
    });
    svg.appendChild(path);
  };

  for (const region of regions) {
    add(region, false);
    if (region.mirror) add(region, true);
  }

  return svg;
}
