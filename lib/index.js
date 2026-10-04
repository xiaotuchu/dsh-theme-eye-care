/**
 * Host half of the Eye-care palettes plugin.
 *
 * All three palettes live in the client half: it stacks one alias-token override
 * layer for the selected palette and contributes the switcher row to
 * Settings -> General. This half therefore has no work to do — but its row has
 * to exist, because `dsh-client-modules` discovers `dsh.client` by walking the
 * enabled Loader rows' manifests, so without a mounted row the browser bundle is
 * never served.
 *
 * Deliberately declares no `inject`: a service dependency here (`webServer`, for
 * example) would leave the row permanently pending in profiles that do not have
 * that service, and the row only needs to be mounted, not activated.
 */

/** Stable plugin name; matches the row id in cordis.patch.yml. */
const name = 'dsh-theme-eye-care';

/** No host-side setup: the palettes live in the client bundle. */
function apply() {}

export { apply, name };
