## vertical-navigation

Sources: Angular [`registry/ui/vertical-navigation`](../../../../angular/registry/ui/vertical-navigation/) (itself
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

### Stories vs. sources

fundamental-react has no vertical navigation.

| Source  | Example               | React story     | Status     | Notes                                                                              |
| ------- | --------------------- | --------------- | ---------- | ---------------------------------------------------------------------------------- |
| Angular | Default               | `Default`       | ✅ covered | Calendar expanded, Today current; a click changes the current page.                |
| Angular | Condensed             | `Condensed`     | ✅ covered | Icons only; Calendar shows the indicator of Today.                                 |
| Angular | Grouping              | `Grouping`      | ✅ covered | "Employee Services" header, Support current.                                       |
| Angular | No icons              | `NoIcons`       | ✅ covered |                                                                                    |
| Angular | Open: condensed panel | `OpenCondensed` | ✅ covered | Calendar's panel open on load; `play` waits for it, so axe checks it.              |
| —       | —                     | `Playground`    | ✅ covered | The story host's `condensed`, `icons`, `grouping`, `expandFirst` and `aria-label`. |

### Tests vs. sources

| Source            | Behaviour                                                              | React test                                                              | Status     |
| ----------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------- |
| Angular           | Tree, one tab stop, `aria-expanded`, `aria-level`, groups              | renders a tree with one tab stop and second-level groups                | ✅ covered |
| Angular           | Current page and the indicator on its collapsed parent                 | marks the current page, and its collapsed parent with the indicator     | ✅ covered |
| Angular           | Up/Down over visible items, Right expands, Left collapses, End         | moves between visible items and expands with the arrow keys             | ✅ covered |
| Angular           | Click, Enter and Space toggle                                          | toggles with clicks, Enter and Space                                    | ✅ covered |
| Angular           | Condensed: width, sr-only texts, panel by Right, Escape, outside click | shows icons only when condensed and opens second-level items in a panel | ✅ covered |
| Angular           | RTL arrow keys                                                         | Right and Left are mirrored in RTL                                      | ✅ covered |
| Angular           | Group headers skipped by arrows and Tab                                | group headers are not focusable and are skipped by the arrow keys       | ✅ covered |
| Angular           | Switching condensed keeps the item and tab stop                        | switching condensed at runtime keeps the current item and tab stop      | ✅ covered |
| —                 | The text's id                                                          | gives each text an id of its item                                       | ✅ new     |
| —                 | Uncontrolled `defaultExpanded` with `onExpandedChange`                 | works uncontrolled, reporting expanded changes                          | ✅ new     |
| —                 | Tab stop follows the focus when an item is hidden                      | moves the tab stop to a visible item when the current one is hidden     | ✅ new     |
| —                 | `ListNavigationItemList` makes an item expandable without an arrow     | takes second-level items in a ListNavigationItemList                    | ✅ new     |
| fundamental-react | (none; the usual prop spreading and ref)                               | spreads native props, merges className and forwards refs                | ✅ new     |

### Visual comparison

`pnpm visual vertical-navigation`: 29 cases × 16 combinations, 440/464 matching; the 24 others are the two kept
differences below. References: fundamental-styles' Default (`cozy`), Condensed, Text Only, Navigation Indication
and Grouping stories. Its condensed panel opens on a click of its story script; `scripts/visual/vertical-navigation.mjs`
registers a Playwright selector engine (`fd-vn-open=`) that opens it the same way (`is-expanded`). Our story texts
are Angular's ("Today", "Upcoming Events Upcoming Events"; theirs "Second level item 1"), so rows with different texts
are compared by style only. Cases: the column and the condensed column (style, without the height), a first-level
item at rest, hovered and focused, its text and icon, an indicated item and its text, an expanded parent and its
text, the expanded and collapsed arrows, a second-level item, indicated item and text, the group header, a condensed
item at rest and hovered, a condensed parent with an indicated child (the indicator and corner triangle), the
text-only item, expanded parent, text and second-level text, and the open panel's header, header text, list, item
and item text.

| Difference                                                                                                     | Cause                                                                                                                                                                                                      | Resolution                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First-level texts 4px closer to the icon, out of line with the second-level texts                              | fundamental-styles' markup has a space between icon and text; Angular's classes do not make up for it                                                                                                      | Fixed: `me-1` on the icon (not when condensed). Angular has it too.                                                                                                |
| Column without font size, line height and colour                                                               | Angular sets only the font family                                                                                                                                                                          | Fixed: `fd-vertical-nav`'s text style on the `<nav>`.                                                                                                              |
| Icon and arrow: font family and line height, arrow radius and cursor                                           | fundamental-styles sets the icon font, a 2.75rem line height, the button radius and a pointer on them; Angular does not (not visible: the glyphs are in our icons' `::before`)                             | Fixed: the same values.                                                                                                                                            |
| Focus frame of the first item 1px lower                                                                        | Our frame is a `::before` from the padding box; fundamental-styles' outline is on the row's border box, and the first row has a top border                                                                 | Fixed: `first:focus-visible:before:-top-px`.                                                                                                                       |
| Group header: 1rem padding, text 0.5rem from the bottom, body font                                             | Angular's header is one bold text; fundamental-styles' a list group header with a title (header font, `--sapFontHeader6Size`, 2rem line height, table group header colour)                                 | Fixed: the list group header layout and a title span. Angular has it too.                                                                                          |
| Panel: header padded, 16px header text, second-level texts 8px further in, 12px corners, 44px header           | Angular's panel classes; fundamental-styles' popovers have unpadded condensed rows, the item text size, the popover radius and the row's inner height                                                      | Fixed: icon `ps-[0.875rem]` and 0.75rem to the text, `--sapFontSize` header text, unpadded rows, `--sapPopover_BorderCornerRadius`, the header as high as the row. |
| Second-level items 28px narrower (212px) in fundamental-styles, with a line above the first                    | `.fd-list { max-width: 100% }` defeats its own `width: auto` and -1rem end margin; the first-child top border rule of first-level items reaches nested lists                                               | Kept, ignored in the cases: rows span the column without a line, as Angular and the `-1rem` margin intend.                                                         |
| Indicated text white (HC Black) and black (HC White) instead of `--sapSelectedColor` (8 combinations)          | `--sapSelectedColor` on black is too dark for text (about 3:1); Angular uses `--sapContent_Selected_TextColor` in the HC themes and keeps the indicator                                                    | Kept, for contrast (axe passes in HC Black).                                                                                                                       |
| Panel header content 1px higher, and in RTL a 12px bottom-right corner in fundamental-styles (16 combinations) | The reference's header row is a first list item and takes the first-child top border, which pushes its content down; its RTL rule uses `--sapElement_BorderCornerRadius` where LTR uses the popover radius | Kept: neither is part of the design (4.3–8.7% of the pixels, the 1px offset).                                                                                      |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, Condensed, Grouping, No icons and Open: condensed
panel (the panel mirrored to the right in RTL, the corner triangles turned).
