## search-input

Sources: fundamental-react [SearchInput](https://github.com/SAP/fundamental-react/tree/main/src/SearchInput)
(`SearchInput.js`, its stories and tests) · no Angular `search-input` (the Angular combobox's `isSearch` mode,
[`registry/ui/combobox`](../../../../angular/registry/ui/combobox/), was read for the list classes and the
announced result count) · fundamental-styles
[Input Group](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-input-group--docs)
("Input with 2 icon actions": clear and search buttons) and
[Combobox Input](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-patterns-combobox-input--docs) (the
suggestion popover, its list and the semantic message)
Registry: `registry/ui/search-input/`, on Base UI's `Autocomplete` (Root, InputGroup, Input, Portal, Positioner,
Popup, List, Item, Empty, Status), with our [input-group](input-group.md) (`InputGroup`, `InputGroupInput`,
`InputGroupAddon`), `Button`, the `LIST_DROPDOWN_ITEM` classes and `ListMessage` of [list](list.md) and the
`popoverSurfaceVariants` of [popover](popover.md).

API: fundamental-react's props in React 19 form. `searchList` (`{ text, callback? }[]`) and `subStringSearch` are
kept; `placeholder`, `disabled`, `readOnly`, `inputProps`, `inputGroupProps`, `listProps` and `popoverProps` (now the
props of the popup) are kept. fundamental-react's internal text state becomes `value`/`defaultValue`/
`onValueChange(value, { matches, reason, event })`: `onChange(event, matches)` is `onValueChange` (the matching
suggestions are in `details.matches`, the event in `details.event`). `onEnter(value)` is `onSearch(value)`, called on
Enter and on the search button. `onSelect(event, item)` is `onItemSelect(item, event)` (`onSelect` is a native DOM
prop of the root). `noSearchBtn` is `noSearchButton`, `searchBtnProps` is `searchButtonProps`,
`localizedText.searchBtnLabel` is `searchButtonLabel`. `validationState: { state, text }` is `state` and
`stateMessage`, as the other ported fields. `compact` is `data-density="compact"` on the field or an ancestor.
`formMessageProps` and `inShellbar` are gone: the message is a list message (see below), and a search input needs no
prop of its own in a [shellbar](shellbar.md): it is a child of `ShellbarActions` (before the actions) and its
transparent buttons take the shell colours (see the In a shellbar story). The shellbar's own search field is
`ShellbarSearch`, Angular's, without suggestions. New: `open`/`onOpenChange` (controlled suggestions), `inputId`, `name`,
`inputRef`, `showClearButton` (default true), `clearButtonLabel`, `noResultsText` ("No result", fundamental-react's
text), `resultsLabel` (the announced count, Angular combobox's `'{count} result list items'`), `maxHeight` (50vh) and
`container` (where the popup renders, as `PopoverBody`'s). Native props, `className` and `ref` go to the root `<div>`;
`aria-label`, `aria-labelledby` and `aria-describedby` go to the input (and name the listbox), as in input-group.

Behaviour and ARIA (fundamental-react plus the WAI-ARIA 1.2 combobox pattern): the input is a `combobox` with
`aria-autocomplete="list"`, `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`, and keeps the focus;
Down and Up highlight suggestions through `aria-activedescendant` (shown with the list's focus frame), Enter chooses
the highlighted suggestion (its text goes in the input, then its `callback` and `onItemSelect` are called) or else
calls `onSearch` and closes the list, Escape closes the list, a click outside closes it, and a click in the input
opens or closes it (fundamental-react). Typing filters by the start of the text (or anywhere with
`subStringSearch`, fundamental-react's `filterList`) and bolds the typed text. An empty result shows "No result" in a
polite live region (Base UI `Empty`), and the count of suggestions is announced (Base UI `Status`). Without
`searchList` (and when disabled or read-only) the input is a plain `searchbox` without popup. Read-only fields have
no buttons and no suggestions (fundamental-react), disabled fields disable both buttons.

**Differences, on purpose:**

- Escape closes the list and keeps the text; a second Escape (list closed) clears it, as the WAI-ARIA combobox
  pattern describes. fundamental-react closed the list and cleared the text with one Escape.
- The search button calls `onSearch` with the text and closes the list; fundamental-react's button only toggled the
  list (its `onEnter` was Enter only). Searching is what the button's name says.
- A clear button (fundamental-styles' "Input with 2 icon actions") appears while there is text, unless
  `showClearButton={false}`; fundamental-react had none.
- The typed text is bold also with `subStringSearch` (where it is in the suggestion); fundamental-react bolded only
  a prefix and nothing in substring mode.
- The value state message is a list message on top of the suggestions (fundamental-styles' semantic combobox), kept
  in view while they scroll (`sticky`), and describes the input (`aria-describedby` on a visually hidden copy);
  fundamental-react put a form message in the popover only.
- While the list is open, Base UI hides the rest of the page from assistive technology (`aria-hidden`, its
  Autocomplete's design for an input outside its popup), including the field's own buttons. So that no hidden element
  is tabbable, the clear and search buttons leave the tab order while the list is open (Tab from the input closes the
  list and leaves the field); they are tabbable again when it is closed.
- The popup is at least as wide as the field, up to 40rem (fundamental-ngx's 640px dropdown width), as
  fundamental-styles' `--dropdown-fill` body.

### Stories vs. sources

| Source             | Example                      | React story                                         | Status     | Notes                                                                                     |
| ------------------ | ---------------------------- | --------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| fundamental-react  | compact                      | `Compact`, `OpenCompact`                            | ✅ covered | `data-density="compact"` instead of `compact`.                                            |
| fundamental-react  | disabled                     | `Disabled`                                          | ✅ covered | Plus a disabled field with text (both buttons disabled).                                  |
| fundamental-react  | readOnly                     | `ReadOnly`                                          | ✅ covered |                                                                                           |
| fundamental-react  | substringSearch              | `SubstringSearch`, `OpenSubstring`                  | ✅ covered |                                                                                           |
| fundamental-react  | validationStates             | `ValidationStates`, `OpenError` … `OpenInformation` | ✅ covered | `state` and `stateMessage`; the "Open: …" stories show the message above the suggestions. |
| fundamental-react  | dev                          | `Playground`                                        | ✅ covered | Every knob, with `onValueChange`, `onSearch` and `onItemSelect` printed.                  |
| fundamental-react  | noStyles                     | —                                                   | ➖ n/a     | No `cssNamespace`.                                                                        |
| fundamental-styles | Input With Actions           | `Default`                                           | ✅ covered | "Input with 2 icon actions" (value 100), an empty field and one without search button.    |
| fundamental-styles | Combobox Input               | `OpenDefault`, `OpenFiltered`, `OpenNoResult`       | ✅ covered | The popover with all suggestions, filtered with a highlighted one, and "No result".       |
| fundamental-styles | Input Group Focus            | `Focus`                                             | ✅ covered | "Focus: default" (not in docs) focuses the input in `play`, for the visual focus case.    |
| —                  | (Angular input-group Search) | `WithoutSuggestions`                                | ✅ covered | A plain search field with `onSearch`, as Angular input-group's Search story.              |
| —                  | (fundamental-react test)     | `Controlled`                                        | ✅ covered | `value`/`onValueChange`, a list changed while typing, a suggestion `callback`.            |
| fundamental-react  | `inShellbar` (prop)          | `InShellbar`                                        | ✅ covered | A search input with suggestions among the `ShellbarActions` of a `Shellbar`.              |

There is no Angular `search-input`, so no Angular stories to cover.

### Tests vs. sources

| Source            | Behaviour                                                    | React test                                                                                                              | Status     |
| ----------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| fundamental-react | Enter key calls onEnter with the text                        | calls onSearch with the text on Enter and closes the suggestions                                                        | ✅ covered |
| fundamental-react | Click outside closes the list                                | closes the suggestions on a click outside                                                                               | ✅ covered |
| fundamental-react | Show/hide the list with clicks in the input                  | opens and closes the suggestions with a click in the input                                                              | ✅ covered |
| fundamental-react | Enter without a list                                         | calls onSearch on Enter without suggestions, as a plain search field                                                    | ✅ covered |
| fundamental-react | Click on a result                                            | chooses a suggestion with a click: fills the input, closes and calls its callback and onItemSelect                      | ✅ covered |
| fundamental-react | Search button click; onChange with the matches               | calls onSearch from the search button and closes the suggestions                                                        | ✅ covered |
| fundamental-react | Esc closes the list                                          | closes the suggestions on Escape, then clears the text on a second Escape                                               | ✅ covered |
| fundamental-react | onChange handler (2 tests)                                   | calls onSearch from the search button …; calls onSearch on Enter without suggestions …                                  | ✅ covered |
| fundamental-react | subString search                                             | matches anywhere in the suggestions with subStringSearch                                                                | ✅ covered |
| fundamental-react | popoverProps, formMessageProps spreading                     | spreads listProps on the list and popoverProps on the popup; shows the value state, with its message …                  | ✅ covered |
| fundamental-react | Prop spreading: root, input, button, `ul`                    | passes className, native props and ref to the root; spreads inputProps, inputRef, inputGroupProps and searchButtonProps | ✅ covered |
| fundamental-react | Prop spreading with `inShellbar`: input, search button       | spreads inputProps and searchButtonProps in a shellbar (fundamental-react inShellbar)                                   | ✅ covered |
| fundamental-react | List changed after creation                                  | updates the suggestions when the list changes                                                                           | ✅ covered |
| —                 | Combobox ARIA, filtering by the start, bold text, focus kept | is a combobox that opens its suggestions while typing and filters them by the start of the text                         | ✅ covered |
| —                 | Arrow keys, aria-activedescendant, Enter chooses             | highlights suggestions with the arrow keys and chooses with Enter (aria-activedescendant)                               | ✅ covered |
| —                 | Clear button; hiding the buttons; button names               | clears the text with the clear button …; can hide the clear button and the search button …                              | ✅ covered |
| —                 | Buttons out of the tab order while open                      | takes the buttons out of the tab order while the suggestions are open …                                                 | ✅ covered |
| —                 | "No result", announced count                                 | shows "No result" when no suggestion matches; announces the number of suggestions                                       | ✅ covered |
| —                 | Controlled value and open state                              | works controlled with value and onValueChange; opens and closes controlled with open …                                  | ✅ covered |
| —                 | Disabled, read-only, labels, popup width, compact            | is disabled …; is read-only …; labels the input …; makes the suggestions at least as wide …; uses compact sizes …       | ✅ covered |

### Visual comparison

`pnpm visual search-input`: 22 cases × 16 combinations, 352/352 matching after the fixes below. Cases, against
fundamental-styles' Input Group stories: the field with text and both buttons at rest and hovered, the clear and
search buttons at rest and hovered (pixels, our texts are theirs: "Input with 2 icon actions", value 100); the field
without text (styles; theirs has a dropdown arrow); the error, warning, success and information fields, disabled and
read-only (styles, against States, whose addons differ); the focused field (styles, against Focus's `is-focus`).
Against the Combobox Input stories: the popup surface and the list (styles, theirs holds other items), a suggestion
at rest and hovered ("Orange", pixels), the highlighted suggestion (styles, against their focused item), the bold
search text, the "No result" row (styles, against an item) and the success message (styles, against Semantic's
`fd-list__message--success`).

| Difference                                             | Cause                                                                                      | Resolution                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Popup and suggestions 1248px wide instead of 640px     | The popup took the field width as its minimum; fundamental-styles' dropdown stops at 40rem | Fixed: `min-w-[min(var(--anchor-width),40rem)]` with `max-w-[40rem]`.                |
| List background white instead of transparent           | The list had `bg-sap-list-background` (from Angular's combobox list)                       | Fixed: no list background; the items and the popup draw it (not visible in Horizon). |
| Value state message hidden behind the list             | The absolute list message came before the positioned list in the scroll wrapper            | Fixed: the message is `sticky` above the list (also stays in view while scrolling).  |
| "No result" row `cursor: default` instead of `pointer` | It is a status text, not an option that can be chosen; fundamental-styles uses a list item | Kept (ignored in the case): nothing to click.                                        |

Angular issues: none (there is no Angular search-input).

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, Validation states, Open: filtered, Open: error,
Open: compact and In a shellbar (not a visual case: fundamental-styles' shellbar search is the shellbar's own field).
