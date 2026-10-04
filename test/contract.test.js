// Contract test for lib/client.js — runs the real bundle against stubs of every host
// interface it touches, so a broken bundle fails here instead of in the browser
// console:
//   * window.__ModuleLoader__.load({ id, factory })
//   * the module-body stylesheet + document.querySelector('style[data-plugin-css=…]')
//   * ctx.get("theme").overrideTokens(source, tokens) + ctx.effect(fn, label)
//   * ctx.slots.inject(name, cb) + ctx.slots.register(descriptor, Component)
//   * window.localStorage + the "storage" event (cross-window sync)
//
// The theme stub mirrors ThemeRuntime's real semantics — layers keyed by `source`,
// and a replaced layer's disposer becoming a no-op — which is what makes the publish
// economy assertions below meaningful rather than tautological.
//
// The row is a plain function component, so a minimal React stub is enough to render
// it and click its buttons for real.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeTheme } from '../src/theme-file.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const source = readFileSync(join(root, 'lib', 'client.js'), 'utf8');
const themeFiles = readdirSync(join(root, 'themes')).filter((f) => f.endsWith('.json')).sort();
const themes = themeFiles.map((f) =>
  normalizeTheme(JSON.parse(readFileSync(join(root, 'themes', f), 'utf8')), f));

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
        return {
          type,
          props: props ?? {},
          children: children.flat(Infinity).filter((c) => c !== null && c !== undefined)
        };
      }
    }
  };
}

