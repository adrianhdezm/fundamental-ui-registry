## input-group

Sources: fundamental-react [InputGroup](https://github.com/SAP/fundamental-react/tree/main/src/InputGroup)
(`InputGroup.js`, `_InputGroupAddon.js`) · Angular [`registry/ui/input-group`](../../../angular/registry/ui/input-group/)
· fundamental-styles
[Input Group](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-input-group--docs)
Registry: `registry/ui/input-group/`, on Base UI's `Input` (the generated input and `InputGroupInput`), with the
`fieldBase`/`fieldStates` of [input](input.md), our `Button` for addon buttons and `Icon` for addon icons.

API: three components, as Angular's `fd-input-group` with its `fdInputGroupInput` and `fdInputGroupAddon`
directives. `InputGroup` takes Angular's inputs as props: `placement`, `addOnText`, `glyph`, `glyphFont`,
`glyphAriaLabel`, `iconTitle`, `button`, `buttonFocusable`, `addonButtonAriaHidden`, `isControl`, `isExpanded`,
`showFocus`, `inline`, `state`, `disabled`, `readOnly` (Angular's `readonly`), `inputId`, `type`, `placeholder`,
`name`, `required`; `aria-label`, `aria-labelledby` and `aria-describedby` go to the generated input (Angular's
`ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`). Angular's `value` model and `ControlValueAccessor` become
`value`/`defaultValue`/`onValueChange(value, event)`, numbers (or `null` when empty) for `type="number"`; touched and
dirty come from a Base UI `Field` around the group (or the group's `onBlur`, which bubbles as Angular's `focusout`).
`addOnButtonClicked` is `onAddOnButtonClick`, `search` is `onSearch` (the native event, listened to on the input),
and `focus()` is `inputRef.current.focus()`. `inputProps` and `inputRef` reach the generated input; other native
props, `className` and `ref` go to the root `<div>`. Without an `InputGroupInput` among its children the group
renders its own input; without an `InputGroupAddon` it renders the addon from `addOnText`/`glyph` (top-level
children, as Angular's `contentChild`). `InputGroupInput` takes Base UI Input's props (`render={<textarea />}` for a
text area); `InputGroupAddon` takes `button` and `type="textarea"` (Angular's `placement` on the addon is not kept:
it was kept in Angular only for compatibility, the addon goes where it is in the children). The class constants
`STATE_BUTTON_VARS`, `INPUT_GROUP_BUTTON_VARS` and `STATE_FOCUS_COLOR` are exported as in Angular, for other field
controls with buttons.

fundamental-react's props map as follows: `compact` is `data-density="compact"` on the group or an ancestor;
`disabled` dims the group and disables the generated input, the addon button and `InputGroupInput`s (fundamental-react
passed it to its children); `validationState.state` is `state`; `InputGroup.Addon` with `isButton` is
`InputGroupAddon button`; a `FormInput` or `FormTextarea` child is `InputGroupInput` (with `render={<textarea />}`).
`validationState.text` and `validationOverlayProps` (the message popover) are a `FormInputMessageGroup` around the
group with a `FormMessage` (see [form](form.md)): `validationState.text` is the message's children, `show` is
`defaultOpen`, `className` and `wrapperProps` go to the message group and `formMessageProps` to the message;
`popperClassName`, `referenceClassName` and `innerRefClassName` have no Popper elements to go to. The message
describes the group's input after its text addon, and opens while the focus is in the group (input or addon
button).

**Differences, on purpose:**

- `InputGroupInput` takes `disabled`, `readOnly` and `aria-invalid` (error state) from the group; Angular leaves a
  projected input alone, so a disabled group had an enabled input. Its own props win.
- The addon only describes the input (`aria-describedby`) when the group renders it; Angular adds the addon id even
  when a projected addon replaces it, so the reference points at nothing.
- A group with a text area grows with its rows (`has-[textarea]:h-auto`); Angular's group stays one line high.
- Addon buttons have no border (fundamental-styles' `border: none`) and keep the lite button backgrounds in the HC
  themes; see the Angular issues below.
- Field shadows use `[box-shadow:…]` instead of the `shadow-…` utilities (Angular), as in input.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                  | Cause                                                                                                                                                                                                                                                                   | Resolution                                                                      |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Input `min-height` 0 and no corner radius                                                   | fundamental-styles' input keeps the field's `min-height: 100%` and radius                                                                                                                                                                                               | Kept (ignored in the case): the input has no background or border; not visible. |
| `input` case, compact (8 combinations): start padding 8px instead of 10px (0.3–0.4% pixels) | fundamental-styles' `:nth-child(1)` rule and its compact field rule have the same specificity: its Input Group story loads the input group styles after the input's, so 0.625rem wins there; where the input's load later (Date Picker stories) the compact 0.5rem wins | Kept: the compact field padding, as the date picker reference and UI5.          |
