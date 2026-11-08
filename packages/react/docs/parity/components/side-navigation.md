## side-navigation

Sources: fundamental-react [SideNavigation](https://github.com/SAP/fundamental-react/tree/main/src/SideNavigation)
(SideNav, SideNav.List, SideNav.ListItem) · Angular [`registry/ui/side-navigation`](../../../../angular/registry/ui/side-navigation/)
· fundamental-styles [Side Navigation](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-side-navigation--docs)
(its `fd-side-nav` column; the lists are the `fd-nested-list` styles of its bundle, see the visual comparison).
Registry: `registry/ui/side-navigation/`, on the registry's [nested-list](nested-list.md): `NestedListProvider`
(scoped, condensed, selectable), `PreparedNestedList` for the data model, and through them our `Popover` (Base UI's
Popover) for the condensed child lists. Base UI has no navigation primitive; the tree pattern and keyboard are the
nested list's, ported from Angular.

API, as Angular's components:

| Angular                                               | React                                                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `fd-side-nav` (host `block h-full` around a `<nav>`)  | `SideNavigation`: the `<nav>` itself; native props, `className` and `ref` go to it       |
| `sideNavigationConfiguration` (`SideNavigationModel`) | the same prop and type (`mainNavigation`, `utilityNavigation`, `condensed`)              |
| `condensed`, `collapseWidth`, `selectable`            | the same props (`selectable` defaults to true)                                           |
| `ariaLabel` (default "Main Navigation")               | the native `aria-label`, with the same default                                           |
| `class`                                               | `className`                                                                              |
| `NestedListState` + `NESTED_LIST_SCOPE` providers     | a `NestedListProvider scoped` inside the `<nav>`, which has the `data-nested-scope` mark |
| `[fd-side-nav-main]`, `[fd-side-nav-utility]`         | `SideNavigationMain`, `SideNavigationUtility` (`<div>`s, native props, `data-slot`)      |
| the nested-list directives                            | the nested-list components, imported from `@/ui/nested-list/nested-list`                 |

fundamental-react's `SideNav` is `SideNavigation`: `condensed` the same; `compact` is `data-density="compact"` on
the navigation or an ancestor; `skipLink` (`{ href, label }`) is kept as an optional prop (a link at the start of the
navigation, visually hidden until it has the focus, outside the rows of the arrow keys). `selectedId` and
`onItemSelect(event, id)` have no prop of their own: the selection is the nested list's (a click selects the item and
its parents), its `selected` props show it before the first click or always with `selectable={false}`, and
`onItemSelect` is the `onClick` of each link. `SideNav.List` is `NestedList` (in a `SideNavigationMain`, or a
`SideNavigationUtility` for `isUtility`), its `title`/`titleProps` a `NestedListHeader` with its props, `groupLabel`
the list's `aria-label`; `level` and `hasParent` come from the nesting. `SideNav.ListItem` is `NestedListItem` with a
`NestedListLink` (`url` is `href`, `glyph` a `NestedListIcon`, `name` a `NestedListTitle`, `onClick` the link's), or a
`NestedListContent` with a `NestedListExpandIcon` and a child list (`expanded` is `expanded`/`defaultExpanded`,
`expandSubmenuLabel` the button's `aria-label`). `cssNamespace` is gone.

Behaviour, as Angular: the `<nav>` (named "Main Navigation") is a column of the main lists, which take the free
height and scroll (`overflow-y-auto`, SAP scrollbar), and the utility lists at the bottom. The arrow keys move across
the visible rows of both (Up and Down wrap, Home and End go to the ends), and one selection is shared. Condensed (by
`condensed`, the model's `condensed`, or while `window.innerWidth <= collapseWidth`, followed on resize), the column
is 4rem wide, first-level items show their icons only, headers are hidden and a `NestedListPopover` opens a child
list to the side. The tree roles, the keys of the rows and the popover are the nested list's (see its report).

**Differences from Angular, on purpose:**

- The `<nav>` is the root element (Angular's host element wrapped it); `ref`, `className` and native props go there.
- The column sets fundamental-styles' `fd-side-nav` text style (`--sapFontSize`, `line-height: normal`,
  `--sapTextColor`, weight 400); Angular sets only the font family, so its lists inherit the page's line height.
- `skipLink`, from fundamental-react; Angular has no skip link.
- The stories open the Settings group of the condensed Default story only on demand (Angular's starts with
  `settingsOpen` true, which opens its popover on load).

### Stories vs. sources

| Source            | Example                    | React story             | Status     | Notes                                                                                                 |
| ----------------- | -------------------------- | ----------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| Angular           | Default                    | `Default`               | ✅ covered | Headers, icons, Settings expanded, utility links, the chosen link shown.                              |
| Angular           | Condensed                  | `Condensed`             | ✅ covered | Icons only, Settings in a popover.                                                                    |
| Angular           | Not selectable             | `NotSelectable`         | ✅ covered | Home keeps its `selected` prop.                                                                       |
| Angular           | From data                  | `FromData`              | ✅ covered | `sideNavigationConfiguration`.                                                                        |
| Angular           | From data, condensed       | `FromDataCondensed`     | ✅ covered |                                                                                                       |
| Angular           | Text only                  | `TextOnly`              | ✅ covered |                                                                                                       |
| Angular           | Programmatic state         | `Programmatic`          | ✅ covered | Buttons change `expanded` and `selected`.                                                             |
| Angular           | Open: condensed popover    | `OpenCondensed`         | ✅ covered | Right (Left in RTL) on Settings, focus in the popover.                                                |
| Angular           | Open: from data, condensed | `OpenFromDataCondensed` | ✅ covered |                                                                                                       |
| fundamental-react | primary                    | `Primary`               | ✅ covered | Text links, the second selected, the external link with the `action` icon, the skip link (Tab to it). |
| fundamental-react | compact                    | `Compact`               | ✅ covered | `data-density="compact"`.                                                                             |
| fundamental-react | condensed                  | `CondensedOneLevel`     | ✅ covered | One level of icons, the second selected.                                                              |
| fundamental-react | oneLevel                   | `OneLevel`              | ✅ covered | The utility list in `SideNavigationUtility`, named "Utility Menu" (`groupLabel`).                     |
| fundamental-react | withTitle                  | `WithTitle`             | ✅ covered | Group headers (`title`), one long title and link.                                                     |
| fundamental-react | withSubList                | `WithSubList`           | ✅ covered | Two items with child lists, the buttons named "Expand submenu".                                       |
| fundamental-react | withIcons                  | `WithIcons`             | ✅ covered |                                                                                                       |
| fundamental-react | noStyles                   | —                       | ➖ n/a     | No `cssNamespace`.                                                                                    |
| —                 | —                          | `Playground`            | ✅ covered | `condensed`, `selectable`, `collapseWidth` and `aria-label` as controls.                              |

### Tests vs. sources

| Source            | Behaviour                                                                      | React test                                                                          | Status     |
| ----------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------- |
| Angular           | Trees of rows with levels, described by their group header                     | renders trees of rows with levels, described by their group header                  | ✅ covered |
| Angular           | Expand button and arrow keys, moving across all visible rows                   | expands with the button and the arrow keys and moves across all visible rows        | ✅ covered |
| Angular           | Selects the clicked row and highlights its parent                              | selects the clicked row and highlights its parent                                   | ✅ covered |
| Angular           | `selectable=false` keeps the `selected` inputs                                 | keeps the selected props when items are not selectable                              | ✅ covered |
| Angular           | Condensed: `w-16`, hidden headers, popover by Right, Enter, Left closes        | opens child lists in popovers when condensed                                        | ✅ covered |
| Angular           | Builds the navigation from data                                                | builds the navigation from data (also the model's `condensed`)                      | ✅ covered |
| Angular           | RTL arrow keys                                                                 | mirrors the arrow keys that expand and collapse in RTL                              | ✅ covered |
| Angular           | `[expanded]` from outside                                                      | opens and closes the child list when expanded changes from outside                  | ✅ covered |
| Angular           | `[selected]` from outside, not selectable                                      | moves the selection when selected changes from outside and items are not selectable | ✅ covered |
| Angular           | Main list to utility list and back                                             | moves from the main list into the utility list and back with the arrow keys         | ✅ covered |
| fundamental-react | List link click: expand buttons, sub link click (`selectedId`)                 | expands the items of the expand buttons independently and selects clicked sub links | ✅ covered |
| fundamental-react | `onItemSelect` with the event                                                  | calls the onClick of a link with the event when it is selected                      | ✅ covered |
| fundamental-react | Prop spreading (SideNav, SideNavList, its title, SideNavListItem); header `li` | spreads native props, merges className and forwards refs                            | ✅ covered |
| —                 | `collapseWidth`                                                                | condenses while the window is at most collapseWidth wide                            | ✅ new     |
| —                 | `skipLink` (fundamental-react's required prop)                                 | renders a skip link before the lists, outside the arrow-key rows                    | ✅ new     |
| —                 | Layout: main list scrolls, utility list at the bottom                          | lays the main list out above the utility list, the main list scrolling              | ✅ new     |

### Visual comparison

`pnpm visual side-navigation`: 15 cases × 16 combinations, 240/240 matching. fundamental-styles' Side Navigation
stories have the `fd-side-nav` column, but their content is the newer `fd-navigation-list`: the column
(Expanded story, 18rem wide), the condensed column (Collapsed story, 4rem) and the main container are compared by
computed style only, without the height (our frame is 32rem high, theirs 86rem). The lists are compared as in
nested-list: `scripts/visual/side-navigation.mjs` writes fundamental-styles' `fd-nested-list` markup with the texts of
our Default and Text only stories, and a Playwright selector engine (`fd-side-nav-ref=`) puts it into a
fundamental-styles story page, inside its density and direction wrappers, where its own bundle and theme render it.
Cases: the column, the condensed column, the main container, the main and the utility lists, a group header, a
selected link (Not selectable story), a resting, a hovered and a focused link, the content row of Settings, a level 2
link, a utility link, and the text-only main and utility lists.

| Difference                                 | Cause                                                                                                                    | Resolution                                                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Line height 21px (1.5) instead of `normal` | Tailwind's `leading-normal` is 1.5; fundamental-styles' `fd-side-nav` has `line-height: normal`, which the lists inherit | Fixed: `leading-[normal]`, with the column's font size, colour and weight of `fd-side-nav`. Angular sets none of them (its lists take the page's). |
| Container padding                          | fundamental-styles' `fd-side-nav__container` pads 0.5rem for the rounded items of `fd-navigation-list`                   | Kept, ignored in the case: the `fd-nested-list` rows span the full width with their lines, as Angular and fundamental-styles' nested list.         |

The condensed popover renders in `<body>`, outside the story root; it is the nested list's popover (compared and
reviewed there) and was reviewed by eye here (Open: condensed popover). Reviewed by eye in Horizon, cozy and compact,
LTR and RTL: Default, Condensed, Open: condensed popover, From data and Primary (the skip link focused).
