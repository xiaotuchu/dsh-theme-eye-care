// Test-only fixture: use the installed host's UI primitives without starting DSH.
// Usage: node tools/prepare-host-preview.mjs <app.asar> <esbuild/lib/main.js>
// Extracted host assets stay in ignored artifacts and are never packaged.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [asarPath, esbuildPath] = process.argv.slice(2);
if (!asarPath || !esbuildPath) throw new Error('Pass app.asar and esbuild/lib/main.js paths');
const archive = await readFile(asarPath);
const header = JSON.parse(archive.subarray(16, 16 + archive.readUInt32LE(12)).toString());
const base = 8 + archive.readUInt32LE(4);
const assets = header.files.dsh.files.node_modules.files['@deepseek-ai']
  .files['dsh-web-frontend'].files.dist.files.assets.files;
const assetText = (entry) => archive.subarray(base + Number(entry.offset), base + Number(entry.offset) + entry.size);
const mainName = Object.keys(assets).find(name => /^index-.*\.js$/.test(name));
const source = assetText(assets[mainName]).toString();
const boot = source.search(/const \w+=globalThis\.dshDesktopBoot/);
const primitives = source.match(/"@deepseek-ai\/dsh-client-ui-primitives":(\w+)/)?.[1];
const react = source.match(/\breact:(\w+),"react\/jsx-runtime"/)?.[1];
const reactDom = source.match(/"react-dom\/client":(\w+)/)?.[1];
if (boot < 0 || !primitives || !react || !reactDom) {
  throw new Error('Host bundle layout changed; update fixture extraction before running it');
}
const directory = resolve('artifacts/host/assets');
await mkdir(directory, { recursive: true });
for (const [name, entry] of Object.entries(assets)) {
  if (entry.offset !== undefined) await writeFile(join(directory, name), assetText(entry));
}
const entry = join(directory, 'fixture-entry.js');
await writeFile(entry, source.slice(0, boot) +
  `\nwindow.fixtureHost={primitives:${primitives},React:${react},ReactDOM:${reactDom}};`);
const { build } = await import(pathToFileURL(resolve(esbuildPath)).href);
await build({ entryPoints: [entry], outfile: 'artifacts/host-primitives-fixture.js',
  bundle: true, format: 'iife', platform: 'browser', loader: { '.css': 'empty' },
  external: ['./langs/*'], define: { 'import.meta.url': '""' } });
await writeFile('artifacts/host-primitives-fixture.css', Object.entries(assets)
  .filter(([name]) => name.endsWith('.css')).map(([, file]) => assetText(file).toString()).join('\n'));
console.log('Prepared local host UI fixture.');
