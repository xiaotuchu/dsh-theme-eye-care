/* @__PAYLOAD__ */

// Stack one token layer for the selected native background or Island theme.
// The theme and remembered native background have independent settings;
// the user's light/dark preference is never touched.
//
// Build target: this file is the factory body of the ModuleLoader bundle; the build
// (src/bundle.js) substitutes the payload marker above and wraps everything in
// `window.__ModuleLoader__.load({ id, factory })`. Read this file to read what runs.

const react = require("react");
const { Menu, IconChevronDownOutlineRegular } = require("@deepseek-ai/dsh-client-ui-primitives");

const OFF_ID = "dsh-default";
const DEFAULT_ID = "warm-paper";
const STORAGE_KEY = "dsh-theme-eye-care:palette";
const THEME_STORAGE_KEY = "dsh-theme-eye-care:theme";
const NATIVE_THEME = "native";
const ISLAND_THEME = "island";

/** Locale namespace owning this row's copy; the slot descriptor binds it. */
const LOCALE_NS = "settings.eye-care";

/**
 * Row copy per locale. `en` is mandatory: dsh-client-locale resolves through a
 * fallback chain that bottoms out at FALLBACK_LOCALE = "en".
 */
const MESSAGES = {
  zh: { title: "背景色", native: "原生", theme: "主题", nativeTheme: "原生主题", island: "岛屿" },
  en: { title: "Background", native: "Native", theme: "Theme", nativeTheme: "Native theme", island: "Island" }
};

// ---------------------------------------------------------------- payload
const AT = new Map();
PALETTES.forEach((palette, i) => AT.set(palette.id, i));

/** Still "warm-paper" unless that palette is gone, in which case fall back to the first. */
const FALLBACK_ID = AT.has(DEFAULT_ID) ? DEFAULT_ID : PALETTES[0].id;

const decoded = [];
/** Name table + value vectors -> { name: { light, dark } }, decoded once per palette. */
function tokensAt(i) {
  let tokens = decoded[i];
  if (tokens !== undefined) return tokens;
  const { light, dark } = PALETTES[i];
  tokens = {};
  for (let n = 0; n < TOKEN_NAMES.length; n++) {
    tokens[TOKEN_NAMES[n]] = { light: light[n], dark: dark[n] };
  }
  decoded[i] = tokens;
  return tokens;
}

/** Public shape stays { id, displayName, swatch, tokens }; `tokens` expands on demand. */
const THEMES = PALETTES.map((palette, i) => ({
  id: palette.id,
  displayName: palette.displayName,
  swatch: palette.swatch,
  get tokens() { return tokensAt(i); }
}));

// ---------------------------------------------------------------- stylesheet
// Created at materialization and tagged the way dsh-client-modules inventories
// bundle CSS: `claimStyles` tags/claims any style tag present when the factory
// returns, and `removeOwnedStyles` removes `style[data-plugin=<package>]` with the
// entry. So apply() needs no install/remove bookkeeping of its own.
for (const [file, content] of [["row.css", ROW_CSS], ["island.css", ISLAND_CSS]]) {
  const styleKey = SOURCE + "/" + file;
  if (typeof document !== "undefined" &&
      document.querySelector("style[data-plugin-css=" + JSON.stringify(styleKey) + "]") === null) {
    const tag = document.createElement("style");
    tag.dataset.plugin = SOURCE;
    tag.dataset.pluginCss = styleKey;
    tag.textContent = content;
    document.head.appendChild(tag);
  }
}

// ---------------------------------------------------------------- state
const listeners = new Set();
let selection = FALLBACK_ID;   // the visible choice
let skinSelection = NATIVE_THEME;
let applied = null;            // the id currently stacked on the host, null = none
let disposeLayer = null;       // disposer of the live layer
let themeService = null;
let localeService = null;

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function announce() {
  for (const listener of listeners) listener(selection);
}

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === OFF_ID || AT.has(raw) ? raw : FALLBACK_ID;
  } catch {
    return FALLBACK_ID;
  }
}
function writeStored(id) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch (error) {
    console.warn(SOURCE + ": could not persist the palette choice", error);
  }
}

