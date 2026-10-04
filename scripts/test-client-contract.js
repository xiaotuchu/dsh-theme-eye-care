// Contract test for lib/client.js — runs the real bundle against stubs of every
// host interface it touches, so a broken bundle fails here instead of in the
// browser console:
//   * window.__ModuleLoader__.load({ id, factory })
//   * ctx.get("theme").overrideTokens(source, tokens) + ctx.effect(fn, label)
//   * ctx.slots.inject(name, cb) + ctx.slots.register(descriptor, Component)
//   * window.localStorage + the "storage" event (cross-window sync)
//
// The palette row is a plain function component, so a minimal React stub is
// enough to render it and click its buttons for real.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const source = readFileSync(join(root, 'lib', 'client.js'), 'utf8');
const themeFiles = readdirSync(join(root, 'themes')).filter((f) => f.endsWith('.json')).sort();
const themes = themeFiles.map((f) => JSON.parse(readFileSync(join(root, 'themes', f), 'utf8')));

const problems = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? '  (' + detail + ')' : ''}`);
  if (!ok) problems.push(label + (detail ? ': ' + detail : ''));
};

// ---------------------------------------------------------------- react stub
function createReactStub() {
  const states = [];
  let cursor = 0;
  return {
    resetCursor() {
      cursor = 0;
    },
    react: {
      useState(initial) {
        const i = cursor++;
        if (states[i] === undefined) states[i] = typeof initial === 'function' ? initial() : initial;
        return [states[i], (next) => { states[i] = next; }];
      },
      useEffect(effect) {
        effect();
      },
      createElement(type, props, ...children) {
        return { type, props: props ?? {}, children: children.flat(Infinity).filter((c) => c !== null && c !== undefined) };
      }
    }
  };
}

// ---------------------------------------------------------------- host stubs
const store = new Map();
const listeners = { storage: [] };
const windowStub = {
  __ModuleLoader__: { load: (reg) => { registration = reg; } },
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, v)
  },
  addEventListener: (type, handler) => {
    (listeners[type] ??= []).push(handler);
  },
  removeEventListener: (type, handler) => {
    listeners[type] = (listeners[type] ?? []).filter((h) => h !== handler);
  }
};
/** The bundle injects its row stylesheet into document.head. */
const styles = new Map();
const documentStub = {
  head: { appendChild: (element) => { styles.set(element.id, element); } },
  getElementById: (id) => styles.get(id) ?? null,
  createElement: () => ({
    id: '',
    textContent: '',
    remove() {
      styles.delete(this.id);
    }
  })
};
let registration;

// ---------------------------------------------------------------- run bundle
new Function('window', 'document', source)(windowStub, documentStub);
check('bundle registers through __ModuleLoader__.load', registration !== undefined);
check('registration id equals the package name', registration?.id === pkg.name, `${registration?.id} vs ${pkg.name}`);

const reactStub = createReactStub();
const exportsObj = registration.factory((specifier) => {
  if (specifier === 'react') return reactStub.react;
  throw new Error('unexpected require: ' + specifier);
});

check('exports.apply is a function', typeof exportsObj.apply === 'function');
check('exports.inject is an array', Array.isArray(exportsObj.inject), JSON.stringify(exportsObj.inject));
check('inject requires theme + slots', ['theme', 'slots'].every((s) => exportsObj.inject.includes(s)), JSON.stringify(exportsObj.inject));
check('exports the theme catalogue', Array.isArray(exportsObj.THEMES) && exportsObj.THEMES.length === themes.length, `${exportsObj.THEMES?.length} vs ${themes.length}`);

// ---------------------------------------------------------------- theme stub
const layers = [];
const themeStub = {
  overrideTokens(source, tokens) {
    const layer = { source, tokens, disposed: false };
    layers.push(layer);
    return () => {
      layer.disposed = true;
    };
  }
};
let rowDescriptor;
let rowComponent;
let effectDisposer;
const ctx = {
  get(name) {
    if (name === 'theme') return themeStub;
    throw new Error('requested unexpected service: ' + name);
  },
  effect(fn, label) {
    effectDisposer = fn();
    return effectDisposer;
  },
  slots: {
    inject(name, callback) {
      injectedSlot = name;
      return callback();
    },
    register(descriptor, component) {
      rowDescriptor = descriptor;
      rowComponent = component;
      return () => {};
    }
  }
};
let injectedSlot;

exportsObj.apply(ctx);

check('apply() registers a row on settings.general.item', injectedSlot === 'settings.general.item', injectedSlot);
check('row descriptor carries the slot name', rowDescriptor?.name === 'settings.general.item', rowDescriptor?.name);
check('row descriptor carries a stable id', typeof rowDescriptor?.id === 'string' && rowDescriptor.id.length > 0, rowDescriptor?.id);
check('row is ordered after the built-in Appearance row (10) and font size (11)', rowDescriptor?.order === 12, String(rowDescriptor?.order));
check('row component is a function', typeof rowComponent === 'function');

const liveLayers = () => layers.filter((l) => !l.disposed);
/** Structural comparison: the bundle embeds its own copy of each token map. */
const sameTokens = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const defaultTheme = themes.find((t) => t.id === exportsObj.DEFAULT_THEME);
check('apply() stacks exactly one palette layer', liveLayers().length === 1, `${liveLayers().length} live`);
check('default layer is the default palette', sameTokens(liveLayers()[0]?.tokens, defaultTheme?.tokens), exportsObj.DEFAULT_THEME);
check('layer source is the package name', liveLayers()[0]?.source === pkg.name, liveLayers()[0]?.source);

// ---------------------------------------------------------------- render row
/** Flatten a stubbed React tree to its text content. */
function textOf(node) {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node.children) return textOf(node.children);
  return '';
}
const buttonsOf = (tree) =>
  tree.children
    .filter((c) => c?.type === 'div')
    .flatMap((c) => c.children)
    .filter((c) => c?.type === 'button');
const labelOf = (button) => textOf(button.children);

reactStub.resetCursor();
const tree = rowComponent();
check('row renders a div root', tree?.type === 'div');
check('row root uses the group class', tree?.props?.className === 'dshEyeCare_group', tree?.props?.className);
const buttons = buttonsOf(tree);
check('row renders one button per palette plus DSH default', buttons.length === themes.length + 1, `${buttons.length} buttons`);
const labels = buttons.map(labelOf);
check('row labels every palette by displayName', themes.every((t) => labels.includes(t.displayName)), labels.join(' | '));
const CJK = /[\u4e00-\u9fff]/;
const chineseOnly = (text) => CJK.test(text) && !/[A-Za-z]{3,}/.test(text.replace(/DSH/g, ''));
check(
  'row copy is Chinese-only (no bilingual "English Name" suffix)',
  [textOf(tree.children[0]), textOf(tree.children[1]), ...labels].every(chineseOnly),
  [textOf(tree.children[0]), textOf(tree.children[1])].join(' / ')
);
check('every option is a cube', buttons.every((b) => typeof b.props.className === 'string' && b.props.className.startsWith('dshEyeCare_cube')), buttons.map((b) => b.props.className).join(' | '));
check('exactly one cube is selected', buttons.filter((b) => b.props.className.includes('dshEyeCare_selected')).length === 1);
const offCubeButton = buttons.find((b) => labelOf(b).includes('DSH'));
check('the DSH default cube shows a dashed (no-palette) swatch', offCubeButton?.children[0]?.props?.className?.includes('dshEyeCare_swatchNone') === true);

// The injected stylesheet must reproduce the built-in Appearance row's cube rules,
// since matching that row's look is the whole point of the class-based styling.
const styleEl = styles.get(pkg.name + ':row-css');
check('apply() injects the row stylesheet into document.head', styleEl !== undefined);
const css = styleEl?.textContent ?? '';
check('stylesheet defines the row + cube classes', ['.dshEyeCare_group{', '.dshEyeCare_title{', '.dshEyeCare_cubeRow{', '.dshEyeCare_cube{', '.dshEyeCare_selected{', '.dshEyeCare_swatch{'].every((token) => css.includes(token)));
check(
  'cube rule keeps the Appearance row look (radius-xl, column stack, hairline, 20px vertical padding)',
  css.includes('border-radius:var(--dsw-radius-xl)') && css.includes('flex-direction:column') && css.includes('border:.5px solid var(--dsw-alias-border-l4)') && css.includes('padding:20px 12px'),
  ''
);
check(
  'cubes share the row equally instead of the Appearance fixed 180px basis, so all four fit one line',
  css.includes('flex:1 1 0') && css.includes('min-width:88px') && !css.includes('flex:180px'),
  ''
);
check('selected cube uses the module-platform fill + neutral-bluish-400 border, as Appearance does', css.includes('.dshEyeCare_selected{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-static-neutral-bluish-400)}'));
check('hover state is real CSS (not expressible with inline styles)', css.includes(':hover:not(.dshEyeCare_selected)'));
check('row hairline matches the Appearance group rule', css.includes('.dshEyeCare_group{border-bottom:.5px solid var(--dsw-alias-border-l2)'));

// click the green palette
const green = themes.find((t) => t.id === 'eye-green');
const greenButton = buttons[labels.indexOf(green.displayName)];
greenButton.props.onClick();
check('clicking a palette persists the choice', store.get(exportsObj.STORAGE_KEY) === 'eye-green', store.get(exportsObj.STORAGE_KEY));
check('clicking a palette stacks its layer', liveLayers().length === 1 && sameTokens(liveLayers()[0].tokens, green.tokens));
check('clicking a palette disposes the previous layer', layers.filter((l) => l.disposed).length === 1, `${layers.filter((l) => l.disposed).length} disposed`);
check('the clicked palette token set covers the whole ladder', Object.keys(green.tokens).length === Object.keys(themes[0].tokens).length);

// pick DSH default -> no layer at all
reactStub.resetCursor();
const buttons2 = buttonsOf(rowComponent());
const offIndex = buttons2.findIndex((b) => labelOf(b).includes('DSH'));
check('row offers a DSH default option', offIndex >= 0);
buttons2[offIndex].props.onClick();
check('choosing DSH default persists it', store.get(exportsObj.STORAGE_KEY) === exportsObj.OFF_ID, store.get(exportsObj.STORAGE_KEY));
check('choosing DSH default removes every layer', liveLayers().length === 0, `${liveLayers().length} live`);

// ---------------------------------------------------------------- cross-window
check('apply() listens for cross-window storage events', (listeners.storage ?? []).length === 1);
store.set(exportsObj.STORAGE_KEY, 'warm-paper');
listeners.storage[0]({ key: exportsObj.STORAGE_KEY });
check('a storage event switches the palette', liveLayers().length === 1 && sameTokens(liveLayers()[0].tokens, themes.find((t) => t.id === 'warm-paper').tokens));

// ---------------------------------------------------------------- teardown
check('apply() returned a disposer through ctx.effect', typeof effectDisposer === 'function');
effectDisposer();
check('disposing removes the layer', liveLayers().length === 0, `${liveLayers().length} live`);
check('disposing unregisters the storage listener', (listeners.storage ?? []).length === 0);
check('disposing removes the row stylesheet', !styles.has(pkg.name + ':row-css'));

// ---------------------------------------------------------------- data shape
const badShape = [];
for (const theme of exportsObj.THEMES) {
  for (const [name, pair] of Object.entries(theme.tokens)) {
    if (typeof pair !== 'object' || typeof pair.light !== 'string' || typeof pair.dark !== 'string') badShape.push(`${theme.id}/${name}`);
    if (!name.startsWith('--')) badShape.push(`${theme.id}/${name} (not a custom property)`);
  }
}
check('every token in every theme is a { light, dark } pair of strings', badShape.length === 0, badShape.slice(0, 4).join(', '));

console.log('');
if (problems.length) {
  console.error(problems.length + ' PROBLEM(S):');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('OK: client bundle honours the ModuleLoader + slots + theme contract, and the switcher works.');
