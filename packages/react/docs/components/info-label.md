## info-label

Sources: fundamental-react [InfoLabel](https://github.com/SAP/fundamental-react/tree/main/src/InfoLabel) · Angular
[`registry/ui/info-label`](../../../angular/registry/ui/info-label/) · fundamental-styles
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                         | Cause                                                                                                                                                                                                      | Resolution                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| After the fixes, 3–12% of text pixels differ in 7–11 comparisons per full run, no style difference | Text anti-aliasing varies from capture to capture while several pages render in parallel on a loaded machine: the failing comparisons change on every run (also with 2 workers), and none of them repeats. | Kept, not in the component: ours and fundamental-styles' screenshots are byte-identical when captured on their own (checked five times each for display 4 HCB cozy RTL, display with icon 2 HCB compact LTR and display with icon 8 Horizon cozy LTR). |
