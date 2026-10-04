// Palette policy for themes/*.json:
//   1. every token name exists in DSH's official --dsw-*/--shiki-* registry
//   2. every value is a non-empty, recognizable CSS value (normalized to a pair)
//   3. all themes define exactly the same token-name set — the payload is positional
//   4. text tokens meet the WCAG contrast floors, both schemes, on every surface
//   5. no non-semantic colour literal is shared between two palettes
//   6. semantic tokens are byte-identical across palettes
//   7. a light surface is never brighter than the canvas (elevation is the stroke's job)
//   8. every theme covers DSH's whole official alias ladder
//
// Shape rules (and rule 3 as a hard build failure) live in src/theme-file.js; this
// suite is the taste layer, so it is expected to evolve.
//
// The name allowlist is a snapshot of the official stylesheets
// (test/official-tokens.json, DSH 0.2.0-rc.2), so a typo can never silently become a
// no-op CSS variable. Re-snapshot with
//   node tools/snapshot-official-tokens.js <ui-theme/lib/client.js> [dshVersion]
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeTheme } from '../src/theme-file.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = JSON.parse(readFileSync(join(root, 'test', 'official-tokens.json'), 'utf8'));

const themeFiles = readdirSync(join(root, 'themes')).filter((f) => f.endsWith('.json')).sort();
const themes = themeFiles.map((f) =>
  normalizeTheme(JSON.parse(readFileSync(join(root, 'themes', f), 'utf8')), f));

const problems = [];
const lines = [];
const say = (msg = '') => lines.push(msg);
const short = (n) => n.replace('--dsw-alias-', '');
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? '  (' + detail + ')' : ''}`);
  if (!ok) problems.push(label + (detail ? ': ' + detail : ''));
};

// ---------------------------------------------------------------- registry
const officialNames = new Set(snapshot.names);
const officialAlias = new Set([...officialNames].filter((n) => n.startsWith('--dsw-alias-')));

const unknownNames = [];
for (const theme of themes) {
  for (const name of Object.keys(theme.tokens)) {
    if (!name.startsWith('--dsw-') && !name.startsWith('--shiki-')) unknownNames.push(`${theme.id}: ${name}`);
    else if (!officialNames.has(name)) unknownNames.push(`${theme.id}: ${name}`);
  }
}
check('every token name is in the official registry', unknownNames.length === 0, unknownNames.slice(0, 4).join(', '));

const badValues = [];
for (const theme of themes) {
  for (const [name, pair] of Object.entries(theme.tokens)) {
    for (const mode of ['light', 'dark']) {
      if (typeof pair[mode] !== 'string' || pair[mode].trim() === '') badValues.push(`${theme.id}/${name}.${mode}`);
    }
  }
}
check('every token has a non-empty value in both schemes', badValues.length === 0, badValues.slice(0, 4).join(', '));

// ---------------------------------------------------------------- parity
const nameSets = new Map(themes.map((t) => [t.id, Object.keys(t.tokens).sort().join('\n')]));
const distinct = new Set(nameSets.values());
check('all themes define the same token-name set', distinct.size === 1,
  distinct.size === 1 ? `${Object.keys(themes[0].tokens).length} names` : `${distinct.size} distinct sets`);

// ---------------------------------------------------------------- leakage
// The three palettes must share NO colour literal except the semantic families
// (status / diff / shiki), which are deliberately identical in every theme because
// they encode meaning rather than style. A literal shared between two palettes means
// a colour survived a remap (e.g. an rgba() triple whose hue was never translated),
// which is invisible to the contrast checks.
//
// Literals are normalized to an "r,g,b" key first: comparing hex against hex and
// rgb() against rgb() separately would miss a colour written `#aabbcc` in one palette
// and `rgba(170,187,204,…)` in another.
const SEMANTIC_TOKEN = [
  /^--dsw-alias-state-(error|success|warn)-/,
  /^--dsw-alias-state-idle-primary$/,
  /^--dsw-alias-code-diff-/,
  /^--dsw-alias-file-diff-/,
  /^--dsw-alias-label-deep-diving/,
  /^--dsw-alias-interactive-bg-hover-danger$/,
  /^--shiki-token-/
];
const isSemantic = (name) => SEMANTIC_TOKEN.some((re) => re.test(name));

/** Literals legitimately identical everywhere: fully transparent fills and the
 *  pure-black dark-mode masks carry no hue, so they are theme-independent. */
