// Theme file contract (themes/*.json) — the only shape the build depends on.
//
// Structural rules live here so a malformed palette fails the build with the file
// name attached. Palette *policy* (official token names, contrast floors,
// cross-theme colour leakage, the surface ladder) is asserted by
// test/themes.test.js instead, because it moves with taste rather than with shape.
//
// A token value is either a CSS string — shorthand for "the same value in both
// color schemes", which is how the --dsw-static-* anchors are written — or an
// explicit { light, dark } pair. Normalization always hands the build pairs.

const ID = /^[a-z0-9][a-z0-9-]*$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
/** Lowercase BCP 47-style key, matching dsh-client-locale's locale-id pattern. */
const LOCALE_KEY = /^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/;
const CSS_VALUE =
  /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|color-mix\(|var\(|linear-gradient\(|transparent|currentColor)/;

function fail(file, message) {
  throw new Error(`themes/${file}: ${message}`);
}

/**
 * A display name is package text: either a plain string (used verbatim in every
 * language) or a `{ locale: label }` map, which is the shape
 * `locale.resolveText` understands. The map must carry `en`, because the locale
 * fallback chain bottoms out there and would otherwise resolve to undefined.
 */
function normalizeDisplayName(value, file) {
  if (typeof value === 'string') {
    if (value === '') fail(file, '"displayName" must not be empty');
    return value;
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail(file, '"displayName" must be a string or a { locale: label } map');
  }
  const entries = Object.entries(value);
  if (entries.length === 0) fail(file, '"displayName" must not be empty');
  for (const [locale, label] of entries) {
    if (!LOCALE_KEY.test(locale)) fail(file, `"displayName" key "${locale}" is not a lowercase BCP 47 tag`);
    if (typeof label !== 'string' || label === '') fail(file, `"displayName"."${locale}" must be a non-empty string`);
  }
  if (!Object.hasOwn(value, 'en')) fail(file, '"displayName" map must include "en" (the fallback locale)');
  return Object.fromEntries(entries);
}

/**
 * Parse one theme file's text.
 *
 * A UTF-8 BOM is stripped rather than rejected: Windows editors write one by habit,
 * and `JSON.parse` refuses it with a message that never mentions the file. Any other
 * parse failure is re-thrown with the file name attached, the same way structural
 * problems are.
 */
export function parseTheme(text, file) {
  let raw;
  try {
    raw = JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch (error) {
    fail(file, `not valid JSON — ${error.message}`);
  }
  return normalizeTheme(raw, file);
}

/** Normalize one theme file. Returns `{ id, displayName, colorScheme, source, tokens }`. */
export function normalizeTheme(raw, file) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) fail(file, 'must be a JSON object');
  if (typeof raw.id !== 'string' || !ID.test(raw.id)) fail(file, '"id" must be a lowercase kebab-case string');
  if (raw.colorScheme !== 'light' && raw.colorScheme !== 'dark') {
    fail(file, '"colorScheme" must be "light" or "dark"');
  }
  if (!Array.isArray(raw.source) || raw.source.length === 0 || !raw.source.every((c) => HEX.test(c))) {
    fail(file, '"source" must be a non-empty list of #rrggbb');
  }
  if (raw.tokens === null || typeof raw.tokens !== 'object' || Array.isArray(raw.tokens)) {
    fail(file, '"tokens" must be an object');
  }

  const tokens = {};
  for (const [name, value] of Object.entries(raw.tokens)) {
    if (!name.startsWith('--dsw-') && !name.startsWith('--shiki-')) {
      fail(file, `not a --dsw-/--shiki- token: ${name}`);
    }
    if (typeof value === 'string') {
      if (!CSS_VALUE.test(value.trim())) fail(file, `${name} is not a recognized CSS value: ${value}`);
      tokens[name] = { light: value, dark: value };
      continue;
    }
    if (value === null || typeof value !== 'object') {
      fail(file, `${name} must be a CSS string or a { light, dark } pair`);
    }
    for (const key of Object.keys(value)) {
      if (key !== 'light' && key !== 'dark') fail(file, `${name} has unexpected mode key "${key}"`);
    }
    for (const mode of ['light', 'dark']) {
      const v = value[mode];
      if (typeof v !== 'string' || v.trim() === '') fail(file, `${name}.${mode} is missing`);
      if (!CSS_VALUE.test(v.trim())) fail(file, `${name}.${mode} is not a recognized CSS value: ${v}`);
    }
    tokens[name] = { light: value.light, dark: value.dark };
  }

  return {
    id: raw.id,
    displayName: normalizeDisplayName(raw.displayName, file),
    colorScheme: raw.colorScheme,
    source: [...raw.source],
    tokens
  };
}

/**
 * The payload stores one shared token-name table plus one position-aligned value
 * vector per palette, so every theme must define exactly the same names. Enforced
 * here rather than in a test: without it the emitted payload would be silently
 * wrong, not merely unvalidated.
 *
 * @returns the shared name table, in the order of the first theme.
 */
export function assertSharedNames(themes) {
  const names = Object.keys(themes[0].tokens);
  const known = new Set(names);
  for (const theme of themes.slice(1)) {
    const own = new Set(Object.keys(theme.tokens));
    const missing = names.filter((n) => !own.has(n));
    const extra = [...own].filter((n) => !known.has(n));
    if (missing.length === 0 && extra.length === 0) continue;
    const show = (list) => list.slice(0, 8).join(', ') + (list.length > 8 ? ` …(+${list.length - 8})` : '');
    throw new Error(
      `themes/${theme.id}.json: token names must match ${themes[0].id} exactly` +
        (missing.length ? ` — missing: ${show(missing)}` : '') +
        (extra.length ? ` — extra: ${show(extra)}` : '')
    );
  }
  return names;
}
