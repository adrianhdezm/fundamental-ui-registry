## overflow-layout

Sources: fundamental-react: none · Angular [`registry/ui/overflow-layout`](../../../../angular/registry/ui/overflow-layout/) ·
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

Tabs and breadcrumb (not ported yet) build on it: Angular's tabs use `ariaRole="tablist"`, `enableKeyboardNavigation
false`, `showMoreButton` (`renderShowMoreButton`) and a menu in `renderMore`; the breadcrumb uses
`showMorePosition="left"` with a link and a menu in `renderMore`.

### Stories vs. sources

| Source  | Example                                             | React story             | Status     | Notes                                                                                                                                  |
| ------- | --------------------------------------------------- | ----------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Angular | Resizable                                           | `Default` ("Resizable") | ✅ covered | Resizable frame, add/remove, max 3 visible, hidden count.                                                                              |
| Angular | Forced visibility, start position and custom "more" | `AlwaysVisible`         | ✅ covered | `renderMore` for `fdOverflowExpand`.                                                                                                   |
| Angular | Click to show                                       | `ClickToShow`           | ✅ covered |                                                                                                                                        |
| Angular | Avatar group                                        | `AvatarGroup`           | ✅ covered | The business card is a stand-in (bar header, title, link) until the quick view is ported; avatars show a photo or an icon, as Angular. |
| Angular | Open: more popover                                  | `OpenMore`              | ✅ covered |                                                                                                                                        |
| Angular | Open: click to show                                 | `OpenClickToShow`       | ✅ covered |                                                                                                                                        |
| Angular | Open: avatar group                                  | `OpenAvatarGroup`       | ✅ covered |                                                                                                                                        |
| —       | —                                                   | `Playground`            | ➕ added   | The props as controls, on twelve info labels.                                                                                          |

### Tests vs. sources

| Source  | Behaviour                                                                                          | React test                                                                                                 | Status     |
| ------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| Angular | Items that fit, maxVisibleItems, "N more" popover named like its button, hidden flag, global index | shows as many items as fit in the row (and at most maxVisibleItems); the rest go into the "N more" popover | ✅ covered |
| Angular | forceVisibility, hiddenChange on moves, forced item stays when narrower                            | forceVisibility keeps an item visible; onHiddenChange is called on moves                                   | ✅ covered |
| Angular | showMorePosition left, reverseHiddenItems                                                          | showMorePosition left overflows from the start; reverseHiddenItems reverses the popover order              | ✅ covered |
| Angular | Custom fdOverflowExpand gets the hidden items                                                      | renderMore (custom "more" control) receives the hidden items                                               | ✅ covered |
| Angular | visibleItemsCount / hiddenItemsCount / hiddenItemsChange after resizes and item changes            | onVisibleItemsCountChange / onHiddenItemsCountChange / onHiddenItemsChange report resizes and item changes | ✅ covered |
| Angular | Arrow keys between visible items, RTL                                                              | arrow keys move focus between visible focusable items (RTL aware)                                          | ✅ covered |
| Angular | triggerRecalculation                                                                               | triggerRecalculation re-measures after content changes                                                     | ✅ covered |
| Angular | Re-measures by itself on item width changes                                                        | re-measures by itself when the items change width, without triggerRecalculation                            | ✅ covered |
| Angular | A click in the popover forces visibility and moves the item                                        | moves a hidden item out of the popover when a click forces its visibility                                  | ✅ covered |
| —       | enableKeyboardNavigation false (used by tabs and breadcrumb)                                       | enableKeyboardNavigation false leaves the arrow keys to the items                                          | ✅ covered |
| —       | renderShowMoreButton false (used by tabs)                                                          | showMoreButton false hides the overflowing items without a "more" control                                  | ✅ covered |
| —       | Plain children, item context for nested components                                                 | plain children are items; useOverflowItem gives nested components the item context                         | ✅ covered |
| —       | Prop spreading, ref (registry convention)                                                          | passes className, native props and the ref to the root (registry convention)                               | ✅ covered |

### Visual comparison

`pnpm visual overflow-layout`: 8 cases × 16 combinations, 120/128 matching; the 8 differences have one cause, in the
avatar (below). fundamental-styles has no overflow layout, so the parts the layout renders are compared with the
components they are made of: the "more" button at rest, on hover and with keyboard focus, its text and its arrow
(pixels) against the transparent menu button of fundamental-styles' Menu Button story; the first info label of the row
against Color Flavors; and an image and an icon avatar of the avatar group against fundamental-styles' Avatar Group
Overflow story. Texts and photos differ, so all but the arrow are compared by computed style. The popover body is the
popover's (see its report). Cozy and compact, LTR and RTL in Horizon were also checked by eye (Resizable, the forced
visibility story with the start position, Click to show, Avatar group, and the open popovers).

| Difference                                                                                                          | Cause                                                                                                                                                                               | Resolution                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| "More" arrow: font family `72-SemiboldDuplex` against `72` (Horizon and Dark)                                       | The `<i>` of fundamental-styles inherits another font than our icon span; the glyph comes from the icon font either way                                                             | Kept, not visible (pixels match): `font-family` ignored for that case.                                                                   |
| Bordered image avatar (avatar group): border transparent against `--sapGroup_ContentBorderColor` (Horizon, Dark; 8) | The avatar's loaded-image classes (`--sapAvatar_Lite_BorderColor`) come after `border` and win; fundamental-styles' `fd-avatar--thumbnail fd-avatar--border` keeps the group border | Kept here: a difference of the avatar component, not of the layout (fix: let `border` win over the loaded-image border in `avatar.tsx`). |
