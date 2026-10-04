#!/usr/bin/env python3
"""Sample the real colours out of a DSH screenshot so a 'too white' surface can be
traced back to the token that paints it, instead of guessing."""
import sys
from collections import Counter

from PIL import Image

path = sys.argv[1]
img = Image.open(path).convert("RGB")
w, h = img.size
print(f"size {w}x{h}")

# Most frequent colours = the dominant surfaces.
counts = Counter(img.getdata())
print("\n== top 16 colours ==")
for colour, n in counts.most_common(16):
    print(f"  #{colour[0]:02x}{colour[1]:02x}{colour[2]:02x}  {n:7d} px  {100*n/(w*h):5.2f}%")

# Named probes (fractions of width/height so the script survives a resize).
probes = [
    ("settings modal body (below 字号)", 0.52, 0.52),
    ("settings modal body (empty right)", 0.88, 0.60),
    ("left nav background", 0.055, 0.42),
    ("left nav active item 通用设置", 0.11, 0.163),
    ("Appearance cube: 跟随系统 (selected)", 0.84, 0.352),
    ("Appearance cube: 浅色 (unselected)", 0.38, 0.352),
    ("permission select fill", 0.885, 0.117),
    ("font-size stepper fill", 0.885, 0.487),
    ("our row: 暖纸 button (selected)", 0.82, 0.744),
    ("our row: 护眼绿 button (unselected)", 0.37, 0.744),
    ("row separator area", 0.52, 0.652),
]
print("\n== probes ==")
for label, fx, fy in probes:
    x, y = int(fx * w), int(fy * h)
    r, g, b = img.getpixel((x, y))
    print(f"  #{r:02x}{g:02x}{b:02x}  at ({x:4d},{y:4d})  {label}")

# Reference values from our palettes, for eyeball matching.
print("\n== warm-paper tokens of interest ==")
for name, value in [
    ("bg-base", "#f5f0e1"),
    ("bg-layer-1", "#fdfbf5"),
    ("bg-layer-2", "#fdfbf5"),
    ("bg-layer-3", "#fffdf8"),
    ("bg-overlay", "#f2eddc"),
    ("bg-module-platform", "#e8e5d9"),
    ("specific-menu", "#faf6eaf0"),
    ("specific-sidebar-fill", "#e8e5d9"),
    ("specific-input-major", "#fdfbf5"),
    ("settings-card-fill", "var(bg-layer-2)"),
]:
    print(f"  {value:22s} {name}")
