## grid-list

Sources: Angular [`registry/ui/grid-list`](../../../angular/registry/ui/grid-list/) (itself from
`@fundamental-ngx/core`'s `fd-grid-list`) · no fundamental-react source · fundamental-styles
[Components/Grid List](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-grid-list-grid-list--docs)
and [Grid List/Selection](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-grid-list-selection--docs).
Registry: `registry/ui/grid-list/`: `GridList`, `GridListItem` with `GridListItemImage`, `GridListItemBody`,
`GridListItemToolbar` and `GridListItemFooterBar`, and the full-width rows `GridListTitleBar` (with
`GridListTitleBarSpacer`), `GridListGroupHeader`, `GridListFilterBar`, `GridListMoreButton` and `GridListFooter`. It
builds on the ported Button, Checkbox, Radio, Icon, ObjectStatus and Toolbar; the image and body parts are on Base
UI's `useRender`. Base UI has no grid list primitive, so the selection, roles and keyboard handling are Angular's,
rewritten.

API, as Angular's:

| Angular                                                                                                                                                                                                                                          | React                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `fd-grid-list`                                                                                                                                                                                                                                   | `<GridList>` (a `<div>`; native props, `className` and `ref` on it)                                          |
| `selectionMode` (`none`, `multiSelect`, `singleSelect`, `singleSelectLeft`, `singleSelectRight`, `delete`)                                                                                                                                       | `selectionMode` (same values, default `none`)                                                                |
| `layoutPattern` (default `XL4-L3-M2-S1`)                                                                                                                                                                                                         | `layoutPattern` (same); `parseGridListLayout()` is exported as in Angular                                    |
| `width`, `ariaLabel`, `id`                                                                                                                                                                                                                       | `width`, `aria-label`, `id` (generated as `fd-grid-list-…`)                                                  |
| `selection` signal + `(selectionChange)` `{ selection, added, removed, index }`                                                                                                                                                                  | `value` / `defaultValue` (values of the selected items) + `onValueChange(value, { added, removed, index })`  |
| `clearSelection()`, `items()[i].focus()`                                                                                                                                                                                                         | `actionsRef`: `clearSelection()`, `focusItem(index)`                                                         |
| `fd-grid-list-item` inputs `value`, `type`, `state`, `status`, `counter`, `navigated`, `title`, `titleLevel`, `description`, `autoHeight`, `noPadding`, `layoutItemPattern`, `width`, `disableToolbarClick`, `ariaLabel`, `ariaLabelledBy`, `id` | `<GridListItem>` props of the same names (`aria-label`, `aria-labelledby`)                                   |
| item labels `detailsLabel`, `deleteLabel`, `lockedLabel`, `draftLabel`, `errorLabel`, `counterLabel(count)`, `statusLabel(status)`                                                                                                               | the same props, same defaults                                                                                |
| item `selected` input                                                                                                                                                                                                                            | `selected`: taken into an uncontrolled list's selection whenever it changes; shown by an item outside a list |
| item outputs `press`, `detail`, `delete`, `navigate`, `cardClick`, `draft`, `locked` (`{ index, value }`)                                                                                                                                        | `onPress`, `onDetail`, `onDelete`, `onNavigate`, `onCardClick`, `onDraft`, `onLocked` (`{ index, value }`)   |
| `[fd-grid-list-item-image]`, `[fd-grid-list-item-body]` directives                                                                                                                                                                               | `<GridListItemImage render={<Avatar … />} />`, `<GridListItemBody>` (`render` for e.g. an `<img>`)           |
| `fd-grid-list-item-toolbar`, `fd-grid-list-item-footer-bar`                                                                                                                                                                                      | `<GridListItemToolbar>`, `<GridListItemFooterBar>`                                                           |
| `fd-grid-list-title-bar` (`title`, `headingLevel`, `[fd-grid-list-title-bar-additional-title-item]`)                                                                                                                                             | `<GridListTitleBar title headingLevel additionalTitle>`; children follow the title                           |
| `fd-grid-list-title-bar-spacer`                                                                                                                                                                                                                  | `<GridListTitleBarSpacer>`                                                                                   |
| `fd-grid-list-group-header` (`headingLevel`, `ariaLabel`)                                                                                                                                                                                        | `<GridListGroupHeader headingLevel aria-label>`                                                              |
| `fd-grid-list-filter-bar` (`removeLabel`, `(close)`)                                                                                                                                                                                             | `<GridListFilterBar removeLabel onClose>`                                                                    |
| `fd-grid-list-more-btn` (`title`, `displayCount`, `totalCount`, `(showMore)`)                                                                                                                                                                    | `<GridListMoreButton title displayCount totalCount onShowMore>`                                              |
| `fd-grid-list-footer`                                                                                                                                                                                                                            | `<GridListFooter>`                                                                                           |

Behaviour, ARIA and keyboard, as Angular's: a selectable list is a `grid` (`aria-multiselectable` in multi
selection) whose items are a `row` with one `gridcell` card (`aria-selected`), and whose full-width rows (title bar,
group header, filter bar, more button, footer) are rows with one cell; otherwise a `list` of `listitem`s. One card
is in the tab order (the last focused one); ArrowLeft and ArrowRight move to the previous and next item (swapped in
RTL), ArrowUp and ArrowDown to the closest item of the row above or below, Home and End to the first and last; Enter
(or F2, F7) moves into the card's interactive elements, which are out of the tab order until then, and Escape (or
F2, F7) back. Space and Enter select (multi selection toggles; Shift with the arrow keys, Home, End or a click on the
check box selects ranges), or press the item without selection. A mode change keeps at most what the new mode allows
and reports it. The check box and radio buttons are the ported Checkbox and Radio, inert (the card carries the
selection), clicked through their wrapper as in Angular.