// ---------------------------------------------------------------- host stubs
const store = new Map();
const listeners = { storage: [] };
const windowStub = {
  __ModuleLoader__: { load: (registration) => { loaded = registration; } },
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

/** The bundle injects its row stylesheet into document.head at materialization. */
const styles = new Map(); // data-plugin-css -> element
const documentStub = {
  head: { appendChild: (element) => { styles.set(element.dataset.pluginCss, element); } },
  querySelector: (selector) => {
    const match = /^style\[data-plugin-css="(.*)"\]$/.exec(selector);
    return match === null ? null : styles.get(match[1]) ?? null;
  },
  createElement: () => ({ dataset: {}, textContent: '' })
};
let loaded;

// ---------------------------------------------------------------- run bundle
new Function('window', 'document', source)(windowStub, documentStub);
check('bundle registers through __ModuleLoader__.load', loaded !== undefined);
check('registration id equals the package name', loaded?.id === pkg.name, `${loaded?.id} vs ${pkg.name}`);

// ---------------------------------------------------------------- exports
const reactStub = createReactStub();
const exportsObj = loaded.factory((specifier) => {
  if (specifier === 'react') return reactStub.react;
  throw new Error('unexpected require: ' + specifier);
});

// ---------------------------------------------------------------- stylesheet
// Materialization is the factory call, and that is where bundle CSS must appear: the
// loader claims style tags at that moment (claimStyles) and removes them with the
// entry (removeOwnedStyles). Asserting before apply() pins that ordering.
const STYLE_KEY = pkg.name + '/row.css';
const injected = styles.get(STYLE_KEY);
check('the row stylesheet is injected at materialization, before apply()', injected !== undefined);
check('the stylesheet is tagged for the loader inventory', injected?.dataset.plugin === pkg.name, injected?.dataset.plugin);
check('the stylesheet carries a data-plugin-css key', injected?.dataset.pluginCss === STYLE_KEY, injected?.dataset.pluginCss);

const css = injected?.textContent ?? '';
check('the stylesheet defines every row class',
  ['.dshEyeCare_group{', '.dshEyeCare_title{', '.dshEyeCare_cubeRow{',
    '.dshEyeCare_cube{', '.dshEyeCare_selected{', '.dshEyeCare_swatch{', '.dshEyeCare_swatchNone{']
    .every((token) => css.includes(token)));

// The row deliberately mirrors the built-in Appearance row; keep that promise checked.
check('cube rule keeps the Appearance row look (radius-xl, column stack, hairline, 20px vertical padding)',
  css.includes('border-radius:var(--dsw-radius-xl)') && css.includes('flex-direction:column') &&
    css.includes('border:.5px solid var(--dsw-alias-border-l4)') && css.includes('padding:20px 12px'));
check('cubes share the row equally instead of the Appearance fixed 180px basis, so all four fit one line',
  css.includes('flex:1 1 0') && css.includes('min-width:88px') && !css.includes('flex:180px'));
check('selected cube uses the module-platform fill + neutral-bluish-400 border, as Appearance does',
  css.includes('.dshEyeCare_selected{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-static-neutral-bluish-400)}'));
check('hover state is real CSS (not expressible with inline styles)', css.includes(':hover:not(.dshEyeCare_selected)'));
check('row hairline matches the Appearance group rule', css.includes('.dshEyeCare_group{border-bottom:.5px solid var(--dsw-alias-border-l2)'));

// ---------------------------------------------------------------- exports shape
check('exports.apply is a function', typeof exportsObj.apply === 'function');
check('exports.inject is an array', Array.isArray(exportsObj.inject), JSON.stringify(exportsObj.inject));
check('inject requires locale + theme + slots', ['locale', 'theme', 'slots'].every((s) => exportsObj.inject.includes(s)), JSON.stringify(exportsObj.inject));
check('exports the palette catalogue', Array.isArray(exportsObj.THEMES) && exportsObj.THEMES.length === themes.length,
  `${exportsObj.THEMES?.length} vs ${themes.length}`);
check('the default palette is warm-paper', exportsObj.DEFAULT_THEME === 'warm-paper', exportsObj.DEFAULT_THEME);

// ---------------------------------------------------------------- anti-drift
const drift = [];
for (const theme of themes) {
  const embedded = exportsObj.THEMES.find((t) => t.id === theme.id);
  if (embedded === undefined) drift.push(`${theme.id} missing`);
  else if (JSON.stringify(embedded.tokens) !== JSON.stringify(theme.tokens)) drift.push(`${theme.id} differs`);
}
check('the embedded palettes match themes/*.json exactly', drift.length === 0, drift.join(', '));
check('the catalogue is ordered like themes/*.json',
  exportsObj.THEMES.map((t) => t.id).join() === themes.map((t) => t.id).join(),
  exportsObj.THEMES.map((t) => t.id).join());
check('every palette exposes { light, dark } pairs of strings',
  exportsObj.THEMES.every((t) => Object.values(t.tokens).every(
    (p) => typeof p.light === 'string' && typeof p.dark === 'string')));

// ---------------------------------------------------------------- theme service stub
const themeStub = (() => {
  const layers = new Map(); // source -> layer, mirroring ThemeRuntime.overrides
  const calls = [];         // every overrideTokens call, in order
  const disposed = [];      // every disposer that actually ran
  return {
    calls,
    disposed,
    live: () => [...layers.values()].filter((l) => !l.disposed).length,
    overrideTokens(source, tokens) {
      const layer = { source, tokens, disposed: false };
      layers.set(source, layer); // same source: atomic replacement
      calls.push({ source, tokens });
      return () => {
        if (layers.get(source) !== layer) return; // superseded -> no-op
        layer.disposed = true;
        layers.delete(source);
        disposed.push(source);
      };
    }
  };
})();

let rowDescriptor;
let rowComponent;
let effectDisposer;
let injectedSlot;

// ---------------------------------------------------------------- locale stub
// Mirrors dsh-client-locale: namespaces hold one dictionary per shipped locale,
// `bind` mints a translator, `resolveText` resolves package text (plain string
// verbatim, or a { locale: label } map through the chain that ends at `en`).
const dictionaries = new Map(); // namespace -> { zh, en }
let activeLocale = 'zh';
let localeRevision = 0;
const localeStub = {
  getSnapshot: () => ({ active: activeLocale, revision: localeRevision }),
  register(namespace, dicts) {
    if (dictionaries.has(namespace)) throw new Error(`locale namespace ${namespace} is already registered`);
    dictionaries.set(namespace, dicts);
    localeRevision += 1;
    return () => {
      dictionaries.delete(namespace);
      localeRevision += 1;
    };
  },
  bind: (namespace) => (key) => {
    const dicts = dictionaries.get(namespace) ?? {};
    return dicts[activeLocale]?.[key] ?? dicts.en?.[key] ?? key;
  },
  resolveText(text) {
    if (typeof text === 'string') return text;
    return text[activeLocale] ?? text.en;
  }
};
const setLocale = (id) => {
  activeLocale = id;
  localeRevision += 1;
};

const ctx = {
  get(name) {
    if (name === 'theme') return themeStub;
    if (name === 'locale') return localeStub;
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

exportsObj.apply(ctx);

check('apply() registers a row on settings.general.item', injectedSlot === 'settings.general.item', injectedSlot);
check('row descriptor carries the slot name', rowDescriptor?.name === 'settings.general.item', rowDescriptor?.name);
check('row descriptor carries a stable id', typeof rowDescriptor?.id === 'string' && rowDescriptor.id.length > 0, rowDescriptor?.id);
check('row is ordered after the built-in Appearance row (10) and font size (11)', rowDescriptor?.order === 12, String(rowDescriptor?.order));
check('row component is a function', typeof rowComponent === 'function');

// ---------------------------------------------------------------- row copy
const copyNamespaces = [...dictionaries.keys()];
check('the row copy is registered under exactly one namespace', copyNamespaces.length === 1, copyNamespaces.join(', '));
const copyDict = dictionaries.get(copyNamespaces[0]) ?? {};
check('the row copy declares both shipped locales',
  ['zh', 'en'].every((locale) => typeof copyDict[locale]?.title === 'string' && typeof copyDict[locale]?.native === 'string'),
  Object.keys(copyDict).join(', '));
check('the descriptor binds that namespace so the renderer injects `t`',
  rowDescriptor?.locale === copyNamespaces[0], rowDescriptor?.locale);

// ---------------------------------------------------------------- publish economy
check('boot stacks exactly one layer with exactly one publish', themeStub.calls.length === 1, `${themeStub.calls.length} calls`);
check('boot leaves exactly one live layer', themeStub.live() === 1, String(themeStub.live()));
check('the layer source is the package name', themeStub.calls[0]?.source === pkg.name, themeStub.calls[0]?.source);
check('boot stacks the default palette', JSON.stringify(themeStub.calls[0]?.tokens) ===
  JSON.stringify(themes.find((t) => t.id === exportsObj.DEFAULT_THEME).tokens));

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
/** The renderer hands the row a translator bound to the descriptor's namespace. */
const copyT = () => localeStub.bind(copyNamespaces[0]);
const renderRow = () => {
  reactStub.resetCursor();
  return rowComponent({ t: copyT() });
};
const cubeFor = (predicate) => {
  const button = buttonsOf(renderRow()).find(predicate);
  if (button === undefined) throw new Error('no cube matches the requested option');
  return button;
};
/** The "no palette" cube is identified by its dashed swatch, not by its label. */
const isOffCube = (b) => b.children[0]?.props?.className?.includes('dshEyeCare_swatchNone') === true;
const themeLabel = (theme) => localeStub.resolveText(theme.displayName);
const clickPalette = (id) => cubeFor((b) => labelOf(b) === themeLabel(themes.find((t) => t.id === id))).props.onClick();
const clickOff = () => cubeFor(isOffCube).props.onClick();
const selectedLabel = () =>
  labelOf(buttonsOf(renderRow()).find((b) => b.props.className.includes('dshEyeCare_selected')));

const tree = renderRow();
check('row renders a div root', tree?.type === 'div');
check('row root uses the group class', tree?.props?.className === 'dshEyeCare_group', tree?.props?.className);
const buttons = buttonsOf(tree);
check('row renders one button per palette plus the native option', buttons.length === themes.length + 1, `${buttons.length} buttons`);
const labels = buttons.map(labelOf);
check('row labels every palette by displayName', themes.every((t) => labels.includes(themeLabel(t))), labels.join(' | '));
const CJK = /[\u4e00-\u9fff]/;
const chineseOnly = (text) => CJK.test(text) && !/[A-Za-z]{3,}/.test(text);
check('row copy is Chinese-only (no bilingual "English Name" suffix)',
  [textOf(tree.children[0]), ...labels].every(chineseOnly),
  textOf(tree.children[0]));
check('every option is a cube', buttons.every((b) => typeof b.props.className === 'string' && b.props.className.startsWith('dshEyeCare_cube')),
  buttons.map((b) => b.props.className).join(' | '));
check('every cube reports its pressed state', buttons.every((b) => b.props['aria-pressed'] === 'true' || b.props['aria-pressed'] === 'false'));
check('exactly one cube is selected', buttons.filter((b) => b.props.className.includes('dshEyeCare_selected')).length === 1);
const offButton = buttons.find(isOffCube);
check('the native option shows a dashed (no-palette) swatch',
  offButton?.children[0]?.props?.className?.includes('dshEyeCare_swatchNone') === true);
check('the decorative swatch is hidden from assistive tech', buttons.every((b) => b.children[0]?.props?.['aria-hidden'] === 'true'));

// Class names and the stylesheet must agree in both directions, so a rename cannot
// leave a rule orphaned or a rendered class unstyled.
const rendered = new Set();
const collectClasses = (node) => {
  if (node?.props?.className) String(node.props.className).split(/\s+/).forEach((c) => rendered.add(c));
  (node?.children ?? []).forEach(collectClasses);
};
collectClasses(tree);
const defined = new Set([...css.matchAll(/\.(dshEyeCare_[A-Za-z0-9_]+)\{/g)].map((m) => m[1]));
check('every rendered class is defined in the stylesheet',
  [...rendered].every((c) => defined.has(c)),
  [...rendered].filter((c) => !defined.has(c)).join(', '));
check('the stylesheet defines nothing the row never renders',
  [...defined].every((c) => rendered.has(c)),
  [...defined].filter((c) => !rendered.has(c)).join(', '));

// ---------------------------------------------------------------- language
// Switching Settings -> General -> Language must move the row's copy and the
// palette labels together; the renderer drives that by handing the row a new `t`.
check('the row copy starts in Chinese', textOf(tree.children[0]) === '背景色', textOf(tree.children[0]));

setLocale('en');
const enTree = renderRow();
const enLabels = buttonsOf(enTree).map(labelOf);
check('switching language switches the row copy', textOf(enTree.children[0]) === 'Background', textOf(enTree.children[0]));
check('switching language switches the palette labels against the same theme files',
  themes.every((t) => enLabels.includes(t.displayName.en)), enLabels.join(' | '));
check('the native option is English too', enLabels.includes('Native'), enLabels.join(' | '));
check('a fresh translator identity marks a new language revision',
  localeStub.getSnapshot().revision > 0);

setLocale('zh');
check('switching back restores the Chinese copy', textOf(renderRow().children[0]) === '背景色');

// ---------------------------------------------------------------- switching
const green = themes.find((t) => t.id === 'eye-green');
clickPalette('eye-green');
check('clicking a palette persists the choice', store.get(exportsObj.STORAGE_KEY) === 'eye-green', store.get(exportsObj.STORAGE_KEY));
check('palette -> palette switch publishes exactly once', themeStub.calls.length === 2, `${themeStub.calls.length} calls`);
check('the replaced layer is never disposed (host replacement semantics)', themeStub.disposed.length === 0, `${themeStub.disposed.length} disposed`);
check('the host still holds exactly one live layer', themeStub.live() === 1, String(themeStub.live()));
check('the stacked layer is the clicked palette', JSON.stringify(themeStub.calls[1]?.tokens) === JSON.stringify(green.tokens));
check('the row highlights the clicked palette', selectedLabel() === themeLabel(green), selectedLabel());

clickPalette('eye-green');
check('re-selecting the active palette publishes nothing', themeStub.calls.length === 2, `${themeStub.calls.length} calls`);

clickOff();
check('choosing the native option persists it', store.get(exportsObj.STORAGE_KEY) === exportsObj.OFF_ID, store.get(exportsObj.STORAGE_KEY));
check('choosing the native option publishes nothing new', themeStub.calls.length === 2, `${themeStub.calls.length} calls`);
check('choosing the native option disposes the live layer', themeStub.live() === 0 && themeStub.disposed.length === 1,
  `${themeStub.live()} live / ${themeStub.disposed.length} disposed`);
check('the row highlights the native option after leaving the palette', selectedLabel() === '原生', selectedLabel());

// ---------------------------------------------------------------- cross-window
check('apply() listens for cross-window storage events', (listeners.storage ?? []).length === 1);
store.set(exportsObj.STORAGE_KEY, 'warm-grey');
listeners.storage[0]({ key: exportsObj.STORAGE_KEY });
const warmGrey = themes.find((t) => t.id === 'warm-grey');
check('a storage event switches the palette', themeStub.live() === 1 &&
  JSON.stringify(themeStub.calls.at(-1)?.tokens) === JSON.stringify(warmGrey.tokens));
check('a storage event publishes exactly once', themeStub.calls.length === 3, `${themeStub.calls.length} calls`);
const beforeUnrelated = themeStub.calls.length;
listeners.storage[0]({ key: 'some-other-key' });
check('an unrelated storage key is ignored', themeStub.calls.length === beforeUnrelated);

// ---------------------------------------------------------------- teardown
check('apply() returned a disposer through ctx.effect', typeof effectDisposer === 'function');
effectDisposer();
check('disposing removes the layer', themeStub.live() === 0, `${themeStub.live()} live`);
check('disposing unregisters the storage listener', (listeners.storage ?? []).length === 0);
check('disposing leaves the stylesheet to the loader', styles.get(STYLE_KEY) === injected);
check('disposing unregisters the row copy', dictionaries.size === 0, [...dictionaries.keys()].join(', '));
const beforeStray = themeStub.calls.length;
clickPalette('eye-green');
check('disposing releases the theme service', themeStub.calls.length === beforeStray, `${themeStub.calls.length} calls`);

console.log('');
if (problems.length) {
  throw new Error(problems.length + ' problem(s):\n  - ' + problems.join('\n  - '));
}
console.log('OK: the client bundle honours the ModuleLoader + slots + theme contract, and one selection costs one publish.');
