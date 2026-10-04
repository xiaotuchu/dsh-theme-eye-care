// themes -> the generated payload block.
//
// Pure: no IO, no dates, stable ordering, so two runs on any machine produce
// identical bytes. The shape is one shared token-name table plus two
// position-aligned value vectors per palette; `TOKEN_NAMES[n]` names
// `PALETTES[i].light[n]` and `PALETTES[i].dark[n]`.
import { assertSharedNames } from './theme-file.js';

/**
 * @param root0 - package name, normalized themes (already sorted), and the
 *   compacted row stylesheet.
 * @returns the JavaScript source of the payload block.
 */
export function emitPayload({ pkgName, themes, css }) {
  const names = assertSharedNames(themes);
  const lines = [
    `var SOURCE = ${JSON.stringify(pkgName)};`,
    `var TOKEN_NAMES = ${JSON.stringify(names)};`,
    'var PALETTES = ['
  ];
  for (const theme of themes) {
    lines.push(
      `\t{ id: ${JSON.stringify(theme.id)}, displayName: ${JSON.stringify(theme.displayName)},` +
        ` swatch: ${JSON.stringify(theme.source[0])},`
    );
    lines.push(`\t\tlight: ${JSON.stringify(names.map((n) => theme.tokens[n].light))},`);
    lines.push(`\t\tdark: ${JSON.stringify(names.map((n) => theme.tokens[n].dark))} },`);
  }
  lines.push('];', `var ROW_CSS = ${JSON.stringify(css)};`);
  return lines.join('\n');
}
