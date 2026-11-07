## tile

Sources: fundamental-react [Tile](https://github.com/SAP/fundamental-react/tree/main/src/Tile) (`Tile` with
`.Header`, `.Content`, `.Footer`) · Angular [`registry/ui/tile`](../../../../angular/registry/ui/tile/) (`tile.ts`,
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

### Stories vs. sources

| Source            | Example                  | React story  | Status     | Notes                                                                                                      |
| ----------------- | ------------------------ | ------------ | ---------- | ---------------------------------------------------------------------------------------------------------- |
| fundamental-react | primary                  | `Primary`    | ✅ covered | Same texts; `TileHeader`'s `title`/`subtitle` props; the tile props as controls.                           |
| fundamental-react | subtitle                 | `Subtitle`   | ✅ covered | `TileTitle` and `TileSubtitle` children.                                                                   |
| fundamental-react | sizes                    | `Sizes`      | ✅ covered | Regular, double, small and small double.                                                                   |
| fundamental-react | columns                  | `Columns`    | ✅ covered | "Text in the columns" row: small and double tiles with left and right text.                                |
| fundamental-react | noStyles                 | —            | ➖ n/a     | No `cssNamespace`.                                                                                         |
| Angular           | Sizes and layout         | `Sizes`      | ✅ covered | fundamental-styles' order (regular, double, small, small double); the parts on the information background. |
| Angular           | Two-column sections      | `Columns`    | ✅ covered |                                                                                                            |
| Angular           | KPI tile                 | `KpiTile`    | ✅ covered | Large row as Angular's (KPI icon, value, scale); medium and small rows with fundamental-styles' texts.     |
| Angular           | Launch tile              | `LaunchTile` | ✅ covered | fundamental-styles' texts ("Title", "Subtitle").                                                           |
| Angular           | Clickable and link tiles | `Clickable`  | ✅ covered | Counter of `onTileClick` calls.                                                                            |
| Angular           | Feed tile                | `FeedTile`   | ✅ covered | fundamental-styles' texts.                                                                                 |
| Angular           | Badge tile               | `BadgeTile`  | ✅ covered | Also the small feed tile with a long badge, as fundamental-styles.                                         |
| Angular           | Slide tile               | `SlideTile`  | ✅ covered | Regular and small with fundamental-styles' short title.                                                    |
| Angular           | Line (link) tile         | `LineTile`   | ✅ covered | Floating, list, with badge, action mode with a disabled tile, list in action mode.                         |
| Angular           | Action mode              | `ActionMode` | ✅ covered | Removable launch tiles (regular and small) and a slide tile; Reset.                                        |

### Tests vs. sources

| Source            | Behaviour                                                             | React test                                                                                                 | Status     |
| ----------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Clickable tile: role button, focusable, click/Enter/Space, inner keys | clickable tile is role button, focusable, calls onTileClick on click, Enter and Space (not when the key …) | ✅ covered |
| Angular           | Non-clickable tile: no role, no tabindex, no tileClick                | a non-clickable tile has no role, is not focusable and calls no onTileClick                                | ✅ covered |
| Angular           | Custom role and aria-labelledby                                       | a custom role and aria-labelledby replace the button role                                                  | ✅ covered |
| Angular           | Tab order                                                             | Tab moves through the clickable tile and the link but skips the static tile                                | ✅ covered |
| Angular           | `<a fd-tile>`: link semantics, tileClick on click and Enter           | a link tile keeps the link semantics and calls onTileClick on click                                        | ✅ covered |
| Angular           | Sizes, double width, part heights                                     | size s and double width; header/content/footer heights per size                                            | ✅ covered |
| Angular           | Two-column sections, feed columns                                     | two-column sections; feed tile content columns                                                             | ✅ covered |
| Angular           | Line tiles: floating/list, ellipsis, compact, disabled                | line tile: floating vs list container, title ellipsis, compact heights, disabled                           | ✅ covered |
| Angular           | Line tile in action mode                                              | line tile in action mode shows the action buttons inline and keeps the badge                               | ✅ covered |
| Angular           | Action mode: overlay, close, indicator, hidden footer and badge       | action mode shows the overlay, close and indicator buttons and hides footer and badge                      | ✅ covered |
| Angular           | Slide tile: toggle visibility and label, page dots                    | slide tile: toggle button shows on hover/focus/touch, play/pause label; page dots                          | ✅ covered |
| Angular           | Badge position, inline in line tiles, RTL                             | badge position (top end) and inline in line tiles                                                          | ✅ covered |
| Angular           | Numeric content sizes, small tile, states, RTL                        | numeric content sizes l/m/s, small-tile sizes, state colors, RTL value direction                           | ✅ covered |
| Angular           | Scale arrow decorative unless labelled                                | scale arrow is decorative unless it has a label                                                            | ✅ covered |
| Angular           | Refresh button name and click                                         | the refresh button in the footer has an accessible name and calls its onClick                              | ✅ covered |
| fundamental-react | Prop spreading (Tile, Header, Content, Footer), ref, onClick          | spreads native props, merges className and forwards the ref of the tile and its parts (fundamental-react)  | ✅ covered |
| fundamental-react | Header `titleProps`/`subtitleProps`, subtitle                         | header renders the title and subtitle props with their own props (fundamental-react)                       | ✅ covered |
| —                 | Title line clamp (2, 4 in a header-content), header-content height    | title clamps to two lines, four in a combined header and content                                           | ✅ covered |
| —                 | Launch icon, profile image and logo per tile size                     | launch icon, profile image and logo sizes per tile size                                                    | ✅ covered |

### Visual comparison

`pnpm visual tile`: 71 cases × 16 combinations, 1136/1136 matching. Cases against fundamental-styles' Generic Tiles
stories: the four sizes and the two-column header, content, footer and section (Generic Tile Content Columns); the
launch tile and its header, two-column footer with the refresh button, launch icon and its container, numeric
content, KPI value, scale, the small launch tile, the combined header and content (regular and small), the profile
image and the logo (Launch Tile); the four KPI tiles with fundamental-styles' texts, a hovered KPI tile and a focused
tile (KPI Tile); the feed tiles (Feed Tile); the badge, a long badge and a feed tile with a badge (Badge Tile); the
slide tiles, their band, title, footer text, page indicator and dots (Slide Tile); the floating and list containers,
line tiles and their headers (floating, list, two lines, with badge), hover, focus, the inline badge, action mode
(tile, action container, close, indicator) and the disabled line tile (Link Tile); the action tile, its overlay, close
button (circle and position) and indicators (Tile in Action Mode). 22 cases also compare pixels (tiles and parts
with the same texts: launch header and footer, refresh, launch icon and its container, scale, small launch tile,
header and content, the KPI and feed tiles, the hovered KPI tile, the page indicator, line headers and the line
badge); the others
compare computed styles, because the texts or images differ (fundamental-styles' KPI value is "1Ñç", its images
are photos, its sizes stories label the parts with class names on a docs colour) or for the reasons below.

| Difference                                                                    | Cause                                                                                                                                                                                                         | Resolution                                                                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| KPI value `font-weight` 300 → 100                                             | Angular's `font-light`; fundamental-styles sets `font-weight: lighter` (100 under a 400 parent). The browser picks the 72 Light face either way                                                               | Fixed: `font-thin`. Angular issue (computed only).                                                                                           |
| Profile image, page dots, close circle radius `9999px` → `50%`                | `rounded-full`; fundamental-styles uses `50%` (the same circle)                                                                                                                                               | Fixed: `rounded-[50%]` (computed only).                                                                                                      |
| Page dots `min-height` 0 → 6px; active dot shadow 0.063rem → 0.125rem         | fundamental-styles sets min sizes on the dots, and its active dot rule does not override the dot shadow (its `--fdSlide_Tile_Indicator_Active_Dot_Shadow` is unused); Angular uses the active shadow variable | Fixed: `min-h-1.5 min-w-1.5`, one shadow for all dots. Angular issue (computed only).                                                        |
| Line tile hover in HC: `--sapContent_Shadow2` instead of the 0.125rem ring    | Angular gives line tiles the Shadow2 hover in every theme; fundamental-styles' `--fdTile_Hover_Box_Shadow` is the border-colour ring in HC, for all tiles                                                     | Fixed: `hc:hover:[box-shadow:0_0_0_0.125rem_var(--sapTile_BorderColor)]` on line tiles. Angular issue (HC only, barely visible).             |
| Action close and indicator: no button border (HC: no ring around the buttons) | fundamental-styles' buttons are compact transparent `fd-button`s, with the 1px `--sapButton_Lite_BorderColor` border (visible in HC); Angular's have none                                                     | Fixed: the lite border (transparent on hover and press), padding `calc(0.5rem - 1px)` on the indicator. Angular issue (HC only).             |
| Close glyph line height normal → 1                                            | `tailwind-merge` drops the icon box's `leading-none` behind `text-[0.75rem]`; fundamental-styles sets `line-height: 1`                                                                                        | Fixed: `leading-none` after the size, and `min-h`/`min-w` 1.375rem as fundamental-styles. Computed only.                                     |
| Line tiles 2px wider; border 1px → 0                                          | fundamental-styles' `.fd-tile--line` sets `border: .0625rem solid var(--fdTile_Border, …)` with `--fdTile_Border` itself a full shorthand: the declaration is invalid and the line tiles lose their border    | Kept: the 1px tile border (transparent in Horizon, the HC tile border in HC), as Angular and the other tiles. Border and width ignored.      |
| Line action close: no circle border in fundamental-styles                     | Its `border: var(--sapButton_BorderColor)` is invalid too                                                                                                                                                     | Kept: the button border on the circle, as Angular (visible in HC only, 1.7-3.5% of pixels); compared by computed styles.                     |
| Line action indicator glyph 3px off-centre                                    | fundamental-styles' action-mode rule sets `display: block` on the compact button, so the 1rem glyph overflows the 1.625rem button to the end                                                                  | Kept: centred, as Angular. Indicator and action container by computed styles.                                                                |
| Focused launch/KPI/feed/slide tile: browser outline → SAP outline             | fundamental-styles has no focus style for these tiles (only line tiles have one)                                                                                                                              | Kept: Angular's SAP focus outline inside the border (`outline-sap`, offset -3px); outline ignored in that case. Line tiles match.            |
| Badge, action close and indicator pixels in HC (7-12%)                        | fundamental-styles' story places its tiles at x = 36.5px, so text and 1px borders are anti-aliased at another sub-pixel offset                                                                                | Not a difference: same computed styles; the feed tile with badge and the line badge match by pixels, the action buttons in Horizon and Dark. |
| Slide toggle not compared                                                     | fundamental-styles' toggle is `display: none` in its story (no hover rule shows it)                                                                                                                           | Checked by the spec (hover, focus, labels) and by eye.                                                                                       |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Sizes and layout, Two-column sections, KPI tile, Launch
tile, Slide tile, Line (link) tile and Action mode.
