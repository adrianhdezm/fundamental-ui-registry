## side-navigation

Sources: fundamental-react [SideNavigation](https://github.com/SAP/fundamental-react/tree/main/src/SideNavigation)
(SideNav, SideNav.List, SideNav.ListItem) · Angular [`registry/ui/side-navigation`](../../../angular/registry/ui/side-navigation/)
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

### Visual differences from fundamental-styles, kept on purpose

| Difference        | Cause                                                                                                  | Resolution                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Container padding | fundamental-styles' `fd-side-nav__container` pads 0.5rem for the rounded items of `fd-navigation-list` | Kept, ignored in the case: the `fd-nested-list` rows span the full width with their lines, as Angular and fundamental-styles' nested list. |
