import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const css = read('src/runtime/island.css').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = [...css.matchAll(/([^{}]+)\{/g)];
assert.ok(rules.length > 10);
for (const [, selector] of rules) {
  assert.ok(selector.trim().startsWith('body[data-eye-care-theme="island"]'), `unscoped Island rule: ${selector}`);
}
assert.doesNotMatch(css, /data-dwp|\.dwp-|--dwp-|--dsh-chat-content-width|margin-left/, 'old workbench layout must not leak');
assert.match(css, /pointer-events:none/);
assert.match(css, /\[data-ds-dark-theme\]::after\s*\{\s*display:none/);
const defined = new Set([...css.matchAll(/(--eye-island-[\w-]+)\s*:/g)].map((m) => m[1]));
for (const [, name] of css.matchAll(/var\((--eye-island-[\w-]+)/g)) assert.ok(defined.has(name), `undefined ${name}`);
const official = new Set(JSON.parse(read('test/official-tokens.json')).names);
const tokens = JSON.parse(read('src/island-tokens.json'));
for (const [name, pair] of Object.entries(tokens)) {
  assert.ok(official.has(name), `unknown host token: ${name}`);
  assert.equal(typeof pair.light, 'string');
  assert.equal(typeof pair.dark, 'string');
}
const pkg = JSON.parse(read('package.json'));
assert.ok(pkg.files.includes('THIRD_PARTY_NOTICES.md'));
assert.ok(pkg.files.includes('assets/licenses'));
assert.match(read('THIRD_PARTY_NOTICES.md'), /guokaigdg\/animal-island-ui/);
assert.match(read('assets/licenses/ANIMAL-ISLAND-UI-LICENSE'), /NonCommercial/);
console.log('OK: scoped Island styling, no old navigation layout, valid tokens and packaged attribution.');
