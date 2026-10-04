// Build lib/client.js from themes/*.json.
//
// The client half is a ModuleLoader bundle: the web client fetches it and it
// registers itself through window.__ModuleLoader__.load({ id, factory }).
//
// It does two things:
//   1. stacks ONE alias-token override layer for the selected palette, on top of
//      whatever theme is active (so the user's light/dark preference is never
//      touched), and can swap that layer live;
//   2. contributes a row to Settings -> General that offers the palettes plus a
//      "DSH default" (no layer) choice, persisted in localStorage.
//
// The row is a self-contained function component: the slot contract makes both
// `store` and `inject` optional, so it needs neither a store seat nor an
// injected action face — it owns its state and calls the module-level switcher.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const FALLBACK = 'warm-paper';
const OFF_ID = 'dsh-default';

const themes = readdirSync(join(root, 'themes'))
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(root, 'themes', f), 'utf8')));

if (themes.length === 0) throw new Error('no theme files in themes/');
const fallback = themes.find((t) => t.id === FALLBACK) ?? themes[0];

// One line per token keeps the generated file greppable.
function emitTokens(tokens) {
  return Object.entries(tokens)
    .map(([name, pair]) => `\t\t\t${JSON.stringify(name)}: { light: ${JSON.stringify(pair.light)}, dark: ${JSON.stringify(pair.dark)} }`)
    .join(',\n');
}

const themeBlocks = themes
  .map((t) => `\t\t{
\t\t\tid: ${JSON.stringify(t.id)},
\t\t\tdisplayName: ${JSON.stringify(t.displayName)},
\t\t\tswatch: ${JSON.stringify(t.source[0])},
\t\t\ttokens: {
${emitTokens(t.tokens)}
\t\t\t}
\t\t}`)
  .join(',\n');

