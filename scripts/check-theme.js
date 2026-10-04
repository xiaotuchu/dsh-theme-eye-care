// Validate every theme in themes/*.json:
//  1. every token name exists in DSH's official --dsw-*/--shiki-* registry
//  2. every value is a { light, dark } pair of non-empty, recognizable CSS values
//  3. all themes define exactly the same token-name set (so no theme silently
//     lacks a colour the others have)
//  4. text tokens meet the WCAG contrast floors, in both schemes, on every
//     surface the text actually sits on
//  5. every theme covers DSH's whole official alias ladder
//
// The name allowlist is a snapshot of the official stylesheets
// (scripts/official-tokens.json, DSH 0.2.0-rc.2), so a typo can never silently
// become a no-op CSS variable. Re-snapshot with
//   node scripts/snapshot-official-tokens.js <ui-theme/lib/client.js> [dshVersion]
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = JSON.parse(readFileSync(join(root, 'scripts', 'official-tokens.json'), 'utf8'));

const themeFiles = readdirSync(join(root, 'themes')).filter((f) => f.endsWith('.json')).sort();
if (themeFiles.length === 0) {
  console.error('no theme files found in themes/');
  process.exit(1);
}
const themes = themeFiles.map((f) => ({ file: f, ...JSON.parse(readFileSync(join(root, 'themes', f), 'utf8')) }));

const problems = [];
const lines = [];
const say = (msg = '') => lines.push(msg);
const short = (n) => n.replace('--dsw-alias-', '');

// ---------------------------------------------------------------- registry
const officialNames = new Set(snapshot.names);
const officialAlias = new Set([...officialNames].filter((n) => n.startsWith('--dsw-alias-')));

