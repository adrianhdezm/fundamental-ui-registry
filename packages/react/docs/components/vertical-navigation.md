## vertical-navigation

Sources: Angular [`registry/ui/vertical-navigation`](../../../angular/registry/ui/vertical-navigation/) (itself
`@fundamental-ngx/core` vertical-navigation and list-navigation-item) · fundamental-styles
[Vertical Navigation](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-vertical-navigation--docs).
fundamental-react has no vertical navigation. Registry: `registry/ui/vertical-navigation/`, on the registry's
[icon](icon.md) and Base UI's `useDirection` (the arrow keys mirror in RTL). Base UI has no tree or navigation
primitive; the tree pattern, roving tab stop and keys are Angular's.

API, as Angular's components:

| Angular                                                    | React                                                                                              |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `fd-vertical-navigation` (host `block h-full` > div > nav) | `VerticalNavigation`: the `<nav>` itself with the column classes; native props, `className`, `ref` |
| `condensed`                                                | `condensed`                                                                                        |
| `ariaLabel` (default "Main Navigation")                    | the native `aria-label`, with the same default                                                     |
| `class`                                                    | `className`                                                                                        |
| `[fd-list-navigation-item]` (`<li>`)                       | `ListNavigationItem` (`<li role="treeitem">`)                                                      |
| `[(expanded)]` (model)                                     | `expanded` / `defaultExpanded` / `onExpandedChange`                                                |
| `indicated`                                                | `indicated`                                                                                        |
| `[fd-list-navigation-item-text]`                           | `ListNavigationItemText` (its id is the item's id + `-text`, as Angular gives the text an id)      |
| `[fd-list-navigation-item-arrow]` (`ariaHidden`)           | `ListNavigationItemArrow` (a `<button>`, `aria-hidden` true by default)                            |
| `<fd-icon>` in an item                                     | `ListNavigationItemIcon` (an `Icon` with the item's icon column classes)                           |
| `<ul fd-list>` / `<ul>` in an item                         | `ListNavigationItemList` (`<ul role="group">`), or a plain `<ul>`, which gets the role and classes |
| `[fd-vertical-navigation-group-header]`                    | `VerticalNavigationGroupHeader` (`<li role="none">`)                                               |

Behaviour, as Angular: a `<ul role="tree">` of `treeitem`s with `aria-level` 1 and 2, `aria-expanded` on
expandable items (those with an arrow or second-level items), `aria-selected` from `indicated`, and second-level
lists as `group`s. One tab stop: the last focused visible item, or the first. Up and Down move between the visible
items without wrapping, Home and End to the ends, group headers skipped; Right (Left in RTL) expands and focuses the
first second-level item, Left (Right in RTL) collapses, or collapses the parent from a second-level item; Enter and
Space toggle an expandable item and click the others; a click toggles. The indicator marks the indicated item, or its
collapsed parent when a second-level item is indicated. Condensed (3.25rem), first-level texts are visually hidden
(they still name the items) and an expanded item shows its icon, text and second-level items in a panel over the
content, as Angular's (an absolutely positioned part of the item, not a popover: it stays in the tree); the parent
leaves the arrow-key rows while its panel is open, Escape on a second-level item closes it and returns the focus, a
click outside closes it.

**Differences from Angular, on purpose:**

- The `<nav>` is the root element and has the column classes (Angular's host wraps a `<div>` with them around the
  `<nav>`); `ref`, `className` and native props go there.
- The column sets fundamental-styles' `fd-vertical-nav` text style (`--sapFontSize`, `line-height: normal`,
  `--sapTextColor`, weight 400); Angular sets only the font family.
- The icon of an item is `ListNavigationItemIcon` instead of a plain icon matched by CSS (`[&>div>div>fd-icon]`): it
  takes the icon column classes itself, and tells the item it has an icon (second-level texts line up with it).
- The shadows are written as `[box-shadow:var(--sapContent_Shadow…)]`: the `shadow-sap-…` utilities add Tailwind's
  ring layers.
- The group header has fundamental-styles' list group header layout (0.9375rem side padding, the text in a title
  span: header font, `--sapFontHeader6Size`, 2rem line height, `--sapList_TableGroupHeaderTextColor`); Angular's is
  one bold text with 1rem padding and 0.5rem bottom padding.
- The icon has 0.25rem after it (fundamental-styles' markup has a space between icon and text), which lines the
  first-level texts up with the second-level ones; Angular's texts sit 4px closer to the icon.
- In a condensed panel, the header's icon starts 0.875rem in with 0.75rem to the text, the header text is
  `--sapFontSize`, and the second-level rows have no padding (their texts 1rem in), as fundamental-styles'
  popovers; Angular pads the header, keeps the large text and the row padding (texts 0.5rem further in).
- The Open: condensed panel story renders with Calendar expanded, as Angular's; its `play` waits for the panel.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                                     | Cause                                                                                                                                                                                                      | Resolution                                                                                                 |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Second-level items 28px narrower (212px) in fundamental-styles, with a line above the first                    | `.fd-list { max-width: 100% }` defeats its own `width: auto` and -1rem end margin; the first-child top border rule of first-level items reaches nested lists                                               | Kept, ignored in the cases: rows span the column without a line, as Angular and the `-1rem` margin intend. |
| Indicated text white (HC Black) and black (HC White) instead of `--sapSelectedColor` (8 combinations)          | `--sapSelectedColor` on black is too dark for text (about 3:1); Angular uses `--sapContent_Selected_TextColor` in the HC themes and keeps the indicator                                                    | Kept, for contrast (axe passes in HC Black).                                                               |
| Panel header content 1px higher, and in RTL a 12px bottom-right corner in fundamental-styles (16 combinations) | The reference's header row is a first list item and takes the first-child top border, which pushes its content down; its RTL rule uses `--sapElement_BorderCornerRadius` where LTR uses the popover radius | Kept: neither is part of the design (4.3–8.7% of the pixels, the 1px offset).                              |
