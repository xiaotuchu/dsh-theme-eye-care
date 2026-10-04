// P1 — the committed artifact is exactly what the current sources produce, and the
// build's pure steps behave. The comparison runs in-process (import render() rather
// than spawning `src/build.js --check`) so it needs no child process.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OUTPUT, render } from '../src/bundle.js';
import { assertSharedNames, normalizeTheme, parseTheme } from '../src/theme-file.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? '  (' + detail + ')' : ''}`);
  if (!ok) problems.push(label + (detail ? ': ' + detail : ''));
};
/** @returns the thrown message, or null when the call did not throw. */
const throws = (fn) => {
  try {
    fn();
    return null;
  } catch (error) {
    return error.message;
  }
};

// ---------------------------------------------------------------- artifact
const artifact = readFileSync(OUTPUT, 'utf8');
const { bundle, themes } = render();

check('the committed artifact equals a fresh render', artifact === bundle,
  artifact === bundle ? '' : `committed ${artifact.length} chars vs rendered ${bundle.length}`);
check('the artifact has no unsubstituted payload marker', !artifact.includes('@__PAYLOAD__'));
check('the artifact is LF-only', !artifact.includes('\r'));
check('the artifact ends with exactly one newline', artifact.endsWith('\n') && !artifact.endsWith('\n\n'));

// The artifact is one fixed runtime + one shared name table + ~4.5 KB of value
// vectors per palette, so the budget has to scale with the catalogue: a flat 28 KB
// would fail the documented "copy a theme file and rebuild" workflow on palette #4.
const budget = 16 * 1024 + themes.length * 5 * 1024;
const size = Buffer.byteLength(artifact);
check(`the artifact stays inside its size budget (${Math.round(budget / 1024)} KB for ${themes.length} palettes)`,
  size <= budget, `${size} bytes`);

// One shared name table is the whole point of the positional payload; if it were
// emitted per palette the artifact would grow without the size guard noticing.
check('the shared token-name table is emitted exactly once',
  artifact.split('var TOKEN_NAMES').length === 2);

check('the artifact embeds every palette', themes.every((t) => artifact.includes(`id: ${JSON.stringify(t.id)}`)));

// The payload must be positional: one name table, and both vectors per palette.
const nameCount = Object.keys(themes[0].tokens).length;
check('the payload has one shared name table and two vectors per palette',
  themes.every((t) => Object.keys(t.tokens).length === nameCount), `${nameCount} names`);

// ---------------------------------------------------------------- theme-file
const expanded = normalizeTheme({
  id: 'sample',
  displayName: '样例',
  colorScheme: 'light',
  source: ['#ffffff'],
  tokens: {
    '--dsw-alias-bg-base': '#ffffff',
    '--dsw-alias-label-primary': { light: '#000000', dark: '#ffffff' }
  }
}, 'sample.json');
check('a shorthand token expands to an equal pair',
  expanded.tokens['--dsw-alias-bg-base'].light === '#ffffff' &&
    expanded.tokens['--dsw-alias-bg-base'].dark === '#ffffff');
check('every normalized value is a { light, dark } pair of strings',
  Object.values(expanded.tokens).every((p) => typeof p.light === 'string' && typeof p.dark === 'string'));

const sample = (over) => () => normalizeTheme({
  id: 'sample', displayName: '样例', colorScheme: 'light', source: ['#ffffff'],
  tokens: { '--dsw-alias-bg-base': '#ffffff' }, ...over
}, 'sample.json');
check('a non-token name is rejected', throws(sample({ tokens: { color: '#fff' } })) !== null);
check('a half-specified pair is rejected',
  throws(sample({ tokens: { '--dsw-alias-bg-base': { light: '#fff' } } })) !== null);
check('an unknown mode key is rejected',
  throws(sample({ tokens: { '--dsw-alias-bg-base': { light: '#fff', dark: '#fff', auto: '#fff' } } })) !== null);
check('a non-CSS value is rejected',
  throws(sample({ tokens: { '--dsw-alias-bg-base': 'not-a-colour' } })) !== null);
check('a bad colorScheme is rejected', throws(sample({ colorScheme: 'sepia' })) !== null);
check('a bad source list is rejected', throws(sample({ source: ['white'] })) !== null);
check('structural errors name the file', (throws(sample({ colorScheme: 'sepia' })) ?? '').includes('sample.json'));

// displayName is package text: a plain string, or a { locale: label } map that
// `locale.resolveText` can walk. The map must carry `en`, which is the fallback.
const named = normalizeTheme({
  id: 'sample', displayName: { zh: '样例', en: 'Sample' }, colorScheme: 'light',
  source: ['#ffffff'], tokens: { '--dsw-alias-bg-base': '#ffffff' }
}, 'sample.json');
check('a displayName map is preserved as authored',
  JSON.stringify(named.displayName) === JSON.stringify({ zh: '样例', en: 'Sample' }),
  JSON.stringify(named.displayName));
check('a plain-string displayName still works', named.displayName !== undefined);
check('a displayName map without "en" is rejected',
  (throws(sample({ displayName: { zh: '样例' } })) ?? '').includes('"en"'),
  throws(sample({ displayName: { zh: '样例' } })) ?? '');
check('a displayName map with an uppercase locale key is rejected',
  throws(sample({ displayName: { ZH: '样例', en: 'Sample' } })) !== null);
check('a displayName map with an empty label is rejected',
  throws(sample({ displayName: { zh: '', en: 'Sample' } })) !== null);
check('a non-string, non-map displayName is rejected', throws(sample({ displayName: 42 })) !== null);

// Windows editors add a BOM by habit and JSON.parse then fails with a message that
// never mentions the file; both halves of that are fixed here.
const valid = JSON.stringify({
  id: 'x', displayName: 'X', colorScheme: 'light', source: ['#ffffff'],
  tokens: { '--dsw-alias-bg-base': '#ffffff' }
});
check('a UTF-8 BOM is stripped instead of breaking the parse',
  parseTheme('\uFEFF' + valid, 'x.json').tokens['--dsw-alias-bg-base'].light === '#ffffff');
const badJson = throws(() => parseTheme('{ "id": "x", }', 'broken.json'));
check('bad JSON is reported with the file name', (badJson ?? '').includes('broken.json'), badJson ?? '');
check('bad JSON still reads like a theme error', (badJson ?? '').startsWith('themes/broken.json:'), badJson ?? '');

// Positional payloads depend on this, so it must fail loudly and name both sides.
const mismatch = throws(() => assertSharedNames([
  { id: 'base', tokens: { a: {}, b: {} } },
  { id: 'drifted', tokens: { a: {}, c: {} } }
]));
check('a token-name mismatch is a build error', mismatch !== null);
check('the mismatch error names the offending theme', (mismatch ?? '').includes('drifted'));
check('the mismatch error lists missing and extra',
  (mismatch ?? '').includes('missing: b') && (mismatch ?? '').includes('extra: c'));
check('a matching set passes and returns the shared table',
  JSON.stringify(assertSharedNames([{ id: 'a', tokens: { x: {}, y: {} } }, { id: 'b', tokens: { y: {}, x: {} } }])) ===
    JSON.stringify(['x', 'y']));

if (problems.length) {
  throw new Error(problems.length + ' problem(s):\n  - ' + problems.join('\n  - '));
}
console.log('OK: the committed client bundle is in sync with its sources, and the build steps behave.');