// ---------------------------------------------------------------- shapes
const CSS_VALUE = /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|color-mix\(|var\(|linear-gradient\(|transparent|currentColor)/;
const seenNameSets = new Map();

for (const theme of themes) {
  const label = theme.id ?? theme.file;
  if (typeof theme.id !== 'string' || theme.id === '') problems.push(`${theme.file}: missing "id"`);
  if (typeof theme.displayName !== 'string' || theme.displayName === '') problems.push(`${theme.file}: missing "displayName"`);
  if (theme.colorScheme !== 'light' && theme.colorScheme !== 'dark') problems.push(`${theme.file}: colorScheme must be "light" or "dark"`);
  if (!Array.isArray(theme.source) || theme.source.some((c) => !/^#[0-9a-fA-F]{6}$/.test(c))) problems.push(`${theme.file}: "source" must be a list of #rrggbb`);
  if (typeof theme.tokens !== 'object' || theme.tokens === null) {
    problems.push(`${theme.file}: missing "tokens"`);
    continue;
  }

  for (const name of Object.keys(theme.tokens)) {
    if (!name.startsWith('--dsw-') && !name.startsWith('--shiki-')) problems.push(`${label}: not a --dsw-/--shiki- token: ${name}`);
    else if (!officialNames.has(name)) problems.push(`${label}: unknown token (typo, or new in a later DSH): ${name}`);
  }
  for (const [name, pair] of Object.entries(theme.tokens)) {
    if (typeof pair !== 'object' || pair === null || Array.isArray(pair)) {
      problems.push(`${label}: ${name} value must be a { light, dark } object`);
      continue;
    }
    for (const key of Object.keys(pair)) {
      if (key !== 'light' && key !== 'dark') problems.push(`${label}: ${name} has unexpected mode key "${key}"`);
    }
    for (const mode of ['light', 'dark']) {
      const v = pair[mode];
      if (typeof v !== 'string' || v.trim() === '') problems.push(`${label}: ${name}.${mode} is missing`);
      else if (!CSS_VALUE.test(v.trim())) problems.push(`${label}: ${name}.${mode} is not a recognized CSS value: ${v}`);
    }
  }

  const names = Object.keys(theme.tokens).sort().join('\n');
  seenNameSets.set(names, (seenNameSets.get(names) ?? []).concat(label));
}

// Cross-theme parity: exactly one distinct name set across all themes.
const nameSetGroups = [...seenNameSets.values()];
if (nameSetGroups.length > 1) {
  const [first, ...rest] = nameSetGroups;
  const firstSet = new Set(Object.keys(themes.find((t) => t.id === first[0]).tokens));
  for (const group of rest) {
    const otherSet = new Set(Object.keys(themes.find((t) => t.id === group[0]).tokens));
    const missing = [...firstSet].filter((n) => !otherSet.has(n));
    const extra = [...otherSet].filter((n) => !firstSet.has(n));
    problems.push(`token-name sets differ: ${first.join('/')} vs ${group.join('/')} (missing in ${group.join('/')}: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? '…' : ''}; extra: ${extra.slice(0, 6).join(', ')}${extra.length > 6 ? '…' : ''})`);
  }
}

// ---------------------------------------------------------------- leakage
// The three palettes must share NO colour literal except the semantic families
// (status / diff / shiki), which are deliberately identical in every theme
// because they encode meaning rather than style. A literal shared between two
// palettes means a colour survived a remap (e.g. an rgba() triple whose hue was
// never translated), which is invisible to the contrast checks.
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

function literalsOf(theme) {
  const out = new Map(); // literal -> token
  for (const [name, pair] of Object.entries(theme.tokens)) {
    if (isSemantic(name)) continue;
    for (const value of [pair.light, pair.dark]) {
      for (const m of value.matchAll(/#[0-9a-fA-F]{6}/g)) out.set(m[0].toLowerCase(), name);
      for (const m of value.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)) out.set(`${m[1]},${m[2]},${m[3]}`, name);
    }
  }
  return out;
}

const literals = new Map(themes.map((t) => [t.id, literalsOf(t)]));
for (let i = 0; i < themes.length; i++) {
  for (let j = i + 1; j < themes.length; j++) {
    const a = themes[i].id;
    const b = themes[j].id;
    for (const [literal, token] of literals.get(a)) {
      if (SHARED_LITERALS.has(literal)) continue;
      if (literals.get(b).has(literal)) {
        problems.push(`colour leak: ${literal} is used by both ${a} (${token}) and ${b} (${literals.get(b).get(literal)}) — a non-semantic colour was not translated`);
      }
    }
  }
}

// Semantic tokens must be byte-identical across palettes.
for (const name of Object.keys(themes[0].tokens)) {
  if (!isSemantic(name)) continue;
  const first = JSON.stringify(themes[0].tokens[name]);
  for (const theme of themes.slice(1)) {
    if (JSON.stringify(theme.tokens[name]) !== first) {
      problems.push(`semantic token drift: ${name} differs between ${themes[0].id} and ${theme.id}`);
    }
  }
}

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
for (const theme of themes) {
  const base = parseColor(theme.tokens['--dsw-alias-bg-base']?.light ?? '');
  if (!base) {
    problems.push(`${theme.id}: bg-base light must be a hex literal to check the surface ladder`);
    continue;
  }
  for (const name of BRIGHT_SURFACES) {
    const raw = theme.tokens[name]?.light;
    const colour = raw ? parseColor(raw) : null;
    if (!colour) {
      problems.push(`${theme.id}: ${short(name)} light must be a hex literal to check the surface ladder`);
      continue;
    }
    const delta = luminance(colour) - luminance(base);
    if (delta > 0.01) {
      problems.push(
        `${theme.id}: ${short(name)} is ${delta.toFixed(3)} luminance brighter than bg-base — a surface brighter than the canvas reads as white; keep it equal to bg-base and let the stroke/shadow tokens carry elevation`
      );
    }
  }
}

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
const OFFICIAL_LIGHT = {
  '--dsw-alias-bg-base': '#ffffff',
  '--dsw-alias-bg-layer-1': '#ffffff',
  '--dsw-alias-bg-module-platform': '#f5f6f7',
  '--dsw-alias-markdown-code-block': '#f9fafb',
  '--dsw-alias-label-primary': '#0f1115',
  '--dsw-alias-label-secondary': '#61666b',
  '--dsw-alias-label-tertiary': '#545557',
  '--dsw-alias-label-caption': '#a2a4a6'
};

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

say(`tokens per theme       : ${Object.keys(themes[0].tokens).length}`);
say(`official registry      : DSH ${snapshot.dshVersion}, ${snapshot.count} tokens (${snapshot.aliasCount} alias)`);
say(`themes                 : ${themes.map((t) => t.id).join(', ')}`);
say('');

for (const theme of themes) {
  const label = theme.id;
  const colorOf = (name, mode) => {
    const v = theme.tokens[name]?.[mode];
    return v ? parseColor(v) : null;
  };
  const covered = [...officialAlias].filter((n) => n in theme.tokens).length;
  if (covered !== officialAlias.size) {
    const missing = [...officialAlias].filter((n) => !(n in theme.tokens));
    problems.push(`${label}: alias ladder coverage ${covered}/${officialAlias.size} (missing ${missing.join(', ')})`);
  }
  say(`[${label}]  ${theme.displayName}   alias coverage ${covered}/${officialAlias.size}`);

  for (const mode of ['light', 'dark']) {
    const worst = [];
    for (const surface of SURFACES) {
      for (const text of Object.keys(THRESHOLDS)) {
        const fg = colorOf(text, mode);
        const bg = colorOf(surface, mode);
        if (!fg || !bg) {
          problems.push(`${label} ${mode}: cannot compare ${short(text)} on ${short(surface)} (needs literal colours)`);
          continue;
        }
        const c = contrast(fg, bg);
        worst.push({ surface, text, c, need: THRESHOLDS[text] });
        if (c < THRESHOLDS[text]) {
          problems.push(`${label} ${mode}: ${short(text)} on ${short(surface)} is ${c.toFixed(2)}:1 (need >= ${THRESHOLDS[text]})`);
        }
      }
    }
    for (const [name, need] of ACCENTS) {
      const fg = colorOf(name, mode);
      const bg = colorOf('--dsw-alias-bg-base', mode);
      if (!fg) continue;
      const c = contrast(fg, bg);
      worst.push({ surface: '--dsw-alias-bg-base', text: name, c, need });
      if (c < need) problems.push(`${label} ${mode}: ${short(name)} on bg-base is ${c.toFixed(2)}:1 (need >= ${need})`);
    }
    // Report the tightest three rows so a marginal theme is visible.
    const tight = [...worst].sort((a, b) => a.c - a.need - (b.c - b.need)).slice(0, 3);
    say(`  [${mode}] tightest: ` + tight.map((r) => `${short(r.text)}/${short(r.surface).replace('bg-', '')} ${r.c.toFixed(2)} (>=${r.need})`).join('  '));
  }
  say('');
}

console.log(lines.join('\n'));
if (problems.length) {
  console.error(problems.length + ' PROBLEM(S):');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log(`OK: ${themes.length} themes are valid.`);
