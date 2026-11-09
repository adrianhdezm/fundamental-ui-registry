## multi-input

Sources: fundamental-react [MultiInput](https://github.com/SAP/fundamental-react/tree/main/src/MultiInput)
(`MultiInput.js`, its stories and tests) · Angular [`registry/ui/multi-input`](../../../angular/registry/ui/multi-input/)
· fundamental-styles
[Multi Input](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-patterns-multi-input--docs) ("As Form
Item", "Mobile Mode")
Registry: `registry/ui/multi-input/multi-input.tsx`, on our [token](token.md) (`Tokenizer`, `Token`,
`TokenizerInput`), [popover](popover.md) (Base UI Popover, anchored to the field), [dialog](dialog.md) (mobile
mode), [bar](bar.md), [button](button.md), [link](link.md), the `LIST_DROPDOWN_ITEM`/`LIST_DROPDOWN_CHECK` classes
of [list](list.md) and the field button variables of [input-group](input-group.md)
(`INPUT_GROUP_BUTTON_VARS`, `STATE_BUTTON_VARS`).

API:

```tsx
<MultiInput
  aria-label="Fruits"
  placeholder="Search here..."
  dropdownValues={fruits}
  selected={chosen}
  onSelectedChange={setChosen}
/>
```

- Every Angular input in React form: `selected` (a model: `selected`/`defaultSelected`/`onSelectedChange`), `open`
  (`open`/`defaultOpen`/`onOpenChange`), `dropdownValues`, `displayFn`, `valueFn`, `filterFn`, `includes`,
  `highlight`, `autoComplete`, `allowNewTokens`, `newTokenParseFn`, `newTokenValidateFn`, `placeholder`, `inputId`,
  `title` (on the input), `state`, `disabled`, `required`, `glyph`, `glyphFont`, `displayAddonButton`,
  `addOnButtonAriaLabel`, `addonIconTitle`, `openDropdownOnAddOnClicked`, `buttonFocusable`, `maxHeight`,
  `fillControlMode`, `bodyMaxWidth`, `placement`, `showAllButton`, `showAllLabel`, `maxVisibleTokens`, `byline`,
  `mobile`, `mobileConfig`, `closeLabel`, `selectAllLabel`, `tokensLabel`. Angular's `itemTemplate` is
  `renderItem(item)`; `ariaLabel`/`ariaLabelledBy` are the native `aria-label`/`aria-labelledby` (they go to the input
  and name the list, with `aria-describedby` on the input, as in search-input and input-group). The outputs are
  `onSearchTermChange`, `onAddOnButtonClick` and `onAllItemsSelectedChange`; the public `openList()`, `close()` and
  `selectAllItems()` are `actionsRef.current.open()`, `close()` and `selectAllItems()`. Native props, `className` and
  `ref` go to the root `<div>`. New: `container`, the element the list or the mobile dialog renders into (as
  search-input's).
- fundamental-react: `data` is `dropdownValues`, `buttonLabel` is `addOnButtonAriaLabel`, `onTagsUpdate` is
  `onSelectedChange`, `compact` is `data-density="compact"`, `inputProps`, `listProps` (the `ul`) and `popoverProps`
  (the popover body) are kept, `tagProps` is `tokenizerProps`, plus `inputRef`. `validationState` and
  `validationOverlayProps` are a `FormInputMessageGroup` around the multi-input with a `FormMessage`, as for the other
  fields (see [form](form.md)). `placeholder`, `disabled` and `className` are kept.

Behaviour, ARIA and keyboard (Angular's): the input is a `combobox` (`aria-autocomplete` `both`, or `list` with
`includes`/without `autoComplete`, `aria-haspopup` `listbox` or `dialog`, `aria-expanded`, `aria-controls`,
`aria-activedescendant`, `aria-required`, `aria-invalid` in the error state) and keeps the focus. Typing filters the
items (by the start of the text, any part with `includes`, or `filterFn`), opens the list, bolds the search text and
completes the text with the first match (the completion selected, so typing replaces it). Down opens the list and
then moves the highlight, Up moves it back (to none), Alt+Up and Tab close, Enter toggles the highlighted option or
selects the first match (with `autoComplete`) or adds the text as a new token (`allowNewTokens`, after
`newTokenValidateFn`, through `newTokenParseFn`), and Escape closes and clears the search. Options are check box
options in a multi-selectable `listbox`; clicks toggle, Shift clicks select or deselect the range from the last click.
A "Show All (n)" link under a filtered list clears the search. Tokens are removed with their close icon, Backspace
and Delete (the tokenizer's keys); without focus only `maxVisibleTokens` tokens render and the others count in the
tokenizer's "n more" link, which lists only the selected items. A press outside closes the list; presses on the field
do not. In mobile mode the field opens a full-screen dialog (on Enter, the arrows, a printed key or the addon button)
with the title, a close button, the field and a select all button (`aria-pressed`) in the subheader, the list in the
body (focusable, with the input's keys) and the approve and cancel buttons in the footer; the focus goes to the
dialog input and back to the field input.

**Differences on purpose:**

- The list is the ported `Popover` (Base UI Popover) anchored to the tokenizer field with no trigger, as Angular's
  `fd-popover` with `triggers=[]`, rather than Base UI's Combobox: the multi-input keeps the focus in the input, has
  its own highlight model (Down from a closed list only opens it, Up goes back to no highlight), Enter selects the
  first match or adds a token, Shift ranges, the "only selected" mode of the "n more" link and the inline completion,
  which Combobox's own keyboard and selection handling would fight; the tokens are the ported tokenizer, whose
  Backspace and arrow keys already follow Angular.
- The popover body has `role="presentation"` (Angular's `bodyRole=null`): the list inside is the popup the input
  controls.
- Approve mode (mobile with `approveButtonText`): the selection made in the dialog is a draft shown in the dialog's
  tokens and list, and `onSelectedChange` is called once on approve; cancel and the close button drop it. Angular
  updates its `selected` model at once and only holds back the form control; React has one channel, the form value.
- `actionsRef.close()` on an open mobile dialog drops the draft (as cancel).
- The completion is kept in the input's own text state (the search term stays what was typed), and selected in a
  layout effect after every render, instead of writing `field.value` after the next render as Angular does.
- The Angular `ControlValueAccessor` is not ported (`onBlur` passes through to the root for "touched"); `disabled` is
  a prop.
- fundamental-react opened the list on a click in the input and showed the value state message inside the open list;
  Angular opens on typing, Down and the addon button, and the message is a form input message group. Angular's
  behaviour is kept. fundamental-react's `buttonProps` (props of the addon button) are not ported: the button belongs to
  the tokenizer, which takes only its icon, name, title, focusability and popup attributes.
- The value-help icon is mirrored in RTL with the `rtl:` variant instead of reading the CDK directionality.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                       | Cause                                                                                                                                   | Resolution                                                                |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| RTL: the value-help icon is mirrored; fundamental-styles shows it unmirrored                     | fundamental-ngx (and Angular) mirror the value-help glyph in RTL                                                                        | Kept: the RTL look of fundamental-ngx, which the Angular package follows. |
| High contrast compact: tokens 1px higher, the input 22px instead of 26px high                    | fundamental-styles' input keeps its compact height inside the 2px field border, so its row is taller than the field and the tokens move | Kept: the input fits the field (as the tokenizer, see [token](token.md)). |
| Input padding 5px on both sides; fundamental-styles' input group input pads 10px at the end only | The tokenizer input's padding (it matches fundamental-styles' tokenizer)                                                                | Kept (ignored in the case), as the tokenizer.                             |
