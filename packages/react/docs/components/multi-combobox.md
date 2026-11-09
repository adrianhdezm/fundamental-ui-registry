## multi-combobox

Sources: Angular [`registry/ui/multi-combobox`](../../../angular/registry/ui/multi-combobox/)
(`multi-combobox.ts`, its spec and stories, itself from `@fundamental-ngx/core`'s `fd-multi-combobox`) · no
fundamental-react source · fundamental-styles
[Multi Combobox](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-patterns-multi-combobox--docs) ("As
Form Item", "Grouping", "Two Column Combo Box", "Semantic", "Read Only And Disabled", "Mobile Mode")
Registry: `registry/ui/multi-combobox/multi-combobox.tsx`, on our [token](token.md) (`Tokenizer`, `Token`,
`TokenizerInput`), [popover](popover.md) (Base UI Popover, anchored to the field), [dialog](dialog.md) (mobile mode),
[bar](bar.md), the `LIST_DROPDOWN_ITEM`/`LIST_DROPDOWN_CHECK` classes, `ListGroupHeader`, `ListTitle`, `ListSecondary`
and `ListMessage` of [list](list.md), and the field button variables of [input-group](input-group.md)
(`INPUT_GROUP_BUTTON_VARS`, `STATE_BUTTON_VARS`).

API:

```tsx
<MultiCombobox
  inputId="food"
  displayKey="name"
  lookupKey="id"
  dataSource={food}
  selectedItems={chosen}
  onSelectedItemsChange={setChosen}
/>
```

- Every Angular input in React form: `dataSource`, `selectedItems` (the model: `selectedItems`/`defaultSelectedItems`/
  `onSelectedItemsChange`), `displayKey`, `lookupKey`, `secondaryKey`, `showSecondaryText`, `secondaryTextAlignment`,
  `group`, `groupKey`, `matchingStrategy`, `limitless`, `mapLimit`, `showSelectAll`, `selectAllLabel`,
  `invalidEntryMessage`, `invalidEntryDisplayTime`, `autoComplete`, `placeholder`, `inputId`, `state`, `stateMessage`,
  `disabled`, `readOnly` (Angular's `readonly`), `required`, `glyphAriaLabel`, `addonIconTitle`,
  `openDropdownOnAddOnClicked`, `buttonFocusable`, `maxHeight`, `fillControlMode`, `bodyMaxWidth`, `byline`,
  `maxVisibleTokens`, `mobile`, `mobileConfig`, `closeLabel` and `tokensLabel`. `ariaLabel`/`ariaLabelledBy` are the
  native `aria-label`/`aria-labelledby`, which go to the input and name the list (`aria-describedby` goes to the input
  too, after the state message).
- Outputs: `selectionChange` and the model's change are one callback, `onSelectedItemsChange(items)`; `isOpenChange`
  is `onOpenChange` (with `open`/`defaultOpen`); `addOnButtonClicked` is `onAddOnButtonClick`. The public `open()`,
  `close()` and `selectAll()` are `actionsRef.current.open()`, `close()` and `selectAll(select)`.
- Templates (`fdMultiComboboxTemplate`): `optionItemTemplate` is `renderItem(item, { index })`,
  `selectedItemTemplate` is `renderSelectedItem(item, { index })`, `secondaryItemTemplate` is
  `renderSecondaryText(item)`, `groupItemTemplate` is `renderGroupHeader(label)`.
- New: `inputRef`, `inputProps` and `container` (the element the list or the mobile dialog renders into), as
  multi-input. Native props, `className` and `ref` go to the root `<div>`.

Behaviour, ARIA and keyboard (Angular's): the input is a `combobox` (`aria-autocomplete` `both`, `list` without
`autoComplete`; `aria-haspopup` `listbox`, `dialog` in mobile mode; `aria-expanded`, `aria-controls`,
`aria-activedescendant`, `aria-required`, `aria-readonly`, `aria-invalid` in the error state) and keeps the focus.
Typing filters the items (the start of any word by default, the start of the text, or anywhere), opens the list,
bolds the typed text and completes it inline with the first item that starts with it (the completion selected); text
that matches nothing is rejected and shows "Invalid entry" for `invalidEntryDisplayTime` (the field in the error
state, the message describing the input and on top of the list). At most `mapLimit` matches show unless `limitless`.
Down and Up highlight options (the select all option first, Up back to none), Space toggles the highlighted option,
Enter toggles it and closes, Ctrl+A selects and Ctrl+Shift+A deselects all while an option is highlighted, Alt+Down
opens, Alt+Up, Escape (only the list, not a dialog around it) and Tab close. While the list is closed, Down and Up
put the next item that is not chosen in the input and Enter chooses the item the text names. A click on an option
toggles it and closes the list, a click on its check box keeps it open, Shift clicks choose or remove the range from
the last click. Leaving the field with the exact text of an item chooses it. Options are check box options in a
multi-selectable `listbox`, grouped in `role="group"` lists labelled by a presentational `ListGroupHeader`; the
select all option shows a partial check while some items are chosen. Tokens are removed with their close icon,
Backspace and Delete; without focus only `maxVisibleTokens` tokens render and the others count in the tokenizer's
"n more" link, which lists only the chosen items. `stateMessage` describes the input, is announced (polite) while the
list is closed and shows on top of the open list. Read-only fields have no addon button and read-only tokens. In
mobile mode the field opens a full-screen dialog (on Enter, Down, a printed key or the addon button) with the title,
a close button, the field (without addon button) in the subheader, the list in the body (focusable, with the input's
keys) and the approve and cancel buttons; the focus goes to the dialog input and back to the field input.

**Differences on purpose:**

- Not Base UI's Combobox (as [multi-input](multi-input.md)): the list is the ported `Popover` (Base UI Popover)
  anchored to the tokenizer field with no trigger, Angular's `fd-popover` with `triggers=[]`. Angular's
  multi-combobox has its own highlight model that Combobox's keyboard and selection handling would fight: the select
  all row as a highlight before the first option, Up back to no highlight, Down and Up on a closed list writing the
  next unchosen item into the input instead of opening it, Space toggling and Enter toggling and closing, Ctrl+A and
  Ctrl+Shift+A, rejection of text that matches nothing, a click on an option closing the list while a click on its
  check box keeps it open, Shift ranges and the "only chosen items" mode of the "n more" link. Combobox would also
  hide the rest of the page (the tokens included) while open. The tokens are the ported tokenizer, whose Backspace
  and arrow keys already follow Angular.
- The popover body has `role="presentation"` (Angular's `bodyRole=null`): the list inside is the popup the input
  controls.
- The popup's minimum width is fundamental-styles' dropdown fill, the field width less two `--sapGroup_BorderWidth`
  (2px narrower than the field), up to 40rem; Angular's popover fills the whole field width and has no maximum. With
  `bodyMaxWidth="container"` the popup stays as wide as the field.
- Approve mode (mobile with `approveButtonText`): the selection made in the dialog is a draft shown in the dialog's
  tokens and list, and `onSelectedItemsChange` is called once on approve; cancel and the close button drop it. Angular
  writes its `selectedItems` model at once and only holds back `selectionChange` and the form control; React has one
  channel. `actionsRef.close()` on an open mobile dialog drops the draft (as cancel).
- A Shift click range keeps its anchor while the text does not change, so Shift clicks on check boxes (which keep the
  list open) choose ranges on desktop too. Angular clears the anchor after every check box click (`setText('')`), so
  there it only works in the mobile dialog (see Angular issues).
- An Angular `Observable` data source is not ported: `dataSource` is an array, and data that arrives later is a new
  array (the "Data sources" and "Dynamic data source" stories load it after a timer).
- The state message's description is rendered once at the root; Angular renders it in the control template, which
  the mobile mode renders twice (page and dialog), so its id is duplicated. The polite live region stays mounted and
  gets the text when the list closes; Angular creates the region together with its text, which screen readers often
  do not announce.
- The completion is kept in the input's own text state (the typed text still filters), and selected in a layout
  effect, instead of writing `field.value` after the next render.
- Read-only fields have no field shadow and the default field hovers with the field hover shadow, as
  fundamental-styles' multi combobox (an input group around the tokenizer); the plain tokenizer keeps its own.
- The Angular `ControlValueAccessor` is not ported (`onBlur` passes through to the root for "touched"); `disabled` is
  a prop.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                            | Cause                                                                                                                                   | Resolution                                                                                |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| High contrast compact: tokens 1px higher, the input 22px instead of 26px high                         | fundamental-styles' input keeps its compact height inside the 2px field border, so its row is taller than the field and the tokens move | Kept, as multi-input: the input fits the field (as the tokenizer, see [token](token.md)). |
| Compact hovered field: the bottom three pixel rows up to 7 colour levels lighter                      | Anti-aliasing of the hover shadow on the bottom border (the styles match)                                                               | Kept: not visible.                                                                        |
| Input padding 5px (4px compact) on both sides; fundamental-styles' input 0 in cozy and 8px in compact | The tokenizer input's padding (it matches fundamental-styles' tokenizer)                                                                | Kept (ignored in the case), as multi-input and the tokenizer.                             |
