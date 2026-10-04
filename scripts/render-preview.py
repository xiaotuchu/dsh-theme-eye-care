#!/usr/bin/env python3
"""Render a visual preview of every theme in themes/*.json.

Not part of the plugin runtime: this is a review aid so a palette can be judged
by eye (surface relationships, syntax colours on the code fill, accent contrast)
without restarting DSH. Requires Pillow.

    python scripts/render-preview.py preview.png
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
THEMES = sorted((ROOT / "themes").glob("*.json"))

# Fonts: prefer a UI face, fall back to whatever Pillow ships.
def load_font(size, bold=False):
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


F_TITLE = load_font(17, bold=True)
F_SMALL = load_font(12)
F_MONO = load_font(12)
F_LABEL = load_font(11)


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


def render_panel(theme, mode, catalogue):
    t = {k: v[mode] for k, v in theme["tokens"].items()}
    bg = hexa(t["--dsw-alias-bg-base"])
    panel = Image.new("RGB", (PANEL_W, PANEL_H), bg)
    d = ImageDraw.Draw(panel)

    sidebar_w, top_h = 132, 26
    sidebar = hexa(t["--dsw-specific-sidebar-fill"])
    d.rectangle([0, 0, sidebar_w, PANEL_H], fill=sidebar)
    d.rectangle([sidebar_w, 0, PANEL_W, top_h], fill=hexa(t["--dsw-alias-bg-layer-1"]))
    d.line([sidebar_w, 0, sidebar_w, PANEL_H], fill=over(t["--dsw-alias-border-l3"], bg))

    ink = hexa(t["--dsw-alias-label-primary"])
    sec = hexa(t["--dsw-alias-label-secondary"])
    ter = hexa(t["--dsw-alias-label-tertiary"])
    cap = hexa(t["--dsw-alias-label-caption"])

    d.text((sidebar_w + 10, 6), theme["displayName"], font=F_SMALL, fill=ink)
    d.text((10, 8), "侧边栏", font=F_LABEL, fill=ter)

    # sidebar nav rows: one resting, one hovered, one active
    y = 36
    for label, key in (("常规项", None), ("悬停", "--dsw-specific-sidebar-nav-item-hover"), ("选中", "--dsw-specific-sidebar-nav-item-active")):
        if key:
            d.rectangle([8, y - 2, sidebar_w - 8, y + 16], fill=over(t[key], sidebar))
        d.text((14, y), label, font=F_LABEL, fill=sec if key else ter)
        y += 24

    x0 = sidebar_w + 14
    d.text((x0, 36), "主要文字", font=F_SMALL, fill=ink)
    d.text((x0, 56), "次要文字", font=F_SMALL, fill=sec)
    d.text((x0, 74), "三级文字", font=F_SMALL, fill=ter)
    d.text((x0, 92), "最弱一级提示", font=F_LABEL, fill=cap)

    # Palette cube row: same geometry as the built-in Appearance row, so the
    # preview reflects the settings control the plugin actually contributes.
    cube_y, cube_w, cube_h, gap = 112, 104, 56, 8
    cubes = [(one["id"], hexa(one["source"][0]), one["displayName"]) for one in catalogue]
    cubes.append(("dsh-default", None, "DSH 默认"))
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
    d.text((x0 + 8, cb_y + 2), "代码块", font=F_LABEL, fill=ter)
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


def render_theme(theme, catalogue):
    rows = []
    for mode in ("light", "dark"):
        panel = render_panel(theme, mode, catalogue)
        header = Image.new("RGB", (PANEL_W, 20), hexa(theme["tokens"]["--dsw-alias-bg-base"][mode]))
        hd = ImageDraw.Draw(header)
        hd.text((PAD, 3), f"{theme['displayName']}  ·  {'浅色' if mode == 'light' else '深色'}", font=F_LABEL, fill=hexa(theme["tokens"]["--dsw-alias-label-tertiary"][mode]))
        rows.append(header)
        rows.append(panel)
    return rows


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "preview.png")
    catalogue = [json.loads(p.read_text(encoding="utf-8")) for p in THEMES]
    blocks = []
    for theme in catalogue:
        blocks.extend(render_theme(theme, catalogue))
        blocks.append(Image.new("RGB", (PANEL_W, 10), (255, 255, 255)))

    height = sum(b.height for b in blocks)
    canvas = Image.new("RGB", (PANEL_W, height), (255, 255, 255))
    y = 0
    for b in blocks:
        canvas.paste(b, (0, y))
        y += b.height
    canvas.save(out)
    print(f"wrote {out}  ({canvas.width}x{canvas.height})  themes={[p.stem for p in THEMES]}")


if __name__ == "__main__":
    main()
