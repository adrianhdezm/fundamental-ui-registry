## select

Sources: fundamental-react [Select](https://github.com/SAP/fundamental-react/tree/main/src/Select) (`Select.js`, its
stories and tests) · Angular [`registry/ui/select`](../../../angular/registry/ui/select/) (`Select`, `SelectOption`,
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                              | Cause                                                                                                                                                    | Resolution                                                                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Popup, list and options 113px wide instead of 93px      | Ours is at least as wide as the control by default (fundamental-ngx's `fillControlMode` "at-least"); fundamental-styles' story list fits its items       | Kept as the default (Angular); the list cases use `fillControlMode="fit-content"` ("Open: fit content"), which matches. |
| Item icon, Horizon and Horizon Dark LTR: 4.5% of pixels | One pixel column of the icon box lies outside the option (its -1rem start margin against the 0.9375rem padding) and shows the popup edge one pixel apart | Kept: outside the option, the popup's own edge; the option and its icon glyph match in all 16 combinations.             |
