## multi-combobox

Sources: Angular [`registry/ui/multi-combobox`](../../../../angular/registry/ui/multi-combobox/)
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

### Stories vs. sources

| Source             | Example                                         | React story                                                                   | Status     | Notes                                                                                  |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------- |
| fundamental-react  | —                                               | —                                                                             | ➖ n/a     | No fundamental-react source.                                                           |
| Angular            | Playground                                      | `Playground`                                                                  | ✅ covered |                                                                                        |
| Angular            | Data sources                                    | `DataSources`, `OpenSelectAll`                                                | ✅ covered | The observable is data set after a timer.                                              |
| Angular            | Groups, columns and templates                   | `Layout`, `OpenGroups`, `OpenColumns`, `OpenTemplate`                         | ✅ covered | `renderItem` with `ListContent`, `ListTitle` and `ListByline`.                         |
| Angular            | States                                          | `States`, `OpenState`                                                         | ✅ covered |                                                                                        |
| Angular            | Forms                                           | `Forms`                                                                       | ✅ covered | State in React: value and touched (`onBlur`).                                          |
| Angular            | Mobile                                          | `Mobile`, `OpenMobile`                                                        | ✅ covered |                                                                                        |
| Angular            | Dynamic data source                             | `DynamicDataSource`                                                           | ✅ covered |                                                                                        |
| Angular            | Inside a dialog                                 | `InsideDialog`, `OpenInsideDialog`                                            | ✅ covered |                                                                                        |
| Angular            | Open: select all, groups, two columns, template | `OpenSelectAll`, `OpenGroups`, `OpenColumns`, `OpenTemplate`                  | ✅ covered |                                                                                        |
| Angular            | Open: state message, inside a dialog, mobile    | `OpenState`, `OpenInsideDialog`, `OpenMobile`                                 | ✅ covered |                                                                                        |
| fundamental-styles | As Form Item, Grouping, Two Column, Semantic    | `AsFormItem`, `OpenDefault`, `OpenGrouping`, `OpenTwoColumns`, `OpenSemantic` | ➕ extra   | fundamental-styles' data and widths, the list in the story, for the visual comparison. |

### Tests vs. sources

