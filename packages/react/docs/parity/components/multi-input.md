## multi-input

Sources: fundamental-react [MultiInput](https://github.com/SAP/fundamental-react/tree/main/src/MultiInput)
(`MultiInput.js`, its stories and tests) · Angular [`registry/ui/multi-input`](../../../../angular/registry/ui/multi-input/)
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

### Stories vs. sources

| Source            | Example                           | React story                               | Status     | Notes                                                                           |
| ----------------- | --------------------------------- | ----------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| fundamental-react | primary                           | `Primary`                                 | ✅ covered | fundamental-react's data and label.                                             |
| fundamental-react | compact                           | `CompactStory` ("Compact")                | ✅ covered | `data-density="compact"` on the form item.                                      |
| fundamental-react | disabled                          | `Disabled`                                | ✅ covered | With two tokens.                                                                |
| fundamental-react | validationStates                  | `ValidationStates`, `OpenValidationState` | ✅ covered | The four states, messages in form input message groups (shown on focus).        |
| fundamental-react | dev                               | `Playground`                              | ✅ covered | The knobs are the controls.                                                     |
| fundamental-react | noStyles                          | —                                         | ➖ n/a     | No `cssNamespace`.                                                              |
| Angular           | Playground                        | `Playground`                              | ✅ covered |                                                                                 |
| Angular           | Default                           | `Default`, `OpenFiltered`                 | ✅ covered | Search term shown; "Open: filtered" types and highlights an option.             |
| Angular           | Objects, templates and new tokens | `Items`                                   | ✅ covered | `renderItem` with `ListIcon`/`ListTitle` and `ListContent`/`ListByline`.        |
| Angular           | Forms                             | `Forms`                                   | ✅ covered | State in React: value, touched (`onBlur`) and dirty; error and disabled fields. |
| Angular           | Mobile                            | `Mobile`                                  | ✅ covered |                                                                                 |
| Angular           | Custom filter                     | `CustomFilter`                            | ✅ covered |                                                                                 |
| Angular           | Async values                      | `AsyncValues`                             | ✅ covered | A timer instead of an observable.                                               |
| Angular           | Option items                      | `OptionItems`                             | ✅ covered |                                                                                 |
| Angular           | Dropdown width                    | `DropdownWidth`                           | ✅ covered |                                                                                 |
| Angular           | Many tokens                       | `ManyTokens`                              | ✅ covered | Segmented button for 10, 100, 200 and 1000 tokens.                              |
| Angular           | Open: item template               | `OpenItemTemplate`                        | ✅ covered |                                                                                 |
| Angular           | Open: mobile                      | `OpenMobile`                              | ✅ covered |                                                                                 |
| —                 | (fundamental-styles As Form Item) | `AsFormItem`, `OpenDefault`               | ➕ extra   | fundamental-styles' texts, for the visual comparison.                           |

### Tests vs. sources

| Source            | Behaviour                                                 | React test                                                                                           | Status     |
| ----------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Selected values as tokens                                 | shows the selected values as tokens                                                                  | ✅ covered |
| Angular           | Filtering while typing, selected options marked           | filters the options while typing and marks the selected ones                                         | ✅ covered |
| Angular           | Click and Enter toggle, focus kept, activedescendant      | toggles options by click and with Enter on the highlighted option                                    | ✅ covered |
| Angular           | Enter selects the first match, clears the search          | selects the first match with Enter and clears the search                                             | ✅ covered |
| Angular           | New tokens                                                | adds new tokens when allowed; validates and parses new tokens                                        | ✅ covered |
| Angular           | Close icon and Backspace remove tokens                    | removes tokens with the close icon and Backspace                                                     | ✅ covered |
| Angular           | Escape closes, touched on focus out                       | closes with Escape and collapses the tokens when the focus leaves                                    | ✅ covered |
| Angular           | Placeholder only while nothing is selected                | shows the placeholder while nothing is selected                                                      | ✅ covered |
| Angular           | searchTermChange                                          | emits onSearchTermChange while typing and when the search clears                                     | ✅ covered |
| Angular           | Addon button opens and closes, focus in the input         | the addon button opens and closes the list and keeps the focus in the input                          | ✅ covered |
| Angular           | openDropdownOnAddOnClicked false                          | openDropdownOnAddOnClicked=false only emits onAddOnButtonClick                                       | ✅ covered |
| Angular           | Show All                                                  | Show All lists every option after filtering and clears the search                                    | ✅ covered |
| Angular           | displayFn and valueFn                                     | displayFn and valueFn map objects to tokens and values                                               | ✅ covered |
| Angular           | Selection kept when dropdownValues change                 | keeps the selection when dropdownValues change                                                       | ✅ covered |
| Angular           | selectAllItems, allItemsSelectedChange                    | select all and deselect all emit onAllItemsSelectedChange                                            | ✅ covered |
| Angular           | Disabled: not focusable or clickable until re-enabled     | a disabled multi input is not focusable or clickable until re-enabled                                | ✅ covered |
| Angular           | maxVisibleTokens, "+N more", collapse on blur             | renders maxVisibleTokens tokens plus "+N more" until focused, and collapses on an outside blur       | ✅ covered |
| Angular           | "+N more" button with Enter and Space                     | "+N more" is a button activated by Enter and Space                                                   | ✅ covered |
| Angular           | Mobile dialog approve and cancel                          | the mobile dialog applies the selection on approve and restores it on cancel                         | ✅ covered |
| Angular (code)    | Shift click ranges                                        | selects a range with Shift clicks                                                                    | ✅ covered |
| Angular (code)    | Up, Down, Alt+Up, Tab                                     | moves the highlight with Up and Down and closes with Alt+Up and Tab                                  | ✅ covered |
| Angular (code)    | Outside click closes, field clicks do not                 | closes the list on a click outside but not on a click in the field                                   | ✅ covered |
| Angular (code)    | itemTemplate, highlight                                   | renders the options with renderItem and without highlight                                            | ✅ covered |
| Angular (code)    | includes, filterFn                                        | matches any part of the text with includes, and with a custom filterFn                               | ✅ covered |
| Angular (code)    | Label, describedby, required, invalid, title, inputId     | labels the input and the list, and marks required and invalid fields                                 | ✅ covered |
| Angular (code)    | displayAddonButton, buttonFocusable, addon name and title | hides the addon button with displayAddonButton false and makes it focusable with buttonFocusable     | ✅ covered |
| Angular (code)    | placement, bodyMaxWidth                                   | opens the list above the field with placement top, and limits its width                              | ✅ covered |
| Angular (code)    | Option items with label and value                         | uses the label and value of option items without functions                                           | ✅ covered |
| Angular (code)    | Mobile: keys open, select all, list keys, close button    | the mobile dialog opens from the keyboard, selects all and applies right away without approve button | ✅ covered |
| Angular (story)   | Inner popovers in a dialog, Escape closes the list first  | in a dialog, opens its list above the dialog and closes only the list with Escape                    | ✅ covered |
| React             | open prop and actionsRef                                  | opens and closes through actionsRef and the open prop                                                | ✅ covered |
| React             | Uncontrolled                                              | works uncontrolled with defaultSelected                                                              | ✅ covered |
| fundamental-react | create, compact                                           | is shorter in compact density (fundamental-react compact)                                            | ✅ covered |
| fundamental-react | List hidden, shown from the dropdown button               | the addon button opens and closes the list …                                                         | ✅ covered |
| fundamental-react | List shown on a click in the input                        | —                                                                                                    | ➖ n/a     |
| fundamental-react | Add and remove tags with the check boxes, truncation      | lists the options with a check box and truncates tokens beyond maxVisibleTokens (fundamental-react)  | ✅ covered |
| fundamental-react | Remove a tag with its close icon                          | removes tokens with the close icon and Backspace                                                     | ✅ covered |
| fundamental-react | One validation overlay; validationOverlayProps            | shows one value state message in a form input message group, which describes the input               | ✅ covered |
| fundamental-react | Prop spreading: root, input, button, ul, tags, popover    | passes native props, className and the ref to the root, and the part props to their elements         | ✅ covered |

The click-in-the-input test is n/a: Angular's behaviour is kept (see above). The `buttonProps` spreading test is
covered for the other parts only (no `buttonProps`).

### Visual comparison

`pnpm visual multi-input`: 16 cases × 16 combinations, 228/256 matching after the fixes below; the others are the
kept differences of the table (16 RTL addon button cases and 12 high-contrast compact field and input cases). Cases,
against fundamental-styles' "As Form Item" multi input (our `AsFormItem` story, with its texts, full width and the
list rendered in the story): the field (tokens, input and addon button) at rest and hovered, its first token and
the addon button at rest and hovered (pixels); the input (styles); with the list open (`OpenDefault`), the popup and
the list (styles), a selected and an unselected option at rest and hovered (pixels), the check box (styles: theirs is
a check box label) and an option title (styles). Against "Mobile Mode": an option of the dialog list (styles) and the
select all button (pixels). Reviewed by eye in Horizon cozy and compact, LTR and RTL: `Default`, `OpenDefault`,
`OpenItemTemplate`, `OpenMobile` and `ValidationStates`.

