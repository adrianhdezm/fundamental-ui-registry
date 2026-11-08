## flexible-column-layout

Sources: fundamental-react: none · Angular
[`registry/ui/flexible-column-layout`](../../../../angular/registry/ui/flexible-column-layout/) · fundamental-styles
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

### Stories vs. sources

| Source  | Example                                 | React story           | Status     | Notes                                                                                     |
| ------- | --------------------------------------- | --------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| Angular | List, detail and detail-detail          | `Default`             | ✅ covered | 25rem high (Angular's is 24rem), as fundamental-styles' examples.                         |
| Angular | Three columns, transparent separators   | `ThreeColumns`        | ✅ covered | Below 1280px (the Storybook canvas) it shows ThreeColumnsStartMinimized, as Angular's.    |
| Angular | Custom layout widths                    | `CustomConfig`        | ✅ covered | `FlexibleColumnLayoutConfigProvider`.                                                     |
| Angular | With dynamic page                       | `WithDynamicPage`     | ✅ covered |                                                                                           |
| —       | fundamental-styles Three Columns Layout | `ThreeColumnsExample` | ✅ added   | ThreeColumnsMidExpanded, 25rem, `lgBreakPoint` 1024 so that three columns show at 1248px. |

The layout is not an overlay, so there is no "Open: …" story.

### Tests vs. sources

| Source  | Behaviour                                                   | React test                                                                                                          | Status     |
| ------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------- |
| Angular | Widths per layout, hidden columns aria-hidden and invisible | each layout sets the start/mid/end widths from the layout definitions; hidden columns are aria-hidden and invisible | ✅ covered |
| Angular | Separators between visible columns, arrows, RTL mirroring   | separators appear only between visible columns with the right arrow direction (mirrored in RTL)                     | ✅ covered |
| Angular | Separator and its button switch the layout, `layoutChange`  | clicking a separator or its button switches to the next layout and calls onLayoutChange                             | ✅ covered |
| Angular | Start separator of ThreeColumnsMidExpanded                  | the start separator switches ThreeColumnsMidExpanded to ThreeColumnsEndMinimized                                    | ✅ covered |
| Angular | Start button labels                                         | expandTitleStartBtn and collapseTitleStartBtn label the start separator button                                      | ✅ covered |
| Angular | Keyboard                                                    | the separator buttons are keyboard operable                                                                         | ✅ covered |
| Angular | Below `smBreakPoint`: one column, restored                  | below smBreakPoint 2/3 column layouts collapse to one full-screen column and restore when wide again                | ✅ covered |
| Angular | Between the break points, above `lgBreakPoint`              | between sm and lg three-column layouts reduce to two columns; above lg TwoColumnsEndExpanded becomes three columns  | ✅ covered |
| Angular | A layout chosen while narrow                                | a layout chosen while narrow replaces the one to restore                                                            | ✅ covered |
| Angular | `provideFlexibleColumnLayoutConfig`                         | FlexibleColumnLayoutConfigProvider overrides some widths and keeps the defaults                                     | ✅ covered |
| Angular | `backgroundDesign`, high contrast                           | backgroundDesign solid/translucent/transparent, including high contrast                                             | ✅ covered |
| —       | `layoutDefinitions` over the provider                       | layoutDefinitions overrides the widths of the provider                                                              | ✅ new     |
| —       | Button size per density                                     | separator buttons are 1.5rem wide, 2rem high (1.625rem in compact)                                                  | ✅ new     |
| —       | Column borders, RTL, high contrast                          | columns have borders next to the separators, none in high contrast                                                  | ✅ new     |
| —       | Uncontrolled                                                | is uncontrolled with defaultLayout and still adapts to the width                                                    | ✅ new     |
| —       | Prop spreading                                              | passes className, native props and the ref to the root                                                              | ✅ covered |

### Visual comparison

`pnpm visual flexible-column-layout`: 11 cases × 16 combinations, 148/176 matching; the 28 others are the two
differences kept below (RTL only). The flexible column layout is a layout in fundamental-styles
(`sap-design-layouts-flexible-column--*`, 25rem high with empty columns). Cases: the layout, the start and mid columns
by computed style (from `Default`, against Three Columns Layout; widths follow the canvas); the solid separator at rest
and hovered and its button at rest, hovered and focused by pixels (from `ThreeColumnsExample`, whose separators sit on
whole pixels as fundamental-styles'); the translucent separator (`CustomConfig` against One Columns Layout) and both
transparent separators (`ThreeColumns` against Two Columns Layout) by pixels.

| Difference                                                              | Cause                                                                                                                            | Resolution                                                                                                                                                    |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separator buttons 26px high and 32px wide in both densities             | Angular's `data-density="compact"` on the button: its compact height and `compact:min-w-8` win over `h-8 w-6 min-w-6`            | Fixed: no density on the button, `compact:min-w-6 compact:px-0`; 32×24px cozy and 26×24px compact, as fundamental-styles. An Angular issue (by its classes).  |
| Column borders in high contrast                                         | fundamental-styles has no column borders in Horizon HC Black and HC White                                                        | Fixed: `hc:border-x-0`. An Angular issue.                                                                                                                     |
| Separator gradient lines interpolated in oklab                          | Tailwind's `bg-linear-to-*` adds `in oklab`; fundamental-styles' `linear-gradient` interpolates in sRGB                          | Fixed before the first run: `[background-image:linear-gradient(…)]` on `--sapHighlightColor`, as in dynamic-page. An Angular issue (by its classes).          |
| Separator with `cursor: pointer`                                        | The whole separator is a click target (Angular); fundamental-styles' separator is not clickable                                  | Kept: the cursor shows the larger click target; not visible at rest. `cursor` is not compared on the separators.                                              |
| Separator arrows in RTL (3.8–5.3% of the 24×32 button, 24 combinations) | Our `slim-arrow-*` glyphs are mirrored in RTL (icon component); fundamental-styles' are not                                      | Kept: in RTL the start column is on the right, so the arrow that expands it points left. Angular mirrors them too.                                            |
| Start column border on the other side in RTL (computed, 4 combinations) | fundamental-styles sets physical `border-left`/`border-right` and removes the left border of the first column in both directions | Kept: our logical borders mirror, so the border stays next to the separator in RTL (fundamental-styles puts it on the outer edge). HC has no borders (above). |

Not compared: the hidden column (`invisible h-0`, no border; fundamental-styles' `--hidden` modifier is equivalent) and
the column width rules (above).

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: `Default`, `ThreeColumns` and `WithDynamicPage`.
