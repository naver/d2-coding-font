#!/usr/bin/env python3
"""Regenerate the web fonts and data.js for this page from the shipped binaries.

    pip install fonttools brotli uharfbuzz
    python tools/build-data.py ../fonts/ttf

The page uses the ligature build for both states: the standard build is the same
font with `calt` and `liga` switched off, so one pair of WOFF2 files covers everything.
"""
import itertools
import json
import os
import sys

import uharfbuzz as hb
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)


def make_woff2(src, dst):
    font = TTFont(src)
    font.flavor = "woff2"
    font.save(dst)
    print("%s -> %s (%.2f MB)" % (src, dst, os.path.getsize(dst) / 1e6))


def ligatures(path):
    """Every sequence the `calt` code actually rewrites, verified with HarfBuzz.

    Candidates come from the chaining contextual rules that can start a
    ligature (empty backtrack); a candidate counts only if every one of its
    characters is replaced when the feature is on.
    """
    tt = TTFont(path, lazy=True)
    glyph_to_char = {}
    for cp, name in sorted(tt.getBestCmap().items()):
        glyph_to_char.setdefault(name, chr(cp))

    font = hb.Font(hb.Face(hb.Blob.from_file_path(path)))

    def shape(text, calt):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(font, buf, {"calt": calt, "liga": calt})
        return [info.codepoint for info in buf.glyph_infos]

    def is_full_ligature(text):
        on, off = shape(text, True), shape(text, False)
        return len(on) == len(off) == len(text) and all(a != b for a, b in zip(on, off))

    candidates = set()
    for lookup in tt["GSUB"].table.LookupList.Lookup:
        if lookup.LookupType != 6:
            continue
        for sub in lookup.SubTable:
            if getattr(sub, "Format", None) != 3 or getattr(sub, "BacktrackGlyphCount", 0):
                continue
            options = []
            for coverage in [sub.InputCoverage[0]] + list(sub.LookAheadCoverage):
                chars = [glyph_to_char[g] for g in coverage.glyphs if g in glyph_to_char]
                if not chars:
                    options = None
                    break
                options.append(chars[:12])
            if not options:
                continue
            total = 1
            for opt in options:
                total *= len(opt)
            if total > 4000:
                continue
            for combo in itertools.product(*options):
                candidates.add("".join(combo))

    found = [s for s in candidates if len(s) >= 2 and is_full_ligature(s)]
    return sorted(found, key=lambda s: (len(s), s))


def coverage(path):
    tt = TTFont(path, lazy=True)
    ranges = []
    for cp in sorted(tt.getBestCmap()):
        if ranges and cp == ranges[-1][1] + 1:
            ranges[-1][1] = cp
        else:
            ranges.append([cp, cp])
    return ranges, tt["maxp"].numGlyphs, len(tt.getBestCmap())


def main(ttf_dir):
    regular = os.path.join(ttf_dir, "D2Codingligature-Regular.ttf")
    bold = os.path.join(ttf_dir, "D2Codingligature-Bold.ttf")

    os.makedirs(os.path.join(SITE, "fonts"), exist_ok=True)
    make_woff2(regular, os.path.join(SITE, "fonts", "D2Coding-Regular.woff2"))
    make_woff2(bold, os.path.join(SITE, "fonts", "D2Coding-Bold.woff2"))

    ligs = ligatures(regular)
    ranges, glyphs, codepoints = coverage(regular)
    print("%d ligature sequences, %d codepoints in %d ranges" % (len(ligs), codepoints, len(ranges)))

    with open(os.path.join(SITE, "data.js"), "w", encoding="utf-8") as fh:
        fh.write("// Generated from the D2Coding binaries by tools/build-data.py. Do not edit by hand.\n")
        fh.write("const LIGATURES = %s;\n" % json.dumps(ligs, ensure_ascii=False))
        fh.write("const COVERAGE = %s;\n" % json.dumps(ranges))
        fh.write("const GLYPH_COUNT = %d;\n" % glyphs)
        fh.write("const CODEPOINT_COUNT = %d;\n" % codepoints)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(SITE, "..", "fonts", "ttf"))
