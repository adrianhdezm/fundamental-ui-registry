## input

Sources: fundamental-react [FormInput and FormTextarea](https://github.com/SAP/fundamental-react/tree/main/src/Forms) ·
Angular [`registry/ui/input`](../../../angular/registry/ui/input/) · fundamental-styles
[Input](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-input--docs) and
[Textarea](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-textarea--docs)
Registry: `registry/ui/input/`, on Base UI's `Input` (both components, the textarea through `render`).

API: Angular's `fdFormControl` directive on `<input>` and `<textarea>` becomes two components, `Input` and
`Textarea`, with its inputs as props: `state` (`success`, `error`, `warning`, `information`, `default`; `error` sets
`aria-invalid`) and `noNumberSpinner` (`Input` only). Like Angular, the field styles are exported for the other field
controls (`fieldBase`, `fieldStates`, `textareaBase`, type `FormState`). Native props, a `className` and the `ref` go
to the `<input>`/`<textarea>`; `value` with `onValueChange` for a controlled field (Angular's `ngModel` and reactive
forms), `defaultValue` for an uncontrolled one. Inside a Base UI `Field`, `Field.Label` labels the field, and the
field gets `data-touched`, `data-dirty`, `data-filled` and Base UI's validation (`aria-invalid`, `data-invalid`).

fundamental-react's props map as follows: `compact` is `data-density="compact"` on the field or an ancestor;
`disabled`, `readOnly`, `name`, `placeholder`, `type` and `value` are the native props; `validationState.state` is
`state`. `validationState.text` and `validationOverlayProps` (the message popover) are the form component's
`FormInputMessageGroup` with a `FormMessage` around the field. FormTextarea's counter is ported: with `maxLength`, `Textarea` renders the characters left
below it (fundamental-styles' `fd-textarea-counter`), with `counterProps` for the counter element and
`charactersLeftLabel(count)` for its text (fundamental-react's `localizedText`, as a function so apps can pluralise
any language).

**Differences, on purpose:**

- The counter describes the textarea (`aria-describedby`, added to the app's own); fundamental-styles' example uses
  `aria-labelledby`, which would replace the label. The counter is not rendered for disabled or read-only textareas
  (fundamental-styles hides it there); fundamental-react renders it always. Angular has no counter.
- Field shadows use `[box-shadow:var(--sapField_…)]` instead of the `shadow-sap-field-…` utilities (Angular), which
  prepend Tailwind's transparent ring and inset layers, as in action-bar. The computed shadow is the token's alone;
  not visible.
- Compact textareas grow with their rows (`compact:h-auto`); see the Angular issue below.
