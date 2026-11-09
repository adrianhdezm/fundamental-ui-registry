## info-label

Sources: fundamental-react [InfoLabel](https://github.com/SAP/fundamental-react/tree/main/src/InfoLabel) · Angular
[`registry/ui/info-label`](../../../../angular/registry/ui/info-label/) · fundamental-styles
[Info Label](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-info-label--docs)
Registry: `registry/ui/info-label/`, a plain `<span>` with the registry's `Icon` (no Base UI primitive applies: the
label is not interactive).

API: the Angular inputs as props: `type` (`numeric` | `icon`), `glyph`, `font`, `color` (1–10 or `'1'`–`'10'`,
default 7; other values fall back to 7), `display` and `srText` ("Info Label"). Angular's `label` is `children`, as
fundamental-react's. fundamental-react's `numeric` is `type="numeric"`, and its `glyph` and `color` are the same. The
accent colours are the `--fdInfoLabel_*` values already in `extensions.css` (SAP avatar colours; fundamental-styles'
coloured palette in HC Black and HC White).

Deliberate differences:

- `aria-label` and `aria-labelledby` are not put on the root `<span>`, as Angular's `ariaLabel` and `ariaLabelledBy`:
  they name the text, or, for a glyph-only label, `aria-label` goes to the icon, which becomes `role="img"`.
  fundamental-react put `aria-label` on the root and left the icon hidden, so a glyph-only label had no name.
- `title` is a native prop and stays on the root (Angular puts it on the text), so the tooltip covers the whole label.
- `type` has no visual effect in Angular or in fundamental-styles; React renders it as `data-type`.
- An empty `srText` renders no hidden text.
- `forced-color-adjust: none` as in fundamental-styles (not in the Angular classes), so the accent colours stay in
  Windows high contrast mode as in the other HC palettes.
- The label sits on the baseline, as in fundamental-styles; the Angular classes add `align-middle` (see below).
- The icon is as wide as its glyph (`w-auto`), not the 1em box of `Icon` (see below), as in fundamental-styles and
  Angular.

### Stories vs. sources

| Source            | Example                          | React story                     | Status     | Notes                                                                                                                          |
| ----------------- | -------------------------------- | ------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| fundamental-react | primary                          | `Playground`                    | ✅ covered |                                                                                                                                |
| fundamental-react | colors                           | `Colors`                        | ✅ covered | Texts "color 1"–"color 10" as fundamental-styles', so pixels can be compared.                                                  |
| fundamental-react | glyph                            | `WithIcon`                      | ✅ covered | The same glyphs; the glyph-only label has `aria-label="Upload to cloud"` on the icon.                                          |
| fundamental-react | numeric                          | `Numeric`                       | ✅ covered | 1 and 10000.                                                                                                                   |
| fundamental-react | dev                              | `Playground`                    | ✅ covered | Knobs are the Playground controls.                                                                                             |
| fundamental-react | noStyles                         | —                               | ➖ n/a     | No `cssNamespace`.                                                                                                             |
| Angular           | Playground                       | `Playground`                    | ✅ covered |                                                                                                                                |
| Angular           | Accent colors, icons and numbers | `Colors`, `WithIcon`, `Numeric` | ✅ covered | Split in three; the BusinessSuiteInAppSymbols `component` row is in `WithIcon`, the numbers and glyph-only label in `Numeric`. |
| Angular           | Display size                     | `Display`                       | ✅ covered | Both fundamental-styles rows (text, and text with the `dark-mode` icon).                                                       |

### Tests vs. sources

| Source             | Behaviour                                             | React test                                                             | Status     |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------- | ---------- |
| Angular            | Colours 1–10, strings, fallback to 7, HCB/HCW palette | colors 1–10 use the accent tokens (high contrast palette in HCB/HCW)   | ✅ covered |
| Angular            | Glyph with label, glyph only, numeric with title      | label with glyph, glyph only (needs aria-label), numeric type          | ✅ covered |
| Angular            | ariaLabel of a text label goes to the text            | aria-label and aria-labelledby of a text label go to the text          | ✅ covered |
| Angular            | Display size, srText                                  | display variant and srText for assistive technology                    | ✅ covered |
| fundamental-react  | Prop spreading                                        | passes className, native props and the ref through (fundamental-react) | ✅ covered |
| fundamental-react  | Forwards the ref (a `<span>`)                         | passes className, native props and the ref through (fundamental-react) | ✅ covered |
| fundamental-styles | Box, border, radius, padding, gap, typography         | renders the SAP info label box and typography                          | ✅ covered |

### Visual comparison

`pnpm visual info-label`: 43 cases × 16 combinations, 677/688 matching in the last full run, and the other 11 are
identical when captured again (see the last row of the table). Cases: the ten accent colours (fundamental-styles'
Color Flavors), the ten labels with the `dark-mode` icon (Info Label with Icon), and both rows of Display Mode (text,
and text with icon), plus the icon and text of colour 7 on their own; all by pixels and computed style. Info labels
have no compact size, so cozy and compact are the same. Horizon cozy and compact, LTR and RTL, were also reviewed by
eye.

| Difference                                                                                         | Cause                                                                                                                                                                                                                                  | Resolution                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Labels with an icon 1.5px wider (1.25px in display size); the icon 12px wide instead of 10.5px     | `Icon` gives every glyph a 1em box; fundamental-styles' `.fd-info-label__icon` has no width, so it is as wide as the glyph.                                                                                                            | Fixed: `w-auto` on the icon. Not in Angular, whose icon is as wide as the glyph.                                                                                                                                                                       |
| Text pixels off by 4–12% in scattered combinations, no style difference                            | Our stories laid the labels out with a flex gap and the display rows in a flex column, so labels sat at other fractional x and y positions than fundamental-styles' (inline labels separated by spaces, rows separated by `<br><br>`). | Fixed in the stories: inline labels with spaces and `<br><br>`, as fundamental-styles. Positions are now identical.                                                                                                                                    |
| Inline labels 0.3px lower than fundamental-styles'                                                 | The Angular classes add `align-middle`; fundamental-styles keeps `vertical-align: baseline`.                                                                                                                                           | Fixed: no `align-middle`. Angular issue.                                                                                                                                                                                                               |
| After the fixes, 3–12% of text pixels differ in 7–11 comparisons per full run, no style difference | Text anti-aliasing varies from capture to capture while several pages render in parallel on a loaded machine: the failing comparisons change on every run (also with 2 workers), and none of them repeats.                             | Kept, not in the component: ours and fundamental-styles' screenshots are byte-identical when captured on their own (checked five times each for display 4 HCB cozy RTL, display with icon 2 HCB compact LTR and display with icon 8 Horizon cozy LTR). |
