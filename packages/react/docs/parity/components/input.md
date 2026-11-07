## input

Sources: fundamental-react [FormInput and FormTextarea](https://github.com/SAP/fundamental-react/tree/main/src/Forms) ·
Angular [`registry/ui/input`](../../../../angular/registry/ui/input/) · fundamental-styles
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

### Stories vs. sources

| Source                         | Example                   | React story                     | Status     | Notes                                                                                    |
| ------------------------------ | ------------------------- | ------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| fundamental-react FormInput    | primary                   | `Examples`                      | ✅ covered | Default input.                                                                           |
| fundamental-react FormInput    | compact                   | `Examples`                      | ✅ covered | `data-density="compact"` instead of `compact`.                                           |
| fundamental-react FormInput    | disabled                  | `States`                        | ✅ covered |                                                                                          |
| fundamental-react FormInput    | readOnly                  | `States`                        | ✅ covered |                                                                                          |
| fundamental-react FormInput    | validationStates          | `States`, `ValueStateMessages`  | ✅ covered | The four states; their messages in a form input message group.                           |
| fundamental-react FormInput    | dev                       | `Playground`                    | ✅ covered | State, placeholder, disabled, read-only args.                                            |
| fundamental-react FormInput    | noStyles                  | —                               | ➖ n/a     | No `cssNamespace`.                                                                       |
| fundamental-react FormTextarea | primary                   | `TextareaExamples` ("Textarea") | ✅ covered |                                                                                          |
| fundamental-react FormTextarea | compact                   | `TextareaExamples` ("Textarea") | ✅ covered | "Compact textarea", `data-density="compact"`.                                            |
| fundamental-react FormTextarea | disabled                  | `TextareaStates`                | ✅ covered |                                                                                          |
| fundamental-react FormTextarea | readOnly                  | `TextareaStates`                | ✅ covered |                                                                                          |
| fundamental-react FormTextarea | maxLength                 | `TextareaCounter`               | ✅ covered | Plus fundamental-styles' Counter example.                                                |
| fundamental-react FormTextarea | validationStates          | `TextareaStates`                | ✅ covered | The four states with their messages (shown on focus).                                    |
| fundamental-react FormTextarea | dev                       | `TextareaPlayground`            | ✅ covered |                                                                                          |
| fundamental-react FormTextarea | noStyles                  | —                               | ➖ n/a     | No `cssNamespace`.                                                                       |
| Angular                        | Playground                | `Playground`                    | ✅ covered |                                                                                          |
| Angular                        | Examples                  | `Examples`                      | ✅ covered | Form items and labels; placeholders as fundamental-styles'.                              |
| Angular                        | States                    | `States`                        | ✅ covered | Placeholders and values as fundamental-styles'.                                          |
| Angular                        | Value state messages      | `ValueStateMessages`            | ✅ covered | Form input message groups; the VAT number message opens on hover.                        |
| Angular                        | Inline help               | —                               | ⬜ missing | Waits for inline-help (the form label's inline help).                                    |
| Angular                        | Reactive forms            | `Controlled`                    | ✅ covered | `value`/`onValueChange` and a disabled field, values printed.                            |
| Angular                        | Textarea                  | `TextareaExamples` ("Textarea") | ✅ covered | The error textarea with its message.                                                     |
| Angular                        | Textarea inline help      | —                               | ⬜ missing | Waits for inline-help (the form label's inline help).                                    |
| Angular                        | Textarea states           | `TextareaStates`                | ✅ covered | States with Angular's messages, disabled, read-only. Field texts as fundamental-styles'. |
| Angular                        | Textarea reactive forms   | `TextareaControlled`            | ✅ covered | Value, touched and dirty printed.                                                        |
| Angular                        | Open: value state message | `OpenValueStateMessage`         | ✅ covered | Points at the VAT number field, whose message opens on hover.                            |

### Tests vs. sources

| Source            | Behaviour                                                   | React test                                                                            | Status     |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| Angular           | Works with ngModel                                          | works controlled with value and onValueChange                                         | ✅ covered |
| Angular           | Reactive forms, touched, `disable()`                        | works uncontrolled with defaultValue, tracks touched and dirty, and can be disabled   | ✅ covered |
| Angular           | Textarea reactive forms, dirty, touched, disable and enable | works controlled, tracks dirty and touched, and can be disabled and enabled again     | ✅ covered |
| Angular           | Textareas styled as multi-line fields                       | styles textareas as multi-line fields                                                 | ✅ covered |
| Angular           | States: `aria-invalid` for errors, field colours            | states set aria-invalid only for errors and change the field colours                  | ✅ covered |
| Angular           | State message on focus, `aria-describedby`                  | the state message is shown while the field has focus and linked with aria-describedby | ✅ covered |
| Angular           | Native readonly                                             | native readonly keeps the value, stays focusable and uses the read-only style         | ✅ covered |
| Angular           | Native disabled                                             | native disabled is dimmed and not focusable                                           | ✅ covered |
| Angular           | `noNumberSpinner`                                           | noNumberSpinner hides the number spinner                                              | ✅ covered |
| Angular           | Compact density                                             | compact density makes the field lower                                                 | ✅ covered |
| fundamental-react | `compact` class                                             | compact density makes the field lower                                                 | ✅ covered |
| fundamental-react | Prop spreading, ref (input and textarea)                    | passes className, native props and the ref through (Input, Textarea)                  | ✅ covered |
| fundamental-react | `validationOverlayProps` (popover, reference, message)      | — (form: the form input message group tests)                                          | ➖ n/a     |
| fundamental-react | Counter: `counterProps`                                     | passes counterProps to the counter, which describes the textarea                      | ✅ covered |
| fundamental-react | Counter: initial count from `value` / `defaultValue`        | takes the initial count from value or defaultValue                                    | ✅ covered |
| fundamental-react | Counter: none when `maxLength` < 0                          | shows no counter without maxLength, with maxLength < 0, or when disabled or read-only | ✅ covered |
| fundamental-react | Counter: `onChange`, update on typing                       | calls onChange and updates the counter upon typing                                    | ✅ covered |
| fundamental-react | Counter: stays at 0, singular                               | stops at 0 characters left and uses the singular for 1                                | ✅ covered |
| fundamental-react | Counter: custom localized text                              | uses a custom localized text, singular and plural                                     | ✅ covered |
| —                 | Base UI Field                                               | works inside a Base UI Field: labelled by Field.Label, invalid from validation        | ✅ covered |
| —                 | Textarea states and read-only border                        | states set aria-invalid only for errors; read-only textareas use a dashed border      | ✅ covered |

The state message test uses the form components. fundamental-react's `validationOverlayProps` tests check its
Popper overlay; the message group itself is tested in the form spec. The inline help stories wait for
inline-help.

### Visual comparison

`pnpm visual input`: 22 cases × 16 combinations, 352/352 matching after the fix below. Cases, all by pixels and
computed style against fundamental-styles' Input Default, Textarea Primary, Counter, States and Disabled And Read
Only stories (our story texts are theirs): the input at rest and on hover, each value state at rest and on hover,
disabled and read-only; the textarea at rest and on hover, with its counter (field and counter), in each value
state, disabled and read-only. Focus is not compared (the script has no focus option); the focus outline classes
are Angular's.

| Difference                                                                          | Cause                                                                                                                            | Resolution                                 |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Compact textareas one line high (26px instead of 48–94px), so the rows did not show | `fieldBase`'s `compact:h-sap-element-compact-height` is a separate variant from `textareaBase`'s `h-auto` and was not overridden | Fixed: `compact:h-auto` in `textareaBase`. |

Angular issue: the Angular `textareaBase` has the same gap, so Angular's compact textareas are 26px high whatever
their `rows`.

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Examples, States, Textarea and Textarea counter stories.
