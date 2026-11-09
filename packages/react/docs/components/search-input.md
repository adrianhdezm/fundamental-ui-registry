## search-input

Sources: fundamental-react [SearchInput](https://github.com/SAP/fundamental-react/tree/main/src/SearchInput)
(`SearchInput.js`, its stories and tests) · no Angular `search-input` (the Angular combobox's `isSearch` mode,
[`registry/ui/combobox`](../../../angular/registry/ui/combobox/), was read for the list classes and the
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                             | Cause                                                                                      | Resolution                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| "No result" row `cursor: default` instead of `pointer` | It is a status text, not an option that can be chosen; fundamental-styles uses a list item | Kept (ignored in the case): nothing to click. |