const SHARED_LITERALS = new Set(['0,0,0']);
const rgbKey = (r, g, b) => `${r},${g},${b}`;
const HEX6 = /#([0-9a-fA-F]{6})/g;
const RGB = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/g;

function literalsOf(theme) {
  const out = new Map(); // normalized literal -> token
  for (const [name, pair] of Object.entries(theme.tokens)) {
    if (isSemantic(name)) continue;
    for (const value of [pair.light, pair.dark]) {
      for (const m of value.matchAll(HEX6)) {
        out.set(rgbKey(parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)), name);
      }
      for (const m of value.matchAll(RGB)) out.set(rgbKey(+m[1], +m[2], +m[3]), name);
    }
  }
  return out;
}

const literals = new Map(themes.map((t) => [t.id, literalsOf(t)]));
const leaks = [];
for (let i = 0; i < themes.length; i++) {
  for (let j = i + 1; j < themes.length; j++) {
    const a = themes[i].id;
    const b = themes[j].id;
    for (const [literal, token] of literals.get(a)) {
      if (SHARED_LITERALS.has(literal)) continue;
      if (literals.get(b).has(literal)) {
        leaks.push(`${literal} used by both ${a} (${token}) and ${b} (${literals.get(b).get(literal)})`);
      }
    }
  }
}
check('no non-semantic colour is shared between palettes', leaks.length === 0, leaks.slice(0, 3).join(' | '));

const drifts = [];
for (const name of Object.keys(themes[0].tokens)) {
  if (!isSemantic(name)) continue;
  const first = JSON.stringify(themes[0].tokens[name]);
  for (const theme of themes.slice(1)) {
    if (JSON.stringify(theme.tokens[name]) !== first) drifts.push(`${name} (${themes[0].id} vs ${theme.id})`);
  }
}
check('semantic tokens are identical across palettes', drifts.length === 0, drifts.slice(0, 3).join(', '));

// ---------------------------------------------------------------- surface ladder
// A raised surface brighter than the canvas reads as "white panel on cream". The
// settings modal paints bg-layer-1/2: while those were #fdfbf5 on a #f5f0e1 base,
// 89% of a real screenshot of the settings screen was #fdfbf5 — the cream never
// showed. The official light palette keeps bg-base === bg-layer-1/2/3 === #fff,
// i.e. elevation is carried by the stroke/shadow tokens, not by a lighter fill.
// Dark values are exempt: there a lighter fill IS the elevation cue.
const BRIGHT_SURFACES = [
  '--dsw-alias-bg-layer-1',
  '--dsw-alias-bg-layer-2',
  '--dsw-alias-bg-layer-3',
  '--dsw-alias-button-elevated-fill',
  '--dsw-alias-button-floating-fill',
  '--dsw-alias-markdown-code-segment-selected',
  '--dsw-alias-onboarding-secondary-fill',
  '--dsw-specific-input-major',
  '--dsw-static-neutral-50',
  '--dsw-alias-switch-thumb',
  '--dsw-alias-label-primary-foreground',
  '--dsw-alias-label-primary-inverted',
  '--dsw-alias-toast-label',
  '--dsw-static-neutral-00',
  '--dsw-static-neutral-bluish-00'
];
const tooBright = [];
for (const theme of themes) {
  const base = parseColor(theme.tokens['--dsw-alias-bg-base'].light);
  if (!base) {
    problems.push(`${theme.id}: bg-base light must be a hex literal to check the surface ladder`);
    continue;
  }
  for (const name of BRIGHT_SURFACES) {
    const colour = parseColor(theme.tokens[name].light);
    if (!colour) {
      problems.push(`${theme.id}: ${short(name)} light must be a hex literal to check the surface ladder`);
      continue;
    }
    const delta = luminance(colour) - luminance(base);
    if (delta > 0.01) tooBright.push(`${theme.id}: ${short(name)} +${delta.toFixed(3)}`);
  }
}
check('no light surface is brighter than the canvas', tooBright.length === 0, tooBright.slice(0, 3).join(', '));