function readSkin() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === ISLAND_THEME ? ISLAND_THEME : NATIVE_THEME;
  } catch {
    return NATIVE_THEME;
  }
}

function reconcile() {
  if (themeService === null) return;
  if (skinSelection === ISLAND_THEME) document.body?.setAttribute("data-eye-care-theme", ISLAND_THEME);
  else document.body?.removeAttribute("data-eye-care-theme");
  const effective = skinSelection === ISLAND_THEME ? ISLAND_THEME : selection;
  if (effective !== applied) push(effective);
}

function chooseSkin(id) {
  if (id !== NATIVE_THEME && id !== ISLAND_THEME) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch (error) {
    console.warn(SOURCE + ": could not persist the theme choice", error);
  }
  skinSelection = id;
  reconcile();
  announce();
}

// ---------------------------------------------------------------- layer
/**
 * The host keys override layers by `source`: stacking a new layer for the same
 * source atomically replaces the previous one and turns its disposer into a no-op.
 * A palette -> palette switch is therefore exactly ONE publish, instead of the two
 * a dispose-then-stack would cost (every publish makes ui-layout's presenter
 * rewrite every token variable and forces a style recalculation).
 * Only "DSH default" and teardown really dispose.
 */
function push(id) {
  if (id === ISLAND_THEME) {
    disposeLayer = themeService.overrideTokens(SOURCE, ISLAND_TOKENS);
    applied = id;
    return;
  }
  const at = AT.get(id);
  if (at === undefined) {
    if (disposeLayer !== null) {
      const dispose = disposeLayer;
      disposeLayer = null;
      applied = null;
      dispose();
    }
    return;
  }
  disposeLayer = themeService.overrideTokens(SOURCE, tokensAt(at));
  applied = id;
}

/** Point the visible selection at `id` and reconcile the host layer. Idempotent. */
function select(id) {
  selection = id;
  reconcile();
}

function choose(id) {
  writeStored(id);
  select(id);
  announce();
}

const onStorage = (event) => {
  if (event.key !== null && event.key !== STORAGE_KEY && event.key !== THEME_STORAGE_KEY) return;
  skinSelection = readSkin();
  select(readStored());
  announce();
};

// ---------------------------------------------------------------- row
// Class names mirror row.css one for one; the contract test cross-checks both ways.
const css = {
  group: "dshEyeCare_group",
  title: "dshEyeCare_title",
  cubeRow: "dshEyeCare_cubeRow",
  cube: "dshEyeCare_cube",
  selected: "dshEyeCare_selected",
  swatch: "dshEyeCare_swatch",
  swatchNone: "dshEyeCare_swatchNone",
  background: "dshEyeCare_background",
  select: "dshEyeCare_select"
};
/** Resolve package text (a plain string, or a { locale: label } map) through the active language. */
function labelOf(text) {
  if (typeof text === "string") return text;
  if (localeService !== null) return localeService.resolveText(text);
  return text.zh ?? text.en ?? Object.values(text)[0];
}

function h(type, props) {
  return react.createElement.apply(null, [type, props].concat([].slice.call(arguments, 2)));
}

/**
 * Palette row: owns its selection, so it needs no store seat and no injected action.
 * It does take `t` — the descriptor's `locale` makes the renderer mint a fresh
 * translator per language revision, and that new identity is what re-renders this row
 * (palette labels included) when the user switches Settings -> General -> Language.
 */
