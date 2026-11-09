## tree

Sources: fundamental-react [Tree](https://github.com/SAP/fundamental-react/tree/main/src/Tree) (`Tree` with
`Tree.Node`) · Angular [`registry/ui/tree`](../../../angular/registry/ui/tree/) · fundamental-styles
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
- The loading placeholders are skeletons, as Angular's: a one-line text skeleton 6.25rem wide in the loading rows and
  a 1rem rectangle in the expander while the number of children is unknown.
- `navigated` (fundamental-react's `isNavigated`, fundamental-styles' `is-navigated`), not in Angular.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                            | Cause                                                                                                                                                                                                                         | Resolution                                                                            |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Hovered navigatable child rows: list hover background | fundamental-styles' hover rules set `--fdList_Item_Background_Color`, which `.fd-tree__item-container` never reads (its background is `--sapList_AlternatingBackground`), so its rows show no hover; Fiori lists and trees do | Kept, as Angular: `--sapList_Hover_Background` (16 combinations).                     |
| Selected rows have a pointer cursor                   | fundamental-styles' Selection story rows are not `--active`; here a click on the row selects it, so it is interactive                                                                                                         | Kept, as Angular (16 combinations, cursor only).                                      |
| The `account` icon is mirrored in RTL                 | Our `Icon` mirrors the glyphs the SAP icon font marks for RTL (as Angular's icon); fundamental-styles' tree icons never mirror                                                                                                | Kept: the icon component's rule (8 RTL combinations, 5–11% of the 1em icon's pixels). |
