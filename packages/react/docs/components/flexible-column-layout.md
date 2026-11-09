## flexible-column-layout

Sources: fundamental-react: none · Angular
[`registry/ui/flexible-column-layout`](../../../angular/registry/ui/flexible-column-layout/) · fundamental-styles
[Flexible Column Layout](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-layouts-flexible-column--docs)
Registry: `registry/ui/flexible-column-layout/`, with the `button` component (separator buttons).

API: one component with the three columns as props, as Angular's `fd-flexible-column-layout` with its
`#startColumn`, `#midColumn` and `#endColumn` templates:

```tsx
<FlexibleColumnLayoutConfigProvider layouts={{ TwoColumnsMidExpanded: { start: 50, mid: 50, end: 0 } }}>
  <FlexibleColumnLayout
    layout={layout}
    onLayoutChange={setLayout}
    backgroundDesign="translucent"
    startColumn={<ProductList />}
    midColumn={<ProductDetail />}
    endColumn={<Supplier />}
  />
</FlexibleColumnLayoutConfigProvider>
```

| Angular                                                                           | React                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `fd-flexible-column-layout` (host element, `class`)                               | `FlexibleColumnLayout`: a `<div>`; native props, `className` and `ref` go to it       |
| `layout` model (`[(layout)]`, `layoutChange`)                                     | `layout` / `defaultLayout` (default `OneColumnStartFullScreen`) / `onLayoutChange`    |
| `backgroundDesign`, `smBreakPoint`, `lgBreakPoint`                                | the same props                                                                        |
| `expandTitle`, `collapseTitle`, `expand/collapseTitleStartBtn`, `…EndBtn`         | the same props                                                                        |
| `layoutDefinitions` (a full definition, default from `FD_FLEXIBLE_LAYOUT_CONFIG`) | `layoutDefinitions`: some layouts, over those of the provider (or the defaults)       |
| `provideFlexibleColumnLayoutConfig({ layouts })`, `FD_FLEXIBLE_LAYOUT_CONFIG`     | `<FlexibleColumnLayoutConfigProvider layouts={…}>`, `useFlexibleColumnLayoutConfig()` |
| `<ng-template #startColumn>`, `#midColumn`, `#endColumn`                          | `startColumn`, `midColumn`, `endColumn` (nodes)                                       |
| `DEFAULT_FLEXIBLE_LAYOUT_CONFIG`, types `FlexibleColumnLayout`, `…Settings`, …    | the same exports, plus `FlexibleColumnLayoutBackgroundDesign`                         |

The behaviour is Angular's: each column takes the width (in percent) of the layout and transitions it (560ms, none
with reduced motion); a column of width 0 is `aria-hidden` and invisible. A separator sits between two visible columns
for the layouts that have one, with a transparent button (`slim-arrow-left` or `-right`, mirrored in RTL) labelled
`collapseTitle` (arrow to the start) or `expandTitle` (arrow to the end), or the start/end button labels when given;
the button (Enter, Space) and the separator around it switch to the next layout. The layout measures its own width
(ResizeObserver): up to `smBreakPoint` (960) two- and three-column layouts become one full-screen column and come back
when there is room again; up to `lgBreakPoint` (1280) three-column layouts reduce to two; above it
TwoColumnsEndExpanded and ThreeColumnsStartMinimized grow back to three columns. A layout chosen while narrow replaces
the one to restore.

**Differences, on purpose:**

- `layoutDefinitions` takes some layouts and is merged over the provider's (Angular's input replaces the whole
  definition); a full definition works the same way.
- Adapting the layout calls `onLayoutChange` (Angular sets its model, which emits `layoutChange` too); with a
  controlled `layout` the layout adapts once the app applies it.
- The separator buttons follow the density of the page: Angular sets `data-density="compact"` on them (see the
  visual comparison).
- Columns have no minimum width, as Angular: fundamental-styles' `min-width: 20rem` would overflow the percent
  widths, which the layout keeps within its break points instead.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                              | Cause                                                                                                                            | Resolution                                                                                                                                                    |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separator with `cursor: pointer`                                        | The whole separator is a click target (Angular); fundamental-styles' separator is not clickable                                  | Kept: the cursor shows the larger click target; not visible at rest. `cursor` is not compared on the separators.                                              |
| Separator arrows in RTL (3.8–5.3% of the 24×32 button, 24 combinations) | Our `slim-arrow-*` glyphs are mirrored in RTL (icon component); fundamental-styles' are not                                      | Kept: in RTL the start column is on the right, so the arrow that expands it points left. Angular mirrors them too.                                            |
| Start column border on the other side in RTL (computed, 4 combinations) | fundamental-styles sets physical `border-left`/`border-right` and removes the left border of the first column in both directions | Kept: our logical borders mirror, so the border stays next to the separator in RTL (fundamental-styles puts it on the outer edge). HC has no borders (above). |
