// Zero-dependency test aggregator: `node test/run.js`.
//
// Each suite prints its own `ok`/`FAIL` lines and throws on failure, so running
// them in order and collecting errors is all the harness this repo needs. It also
// keeps `npm test` off the critical path: npm.ps1 is rejected by the PowerShell
// execution policy on some Windows hosts, while `node test/run.js` always works.
//
// install.test.js is excluded — it needs a local DSH install. Run it directly:
//   node test/install.test.js
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.test.js') && f !== 'install.test.js')
  .sort();

let failed = 0;
for (const file of files) {
  console.log(`\n=== ${file} ===`);
  try {
    await import(pathToFileURL(join(dir, file)).href);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${file}\n${error.message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} suite(s) failed`);
  process.exitCode = 1;
} else {
  console.log(`\nAll ${files.length} suites passed.`);
}
