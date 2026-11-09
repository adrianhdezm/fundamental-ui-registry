## status-indicator

Sources: fundamental-react: none · Angular [`registry/ui/status-indicator`](../../../angular/registry/ui/status-indicator/)
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                 | Cause                                                                                                                    | Resolution                                                                                                                        |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Label in the status text colour (e.g. `#b44f00`) instead of the element colour (`#e76500`) | fundamental-styles colours the label with the element colour, which fails the 4.5:1 text contrast for the 12–18px labels | Kept, as Angular: the text colour of the status meets text contrast (Fiori). `color` ignored in the cases, labels by styles only. |
| Outline of the shape slightly different in HC Black and HC White (up to 1.9%)              | fundamental-styles hard-codes `stroke="#89919A"` on its paths; ours is `sapNeutralElementColor` of the theme             | Kept: the theme colour is the right one in high contrast.                                                                         |
| Left and right labels in RTL                                                               | fundamental-styles shifts them with `transform: matrix(1, 0, 0, 1, ±22, 1)` in RTL, away from the shape                  | Kept: the margin already mirrors; the shift is a fundamental-styles bug.                                                          |
| Shapes of the left and right label examples                                                | fundamental-styles draws them in other view boxes (`0 0 36 25`, `0 0 16 25`), which move the shape inside its box        | Kept: our story uses the shape's own view box; these two compare by styles.                                                       |
