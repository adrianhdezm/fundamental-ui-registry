## overflow-layout

Sources: fundamental-react: none · Angular [`registry/ui/overflow-layout`](../../../angular/registry/ui/overflow-layout/) ·
fundamental-styles: none (no overflow layout; its parts are compared with
[Button](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-buttons-button--docs),
[Info Label](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-info-label--docs) and
[Avatar Group](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-avatar-group--docs))
Registry: `registry/ui/overflow-layout/`, on the registry's `Popover` (Base UI's Popover) and `Button`.

API: the Angular inputs as props: `maxVisibleItems`, `showMorePosition` (`left` | `right`), `reverseHiddenItems`,
`enableKeyboardNavigation`, `ariaRole` and `ariaLabel` (on the row of items, not on the root, as Angular), and
`moreItemsButtonText` (`(count) => string`, default `"N more"`). Angular's outputs are `onVisibleItemsCountChange`,
`onHiddenItemsCountChange` and `onHiddenItemsChange`; `triggerRecalculation()` is on `actionsRef`, as other imperative
actions of the registry (list, tokenizer). Native props, `className` and `ref` go to the root `<div>`.

Angular's directives become React parts:

- **Items are the children**, each with a `key`. Any element is an item; wrap one in `OverflowItem` for Angular's
  `*fdOverflowItemRef` + `fdOverflowLayoutItem`: `item` (the data, Angular's `fdOverflowItemRef` value),
  `forceVisibility` (works while the item is hidden, as Angular's `forceVisibility` of the ref), `onHiddenChange`
  (Angular's `hiddenChange` of `fdOverflowLayoutItem`), and `children` as a function of the item context
  (`hidden` — Angular's `$implicit` — `index`, `first`, `last`, `globalIndex`, `item`). `useOverflowItem()` gives the
  same context to components nested in an item (tabs and breadcrumb items can read it without a render function).
- **`renderMore(hiddenItems)`** is Angular's `<ng-template fdOverflowExpand let-hidden>`: a custom "more" control in
  place of the button and popover. The hidden items are `OverflowItemRef`s (`key`, `item`, `globalIndex`, `forced`),
  as `onHiddenItemsChange` reports them.
- **`showMoreButton`** is Angular's `renderShowMoreButton` (renamed: `render…` props are render functions in React).

Behaviour as Angular: items render in one row (`inline-flex`, `shrink-0` items); widths (with margins) are measured
from the DOM and the layout keeps as many items as fit next to the "more" control (96px until it first renders, then
its real width), at most `maxVisibleItems`, forced items first. With `showMorePosition="left"` the control comes first
and items overflow from the start. A `ResizeObserver` re-measures when the layout, the row, an item or the "more"
control changes size; measuring runs in a layout effect, so items that do not fit never paint in the row. The default
control is a transparent menu `Button` ("N more", arrow) that opens a `Popover` (`placement="bottom"`, arrow) whose
body is a dialog named like the button; it lists the hidden items with the row's role (`list` → `listitem`
wrappers). ArrowLeft/ArrowRight move focus between the focusable elements of the visible items (RTL aware, from the
computed direction), and stop at the ends (they never move to the "more" button).

**Differences from Angular, on purpose:**

- The outputs fire when their value changes (and once on mount); Angular emits on every re-measure, also with
  unchanged values.
- The `ResizeObserver` also watches the items and the "more" control: an item that changes width while the row is
  already narrowed, or a "more" label that grows ("9 more" → "10 more"), re-measures without `triggerRecalculation`.
- `onHiddenItemsChange` reports `OverflowItemRef` objects (key, item, index, forced), not directive instances.

Tabs and breadcrumb build on it: Angular's tabs use `ariaRole="tablist"`, `enableKeyboardNavigation
false`, `showMoreButton` (`renderShowMoreButton`) and a menu in `renderMore`; the breadcrumb uses
`showMorePosition="left"` with a link and a menu in `renderMore`.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                    | Cause                                                                                                                   | Resolution                                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| "More" arrow: font family `72-SemiboldDuplex` against `72` (Horizon and Dark) | The `<i>` of fundamental-styles inherits another font than our icon span; the glyph comes from the icon font either way | Kept, not visible (pixels match): `font-family` ignored for that case. |
