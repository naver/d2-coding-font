# Sources

These UFO files are **not** the original design data.

The typeface was drawn for NAVER by FONTRIX in 2015 and the original sources were never part of
this repository. On a project this old, working out who still holds the `.glyphs`, `.ufo` or `.vfb`
files takes time, and it may turn out that nobody does. What is here was reverse-engineered from
the released TTF binaries so that there is something to build on and fix in the meantime.

## How these were produced

```
D2Coding-Ver1.3.3-20260725-ligature.ttf      -> D2Coding-Regular.ufo
D2CodingBold-Ver1.3.3-20260725-ligature.ttf  -> D2Coding-Bold.ufo
```

with [fontTools](https://github.com/fonttools/fonttools) and
[extractor](https://github.com/robotools/extractor) (`extractor.extractUFO`).

The ligature builds were used as the input because they are a strict superset of the standard
builds: their `glyf`, `loca`, `hmtx` and `cmap` tables are byte-identical to the corresponding
standard builds, and they additionally carry the `GSUB` code for the coding ligatures. So the
standard build is the same source without the `aalt`, `calt` and `liga` features, which is why both
builds can be generated from this one set of sources. Since 1.4.0 the standard build keeps the
`cv01` and `ss01` features for the dotted zero, the glyph `zero.dotted`.

## What to expect

* Outlines are **quadratic**, exactly as they are in the shipped TTFs. They were never round
  tripped through cubic curves, so nothing was redrawn or approximated, but they are also not
  organised the way a designer would draw them.
* Glyph names come from the binaries' `post` table. The ligature glyphs were unnamed there and
  appear as `glyph03820` … `glyph03941`.
* `features.fea` is decompiled from the binary `GSUB`/`GPOS` tables, so the coding ligatures are
  expressed as the chaining contextual substitutions the compiler produced, not as the source code
  that was originally written.
* The TrueType hinting survived the round trip: the `cvt `, `fpgm` and `prep` programs are in
  `lib.plist` under `public.truetype.instructions`, and the per glyph instructions are in the
  matching key inside each `.glif`.
* `fontinfo.plist` carries the names of the binary it came from, so `familyName` reads
  `D2Coding ligature`. The file names use the project family name instead, because these sources
  are meant to produce both builds.
* There are no interpolation masters. Regular and Bold are two independent, non compatible sets of
  outlines, so a variable font cannot be interpolated from them as they stand.
* Each UFO is around 130 MB on disk (26,000 plus glyphs). They compress to roughly a tenth of that
  in the git object store, but a checkout is large.

## Reproducing the extraction

```sh
pip install fonttools defcon git+https://github.com/robotools/extractor
```

```python
import defcon, extractor

ufo = defcon.Font()
extractor.extractUFO("../fonts/ttf/D2Codingligature-Regular.ttf", ufo)
ufo.save("D2Coding-Regular.ufo")
```
