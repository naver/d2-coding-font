# Changelog

The archive for every version is attached to its tag on the
[Releases](https://github.com/naver/d2-coding-font/releases) page. Versions 1.0 and 1.1
predate this repository; their archives were re-uploaded when the project moved from
dev.naver.com to GitHub, and their dates below come from the archive names.

## Unreleased

- The ligatures for `.=`, `.-`, `{.` and `.}` are removed
  ([#97](https://github.com/naver/d2-coding-font/issues/97)). They raised the period to
  the height of a centered dot, which misrepresented code where the period has a meaning
  of its own: the decimal point in `1.-x`, the `{{.}}` of Go templates, Nim pragmas such
  as `{.inline.}` and CSS selectors such as `.-mt-2`. These sequences now show a plain
  period. `..`, `...`, `..<` and the other ligatures are unchanged.
- In Regular, `i`, `і` (U+0456) and `ѝ` (U+045D) were drawn one pixel above the baseline
  at 18 ppem with FreeType hinting
  ([#107](https://github.com/naver/d2-coding-font/issues/107),
  [#108](https://github.com/naver/d2-coding-font/pull/108)). Their hinting now has the
  18 ppem correction that 19 and 20 ppem already had.
- With FreeType hinting, 27 Regular and 87 Bold glyphs were drawn one pixel above the
  baseline at some sizes between 9 and 29 ppem, while `n`, `o` and `E` sat on it
  ([#109](https://github.com/naver/d2-coding-font/issues/109),
  [#110](https://github.com/naver/d2-coding-font/issues/110),
  [#111](https://github.com/naver/d2-coding-font/issues/111),
  [#112](https://github.com/naver/d2-coding-font/issues/112)). Among them are `ї`, `ѝ`,
  `ε`, `Ω`, `З` and `Э` in Regular, and in Bold the dotless `ı` with `ì í î ï`, `ł`,
  `Đ`, the `U` and `t` families and most Greek and Cyrillic letters at 18 ppem. Their
  hinting now has a -1 px correction at those sizes, so the composite glyphs built on them
  follow. No outline changed, and every other size renders as before.
  `tools/check_hinting.py` now checks all baseline glyphs from U+0020 to U+052F at 9 to
  29 ppem.
- A dotted zero is available as an alternate to the slashed one
  ([#106](https://github.com/naver/d2-coding-font/issues/106)). It is off by default and
  is turned on with the `cv01` OpenType feature, also registered as `ss01`; the README
  lists the settings for common editors and terminals. It keeps the outer outline,
  advance and vertical hinting of the zero, so it lines up with it at every size. The
  standard builds now have a `GSUB` table that holds only these two features, so nothing
  changes unless they are turned on. With the ligatures, the zero is replaced after the
  ligature lookups, so every ligature still forms.

## 1.3.5 (2026-10-03)

- The control characters U+0001 to U+001F, except the carriage return U+000D, are no
  longer mapped. They pointed at DOS style control pictures, and text engines that
  look them up drew them: Keynote showed the line feed as a boxed circle at the end of
  each paragraph ([#93](https://github.com/naver/d2-coding-font/issues/93)). The
  pictures are still in the font but nothing maps to them. Tab is no longer mapped
  either; the space U+0020 keeps its glyph. No outline, width or hinting changed.
- The coding ligatures are registered under `liga` as well as `calt`, with the same
  lookups ([#73](https://github.com/naver/d2-coding-font/issues/73)). The Hangul
  shaper in HarfBuzz, like Uniscribe, switches `calt` off, so a line of Korean that was
  shaped as one Hangul run, for example `<!-- 주석 -->`, lost its ligatures. To turn
  the ligatures off now, switch off both `calt` and `liga`. In VS Code,
  `"editor.fontLigatures": false` already does both.

## 1.3.4 (2026-10-02)

- Twenty symbols that Unicode classes as East Asian Wide were drawn at half width:
  `◽ ◾ ☔ ☕ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ ♿ ⚓ ⚡` and the wave dash `〜` (U+301C).
  Terminals give these characters two columns, so the glyph filled only the left half
  of its cell ([#72](https://github.com/naver/d2-coding-font/issues/72),
  [#91](https://github.com/naver/d2-coding-font/issues/91)). They now have the same
  advance as a Hangul syllable, with the drawing unchanged in size and centered in the
  wider cell. The wave dash used to share its glyph with the tilde operator `∼`
  (U+223C), which stays half width, so it now has a glyph of its own.
  Symbols that Unicode classes as Ambiguous or Neutral, such as `★ ◆ → “ ” …`, keep
  their half width.
- Rebuilt the superscripts, subscripts and vulgar fractions so they match the rest of
  the font ([#102](https://github.com/naver/d2-coding-font/issues/102)). U+2070 to
  U+209C and U+2150 to U+215F did not come from the same drawing as the other
  figures: they were lighter and smaller, they sat on their own vertical band, and
  their outlines were identical in Regular and Bold, so they stayed at Regular weight
  in the bold font. They are now built to the proportions of the drawn `¹ ² ³` and
  `¼ ½ ¾`, which are themselves unchanged. The fraction slash U+2044 is bold in the
  bold font as well.

## 1.3.3 (2026-07-25)

A metadata-only release. Only the `name` and `head` tables were rewritten; every other
table is byte identical to 1.3.2, and shaping output is unchanged.

- The copyright, trademark and vendor URL records still credited NHN Corporation. NAVER
  Corporation was spun off from NHN in 2013 and is the copyright holder, so those records
  now read `NAVER Corporation` and `https://www.navercorp.com`.
- The license URL (name ID 14) pointed at a dead `dev.naver.com` wiki page. It now points
  at `https://openfontlicense.org`.
- `OFL.txt` is included in the release archive. The full license text used to live only in
  the project wiki.

## 1.3.2 (2018-05-24)

- Fixed the shortened `i` at 18pt in IntelliJ, Android Studio and Visual Studio Code
  ([#70](https://github.com/naver/d2-coding-font/issues/70)).
- Fixed glyph height problems: 산 at 19px, 세 at 16pt and 18pt.
- Fixed the bold lowercase `y` being drawn smaller than the surrounding characters
  ([#67](https://github.com/naver/d2-coding-font/issues/67)).
- Improved the legibility of the empty heart symbol U+2661
  ([#69](https://github.com/naver/d2-coding-font/issues/69)).
- Fixed the tab indicator overlapping the `>>` marks in Source Insight 4.0
  ([#68](https://github.com/naver/d2-coding-font/issues/68)).

## 1.3.1 (2017-12-19)

Re-issued on 2018-01-15 to correct the version name from 1.31 to 1.3.1.

- Split the ligature and standard fonts into separate builds
  ([#59](https://github.com/naver/d2-coding-font/issues/59)).
- Fixed character display in Total Commander
  ([#64](https://github.com/naver/d2-coding-font/issues/64)).
- Fixed broken rendering in GNOME
  ([#56](https://github.com/naver/d2-coding-font/issues/56)).
- Fixed the `@` character at 15pt
  ([#57](https://github.com/naver/d2-coding-font/issues/57)).

## 1.3 (2017-11-29)

- Improved legibility of the ㅂ final consonant, of single against double quotation marks,
  and of `b`, `d` and `h`, whose short ascenders could read as `o` or `n`.
- Added powerline symbols.
- Added programming ligatures for common operator sequences through the OpenType `calt`
  feature.
- Fixed the font not appearing in some development tools; verified on Windows 7/10,
  OS X 10.7 through macOS 10.12, and Ubuntu 14/16 across the common editors and IDEs.

## 1.2 (2016-10-21)

- Added 31 control pictures (arrows, boxes and the other ASCII control characters).

## 1.1 (2015-11-03)

- Made consecutive underscores distinguishable.
- Fixed the character width at 10pt in Visual Studio.
- Fixed the Hangul advance width so it stays exactly twice the Latin width at every size.

## 1.0 (2015-09-11)

The first release: Regular and Bold, drawn for NAVER by FONTRIX, with the Hangul based on
Nanum Barun Gothic, distributed as a TTC.