// ---------------------------------------------------------------- contrast
const THRESHOLDS = {
  '--dsw-alias-label-primary': 9,
  '--dsw-alias-label-secondary': 5.5,
  '--dsw-alias-label-tertiary': 4.5,
  '--dsw-alias-label-caption': 2.5
};
const ACCENTS = [
  ['--dsw-alias-link', 4.5],
  ['--dsw-alias-state-business-primary', 4.5],
  ['--dsw-alias-button-info-fill', 4.5]
];
const SURFACES = ['--dsw-alias-bg-base', '--dsw-alias-bg-layer-1', '--dsw-alias-bg-module-platform', '--dsw-alias-markdown-code-block'];

function parseColor(value) {
  const hex = /^#([0-9a-fA-F]{6})$/.exec(value.trim());
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(value.trim());
  if (rgb) {
    const parts = rgb[1].split(',').map((p) => parseFloat(p));
    if (parts.length >= 3 && parts.slice(0, 3).every((n) => Number.isFinite(n))) return parts.slice(0, 3);
  }
  return null;
}
function luminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const contrastFailures = [];
const coverageFailures = [];
const uncomparable = [];
say(`tokens per theme       : ${Object.keys(themes[0].tokens).length}`);
say(`official registry      : DSH ${snapshot.dshVersion}, ${snapshot.count} tokens (${snapshot.aliasCount} alias)`);
say(`themes                 : ${themes.map((t) => t.id).join(', ')}`);

for (const theme of themes) {
  const colorOf = (name, mode) => (theme.tokens[name] ? parseColor(theme.tokens[name][mode]) : null);
  const covered = [...officialAlias].filter((n) => n in theme.tokens).length;
  if (covered !== officialAlias.size) {
    const missing = [...officialAlias].filter((n) => !(n in theme.tokens));
    coverageFailures.push(`${theme.id}: ${covered}/${officialAlias.size} (missing ${missing.join(', ')})`);
  }
  say('');
  say(`[${theme.id}]  ${theme.displayName}   alias coverage ${covered}/${officialAlias.size}`);

  for (const mode of ['light', 'dark']) {
    const rows = [];
    for (const surface of SURFACES) {
      for (const text of Object.keys(THRESHOLDS)) {
        const fg = colorOf(text, mode);
        const bg = colorOf(surface, mode);
        if (!fg || !bg) {
          uncomparable.push(`${theme.id} ${mode}: ${short(text)} on ${short(surface)}`);
          continue;
        }
        const c = contrast(fg, bg);
        rows.push({ surface, text, c, need: THRESHOLDS[text] });
        if (c < THRESHOLDS[text]) {
          contrastFailures.push(`${theme.id} ${mode}: ${short(text)} on ${short(surface)} is ${c.toFixed(2)}:1 (need >= ${THRESHOLDS[text]})`);
        }
      }
    }
    for (const [name, need] of ACCENTS) {
      const fg = colorOf(name, mode);
      if (!fg) continue;
      const c = contrast(fg, colorOf('--dsw-alias-bg-base', mode));
      rows.push({ surface: '--dsw-alias-bg-base', text: name, c, need });
      if (c < need) contrastFailures.push(`${theme.id} ${mode}: ${short(name)} on bg-base is ${c.toFixed(2)}:1 (need >= ${need})`);
    }
    // Report the tightest three rows so a marginal theme stays visible.
    const tight = [...rows].sort((a, b) => a.c - a.need - (b.c - b.need)).slice(0, 3);
    say(`  [${mode}] tightest: ` + tight.map((r) => `${short(r.text)}/${short(r.surface).replace('bg-', '')} ${r.c.toFixed(2)} (>=${r.need})`).join('  '));
  }
}
check('contrast floors hold on every surface and scheme', contrastFailures.length === 0, contrastFailures.slice(0, 3).join(' | '));
check('every contrast comparison had literal colours to work with', uncomparable.length === 0, uncomparable.slice(0, 3).join(', '));
check('every theme covers the whole official alias ladder', coverageFailures.length === 0, coverageFailures.join(' | '));

// ---------------------------------------------------------------- payload
const names = Object.keys(themes[0].tokens);
const misaligned = themes.filter((t) => Object.keys(t.tokens).length !== names.length);
check('the positional payload has one value per name in every palette',
  misaligned.length === 0, misaligned.map((t) => t.id).join(', '));

console.log(lines.join('\n'));
if (problems.length) {
  throw new Error(problems.length + ' problem(s):\n  - ' + problems.join('\n  - '));
}
console.log(`\nOK: ${themes.length} palettes are valid (${names.length} tokens each).`);
