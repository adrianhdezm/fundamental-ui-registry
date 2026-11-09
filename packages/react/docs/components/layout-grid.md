## layout-grid

Sources: fundamental-react [LayoutGrid](https://github.com/SAP/fundamental-react/tree/main/src/LayoutGrid)
(`Container`, `Row`, `Column`) · Angular [`registry/ui/layout-grid`](../../../angular/registry/ui/layout-grid/) ·
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                             | Cause                                                                                                                                                  | Resolution                                                                                                        |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Rows 16px narrower without inline gutters (no gap, no horizontal gap), columns narrower by their share | fundamental-styles removes the rows' negative margins but keeps their `min-width: calc(100% + 1rem)`, so the row overflows the grid by 1rem at the end | Kept: ours fills the grid symmetrically, as Angular. Width and min-width ignored in those cases, with the reason. |