**Differences on purpose:**

- One source of truth for the selection: the list's `value` (controlled) or its own state (uncontrolled, from
  `defaultValue`). An item's `selected` prop is taken into an uncontrolled list's selection when it is defined and
  whenever it changes, as Angular's `sync`; a controlled list ignores it (its `value` decides). Items without a
  `value` are selected by their id (Angular: by the item instance).
- Angular finds the items with `contentChildren`; React registers each card with the list and orders them by their
  place in the DOM, so items in fragments or wrapper components work. The tab stop is kept on the cards' `tabindex`
  attributes, also when items are added or removed.
- The parts of an item are recognised among its direct children by component type (as `layout-panel`); other
  children are body content.
- Native props of `GridListItem` go to its column (`className`, `style`, `ref`, data attributes), as Angular's host;
  `id`, `aria-label` and `aria-labelledby` go to the card, as Angular's inputs.
- Fixes of visual differences found in the comparison (also Angular issues): the item title uses the SAP font
  (`72`, regular) instead of the header font (`72-Bold`); the title bar text is in the text colour instead of the
  toolbar label colour; group headers after items get fundamental-styles' 0.75rem top margin; the navigation arrow is
  not turned a second time in RTL (the icon mirrors it already). The card and more
  button shadows are written as `[box-shadow:var(--sapContent_Shadow0)]` (and the hover, selection and focus shadows
  likewise), without Tailwind's ring layers. The item toolbar row and the filter bar also get their height as
  `min-height` (as fundamental-styles' toolbars).

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                              | Cause                                                                                                                                                     | Resolution                                                                                                                                |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Highlight corners in RTL: fundamental-styles rounds the inner (left) corners of the bar | fundamental-styles moves the bar to the start edge in RTL but keeps `border-radius` on the left corners; ours rounds the outer (start) corners, as in LTR | Kept: fundamental-styles is wrong in RTL (3 cases × 8 RTL combinations, the 24 mismatches).                                               |
| Title bar 44px high in cozy (fundamental-styles 32px)                                   | fundamental-styles' examples hard-code `is-compact` on the title bar toolbar                                                                              | Kept: ours follows the density, as Angular and SAPUI5's grid list header toolbar. Compared without height and padding.                    |
| Selection example cards 12px taller in cozy                                             | fundamental-styles hard-codes `is-compact` on the item toolbar rows of its Selection examples (its States examples have both)                             | Kept: the toolbar row follows the density (44px cozy, 32px compact, as fundamental-styles without `is-compact`). Compared without height. |
| Avatar `flex-shrink: 0` (fundamental-styles 1)                                          | Angular's `shrink-0`                                                                                                                                      | Kept: not visible, the header next to it leaves the avatar its 3.75rem.                                                                   |
| Filter bar `cursor: pointer` (fundamental-styles `auto`)                                | The bar removes the filter on click (Angular)                                                                                                             | Kept: it is clickable.                                                                                                                    |
