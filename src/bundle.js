// Assemble lib/client.js from themes/*.json + src/runtime/*.
//
// The runtime is a real file: the build substitutes exactly one marker and wraps
// the result in the ModuleLoader envelope. No part of the client half is expressed
// as a string template here, which is what makes `src/runtime/client.cjs` the code
// that actually ships — reading it is reading production.
//
// Determinism: themes are sorted by file name, the output is LF-only with a single
// trailing newline, and nothing time- or version-dependent is embedded, so two runs
// on any machine produce identical bytes.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTheme } from './theme-file.js';
import { emitPayload } from './payload.js';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const OUTPUT = join(root, 'lib', 'client.js');

const MARKER = '/* @__PAYLOAD__ */';

/** Normalized themes, sorted by file name. */
export function readThemes() {
  const dir = join(root, 'themes');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  if (files.length === 0) throw new Error('no theme files in themes/');
  return files.map((file) => parseTheme(readFileSync(join(dir, file), 'utf8'), file));
}

/** One rule per line, no comments: joining with "" is the whole minification. */
export function readRowCss() {
  return readFileSync(join(root, 'src', 'runtime', 'row.css'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join('');
}

/**
 * @returns the generated bundle source, the themes it embeds, and the package manifest.
 */
export function render() {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const themes = readThemes();
  const runtime = readFileSync(join(root, 'src', 'runtime', 'client.cjs'), 'utf8');
  if (!runtime.includes(MARKER)) {
    throw new Error(`src/runtime/client.cjs is missing its "${MARKER}" marker`);
  }

  // A function replacement keeps `$&` / `$'` sequences inside the payload literal.
  const payload = emitPayload({ pkgName: pkg.name, themes, css: readRowCss() });
  const body = runtime.replace(MARKER, () => payload);

  const bundle = [
    '// GENERATED FILE — edit themes/*.json and src/runtime, then run `node src/build.js`.',
    'window.__ModuleLoader__.load({',
    `\tid: ${JSON.stringify(pkg.name)},`,
    '\tfactory: (require) => {',
    '\t\tvar module = { exports: {} };',
    '\t\tvar exports = module.exports;',
    '\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
    '',
    ...body.split('\n').map((line) => (line === '' ? '' : '\t\t' + line)),
    '',
    '\t\treturn module.exports;',
    '\t}',
    '});',
    ''
  ].join('\n');

  return { bundle, themes, pkg };
}
