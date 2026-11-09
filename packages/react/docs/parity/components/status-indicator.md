## status-indicator

Sources: fundamental-react: none · Angular [`registry/ui/status-indicator`](../../../../angular/registry/ui/status-indicator/)
· fundamental-styles [Status Indicator](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-status-indicator--docs)
Registry: `registry/ui/status-indicator/`, on Base UI's `useRender`.

API: the Angular inputs as props: `size` (`sm`, `md` default, `lg`, `xl`), `status` (`negative`, `critical`,
`positive`; neutral when unset), `statusLabel`, `labelPosition` (`left`, `right`, `top`, `bottom`; no label without a
position), `labelSize` (`sm` default), `path` (one SVG path per shape), `viewBox`, `fillPercentage` (clamped to
0–100), `fillingType` (`lineardown` default, `linearup`, `linearleft`, `angled`, `radial`), `fillDirection`
(`clockwise`, `counterclockwise`, for radial), `angle` (for angled, 270 by default), `clickable`, `focusable` and
`role` (`progressbar` by default, `null` for none). Angular's `ariaLabel`, `ariaRoleDescription`, `ariaValueText` and
`title` are the native `aria-label`, `aria-roledescription`, `aria-valuetext` and `title`. Native props (`onClick`,
`onKeyDown`, `aria-*`, `tabIndex`, ...), `className`, `ref` and `render` go to the root.

Behaviour as Angular: each path is drawn twice in its own nested SVG, once filled through a mask and once as an outline
(0.25 stroke in the neutral element colour). Shapes fill one after another (60% of four shapes: two full, 40% of the
third). Linear and angled fills use a gradient mask whose two stops sit at the filled share and animate from 0 once
(SVG `<animate>`, 1s); the gradient vector follows the direction (`lineardown` 270°, `linearup` 90°, `linearleft`
180°, or `angle`), with Angular's (ngx's) angle-to-vector table. Radial fills measure each partly filled shape after
render (`getBBox`) and mask it with a polygon swept from 12 o'clock, mirrored for counterclockwise; full shapes keep
the gradient. Every gradient and mask has its own id, prefixed by the SVG's. The root is a `progressbar` (or `meter`)
with `aria-valuenow`, `aria-valuemin` 0, `aria-valuemax` 100 and `aria-valuetext` (the percentage, or the given text);
other roles get no value attributes. The SVG is `aria-hidden`. `focusable` puts it in the tab order with the SAP focus
outline offset by the focus width; `clickable` shows a pointer, and a clickable, focusable indicator is clicked with
Enter and Space (only when the indicator itself has the focus). The shape takes the status element colour, the label
the status text colour.

**Differences from Angular, on purpose:**

- Angular's `id` input is the SVG's id. Here `id` is the root's native id, and the SVG gets `<id>-svg` (or a
  generated id that is valid in a `url(#…)` reference), so the gradient and mask ids stay unique.
- The root takes fundamental-styles' typography: `text-sap-font-size`, `leading-[normal]`, `font-normal`,
  `text-sap-text-color`, `border-0` and `forced-color-adjust-none`; Angular sets the small font size and the label
  colour (see the Angular issues).
- Enter and Space call the indicator's own `onKeyDown` first, and do nothing when it called `preventDefault()`.

### Stories vs. sources

| Source             | Example                            | React story                        | Status     | Notes                                                                                                                                                                     |
| ------------------ | ---------------------------------- | ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular            | Playground                         | `Playground`                       | ✅ covered |                                                                                                                                                                           |
| Angular            | Status and sizes                   | `StatusAndSizes`                   | ✅ covered | Status, sizes and multiple shapes.                                                                                                                                        |
| Angular            | Labels                             | `Labels`                           | ✅ covered | The four positions, focusable, with fundamental-styles' statuses and value (critical/positive, 100%) so the labels compare with theirs.                                   |
| Angular            | Linear, angled and radial filling  | `FillTypes`                        | ✅ covered |                                                                                                                                                                           |
| Angular            | Clickable                          | `Clickable`                        | ✅ covered | One `onClick`: Enter and Space click the indicator (Angular's story also handles Enter itself, see the Angular issues).                                                   |
| fundamental-styles | Sizes                              | `Sizes`                            | ✅ covered | The euro shape in the four sizes and statuses, as theirs.                                                                                                                 |
| fundamental-styles | Fill values                        | `FillValues`                       | ✅ covered |                                                                                                                                                                           |
| fundamental-styles | With label                         | `Labels`                           | ✅ covered |                                                                                                                                                                           |
| fundamental-styles | Linear, radial and angular filling | `FillTypes`                        | ✅ covered | Their radial example masks with a rotated radial gradient; ours with Angular's polygon (same look: a sweep from 12 o'clock).                                              |
| fundamental-styles | Coreographed filling               | `StatusAndSizes` (multiple shapes) | ✅ covered | Their example puts several SVGs, each with its own status, in one indicator; the Angular API fills several paths of one SVG in one status, which is what the story shows. |

