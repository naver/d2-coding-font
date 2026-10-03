#!/usr/bin/env python3
"""Check that baseline glyphs reach the baseline with FreeType hinting.

Usage:
    uv run --with freetype-py python tools/check_hinting.py fonts/ttf/*.ttf

Renders every glyph from U+0020 to U+052F whose outline bottom is between 0 and 40 units
at 9 to 29 ppem, and fails if a bitmap ends above the baseline. Above 29 ppem the serif
bottoms at 16 units round to one pixel even in plain Latin, so those sizes are not checked.
`--specimen out.png` on a single font draws i, U+0456 and U+045D at 16 to 20 ppem; it also
needs Pillow 10.1 or later.
"""

import argparse
import hashlib
import textwrap
from dataclasses import dataclass
from pathlib import Path

import freetype

PPEMS = tuple(range(16, 21))
BASELINE_PPEMS = tuple(range(9, 30))
BASELINE_RANGE = range(0x0020, 0x0530)
# Punctuation and symbols that may sit above the baseline by design.
BASELINE_SKIP = {0x0023, 0x0025, 0x002E, 0x003A, 0x00A4, 0x00B1}
GLYPHS = (
    (0x0069, "LATIN SMALL LETTER I"),
    (0x0456, "CYRILLIC SMALL LETTER BYELORUSSIAN-UKRAINIAN I"),
    (0x045D, "CYRILLIC SMALL LETTER I WITH GRAVE"),
)


@dataclass(frozen=True)
class Raster:
    ppem: int
    top: int
    bottom: int
    left: int
    width: int
    rows: int
    pixels: tuple[tuple[int, ...], ...]


def render(face: freetype.Face, codepoint: int, ppem: int) -> Raster:
    face.set_pixel_sizes(0, ppem)
    face.load_char(chr(codepoint), freetype.FT_LOAD_DEFAULT | freetype.FT_LOAD_RENDER)
    glyph = face.glyph
    bitmap = glyph.bitmap
    if bitmap.pixel_mode != freetype.FT_PIXEL_MODE_GRAY:
        raise ValueError(f"unsupported FreeType pixel mode {bitmap.pixel_mode}")
    pitch = abs(bitmap.pitch)
    buffer = bytes(bitmap.buffer)
    pixels = []
    for row in range(bitmap.rows):
        source_row = bitmap.rows - row - 1 if bitmap.pitch < 0 else row
        start = source_row * pitch
        pixels.append(tuple(buffer[start : start + bitmap.width]))
    return Raster(
        ppem=ppem,
        top=glyph.bitmap_top,
        bottom=glyph.bitmap_top - bitmap.rows,
        left=glyph.bitmap_left,
        width=bitmap.width,
        rows=bitmap.rows,
        pixels=tuple(pixels),
    )


def measure(path: Path) -> dict[int, tuple[Raster, ...]]:
    face = freetype.Face(str(path))
    return {
        codepoint: tuple(render(face, codepoint, ppem) for ppem in PPEMS)
        for codepoint, _ in GLYPHS
    }


def floating(path: Path) -> dict[int, tuple[int, ...]]:
    """Codepoints of baseline glyphs that end above the baseline, with the sizes."""
    face = freetype.Face(str(path))
    result = {}
    for codepoint, index in face.get_chars():
        if codepoint not in BASELINE_RANGE or codepoint in BASELINE_SKIP:
            continue
        face.load_glyph(index, freetype.FT_LOAD_NO_SCALE)
        if face.glyph.outline.n_points == 0 or not 0 <= face.glyph.outline.get_bbox().yMin <= 40:
            continue
        sizes = []
        for ppem in BASELINE_PPEMS:
            face.set_pixel_sizes(0, ppem)
            face.load_glyph(index, freetype.FT_LOAD_DEFAULT | freetype.FT_LOAD_RENDER)
            if face.glyph.bitmap_top - face.glyph.bitmap.rows > 0:
                sizes.append(ppem)
        if sizes:
            result[codepoint] = tuple(sizes)
    return result


