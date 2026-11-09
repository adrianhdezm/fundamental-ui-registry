## nested-list

Sources: no fundamental-react source · Angular [`registry/ui/nested-list`](../../../angular/registry/ui/nested-list/)
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                              | Cause                                                                                                                      | Resolution                                                                                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Expand button font, paddings, minimum height and radius | fundamental-styles' button is an `fd-button` (72-SemiboldDuplex 14px, 9px/7px paddings, `min-height: 100%`, button radius) | Kept, ignored in the case: not visible (no background or border, the paddings fit in the 2.5rem minimum width; the glyph is compared). |
| Collapsed expand arrow points left in RTL               | fundamental-styles' deprecated nested list does not mirror the arrow                                                       | Kept: the arrow points to the reading direction, as Fiori, fundamental-ngx (left arrow in RTL) and our tree (8 RTL combinations, 2%).  |
