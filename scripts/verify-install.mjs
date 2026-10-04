// Verify an installed Warm Paper plugin WITHOUT restarting DSH: compose the
// profile's patch layers with DSH's own `dsh-app-boot` code and assert the
// theme row mounts and its client bundle is served under the package name.
//
// Run it with the harness binary acting as node (asar-aware fs is required):
//   $env:ELECTRON_RUN_AS_NODE=1
//   & "<install>\DeepSeek Harness.exe" --expose-internals scripts/verify-install.mjs
//
// Overrides: --profile-dir <path>  --asar <path-to-dsh/node_modules>
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const argValue = (flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? undefined : argv[i + 1];
};

const profileDir =
  argValue('--profile-dir') ??
  process.env.DSH_PROFILE_DIR ??
  (process.env.DSH_HOME ? join(process.env.DSH_HOME, 'profiles', 'desktop') : undefined);
if (!profileDir) {
  console.error('cannot locate the profile directory: pass --profile-dir, or set DSH_PROFILE_DIR / DSH_HOME');
  process.exit(2);
}

const asarModules = argValue('--asar') ?? join(dirname(process.execPath), 'resources', 'app.asar', 'dsh', 'node_modules');
const boot = await import(pathToFileURL(join(asarModules, '@deepseek-ai', 'dsh-app-boot', 'lib', 'index.js')).href);

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const name = pkg.name;
const problems = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? '  (' + detail + ')' : ''}`);
  if (!ok) problems.push(label + (detail ? ': ' + detail : ''));
};

// 1. the profile lists the package as a bundle, and depends on it
const manifest = boot.readProfileManifest('dsh', profileDir);
check(`profile dsh.profile.bundles contains ${name}`, (manifest.dsh?.profile?.bundles ?? []).includes(name));
check(`profile dependencies contains ${name}`, Object.keys(manifest.dependencies ?? {}).includes(name));

// 2. the installed package resolves and declares both halves
const installed = boot.readProfileManifest('dsh', join(profileDir, 'node_modules', name));
check('installed package resolves through the profile node_modules', installed.name === name, installed.name);
check('declares dsh.client.platform === "web"', installed.dsh?.client?.platform === 'web', installed.dsh?.client?.platform);
check('declares dsh.bundle.patch', typeof installed.dsh?.bundle?.patch === 'string', JSON.stringify(installed.dsh?.bundle));
check('exports a ./client subpath', typeof installed.exports?.['./client'] === 'string', installed.exports?.['./client']);

// 3. the bundle patch parses, with no skipped-patch diagnostics
const patchFiles = boot.bundlePatchPaths(join(profileDir, 'node_modules', name), installed.dsh.bundle);
check('bundle patch path resolves', patchFiles.length === 1, JSON.stringify(patchFiles));
const patches = patchFiles.flatMap((file) => boot.loadOverlayPatches('dsh', file));
check('patch parses without diagnostics', patches.length === 1, JSON.stringify(patches));

// 4. composing it over an empty root yields the row the Loader will mount
// The row is mounted by its `name` (the package specifier). Its `id` is a local
// label and deliberately a short name, so it must NOT be compared to the
// package name — only asserted to exist and stay stable.
const entries = boot.composeEntries([patches]);
const row = entries.find((entry) => entry.name === name);
check('composed entries contain a row mounting the package', row !== undefined, JSON.stringify(entries));
check('row name is the package name', row?.name === name, row?.name);
check('row carries a stable id', typeof row?.id === 'string' && row.id.length > 0, row?.id);
check('row is not disabled', row?.disabled !== true);

// 5. the bundle the row will serve exists and registers under the package name
const clientRel = installed.exports['./client'].replace(/^\.\//, '');
const clientSource = readFileSync(join(root, clientRel), 'utf8');
const idMatch = /__ModuleLoader__\.load\(\{\s*\n\s*id:\s*"([^"]+)"/.exec(clientSource);
check('client bundle self-registers under the package name', idMatch?.[1] === name, idMatch?.[1]);

console.log('\nprofile : ' + profileDir);
console.log('composed: ' + JSON.stringify(row));
if (problems.length) {
  console.error('\n' + problems.length + ' PROBLEM(S):');
  for (const p of problems) console.error('  - ' + p);
  console.error('\nIf the bundle/row checks fail, re-install with:');
  console.error('  dsh plugin --profile <name> add "' + root + '"');
  process.exit(1);
}
console.log('\nOK: the profile will mount the theme row and serve its client bundle at boot.');
