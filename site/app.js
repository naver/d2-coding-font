/* D2Coding specimen + rendering problem reproduction page.
   LIGATURES / COVERAGE / GLYPH_COUNT / CODEPOINT_COUNT come from data.js,
   which is generated from the shipped 1.3.3 binaries. */

(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };
  var root = document.documentElement;

  /* ------------------------------------------------------------------ theme */

  var THEMES = ["auto", "light", "dark"];
  var themeLabel = document.querySelector("[data-theme-label]");

  function applyTheme(name) {
    root.setAttribute("data-theme", name);
    themeLabel.textContent = name;
    try { localStorage.setItem("d2coding-theme", name); } catch (e) { /* private mode */ }
  }

  var stored;
  try { stored = localStorage.getItem("d2coding-theme"); } catch (e) { stored = null; }
  applyTheme(THEMES.indexOf(stored) >= 0 ? stored : "auto");

  $("#theme-toggle").addEventListener("click", function () {
    var next = THEMES[(THEMES.indexOf(root.getAttribute("data-theme")) + 1) % THEMES.length];
    applyTheme(next);
  });

  /* ---------------------------------------------------------------- samples */

  var SAMPLES = {
    js: [
      "// D2Coding 1.3.5 - github.com/naver/d2-coding-font",
      "const OPERATORS = ['!=', '===', '=>', '->', '<=', '|>', '::', '<$>'];",
      "",
      "export function align(rows, width = 12) {",
      "  return rows.map(([key, value]) => {",
      "    const pad = Math.max(width - key.length, 1);",
      "    return `${key}${' '.repeat(pad)}${value}`;",
      "  });",
      "}",
      "",
      "const table = align([",
      "  ['id',     1024],       // 식별자",
      "  ['family', 'D2Coding'], // 글꼴 이름",
      "  ['weight', 400],        // 굵기",
      "]);",
      "",
      "if (table.length !== 3) throw new Error('행 개수가 맞지 않습니다');"
    ].join("\n"),

    python: [
      "from dataclasses import dataclass",
      "",
      "",
      "@dataclass",
      "class Face:",
      "    family: str = \"D2Coding\"",
      "    weight: int = 400",
      "    upem:   int = 1000",
      "",
      "    def advance(self, ch: str) -> int:",
      "        \"\"\"한글은 1000, 라틴은 500 유닛.\"\"\"",
      "        return self.upem if ord(ch) >= 0xAC00 else self.upem // 2",
      "",
      "",
      "faces  = [Face(), Face(weight=700)]",
      "widths = {c: faces[0].advance(c) for c in \"aA0가힣\"}",
      "",
      "assert widths[\"가\"] == widths[\"a\"] * 2  # 정확히 2 : 1",
      "print(f\"{widths!r}\")"
    ].join("\n"),

    korean: [
      "/*",
      " * 한글 주석을 섞어 써도 열이 어긋나지 않습니다.",
      " * 한글 한 글자는 라틴 두 글자와 정확히 같은 폭입니다.",
      " */",
      "",
      "| 항목       | 값        | 설명                        |",
      "| ---------- | --------- | --------------------------- |",
      "| 글꼴 이름  | D2Coding  | 나눔바른고딕 기반           |",
      "| 굵기       | 400 / 700 | Regular, Bold               |",
      "| 라이센스   | OFL 1.1   | 상용 프로그램 포함 재배포   |",
      "| 리거처     | calt/liga | 별도 빌드로 제공            |",
      "",
      "def 검증(문자열: str) -> bool:",
      "    return len(문자열.encode(\"utf-8\")) > 0  # 인코딩 확인"
    ].join("\n"),

    box: [
      "┌──────────────┬───────────┬──────────┐",
      "│ face         │ upem      │ advance  │",
      "├──────────────┼───────────┼──────────┤",
      "│ Regular      │      1000 │      500 │",
      "│ Bold         │      1000 │      500 │",
      "│ 한글 (Regular)│     1000 │     1000 │",
      "└──────────────┴───────────┴──────────┘",
      "",
      "╔══════════════════════════════════════╗",
      "║  ░░▒▒▓▓██  shading and blocks  ██▓▓▒▒░░  ║",
      "╚══════════════════════════════════════╝",
      "",
      "  ├─ src/",
      "  │  ├─ index.js",
      "  │  └─ style.css",
      "  └─ README.md"
    ].join("\n"),

    confuse: [
      "0O0O0O   oO0  Il1|  lI1|  2Z2Z  5S5S  8B8B",
      "",
      "const l = 1; const I = l | 0; const O = 0;",
      "if (I !== l) { /* 1, l, I, | */ }",
      "",
      "rn m  cl d  vv w  ,. ;:  '\"`  -_~=",
      "",
      "ㅁㅇㅎ  ㅐㅒㅔㅖ  ㄹㄷㄸ  ㅅㅆㅈㅉ",
      "산세  섹세  월워  글굴  밝밟"
    ].join("\n"),

    lorem: [
      "D2Coding was drawn for people who read code all day.",
      "",
      "It is based on Nanum Barun Gothic, so the Hangul keeps the soft,",
      "even colour of that family while the Latin was reworked for the",
      "screen. The shapes that get confused while scanning a diff (zero",
      "against capital O, one against lowercase l, comma against period)",
      "were pulled apart, and the hinting was tuned for 8 to 18 point,",
      "the range editors and terminals actually run at.",
      "",
      "Because it is monospaced on a single grid shared by Latin and",
      "Hangul, a Korean comment costs exactly as many columns as you",
      "would expect, and nothing downstream has to be re-aligned."
    ].join("\n")
  };

  var editor = $("#editor");
  editor.value = SAMPLES.js;

  Array.prototype.forEach.call(document.querySelectorAll("[data-sample]"), function (btn) {
    btn.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-sample]"), function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      editor.value = SAMPLES[btn.dataset.sample];
      render();
    });
  });

  /* --------------------------------------------------------------- controls */

  var ctl = {
    size: $("#ctl-size"),
    leading: $("#ctl-leading"),
    tracking: $("#ctl-tracking"),
    bold: $("#ctl-bold"),
    calt: $("#ctl-calt"),
    grid: $("#ctl-grid"),
    antialias: $("#ctl-antialias")
  };

  function settings() {
    return {
      size: Number(ctl.size.value),
      leading: Number(ctl.leading.value),
      tracking: Number(ctl.tracking.value),
      weight: ctl.bold.checked ? 700 : 400,
      calt: ctl.calt.checked,
      grid: ctl.grid.checked,
      antialias: ctl.antialias.checked
    };
  }

  function render() {
    var s = settings();
    root.style.setProperty("--type-size", s.size + "px");
    root.style.setProperty("--type-leading", String(s.leading));
    root.style.setProperty("--type-tracking", s.tracking + "em");
    root.style.setProperty("--type-weight", String(s.weight));
    root.style.setProperty("--type-liga", s.calt ? "contextual" : "none");
    root.style.setProperty("--type-features", s.calt ? '"calt" 1, "liga" 1' : '"calt" 0, "liga" 0');
    root.style.setProperty("--type-smoothing", s.antialias ? "antialiased" : "auto");
    root.style.setProperty("--cell", (s.size * 0.5 + s.size * s.tracking) + "px");
    document.body.classList.toggle("is-grid", s.grid);

    $("#out-size").textContent = s.size + "px";
    $("#out-leading").textContent = s.leading.toFixed(2);
    $("#out-tracking").textContent = s.tracking === 0 ? "0" : s.tracking.toFixed(2) + "em";

    buildLadder();
    buildReport();
  }

  Object.keys(ctl).forEach(function (k) {
    ctl[k].addEventListener("input", render);
    ctl[k].addEventListener("change", render);
  });

  /* -------------------------------------------------------------- ligatures */

  function buildLigatures() {
    var byLength = {};
    LIGATURES.forEach(function (lig) {
      (byLength[lig.length] = byLength[lig.length] || []).push(lig);
    });

    var html = Object.keys(byLength).sort(function (a, b) { return a - b; }).map(function (len) {
      var tiles = byLength[len].map(function (lig) {
        return '<div class="lig"><b>' + esc(lig) + "</b><span>" + esc(spaced(lig)) + "</span></div>";
      }).join("");
      return '<div class="lig-group"><h3>' + len + " characters · " + byLength[len].length +
        ' sequences</h3><div class="lig-grid">' + tiles + "</div></div>";
    }).join("");

    $("#lig-groups").innerHTML = html;
  }

  var LIG_MIXED_DEMO = [
    "// comment   x <- y   z => w   a !== b",
    "// 한글 주석 x <- y   z => w   a !== b"
  ].join("\n");

  function spaced(s) { return s.split("").join(" "); }

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ------------------------------------------------------------ confusables */

  var CONFUSABLES = [
    ["0 O o", "zero, capital o, lowercase o"],
    ["1 l I |", "one, lowercase L, capital i, pipe"],
    ["2 Z z", "two against z"],
    ["5 S s", "five against s"],
    ["8 B 6 G", "round digits against letters"],
    ["9 g q", "descenders"],
    ["; : , .", "punctuation at small sizes"],
    ["' \" ` ´", "quotes and accents"],
    ["- _ ~ =", "dashes and rules"],
    ["( ) [ ] { }", "bracket weight"],
    ["rn m cl d", "pairs that fuse"],
    ["ㅁ ㅇ ㅎ", "Hangul consonants"],
    ["ㅐ ㅒ ㅔ ㅖ", "Hangul vowels"],
    ["산 세 글 밝", "syllables reported in past issues"]
  ];

  function buildConfusables() {
    $("#confuse-grid").innerHTML = CONFUSABLES.map(function (pair) {
      return '<div class="confuse"><b>' + esc(pair[0]) + "</b><span>" + esc(pair[1]) + "</span></div>";
    }).join("");
  }

  /* A trailing part-row would otherwise expose the 1px grid backdrop as a
     block of empty colour, so pad each grid out to a whole number of rows. */
  function padGrid(el, cls) {
    Array.prototype.forEach.call(el.querySelectorAll(".is-filler"), function (f) { el.removeChild(f); });
    var cols = getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length;
    if (!cols) return;
    var missing = (cols - (el.children.length % cols)) % cols;
    for (var i = 0; i < missing; i++) {
      var d = document.createElement("div");
      d.className = cls + " is-filler";
      d.setAttribute("aria-hidden", "true");
      el.appendChild(d);
    }
  }

  function padGrids() {
    Array.prototype.forEach.call(document.querySelectorAll(".lig-grid"), function (g) {
      padGrid(g, "lig");
    });
    padGrid($("#confuse-grid"), "confuse");
  }

  /* ------------------------------------------------------------ hangul demo */

  var HANGUL_DEMO = [
    "AAAAAAAAAAAAAAAA  16 Latin columns",
    "가나다라마바사아  8 Hangul syllables, same width",
    "漢字漢字漢字漢字  8 ideographs, same width again",
    "",
    "| name       | 이름       | advance |",
    "| ---------- | ---------- | ------- |",
    "| Regular    | 레귤러     |     500 |",
    "| Bold       | 볼드       |     500 |",
    "| Hangul     | 한글       |    1000 |"
  ].join("\n");

  /* ------------------------------------------------------------ size ladder */

  var ladderInput = $("#ladder-input");

  function buildLadder() {
    var text = ladderInput.value || " ";
    var rows = "";
    for (var px = 8; px <= 24; px++) {
      rows += '<div class="ladder-row"><i>' + px + 'px</i><samp style="font-size:' + px +
        'px">' + esc(text) + "</samp></div>";
    }
    $("#ladder").innerHTML = rows;
  }

  ladderInput.addEventListener("input", buildLadder);

  /* --------------------------------------------------------- coverage check */

  function covered(cp) {
    var lo = 0, hi = COVERAGE.length - 1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (cp < COVERAGE[mid][0]) hi = mid - 1;
      else if (cp > COVERAGE[mid][1]) lo = mid + 1;
      else return true;
    }
    return false;
  }

  var covInput = $("#cov-input");

  function buildCoverage() {
    var text = covInput.value;
    var missing = [];
    var seen = {};
    for (var i = 0; i < text.length; i++) {
      var cp = text.codePointAt(i);
      if (cp > 0xffff) i++;
      if (cp === 10 || cp === 13 || cp === 9) continue;
      if (seen[cp]) continue;
      seen[cp] = true;
      if (!covered(cp)) missing.push(cp);
    }

    var out = $("#cov-result");
    if (!text.trim()) { out.innerHTML = ""; return; }
    if (!missing.length) {
      out.innerHTML = '<p class="cov-ok">Every character is in the font.</p>';
      return;
    }
    out.innerHTML = '<p class="cov-missing">' +
      (missing.length === 1 ? "1 character falls" : missing.length + " characters fall") +
      ' back to another font:</p><div class="cov-list">' +
      missing.map(function (cp) {
        return '<span class="cov-item"><b>' + esc(String.fromCodePoint(cp)) + "</b> U+" +
          cp.toString(16).toUpperCase().padStart(4, "0") + "</span>";
      }).join("") + "</div>";
  }

  covInput.addEventListener("input", buildCoverage);

  /* ------------------------------------------------------- report generator */

  function buildReport() {
    var s = settings();
    var lines = [
      "### Environment",
      "",
      "| | |",
      "| --- | --- |",
      "| Font | D2Coding 1.3.5 (ligature build, WOFF2) |",
      "| Build shown | " + (s.calt ? "ligature (`calt` and `liga` on)" : "standard (`calt` and `liga` off)") + " |",
      "| Weight | " + (s.weight === 700 ? "Bold (700)" : "Regular (400)") + " |",
      "| Size | " + s.size + "px |",
      "| Line height | " + s.leading.toFixed(2) + " |",
      "| Letter spacing | " + s.tracking.toFixed(2) + "em |",
      "| Smoothing | " + (s.antialias ? "antialiased" : "browser default") + " |",
      "| Viewport | " + window.innerWidth + " x " + window.innerHeight + " CSS px |",
      "| Device pixel ratio | " + (window.devicePixelRatio || 1) + " |",
      "| Platform | " + (navigator.platform || "unknown") + " |",
      "| User agent | " + navigator.userAgent + " |",
      "",
      "### Reproduced with",
      "",
      "https://naver.github.io/d2-coding-font/",
      "",
      "### What I see",
      "",
      "<!-- describe the problem and attach a screenshot -->"
    ];
    $("#report").textContent = lines.join("\n");
  }

  $("#copy-report").addEventListener("click", function () {
    var btn = this;
    var text = $("#report").textContent;
    var done = function (ok) {
      btn.textContent = ok ? "Copied" : "Copy failed. Select the text above";
      setTimeout(function () { btn.textContent = "Copy to clipboard"; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      done(false);
    }
  });

  /* ------------------------------------------------------------------- init */

  $("#stat-glyphs").textContent = GLYPH_COUNT.toLocaleString("en-US");
  $("#stat-codepoints").textContent = CODEPOINT_COUNT.toLocaleString("en-US");
  $("#stat-ligatures").textContent = LIGATURES.length;
  $("#hangul-demo").textContent = HANGUL_DEMO;
  $("#lig-mixed-demo").textContent = LIG_MIXED_DEMO;

  buildLigatures();
  buildConfusables();
  buildCoverage();
  render();
  padGrids();

  var resizeTimer;
  window.addEventListener("resize", function () {
    buildReport();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(padGrids, 120);
  });
})();
