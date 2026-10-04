// Print, per theme, every distinct colour literal together with the tokens that use
// it — the authoring aid that replaces the hand-written `ramp`, and the one that
// cannot drift because it is derived from the tokens themselves.
//
//   node tools/palette-index.js [theme-id]
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv[2];
const files = readdirSync(join(root, 'themes')).filter((f) => f.endsWith('.json')).sort();

for (const file of files) {
  const theme = JSON.parse(readFileSync(join(root, 'themes', file), 'utf8'));
  if (only !== undefined && theme.id !== only) continue;

  const use = new Map();
  for (const [name, pair] of Object.entries(theme.tokens)) {
    const values = typeof pair === 'string' ? [pair] : [pair.light, pair.dark];
    for (const value of values) {
      for (const m of value.matchAll(/#[0-9a-fA-F]{6,8}|rgba?\([^)]*\)|color-mix\([^)]*\)/g)) {
        const key = m[0].toLowerCase();
        use.set(key, (use.get(key) ?? []).concat(name));
      }
    }
  }

  const label = typeof theme.displayName === 'string'
    ? theme.displayName
    : Object.entries(theme.displayName).map(([locale, text]) => `${text} (${locale})`).join(' / ');
  console.log(`\n[${theme.id}] ${label} — ${use.size} distinct literals / ${Object.keys(theme.tokens).length} tokens`);
  for (const [literal, names] of [...use].sort()) {
    const short = [...new Set(names)].map((n) => n.replace('--dsw-alias-', '').replace('--dsw-', '')).join(', ');
    console.log(`  ${literal.padEnd(52)} ${names.length}x  ${short}`);
  }
}