| Source         | Behaviour                                                         | React test                                                                                       | Status     |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Angular        | Chosen items as tokens                                            | shows the chosen items as tokens                                                                 | ✅ covered |
| Angular        | Filters by the start of any word                                  | filters by the start of any word                                                                 | ✅ covered |
| Angular        | Rejects text that matches nothing                                 | rejects text that matches nothing with a brief error                                             | ✅ covered |
| Angular        | Keyboard and mouse toggles                                        | toggles options with the keyboard and the mouse                                                  | ✅ covered |
| Angular        | Enter chooses the item named by the text                          | chooses the item named by the text with Enter                                                    | ✅ covered |
| Angular        | Select all option and Ctrl+A                                      | selects all with the select all option and Ctrl+A, and deselects all with Ctrl+Shift+A           | ✅ covered |
| Angular        | Groups                                                            | groups the options under headers                                                                 | ✅ covered |
| Angular        | Addon button opens and closes                                     | the addon button opens and closes the list and keeps the focus in the input                      | ✅ covered |
| Angular        | openDropdownOnAddOnClicked=false                                  | openDropdownOnAddOnClicked=false keeps the list closed                                           | ✅ covered |
| Angular        | limitless and mapLimit                                            | limitless shows every item, otherwise mapLimit                                                   | ✅ covered |
| Angular        | Secondary text column                                             | shows secondary text in a second column                                                          | ✅ covered |
| Angular        | dataSource replaced, empty                                        | filters the new items after the dataSource is replaced, and handles an empty one                 | ✅ covered |
| Angular        | selectedItems input                                               | the selectedItems prop adds, replaces and clears tokens and the checked options                  | ✅ covered |
| Angular        | Removing a token                                                  | removing a token unchecks it in the open list and keeps the others                               | ✅ covered |
| Angular        | Observable dataSource                                             | renders the chosen items once the data arrives (Angular: an observable dataSource)               | ✅ covered |
| Angular        | Mobile: approve and cancel                                        | Approve commits once and Cancel restores the selection                                           | ✅ covered |
| Angular        | Mobile: deselecting the last item                                 | deselecting the last item keeps the focus in the dialog                                          | ✅ covered |
| Angular        | Escape inside a dialog                                            | in a dialog, opens its list above the dialog and closes only the list with Escape                | ✅ covered |
| Angular (code) | Matching strategies                                               | matches the start of the text with startsWith, and any part with contains                        | ✅ covered |
| Angular (code) | Enter on a highlighted option                                     | Enter toggles the highlighted option and closes the list                                         | ✅ covered |
| Angular (code) | Inline completion                                                 | completes the typed text with the first match, which Enter chooses                               | ✅ covered |
| Angular (code) | Down and Up while closed                                          | Down and Up in a closed field put the next item that is not chosen in the input                  | ✅ covered |
| Angular (code) | Backspace removes tokens                                          | removes tokens with Backspace, and the focus goes back to the input                              | ✅ covered |
| Angular (code) | Leaving the field, collapsing tokens                              | leaving the field with the exact text of an item chooses it and collapses the tokens             | ✅ covered |
| Angular (code) | "n more" lists only chosen items                                  | the "n more" link lists only the chosen items                                                    | ✅ covered |
| Angular (code) | Up, Down, Escape, Alt+Up, Tab                                     | moves the highlight with Up and Down and closes with Escape, Alt+Up and Tab                      | ✅ covered |
| Angular (code) | Outside click closes, field clicks do not                         | closes the list on a click outside but not on a click in the field                               | ✅ covered |
| Angular (code) | Shift ranges                                                      | selects a range with Shift clicks on the check boxes, and in the mobile dialog on the options    | ✅ covered |
| Angular (code) | Templates                                                         | renders the templates of options, chosen options, secondary texts and group headers              | ✅ covered |
| Angular (code) | Labels, required, invalid, state message, live region, addon name | labels the input and the list, and marks required and invalid fields                             | ✅ covered |
| Angular (code) | Placeholder only while nothing is chosen                          | shows the placeholder while nothing is chosen                                                    | ✅ covered |
| Angular (code) | Read-only                                                         | a read-only multi-combobox shows its tokens but does not open or change                          | ✅ covered |
| Angular (code) | Disabled                                                          | a disabled multi-combobox is not focusable or clickable until re-enabled                         | ✅ covered |
| Angular (code) | Mobile: keyboard, list keys, immediate mode, close button         | opens from the keyboard, takes the keys on its list, applies right away without approve button   | ✅ covered |
| Angular (code) | maxHeight, bodyMaxWidth, fill width                               | limits the list height and width, and fills the field width less two group borders               | ✅ covered |
| React          | open prop, actionsRef                                             | opens and closes through actionsRef and the open prop, and selects all through actionsRef        | ✅ covered |
| React          | Uncontrolled                                                      | works uncontrolled with defaultSelectedItems                                                     | ✅ covered |
| React          | Prop spreading, refs                                              | passes native props, className and the ref to the root, and the input props and ref to the input | ✅ covered |

### Visual comparison

`pnpm visual multi-combobox`: 20 cases × 16 combinations, 306/320 matching after the fixes below; the others are the
kept differences of the table (12 high-contrast compact field and input cases, 2 compact hover cases). Cases, against
fundamental-styles' "As Form Item" multi combobox (our `AsFormItem` and `OpenDefault` stories, with its texts, its
width and the list rendered in the story): the field (tokens, input and addon button) at rest and hovered, its first
token and the addon button at rest and hovered (pixels); the input (styles); with the list open, the popup and the
list (styles), a selected and an unselected option at rest and hovered (pixels), the check box (styles: theirs is a
check box label) and an option title (styles). Against "Grouping" (`OpenGrouping`): the group header (pixels) and its
title (styles). Against "Two Column Combo Box" (`OpenTwoColumns`): the secondary text (styles). Against "Semantic"
(`OpenSemantic`): the message on top of the list (pixels). Against "Read Only And Disabled": the read-only field
(styles). Against "Mobile Mode": an option of the dialog list (styles). Reviewed by eye in Horizon cozy and compact,
LTR and RTL: `OpenSelectAll`, `OpenGroups`, `OpenColumns`, `OpenTemplate`, `OpenState`, `OpenMobile` and `States`.

fundamental-styles' multi comboboxes are inline blocks as wide as their content, and their input's padding differs
from the tokenizer input's (see below), so a content-wide field of ours is 10px wider in cozy and 8px narrower in
compact. The reference stories therefore take fundamental-styles' rendered widths (519.36px cozy, 30px less in
compact, 4px more in high contrast; 475.5px for the grouping and semantic examples), so pixels can be compared.