def check(path: Path, measurements: dict[int, tuple[Raster, ...]]) -> bool:
    failed = False
    print(path)
    for codepoint, _ in GLYPHS:
        bottoms = tuple(raster.bottom for raster in measurements[codepoint])
        print(f"  U+{codepoint:04X}: bottom={bottoms}")
        failed |= any(bottom != 0 for bottom in bottoms)
    off = floating(path)
    for codepoint, sizes in off.items():
        print(f"  U+{codepoint:04X} {chr(codepoint)} above the baseline at {sizes} ppem")
    if not off:
        print(f"  all baseline glyphs reach the baseline at {BASELINE_PPEMS[0]} to {BASELINE_PPEMS[-1]} ppem")
    return not failed and not off


def specimen(
    path: Path,
    measurements: dict[int, tuple[Raster, ...]],
    output: Path,
    title: str,
) -> None:
    from PIL import Image, ImageDraw, ImageFont

    scale = 8
    margin = 36
    label_width = 310
    cell_width = 168
    cell_height = 192
    header_height = 170
    footer_height = 54
    width = margin * 2 + label_width + cell_width * len(PPEMS)
    height = header_height + cell_height * len(GLYPHS) + footer_height
    image = Image.new("RGB", (width, height), "#f4f1e8")
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default(size=18)
    small_font = ImageFont.load_default(size=15)
    title_font = ImageFont.load_default(size=28)
    draw.text((margin, 28), title, fill="#171717", font=title_font)
    draw.text(
        (margin, 72),
        f"Native FreeType {'.'.join(map(str, freetype.version()))} grayscale rendering",
        fill="#444444",
        font=font,
    )
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    draw.text((margin, 106), f"SHA-256 {digest}", fill="#555555", font=small_font)

    for column, ppem in enumerate(PPEMS):
        x = margin + label_width + column * cell_width
        draw.text((x + 50, header_height - 30), f"{ppem} ppem", fill="#171717", font=small_font)

    for row, (codepoint, name) in enumerate(GLYPHS):
        y = header_height + row * cell_height
        draw.text((margin, y + 54), f"U+{codepoint:04X}", fill="#171717", font=font)
        for line_number, line in enumerate(textwrap.wrap(name, width=31)):
            draw.text(
                (margin, y + 88 + line_number * 22),
                line,
                fill="#555555",
                font=small_font,
            )
        for column, raster in enumerate(measurements[codepoint]):
            x = margin + label_width + column * cell_width
            background = "#fff2ef" if raster.ppem == 18 else "#ffffff"
            draw.rounded_rectangle(
                (x + 8, y + 8, x + cell_width - 8, y + cell_height - 14),
                radius=5,
                fill=background,
                outline="#c9342f" if raster.ppem == 18 else "#c9c5ba",
                width=2 if raster.ppem == 18 else 1,
            )
            baseline = y + 146
            glyph_x = x + (cell_width - raster.width * scale) // 2
            glyph_y = baseline - raster.top * scale
            for pixel_row, pixels in enumerate(raster.pixels):
                for pixel_column, coverage in enumerate(pixels):
                    if not coverage:
                        continue
                    shade = 255 - round(coverage * 238 / 255)
                    left = glyph_x + pixel_column * scale
                    top = glyph_y + pixel_row * scale
                    draw.rectangle(
                        (left, top, left + scale - 1, top + scale - 1),
                        fill=(shade, shade, shade),
                    )
            draw.line((x + 18, baseline, x + cell_width - 18, baseline), fill="#d02b26", width=2)
            draw.text(
                (x + 42, y + cell_height - 43),
                f"bottom={raster.bottom}",
                fill="#c9342f" if raster.bottom else "#555555",
                font=small_font,
            )

    draw.text(
        (margin, height - 36),
        "The red line is the baseline. A bottom value of 1 leaves a one-pixel gap.",
        fill="#555555",
        font=small_font,
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output)
    print(f"wrote {output}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("fonts", nargs="+", type=Path)
    parser.add_argument("--specimen", type=Path)
    parser.add_argument("--title")
    args = parser.parse_args()
    if args.specimen and len(args.fonts) != 1:
        parser.error("--specimen requires exactly one font")

    passed = True
    for path in args.fonts:
        measurements = measure(path)
        passed &= check(path, measurements)
        if args.specimen:
            specimen(path, measurements, args.specimen, args.title or path.name)
    if not passed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
