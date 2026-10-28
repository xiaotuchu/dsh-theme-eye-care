# DSH Eye-care Themes

[中文](README.md) ｜ **English**

Two appearances for **DeepSeek Harness**: **Native theme** with selectable background palettes, and **Island** with its own palette, artwork and component styling.

## Install

### Desktop

Open **Add plugin**, select the **npm registry**, and enter `@xiaotuchu/dsh-theme-eye-care`. Restart DSH when prompted.

### Web

```sh
dsh plugin --profile web add "@xiaotuchu/dsh-theme-eye-care"
```

Restart the corresponding DSH service after installation. For a desktop installation through the CLI, replace `web` with `desktop`.

## Uninstall

```sh
dsh plugin --profile web remove "@xiaotuchu/dsh-theme-eye-care"
```

Use `desktop` instead of `web` for the desktop profile. Restart when prompted to restore DSH's original appearance.

## Features

Choose a theme in **Settings → General**. Changes apply immediately.

### Native theme

Keep DSH's layout and component appearance, and choose a palette from the **Background** dropdown.

| Background | Appearance |
| --- | --- |
| Warm Paper | Warm cream, the default palette |
| Sage Green | Pale green background |
| Warm Grey | Neutral warm grey |
| Native | DSH's built-in palette |

![Three native background palettes](preview-en.png)

### Island theme

- Cream and green palette, island artwork and leaf headings.
- Coordinated sidebar, composer and settings styling.
- Rounded code cards with colored dots inside chat and Markdown content; standalone source files keep their native preview styling.
- Supports [File Tree](https://github.com/xiaotuchu/dsh-file-tree), extending the shared artwork beneath the tree.
- Preserves the composer and footer mask so scrolled conversation text does not show through.

Island uses its own palette. Switching back to Native restores your previous background selection.

### Preferences and dark mode

- Remembers theme and background choices and synchronizes them across windows on the same origin.
- Follows DSH's light, dark or system appearance. Dark mode uses matching palettes; Island hides its light artwork and decorations.
- Supports Chinese and English, following the DSH interface language.

Some Island styles depend on DSH's component structure and may need updates when DSH changes.

## License

Original plugin code and native background palettes are licensed under [MIT](LICENSE).

Island artwork and adapted appearance come from [Animal Island UI](https://github.com/guokaigdg/animal-island-ui) and retain the **CC BY-NC 4.0 (Attribution–NonCommercial)** license. See [Third-party notices](THIRD_PARTY_NOTICES.md).