const id = pkg.name;
const out = `// GENERATED FILE — edit themes/*.json and run \`npm run build\`.
//
// Client half of ${id}. Stacks one alias-token override layer for the selected
// palette over whatever theme is active, and contributes the palette switcher to
// Settings -> General. Every token value is a { light, dark } pair because the
// presenter picks one per active color scheme.
window.__ModuleLoader__.load({
\tid: ${JSON.stringify(id)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

\t\tvar react = require("react");

\t\tvar SOURCE = ${JSON.stringify(id)};
\t\tvar STORAGE_KEY = "dsh-theme-eye-care:palette";
\t\tvar DEFAULT_THEME = ${JSON.stringify(fallback.id)};
\t\tvar OFF_ID = ${JSON.stringify(OFF_ID)};

\t\tvar THEMES = [
${themeBlocks}
\t\t];

\t\t// ---------------------------------------------------------------- state
\t\tvar themeService = null;
\t\tvar disposeLayer = null;
\t\tvar selection = DEFAULT_THEME;
\t\tvar listeners = new Set();

\t\tfunction themeById(id) {
\t\t\tfor (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
\t\t\treturn undefined;
\t\t}

\t\t/** Read the persisted choice, falling back to the default palette. */
\t\tfunction readStored() {
\t\t\ttry {
\t\t\t\tvar raw = window.localStorage.getItem(STORAGE_KEY);
\t\t\t\tif (raw === OFF_ID) return OFF_ID;
\t\t\t\treturn themeById(raw) ? raw : DEFAULT_THEME;
\t\t\t} catch (error) {
\t\t\t\treturn DEFAULT_THEME;
\t\t\t}
\t\t}

\t\tfunction writeStored(id) {
\t\t\ttry {
\t\t\t\twindow.localStorage.setItem(STORAGE_KEY, id);
\t\t\t} catch (error) {
\t\t\t\tconsole.warn(SOURCE + ": could not persist the palette choice", error);
\t\t\t}
\t\t}

\t\tfunction notify(id) {
\t\t\tlisteners.forEach((listener) => listener(id));
\t\t}

\t\tfunction subscribe(listener) {
\t\t\tlisteners.add(listener);
\t\t\treturn () => {
\t\t\t\tlisteners.delete(listener);
\t\t\t};
\t\t}

\t\t// ---------------------------------------------------------------- layer
\t\t/**
\t\t* Replace the override layer with the one for \\\`id\\\`, or remove it entirely
\t\t* for the "DSH default" choice. overrideTokens returns a disposer, so a swap
\t\t* is dispose-then-stack and never leaves two layers behind.
\t\t*/
\t\tfunction selectPalette(id) {
\t\t\tselection = id;
\t\t\tif (disposeLayer !== null) {
\t\t\t\tdisposeLayer();
\t\t\t\tdisposeLayer = null;
\t\t\t}
\t\t\tvar theme = themeById(id);
\t\t\tif (theme === undefined || themeService === null) return;
\t\t\tdisposeLayer = themeService.overrideTokens(SOURCE, theme.tokens);
\t\t}

\t\tfunction choose(id) {
\t\t\twriteStored(id);
\t\t\tselectPalette(id);
\t\t\tnotify(id);
\t\t}

\t\t// ---------------------------------------------------------------- row UI
\t\t// Styling mirrors the built-in Appearance row's cubes rule-for-rule (same
\t\t// declarations, re-prefixed class names) so the General column reads as one
\t\t// control family. Injected as a stylesheet rather than inline styles because
\t\t// the :hover state and the .5px hairline are not expressible inline.
\t\tvar STYLE_ID = SOURCE + ":row-css";
\t\tvar ROW_CSS = ".dshEyeCare_group{border-bottom:.5px solid var(--dsw-alias-border-l2);flex-direction:column;gap:8px;padding:16px 0;display:flex}.dshEyeCare_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.dshEyeCare_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}.dshEyeCare_cubeRow{flex-wrap:wrap;align-items:stretch;gap:8px;display:flex}.dshEyeCare_cube{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-xl);font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;flex-direction:column;flex:1 1 0;min-width:88px;justify-content:center;align-items:center;gap:4px;padding:20px 12px;font-size:14px;line-height:22px;display:flex}.dshEyeCare_cube:hover:not(.dshEyeCare_selected){background:var(--dsw-alias-interactive-bg-hover)}.dshEyeCare_selected{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-static-neutral-bluish-400)}.dshEyeCare_swatch{box-sizing:border-box;flex:none;width:20px;height:20px;border-radius:4px;border:1px solid var(--dsw-alias-border-l3)}.dshEyeCare_swatchNone{background:0 0;border-style:dashed;border-color:var(--dsw-alias-border-l4)}";

\t\t/** Inject our row stylesheet once; returns whether THIS call created it. */
\t\tfunction installRowCss() {
\t\t\tif (document.getElementById(STYLE_ID) !== null) return false;
\t\t\tvar style = document.createElement("style");
\t\t\tstyle.id = STYLE_ID;
\t\t\tstyle.textContent = ROW_CSS;
\t\t\tdocument.head.appendChild(style);
\t\t\treturn true;
\t\t}

\t\tfunction removeRowCss() {
\t\t\tvar style = document.getElementById(STYLE_ID);
\t\t\tif (style !== null && style !== undefined) style.remove();
\t\t}

\t\tvar OPTIONS = THEMES.map((theme) => ({ id: theme.id, label: theme.displayName, swatch: theme.swatch }));
\t\tOPTIONS.push({ id: OFF_ID, label: "DSH 默认", swatch: null });

\t\t/** Palette row: owns its selection, so it needs no store seat or injected action. */
\t\tfunction PaletteRow() {
\t\t\tvar state = react.useState(readStored);
\t\t\tvar selected = state[0];
\t\t\tvar setSelected = state[1];
\t\t\treact.useEffect(() => subscribe(setSelected), []);
\t\t\treturn react.createElement(
\t\t\t\t"div",
\t\t\t\t{ className: "dshEyeCare_group" },
\t\t\t\treact.createElement("div", { className: "dshEyeCare_title" }, "护眼配色"),
\t\t\t\treact.createElement("div", { className: "dshEyeCare_desc" }, "选择立即生效并被记住"),
\t\t\t\treact.createElement(
\t\t\t\t\t"div",
\t\t\t\t\t{ className: "dshEyeCare_cubeRow" },
\t\t\t\t\tOPTIONS.map((option) =>
\t\t\t\t\t\treact.createElement(
\t\t\t\t\t\t\t"button",
\t\t\t\t\t\t\t{
\t\t\t\t\t\t\t\tkey: option.id,
\t\t\t\t\t\t\t\ttype: "button",
\t\t\t\t\t\t\t\t"aria-pressed": selected === option.id ? "true" : "false",
\t\t\t\t\t\t\t\tonClick: () => choose(option.id),
\t\t\t\t\t\t\t\tclassName: selected === option.id ? "dshEyeCare_cube dshEyeCare_selected" : "dshEyeCare_cube"
\t\t\t\t\t\t\t},
\t\t\t\t\t\t\treact.createElement("span", {
\t\t\t\t\t\t\t\tclassName: option.swatch === null ? "dshEyeCare_swatch dshEyeCare_swatchNone" : "dshEyeCare_swatch",
\t\t\t\t\t\t\t\tstyle: option.swatch === null ? undefined : { background: option.swatch }
\t\t\t\t\t\t\t}),
\t\t\t\t\t\t\treact.createElement("span", null, option.label)
\t\t\t\t\t\t)
\t\t\t\t\t)
\t\t\t\t)
\t\t\t);
\t\t}

\t\t// ---------------------------------------------------------------- plugin
\t\t/** Required services: the theme registry to stack layers on, and the settings row slot. */
\t\tvar inject = ["theme", "slots"];

\t\t/**
\t\t* Apply the persisted palette and contribute the switcher row.
\t\t* @param ctx - client root context.
\t\t*/
\t\tfunction apply(ctx) {
\t\t\tthemeService = ctx.get("theme");
\t\t\tvar ownsRowCss = installRowCss();
\t\t\tctx.effect(() => {
\t\t\t\tselectPalette(readStored());
\t\t\t\t// Another window may switch the palette; localStorage is per origin.
\t\t\t\tvar onStorage = (event) => {
\t\t\t\t\tif (event.key !== null && event.key !== STORAGE_KEY) return;
\t\t\t\t\tselectPalette(readStored());
\t\t\t\t\tnotify(selection);
\t\t\t\t};
\t\t\t\twindow.addEventListener("storage", onStorage);
\t\t\t\treturn () => {
\t\t\t\t\twindow.removeEventListener("storage", onStorage);
\t\t\t\t\tif (ownsRowCss) removeRowCss();
\t\t\t\t\tif (disposeLayer !== null) {
\t\t\t\t\t\tdisposeLayer();
\t\t\t\t\t\tdisposeLayer = null;
\t\t\t\t\t}
\t\t\t\t\tthemeService = null;
\t\t\t\t};
\t\t\t}, SOURCE + ": palette layer");
\t\t\tctx.slots.inject("settings.general.item", () =>
\t\t\t\tctx.slots.register(
\t\t\t\t\t{ name: "settings.general.item", id: "eye-care-palette", order: 12 },
\t\t\t\t\tPaletteRow
\t\t\t\t)
\t\t\t);
\t\t}

\t\texports.THEMES = THEMES;
\t\texports.STORAGE_KEY = STORAGE_KEY;
\t\texports.OFF_ID = OFF_ID;
\t\texports.DEFAULT_THEME = DEFAULT_THEME;
\t\texports.apply = apply;
\t\texports.inject = inject;
\t\treturn module.exports;
\t}
});
`;

mkdirSync(join(root, 'lib'), { recursive: true });
writeFileSync(join(root, 'lib', 'client.js'), out);
console.log(
  'wrote lib/client.js  ' + out.length + ' chars  (' + themes.length + ' themes, ' +
  themes.map((t) => t.id + ':' + Object.keys(t.tokens).length).join(' ') + ')'
);
