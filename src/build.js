// Build lib/client.js. The assembly itself lives in src/bundle.js so tests can
// compare in-process instead of shelling out.
//
//   node src/build.js            write lib/client.js
//   node src/build.js --check    exit 1 when the committed artifact is not what the
//                                current sources produce — this is the CI gate
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { OUTPUT, render } from './bundle.js';

const { bundle, themes } = render();

if (!process.argv.includes('--check')) {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, bundle);
  console.log(
    `wrote lib/client.js  ${bundle.length} chars  ` +
      `(${themes.length} palettes x ${Object.keys(themes[0].tokens).length} tokens: ` +
      `${themes.map((t) => t.id).join(' ')})`
  );
} else if (!existsSync(OUTPUT)) {
  console.error('lib/client.js is missing — run `node src/build.js`');
  process.exitCode = 1;
} else {
  const current = readFileSync(OUTPUT, 'utf8');
  if (current === bundle) {
    console.log('lib/client.js is up to date');
  } else {
    const a = current.split('\n');
    const b = bundle.split('\n');
    let line = 0;
    while (line < a.length && line < b.length && a[line] === b[line]) line++;
    console.error(`lib/client.js is stale (first difference at line ${line + 1})`);
    console.error(`  committed: ${JSON.stringify((a[line] ?? '').slice(0, 120))}`);
    console.error(`  expected : ${JSON.stringify((b[line] ?? '').slice(0, 120))}`);
    console.error('run `node src/build.js` and commit the result');
    process.exitCode = 1;
  }
}