### Tests vs. sources

| Source  | Behaviour                                                  | React test                                                                                  | Status     |
| ------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| Angular | Gradient mask at the percentage                            | fills the shape to the percentage with a gradient mask                                      | ✅ covered |
| Angular | Clamping 0–100                                             | clamps the percentage to 0–100                                                              | ✅ covered |
| Angular | Several shapes fill in turn                                | fills multiple shapes one after another                                                     | ✅ covered |
| Angular | Unique gradient and mask ids                               | gives every shape its own gradient and mask ids                                             | ✅ covered |
| Angular | Linear directions                                          | fill direction: lineardown, linearup and linearleft                                         | ✅ covered |
| Angular | Angled vectors                                             | angled fill follows the angle (defaulting to 270)                                           | ✅ covered |
| Angular | Radial polygon, clockwise and counterclockwise, full shape | radial fill masks the shape …; … counterclockwise mirrors …; … full shape uses a gradient … | ✅ covered |
| Angular | Label positions                                            | label position before or after the shape, in a row or a column                              | ✅ covered |
| Angular | Status colours                                             | status colours the shape with the element colour and the label with the text colour         | ✅ covered |
| Angular | SVG hidden                                                 | the SVG is hidden from assistive technology                                                 | ✅ covered |
| Angular | Progressbar values, other roles                            | is a progressbar with aria-valuenow …; other roles have no value attributes                 | ✅ covered |
| Angular | Focusable                                                  | is not focusable unless focusable                                                           | ✅ covered |
| Angular | Clickable, Enter and Space                                 | clickable variant shows a pointer …; a clickable, focusable indicator is clicked with …     | ✅ covered |
| Angular | Sizes, label sizes                                         | size sm, md, lg and xl …; labelSize changes the label font size                             | ✅ covered |
| —       | Label gaps per size, RTL                                   | label gaps follow the label size and the direction                                          | ✅ covered |
| —       | Prop spreading, ref (registry convention)                  | passes className, native props and the ref through                                          | ✅ covered |

### Visual comparison

`pnpm visual status-indicator`: 20 cases × 16 combinations, **320/320**. Cases against fundamental-styles' stories
with the same shapes, statuses and values: the four sizes (`Sizes`) and the three fill values (`Fill values`) by
pixels; the four labelled indicators (`With label`) by styles, their shapes by pixels (top and bottom) or styles (left
and right) and their labels by styles with the margins; the small indicator with keyboard focus by pixels. The largest
pixel difference is 1.9% (HC themes, see below). Reviewed by eye in Horizon cozy and compact, LTR and RTL
(`StatusAndSizes`, `Labels`, `FillTypes`, `Clickable`): density changes nothing; in RTL the row of a left or right label
mirrors, and the fills do not (they follow the shape).

| Difference                                                                                 | Cause                                                                                                                    | Resolution                                                                                                                        |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Label in the status text colour (e.g. `#b44f00`) instead of the element colour (`#e76500`) | fundamental-styles colours the label with the element colour, which fails the 4.5:1 text contrast for the 12–18px labels | Kept, as Angular: the text colour of the status meets text contrast (Fiori). `color` ignored in the cases, labels by styles only. |
| Neutral label in `sapTextColor` instead of `sapContent_LabelColor`                         | Angular sets the label colour on the root; fundamental-styles the text colour                                            | Fixed (`text-sap-text-color`). Angular issue.                                                                                     |
| Root font size and line height                                                             | Angular sets `text-sap-font-small-size` and no line height on the root; fundamental-styles `sapFontSize` and `normal`    | Fixed. Angular issue (computed only: the label sets its own size).                                                                |
| Outline of the shape slightly different in HC Black and HC White (up to 1.9%)              | fundamental-styles hard-codes `stroke="#89919A"` on its paths; ours is `sapNeutralElementColor` of the theme             | Kept: the theme colour is the right one in high contrast.                                                                         |
| Left and right labels in RTL                                                               | fundamental-styles shifts them with `transform: matrix(1, 0, 0, 1, ±22, 1)` in RTL, away from the shape                  | Kept: the margin already mirrors; the shift is a fundamental-styles bug.                                                          |
| Shapes of the left and right label examples                                                | fundamental-styles draws them in other view boxes (`0 0 36 25`, `0 0 16 25`), which move the shape inside its box        | Kept: our story uses the shape's own view box; these two compare by styles.                                                       |

**Angular issues** (not fixed there): the root sets the small font size and the label colour where fundamental-styles
has `sapFontSize`, `line-height: normal` and `sapTextColor`, so a neutral label is grey; the Clickable story handles
Enter in its own `(keydown.enter)` and through the component's Enter activation, so Enter adds 40% instead of 20%.
