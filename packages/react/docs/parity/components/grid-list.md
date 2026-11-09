## grid-list

Sources: Angular [`registry/ui/grid-list`](../../../../angular/registry/ui/grid-list/) (itself from
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

### Stories vs. sources

| Source             | Example                                    | React story                                   | Status     | Notes                                                                                                                              |
| ------------------ | ------------------------------------------ | --------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Angular            | Selection modes and item types             | `SelectionModes`                              | ✅ covered | Segmented button for the six modes, items of every type, delete removes; `play` selects the second item with ArrowRight and Space. |
| Angular            | States                                     | `States`                                      | ✅ covered | Unread, error (status and custom footer bar), locked, draft (custom toolbar text, navigated). Texts as fundamental-styles' States. |
| Angular            | Highlight statuses                         | `Statuses`                                    | ✅ covered | success, warning, error, neutral.                                                                                                  |
| Angular            | Layout patterns                            | `Layout`                                      | ✅ covered | `layoutPattern`, `layoutItemPattern`, fixed width, auto height, no padding.                                                        |
| Angular            | Filter bar, more button and footer         | `More`                                        | ✅ covered | `play` loads two more items.                                                                                                       |
| Angular            | Groups                                     | `Group`                                       | ✅ covered | Removing the "Grouped by" filter removes the group headers.                                                                        |
| Angular            | Focusing an item programmatically          | `FocusProgrammatically`                       | ✅ covered | Through `actionsRef.focusItem()`; `play` focuses the last item.                                                                    |
| Angular            | Heading level                              | `HeadingLevel`                                | ✅ covered | Title bar 3, group header 4, item titles 5.                                                                                        |
| fundamental-styles | Selection: None mode                       | `SelectionNone`                               | ✅ covered | Four contacts as fundamental-styles' Selection examples.                                                                           |
| fundamental-styles | Selection: Multi select mode               | `SelectionMulti`                              | ✅ covered | Items 1 and 3 selected.                                                                                                            |
| fundamental-styles | Selection: Single select mode              | `SelectionSingle`                             | ✅ covered | fundamental-styles hides a radio in the card; Angular's `singleSelect` has no control (the card selects).                          |
| fundamental-styles | Selection: Single select left / right mode | `SelectionSingleLeft`, `SelectionSingleRight` | ✅ covered | Item 2 selected.                                                                                                                   |
| fundamental-styles | Delete mode                                | `DeleteMode`                                  | ✅ covered |                                                                                                                                    |
| fundamental-styles | States                                     | `States`                                      | ✅ covered |                                                                                                                                    |
| fundamental-styles | Highlight                                  | `Statuses`                                    | ✅ covered | fundamental-styles' positive, critical, negative, neutral are success, warning, error, neutral.                                    |
| fundamental-styles | Group                                      | `Group`                                       | ✅ covered |                                                                                                                                    |
| fundamental-styles | Filter Infobar, Footer                     | `FilterAndFooter`                             | ✅ new     | fundamental-styles' texts, for the visual cases.                                                                                   |
| fundamental-styles | "More" Button                              | `MoreButton`                                  | ✅ new     | `[ 5 / 10 ]` after four contacts, for the visual cases.                                                                            |
| fundamental-styles | No height / Partial Items                  | `Layout`                                      | ✅ covered | Auto height and fixed widths.                                                                                                      |

Story differences from Angular: avatars are `GridListItemImage render={<Avatar … />}`; the States texts follow
fundamental-styles (capitalised group titles, 0.875rem below the address as its examples); the title bars of the
fundamental-styles-like examples carry its sort, filter and group buttons.

### Tests vs. sources

| Source  | Behaviour                                          | React test                                                                                               | Status     |
| ------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| Angular | Grid semantics when selectable, list otherwise     | uses grid semantics when selectable and list semantics otherwise                                         | ✅ covered |
| Angular | One tab stop, arrows by row, Home, End             | keeps a single tab stop and moves focus with the arrow keys by row                                       | ✅ covered |
| Angular | Space selects, Shift+click ranges                  | selects with Space and ranges with Shift+click in multi selection                                        | ✅ covered |
| Angular | Enter into the item, Escape back                   | moves into an item with Enter and back with Escape; F2 toggles                                           | ✅ covered |
| Angular | Switching to single selection keeps one            | keeps at most one selected item when switching to single selection, none without selection               | ✅ covered |
| Angular | Press on Space without selection                   | emits press on Space without selection mode                                                              | ✅ covered |
| Angular | Shift+Arrow and Shift+End                          | extends the selection with Shift+Arrow and Shift+End in multi selection                                  | ✅ covered |
| Angular | Delete buttons                                     | shows a delete button per item in delete mode that emits delete                                          | ✅ covered |
| Angular | Radios in single selection left/right              | shows a radio per item in single selection with a radio and selects on click                             | ✅ covered |
| Angular | Title bar heading, level, additional title         | the title bar is a heading with aria-level from headingLevel and contains the additional title           | ✅ covered |
| Angular | Group header heading level                         | the group header uses its headingLevel (default 3) and aria-label                                        | ✅ covered |
| Angular | State actions and status label                     | state items show their state actions and statuses expose a status label                                  | ✅ covered |
| Angular | Detail, draft, locked buttons without card click   | detail, draft and locked buttons emit their callbacks without a card click                               | ✅ covered |
| Angular | Navigation counter, indicator, navigate            | navigation items show the counter and indicator and emit navigate on click                               | ✅ covered |
| —       | RTL arrows                                         | swaps ArrowLeft and ArrowRight in RTL                                                                    | ✅ new     |
| —       | Single selection by the card                       | selects the item itself on click and Space in single selection, without a control                        | ✅ new     |
| —       | Imperative actions                                 | clears the selection and focuses items through actionsRef                                                | ✅ new     |
| —       | Controlled and uncontrolled                        | is controlled by value and uncontrolled with defaultValue                                                | ✅ new     |
| —       | Item `selected` sync                               | takes an item's selected prop into an uncontrolled list's selection                                      | ✅ new     |
| —       | Items without value                                | selects items without a value by their id                                                                | ✅ new     |
| —       | Tab stop after removal                             | moves the tab stop to an existing item when the active one is removed                                    | ✅ new     |
| —       | Layout patterns                                    | parses layout patterns into column spans; lays out items per row …; stretches items to the row height …  | ✅ new     |
| —       | Press with index and value, `disableToolbarClick`  | active items emit press with their index and value; disableToolbarClick ignores toolbar clicks           | ✅ new     |
| —       | Filter bar, more button, footer                    | filter bar, more button and footer activate with click, Enter and Space                                  | ✅ new     |
| —       | Rows outside a list                                | rows have no roles outside a list                                                                        | ✅ new     |
| —       | Unread, navigated                                  | unread items are bold; a navigated interactive item shows the indicator                                  | ✅ new     |
| —       | RTL navigation arrow                               | the navigation arrow is mirrored once in RTL                                                             | ✅ new     |
| —       | Native props, className, ref, `render`, slot order | passes native props, className and ref to the list and to the item column; id and aria-label to the card | ✅ new     |
| —       | Standalone item                                    | a standalone item is focusable and shows its selected prop                                               | ✅ new     |

### Visual comparison

`pnpm visual grid-list`: 23 cases × 16 combinations, **344/368** matching; the 24 others are one difference kept on
purpose (fundamental-styles is wrong in RTL, below). Run per theme (`--only=<theme>`) on a busy machine: 86/92 in
each of Horizon, Horizon Dark, Horizon HC Black and Horizon HC White. Our States, Selection, Highlight, "More"
button, Filter info bar and Footer stories show fundamental-styles' contact cards and texts, so the parts compare
by pixels: the item toolbar row (counter, navigation arrow), the delete button, the header (title and description),
the content (address and e-mail), the locked and draft actions, the highlights, the group header, the title bar
title, the filter info bar, the footer and the more button (rest and hover). Whole cards (unread navigation item at
rest, hovered and focused; an inactive card; a selected navigation and a selected inactive card in multi
selection), the error status, the title bar and the highlights compare by computed styles: fundamental-styles'
avatars are a photo, its error text is "(Contains errors)" and its Highlight cards hold other content.

| Difference                                                                              | Cause                                                                                                                                                     | Resolution                                                                                                                                |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Item title in 72-Bold instead of the regular 72 (all themes)                            | Angular's title uses `font-sap-font-header-family`; fundamental-styles' item title is in `--sapFontFamily`, weight normal                                 | Fixed: `font-sap-font-family`. Angular issue.                                                                                             |
| Title bar text in the label colour (`#556b82` in Horizon) instead of the text colour    | Angular's title bar puts the title in a toolbar label; fundamental-styles' is plain text in the toolbar                                                   | Fixed: the label gets `text-sap-text-color`. Angular issue.                                                                               |
| Group headers after items 0.75rem too high                                              | fundamental-styles' group headers have a 0.75rem top margin except the first (`--no-margin`); Angular's have none                                         | Fixed: a 0.75rem top margin after anything but the title bar, filter bar or another group header. Angular issue.                          |
| Item toolbar row and filter bar: `min-height` 0 instead of 44px / 32px                  | fundamental-styles' toolbars set a minimum height, Angular only the height                                                                                | Fixed (computed styles only, not visible).                                                                                                |
| Navigation arrow points to the end in RTL (seen by eye; within the pixel tolerance)     | Angular turns the arrow with `rtl:rotate-180`, but the icon already mirrors `navigation-right-arrow` in RTL                                               | Fixed: no turn on the wrapper; a test checks it. Angular issue.                                                                           |
| Highlight corners in RTL: fundamental-styles rounds the inner (left) corners of the bar | fundamental-styles moves the bar to the start edge in RTL but keeps `border-radius` on the left corners; ours rounds the outer (start) corners, as in LTR | Kept: fundamental-styles is wrong in RTL (3 cases × 8 RTL combinations, the 24 mismatches).                                               |
| Title bar 44px high in cozy (fundamental-styles 32px)                                   | fundamental-styles' examples hard-code `is-compact` on the title bar toolbar                                                                              | Kept: ours follows the density, as Angular and SAPUI5's grid list header toolbar. Compared without height and padding.                    |
| Selection example cards 12px taller in cozy                                             | fundamental-styles hard-codes `is-compact` on the item toolbar rows of its Selection examples (its States examples have both)                             | Kept: the toolbar row follows the density (44px cozy, 32px compact, as fundamental-styles without `is-compact`). Compared without height. |
| Avatar `flex-shrink: 0` (fundamental-styles 1)                                          | Angular's `shrink-0`                                                                                                                                      | Kept: not visible, the header next to it leaves the avatar its 3.75rem.                                                                   |
| Filter bar `cursor: pointer` (fundamental-styles `auto`)                                | The bar removes the filter on click (Angular)                                                                                                             | Kept: it is clickable.                                                                                                                    |

Not compared by the script: the focus frame of a card (a `::before`; checked by eye against fundamental-styles'),
and the check boxes and radio buttons, which are the ported Checkbox and Radio with their own comparisons
(fundamental-styles' Selection examples draw them compact whatever the density).

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Selection: multiple, Selection: single with the radio at
the end, States with a focused card, Groups, "More" button, Filter info bar and footer.
