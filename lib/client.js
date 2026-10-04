// GENERATED FILE — edit themes/*.json and run `npm run build`.
//
// Client half of @xiaotuchu/dsh-theme-eye-care. Stacks one alias-token override layer for the selected
// palette over whatever theme is active, and contributes the palette switcher to
// Settings -> General. Every token value is a { light, dark } pair because the
// presenter picks one per active color scheme.
window.__ModuleLoader__.load({
	id: "@xiaotuchu/dsh-theme-eye-care",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		var react = require("react");

		var SOURCE = "@xiaotuchu/dsh-theme-eye-care";
		var STORAGE_KEY = "dsh-theme-eye-care:palette";
		var DEFAULT_THEME = "warm-paper";
		var OFF_ID = "dsh-default";

		var THEMES = [
		{
			id: "eye-green",
			displayName: "护眼绿",
			swatch: "#eef7ed",
			tokens: {
			"--dsw-alias-bg-base": { light: "#eef7ed", dark: "#1c211d" },
			"--dsw-alias-bg-layer-1": { light: "#eef7ed", dark: "#232a24" },
			"--dsw-alias-bg-layer-2": { light: "#eef7ed", dark: "#29322a" },
			"--dsw-alias-bg-layer-3": { light: "#eef7ed", dark: "#303a31" },
			"--dsw-alias-bg-module-platform": { light: "#e2efe0", dark: "#29322a" },
			"--dsw-alias-bg-multi-select": { light: "#e7f2e5", dark: "#303a31" },
			"--dsw-alias-bg-overlay": { light: "#eaf4e8", dark: "#303a31" },
			"--dsw-alias-bg-document-preview": { light: "#e2efe0", dark: "#1c211d" },
			"--dsw-alias-bg-skeleton": { light: "rgba(79,118,95, 0.08)", dark: "rgba(214,231,216, 0.08)" },
			"--dsw-alias-bg-mask-1": { light: "rgba(28,40,32, 0.28)", dark: "rgba(0, 0, 0, 0.5)" },
			"--dsw-alias-bg-mask-2": { light: "rgba(28,40,32, 0.14)", dark: "rgba(0, 0, 0, 0.2)" },
			"--dsw-alias-bg-mask-3": { light: "rgba(18,28,21, 0.48)", dark: "rgba(0, 0, 0, 0.48)" },
			"--dsw-alias-bg-mask-photo": { light: "rgba(18,28,21, 0.88)", dark: "rgba(0, 0, 0, 0.88)" },
			"--dsw-alias-bg-mask-drop": { light: "rgba(238, 247, 237, 0.72)", dark: "rgba(31,42,35, 0.72)" },
			"--dsw-alias-bg-document-selection": { light: "color-mix(in srgb, #4f765f 40%, transparent)", dark: "color-mix(in srgb, #4f765f 40%, transparent)" },
			"--dsw-alias-border-l1": { light: "rgba(79,118,95, 0.12)", dark: "rgba(214,231,216, 0.08)" },
			"--dsw-alias-border-l2": { light: "rgba(79,118,95, 0.20)", dark: "rgba(214,231,216, 0.14)" },
			"--dsw-alias-border-l2-darkmode-thin": { light: "rgba(79,118,95, 0.20)", dark: "rgba(214,231,216, 0.08)" },
			"--dsw-alias-border-l3": { light: "rgba(79,118,95, 0.26)", dark: "rgba(214,231,216, 0.18)" },
			"--dsw-alias-border-l4": { light: "rgba(79,118,95, 0.34)", dark: "rgba(214,231,216, 0.24)" },
			"--dsw-alias-border-inverted": { light: "rgba(0, 0, 0, 0)", dark: "rgba(214,231,216, 0.06)" },
			"--dsw-alias-border-inverted2": { light: "rgba(0, 0, 0, 0)", dark: "rgba(214,231,216, 0.08)" },
			"--dsw-alias-label-primary": { light: "#26332b", dark: "#dfe9e0" },
			"--dsw-alias-label-primary-dimmed": { light: "#33413a", dark: "#c3d3c6" },
			"--dsw-alias-label-primary-foreground": { light: "#eef7ed", dark: "#1c211d" },
			"--dsw-alias-label-primary-inverted": { light: "#eef7ed", dark: "#c3d3c6" },
			"--dsw-alias-label-primary-bluish": { light: "#3d5c4a", dark: "#c6e0cd" },
			"--dsw-alias-label-secondary": { light: "#4a5a4f", dark: "#b4c2b6" },
			"--dsw-alias-label-tertiary": { light: "#556852", dark: "#93a396" },
			"--dsw-alias-label-caption": { light: "#768878", dark: "#7c8b7f" },
			"--dsw-alias-label-dimmed": { light: "#d3e6d1", dark: "#3a4738" },
			"--dsw-alias-label-document-preview": { light: "#4e6055", dark: "#b4c2b6" },
			"--dsw-alias-label-shimmer": { light: "color-mix(in srgb, #1d2b21 30%, transparent)", dark: "color-mix(in srgb, #f7fcf6 45%, transparent)" },
			"--dsw-alias-label-deep-diving": { light: "#7d5f16", dark: "#e0c07a" },
			"--dsw-alias-label-deep-diving-shimmer": { light: "#9c7a20", dark: "#f0d89a" },
			"--dsw-alias-link": { light: "#4f765f", dark: "#8fc0a0" },
			"--dsw-alias-settings-card-fill": { light: "var(--dsw-alias-bg-layer-2)", dark: "var(--dsw-alias-bg-layer-2)" },
			"--dsw-alias-settings-card-stroke": { light: "var(--dsw-alias-border-l4)", dark: "var(--dsw-alias-border-l4)" },
			"--dsw-alias-brand-primary": { light: "#2f5145", dark: "#dfe9e0" },
			"--dsw-alias-brand-primary-invert": { light: "#2f5145", dark: "#dfe9e0" },
			"--dsw-alias-brand-primary-new-colorprimary-new-color": { light: "#4f765f", dark: "#8fc0a0" },
			"--dsw-alias-brand-text": { light: "#26332b", dark: "#dfe9e0" },
			"--dsw-alias-button-contrast-fill": { light: "#3a5247", dark: "#dfe9e0" },
			"--dsw-alias-button-elevated-fill": { light: "#eef7ed", dark: "#303a31" },
			"--dsw-alias-button-floating-fill": { light: "#eef7ed", dark: "#29322a" },
			"--dsw-alias-button-floating-hover": { light: "#eaf4e8", dark: "#303a31" },
			"--dsw-alias-button-ghost-active-border": { light: "#8fae92", dark: "#5c7a63" },
			"--dsw-alias-button-ghost-active-fill": { light: "#d5e7d3", dark: "#3a4738" },
			"--dsw-alias-button-ghost-active-hover": { light: "#c8dec6", dark: "#456a58" },
			"--dsw-alias-button-info-fill": { light: "#4f765f", dark: "#8fc0a0" },
			"--dsw-alias-button-info-hover": { light: "#3f6149", dark: "#a3ceb2" },
			"--dsw-alias-button-primary-dimmed": { light: "#d5e7d3", dark: "#3a4738" },
			"--dsw-alias-button-primary-fill": { light: "var(--dsw-alias-brand-primary)", dark: "var(--dsw-alias-brand-primary)" },
			"--dsw-alias-button-primary-hover": { light: "#456a58", dark: "#f7fcf6" },
			"--dsw-alias-button-tool-bar-fill": { light: "rgba(74,92,79, 0.5)", dark: "rgba(74,92,79, 0.5)" },
			"--dsw-alias-button-tool-bar-fill-invisible": { light: "rgba(30,42,34, 0.36)", dark: "rgba(30,42,34, 0.36)" },
			"--dsw-alias-button-tool-bar-hover": { light: "rgba(74,92,79, 0.6)", dark: "rgba(74,92,79, 0.6)" },
			"--dsw-alias-interactive-bg-hover": { light: "rgba(79,118,95, 0.07)", dark: "rgba(214,231,216, 0.08)" },
			"--dsw-alias-interactive-bg-active": { light: "rgba(79,118,95, 0.14)", dark: "rgba(214,231,216, 0.14)" },
			"--dsw-alias-interactive-bg-hover-accent": { light: "rgba(79,118,95, 0.16)", dark: "rgba(214,231,216, 0.20)" },
			"--dsw-alias-interactive-bg-hover-danger": { light: "rgba(176, 68, 58, 0.08)", dark: "rgba(214, 120, 110, 0.16)" },
			"--dsw-alias-interactive-bg-hover-solid": { light: "#e7f2e5", dark: "#29322a" },
			"--dsw-alias-markdown-code-block": { light: "#e2efe0", dark: "#232a24" },
			"--dsw-alias-markdown-code-block-banner": { light: "#d5e7d3", dark: "#29322a" },
			"--dsw-alias-markdown-code-segment-selected": { light: "#eef7ed", dark: "#303a31" },
			"--dsw-alias-markdown-code-segment-unselected": { light: "#e7f2e5", dark: "#1f2620" },
			"--dsw-alias-markdown-inline-code": { light: "#e5f1e2", dark: "#29322a" },
			"--dsw-alias-markdown-citation": { light: "#e2efe0", dark: "#29322a" },
			"--dsw-alias-markdown-placeholder": { light: "#e9f4e7", dark: "#232a24" },
			"--dsw-alias-markdown-tag": { light: "#d5e7d3", dark: "#303a31" },
			"--dsw-alias-scrollbar-bg-l1": { light: "#d3e6d1", dark: "#456a58" },
			"--dsw-alias-scrollbar-bg-l2": { light: "#d3e6d1", dark: "#3a4738" },
			"--dsw-alias-scrollbar-hover-l1": { light: "#c0d9be", dark: "#5c7a63" },
			"--dsw-alias-scrollbar-hover-l2": { light: "#c0d9be", dark: "#4b5c48" },
			"--dsw-alias-state-business-primary": { light: "#4f765f", dark: "#8fc0a0" },
			"--dsw-alias-state-business-tertiary": { light: "#dceada", dark: "#3a4738" },
			"--dsw-alias-state-error-primary": { light: "#a83c34", dark: "#e08a80" },
			"--dsw-alias-state-error-secondary": { light: "#c9645a", dark: "#e08a80" },
			"--dsw-alias-state-idle-primary": { light: "#cec5a4", dark: "#5a5340" },
			"--dsw-alias-state-success-primary": { light: "#4f7a33", dark: "#8ec06a" },
			"--dsw-alias-state-success-secondary": { light: "#6b9c4f", dark: "#8ec06a" },
			"--dsw-alias-state-success-tertiary": { light: "#e3edd0", dark: "#333f28" },
			"--dsw-alias-state-warn-primary": { light: "#b07a10", dark: "#e0b260" },
			"--dsw-alias-state-warn-secondary": { light: "#d0a03c", dark: "#e0b260" },
			"--dsw-alias-state-warn-tertiary": { light: "#f6e8c4", dark: "#4a3c1e" },
			"--dsw-alias-state-warn-label": { light: "#8f6210", dark: "#e0b260" },
			"--dsw-alias-code-diff-added": { light: "rgba(79, 122, 51, 0.12)", dark: "rgba(142, 192, 106, 0.12)" },
			"--dsw-alias-code-diff-deleted": { light: "rgba(168, 60, 52, 0.10)", dark: "rgba(224, 138, 128, 0.12)" },
			"--dsw-alias-file-diff-added-bg": { light: "#e6efd6", dark: "#2a3521" },
			"--dsw-alias-file-diff-added-gutter": { light: "#edf4e0", dark: "#212a1a" },
			"--dsw-alias-file-diff-added-marker": { light: "#4f8f36", dark: "#8ec06a" },
			"--dsw-alias-file-diff-deleted-bg": { light: "#f6e2db", dark: "#3a241f" },
			"--dsw-alias-file-diff-deleted-gutter": { light: "#fbeae4", dark: "#2c1a16" },
			"--dsw-alias-file-diff-deleted-marker": { light: "#b0443a", dark: "#e08a80" },
			"--dsw-alias-menu-group-header-fill": { light: "#eaf4e8f0", dark: "#29322af0" },
			"--dsw-alias-menu-icon": { light: "#5c7a63", dark: "#c3d3c6" },
			"--dsw-alias-toast-bg": { light: "#3a5247", dark: "#303a31" },
			"--dsw-alias-toast-label": { light: "#eef7ed", dark: "#f7fcf6" },
			"--dsw-alias-tooltip-bg": { light: "#2f5145", dark: "#303a31" },
			"--dsw-alias-tooltip-key-bg": { light: "color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)", dark: "color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)" },
			"--dsw-alias-turn-trigger-bg": { light: "var(--dsw-alias-markdown-code-block)", dark: "var(--dsw-alias-interactive-bg-hover)" },
			"--dsw-alias-turn-trigger-bg-hover": { light: "var(--dsw-alias-interactive-bg-hover)", dark: "var(--dsw-alias-interactive-bg-active)" },
			"--dsw-alias-onboarding-accent": { light: "#4f765f", dark: "#8fc0a0" },
			"--dsw-alias-onboarding-card-fill": { light: "color-mix(in srgb, #f7fcf6 80%, transparent)", dark: "color-mix(in srgb, #29322a 80%, transparent)" },
			"--dsw-alias-onboarding-secondary-fill": { light: "#eef7ed", dark: "#3a4738" },
			"--dsw-alias-onboarding-checkbox-border": { light: "color-mix(in srgb, #26332b 20%, transparent)", dark: "var(--dsw-alias-border-l2)" },
			"--dsw-alias-switch-thumb": { light: "#eef7ed", dark: "#7f9a86" },
			"--dsw-specific-sidebar-fill": { light: "#e2efe0", dark: "#1f2620" },
			"--dsw-specific-sidebar-nav-item-hover": { light: "#d8ead6", dark: "#29322a" },
			"--dsw-specific-sidebar-nav-item-active": { light: "#c8dec6", dark: "#303a31" },
			"--dsw-specific-sidebar-nav-item-active-accent": { light: "#dceada", dark: "#3a4738" },
			"--dsw-specific-menu": { light: "#eef7edf0", dark: "#232a24f0" },
			"--dsw-menu-surface-fill": { light: "#eef7ed94", dark: "#232a2494" },
			"--dsw-specific-bubble": { light: "#e7f2e5", dark: "#29322a" },
			"--dsw-specific-bubble-highlight": { light: "#d5e7d3", dark: "#3a4738" },
			"--dsw-specific-input-major": { light: "#eef7ed", dark: "#29322a" },
			"--dsw-specific-login-input": { light: "#f2f9f0", dark: "#1f2620" },
			"--dsw-specific-selector": { light: "#e7f2e5", dark: "#29322a" },
			"--dsw-specific-tip": { light: "#e7f2e5", dark: "#29322a" },
			"--dsw-linear-gradient-think": { light: "linear-gradient(180deg, #eef7ed 20.19%, #eef7ed00 100%)", dark: "linear-gradient(180deg, #1c211d 20.19%, #1c211d00 100%)" },
			"--dsw-linear-think-select": { light: "linear-gradient(180deg, #e7f2e5 20.19%, #e7f2e500 100%)", dark: "linear-gradient(180deg, #29322a 20.19%, #29322a00 100%)" },
			"--dsw-static-neutral-00": { light: "#eef7ed", dark: "#f7fcf6" },
			"--dsw-static-neutral-50": { light: "#eef7ed", dark: "#f2f9f0" },
			"--dsw-static-neutral-100": { light: "#eaf4e8", dark: "#eaf4e8" },
			"--dsw-static-neutral-200": { light: "#e2efe0", dark: "#e2efe0" },
			"--dsw-static-neutral-400": { light: "#a9bfa8", dark: "#a9bfa8" },
			"--dsw-static-neutral-700": { light: "#4a5a4f", dark: "#4a5a4f" },
			"--dsw-static-neutral-800": { light: "#3a4738", dark: "#3a4738" },
			"--dsw-static-neutral-850": { light: "#303a31", dark: "#303a31" },
			"--dsw-static-neutral-1000": { light: "#26332b", dark: "#26332b" },
			"--dsw-static-neutral-bluish-00": { light: "#eef7ed", dark: "#f7fcf6" },
			"--dsw-static-neutral-bluish-400": { light: "#9fb49e", dark: "#9fb49e" },
			"--dsw-static-neutral-bluish-1000": { light: "#26332b", dark: "#26332b" },
			"--dsw-static-blue-400": { light: "#6b9179", dark: "#6b9179" },
			"--dsw-static-blue-450": { light: "#59836a", dark: "#59836a" },
			"--dsw-static-blue-500": { light: "#4f765f", dark: "#4f765f" },
			"--dsw-static-blue-600": { light: "#3f6149", dark: "#3f6149" },
			"--shiki-token-constant": { light: "#1f6f8b", dark: "#7fb8d4" },
			"--shiki-token-string": { light: "#4a7a2c", dark: "#a8cc7e" },
			"--shiki-token-comment": { light: "#8a8371", dark: "#9a9380" },
			"--shiki-token-keyword": { light: "#a8452f", dark: "#e39a86" },
			"--shiki-token-parameter": { light: "#a15c1e", dark: "#e0a86a" },
			"--shiki-token-function": { light: "#6b4a8f", dark: "#c2a8e0" },
			"--shiki-token-string-expression": { light: "#3f6b28", dark: "#96bf72" },
			"--shiki-token-punctuation": { light: "#5c5745", dark: "#c2bba5" },
			"--shiki-token-link": { light: "#1d6383", dark: "#86c2dd" }
			}
		},
		{
			id: "warm-grey",
			displayName: "护眼灰",
			swatch: "#f2f0ec",
			tokens: {
			"--dsw-alias-bg-base": { light: "#f2f0ec", dark: "#211f1d" },
			"--dsw-alias-bg-layer-1": { light: "#f2f0ec", dark: "#282624" },
			"--dsw-alias-bg-layer-2": { light: "#f2f0ec", dark: "#2f2d2a" },
			"--dsw-alias-bg-layer-3": { light: "#f2f0ec", dark: "#37342f" },
			"--dsw-alias-bg-module-platform": { light: "#e9e6e0", dark: "#2f2d2a" },
			"--dsw-alias-bg-multi-select": { light: "#eae7e1", dark: "#37342f" },
			"--dsw-alias-bg-overlay": { light: "#ece9e4", dark: "#37342f" },
			"--dsw-alias-bg-document-preview": { light: "#e9e6e0", dark: "#211f1d" },
			"--dsw-alias-bg-skeleton": { light: "rgba(122,100,68, 0.08)", dark: "rgba(214,210,202, 0.08)" },
			"--dsw-alias-bg-mask-1": { light: "rgba(40,38,30, 0.28)", dark: "rgba(0, 0, 0, 0.5)" },
			"--dsw-alias-bg-mask-2": { light: "rgba(40,38,30, 0.14)", dark: "rgba(0, 0, 0, 0.2)" },
			"--dsw-alias-bg-mask-3": { light: "rgba(26,24,18, 0.48)", dark: "rgba(0, 0, 0, 0.48)" },
			"--dsw-alias-bg-mask-photo": { light: "rgba(26,24,18, 0.88)", dark: "rgba(0, 0, 0, 0.88)" },
			"--dsw-alias-bg-mask-drop": { light: "rgba(242, 240, 236, 0.72)", dark: "rgba(33,31,29, 0.72)" },
			"--dsw-alias-bg-document-selection": { light: "color-mix(in srgb, #7a6444 40%, transparent)", dark: "color-mix(in srgb, #7a6444 40%, transparent)" },
			"--dsw-alias-border-l1": { light: "rgba(122,100,68, 0.12)", dark: "rgba(214,210,202, 0.08)" },
			"--dsw-alias-border-l2": { light: "rgba(122,100,68, 0.20)", dark: "rgba(214,210,202, 0.14)" },
			"--dsw-alias-border-l2-darkmode-thin": { light: "rgba(122,100,68, 0.20)", dark: "rgba(214,210,202, 0.08)" },
			"--dsw-alias-border-l3": { light: "rgba(122,100,68, 0.26)", dark: "rgba(214,210,202, 0.18)" },
			"--dsw-alias-border-l4": { light: "rgba(122,100,68, 0.34)", dark: "rgba(214,210,202, 0.24)" },
			"--dsw-alias-border-inverted": { light: "rgba(0, 0, 0, 0)", dark: "rgba(214,210,202, 0.06)" },
			"--dsw-alias-border-inverted2": { light: "rgba(0, 0, 0, 0)", dark: "rgba(214,210,202, 0.08)" },
			"--dsw-alias-label-primary": { light: "#302e2a", dark: "#e9e6e0" },
			"--dsw-alias-label-primary-dimmed": { light: "#3c3a35", dark: "#c9c5bc" },
			"--dsw-alias-label-primary-foreground": { light: "#f2f0ec", dark: "#211f1d" },
			"--dsw-alias-label-primary-inverted": { light: "#f2f0ec", dark: "#c9c5bc" },
			"--dsw-alias-label-primary-bluish": { light: "#4a4740", dark: "#ded3bc" },
			"--dsw-alias-label-secondary": { light: "#55524b", dark: "#bdb9b0" },
			"--dsw-alias-label-tertiary": { light: "#605d55", dark: "#9c9890" },
			"--dsw-alias-label-caption": { light: "#7e7a72", dark: "#84807a" },
			"--dsw-alias-label-dimmed": { light: "#d9d5cc", dark: "#423f3a" },
			"--dsw-alias-label-document-preview": { light: "#585550", dark: "#bdb9b0" },
			"--dsw-alias-label-shimmer": { light: "color-mix(in srgb, #24221e 30%, transparent)", dark: "color-mix(in srgb, #f8f7f4 45%, transparent)" },
			"--dsw-alias-label-deep-diving": { light: "#7d5f16", dark: "#e0c07a" },
			"--dsw-alias-label-deep-diving-shimmer": { light: "#9c7a20", dark: "#f0d89a" },
			"--dsw-alias-link": { light: "#7a6444", dark: "#c9a97a" },
			"--dsw-alias-settings-card-fill": { light: "var(--dsw-alias-bg-layer-2)", dark: "var(--dsw-alias-bg-layer-2)" },
			"--dsw-alias-settings-card-stroke": { light: "var(--dsw-alias-border-l4)", dark: "var(--dsw-alias-border-l4)" },
			"--dsw-alias-brand-primary": { light: "#3a3833", dark: "#e9e6e0" },
			"--dsw-alias-brand-primary-invert": { light: "#3a3833", dark: "#e9e6e0" },
			"--dsw-alias-brand-primary-new-colorprimary-new-color": { light: "#7a6444", dark: "#c9a97a" },
			"--dsw-alias-brand-text": { light: "#302e2a", dark: "#e9e6e0" },
			"--dsw-alias-button-contrast-fill": { light: "#4a4741", dark: "#e9e6e0" },
			"--dsw-alias-button-elevated-fill": { light: "#f2f0ec", dark: "#37342f" },
			"--dsw-alias-button-floating-fill": { light: "#f2f0ec", dark: "#2f2d2a" },
			"--dsw-alias-button-floating-hover": { light: "#ece9e4", dark: "#37342f" },
			"--dsw-alias-button-ghost-active-border": { light: "#9a968c", dark: "#66625a" },
			"--dsw-alias-button-ghost-active-fill": { light: "#dcd8cf", dark: "#423f3a" },
			"--dsw-alias-button-ghost-active-hover": { light: "#d0ccc3", dark: "#55524b" },
			"--dsw-alias-button-info-fill": { light: "#7a6444", dark: "#c9a97a" },
			"--dsw-alias-button-info-hover": { light: "#6d5940", dark: "#cdae80" },
			"--dsw-alias-button-primary-dimmed": { light: "#dcd8cf", dark: "#423f3a" },
			"--dsw-alias-button-primary-fill": { light: "var(--dsw-alias-brand-primary)", dark: "var(--dsw-alias-brand-primary)" },
			"--dsw-alias-button-primary-hover": { light: "#55524b", dark: "#f8f7f4" },
			"--dsw-alias-button-tool-bar-fill": { light: "rgba(92,88,80, 0.5)", dark: "rgba(92,88,80, 0.5)" },
			"--dsw-alias-button-tool-bar-fill-invisible": { light: "rgba(42,40,36, 0.36)", dark: "rgba(42,40,36, 0.36)" },
			"--dsw-alias-button-tool-bar-hover": { light: "rgba(92,88,80, 0.6)", dark: "rgba(92,88,80, 0.6)" },
			"--dsw-alias-interactive-bg-hover": { light: "rgba(122,100,68, 0.07)", dark: "rgba(214,210,202, 0.08)" },
			"--dsw-alias-interactive-bg-active": { light: "rgba(122,100,68, 0.14)", dark: "rgba(214,210,202, 0.14)" },
			"--dsw-alias-interactive-bg-hover-accent": { light: "rgba(122,100,68, 0.16)", dark: "rgba(214,210,202, 0.20)" },
			"--dsw-alias-interactive-bg-hover-danger": { light: "rgba(176, 68, 58, 0.08)", dark: "rgba(214, 120, 110, 0.16)" },
			"--dsw-alias-interactive-bg-hover-solid": { light: "#eae7e1", dark: "#2f2d2a" },
			"--dsw-alias-markdown-code-block": { light: "#e9e6e0", dark: "#282624" },
			"--dsw-alias-markdown-code-block-banner": { light: "#dcd8cf", dark: "#2f2d2a" },
			"--dsw-alias-markdown-code-segment-selected": { light: "#f2f0ec", dark: "#37342f" },
			"--dsw-alias-markdown-code-segment-unselected": { light: "#eae7e1", dark: "#1e1c1a" },
			"--dsw-alias-markdown-inline-code": { light: "#e8e5df", dark: "#2f2d2a" },
			"--dsw-alias-markdown-citation": { light: "#e9e6e0", dark: "#2f2d2a" },
			"--dsw-alias-markdown-placeholder": { light: "#ebe8e2", dark: "#282624" },
			"--dsw-alias-markdown-tag": { light: "#dcd8cf", dark: "#37342f" },
			"--dsw-alias-scrollbar-bg-l1": { light: "#d9d5cc", dark: "#55524b" },
			"--dsw-alias-scrollbar-bg-l2": { light: "#d9d5cc", dark: "#423f3a" },
			"--dsw-alias-scrollbar-hover-l1": { light: "#c8c4ba", dark: "#66625a" },
			"--dsw-alias-scrollbar-hover-l2": { light: "#c8c4ba", dark: "#565249" },
			"--dsw-alias-state-business-primary": { light: "#7a6444", dark: "#c9a97a" },
			"--dsw-alias-state-business-tertiary": { light: "#e6e1d7", dark: "#423f3a" },
			"--dsw-alias-state-error-primary": { light: "#a83c34", dark: "#e08a80" },
			"--dsw-alias-state-error-secondary": { light: "#c9645a", dark: "#e08a80" },
			"--dsw-alias-state-idle-primary": { light: "#cec5a4", dark: "#5a5340" },
			"--dsw-alias-state-success-primary": { light: "#4f7a33", dark: "#8ec06a" },
			"--dsw-alias-state-success-secondary": { light: "#6b9c4f", dark: "#8ec06a" },
			"--dsw-alias-state-success-tertiary": { light: "#e3edd0", dark: "#333f28" },
			"--dsw-alias-state-warn-primary": { light: "#b07a10", dark: "#e0b260" },
			"--dsw-alias-state-warn-secondary": { light: "#d0a03c", dark: "#e0b260" },
			"--dsw-alias-state-warn-tertiary": { light: "#f6e8c4", dark: "#4a3c1e" },
			"--dsw-alias-state-warn-label": { light: "#8f6210", dark: "#e0b260" },
			"--dsw-alias-code-diff-added": { light: "rgba(79, 122, 51, 0.12)", dark: "rgba(142, 192, 106, 0.12)" },
			"--dsw-alias-code-diff-deleted": { light: "rgba(168, 60, 52, 0.10)", dark: "rgba(224, 138, 128, 0.12)" },
			"--dsw-alias-file-diff-added-bg": { light: "#e6efd6", dark: "#2a3521" },
			"--dsw-alias-file-diff-added-gutter": { light: "#edf4e0", dark: "#212a1a" },
			"--dsw-alias-file-diff-added-marker": { light: "#4f8f36", dark: "#8ec06a" },
			"--dsw-alias-file-diff-deleted-bg": { light: "#f6e2db", dark: "#3a241f" },
			"--dsw-alias-file-diff-deleted-gutter": { light: "#fbeae4", dark: "#2c1a16" },
			"--dsw-alias-file-diff-deleted-marker": { light: "#b0443a", dark: "#e08a80" },
			"--dsw-alias-menu-group-header-fill": { light: "#ece9e4f0", dark: "#2f2d2af0" },
			"--dsw-alias-menu-icon": { light: "#66625a", dark: "#c9c5bc" },
			"--dsw-alias-toast-bg": { light: "#4a4741", dark: "#37342f" },
			"--dsw-alias-toast-label": { light: "#f2f0ec", dark: "#f8f7f4" },
			"--dsw-alias-tooltip-bg": { light: "#3a3833", dark: "#37342f" },
			"--dsw-alias-tooltip-key-bg": { light: "color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)", dark: "color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)" },
			"--dsw-alias-turn-trigger-bg": { light: "var(--dsw-alias-markdown-code-block)", dark: "var(--dsw-alias-interactive-bg-hover)" },
			"--dsw-alias-turn-trigger-bg-hover": { light: "var(--dsw-alias-interactive-bg-hover)", dark: "var(--dsw-alias-interactive-bg-active)" },
			"--dsw-alias-onboarding-accent": { light: "#7a6444", dark: "#c9a97a" },
			"--dsw-alias-onboarding-card-fill": { light: "color-mix(in srgb, #f8f7f4 80%, transparent)", dark: "color-mix(in srgb, #2f2d2a 80%, transparent)" },
			"--dsw-alias-onboarding-secondary-fill": { light: "#f2f0ec", dark: "#423f3a" },
			"--dsw-alias-onboarding-checkbox-border": { light: "color-mix(in srgb, #302e2a 20%, transparent)", dark: "var(--dsw-alias-border-l2)" },
			"--dsw-alias-switch-thumb": { light: "#f2f0ec", dark: "#918d86" },
			"--dsw-specific-sidebar-fill": { light: "#e9e6e0", dark: "#1e1c1a" },
			"--dsw-specific-sidebar-nav-item-hover": { light: "#dedad2", dark: "#2f2d2a" },
			"--dsw-specific-sidebar-nav-item-active": { light: "#d0ccc3", dark: "#37342f" },
			"--dsw-specific-sidebar-nav-item-active-accent": { light: "#e6e1d7", dark: "#423f3a" },
			"--dsw-specific-menu": { light: "#f2f0ecf0", dark: "#282624f0" },
			"--dsw-menu-surface-fill": { light: "#f2f0ec94", dark: "#28262494" },
			"--dsw-specific-bubble": { light: "#eae7e1", dark: "#2f2d2a" },
			"--dsw-specific-bubble-highlight": { light: "#dcd8cf", dark: "#423f3a" },
			"--dsw-specific-input-major": { light: "#f2f0ec", dark: "#2f2d2a" },
			"--dsw-specific-login-input": { light: "#f4f2ee", dark: "#1e1c1a" },
			"--dsw-specific-selector": { light: "#eae7e1", dark: "#2f2d2a" },
			"--dsw-specific-tip": { light: "#eae7e1", dark: "#2f2d2a" },
			"--dsw-linear-gradient-think": { light: "linear-gradient(180deg, #f2f0ec 20.19%, #f2f0ec00 100%)", dark: "linear-gradient(180deg, #211f1d 20.19%, #211f1d00 100%)" },
			"--dsw-linear-think-select": { light: "linear-gradient(180deg, #eae7e1 20.19%, #eae7e100 100%)", dark: "linear-gradient(180deg, #2f2d2a 20.19%, #2f2d2a00 100%)" },
			"--dsw-static-neutral-00": { light: "#f2f0ec", dark: "#f8f7f4" },
			"--dsw-static-neutral-50": { light: "#f2f0ec", dark: "#f4f2ee" },
			"--dsw-static-neutral-100": { light: "#ece9e4", dark: "#ece9e4" },
			"--dsw-static-neutral-200": { light: "#e9e6e0", dark: "#e9e6e0" },
			"--dsw-static-neutral-400": { light: "#b0aca2", dark: "#b0aca2" },
			"--dsw-static-neutral-700": { light: "#55524b", dark: "#55524b" },
			"--dsw-static-neutral-800": { light: "#423f3a", dark: "#423f3a" },
			"--dsw-static-neutral-850": { light: "#37342f", dark: "#37342f" },
			"--dsw-static-neutral-1000": { light: "#302e2a", dark: "#302e2a" },
			"--dsw-static-neutral-bluish-00": { light: "#f2f0ec", dark: "#f8f7f4" },
			"--dsw-static-neutral-bluish-400": { light: "#a8a49a", dark: "#a8a49a" },
			"--dsw-static-neutral-bluish-1000": { light: "#302e2a", dark: "#302e2a" },
			"--dsw-static-blue-400": { light: "#91795a", dark: "#91795a" },
			"--dsw-static-blue-450": { light: "#85704e", dark: "#85704e" },
			"--dsw-static-blue-500": { light: "#7a6444", dark: "#7a6444" },
			"--dsw-static-blue-600": { light: "#6d5940", dark: "#6d5940" },
			"--shiki-token-constant": { light: "#1f6f8b", dark: "#7fb8d4" },
			"--shiki-token-string": { light: "#4a7a2c", dark: "#a8cc7e" },
			"--shiki-token-comment": { light: "#8a8371", dark: "#9a9380" },
			"--shiki-token-keyword": { light: "#a8452f", dark: "#e39a86" },
			"--shiki-token-parameter": { light: "#a15c1e", dark: "#e0a86a" },
			"--shiki-token-function": { light: "#6b4a8f", dark: "#c2a8e0" },
			"--shiki-token-string-expression": { light: "#3f6b28", dark: "#96bf72" },
			"--shiki-token-punctuation": { light: "#5c5745", dark: "#c2bba5" },
			"--shiki-token-link": { light: "#1d6383", dark: "#86c2dd" }
			}
		},
		{
			id: "warm-paper",
			displayName: "暖纸",
			swatch: "#f5f0e1",
			tokens: {
			"--dsw-alias-bg-base": { light: "#f5f0e1", dark: "#211f19" },
			"--dsw-alias-bg-layer-1": { light: "#f5f0e1", dark: "#2b281f" },
			"--dsw-alias-bg-layer-2": { light: "#f5f0e1", dark: "#322e26" },
			"--dsw-alias-bg-layer-3": { light: "#f5f0e1", dark: "#3b372c" },
			"--dsw-alias-bg-module-platform": { light: "#e8e5d9", dark: "#322e26" },
			"--dsw-alias-bg-multi-select": { light: "#ede8d6", dark: "#3b372c" },
			"--dsw-alias-bg-overlay": { light: "#f2eddc", dark: "#3b372c" },
			"--dsw-alias-bg-document-preview": { light: "#e8e5d9", dark: "#211f19" },
			"--dsw-alias-bg-skeleton": { light: "rgba(107, 95, 58, 0.08)", dark: "rgba(236, 229, 210, 0.08)" },
			"--dsw-alias-bg-mask-1": { light: "rgba(46, 40, 20, 0.28)", dark: "rgba(0, 0, 0, 0.5)" },
			"--dsw-alias-bg-mask-2": { light: "rgba(46, 40, 20, 0.14)", dark: "rgba(0, 0, 0, 0.2)" },
			"--dsw-alias-bg-mask-3": { light: "rgba(30, 26, 12, 0.48)", dark: "rgba(0, 0, 0, 0.48)" },
			"--dsw-alias-bg-mask-photo": { light: "rgba(30, 26, 12, 0.88)", dark: "rgba(0, 0, 0, 0.88)" },
			"--dsw-alias-bg-mask-drop": { light: "rgba(245, 240, 225, 0.72)", dark: "rgba(41, 38, 32, 0.72)" },
			"--dsw-alias-bg-document-selection": { light: "color-mix(in srgb, #b8912e 40%, transparent)", dark: "color-mix(in srgb, #b8912e 40%, transparent)" },
			"--dsw-alias-border-l1": { light: "rgba(107, 95, 58, 0.12)", dark: "rgba(236, 229, 210, 0.08)" },
			"--dsw-alias-border-l2": { light: "rgba(107, 95, 58, 0.20)", dark: "rgba(236, 229, 210, 0.14)" },
			"--dsw-alias-border-l2-darkmode-thin": { light: "rgba(107, 95, 58, 0.20)", dark: "rgba(236, 229, 210, 0.08)" },
			"--dsw-alias-border-l3": { light: "rgba(107, 95, 58, 0.26)", dark: "rgba(236, 229, 210, 0.18)" },
			"--dsw-alias-border-l4": { light: "rgba(107, 95, 58, 0.34)", dark: "rgba(236, 229, 210, 0.24)" },
			"--dsw-alias-border-inverted": { light: "rgba(0, 0, 0, 0)", dark: "rgba(236, 229, 210, 0.06)" },
			"--dsw-alias-border-inverted2": { light: "rgba(0, 0, 0, 0)", dark: "rgba(236, 229, 210, 0.08)" },
			"--dsw-alias-label-primary": { light: "#37342a", dark: "#ece5d2" },
			"--dsw-alias-label-primary-dimmed": { light: "#464332", dark: "#d8d1bc" },
			"--dsw-alias-label-primary-foreground": { light: "#f5f0e1", dark: "#211f19" },
			"--dsw-alias-label-primary-inverted": { light: "#f5f0e1", dark: "#d8d1bc" },
			"--dsw-alias-label-primary-bluish": { light: "#5f4a18", dark: "#e8d9a8" },
			"--dsw-alias-label-secondary": { light: "#5c5743", dark: "#c2bba5" },
			"--dsw-alias-label-tertiary": { light: "#6a6344", dark: "#a49d88" },
			"--dsw-alias-label-caption": { light: "#8b846a", dark: "#7d7767" },
			"--dsw-alias-label-dimmed": { light: "#ddd6bd", dark: "#464130" },
			"--dsw-alias-label-document-preview": { light: "#5f5a45", dark: "#c2bba5" },
			"--dsw-alias-label-shimmer": { light: "color-mix(in srgb, #2e2a1c 30%, transparent)", dark: "color-mix(in srgb, #fdfbf5 45%, transparent)" },
			"--dsw-alias-label-deep-diving": { light: "#7d5f16", dark: "#e0c07a" },
			"--dsw-alias-label-deep-diving-shimmer": { light: "#9c7a20", dark: "#f0d89a" },
			"--dsw-alias-link": { light: "#7d5f16", dark: "#d8b45c" },
			"--dsw-alias-settings-card-fill": { light: "var(--dsw-alias-bg-layer-2)", dark: "var(--dsw-alias-bg-layer-2)" },
			"--dsw-alias-settings-card-stroke": { light: "var(--dsw-alias-border-l4)", dark: "var(--dsw-alias-border-l4)" },
			"--dsw-alias-brand-primary": { light: "#3f3a2b", dark: "#ece5d2" },
			"--dsw-alias-brand-primary-invert": { light: "#3f3a2b", dark: "#ece5d2" },
			"--dsw-alias-brand-primary-new-colorprimary-new-color": { light: "#7d5f16", dark: "#d8b45c" },
			"--dsw-alias-brand-text": { light: "#37342a", dark: "#ece5d2" },
			"--dsw-alias-button-contrast-fill": { light: "#4a4636", dark: "#ece5d2" },
			"--dsw-alias-button-elevated-fill": { light: "#f5f0e1", dark: "#3b372c" },
			"--dsw-alias-button-floating-fill": { light: "#f5f0e1", dark: "#322e26" },
			"--dsw-alias-button-floating-hover": { light: "#f2eddc", dark: "#3b372c" },
			"--dsw-alias-button-ghost-active-border": { light: "#a8986a", dark: "#6b6450" },
			"--dsw-alias-button-ghost-active-fill": { light: "#e0d9b7", dark: "#464130" },
			"--dsw-alias-button-ghost-active-hover": { light: "#d3cba6", dark: "#524b38" },
			"--dsw-alias-button-info-fill": { light: "#7d5f16", dark: "#d8b45c" },
			"--dsw-alias-button-info-hover": { light: "#96731c", dark: "#e5c470" },
			"--dsw-alias-button-primary-dimmed": { light: "#e0d9b7", dark: "#464130" },
			"--dsw-alias-button-primary-fill": { light: "var(--dsw-alias-brand-primary)", dark: "var(--dsw-alias-brand-primary)" },
			"--dsw-alias-button-primary-hover": { light: "#524b38", dark: "#fdfbf5" },
			"--dsw-alias-button-tool-bar-fill": { light: "rgba(90, 84, 66, 0.5)", dark: "rgba(90, 84, 66, 0.5)" },
			"--dsw-alias-button-tool-bar-fill-invisible": { light: "rgba(46, 42, 30, 0.36)", dark: "rgba(46, 42, 30, 0.36)" },
			"--dsw-alias-button-tool-bar-hover": { light: "rgba(90, 84, 66, 0.6)", dark: "rgba(90, 84, 66, 0.6)" },
			"--dsw-alias-interactive-bg-hover": { light: "rgba(107, 95, 58, 0.07)", dark: "rgba(236, 229, 210, 0.08)" },
			"--dsw-alias-interactive-bg-active": { light: "rgba(107, 95, 58, 0.14)", dark: "rgba(236, 229, 210, 0.14)" },
			"--dsw-alias-interactive-bg-hover-accent": { light: "rgba(107, 95, 58, 0.16)", dark: "rgba(236, 229, 210, 0.20)" },
			"--dsw-alias-interactive-bg-hover-danger": { light: "rgba(176, 68, 58, 0.08)", dark: "rgba(214, 120, 110, 0.16)" },
			"--dsw-alias-interactive-bg-hover-solid": { light: "#ede8d6", dark: "#322e26" },
			"--dsw-alias-markdown-code-block": { light: "#e8e5d9", dark: "#2b281f" },
			"--dsw-alias-markdown-code-block-banner": { light: "#e0d9b7", dark: "#322e26" },
			"--dsw-alias-markdown-code-segment-selected": { light: "#f5f0e1", dark: "#3b372c" },
			"--dsw-alias-markdown-code-segment-unselected": { light: "#ede8d6", dark: "#262319" },
			"--dsw-alias-markdown-inline-code": { light: "#eae4cd", dark: "#322e26" },
			"--dsw-alias-markdown-citation": { light: "#e8e5d9", dark: "#322e26" },
			"--dsw-alias-markdown-placeholder": { light: "#efe9d6", dark: "#2b281f" },
			"--dsw-alias-markdown-tag": { light: "#e0d9b7", dark: "#3b372c" },
			"--dsw-alias-scrollbar-bg-l1": { light: "#ddd6bd", dark: "#524b38" },
			"--dsw-alias-scrollbar-bg-l2": { light: "#ddd6bd", dark: "#464130" },
			"--dsw-alias-scrollbar-hover-l1": { light: "#cec5a4", dark: "#6b6450" },
			"--dsw-alias-scrollbar-hover-l2": { light: "#cec5a4", dark: "#5a5340" },
			"--dsw-alias-state-business-primary": { light: "#7d5f16", dark: "#d8b45c" },
			"--dsw-alias-state-business-tertiary": { light: "#efe6c8", dark: "#464130" },
			"--dsw-alias-state-error-primary": { light: "#a83c34", dark: "#e08a80" },
			"--dsw-alias-state-error-secondary": { light: "#c9645a", dark: "#e08a80" },
			"--dsw-alias-state-idle-primary": { light: "#cec5a4", dark: "#5a5340" },
			"--dsw-alias-state-success-primary": { light: "#4f7a33", dark: "#8ec06a" },
			"--dsw-alias-state-success-secondary": { light: "#6b9c4f", dark: "#8ec06a" },
			"--dsw-alias-state-success-tertiary": { light: "#e3edd0", dark: "#333f28" },
			"--dsw-alias-state-warn-primary": { light: "#b07a10", dark: "#e0b260" },
			"--dsw-alias-state-warn-secondary": { light: "#d0a03c", dark: "#e0b260" },
			"--dsw-alias-state-warn-tertiary": { light: "#f6e8c4", dark: "#4a3c1e" },
			"--dsw-alias-state-warn-label": { light: "#8f6210", dark: "#e0b260" },
			"--dsw-alias-code-diff-added": { light: "rgba(79, 122, 51, 0.12)", dark: "rgba(142, 192, 106, 0.12)" },
			"--dsw-alias-code-diff-deleted": { light: "rgba(168, 60, 52, 0.10)", dark: "rgba(224, 138, 128, 0.12)" },
			"--dsw-alias-file-diff-added-bg": { light: "#e6efd6", dark: "#2a3521" },
			"--dsw-alias-file-diff-added-gutter": { light: "#edf4e0", dark: "#212a1a" },
			"--dsw-alias-file-diff-added-marker": { light: "#4f8f36", dark: "#8ec06a" },
			"--dsw-alias-file-diff-deleted-bg": { light: "#f6e2db", dark: "#3a241f" },
			"--dsw-alias-file-diff-deleted-gutter": { light: "#fbeae4", dark: "#2c1a16" },
			"--dsw-alias-file-diff-deleted-marker": { light: "#b0443a", dark: "#e08a80" },
			"--dsw-alias-menu-group-header-fill": { light: "#f2eddcf0", dark: "#322e26f0" },
			"--dsw-alias-menu-icon": { light: "#6b6450", dark: "#d8d1bc" },
			"--dsw-alias-toast-bg": { light: "#4a4636", dark: "#3b372c" },
			"--dsw-alias-toast-label": { light: "#f5f0e1", dark: "#fdfbf5" },
			"--dsw-alias-tooltip-bg": { light: "#3f3a2b", dark: "#3b372c" },
			"--dsw-alias-tooltip-key-bg": { light: "color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)", dark: "color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)" },
			"--dsw-alias-turn-trigger-bg": { light: "var(--dsw-alias-markdown-code-block)", dark: "var(--dsw-alias-interactive-bg-hover)" },
			"--dsw-alias-turn-trigger-bg-hover": { light: "var(--dsw-alias-interactive-bg-hover)", dark: "var(--dsw-alias-interactive-bg-active)" },
			"--dsw-alias-onboarding-accent": { light: "#7d5f16", dark: "#d8b45c" },
			"--dsw-alias-onboarding-card-fill": { light: "color-mix(in srgb, #fdfbf5 80%, transparent)", dark: "color-mix(in srgb, #322e26 80%, transparent)" },
			"--dsw-alias-onboarding-secondary-fill": { light: "#f5f0e1", dark: "#464130" },
			"--dsw-alias-onboarding-checkbox-border": { light: "color-mix(in srgb, #37342a 20%, transparent)", dark: "var(--dsw-alias-border-l2)" },
			"--dsw-alias-switch-thumb": { light: "#f5f0e1", dark: "#948d72" },
			"--dsw-specific-sidebar-fill": { light: "#e8e5d9", dark: "#262319" },
			"--dsw-specific-sidebar-nav-item-hover": { light: "#ded7bd", dark: "#322e26" },
			"--dsw-specific-sidebar-nav-item-active": { light: "#d3cba6", dark: "#3b372c" },
			"--dsw-specific-sidebar-nav-item-active-accent": { light: "#efe6c8", dark: "#464130" },
			"--dsw-specific-menu": { light: "#f5f0e1f0", dark: "#2b281ff0" },
			"--dsw-menu-surface-fill": { light: "#f5f0e194", dark: "#2b281f94" },
			"--dsw-specific-bubble": { light: "#ede8d6", dark: "#322e26" },
			"--dsw-specific-bubble-highlight": { light: "#e0d9b7", dark: "#464130" },
			"--dsw-specific-input-major": { light: "#f5f0e1", dark: "#322e26" },
			"--dsw-specific-login-input": { light: "#f9f5e9", dark: "#262319" },
			"--dsw-specific-selector": { light: "#ede8d6", dark: "#322e26" },
			"--dsw-specific-tip": { light: "#ede8d6", dark: "#322e26" },
			"--dsw-linear-gradient-think": { light: "linear-gradient(180deg, #f5f0e1 20.19%, #f5f0e100 100%)", dark: "linear-gradient(180deg, #211f19 20.19%, #211f1900 100%)" },
			"--dsw-linear-think-select": { light: "linear-gradient(180deg, #ede8d6 20.19%, #ede8d600 100%)", dark: "linear-gradient(180deg, #322e26 20.19%, #322e2600 100%)" },
			"--dsw-static-neutral-00": { light: "#f5f0e1", dark: "#fdfbf5" },
			"--dsw-static-neutral-50": { light: "#f5f0e1", dark: "#f9f5e9" },
			"--dsw-static-neutral-100": { light: "#f2eddc", dark: "#f2eddc" },
			"--dsw-static-neutral-200": { light: "#e8e5d9", dark: "#e8e5d9" },
			"--dsw-static-neutral-400": { light: "#b3ab90", dark: "#b3ab90" },
			"--dsw-static-neutral-700": { light: "#5c5743", dark: "#5c5743" },
			"--dsw-static-neutral-800": { light: "#464130", dark: "#464130" },
			"--dsw-static-neutral-850": { light: "#3b372c", dark: "#3b372c" },
			"--dsw-static-neutral-1000": { light: "#37342a", dark: "#37342a" },
			"--dsw-static-neutral-bluish-00": { light: "#f5f0e1", dark: "#fdfbf5" },
			"--dsw-static-neutral-bluish-400": { light: "#a89f84", dark: "#a89f84" },
			"--dsw-static-neutral-bluish-1000": { light: "#37342a", dark: "#37342a" },
			"--dsw-static-blue-400": { light: "#d0a03c", dark: "#d0a03c" },
			"--dsw-static-blue-450": { light: "#c8962c", dark: "#c8962c" },
			"--dsw-static-blue-500": { light: "#b8912e", dark: "#b8912e" },
			"--dsw-static-blue-600": { light: "#96731c", dark: "#96731c" },
			"--shiki-token-constant": { light: "#1f6f8b", dark: "#7fb8d4" },
			"--shiki-token-string": { light: "#4a7a2c", dark: "#a8cc7e" },
			"--shiki-token-comment": { light: "#8a8371", dark: "#9a9380" },
			"--shiki-token-keyword": { light: "#a8452f", dark: "#e39a86" },
			"--shiki-token-parameter": { light: "#a15c1e", dark: "#e0a86a" },
			"--shiki-token-function": { light: "#6b4a8f", dark: "#c2a8e0" },
			"--shiki-token-string-expression": { light: "#3f6b28", dark: "#96bf72" },
			"--shiki-token-punctuation": { light: "#5c5745", dark: "#c2bba5" },
			"--shiki-token-link": { light: "#1d6383", dark: "#86c2dd" }
			}
		}
		];

		// ---------------------------------------------------------------- state
		var themeService = null;
		var disposeLayer = null;
		var selection = DEFAULT_THEME;
		var listeners = new Set();

		function themeById(id) {
			for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
			return undefined;
		}

		/** Read the persisted choice, falling back to the default palette. */
		function readStored() {
			try {
				var raw = window.localStorage.getItem(STORAGE_KEY);
				if (raw === OFF_ID) return OFF_ID;
				return themeById(raw) ? raw : DEFAULT_THEME;
			} catch (error) {
				return DEFAULT_THEME;
			}
		}

		function writeStored(id) {
			try {
				window.localStorage.setItem(STORAGE_KEY, id);
			} catch (error) {
				console.warn(SOURCE + ": could not persist the palette choice", error);
			}
		}

		function notify(id) {
			listeners.forEach((listener) => listener(id));
		}

		function subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}

		// ---------------------------------------------------------------- layer
		/**
		* Replace the override layer with the one for \`id\`, or remove it entirely
		* for the "DSH default" choice. overrideTokens returns a disposer, so a swap
		* is dispose-then-stack and never leaves two layers behind.
		*/
		function selectPalette(id) {
			selection = id;
			if (disposeLayer !== null) {
				disposeLayer();
				disposeLayer = null;
			}
			var theme = themeById(id);
			if (theme === undefined || themeService === null) return;
			disposeLayer = themeService.overrideTokens(SOURCE, theme.tokens);
		}

		function choose(id) {
			writeStored(id);
			selectPalette(id);
			notify(id);
		}

		// ---------------------------------------------------------------- row UI
		// Styling mirrors the built-in Appearance row's cubes rule-for-rule (same
		// declarations, re-prefixed class names) so the General column reads as one
		// control family. Injected as a stylesheet rather than inline styles because
		// the :hover state and the .5px hairline are not expressible inline.
		var STYLE_ID = SOURCE + ":row-css";
		var ROW_CSS = ".dshEyeCare_group{border-bottom:.5px solid var(--dsw-alias-border-l2);flex-direction:column;gap:8px;padding:16px 0;display:flex}.dshEyeCare_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.dshEyeCare_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}.dshEyeCare_cubeRow{flex-wrap:wrap;align-items:stretch;gap:8px;display:flex}.dshEyeCare_cube{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-xl);font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;flex-direction:column;flex:1 1 0;min-width:88px;justify-content:center;align-items:center;gap:4px;padding:20px 12px;font-size:14px;line-height:22px;display:flex}.dshEyeCare_cube:hover:not(.dshEyeCare_selected){background:var(--dsw-alias-interactive-bg-hover)}.dshEyeCare_selected{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-static-neutral-bluish-400)}.dshEyeCare_swatch{box-sizing:border-box;flex:none;width:20px;height:20px;border-radius:4px;border:1px solid var(--dsw-alias-border-l3)}.dshEyeCare_swatchNone{background:0 0;border-style:dashed;border-color:var(--dsw-alias-border-l4)}";

		/** Inject our row stylesheet once; returns whether THIS call created it. */
		function installRowCss() {
			if (document.getElementById(STYLE_ID) !== null) return false;
			var style = document.createElement("style");
			style.id = STYLE_ID;
			style.textContent = ROW_CSS;
			document.head.appendChild(style);
			return true;
		}

		function removeRowCss() {
			var style = document.getElementById(STYLE_ID);
			if (style !== null && style !== undefined) style.remove();
		}

		var OPTIONS = THEMES.map((theme) => ({ id: theme.id, label: theme.displayName, swatch: theme.swatch }));
		OPTIONS.push({ id: OFF_ID, label: "DSH 默认", swatch: null });

		/** Palette row: owns its selection, so it needs no store seat or injected action. */
		function PaletteRow() {
			var state = react.useState(readStored);
			var selected = state[0];
			var setSelected = state[1];
			react.useEffect(() => subscribe(setSelected), []);
			return react.createElement(
				"div",
				{ className: "dshEyeCare_group" },
				react.createElement("div", { className: "dshEyeCare_title" }, "护眼配色"),
				react.createElement("div", { className: "dshEyeCare_desc" }, "选择立即生效并被记住"),
				react.createElement(
					"div",
					{ className: "dshEyeCare_cubeRow" },
					OPTIONS.map((option) =>
						react.createElement(
							"button",
							{
								key: option.id,
								type: "button",
								"aria-pressed": selected === option.id ? "true" : "false",
								onClick: () => choose(option.id),
								className: selected === option.id ? "dshEyeCare_cube dshEyeCare_selected" : "dshEyeCare_cube"
							},
							react.createElement("span", {
								className: option.swatch === null ? "dshEyeCare_swatch dshEyeCare_swatchNone" : "dshEyeCare_swatch",
								style: option.swatch === null ? undefined : { background: option.swatch }
							}),
							react.createElement("span", null, option.label)
						)
					)
				)
			);
		}

		// ---------------------------------------------------------------- plugin
		/** Required services: the theme registry to stack layers on, and the settings row slot. */
		var inject = ["theme", "slots"];

		/**
		* Apply the persisted palette and contribute the switcher row.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			themeService = ctx.get("theme");
			var ownsRowCss = installRowCss();
			ctx.effect(() => {
				selectPalette(readStored());
				// Another window may switch the palette; localStorage is per origin.
				var onStorage = (event) => {
					if (event.key !== null && event.key !== STORAGE_KEY) return;
					selectPalette(readStored());
					notify(selection);
				};
				window.addEventListener("storage", onStorage);
				return () => {
					window.removeEventListener("storage", onStorage);
					if (ownsRowCss) removeRowCss();
					if (disposeLayer !== null) {
						disposeLayer();
						disposeLayer = null;
					}
					themeService = null;
				};
			}, SOURCE + ": palette layer");
			ctx.slots.inject("settings.general.item", () =>
				ctx.slots.register(
					{ name: "settings.general.item", id: "eye-care-palette", order: 12 },
					PaletteRow
				)
			);
		}

		exports.THEMES = THEMES;
		exports.STORAGE_KEY = STORAGE_KEY;
		exports.OFF_ID = OFF_ID;
		exports.DEFAULT_THEME = DEFAULT_THEME;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
