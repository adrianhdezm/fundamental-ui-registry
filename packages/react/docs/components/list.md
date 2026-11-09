## list

Sources: fundamental-react [List](https://github.com/SAP/fundamental-react/tree/main/src/List) · Angular
[`registry/ui/list`](../../../angular/registry/ui/list/) · fundamental-styles
[List](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-list-standard--docs)
([Byline](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-list-byline--docs),
[Subline](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-list-subline--docs))
Registry: `registry/ui/list/`. Selection items use the ported `Checkbox` and `Radio` (Base UI); every part renders
through Base UI's `useRender`, so `render` swaps its element (`ListTitle render={<button />}`, `ListLink
render={<RouterLink />}`, `ListFooter render={<div />}`).

API: one component per Angular directive, with the Angular inputs as props: `List` (`byline`, `subline`,
`selection`, `noBorder`, `navigationIndicator`, `unreadIndicator`, `hasMessage`, `wrap`, `keyboardSupport`, `role`,
`selectedLabel`, `notSelectedLabel`, `onFocusEscapeList`), `ListItem` (`selected`/`defaultSelected`/`onSelectedChange`,
`interactive`, `inactive`, `noData`, `action`, `growing`, `unread`, `byline`, `wrap`, `active`, `counter`,
`counterRole`, `counterAriaLabel`, `preventClick`, `role`), `ListTitle` (`wrap`, `scope`), `ListTitleText`,
`ListSecondary` (`type`, `wrap`), `ListIcon` (`glyph`, `font`), `ListLink` (`navigationIndicator`, `navigated`,
`focusable`), `ListGroupHeader`, `ListFooter` (`align`), `ListMessage` (`type`), `ListContent`, `ListByline`
(`twoCol`, `wrap`), `ListBylineLeft`, `ListBylineRight` (`status`, `wrap`), `ListThumbnail`, `ListSubline` (`wrap`).
Angular's `setItemActive(index)` is on `actionsRef` (the `ref` is the `<ul>`, as fundamental-react's); its `keyDown`
output is the native `onKeyDown`. The dropdown helpers `LIST_DROPDOWN_ITEM`, `LIST_DROPDOWN_CHECK` and
`LIST_CHECK_GLYPH` are exported for select and combobox, as in Angular.

fundamental-react's props map as follows: `hasByline` is `byline`; `selectable` is `selection` (which also makes the
list a `listbox`); `navigation`/`partialNavigation` are a `ListLink` in the items that navigate (`url` is its `href`)
and `navigationIndicator`; `List.Text` is `ListTitle`, `List.Text secondary` is `ListSecondary`, `List.Text left` /
`right` are `ListBylineLeft` / `ListBylineRight`; `List.Byline twoColumns` is `ListByline twoCol`; `List.Icon` is
`ListIcon`; `List.Selection` is a `Checkbox` as a direct child of the item; `List.Item action` is a `ListItem action`
with a `ListTitle render={<button />}` (its `buttonProps` go on the title); `header`, `level`, `headerStyle` are a
heading (e.g. `Title`) that names the list with `aria-labelledby`, and `footer` a `ListFooter render={<div />}` after
it (see the `HeaderFooter` story); `compact` is `data-density="compact"` on the list or an ancestor.

Behaviour, as Angular's (CDK `FocusKeyManager`):

- One entry (item or group header) is in the tab order: the first, then the last focused or clicked one. Arrow Up and
  Down move between entries without wrapping, Home and End go to the first and last, Page Up and Down move by ten;
  inactive items are skipped. Keys typed in a field inside an item stay with the field. Arrow Up on the first or Down
  on the last entry calls `onFocusEscapeList('up' | 'down')` instead. `keyboardSupport={false}` takes every item out
  of the tab order and turns the keys off.
- Interactive items toggle their selection on click, Enter and Space (not on clicks of a button, link or field
  inside them); `preventClick` ignores clicks; selected items get `data-selected` and the selection colours.
- An item with a `Checkbox` or `Radio` as a direct child is an `option` with `aria-selected` from its control, and is
  described by a hidden "Selected" / "Not selected" text (`selectedLabel`, `notSelectedLabel`) in selection lists.
  The control sits in an inert wrapper and out of the tab order; a click, Enter or Space on the item clicks it (unless
  it is disabled), so the control's own `onCheckedChange` / the group's `onValueChange` report the change.
- A `ListLink` fills its item: the item opens it with Enter or Space (pressed colours while the key is down), and a
  `focusable` link takes the focus of its item. The item's `counter` moves into the link.

**Differences on purpose:**

- The tab stop is kept by the list on the DOM (it finds its `[data-list-focusable]` entries in document order and
  sets their `tabIndex`), so items rendered by any component inside the list take part; Angular collects them with
  `contentChildren`. A presentational group header (`role="presentation"`/`none`) is not an entry at all (Angular keeps
  it in the key manager, where it cannot take focus).
- Arrow keys with a modifier (Shift, Ctrl, Alt, Meta) are left alone; Angular's key manager ignores them too but the
  list still cancels their default.
- The item reads the checked state of its control from the control's `aria-checked` (Base UI), as Angular reads
  `checkState()`/`checked()` from its child component; `selected` on such items is ignored, as in Angular.
- A `Radio` needs a `RadioGroup`: put the group around the list with `role="none"` (the list is the listbox; the group
  only owns the value). The list handles the arrow keys, so the group never moves the selection with them.
- `selection` makes the list a `listbox` unless `role` says otherwise, as fundamental-react's `selectable` (Angular
  leaves it to `role`; options in a `list` fail axe).
- `selected` is controlled (`onSelectedChange` reports a toggle, the parent decides) with `defaultSelected` for
  uncontrolled items; Angular's `selected` input is a linked signal that a click overrides, and `setSelected()` sets it
  from outside, which a controlled `selected` covers.
- `ListIcon` and the unread dot use the `Icon` component (a `<span>`), not an `<i>`; a byline thumbnail icon is an
  `Icon` inside `ListThumbnail` (Angular can put both directives on one `<i>`). The thumbnail sizes its icon to 2rem.
- Angular's `value` input of `ListItem` (for components built on the list) is not ported: `value` is a native `<li>`
  attribute. Its deprecated `truncate` inputs are gone.
- Angular's `fdInfiniteScroll` on the list is the `infinite-scroll` component: the Infinite scroll story puts
  `useInfiniteScroll`'s ref on the `List` (`<InfiniteScroll render={<List />}>` does the same).

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                                                       | Cause                                                                                                                                                                                      | Resolution                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Action button on hover: the list hover background (16 combinations; by pixels only in the HC themes, where the colour is strong) | fundamental-styles gives action items no hover state                                                                                                                                       | Kept: Fiori action list items (UI5's `ActionListItem`) take `--sapList_Hover_Background` on hover, as every interactive list item; as in Angular. |
| HC Black and HC White: unread dot 11–24% off by pixels (8 combinations), no style difference                                     | Not in the component: same colour (`--sapAccentColor6`), size and offset in the item (36.5px); fundamental-styles' item sits at a fractional y, so its 6px dot is anti-aliased differently | Kept.                                                                                                                                             |
