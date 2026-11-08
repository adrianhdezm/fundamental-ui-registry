## nested-list

Sources: no fundamental-react source · Angular [`registry/ui/nested-list`](../../../../angular/registry/ui/nested-list/)
(with the condensed popover) · fundamental-styles: the `fd-nested-list` styles of its bundle, which no story uses any
more (its Side Navigation stories show the newer `fd-navigation-list`), see the visual comparison.
Registry: `registry/ui/nested-list/`. Base UI has no tree or navigation primitive: the tree pattern, the keyboard and
the selection are ported from Angular; the condensed popover is our `Popover` (Base UI's Popover), the icons our
`Icon`, and `NestedListLink` takes Base UI's `render`. The side navigation will build on it.

API: Angular's directives as components, and its state as a provider:

- `NestedList` (Angular's `fd-nested-list`): `textOnly`, `ariaRoledescriptionTree`, `ariaRoledescriptionMenuBar`,
  `ariaLabelSelected`; native props and the ref go to the `<ul>`. Angular's `id` input is the native `id`.
- `NestedListItem` (`fd-nested-list-item`): `expanded`/`defaultExpanded`/`onExpandedChange` (Angular's `expanded`
  model). Native props go to the `<li>`.
- `NestedListContent` (`fd-nested-list-content`): `selected`; the row of an item with children, a `<div>`.
- `NestedListLink` (`fd-nested-list-link`): `selected`; an `<a>`, or another element with `render` (a router link).
  Angular's `onClickCallback` is the native `onClick`, `ariaDescribedby` the native `aria-describedby`.
- `NestedListTitle`, `NestedListIcon` (`glyph`, `font`), `NestedListHeader` (`id`), `NestedListExpandIcon`, as Angular's.
- `NestedListPopover` (`fd-nested-list-popover`): `title` (the item title by default) and `className` for the body;
  its children are the row (`NestedListContent` or `NestedListLink`) and the child `NestedList` (or
  `PreparedNestedList`), as Angular's two projection slots.
- `NestedListProvider` (Angular's `NestedListState` and `NESTED_LIST_SCOPE`): `condensed`, `selectable` (default
  true) and `scoped`, for an enclosing element with the `data-nested-scope` attribute (`NESTED_LIST_SCOPE_ATTRIBUTE`)
  whose rows the arrow keys move between, e.g. the main and utility lists of a side navigation. A top `NestedList`
  without a provider has a state of its own, as Angular's `provideNestedListState()`.
- `PreparedNestedList` (`fd-prepared-nested-list`): `list` (`NestedListModel`, with `NestedListItemModel` and
  `NestedListLinkModel`, Angular's `NestedListModel`, `NestedListItem` and `NestedListLink` interfaces renamed so they
  do not clash with the components) and `condensed`. Angular's internal `first` input is not needed (the nesting
  tells). The other props go to the top list.

ARIA and keyboard, as Angular: the top list is a `tree` (role description "Navigation List Tree", or "Navigation
List Menu Bar" when condensed), child lists are `group`s, hidden (`aria-hidden`) while their item is collapsed;
items are `role="none"`; the row (a standalone link, or the content row of an item with children) is a `treeitem`
with `aria-level`, `aria-expanded` when it has children, `aria-selected` when items are selectable and
`aria-haspopup="tree"` when it opens a popover; links inside a content row are out of the tab order. Every row is in
the tab order (as Angular). Up and Down move across the visible rows of the scope and wrap, Home and End go to the
first and last, Right opens (Left in RTL), Left closes or, in a popover row, closes the popover and focuses its item;
Enter and Space run the link, which selects the item and its parents. Group headers are `role="presentation"` and
describe the rows after them; condensed lists hide them. Condensed first-level items show their icon only (the title
stays for assistive technology and is the item's `title` tooltip) and hide the expand button. The list in a popover
is a `tree` of its own named by the popover title (the overlay is outside the navigation tree); Right on a condensed
item opens its popover and focuses the first row, a click toggles it, Escape and a click outside close it and reset
`expanded`.

**Differences on purpose:**

- A row is described by the last group header **before** it (`aria-describedby` on the row, the `treeitem`); Angular
  describes every link of a list by the list's last header (so "Home" under "Overview" was described by
  "Administration"), and puts the attribute on the link also when the content row is the focusable element.
- The condensed popover is our `Popover` with Base UI's `Popover`, opened by the item's `expanded` state (no Base UI
  trigger: the row keeps its tree semantics, and a click on it toggles the state). Its body keeps Base UI's
  `role="dialog"`, named by the title (Angular removed the body role); it is rendered at the end of `<body>`, so Base
  UI's visually hidden `aria-owns` element is not a child of the tree (axe `aria-required-children`).
- The collapsed expand arrow is `navigation-right-arrow` in both directions: our `Icon` mirrors it in RTL, so it points
  to the reading direction. Angular picks `navigation-left-arrow` in RTL, which its icon mirrors again (pointing right).
- The first item of a list has no line above it only when no visible header comes before it, as fundamental-styles'
  `:first-child` rule (Angular removes it from the first item after a header too, where fundamental-styles keeps both
  lines). Hidden headers of a condensed list do not count.
- `PreparedNestedList` keeps the expanded state of its items while `condensed` switches between popovers and child
  lists in a `WeakMap` (Angular wrote it back into the model); without a provider, `condensed` also condenses the list
  (Angular's prepared list only switched to popovers).

### Stories vs. sources

| Source            | Example    | React story                                   | Status     | Notes                                                                                                 |
| ----------------- | ---------- | --------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| Angular           | Default    | `Default`                                     | ✅ covered | Headers, icons, the first link selected, Settings expanded, the chosen link shown.                    |
| Angular           | Text only  | `TextOnly`                                    | ✅ covered |                                                                                                       |
| Angular           | From data  | `FromData`                                    | ✅ covered | `PreparedNestedList` on its own.                                                                      |
| Angular           | (side nav) | `Condensed`, `CondensedOpen`, `OpenCondensed` | ✅ covered | The condensed popover, which Angular shows in its side-navigation stories; the Open story uses Right. |
| Angular           | (side nav) | `FromDataCondensed`, `OpenFromDataCondensed`  | ✅ covered | Side navigation's From data, condensed, as a nested list.                                             |
| Angular           | (side nav) | `NotSelectable`                               | ✅ covered | Side navigation's Programmatic state: `selectable={false}`, buttons change `expanded` and `selected`. |
| fundamental-react | —          | —                                             | ➖ n/a     | No fundamental-react source.                                                                          |
| —                 | —          | `Playground`                                  | ✅ covered | The list props as controls.                                                                           |

### Tests vs. sources

| Source  | Behaviour                                                                      | React test                                                                                      | Status     |
| ------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------- |
| Angular | Up on the first row wraps to the last, Down on the last to the first           | wraps ArrowUp on the first row to the last and ArrowDown on the last row to the first           | ✅ covered |
| Angular | Leaf rows: no aria-expanded, ArrowRight ignored                                | gives leaf rows no aria-expanded and ignores ArrowRight on them                                 | ✅ covered |
| Angular | `selected` and `expanded` from outside                                         | reflects selected and expanded set from outside                                                 | ✅ covered |
| Angular | Without a side navigation: scope, role description, keys, selection of parents | works without a side navigation: the arrow keys move within the top list                        | ✅ covered |
| Angular | Condensed: click opens, Escape and outside click close and reset `expanded`    | opens the popover on click when condensed and resets expanded when Escape or an outside click … | ✅ covered |
| Angular | (side nav) Expand button, Left closes, Home/End                                | expands with the button and collapses with ArrowLeft, Home and End jump to the ends             | ✅ covered |
| Angular | (side nav) Enter activates and selects                                         | activates the link with Enter and Space, selecting the item                                     | ✅ covered |
| Angular | (side nav) Trees of rows with levels, described by their group header          | renders trees of rows with levels, described by the group header before them                    | ✅ covered |
| Angular | (side nav) `selectable=false` keeps the `selected` inputs, "Home, Selected"    | keeps the selected props when items are not selectable                                          | ✅ covered |
| Angular | (side nav) Arrow keys across main and utility lists, one selection             | shares the selection between the lists of a scoped provider, and moves across them              | ✅ covered |
| Angular | (side nav) Right opens a popover and focuses its first row, Enter, Left closes | opens the popover with the arrow keys, moves in it and closes it with Left                      | ✅ covered |
| Angular | (side nav) From data, condensed popovers                                       | builds the list from data, with popovers for the first level when condensed                     | ✅ covered |
| —       | RTL keys and placement                                                         | mirrors Right and Left in RTL and opens the popover to the left                                 | ✅ covered |
| —       | Native props, className, refs                                                  | spreads native props, merges className and forwards refs                                        | ✅ covered |
| —       | `render` on the link                                                           | renders the link as another element with render                                                 | ✅ covered |
| —       | Indentation and compact density                                                | indents further levels and uses the compact sizes in the compact density                        | ✅ covered |

### Visual comparison

`pnpm visual nested-list`: 17 cases × 16 combinations, 272/272 matching (the RTL arrow below is within the 3% pixel tolerance). fundamental-styles' Storybook has no story with its `fd-nested-list` styles any
more, so `scripts/visual/nested-list.mjs` writes the reference markup (fundamental-styles' nested-list classes, our
Default, Text only and Not selectable texts) and a Playwright selector engine (`fd-nested-ref=`) puts it into a
fundamental-styles story page, inside the story's density and direction wrappers, where fundamental-styles' own
bundle and theme render it. Cases: the list, the group header, a selected, a resting, a hovered and a focused link,
the icon and the title, the content row of an item with children at rest and hovered, the expand button expanded and
collapsed, a level 2 link and title, and the text-only selected link, title and content row.

| Difference                                              | Cause                                                                                                                      | Resolution                                                                                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Rows have the list background at rest                   | Angular's `[--nl-bg:var(--sapList_Background)]`; fundamental-styles' links are transparent over the item's list background | Fixed: transparent at rest. Not visible; also in Angular.                                                                              |
| Content rows have a pointer cursor                      | Angular's row classes; fundamental-styles gives the pointer to the link and the button, which cover the row                | Fixed: `cursor-auto` on content rows. Not visible; also in Angular.                                                                    |
| Expand button font, paddings, minimum height and radius | fundamental-styles' button is an `fd-button` (72-SemiboldDuplex 14px, 9px/7px paddings, `min-height: 100%`, button radius) | Kept, ignored in the case: not visible (no background or border, the paddings fit in the 2.5rem minimum width; the glyph is compared). |
| Collapsed expand arrow points left in RTL               | fundamental-styles' deprecated nested list does not mirror the arrow                                                       | Kept: the arrow points to the reading direction, as Fiori, fundamental-ngx (left arrow in RTL) and our tree (8 RTL combinations, 2%).  |

The condensed popover renders in `<body>`, outside the story root the visual script captures: it was reviewed by eye
(Condensed, open and Open: condensed popover). Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default,
Condensed, open and Open: condensed popover (to the left in RTL, with the arrow at the item).
