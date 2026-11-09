## select

Sources: fundamental-react [Select](https://github.com/SAP/fundamental-react/tree/main/src/Select) (`Select.js`, its
stories and tests) · Angular [`registry/ui/select`](../../../../angular/registry/ui/select/) (`Select`, `SelectOption`,
its stories and spec) · fundamental-styles
[Select](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-select--docs) (Default, States,
Disabled, Read-only, 2-column with icons, Grouping)
Registry: `registry/ui/select/`, on Base UI's `Select` (Root, Trigger, Portal, Positioner, Popup, List, Item), with
the `fieldBase`/`fieldStates` of [input](input.md), the `LIST_DROPDOWN_ITEM` classes, `ListMessage` and `ListTitle` of
[list](list.md), the `popoverSurfaceVariants` of [popover](popover.md), `buttonVariants` and `Icon`, and for mobile
mode the [dialog](dialog.md) (`Dialog`, `DialogPopup`, `DialogHeader`, `DialogTitle`, `DialogCloseButton`,
`DialogBody`, `DialogFooter`) with `ButtonBar` of [bar](bar.md).

API: Angular's inputs in React form. `Select` takes `SelectOption` children (`value`, `disabled`, and `label`, the
text shown in the control and matched by typeahead; by default the text of its `ListTitle`, or of the whole option);
plain text is the title, `ListIcon`/`ListTitle`/`ListSecondary` give richer options and
`ListGroupHeader role="presentation"` separates groups, as in Angular. `value`/`defaultValue`/`onValueChange` (`null`
for no value) replace the two-way `value` and the `ControlValueAccessor`; `name`, `form` and `required` go to Base UI's
hidden input for native forms. `placeholder`, `controlId`, `state`, `stateMessage`, `textOverflow`, `disabled`,
`readOnly` (Angular's `readonly`), `required`, `inline`, `mobile`, `mobileConfig`, `closeLabel`, `maxHeight`, `glyph`,
`glyphFont`, `closeOnOutsideClick`, `fillControlMode`, `compareWith`, `typeaheadDebounceInterval`, `tabOutStrategy` and
`tabIndex` keep their names; `appendTo` is `container`, `controlTemplate` is `renderValue(text, selected)`,
`selectControlClass` is `controlClassName`, `isOpenChange` is `onOpenChange`, and `open`/`defaultOpen` replace
`open()`/`close()`. `ariaLabel`, `ariaLabelledBy` and `ariaDescribedBy` are the native `aria-*` props; they go to the
control (and name the listbox), every other native prop, `className` and `ref` go to the root `<div>`; `controlRef`
reaches the control. fundamental-react's `options` array and `selectedKey` are `SelectOption` children and `value`;
`onSelect(event, option)` is `onValueChange(value)`; `onClick`, `onFocus` and `onBlur` are native props of the root
(`onBlur` is called only when the focus leaves the field and the list, as in fundamental-react);
`validationState: { state, text }` is `state` and `stateMessage`; `compact` is `data-density="compact"` on an
ancestor; `controlClassName`, `listClassName`, `popoverProps` (now the props of the popup), `textContentClassName`
(`textClassName`) and `triggerClassName` (`buttonClassName`) are kept; `listItemClassName`/`listItemTextClassName`
are the `className` of each option; `includeEmptyOption`/`emptyAriaLabel` are an option without a value (with an
`aria-label`). Angular's `unselectMissingOption` is gone: React has one empty value (`null`), so an option without a
value always clears the select. `validationOverlayProps` is gone with fundamental-react's overlay (see below).

Behaviour and ARIA (Angular): the control is a `combobox` with `aria-haspopup="listbox"`, `aria-expanded`,
`aria-controls` (while open), `aria-required`, `aria-readonly`, `aria-disabled`, `aria-invalid` for errors and the
text as `title`; the placeholder sets `data-placeholder` and is hidden when disabled or read-only. Closed, Up/Down (and
Left/Right, mirrored in RTL) choose the previous/next enabled option, Home/End the first/last, typing chooses the next
option starting with the typed characters (collected for `typeaheadDebounceInterval`, as the Angular CDK), and Enter,
Space, Alt+Down, F4 or a click open the list. Open, Up/Down move the highlight skipping disabled options without
wrapping, Home/End go to the ends, typing moves to a match, Enter, Space or a click choose (and close), Escape, Alt+Up
and F4 close, Tab closes (and with `tabOutStrategy="closeAndSelect"` chooses the highlighted option) and moves on, and a
click outside closes unless `closeOnOutsideClick={false}`. The list opens with the selected option highlighted and in
view, else the first enabled one. A read-only or disabled select does not open. The value state message sits on top
of the options (sticky, or wrapped with `textOverflow="full"`) and describes the listbox. In mobile mode a click or the
open keys open a full-screen dialog (`mobileConfig`: title, close button, approve and cancel buttons); the listbox there
has the focus and highlights options with `aria-activedescendant`; with an approve button the choice is applied only
with it, otherwise a choice closes the dialog.

**Differences, on purpose:**

- While the list is open the focus is on the highlighted option (Base UI's Select moves DOM focus into the list and
  back to the control when it closes); Angular keeps the focus on the control and highlights with
  `aria-activedescendant`. The option shows the same focus frame (`data-active`), and screen readers announce the
  option either way. The mobile dialog keeps Angular's `aria-activedescendant` listbox.
- Tab inside the mobile dialog is not blocked: Angular prevents Tab in the dialog's listbox, so the approve and cancel
  buttons cannot be reached with the keyboard; here Tab moves to them (the dialog keeps the focus inside).
- The list is not modal (`modal={false}`): the page stays scrollable and usable, as in Angular.
- Base UI cancels an opening when the mouse is released outside the control after pressing it (`cancel-open`); with
  `closeOnOutsideClick={false}` that is treated as an outside click and ignored.
- The mobile dialog title is the dialog's `DialogTitle` (an `<h2>`, as the other dialogs) instead of Angular's `<h1>`.
- The list has no background of its own and its corners follow the popup (fundamental-styles); Angular paints the list
  with `--sapList_Background` (see Angular issues).

### Stories vs. sources

| Source            | Example                          | React story                                    | Status     | Notes                                                                                    |
| ----------------- | -------------------------------- | ---------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| fundamental-react | primary                          | `Default`                                      | ✅ covered | With fundamental-styles' "Regular, Placeholder text".                                    |
| fundamental-react | compact                          | `Compact`                                      | ✅ covered | `data-density="compact"` on an ancestor.                                                 |
| fundamental-react | disabled                         | `Disabled`                                     | ✅ covered | Plus fundamental-styles' Disabled (notebooks with prices).                               |
| fundamental-react | readOnly                         | `ReadOnly`                                     | ✅ covered | Plus fundamental-styles' Read-only.                                                      |
| fundamental-react | validationStates                 | `ValidationStates`, `OpenError`                | ✅ covered | `state` and `stateMessage`.                                                              |
| fundamental-react | emptyOption                      | `EmptyOption`                                  | ✅ covered | An option without a value, named with `aria-label`.                                      |
| fundamental-react | dev                              | `Playground`                                   | ✅ covered | Every prop as a control, the value printed.                                              |
| fundamental-react | noStyles                         | —                                              | ➖ n/a     | No `cssNamespace`.                                                                       |
| Angular           | Playground                       | `Playground`                                   | ✅ covered |                                                                                          |
| Angular           | Modes                            | `Modes`                                        | ✅ covered | Default, compact, disabled, read-only, full width with a disabled option.                |
| Angular           | States                           | `States`, `OpenSuccessFull`                    | ✅ covered | Static form messages, a full-width wrapped message, a message on hover.                  |
| Angular           | Groups, icons and custom trigger | `RichOptions`, `OpenRich`                      | ✅ covered | `renderValue` instead of `controlTemplate`.                                              |
| Angular           | Forms                            | `Forms`                                        | ✅ covered | A native form (hidden input, `required`, `onBlur`) instead of Angular reactive forms.    |
| Angular           | Programmatic control             | `Programmatic`                                 | ✅ covered | Controlled `value` and `open`.                                                           |
| Angular           | Custom comparator                | `CustomComparator`                             | ✅ covered |                                                                                          |
| Angular           | Mobile                           | `Mobile`, `OpenMobile`                         | ✅ covered |                                                                                          |
| Angular           | Max height                       | `MaxHeight`                                    | ✅ covered |                                                                                          |
| Angular           | Open: default                    | `OpenDefault`, `OpenFitContent`, `OpenCompact` | ✅ covered | fundamental-styles' "Active, Selected Item" (fit content for the visual cases).          |
| Angular           | Open: groups and icons           | `OpenRich`                                     | ✅ covered |                                                                                          |
| Angular           | Open: mobile                     | `OpenMobile`                                   | ✅ covered |                                                                                          |
| —                 | (fundamental-styles 2-column)    | `OpenTwoColumns`                               | ✅ covered | "2-column with icons", for the visual cases.                                             |
| —                 | (fundamental-styles Focus)       | `Focus`                                        | ✅ covered | "Focus: default" (not in docs) focuses the control in `play`, for the visual focus case. |

### Tests vs. sources

| Source            | Behaviour                                                                              | React test                                                                                                                                                 | Status     |
| ----------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Placeholder and selected option as a combobox                                          | shows the placeholder and the selected option as a combobox                                                                                                | ✅ covered |
| Angular           | Opens on click, arrow keys, Enter selects                                              | opens on click, highlights with the arrow keys and selects with Enter                                                                                      | ✅ covered |
| Angular           | Selects on click and marks it selected                                                 | selects an option on click and marks it selected                                                                                                           | ✅ covered |
| Angular           | Disabled option not selected                                                           | does not select a disabled option on click                                                                                                                 | ✅ covered |
| Angular           | Compact density                                                                        | shrinks the control and the options in compact density                                                                                                     | ✅ covered |
| Angular           | Trigger click closes                                                                   | closes the list when the trigger is clicked again                                                                                                          | ✅ covered |
| Angular           | Outside click, closeOnOutsideClick                                                     | closes on an outside click unless closeOnOutsideClick is false                                                                                             | ✅ covered |
| Angular           | Value not among the options                                                            | shows the placeholder for a value that is not among the options                                                                                            | ✅ covered |
| Angular           | Home and End while open                                                                | moves the active option with Home and End while open                                                                                                       | ✅ covered |
| Angular           | Space selects                                                                          | selects the active option with Space and closes                                                                                                            | ✅ covered |
| Angular           | Opens with Enter, Space, Alt+Down, F4                                                  | opens the list with %s on the trigger (4 cases)                                                                                                            | ✅ covered |
| Angular           | Scrolls the selected option into view                                                  | scrolls the selected option into view when the list opens                                                                                                  | ✅ covered |
| Angular           | Typeahead of several characters, open and closed                                       | moves to the option matching several typed characters                                                                                                      | ✅ covered |
| Angular           | compareWith                                                                            | matches the selected option by value with compareWith                                                                                                      | ✅ covered |
| Angular           | Default comparator and a copy                                                          | does not match a copied object with the default comparator                                                                                                 | ✅ covered |
| Angular           | Escape keeps the value                                                                 | closes with Escape without changing the value; closes the open list with %s … (3 cases)                                                                    | ✅ covered |
| Angular           | Arrow keys and typing while closed                                                     | changes the value with the arrow keys and typing while closed; swaps Left and Right in right-to-left text …                                                | ✅ covered |
| Angular           | Touched on blur, disabled state                                                        | calls onBlur when the field loses the focus, and follows the disabled state                                                                                | ✅ covered |
| Angular           | Mobile: approve                                                                        | applies the choice in mobile mode only when it is approved                                                                                                 | ✅ covered |
| Angular           | Mobile: cancel                                                                         | mobile: Cancel closes the dialog and keeps the old value                                                                                                   | ✅ covered |
| Angular           | Mobile: empty mobileConfig                                                             | mobile: renders with an empty mobileConfig and selects on click                                                                                            | ✅ covered |
| fundamental-react | onSelect on option clicks                                                              | selects an option on click …; changes the value with the arrow keys … (`onValueChange`)                                                                    | ✅ covered |
| fundamental-react | onFocus/onBlur on the select; no onBlur when opening or closing                        | calls onBlur when the field loses the focus …; does not call onBlur while the focus moves into the list …                                                  | ✅ covered |
| fundamental-react | selectedKey and options changed                                                        | updates the text when the options and the value change                                                                                                     | ✅ covered |
| fundamental-react | Prop spreading, classNames (select, control, text, trigger, list, items, popover); ref | passes className, native props and ref to the root and the classes to its parts                                                                            | ✅ covered |
| fundamental-react | validationOverlayProps (4 tests), validation popper className                          | shows the value state: aria-invalid for errors and the message above the options                                                                           | ✅ covered |
| —                 | Tab, closeAndSelect                                                                    | closes the list on Tab; closeAndSelect selects the highlighted option                                                                                      | ✅ covered |
| —                 | Read-only, hidden placeholder                                                          | is read-only: no arrow, the list does not open …; hides the placeholder when disabled or read-only                                                         | ✅ covered |
| —                 | Controlled open, no options, rich options, empty option                                | opens and closes controlled …; does not open without options; takes the selected text from rich options …; clears the value with an option without a value | ✅ covered |
| —                 | Widths, form submission, mobile keyboard                                               | makes the list at least as wide …; takes the width of its text inline …; submits its value with a form …; mobile: highlights with the keyboard …           | ✅ covered |

fundamental-react's `validationOverlayProps` tests spread props on its form-message overlay; the message here is a
list message in the popup (fundamental-styles' States, Angular), so they map to the value state test.

### Visual comparison

`pnpm visual select`: 31 cases × 16 combinations, 492/496 matching after the fixes below. Cases, against
fundamental-styles' Select stories: from Default, the placeholder control at rest and hovered, its text, its arrow
button at rest and hovered, the focused control (our "Focus: default" against `is-focus`) and an open control with a
value ("Active, Selected Item"), all with pixels; the disabled and read-only controls and the read-only text (pixels,
fundamental-styles' notebooks); the error, warning, success and information controls at rest and hovered (styles,
against States, whose placeholder texts differ). The open list against "Active, Selected Item" (our "Open: fit
content"): the popup and the list (styles), an option at rest and hovered (pixels), the selected option at rest and
hovered (styles: ours is also the focused option with its focus frame) and the option text (styles). Against "2-column
with icons": an option with an icon, title and secondary text, and each part (pixels). The error message above the
list (styles, against States' `fd-list__message--error`) and a group header (styles, against Grouping).

| Difference                                                                                 | Cause                                                                                                                                                      | Resolution                                                                                                                                                  |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Popup, list and options 113px wide instead of 93px                                         | Ours is at least as wide as the control by default (fundamental-ngx's `fillControlMode` "at-least"); fundamental-styles' story list fits its items         | Kept as the default (Angular); the list cases use `fillControlMode="fit-content"` ("Open: fit content"), which matches.                                     |
| List background white instead of transparent, square corners instead of 8px                | The list had `bg-sap-list-background` and no radius (from Angular)                                                                                         | Fixed: no list background (the options and the popup draw it) and `rounded-[inherit]`; the message on top takes the top corners.                            |
| Options with icons 32px wider                                                              | `LIST_DROPDOWN_ITEM`'s `gap-x-4` between icon, title and secondary text; fundamental-styles has no gap (the icon box and the secondary padding space them) | Fixed in the select's options: `gap-x-0`.                                                                                                                   |
| Option icons 14px on a 14px line instead of 18px (16px compact) on a 16px line             | `ListIcon` takes its size from `--li-ifs`, which only `List` sets                                                                                          | Fixed: the options set `--li-ifs` (1.125rem, 1rem compact) and a 1rem icon line height.                                                                     |
| Option titles without their minimum height, truncating, 8px narrower; secondary 8px wider  | `ListTitle`'s `min-h-(--li-fs)` and `flex-[3_3_10%] truncate` and `ListSecondary`'s `max-w-[40%]` are the list's, not the dropdown's                       | Fixed: in options, titles are `min-h-4` (`min-h-3.5` compact), `flex-auto` and wrap; secondary texts `flex-auto` up to 16rem; plain text options `min-h-4`. |
| Arrow button transparent instead of the lite button background in HC (and no hover colour) | The field-button variables made the lite backgrounds transparent in every theme                                                                            | Fixed: `not-hc:` on them, as input-group.                                                                                                                   |
| HC: the arrow button covered the field border (2px rows)                                   | The 36px button overflows the field's content box; fundamental-styles' control clips it (`overflow: hidden`), ours had `overflow-visible`                  | Fixed: `overflow-hidden` on the control.                                                                                                                    |
| Item icon, Horizon and Horizon Dark LTR: 4.5% of pixels                                    | One pixel column of the icon box lies outside the option (its -1rem start margin against the 0.9375rem padding) and shows the popup edge one pixel apart   | Kept: outside the option, the popup's own edge; the option and its icon glyph match in all 16 combinations.                                                 |

Angular issues:

- The options of a select put a 1rem gap (`gap-x-4` of `LIST_DROPDOWN_ITEM`) between the icon, the title and the
  secondary text, so options with icons are 32px wider than fundamental-styles'; icons are 14px (no `--li-ifs`, so the
  page font size) instead of 1.125rem on a 1rem line, and titles truncate instead of wrapping and lack their one-line
  minimum height; secondary texts stop at 40% instead of 16rem. Fixed in React in the select's options
  (`OPTION_PARTS`).
- The list paints `--sapList_Background` and has square corners where fundamental-styles' dropdown list is
  transparent with the popover's corners (not visible in Horizon).
- In the HC themes the arrow button has no background and no hover colour: the field-button variables make the lite
  button backgrounds transparent in every theme (as input-group's `INPUT_GROUP_BUTTON_VARS`).
- In the HC themes the arrow button covers the top and bottom 2px of the field border: the control is
  `overflow-visible`, so the 36px (26px compact) button overflows the field's content box.
- In the mobile dialog Tab is prevented in the listbox, so the approve and cancel buttons cannot be reached with the
  keyboard.

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Modes, States, Open: default, Open: error, Open: success
(full message), Open: groups and icons, Open: two columns and icons and Open: mobile; Validation states also in HC
Black.
