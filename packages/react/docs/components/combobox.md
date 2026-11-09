## combobox

Sources: fundamental-react [ComboboxInput](https://github.com/SAP/fundamental-react/tree/main/src/ComboboxInput)
(`ComboboxInput.js`, its stories and tests) · Angular
[`registry/ui/combobox`](../../../angular/registry/ui/combobox/) (`combobox.ts`, spec, stories) ·
fundamental-styles [Combobox Input](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-patterns-combobox-input--docs)
(the field, the dropdown popover, its list, groups, two columns, the semantic message, disabled and read-only)
Registry: `registry/ui/combobox/`, on Base UI's `Combobox` (Root, InputGroup, Input, Portal, Positioner, Popup, List,
Item, Group, GroupLabel), with our [input-group](input-group.md) (`InputGroup`, `InputGroupInput`, `InputGroupAddon`),
`Button`, the `LIST_DROPDOWN_ITEM` classes, `ListGroupHeader`, `ListTitle` and `ListMessage` of [list](list.md), the
`popoverSurfaceVariants` of [popover](popover.md), `FormInputMessageGroup` and `FormMessage` of [form](form.md), and
[dialog](dialog.md) and [bar](bar.md) (`BarMiddle`, `BarElement`, `ButtonBar`) for the mobile dialog.

API: Angular's inputs in React form. `dropdownValues`, `displayFn`, `filterFn`, `includes`, `groupFn`, `highlighting`,
`autoComplete`, `communicateByObject`, `valueProperty`, `state`, `disabled`, `readOnly`, `required`, `isSearch`,
`showClearButton`, `clearButtonTitle`, `showDropdownButton`, `glyph`, `glyphFont`, `glyphAriaLabel`, `buttonFocusable`,
`clearButtonFocusable`, `closeOnSelect`, `fillOnSelect`, `openOnKeyboardEvent`, `closeOnOutsideClick`, `maxHeight`,
`fillControlMode`, `width`, `byline`, `tabOutStrategy`, `mobile`, `mobileConfig`, `closeLabel`, `resultsLabel`,
`inputId`, `placeholder` and `title` are kept. The `ControlValueAccessor` is `value`/`defaultValue`/`onValueChange`
(called for the user's changes only, as Angular's `onChange`; a `value` that differs from the current one is written
as `writeValue`). `itemClicked` is `onItemSelect({ item, index })`, `openChange` is `onOpenChange`, `inputTextChange`
is `onInputValueChange`, `searchFn` is `onSearch(text)`, `itemTemplate` and `*fdComboboxItem` are
`renderItem(item, { inputText })`, `dropDownMaxWidthPx` and `noDropDownMaxWidth` are `dropdownMaxWidth` and
`noDropdownMaxWidth`, the public `open()`/`close()` are `actionsRef`, and projected `fdListMessage`s are `children`
(`ListMessage`, made presentational). `comboboxId` is generated (`useId`); `ariaLabel`/`ariaLabelledBy` are
`aria-label`/`aria-labelledby`, which go to the input and the list. Native props, `className` and `ref` go to the
root `<div>`.

fundamental-react's props: `id` is `inputId`, `label` is a `FormLabel htmlFor`, `ariaLabel` is `aria-label`,
`arrowLabel` is `glyphAriaLabel`, `options` (`{ key, text }`) are `dropdownValues` with `displayFn`, `selectedKey` is
`value`/`defaultValue` with `communicateByObject valueProperty="key"`, `typedValue` is `value` (text mode),
`optionRenderer` is `renderItem`, `searchFullString` is `includes` (fundamental-react matched the start of any word,
ours matches anywhere, as Angular), `selectionType` `manual` is `autoComplete={false}` and `auto-inline` the default
`autoComplete`, `validationState: { state, text }` is `state` and `stateMessage`, `compact` is
`data-density="compact"`, `onSelectionChange` is `onValueChange` (and `onItemSelect`), `onClick` is the native
`onClick` of the root. `noMatchesText`, `showAllEntries`, `maxHeight`, `inputProps`, `buttonProps` (the dropdown
button) and `popoverProps` (the popup) are kept, plus `inputRef` and `inputGroupProps`. Gone: `filterable` (a
`filterFn` that returns every value), `selectionType="auto"` (Angular has no mode that chooses the first match without
completing it), `formItemProps` and `validationOverlayProps` (the field is not wrapped in a form item; the message is
a `FormMessage`), `cssNamespace`.