| Difference                                                                                                               | Cause                                                                                                                                                                                           | Resolution                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Popup as wide as the field (fundamental-styles: 2px narrower), and as wide as a wide field while the list stops at 600px | Angular's popover fills at least the field width with no maximum; its list has `max-w-[37.5rem]`. fundamental-styles' dropdown fill is `calc(100% - 2 * --sapGroup_BorderWidth)`, at most 40rem | Fixed: minimum width the field less two group borders, maximum 40rem (`bodyMaxWidth="container"` keeps the field width). Angular issue.                |
| Options 40px high (32px compact); fundamental-styles' items 44px, a selected one 45px (33px compact) with its line       | Angular uses the dropdown item height of select and combobox (`LIST_DROPDOWN_ITEM`)                                                                                                             | Fixed as multi-input: `min-h-11` and a 1px taller selected option, end padding 1rem. Angular issue.                                                    |
| Hovered field without the field hover shadow                                                                             | The tokenizer removes the shadow on hover (fundamental-styles' plain tokenizer); the multi combobox is an input group, which has it                                                             | Fixed: the field hover shadow (value states keep their own). Angular issue (Angular keeps the field shadow).                                           |
| Read-only field with the field shadow                                                                                    | Our tokenizer keeps the field shadow when read-only (fundamental-styles' plain tokenizer); the read-only multi combobox has none                                                                | Fixed: no shadow on the read-only field. Angular has none (its tokenizer's `shadow-none`).                                                             |
| High contrast: the field 40px high (30px compact) instead of 36px (26px)                                                 | The 36px addon button inside the 2px field border                                                                                                                                               | Fixed as multi-input: in high contrast the button overlaps the border. Angular issue (same classes).                                                   |
| Secondary text in `--sapContent_LabelColor` (#556b82 instead of #131e29 in Horizon), at most 40% of the row              | Angular's `text-sap-content-label-color` and `max-w-[40%]`; fundamental-styles' dropdown list secondary is neutral text, and title and secondary text share the row (at most 24rem and 16rem)   | Fixed: `ListSecondary` (neutral colour) with `flex-auto max-w-64`, the title `max-w-96` beside it, as select. Angular issue.                           |
| Group header title `min-height` 0 instead of 1rem                                                                        | Not in Angular                                                                                                                                                                                  | Fixed (computed styles only).                                                                                                                          |
| State message in its own box (8px vertical and end padding, normal line height, wrapping)                                | Angular's message `div` (`min-h-8 px-2 py-2 leading-normal`)                                                                                                                                    | Fixed: `ListMessage`, fundamental-styles' 2rem line with a start padding, truncated. Angular issue (computed styles; one-line messages look the same). |
| List background white instead of transparent                                                                             | Angular's list has `bg-sap-list-background`                                                                                                                                                     | Fixed: no list background; the options draw it (not visible).                                                                                          |
| High contrast compact: tokens 1px higher, the input 22px instead of 26px high                                            | fundamental-styles' input keeps its compact height inside the 2px field border, so its row is taller than the field and the tokens move                                                         | Kept, as multi-input: the input fits the field (as the tokenizer, see [token](token.md)).                                                              |
| Compact hovered field: the bottom three pixel rows up to 7 colour levels lighter                                         | Anti-aliasing of the hover shadow on the bottom border (the styles match)                                                                                                                       | Kept: not visible.                                                                                                                                     |
| Input padding 5px (4px compact) on both sides; fundamental-styles' input 0 in cozy and 8px in compact                    | The tokenizer input's padding (it matches fundamental-styles' tokenizer)                                                                                                                        | Kept (ignored in the case), as multi-input and the tokenizer.                                                                                          |
| Option padding: fundamental-styles' start spacing is on the form item around its check box, ours on the option           | Different markup (theirs a check box form item)                                                                                                                                                 | Ignored in the cases; the check box and text sit at the same place (pixels match).                                                                     |
| Popup and list 1px taller                                                                                                | fundamental-styles' list leaves its token "Kiwi" unselected; ours selects all four tokens (a selected option is 1px taller)                                                                     | Ignored (height) in the styles-only popup and list cases.                                                                                              |
| Secondary text a few pixels wider or narrower                                                                            | fundamental-styles' titles show a search letter in bold, which changes how title and secondary text share the row                                                                               | Ignored (width) in the styles-only secondary text case.                                                                                                |

Angular issues: the popup fills a wide field while its list stops at 600px (fundamental-styles: the field less 2px, at
most 40rem); 40px options; no hover shadow on the field; the 40px high-contrast field; the secondary text in the label
colour and at most 40% wide; the state message box (padding and wrapping); and, in behaviour: Shift ranges on check
boxes never apply on desktop (each check box click clears the anchor); mobile mode renders the state message's id
twice (page field and dialog field); the polite live region is created together with its text, so it is often not
announced.