function AppearanceSettings(props) {
  const t = props?.t ?? ((key) => MESSAGES.zh[key] ?? key);
  const [selected, setSelected] = react.useState(readStored);
  const [skin, setSkin] = react.useState(readSkin);
  const [menuOpen, setMenuOpen] = react.useState(false);
  react.useEffect(() => subscribe(() => {
    setSelected(selection);
    setSkin(skinSelection);
    setMenuOpen(false);
  }), []);

  const options = THEMES.map((theme) => ({ id: theme.id, label: labelOf(theme.displayName), swatch: theme.swatch }));
  options.push({ id: OFF_ID, label: t("native"), swatch: null });

  const section = (title, choices, active, chooseOption, sectionId) => h("div", { className: css.group, "data-eye-care-section": sectionId },
    h("div", { className: css.title }, title),
    h("div", { className: css.cubeRow },
      choices.map((option) => {
        const on = option.id === active;
        return h("button", {
          key: option.id,
          type: "button",
          className: on ? css.cube + " " + css.selected : css.cube,
          "aria-pressed": on ? "true" : "false",
          onClick: () => chooseOption(option.id)
        },
          h("span", {
            "aria-hidden": "true",
            className: option.swatch === null ? css.swatch + " " + css.swatchNone : css.swatch,
            style: option.swatch === null ? undefined : { background: option.swatch }
          }),
          h("span", null, option.label));
      })));
  return h("div", null,
    section(t("theme"), [
      { id: NATIVE_THEME, label: t("nativeTheme"), swatch: null },
      { id: ISLAND_THEME, label: t("island"), swatch: "linear-gradient(135deg,#fbf7ed 50%,#16856a 50%)" }
    ], skin, chooseSkin, "theme"),
    skin === NATIVE_THEME ? h("div", { className: css.group + " " + css.background, "data-eye-care-section": "background" },
      h("span", { className: css.title }, t("title")),
      h(Menu, {
        open: menuOpen,
        onClose: () => setMenuOpen(false),
        items: options.map(({ id, label }) => ({ id, label })),
        selectedId: selected,
        onSelect: (id) => { setMenuOpen(false); choose(id); },
        portal: true,
        align: "end",
        minWidthFromAnchor: true,
        autoFocus: true,
        anchor: h("button", {
          type: "button",
          className: css.select,
          "aria-label": t("title"),
          "aria-haspopup": "menu",
          "aria-expanded": menuOpen,
          onClick: () => setMenuOpen(!menuOpen),
          onKeyDown: (event) => {
            if (!menuOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
              event.preventDefault(); setMenuOpen(true);
            }
          }
        }, options.find((option) => option.id === selected)?.label,
          h(IconChevronDownOutlineRegular, { size: 12, "aria-hidden": true }))
      })) : null);
}

// ---------------------------------------------------------------- plugin
/** Required services: locale (row copy), the theme registry to stack layers on, and the settings row slot. */
const inject = ["locale", "theme", "slots"];

/**
 * Register the row copy, apply the persisted palette, and contribute the switcher row.
 * @param ctx - client root context.
 */
function apply(ctx) {
  localeService = ctx.get("locale");
  themeService = ctx.get("theme");

  ctx.effect(() => {
    const disposeCopy = localeService.register(LOCALE_NS, MESSAGES);
    skinSelection = readSkin();
    select(readStored());
    // Another window may switch the palette; localStorage is per origin.
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.body?.removeAttribute("data-eye-care-theme");
      if (disposeLayer !== null) {
        disposeLayer();
        disposeLayer = null;
      }
      disposeCopy();
      applied = null;
      themeService = null;
      localeService = null;
    };
  }, SOURCE + ": palette layer and row copy");

  ctx.slots.inject("settings.general.item", () =>
    ctx.slots.register(
      { name: "settings.general.item", id: "eye-care-palette", order: 12, locale: LOCALE_NS },
      AppearanceSettings
    ));
}

exports.THEMES = THEMES;
exports.STORAGE_KEY = STORAGE_KEY;
exports.THEME_STORAGE_KEY = THEME_STORAGE_KEY;
exports.OFF_ID = OFF_ID;
exports.DEFAULT_THEME = FALLBACK_ID;
exports.apply = apply;
exports.inject = inject;