Behaviour and ARIA (Angular): the input is a `combobox` with `aria-autocomplete="both"` (`"list"` without
`autoComplete`), `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`, and keeps
the focus. Typing filters the list (by the start of the text, anywhere with `includes`, or `filterFn`), bolds the
search text, completes the text inline with the first value that starts with it (the completion selected, taken over
by Enter, Right, Tab or leaving the field), and opens the list. Down and Up highlight values and put them in the
input (Up from the first value goes back to no highlight, Down stops at the last); while closed they step through the
values. Enter chooses the highlighted value, or takes over the completion, calls `onSearch` and closes; Escape closes
the list and puts the text back (only the list, not a dialog around the combobox); Alt+Down opens the whole list,
Alt+Up closes it. The dropdown button (out of the tab order unless `buttonFocusable`, clicks keep the focus in the
input) toggles the whole list and calls `onSearch`. Tab and an outside click leave the field by `tabOutStrategy`:
a unique completion is taken over, free text stays in text mode, other text reverts to the last choice. A polite live
region announces the number of results and describes the input. Groups are `role="group"` lists labelled by a
presentational `ListGroupHeader`. In mobile mode the field is a `combobox` with `aria-haspopup="dialog"` that opens a
full-screen dialog (title, close button, a search field in the subheader, an instruction, the list, approve and
cancel buttons); with `approveButtonText` the choice is a draft until approved, Cancel, the close button and Escape
discard it.

Base UI's Combobox holds the parts together: the ARIA wiring of input, list and options, the positioner and portal,
the outside press (the input group is inside), and the inline list of the mobile dialog. Its state is driven from
ours (controlled `open` and `inputValue`, `value={null}`, no filtering, no hover highlight): the keys the Angular
combobox handles (arrows, Enter, Escape) skip Base UI's handlers (`preventBaseUIHandler`), so the highlight, the inline
completion and the closed-list stepping follow Angular, and the options carry our ids, `aria-selected` and the
`data-active` highlight.

**Differences, on purpose:**

- While the list is open, Base UI hides the rest of the page from assistive technology (`aria-hidden`, its design for
  an input outside its popup), including the `<label>` of the field and the field's own buttons. The input and the
  list refer to the field's labels with `aria-labelledby` (the ids of `input.labels`), so they keep their name; the
  clear button leaves the tab order while the list is open (the dropdown button is out of it anyway); and the "Open: …"
  stories show one combobox each, since other fields of a story would be focusable content in hidden parts of the
  page (Angular's open stories show the whole example).
- `stateMessage` (fundamental-react's `validationState.text`): a `FormMessage` under the field while it has the focus
  and the list is closed (it describes the input, as the other fields' messages), and a `ListMessage` on top of the
  open list, kept in view while it scrolls (fundamental-styles' semantic combobox). Angular had only `state` and
  projected list messages (both kept).
- `noMatchesText` (fundamental-react) keeps the list open with a status row when nothing matches; without it the list
  closes, as Angular. `showAllEntries` (fundamental-react) lists the other values after the matching ones.
- In mobile immediate mode (no approve button) Cancel, the close button and Escape keep the choices, which are already
  applied; Angular put the old text back in the field without telling the form (see Angular issues).
- The search field in the mobile dialog has `aria-expanded="true"` (the list is in view); Angular's says `false`.
- `noDropdownMaxWidth` widens the list too; Angular's list keeps its own 40rem maximum.
- `onSearch` gets the text; Angular's `searchFn` got nothing.
- `name` goes to the input (the text is submitted); Base UI's hidden input gets neither `name` nor `required`.
- Escape keeps the text (Angular); fundamental-react cleared it.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                         | Cause                                                                                          | Resolution                                                                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Group header title without the 1rem minimum height | `ListTitle` in a group header has no minimum height                                            | Kept (ignored in the case): the title sits on a 2rem line, so it is not visible.                            |
| Secondary text narrower (71px instead of 95px)     | Theirs grows in the item and aligns its text to the end, ours is pushed to the end (`ms-auto`) | Kept (ignored in the case): the text ends at the same place, 15px before the item end (checked in the DOM). |