| Difference                                                                                                                              | Cause                                                                                                                                    | Resolution                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Popup as wide as a wide field (1248px) and the list in it at most 600px; fundamental-styles' popup and list stop at 640px               | Angular's popover fills at least the field width, its list stops at `max-w-[37.5rem]`                                                    | Fixed: the list stops at 40rem and the popover's default maximum width is 640px (the field width still applies below it). Angular issue.                          |
| Options 40px high (32px compact); fundamental-styles' multi input list items are 44px, a selected one 45px (33px compact) with its line | Angular uses the dropdown item height of select and combobox (`LIST_DROPDOWN_ITEM`)                                                      | Fixed: `min-h-11` and a 1px taller selected option, end padding 1rem. Angular issue.                                                                              |
| Hovered field without the field hover shadow                                                                                            | The tokenizer removes the shadow on hover (fundamental-styles' plain tokenizer); its multi input is an input group, which has it         | Fixed: the field hover shadow on the multi-input field (value states keep their own). Angular issue (Angular keeps the field shadow).                             |
| High contrast: the field 40px high (30px compact) instead of 36px (26px)                                                                | The 36px addon button inside the 2px field border                                                                                        | Fixed: in high contrast the button overlaps the border (`-my-(--sapField_BorderWidth)`), as fundamental-styles' input group button. Angular issue (same classes). |
| List background white instead of transparent                                                                                            | Angular's list has `bg-sap-list-background`                                                                                              | Fixed: no list background; the options draw it (not visible).                                                                                                     |
| Option title `min-height` 0 instead of 1rem (0.875rem compact)                                                                          | Not in Angular                                                                                                                           | Fixed (computed styles only).                                                                                                                                     |
| RTL: the value-help icon is mirrored; fundamental-styles shows it unmirrored                                                            | fundamental-ngx (and Angular) mirror the value-help glyph in RTL                                                                         | Kept: the RTL look of fundamental-ngx, which the Angular package follows.                                                                                         |
| High contrast compact: tokens 1px higher, the input 22px instead of 26px high                                                           | fundamental-styles' input keeps its compact height inside the 2px field border, so its row is taller than the field and the tokens move  | Kept: the input fits the field (as the tokenizer, see [token](token.md)).                                                                                         |
| Input padding 5px on both sides; fundamental-styles' input group input pads 10px at the end only                                        | The tokenizer input's padding (it matches fundamental-styles' tokenizer)                                                                 | Kept (ignored in the case), as the tokenizer.                                                                                                                     |
| Option padding: fundamental-styles' start spacing is on the form item around its check box, ours on the option                          | Different markup (theirs a check box form item)                                                                                          | Ignored in the cases; the check box and text sit at the same place (pixels match).                                                                                |
| Popup and list 1px taller                                                                                                               | fundamental-styles' story leaves its "Kiwi" token unselected in the list; ours selects all four tokens (a selected option is 1px taller) | Ignored (height) in the styles-only popup and list cases.                                                                                                         |

Angular issues: the popup wider than its 600px list on wide fields, 40px options, no hover shadow on the field, and
the 40px high-contrast field (see the table).
