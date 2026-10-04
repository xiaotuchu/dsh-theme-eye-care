// Snapshot the official --dsw-*/--shiki-* token names out of a DSH client bundle so
// test/themes.test.js can reject typos without needing app.asar at test time.
//
// usage: node tools/snapshot-official-tokens.js <path-to-ui-theme-client.js> [dshVersion]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
const dshVersion = process.argv[3] ?? '0.2.0-rc.2';
if (!source) {
  console.error('usage: node tools/snapshot-official-tokens.js <ui-theme/lib/client.js> [dshVersion]');
  process.exit(2);
}

const text = readFileSync(source, 'utf8');
const names = new Set();
for (const m of text.matchAll(/(--dsw-[a-z0-9-]+|--shiki-[a-z0-9-]+)\s*:/gi)) names.add(m[1]);

const out = {
  note: 'Token names declared by the official stylesheets. Regenerate when the DSH build changes.',
  dshVersion,
  source: '@deepseek-ai/dsh-client-ui-theme/lib/client.js',
  count: names.size,
  aliasCount: [...names].filter((n) => n.startsWith('--dsw-alias-')).length,
  names: [...names].sort()
};
const target = join(root, 'test', 'official-tokens.json');
writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log(`snapshot written: test/official-tokens.json — ${out.count} tokens (${out.aliasCount} alias) from DSH ${dshVersion}`);
