import assert from 'node:assert/strict';
import { render } from '../src/bundle.js';

const bundle = render().bundle;
const paletteKey = 'dsh-theme-eye-care:palette';
const skinKey = 'dsh-theme-eye-care:theme';

function setup(saved = {}) {
  const store = new Map(Object.entries(saved));
  const events = new Map();
  const styles = new Map();
  const attributes = new Map();
  const states = [];
  const effects = new Map();
  let cursor = 0, registration, component, cleanup, tokens = null;
  const body = {
    setAttribute: (k, v) => attributes.set(k, v),
    removeAttribute: (k) => attributes.delete(k)
  };
  const document = {
    body,
    head: { appendChild: (tag) => styles.set(tag.dataset.pluginCss, tag) },
    querySelector: (s) => styles.get(/="(.*)"/.exec(s)?.[1]) ?? null,
    createElement: () => ({ dataset: {}, textContent: '' })
  };
  const window = {
    __ModuleLoader__: { load: (r) => { registration = r; } },
    localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    addEventListener: (k, v) => events.set(k, v),
    removeEventListener: (k) => events.delete(k)
  };
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity).filter(Boolean) }),
    useState: (initial) => {
      const i = cursor++;
      if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
      return [states[i], (next) => { states[i] = typeof next === 'function' ? next(states[i]) : next; }];
    },
    useEffect: (fn) => { const i = cursor++; if (!effects.has(i)) effects.set(i, fn()); }
  };
  new Function('window', 'document', bundle)(window, document);
  const plugin = registration.factory((name) => {
    assert.equal(name, 'react'); return react;
  });
  let messages;
  const locale = {
    register: (_, m) => { messages = m; return () => {}; },
    resolveText: (t) => typeof t === 'string' ? t : t.zh
  };
  const theme = {
    overrideTokens: (_, next) => {
      tokens = next;
      return () => { if (tokens === next) tokens = null; };
    }
  };
  plugin.apply({
    get: (k) => ({ locale, theme })[k],
    effect: (fn) => { cleanup = fn(); },
    slots: { inject: (_, fn) => fn(), register: (_, c) => { component = c; return () => {}; } }
  });
  const draw = (lang = 'zh') => { cursor = 0; return component({ t: (k) => messages[lang][k] }); };
  const text = (n) => typeof n === 'string' ? n : (n?.children ?? []).map(text).join('');
  const buttons = (n) => n?.type === 'button' ? [n] : (n?.children ?? []).flatMap(buttons);
  const selects = (n) => n?.type === 'select' ? [n] : (n?.children ?? []).flatMap(selects);
  const labels = (lang) => { const tree = draw(lang); return [...buttons(tree), ...selects(tree).flatMap(s => s.children)].map(text); };
  const click = (label) => {
    const button = buttons(draw()).find((b) => text(b) === label);
    if (button) { button.props.onClick(); return; }
    const select = selects(draw())[0];
    const option = select?.children.find(o => text(o) === label);
    assert.ok(option, `missing background option: ${label}`);
    select.props.onChange({ target: { value: option.props.value } });
  };
  const storage = (key, value) => {
    if (value === null) store.delete(key); else store.set(key, value);
    events.get('storage')({ key });
  };
  return { plugin, store, attributes, styles, draw, labels, click, storage, cleanup: () => cleanup(), tokens: () => tokens, events };
}

const app = setup({ [paletteKey]: 'eye-green' });
assert.deepEqual(app.labels(), ['原生主题', '岛屿', '豆绿', '暖灰', '暖纸', '原生']);
assert.equal(app.tokens()['--dsw-alias-bg-base'].light, '#eef7ed', 'existing palette survives upgrade');
app.click('岛屿');
assert.deepEqual(app.labels(), ['原生主题', '岛屿'], 'background controls hidden on Island');
assert.equal(app.store.get(skinKey), 'island');
assert.equal(app.store.get(paletteKey), 'eye-green', 'Island does not overwrite palette');
assert.equal(app.attributes.get('data-eye-care-theme'), 'island');
assert.equal(app.tokens()['--dsw-alias-bg-base'].light, '#fbf7ed');
assert.deepEqual(app.labels('en'), ['Native theme', 'Island']);
app.click('原生主题');
assert.equal(app.attributes.has('data-eye-care-theme'), false);
assert.equal(app.tokens()['--dsw-alias-bg-base'].light, '#eef7ed');
app.click('原生');
assert.equal(app.tokens(), null);
app.click('岛屿');
app.click('原生主题');
assert.equal(app.tokens(), null, 'Native background without palette also restores');
app.storage(skinKey, 'island');
assert.deepEqual(app.labels(), ['原生主题', '岛屿']);
app.storage(paletteKey, 'warm-grey');
assert.equal(app.tokens()['--dsw-alias-bg-base'].light, '#fbf7ed', 'palette event must not replace Island');
app.storage(skinKey, 'native');
assert.equal(app.tokens()['--dsw-alias-bg-base'].light, '#f2f0ec');
app.storage(skinKey, 'invalid');
assert.ok(app.labels().includes('暖灰'));
app.click('岛屿');
app.cleanup();
assert.equal(app.attributes.has('data-eye-care-theme'), false, 'unload removes Island scope');
assert.equal(app.tokens(), null);
assert.equal(app.events.size, 0);
app.click('原生主题');
app.click('岛屿');
assert.equal(app.attributes.has('data-eye-care-theme'), false, 'stale controls cannot reapply a disposed theme');

const restart = setup({ [skinKey]: 'island', [paletteKey]: 'warm-grey' });
assert.deepEqual(restart.labels(), ['原生主题', '岛屿'], 'Island restored on restart');
restart.click('原生主题');
assert.equal(restart.tokens()['--dsw-alias-bg-base'].light, '#f2f0ec');
restart.store.clear();
restart.events.get('storage')({ key: null });
assert.ok(restart.labels().includes('暖纸'), 'clearing storage restores native with default palette');
restart.cleanup();
console.log('OK: theme/background separation, persistence, language, cross-window sync and cleanup.');
