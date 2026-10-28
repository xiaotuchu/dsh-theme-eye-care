# Third-party notices

## Island artwork and adapted appearance

- Original project: [Animal Island UI](https://github.com/guokaigdg/animal-island-ui)
- Original author: guokaigdg and Animal Island UI contributors.
- License: Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0). See [the included license](assets/licenses/ANIMAL-ISLAND-UI-LICENSE).
- Local source: `dsh-old/frontend/assets/island-background.png` and the appearance adapted in `dsh-old/frontend/src/styles/`.
- Covered files: `assets/island-background.png`, the adapted appearance in `src/runtime/island.css` and `src/island-tokens.json`, and their generated copies in `lib/client.js`.
- Changes: extracted the appearance from the old workbench; removed navigation/layout coupling; scoped it to the optional Island theme; integrated DSH token overrides, settings and dark-mode handling. The copied background image is unchanged.

The Island material retains its attribution and noncommercial license. It is not relicensed under MIT. The plugin's original integration code and native background palettes remain under the [MIT license](LICENSE).
