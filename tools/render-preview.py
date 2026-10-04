#!/usr/bin/env python3
"""Render a visual preview of every theme in themes/*.json.

Not part of the plugin runtime: this is a review aid so a palette can be judged
by eye (surface relationships, syntax colours on the code fill, accent contrast)
without restarting DSH. Requires Pillow.

    python tools/render-preview.py preview.png
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
THEMES = sorted((ROOT / "themes").glob("*.json"))


def value_of(pair, mode):
    """A token value is either a CSS string (same in both schemes) or {light, dark}."""
    if isinstance(pair, str):
        return pair
    return pair[mode]


# Row copy that is not palette data; mirrors MESSAGES in src/runtime/client.cjs.
NATIVE = {"zh": "原生", "en": "Native"}
MODE_LABEL = {"zh": ("浅色", "深色"), "en": ("light", "dark")}
# Mock DSH chrome drawn inside the panel, so a whole preview reads one language.
UI = {
    "zh": {
        "sidebar": "侧边栏", "rest": "常规项", "hover": "悬停", "active": "选中",
        "primary": "主要文字", "secondary": "次要文字", "tertiary": "三级文字",
        "caption": "最弱一级提示", "code": "代码块",
    },
    "en": {
        "sidebar": "Sidebar", "rest": "Item", "hover": "Hover", "active": "Active",
        "primary": "Primary", "secondary": "Secondary", "tertiary": "Tertiary",
        "caption": "Caption", "code": "Code",
    },
}


def theme_label(theme, lang):
    """A displayName is either a plain string or a { locale: label } map."""
    name = theme["displayName"]
    if isinstance(name, str):
        return name
    return name.get(lang) or name.get("en") or next(iter(name.values()))


def load_font(size, bold=False):
    """Load a UI face at the given device-pixel size, falling back to whatever Pillow ships."""
    for candidate in (
        r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc",
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ):
        if Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size)
            except OSError:
                pass
    return ImageFont.load_default()


# Everything below is written in logical pixels at 1x and rendered at 2x. A README
# image is displayed at 620 CSS px at most, and on a HiDPI screen (125%/150% scaling)
# the browser maps that onto 900+ device pixels: a 1x bitmap gets *upscaled* and looks
# soft. Rendering at 2x means the viewer only ever downscales, which stays crisp.
SCALE = 2


class ScaledDraw:
    """ImageDraw proxy: callers pass logical coordinates, the proxy multiplies them.

    Keeps the layout code readable (620x252, 12px text) while the bitmap is 2x.
    """

    __slots__ = ("_draw", "_scale")

    def __init__(self, draw, scale):
        self._draw = draw
        self._scale = scale

    def _point(self, xy):
        if isinstance(xy[0], (list, tuple)):
            return [(x * self._scale, y * self._scale) for x, y in xy]
        return [value * self._scale for value in xy]

    def text(self, xy, *args, **kwargs):
        self._draw.text(self._point(xy), *args, **kwargs)

    def rectangle(self, xy, *args, **kwargs):
        self._draw.rectangle(self._point(xy), *args, **kwargs)

    def rounded_rectangle(self, xy, *args, **kwargs):
        if "radius" in kwargs:
            kwargs["radius"] = round(kwargs["radius"] * self._scale)
        self._draw.rounded_rectangle(self._point(xy), *args, **kwargs)

    def line(self, xy, *args, **kwargs):
        if "width" in kwargs:
            kwargs["width"] = max(1, round(kwargs["width"] * self._scale))
        self._draw.line(self._point(xy), *args, **kwargs)

    def textlength(self, text, *args, **kwargs):
        """Logical width, so callers can keep laying out in 1x units."""
        return self._draw.textlength(text, *args, **kwargs) / self._scale


F_SMALL = load_font(12 * SCALE)
F_MONO = load_font(12 * SCALE)
F_LABEL = load_font(11 * SCALE)


def hexa(value):
    """Reduce a CSS colour to an RGB tuple, or None when it is not a plain literal."""
    if not value:
        return None
    v = value.strip()
    if v.startswith("#") and len(v) in (7, 9):
        return tuple(int(v[i : i + 2], 16) for i in (1, 3, 5))
    if v.startswith("rgba(") or v.startswith("rgb("):
        parts = v[v.index("(") + 1 : v.index(")")].split(",")
        try:
            return tuple(int(float(p)) for p in parts[:3])
        except ValueError:
            return None
    return None


def blend(fg, alpha, bg):
    """Composite an opaque RGB colour over `bg` at the given alpha."""
    return tuple(round(fg[i] * alpha + bg[i] * (1 - alpha)) for i in range(3))


def over(value, bg):
    """Composite a CSS colour onto a background, honouring its alpha.

    Most of this palette's borders and fills are translucent (rgba(...) or
    8-digit hex). Drawing them opaque would overstate the only elevation cue the
    theme has, so the preview composites them exactly like the browser does.
    """
    if not value:
        return bg
    v = value.strip()
    rgba = re.match(r"^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$", v)
    if rgba:
        fg = tuple(int(rgba.group(i)) for i in (1, 2, 3))
        return blend(fg, float(rgba.group(4)), bg)
    short = re.match(r"^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})$", v)
    if short:
        fg = tuple(int(short.group(1)[i : i + 2], 16) for i in (0, 2, 4))
        return blend(fg, int(short.group(2), 16) / 255, bg)
    return hexa(v)


PAD = 16
PANEL_W, PANEL_H = 620, 252


def render_panel(theme, mode, catalogue, lang):
    """Draw the settings-screen panel for one theme in one color scheme.

    `catalogue` is every theme file, so the cube row shows the real switcher rather
    than only the theme being previewed.
    """
    t = {k: value_of(v, mode) for k, v in theme["tokens"].items()}
    ui = UI.get(lang, UI["en"])
    bg = hexa(t["--dsw-alias-bg-base"])
    panel = Image.new("RGB", (PANEL_W * SCALE, PANEL_H * SCALE), bg)
    d = ScaledDraw(ImageDraw.Draw(panel), SCALE)

    sidebar_w, top_h = 132, 26
    sidebar = hexa(t["--dsw-specific-sidebar-fill"])
    d.rectangle([0, 0, sidebar_w, PANEL_H], fill=sidebar)
    d.rectangle([sidebar_w, 0, PANEL_W, top_h], fill=hexa(t["--dsw-alias-bg-layer-1"]))
    d.line([sidebar_w, 0, sidebar_w, PANEL_H], fill=over(t["--dsw-alias-border-l3"], bg))

    ink = hexa(t["--dsw-alias-label-primary"])
    sec = hexa(t["--dsw-alias-label-secondary"])
    ter = hexa(t["--dsw-alias-label-tertiary"])
    cap = hexa(t["--dsw-alias-label-caption"])

    d.text((sidebar_w + 10, 6), theme_label(theme, lang), font=F_SMALL, fill=ink)
    d.text((10, 8), ui["sidebar"], font=F_LABEL, fill=ter)

    # sidebar nav rows: one resting, one hovered, one active
    y = 36
    for label, key in ((ui["rest"], None), (ui["hover"], "--dsw-specific-sidebar-nav-item-hover"), (ui["active"], "--dsw-specific-sidebar-nav-item-active")):
        if key:
            d.rectangle([8, y - 2, sidebar_w - 8, y + 16], fill=over(t[key], sidebar))
        d.text((14, y), label, font=F_LABEL, fill=sec if key else ter)
        y += 24

    x0 = sidebar_w + 14
    d.text((x0, 36), ui["primary"], font=F_SMALL, fill=ink)
    d.text((x0, 56), ui["secondary"], font=F_SMALL, fill=sec)
    d.text((x0, 74), ui["tertiary"], font=F_SMALL, fill=ter)
    d.text((x0, 92), ui["caption"], font=F_LABEL, fill=cap)

    # Palette cube row: same geometry as the built-in Appearance row, so the
    # preview reflects the settings control the plugin actually contributes.
    cube_y, cube_w, cube_h, gap = 112, 104, 56, 8
    cubes = [(one["id"], hexa(one["source"][0]), theme_label(one, lang)) for one in catalogue]
    cubes.append(("dsh-default", None, NATIVE.get(lang, NATIVE["en"])))
    for i, (cube_id, swatch, label) in enumerate(cubes):
        cx = x0 + i * (cube_w + gap)
        selected = cube_id == theme["id"]
        d.rounded_rectangle(
            [cx, cube_y, cx + cube_w, cube_y + cube_h],
            radius=12,
            fill=over(t["--dsw-alias-bg-module-platform"], bg) if selected else None,
            outline=over(t["--dsw-static-neutral-bluish-400"], bg) if selected else over(t["--dsw-alias-border-l4"], bg),
        )
        sx = cx + cube_w // 2 - 10
        if swatch is None:
            d.rectangle([sx, cube_y + 10, sx + 20, cube_y + 30], outline=over(t["--dsw-alias-border-l4"], bg))
        else:
            d.rectangle([sx, cube_y + 10, sx + 20, cube_y + 30], fill=swatch, outline=over(t["--dsw-alias-border-l3"], bg))
        tw = d.textlength(label, font=F_LABEL)
        d.text((cx + (cube_w - tw) / 2, cube_y + 36), label, font=F_LABEL, fill=ink)

    # code block with syntax colours
    code_bg = hexa(t["--dsw-alias-markdown-code-block"])
    banner = hexa(t["--dsw-alias-markdown-code-block-banner"])
    cb_y = 180
    d.rounded_rectangle([x0, cb_y, PANEL_W - PAD, cb_y + 66], radius=6, fill=code_bg, outline=over(t["--dsw-alias-border-l2"], code_bg))
    d.rectangle([x0, cb_y, PANEL_W - PAD, cb_y + 16], fill=banner)
    d.text((x0 + 8, cb_y + 2), ui["code"], font=F_LABEL, fill=ter)
    code_lines = [
        [("const", "--shiki-token-keyword"), (" total", "--dsw-alias-label-primary"), (" = ", "--shiki-token-punctuation"), ("42", "--shiki-token-constant"), (";", "--shiki-token-punctuation")],
        [("function", "--shiki-token-keyword"), (" render", "--shiki-token-function"), ("() {", "--shiki-token-punctuation")],
        [('  return "paper"', "--shiki-token-string"), (";  // comment", "--shiki-token-comment")],
    ]
    cy = cb_y + 21
    for line in code_lines:
        cx = x0 + 8
        for text, key in line:
            colour = hexa(t.get(key)) or ink
            d.text((cx, cy), text, font=F_MONO, fill=colour)
            cx += d.textlength(text, font=F_MONO)
        cy += 15

    return panel


def render_theme(theme, catalogue, lang):
    """Return the light and dark panels for `theme`, each under a caption strip."""
    rows = []
    for mode in ("light", "dark"):
        panel = render_panel(theme, mode, catalogue, lang)
        base = value_of(theme["tokens"]["--dsw-alias-bg-base"], mode)
        caption = value_of(theme["tokens"]["--dsw-alias-label-tertiary"], mode)
        header = Image.new("RGB", (PANEL_W * SCALE, 20 * SCALE), hexa(base))
        hd = ScaledDraw(ImageDraw.Draw(header), SCALE)
        scheme = MODE_LABEL.get(lang, MODE_LABEL["en"])[0 if mode == "light" else 1]
        hd.text((PAD, 3), f"{theme_label(theme, lang)}  ·  {scheme}", font=F_LABEL, fill=hexa(caption))
        rows.append(header)
        rows.append(panel)
    return rows


def main():
    """Render every theme in themes/*.json into one stacked PNG.

    usage: python tools/render-preview.py [output.png] [--lang zh|en]
    """
    argv = sys.argv[1:]
    lang = "zh"
    if "--lang" in argv:
        index = argv.index("--lang")
        lang = argv[index + 1] if index + 1 < len(argv) else "zh"
        del argv[index : index + 2]
    out = Path(argv[0] if argv else "preview.png")
    catalogue = [json.loads(p.read_text(encoding="utf-8")) for p in THEMES]
    blocks = []
    for theme in catalogue:
        blocks.extend(render_theme(theme, catalogue, lang))
        blocks.append(Image.new("RGB", (PANEL_W * SCALE, 10 * SCALE), (255, 255, 255)))

    height = sum(b.height for b in blocks)
    canvas = Image.new("RGB", (PANEL_W * SCALE, height), (255, 255, 255))
    y = 0
    for b in blocks:
        canvas.paste(b, (0, y))
        y += b.height
    canvas.save(out, optimize=True)
    print(f"wrote {out}  ({canvas.width}x{canvas.height}, {SCALE}x)  lang={lang}  themes={[p.stem for p in THEMES]}")


if __name__ == "__main__":
    main()
