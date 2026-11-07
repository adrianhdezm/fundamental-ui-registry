## list

Sources: fundamental-react [List](https://github.com/SAP/fundamental-react/tree/main/src/List) · Angular
[`registry/ui/list`](../../../../angular/registry/ui/list/) · fundamental-styles
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
- Not ported until their components are:
  the toolbar and input group of the filter story (a toolbar `div` with an `Input`), and Angular's `fdInfiniteScroll` (the story listens to `onScroll`).

### Stories vs. sources

| Source            | Example                                 | React story         | Status     | Notes                                                                                                                         |
| ----------------- | --------------------------------------- | ------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| fundamental-react | simple                                  | `Simple`            | ✅ covered |                                                                                                                               |
| fundamental-react | headerFooter                            | `HeaderFooter`      | ✅ covered | `Title` heading with `aria-labelledby`, `ListFooter render={<div />}`.                                                        |
| fundamental-react | noBorder                                | `NoBorder`          | ✅ covered |                                                                                                                               |
| fundamental-react | compact                                 | `Compact`           | ✅ covered | `data-density="compact"`.                                                                                                     |
| fundamental-react | iconsLeft                               | `IconsLeft`         | ✅ covered |                                                                                                                               |
| fundamental-react | iconsRight                              | `IconsRight`        | ✅ covered |                                                                                                                               |
| fundamental-react | secondaryText                           | `SecondaryText`     | ✅ covered | The footer holds "Total" and the sum.                                                                                         |
| fundamental-react | byline                                  | `OrderSummary`      | ✅ covered |                                                                                                                               |
| fundamental-react | selection                               | `CheckoutSelection` | ✅ covered | Checkboxes in the items of a `selection` list.                                                                                |
| fundamental-react | partialNavigation                       | `PartialNavigation` | ✅ covered | `ListLink` in the navigating items.                                                                                           |
| fundamental-react | navigationList                          | `NavigationList`    | ✅ covered |                                                                                                                               |
| fundamental-react | actionList                              | `ActionList`        | ✅ covered |                                                                                                                               |
| fundamental-react | dev                                     | `Playground`        | ✅ covered | Knobs are the Playground controls.                                                                                            |
| fundamental-react | noStyles                                | —                   | ➖ n/a     | No `cssNamespace`.                                                                                                            |
| Angular           | Standard, secondary text and icons      | `Default`           | ✅ covered | Sections stacked at full width; secondary texts and the "icon after" glyph as fundamental-styles'. Avatar item: after avatar. |
| Angular           | Interactive, groups, actions and footer | `Interactive`       | ✅ covered | Texts of the interactive items, group header, footer and action as fundamental-styles'.                                       |
| Angular           | Selection                               | `Selection`         | ✅ covered | Item texts as fundamental-styles' ("List item n").                                                                            |
| Angular           | Navigation (links)                      | `Navigation`        | ✅ covered | Plus a navigated item with an indicator.                                                                                      |
| Angular           | Byline and subline                      | `Byline`            | ✅ covered | Subline items with `Avatar`; first item as fundamental-styles'.                                                               |
| Angular           | Filter and sort                         | `FilterSort`        | ✅ covered | A toolbar `div` with `Input` (toolbar, input group: after those).                                                             |
| Angular           | Complex (borderless, groups and footer) | `Complex`           | ✅ covered |                                                                                                                               |
| Angular           | Keyboard support                        | `KeyboardSupport`   | ✅ covered | `actionsRef.setItemActive(0)`.                                                                                                |
| Angular           | Infinite scroll                         | `InfiniteScroll`    | ✅ covered | `onScroll` instead of `fdInfiniteScroll` (not ported).                                                                        |
| Angular           | Loading                                 | `Loading`           | ✅ covered | Text and custom-shape skeletons in the items, as Angular.                                                                     |
| Angular           | Byline: borderless                      | `BylineBorderless`  | ✅ covered |                                                                                                                               |
| Angular           | Byline: selection                       | `BylineSelection`   | ✅ covered |                                                                                                                               |
| Angular           | Byline: buttons and counter             | `BylineButtons`     | ✅ covered |                                                                                                                               |
| Angular           | Byline: wrap                            | `BylineWrap`        | ✅ covered |                                                                                                                               |
| Angular           | Byline: interactive                     | `BylineInteractive` | ✅ covered |                                                                                                                               |
| Angular           | Byline: unread                          | `BylineUnread`      | ✅ covered |                                                                                                                               |

### Tests vs. sources

| Source            | Behaviour                                                      | React test                                                                               | Status     |
| ----------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------- |
| Angular           | One tab stop: first entry, then the last focused one           | has one tab stop: the first entry, then the last focused one                             | ✅ covered |
| Angular           | Arrow keys, Home/End, Page Up/Down                             | arrow keys move focus between items; Home/End and Page Up/Down                           | ✅ covered |
| Angular           | Key manager rebuilt when items change                          | keeps up with items that change                                                          | ✅ covered |
| Angular           | setItemActive                                                  | setItemActive focuses the entry at the index and moves the tab stop to it                | ✅ covered |
| Angular           | Clicking an item makes it the tab stop                         | clicking an item makes it the tab stop                                                   | ✅ covered |
| Angular           | Keys in a field stay with the field                            | keys typed into a field inside an item stay with the field                               | ✅ covered |
| Angular           | focusEscapeList                                                | onFocusEscapeList is called at the ends instead of moving focus                          | ✅ covered |
| Angular           | keyboardSupport false                                          | keyboardSupport={false} turns arrow navigation off                                       | ✅ covered |
| Angular           | Options with aria-selected; inert checkbox toggled by the item | items are options with aria-selected; the checkbox is inert and the item toggles it      | ✅ covered |
| Angular           | Selection state described for screen readers                   | describes the selection state for screen readers                                         | ✅ covered |
| Angular           | No selection text outside selection lists                      | items of a list without selection have no aria-describedby and no selection text         | ✅ covered |
| Angular           | Radio items select their radio on click and Space              | radio items select their radio button on click and Space; arrow keys move between items  | ✅ covered |
| —                 | Disabled controls stay unchanged                               | disabled controls are not changed through their item                                     | ✅ added   |
| Angular           | selectedChange from click, Space, Enter                        | onSelectedChange is called on clicks, Space and Enter                                    | ✅ covered |
| Angular           | Follows the selected input                                     | follows the selected prop                                                                | ✅ covered |
| Angular           | Clicks on inner controls do not toggle                         | clicks on a control inside the item do not toggle it                                     | ✅ covered |
| Angular           | Inactive and preventClick                                      | inactive items ignore the pointer and preventClick items ignore clicks                   | ✅ covered |
| Angular           | Inactive items skipped by the arrow keys                       | inactive items are skipped by the arrow keys                                             | ✅ covered |
| Angular           | keyDown output                                                 | onKeyDown receives the keys of plain items                                               | ✅ covered |
| Angular           | Link fills the item; Enter and Space open it                   | the link fills the item and is opened with Enter or Space on the item                    | ✅ covered |
| Angular           | Navigation indicator and reserved space                        | shows the navigation indicator arrow and reserves its space in the list                  | ✅ covered |
| Angular           | Navigated link marker                                          | navigated marks the link with the selection border colour                                | ✅ covered |
| Angular           | Counter inside the link                                        | a counter is shown inside the link                                                       | ✅ covered |
| Angular           | Focusable link takes the item's focus                          | a focusable link receives the focus of its item                                          | ✅ covered |
| Angular           | Growing item loads more and keeps focus                        | growing item loads more (button) and keeps focus                                         | ✅ covered |
| Angular           | Growing button fills the item, bold label                      | the growing button fills the item and its label is bold                                  | ✅ covered |
| Angular           | Byline layout, two columns, status colour                      | byline items show the title above the byline; twoCol splits it                           | ✅ covered |
| Angular           | Unread title and dot                                           | unread items have a bold title and an unread dot                                         | ✅ covered |
| Angular           | Subline layout                                                 | subline items show the subline below the title                                           | ✅ covered |
| Angular           | Counter, secondary, active check mark, no data                 | counter, secondary text and the active check mark                                        | ✅ covered |
| Angular           | Group headers focusable unless presentational                  | group headers are focusable list items unless presentational                             | ✅ covered |
| Angular           | Message above, footer below                                    | the message sits above the items and the footer below them                               | ✅ covered |
| Angular           | Success message background                                     | a success message uses the success background                                            | ✅ covered |
| Angular           | User classes merged                                            | passes className and native props to every part                                          | ✅ covered |
| Angular           | Truncate and wrap                                              | titles truncate by default and wrap in a wrap list                                       | ✅ covered |
| Angular           | Compact density                                                | compact density makes the items shorter                                                  | ✅ covered |
| Angular           | Action item in Horizon and high contrast                       | in Horizon the whole item is the button; in high contrast it is an inset bordered button | ✅ covered |
| fundamental-react | List: prop spreading, ref (`UL`)                               | passes className, native props and the ref to the list (fundamental-react)               | ✅ covered |
| fundamental-react | Byline, Footer, Icon, Item, Selection, Text: prop spreading    | passes className and native props to every part                                          | ✅ covered |
| fundamental-react | ListItem onClick                                               | onClick of an item is called on clicks (fundamental-react)                               | ✅ covered |
| —                 | onClick once when the item clicks its control                  | a selection item calls onClick once when it toggles its control                          | ✅ added   |
| fundamental-react | List.Header level (h2, h3)                                     | —                                                                                        | ➖ n/a     |

`List.Header` is not ported: the heading is the `Title` component, whose spec covers the levels.

### Visual comparison

`pnpm visual list`: 34 cases × 16 combinations, 519/544 in the full run; one more ("secondary positive" in HC
White compact LTR, 10.7% of pixels, no style difference) passes when its combination is run again, and the other 24 are
kept below. Stories use fundamental-styles' texts where that is harmless, and the compared lists are full width, so
most cases are compared by pixels: the standard item and title, the borderless item; the interactive item at rest, on
hover, with keyboard focus, selected and selected on hover; the positive, critical and negative secondary texts; the
icon before and after the title; the group header, the footer, the action item and its button at rest and on hover;
the link item and the link at rest and on hover; the byline item, its thumbnail and byline text, and the unread dot;
the checkbox item at rest and on hover and the selected checkbox. Styles only (other texts): the unread title, the
counter ("12,345" here, grouped as Angular's number pipe), the navigated link with the navigation indicator, the
two-column byline, and the subline title and text. Reviewed by eye in Horizon cozy and compact, LTR and RTL (`Default`,
`Interactive`, `Selection`, `Navigation`, `Byline`, `BylineUnread`).

| Difference                                                                                                                       | Cause                                                                                                                                                                                      | Resolution                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Item icons 20px high instead of 18px (line height normal)                                                                        | `tailwind-merge` drops the icon's `leading-none` because the list's `text-(length:--li-ifs)` comes after it                                                                                | Fixed: `leading-none` after the size. Angular issue.                                                                                              |
| Item icons have a transparent background; fundamental-styles' inherit the item's                                                 | Not set                                                                                                                                                                                    | Fixed: `bg-inherit` (no visible change).                                                                                                          |
| Thumbnail icons 1rem instead of 2rem                                                                                             | The `Icon` keeps its own default size (`text-[1rem]`) inside the 2rem thumbnail                                                                                                            | Fixed: the thumbnail sets its icons to 2rem. Angular issue (the same with `fd-icon`).                                                             |
| Thumbnail `min-height` 0 instead of 48px                                                                                         | Not set                                                                                                                                                                                    | Fixed: `min-h-12` (no visible change).                                                                                                            |
| Unread dot 7px high instead of 6px                                                                                               | `tailwind-merge` drops the icon's `leading-none` before `text-[0.375rem]`                                                                                                                  | Fixed: `leading-none` after the size. Angular issue.                                                                                              |
| Hovered link keeps a transparent bottom border; fundamental-styles shows the list border colour                                  | Not set (the hover background showed in the border line)                                                                                                                                   | Fixed: `hover:border-sap-list-border-color` on the link. Angular issue.                                                                           |
| Navigated link's `box-shadow` has Tailwind's four transparent ring layers before the marker                                      | The `shadow-[…]` utility                                                                                                                                                                   | Fixed: `[box-shadow:…]`. Angular issue (computed styles only).                                                                                    |
| Action button on hover: the list hover background (16 combinations; by pixels only in the HC themes, where the colour is strong) | fundamental-styles gives action items no hover state                                                                                                                                       | Kept: Fiori action list items (UI5's `ActionListItem`) take `--sapList_Hover_Background` on hover, as every interactive list item; as in Angular. |
| HC Black and HC White: unread dot 11–24% off by pixels (8 combinations), no style difference                                     | Not in the component: same colour (`--sapAccentColor6`), size and offset in the item (36.5px); fundamental-styles' item sits at a fractional y, so its 6px dot is anti-aliased differently | Kept.                                                                                                                                             |
