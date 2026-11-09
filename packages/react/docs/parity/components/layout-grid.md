## layout-grid

Sources: fundamental-react [LayoutGrid](https://github.com/SAP/fundamental-react/tree/main/src/LayoutGrid)
(`Container`, `Row`, `Column`) · Angular [`registry/ui/layout-grid`](../../../../angular/registry/ui/layout-grid/) ·
fundamental-styles [Layout Grid](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-layouts-layout-grid--docs)
Registry: `registry/ui/layout-grid/`, on Base UI's `useRender`.

API: three components, as Angular's `fd-layout-grid`, `fdLayoutGridRow` and `fdLayoutGridCol`:

- `LayoutGrid`: `noGap`, `noHorizontalGap`, `noVerticalGap`. Without explicit `LayoutGridRow` children it wraps its
  children in one row (Angular's `contentChildren(LayoutGridRow)` check, here on the direct children's type; arrays
  count, a component that renders rows does not, as in Angular).
- `LayoutGridRow`: no props; also nests a 12-column row inside a column, as fundamental-styles and fundamental-react
  do.
- `LayoutGridCol`: `span` (Angular's `fdLayoutGridCol` value), `colMd`, `colLg`, `colXl`, `colOffset`,
  `colOffsetMd`, `colOffsetLg`, `colOffsetXl` and `colGrow`, inherited upwards from 600px (md), 1024px (lg) and
  1440px (xl); values outside 1-12 (0-12 for offsets) are ignored. The spans and offsets are CSS variables on every
  column, so nested grids inherit nothing.

All three render a `<div>` (`render` renders another element, Angular's attribute selectors), pass native props
through and merge `className` and `style`. fundamental-react's `Container` is `LayoutGrid` (`noGap` is the same),
`Row` is `LayoutGridRow`, `Column` is `LayoutGridCol`: `span={n}` is the same, the `span`/`offset` objects
(`{ smallScreen, mediumScreen, largeScreen, xLargeScreen }`) are `span`/`colMd`/`colLg`/`colXl` and
`colOffset`/`colOffsetMd`/…, `full` is `colGrow`, and `offsetPosition` is kept.

**Differences from Angular, on purpose:**

- `offsetPosition="after"` (from fundamental-react and fundamental-styles' `fd-col--offset-after-*`) leaves the
  offset after the column (`margin-inline-end`); Angular has no equivalent.
- The grid sets the SAP text typography (`--sapFontFamily`, `--sapFontSize`, line height `normal`, `--sapTextColor`)
  as fundamental-styles' `.fd-container` does; Angular inherits whatever the page has. Only on the grid, so a colour
  or font set on the grid reaches the columns. fundamental-styles' `forced-color-adjust: none` is left out: it is
  inherited and would switch Windows high contrast off for everything inside the grid.
- A growing column keeps growing at a breakpoint unless that breakpoint sets a valid span (Angular checks only that
  the input is set, so `colMd={13}` would give it the 12-column fallback).

**Differences from fundamental-react, on purpose:** `Row` assigned the cells a row leaves free to its columns without
`span` (cloning the children with computed spans). That needs every column to be a direct child and breaks with
wrappers, so it is not ported; `colGrow` on those columns shares the remaining space instead. The results are the
same from 600px on except for rounding (fundamental-react rounds 5 free cells to 3 + 2, `colGrow` gives 2.5 each);
below 600px fundamental-react gives such columns 12 cells each, `colGrow` puts them side by side on the next line.

### Stories vs. sources

| Source            | Example                   | React story                                        | Status     | Notes                                                      |
| ----------------- | ------------------------- | -------------------------------------------------- | ---------- | ---------------------------------------------------------- |
| fundamental-react | differentSizeColumns      | `DifferentSizeColumns`                             | ✅ covered | Texts as fundamental-styles' Different Size Columns.       |
| fundamental-react | responsive                | `Responsive`                                       | ✅ covered | Third grid (6 / md 4 / lg 3 / xl 3).                       |
| fundamental-react | autoSpanAvailableCells    | `AutoAdjusting`                                    | ✅ covered | "Sharing the remaining cells", with `colGrow` (see above). |
| fundamental-react | nesting                   | `Nesting`                                          | ✅ covered | "Nested columns next to other columns".                    |
| fundamental-react | offsetting                | `Offsets`                                          | ✅ covered | Offsets per breakpoint and `offsetPosition="after"`.       |
| fundamental-react | noGap                     | `NoGap`                                            | ✅ covered |                                                            |
| fundamental-react | autoAdjusting             | `AutoAdjusting`                                    | ✅ covered | "In rows": `full` is `colGrow`.                            |
| fundamental-react | noStyles                  | —                                                  | ➖ n/a     | No `cssNamespace`.                                         |
| Angular           | Basic                     | `Basic`                                            | ✅ covered | Its args are the grid props (`noGap`, …) as controls.      |
| Angular           | Responsive                | `Responsive`, `Offsets`                            | ✅ covered | Spans in `Responsive`, the offset grids in `Offsets`.      |
| Angular           | Growing, nesting and rows | `AutoAdjusting`, `Nesting`, `DifferentSizeColumns` | ✅ covered | Growing columns, nested grid, explicit rows.               |
| Angular           | Without gaps              | `NoGap`                                            | ✅ covered | Each variant, and wrapping columns without gaps.           |

### Tests vs. sources

| Source            | Behaviour                                                  | React test                                                                                                   | Status     |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| Angular           | Spans per breakpoint, inherited upwards                    | columns span from the S/M/L/XL props and inherit upwards (600/1024/1440px breakpoints)                       | ✅ covered |
| Angular           | Wrapping, growing column                                   | columns of a row wrap and a growing column takes the remaining space                                         | ✅ covered |
| Angular           | Offsets per breakpoint                                     | offsets per breakpoint                                                                                       | ✅ covered |
| Angular           | Nested grids do not inherit spans                          | nested grids do not inherit the parent spans                                                                 | ✅ covered |
| Angular           | noGap                                                      | noGap removes the gutters                                                                                    | ✅ covered |
| Angular           | Automatic row only without explicit rows                   | adds a row only when the grid has no explicit rows                                                           | ✅ covered |
| Angular           | Invalid spans and offsets                                  | ignores spans and offsets outside 1-12                                                                       | ✅ covered |
| Angular           | colOffsetXl from 1440px                                    | colOffsetXl applies from 1440px                                                                              | ✅ covered |
| Angular           | Input changes                                              | updates span, offset and grow when props change                                                              | ✅ covered |
| Angular           | noHorizontalGap / noVerticalGap                            | noHorizontalGap removes only the inline gutters and noVerticalGap only the block gutters                     | ✅ covered |
| Angular           | User class                                                 | merges a user class onto the column and grid                                                                 | ✅ covered |
| fundamental-react | Row auto-spans columns without `span`                      | growing columns share the cells a spanned column leaves, per breakpoint                                      | ✅ covered |
| fundamental-react | Refs forwarded (Container, Row, Column)                    | passes native props, style, render and the refs to grid, row and column                                      | ✅ covered |
| —                 | `offsetPosition`, RTL, rows in columns, typography (React) | offsetPosition "after" …; offsets follow the reading direction; a row inside a column …; uses the SAP font … | ✅ covered |

### Visual comparison

`pnpm visual layout-grid`: 25 cases × 16 combinations, 400/400 matching. Cases (computed styles with margins and min/max
widths, and box sizes, at a 1280px viewport, i.e. the lg breakpoint): the grid, a row, columns of 12, 11, 1 and 3
(Different Size Columns); a responsive column (Responsiveness); a responsive offset, an offset of 6 and two offsets
after (Offset); a row and a column nested in a column (Nesting); grid, row and column of No Gap, No Horizontal Gap and
No Vertical Gap; growing columns before and after a fixed one (Auto Adjusting). No pixels: the coloured content of the
columns is story decoration (fundamental-styles' docs colours, SAP indication colours here); the grid has no colours
of its own and does not change with theme or density.

| Difference                                                                                             | Cause                                                                                                                                                  | Resolution                                                                                                        |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Rows 16px narrower without inline gutters (no gap, no horizontal gap), columns narrower by their share | fundamental-styles removes the rows' negative margins but keeps their `min-width: calc(100% + 1rem)`, so the row overflows the grid by 1rem at the end | Kept: ours fills the grid symmetrically, as Angular. Width and min-width ignored in those cases, with the reason. |
| Font, size, line height and colour of the columns' text                                                | Angular sets no typography; fundamental-styles sets the SAP text font on `.fd-container`, `.fd-row` and `.fd-col`                                      | Fixed: the SAP text typography on the grid (see the API notes). Angular issue.                                    |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL, at 1280, 800 and 500px: Basic, Offsets and Nesting.
