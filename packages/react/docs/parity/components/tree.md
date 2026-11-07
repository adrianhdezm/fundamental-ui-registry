## tree

Sources: fundamental-react [Tree](https://github.com/SAP/fundamental-react/tree/main/src/Tree) (`Tree` with
`Tree.Node`) · Angular [`registry/ui/tree`](../../../../angular/registry/ui/tree/) · fundamental-styles
[Tree](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-tree--docs)
Registry: `registry/ui/tree/`. Base UI has no tree primitive: the tree pattern (one tab stop, arrow keys, levels,
positions) is ported from Angular; the selection controls are our Base UI `Checkbox` and `Radio`, the action buttons
our `Button`, and `TreeItemText` takes Base UI's `render`.

API: five components, as Angular's component and directives:

- `Tree` (Angular's `fd-tree`): `noBorder`, `selection` (`'none' | 'single' | 'multiple'`), `selectionPlacement`
  (`'none' | 'left' | 'afterExpand' | 'right'`), `independentSections`, `navigationIndicator`, `noDataText`,
  `loadingLabel`, `dataSource` + `renderItem` for a data tree (Angular's `dataSource` and `*fdTreeItemDef` template),
  `onDataRequested`/`onDataReceived` (`dataRequested`/`dataReceived`), and the selection as
  `value`/`defaultValue`/`onValueChange` (Angular's form value and `selectedChange`: one value or `null`, or an array
  with multiple selection). Native props and the ref go to the `role="tree"` element; `aria-label` names it.
- `TreeItem` (`fd-tree-item`): `value` (the item's id by default), `navigatable`, `state` (highlight indicator),
  `wrapContent`, `level`, `childNodes` (children of a data item, loaded on expansion), `expanded`/`defaultExpanded`/
  `onExpandedChange` (Angular's `expanded` model) and `onTreeItemClick` (`treeItemClick`: click, Enter or Space).
  Native props (`id`, `className`, `style`, `aria-label`, handlers) and the ref go to the row, the `role="treeitem"`
  element, where Angular puts `id`, `class`, `ariaLabel`, `backgroundColor` and `customStyles` (those two are the
  native `style`). Angular's `parentId` input was unused and is not ported (data items still carry `parentId`).
- `TreeItemIcon` (`fdTreeItemIcon`): our `Icon` with the tree icon styles. `TreeItemText` (`fdTreeItemText`): a
  `<span>`, or another element with `render` (e.g. `render={<div />}` for rich content). `TreeItemButton`
  (`fdTreeItemButton`): our `Button`, placed after the content.
- `TreeDataSource<T>`: `{ fetch(): T[] | Promise<T[]>; getTotalItems?(): number | Promise<number> }`, a plain
  interface (Angular's abstract class), and `normalizeTreeItems`.

A `TreeItem` sorts its children as Angular projects them: nested `TreeItem`s go into its children, `TreeItemButton`s
after the content, everything else (icons, text, other elements, in their order) into the content. Fragments and
conditional children work; a `TreeItem` inside a wrapper component is not recognised as a nested item (use
`dataSource` and `renderItem` for generated trees).

fundamental-react mapping: `Tree.Node` is `TreeItem`, its text children go in a `TreeItemText`; `glyphsBefore`/
`glyphsAfter` are `TreeItemIcon`s before or after the text (an icon after the text keeps its place, which Angular's
projection could not do); `actions` are `TreeItemButton`s; `highlight` is `state`; `link` is `navigatable` with
`onTreeItemClick` doing the navigation; `isNavigated` is `navigated` (fundamental-styles' `is-navigated`, not in
Angular); `active` on a node is `navigatable`, and an `active` tree is every item `navigatable` without
`navigationIndicator`; `noBorders` is `noBorder`, `emptyText` is `noDataText`, `selection` `'multi'` is
`'multiple'`, `selectionPosition` is `selectionPlacement`; `onExpandToggle(event, expanded, nodeData)` is
`onExpandedChange(expanded)` and `onSelectionChange(event, checked, nodeData)` the tree's `onValueChange(value)`
(`nodeData` is a closure in React); `selectionProps` is not ported (the controls are display only); `compact` is
`data-density="compact"`; `cssNamespace` is gone.

ARIA and keyboard, as Angular: `role="tree"` with `aria-multiselectable` for multiple selection; each row is a
`role="treeitem"` with `aria-level`, `aria-setsize`, `aria-posinset` (from the rendered siblings), `aria-expanded`
when it has children and `aria-selected` when the tree selects. The tree is one tab stop (the focused item, or the
first one): Up/Down move, Home/End go to the first/last item, Right expands or moves to the first child, Left
collapses or moves to the parent (mirrored in RTL), Enter and Space activate and select; Tab from an item reaches its
action buttons. The expander and the selection controls are `aria-hidden` and out of the tab order; a click on the
expander toggles the item and focuses its row. Loading rows are `role="treeitem"` with `aria-busy` and the
`loadingLabel` as name.

**Differences on purpose:**

- `dataSource` takes arrays, promises and `TreeDataSource`s (whose `fetch` returns an array or a promise); Angular
  also takes RxJS Observables, which this package does not depend on.
- Enter and Space activate an item only when the row itself has the focus: on its action buttons they are the
  button's (Angular also activated the item when Enter was pressed on one of its buttons).
- The selection controls do not take pointer events (`pointer-events: none`), so a click on them is a click on the
  row, which selects: Base UI's checkbox and radio would otherwise toggle on their own and click the row a second time.
- The "No data" row also shows for a tree without children and without `dataSource` (fundamental-react's empty tree);
  Angular shows it only for an empty data tree.
- The loading placeholders (rows and the expander while the number of children is unknown) are static boxes in the
  skeleton colour (`--sapContent_Placeholderloading_Background`, the text skeleton's 6.25rem × 0.5rem and the 1rem
  rectangle) until the skeleton is ported; Angular uses its `fd-skeleton`, with the shimmer.
- `navigated` (fundamental-react's `isNavigated`, fundamental-styles' `is-navigated`), not in Angular.

### Stories vs. sources

| Source            | Example                            | React story                      | Status     | Notes                                                                                                     |
| ----------------- | ---------------------------------- | -------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| fundamental-react | wrappingAndNonWrappingContents     | `WrappingAndNonWrappingContents` | ✅ covered | Level 1 expanded and fundamental-styles' long texts, as its Primary story, to compare by pixels.          |
| fundamental-react | compact                            | `Compact`                        | ✅ covered | `data-density="compact"`.                                                                                 |
| fundamental-react | nodeActionsAndNoBorder             | `NodeActionsAndNoBorder`         | ✅ covered | Icons before and after the text, edit and decline buttons, `noBorder`; the first two levels expanded.     |
| fundamental-react | highlightIndicators                | `HighlightIndicators`            | ✅ covered | Expanded to level 3, as fundamental-styles' story.                                                        |
| fundamental-react | navigationLinks                    | `NavigationLinks`                | ✅ covered | `navigatable` items with `onTreeItemClick`, the navigation indicator, `navigated`.                        |
| fundamental-react | activeTree                         | `ActiveTree`                     | ✅ covered | Every item `navigatable`, no indicator.                                                                   |
| fundamental-react | multiSelectionLeft                 | `MultiSelectionLeft`             | ✅ covered | The value shown under the tree instead of `alert`; the first item selected, as fundamental-styles' story. |
| fundamental-react | multiSelectionRight                | `MultiSelectionRight`            | ✅ covered |                                                                                                           |
| fundamental-react | singleSelectionLeft                | `SingleSelectionLeft`            | ✅ covered |                                                                                                           |
| fundamental-react | singleSelectionRight               | `SingleSelectionRight`           | ✅ covered |                                                                                                           |
| fundamental-react | emptyTree                          | `EmptyTree`                      | ✅ covered |                                                                                                           |
| fundamental-react | dev                                | `Playground`                     | ✅ covered | The tree props as controls.                                                                               |
| fundamental-react | noStyles                           | —                                | ➖ n/a     | No `cssNamespace`.                                                                                        |
| Angular           | Basic                              | `Basic`                          | ✅ covered | Nested items, data items without borders, no data.                                                        |
| Angular           | Customization                      | `Customization`                  | ✅ covered | `style` for `backgroundColor` and `customStyles`, `className`, avatars and a button in the text.          |
| Angular           | Navigation, highlights and buttons | `States`                         | ✅ covered |                                                                                                           |
| Angular           | Selection                          | `Selection`                      | ✅ covered | Our `SegmentedButton` for the placement and our `Checkbox`, as Angular.                                   |
| Angular           | Lazy loading                       | `LazyLoading`                    | ✅ covered | A `TreeDataSource` whose `fetch` resolves after 1.5s.                                                     |

### Tests vs. sources

| Source            | Behaviour                                                 | React test                                                                             | Status     |
| ----------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| Angular           | Tree of items with levels, positions and expansion states | is a tree of items with levels, positions and expansion states                         | ✅ covered |
| Angular           | Expander expands and indents the children                 | expands and collapses with the expander and indents the children                       | ✅ covered |
| Angular           | One tab stop moved with the arrow keys, Enter clicks      | is one tab stop moved with the arrow keys                                              | ✅ covered |
| Angular           | Data items, children loaded on expansion                  | renders data items and loads children when they expand                                 | ✅ covered |
| Angular           | Loading rows until lazy children arrive                   | shows loading rows until a promised data source and lazy children arrive               | ✅ covered |
| Angular           | No data                                                   | says when there is no data                                                             | ✅ covered |
| Angular           | Single selection as a form value, deselect                | selects one item as a value                                                            | ✅ covered |
| Angular           | Multiple selection with checkboxes, Space                 | selects several items with checkboxes                                                  | ✅ covered |
| Angular           | noBorder                                                  | removes the borders of the top level items with noBorder                               | ✅ covered |
| Angular           | Icon before the text                                      | renders the icon before the text                                                       | ✅ covered |
| Angular           | Indentation by the deepest expanded level                 | indents by the deepest expanded level and shrinks back when it collapses               | ✅ covered |
| Angular           | Highlight indicator per state                             | shows the highlight indicator of the state                                             | ✅ covered |
| Angular           | Navigation indicator                                      | shows the navigation arrow on navigatable items with navigationIndicator               | ✅ covered |
| Angular           | Selection control placement                               | places the selection control after the expander or at the end                          | ✅ covered |
| Angular           | independentSections                                       | puts left selection controls in one column with independentSections                    | ✅ covered |
| Angular           | RTL arrow keys                                            | mirrors Right and Left in RTL                                                          | ✅ covered |
| Angular           | Tab reaches the action buttons, one item in the tab order | reaches the action buttons with Tab from their item, keeping one item in the tab order | ✅ covered |
| fundamental-react | Expand button toggles the subtree                         | expands and collapses with the expander and indents the children                       | ✅ covered |
| fundamental-react | onExpandToggle called with the expansion                  | expands and collapses with the expander … (`onExpandedChange` true, then false)        | ✅ covered |
| fundamental-react | Multi selection, selected styles                          | selects several items with checkboxes (selection background)                           | ✅ covered |
| fundamental-react | onSelectionChange in multi and single trees               | selects one item as a value; selects several items with checkboxes                     | ✅ covered |
| fundamental-react | Props spreading on the tree                               | spreads native props on the tree and the item rows, and merges className               | ✅ covered |
| —                 | Ref forwarding                                            | forwards the refs of the tree and the item rows                                        | ✅ covered |
| —                 | Tab stop after the focused item is removed                | moves the tab stop to the first item when the focused item goes away                   | ✅ covered |
| —                 | Unknown number of children                                | shows a placeholder expander while the number of children is unknown                   | ✅ covered |
| —                 | Uncontrolled selection by id                              | keeps an uncontrolled selection from defaultValue, by item id when no value is given   | ✅ covered |
| —                 | `navigated`                                               | marks the navigated item at the end of the row, with or without a highlight            | ✅ covered |
| —                 | Controls out of the tab order and the accessibility tree  | keeps the selection controls out of the tab order and the accessibility tree           | ✅ covered |
| —                 | Fragments, conditional children, `render`                 | takes items in fragments and conditional children, and the text as another element     | ✅ covered |
| —                 | Compact density                                           | uses the compact sizes in the compact density                                          | ✅ covered |

### Visual comparison

`pnpm visual tree`: 21 cases × 16 combinations, 296/336 matching; the 40 others are the three kept differences
below. Cases: from fundamental-styles' Primary story (same levels and texts, by pixels) the expanded level 1 row, an
expandable and a leaf level 2 row, a level 1 leaf, the truncated long text, the wrapping text, the focused row, the
expander and the text; the four highlight indicators (Highlight indicators story, same levels); from Borderless the
level 1 row without border (styles only: two icons in fundamental-react's story), the level 2 row with its icon and
edit and decline buttons, the icon and a button; from Navigable a hovered navigatable child row (styles only) and the
navigation indicator; from Selection the selected first item (styles only, other text); the No data row.

| Difference                                                         | Cause                                                                                                                                                                                                                         | Resolution                                                                                                                    |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Wrapping rows 8px taller (0.25rem padding above and below)         | Angular's `py-1` on items with `wrapContent`; fundamental-styles pads only rows of a `fd-tree--wrap` tree, not an item's `fd-tree__content--wrap`                                                                             | Fixed: no padding. Angular issue.                                                                                             |
| 2px margin before the action buttons                               | Angular's `ms-(--fdList_Button_Spacing,0.125rem)`; fundamental-styles' `--fdTree_Button_Spacing` is `var(--fdList_Button_Spacing)`, not defined in a tree, so 0                                                               | Fixed: no margin. Angular issue.                                                                                              |
| No data row 1px lower (44px instead of 45px, 32px instead of 33px) | The text has a normal line height; fundamental-styles' text takes the item height, plus the 1px border                                                                                                                        | Fixed: `leading-(--tree-h)` on the text. Angular issue (same classes).                                                        |
| Expander without the button corner radius                          | fundamental-styles' expander has `border-radius: var(--sapButton_BorderCornerRadius)` (only seen with its focus outline)                                                                                                      | Fixed: `rounded-sap-button-border-corner-radius`. Not visible in Angular.                                                     |
| Hovered navigatable child rows: list hover background              | fundamental-styles' hover rules set `--fdList_Item_Background_Color`, which `.fd-tree__item-container` never reads (its background is `--sapList_AlternatingBackground`), so its rows show no hover; Fiori lists and trees do | Kept, as Angular: `--sapList_Hover_Background` (16 combinations).                                                             |
| Selected rows have a pointer cursor                                | fundamental-styles' Selection story rows are not `--active`; here a click on the row selects it, so it is interactive                                                                                                         | Kept, as Angular (16 combinations, cursor only).                                                                              |
| The `account` icon is mirrored in RTL                              | Our `Icon` mirrors the glyphs the SAP icon font marks for RTL (as Angular's icon); fundamental-styles' tree icons never mirror                                                                                                | Kept: the icon component's rule (8 RTL combinations, 5–11% of the 1em icon's pixels).                                         |
| Loading placeholders without shimmer                               | The skeleton is not ported yet                                                                                                                                                                                                | Static boxes in the skeleton colour until the skeleton is ported (no fundamental-styles story to compare: not a visual case). |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Basic, Selection (all placements) and Icons, node actions
and no borders on level 1. Collapsed expanders point to the start in RTL (mirrored glyph, as fundamental-styles'
rotation); an icon after the text (fundamental-react's `glyphsAfter`) sits at the end of the row before the buttons, as
in fundamental-react.
