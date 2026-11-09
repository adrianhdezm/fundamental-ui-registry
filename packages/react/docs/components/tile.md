## tile

Sources: fundamental-react [Tile](https://github.com/SAP/fundamental-react/tree/main/src/Tile) (`Tile` with
`.Header`, `.Content`, `.Footer`) · Angular [`registry/ui/tile`](../../../angular/registry/ui/tile/) (`tile.ts`,
`numeric-content.ts`) · fundamental-styles
[Generic Tiles](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-generic-tiles--docs) and
[Numeric Content](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-dev-numeric-content--docs)
Registry: `registry/ui/tile/` (`tile.tsx`, `numeric-content.tsx`), on Base UI's `useRender`.

API: the Angular directives as components, which read the tile (size, type, action mode), the container (`list`),
the part they are in and the numeric content through React context, as Angular injects them:

- `Tile`: `size` (`'s'`), `double`, `type` (`launch`, `kpi`, `feed`, `slide`, `line`), `action`, `clickable`,
  `disabled`, and `onTileClick` (Angular's `tileClick`). A clickable tile gets `role="button"` (unless `role` is given)
  and `tabIndex={0}` (none when disabled); click, Enter and Space call `onTileClick` (Space on keyup, its keydown only
  stops the scroll; keys pressed on an inner element are left to it). `render={<a href="..." />}` makes a link tile:
  no role or tabindex, `onTileClick` on its (native) click. `disabled` sets `aria-disabled` and, on line tiles, dims
  the tile and turns pointer events off. In action mode a non-line tile renders the 70% overlay as first child.
- `TileContainer` (`list`), `TileHeader`, `TileHeaderContent`, `TileContent`, `TileFooter` (each `twoColumn`),
  `TileSection`, `TileTitleContainer`, `TileTitle`, `TileSubtitle`, `TileContentText`, `TileContentByline`,
  `TileFooterText`, `TileBadge`, `TileProfileImg` (`backgroundImage`, `role="img"`, an `fd-tile-profile-img-…` id),
  `TileLogo` (an `<img>`), `TileBackgroundImg` (`backgroundImage`), `TileSlideContainer`, `TilePageIndicator`,
  `TileDot` (`active`), `TileActionContainer`.
- Buttons: `TileRefresh` (a `<button>` named "Refresh", `glyph`/`glyphFont`), `TileToggle` (`playing`; named "Play" or
  "Pause"), `TileActionClose` ("Remove"), `TileActionIndicator` ("More"). Their names are defaults: `aria-label`
  replaces them.
- Numeric content: `NumericContent` (`size` `l` by default, `m`, `s`; the small tile height in small tiles),
  `NumericContentLaunchIconContainer`, `NumericContentLaunchIcon` (`glyph`, `glyphFont`), `NumericContentKpiContainer`,
  `NumericContentKpi` (`state`, and `glyph` for an icon in the KPI style), `NumericContentScaleContainer`,
  `NumericContentScale` (`state`), `NumericContentScaleArrow` (`glyph`; decorative unless it has an `aria-label`, then
  `role="img"`), `NumericContentScaleText`.

Every part renders its element (a `<div>`; `<span>` for the footer text, profile image, dot, launch icon, arrow and
scale text), passes native props and the `ref` through, merges `className` (and `style` with the background images)
and, except `TileToggle`, `TileActionClose` and `TileActionIndicator`, takes `render` for another element (e.g.
`<TileTitle render={<h3 />}>`, or `<TileRefresh render={<span />} />` for a refresh icon that is not a button).

fundamental-react's props map as follows: `isDouble` is `double`, `size` and `disabled` are kept, `onClick` is the
native `onClick` (still called on every click) or `onTileClick` with `clickable` (fundamental-react tiles were always
`role="button"` and focusable; here only clickable ones are, as in Angular). `Tile.Header`'s children, `subtitle`,
`titleProps` and `subtitleProps` are `TileHeader`'s `title`, `subtitle`, `titleProps` and `subtitleProps`: they
render a `TileTitle` and a `TileSubtitle` before the children (`title` replaces the native attribute on the header).
`Tile.Content`'s `twoColumns` is `twoColumn`, with `TileSection` children instead of cloned `<div>`s. `Tile.Footer`
is `TileFooter`. `backgroundImage` on the tile was unused in fundamental-react; slide tiles take a
`TileBackgroundImg`. `cssNamespace` is gone.

**Differences from Angular, on purpose:**

- Line heights after the font sizes: Angular's title, subtitle, footer text, KPI value and launch icon put
  `leading-[normal]` before their `text-*` size, so `tailwind-merge` drops it (the value then inherits the tile's
  normal line height, so nothing changes on screen). Written in the right order here.
- Shadows as `[box-shadow:var(--sapContent_Shadow0)]` (container and tile), `--sapContent_Shadow2` on hover and the
  HC hover ring as `[box-shadow:0_0_0_0.125rem_var(--sapTile_BorderColor)]`: the `shadow-sap-…` utilities prepend
  Tailwind's transparent ring layers.
- `TileContainer` sets `line-height: normal`, as fundamental-styles' `.fd-tile-container`.
- `NumericContentLaunchIcon` is decorative by default (`aria-hidden`, `role="presentation"`), and with an
  `aria-label` it is `role="img"`, as `Icon`; Angular's sets only the label, on an element without a role.
- `TileRefresh`, `TileToggle`, `TileActionClose` and `TileActionIndicator` render their `<button type="button">`
  themselves (Angular's are attribute components the app puts on a `<button>`).
- Visual fixes from the comparison with fundamental-styles (see below): the KPI value's weight is `lighter` (100,
  `font-thin`) instead of `font-light`; the profile image, page dots and close circle are `rounded-[50%]`; the page
  dots have `min-height`/`min-width` and the active dot the same 0.125rem shadow as the others; the line tile gets
  the HC hover ring of the other tiles instead of `--sapContent_Shadow2`; the action close (on non-line tiles) and
  indicator buttons get the 1px `--sapButton_Lite_BorderColor` border of fundamental-styles' transparent buttons
  (visible in HC; transparent on hover), and the close glyph `line-height: 1`.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                        | Cause                                                                                                                                                                                                      | Resolution                                                                                                                              |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Line tiles 2px wider; border 1px → 0                              | fundamental-styles' `.fd-tile--line` sets `border: .0625rem solid var(--fdTile_Border, …)` with `--fdTile_Border` itself a full shorthand: the declaration is invalid and the line tiles lose their border | Kept: the 1px tile border (transparent in Horizon, the HC tile border in HC), as Angular and the other tiles. Border and width ignored. |
| Line action close: no circle border in fundamental-styles         | Its `border: var(--sapButton_BorderColor)` is invalid too                                                                                                                                                  | Kept: the button border on the circle, as Angular (visible in HC only, 1.7-3.5% of pixels); compared by computed styles.                |
| Line action indicator glyph 3px off-centre                        | fundamental-styles' action-mode rule sets `display: block` on the compact button, so the 1rem glyph overflows the 1.625rem button to the end                                                               | Kept: centred, as Angular. Indicator and action container by computed styles.                                                           |
| Focused launch/KPI/feed/slide tile: browser outline → SAP outline | fundamental-styles has no focus style for these tiles (only line tiles have one)                                                                                                                           | Kept: Angular's SAP focus outline inside the border (`outline-sap`, offset -3px); outline ignored in that case. Line tiles match.       |
