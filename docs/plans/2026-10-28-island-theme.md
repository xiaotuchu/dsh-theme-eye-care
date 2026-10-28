# Island theme implementation plan

**Goal:** Extract the old workspace's Island appearance into this plugin, with independent theme and native background settings.

**Approved design:** Settings has Native / Island theme choices. Background choices (native, warm paper, green, grey) appear only under Native. Island uses its own complete appearance. Returning to Native restores the saved background. Existing users default to Native with their existing background. Dark mode stays controlled by DSH; Island hides the light artwork in dark mode.

**Architecture:** Keep the existing palette storage key and host token override API. Add a separate theme storage key and a scoped Island style layer. Extract only background artwork and native component styling, not the old rail, workspace modules, navigation state, or layout sizing. Clean up the theme marker and live token layer on disposal. Bundle the local image so desktop/web have no external asset URL dependency. Preserve the source image's attribution and license separately from plugin code.

**Tech stack:** Existing JavaScript ModuleLoader runtime, React settings slot, DSH token service, CSS and zero-dependency Node tests.

## Steps

1. Add failing runtime tests for two settings sections, conditional backgrounds, remembered choices, persisted startup, cross-window synchronization, invalid storage and teardown. Run `node test/island.test.js` and confirm missing theme behavior.
2. Extend `src/runtime/client.cjs` with independent theme selection; retain palette API and native behavior. Extract scoped styles into `src/runtime/island.css`, artwork into `assets/island-background.png`, and adapted palette tokens into `src/island-tokens.json`. Extend `src/bundle.js` payload with the Island CSS/tokens. Avoid old navigation/layout rules.
3. Run `node src/build.js`, then `node test/run.js` and `node src/build.js --check`. Adapt existing test harness to inspect the background subsection and keep its old assertions. Add scoped-style/package checks for the extracted appearance and artwork.
4. Exercise the real bundle in a browser fixture: native palette -> Island -> native, settings visibility, dark mode, artwork loading and layout bounds. Record live-host verification limits.
5. Update Chinese/English README settings instructions and third-party notices. Verify package contents and review the final diff. Do not publish a new npm version as part of this local integration.

## Validation result

- Five Node suites pass: deterministic build, existing host contract, Island state transitions, scoped styles/token registry/attribution, and the three existing palette contrast suites.
- Real generated bundle exercised with React 18 in a headless Edge fixture: image decode, theme selection, hidden/restored background controls, persisted reload, dark mode, unchanged layout bounds, narrow viewport and teardown pass.
- npm packaging includes the client bundle and third-party notices/license. No external runtime dependency or image endpoint was introduced.
- Desktop currently depends on npm version 2.1.0. This checkout has not replaced that installation or been published; live DSH visual integration remains unverified.
