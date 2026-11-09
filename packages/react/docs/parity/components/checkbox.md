## checkbox

Sources: fundamental-react [Checkbox](https://github.com/SAP/fundamental-react/tree/main/src/Forms) (`Forms/Checkbox.js`)
· Angular [`registry/ui/checkbox`](../../../../angular/registry/ui/checkbox/) · fundamental-styles
[Checkbox](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-checkbox--docs)
Registry: `registry/ui/checkbox/`, on Base UI's `Checkbox` (`Checkbox.Root`).

API: the Angular inputs as props (`label`, `state`, `disabled`, `readOnly` for `readonly`, `displayOnly`, `required`,
`tristate`, `tristateSelectable`, `values`, `wrapLabel`, `valignLabel`, `name`, `title`, `labelClassName` for
`labelClass`, `id` for `inputId`, `aria-label`/`aria-labelledby`/`aria-describedby`), with the model in React form:

- `value`/`defaultValue`/`onValueChange` for Angular's model (`ngModel`, `value`, `valueChange`), mapped to checked,
  unchecked and mixed through `values` (`true`/`false`/`null` by default) and compared shallowly, as in Angular;
- `checked`/`defaultChecked`/`onCheckedChange` (fundamental-react and Base UI) as the boolean shorthand, and
  `indeterminate` (fundamental-react, Base UI) to show the mixed state whatever the value;
- `onFocusChange` for Angular's `focusChange`; the native `onFocus`/`onBlur`/`onClick` bubble to the root;
- `formValue`, the value submitted with the form (Base UI's and fundamental-react's `value`, renamed because `value`
  is the model);
- from fundamental-react: `labelProps`, `textClassName`, and `inputProps` (props of the focusable control, also how
  Angular's `role` and `tabIndexValue` are set); `ref` is the root, `inputRef` the hidden native input.

fundamental-react's `compact` is `data-density="compact"` on the checkbox or an ancestor; `inline` (a `FormItem`
modifier) is not ported; `inputClassName` is `inputProps.className`.

**Differences on purpose:**

- Base UI renders the box as a focusable `<span role="checkbox">` with `aria-checked`, `aria-readonly`,
  `aria-required` and `aria-disabled`, next to a visually hidden native input (which takes `id`, `name` and `required`
  and is what an external `<label htmlFor>` and forms see). Angular focuses and announces the native input itself.
  The control is named by its label through `aria-labelledby`, so an extra external label is not part of the name;
  Space toggles and Enter does not, as with a native checkbox.
- The check mark is in an `aria-hidden` child of the box: CSS content on the `role="checkbox"` element would be part
  of its accessible name.
- The root is a `<span>` without Angular's host `tabindex="-1"`.
- `standalone` (Angular, only `m-0` on the label, which it already has) is not ported.
- `validationState.text` and `validationOverlayProps` (fundamental-react's validation popover) are the form
  component's `FormInputMessageGroup` with a `FormMessage` around the checkbox: the message opens under it on focus
  and describes the focusable `role="checkbox"` element.

### Stories vs. sources

| Source            | Example                   | React story                              | Status     | Notes                                                                              |
| ----------------- | ------------------------- | ---------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| fundamental-react | primary                   | `Default`                                | ✅ covered | "Default Checkbox" row.                                                            |
| fundamental-react | indeterminate             | `Indeterminate`                          | ✅ covered |                                                                                    |
| fundamental-react | controlledChecked         | `Controlled`                             | ✅ covered | A button toggles `checked` instead of the knob.                                    |
| fundamental-react | defaultChecked            | `DefaultChecked`                         | ✅ covered |                                                                                    |
| fundamental-react | disabled                  | `Disabled`                               | ✅ covered | Plus checked and mixed, with fundamental-styles' texts.                            |
| fundamental-react | compact                   | `Compact`                                | ✅ covered | `data-density="compact"`.                                                          |
| fundamental-react | validationStates          | `ValidationStates`, `ValueStateMessages` | ✅ covered | Unchecked, checked and mixed per state; the messages in form input message groups. |
| fundamental-react | dev                       | `Playground`                             | ✅ covered | Knobs are the Playground controls.                                                 |
| fundamental-react | noStyles                  | —                                        | ➖ n/a     | No `cssNamespace`.                                                                 |
| Angular           | Playground                | `Playground`                             | ✅ covered |                                                                                    |
| Angular           | Default                   | `Default`                                | ✅ covered | External form label through `id`.                                                  |
| Angular           | Tristate                  | `Tristate`                               | ✅ covered |                                                                                    |
| Angular           | Custom values             | `CustomValues`                           | ✅ covered |                                                                                    |
| Angular           | Custom label              | `CustomLabel`                            | ✅ covered | With `Link`.                                                                       |
| Angular           | Label wrapping            | `LabelWrapping`                          | ✅ covered | Plus a truncated label.                                                            |
| Angular           | States                    | `States`                                 | ✅ covered |                                                                                    |
| Angular           | Reactive forms            | `Forms`                                  | ✅ covered | "Accept all" from React state; a native form with `FormData`.                      |
| —                 | Open: value state message | `OpenValueStateMessage`                  | ➕ extra   | The open error message (with a link), checked by axe.                              |

### Tests vs. sources

| Source            | Behaviour                                              | React test                                                                                         | Status     |
| ----------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | ngModel: clicks write the model, model updates the box | controlled: clicks call onValueChange and value changes update the box                             | ✅ covered |
| Angular           | Reactive forms, touched, disabled control              | uncontrolled in a form: submits its name, reports blur, and the disabled state stops changes       | ✅ covered |
| Angular           | Disabled input stops changes                           | the disabled checkbox stops changes                                                                | ✅ covered |
| Angular           | Space toggles                                          | Space toggles the focused checkbox                                                                 | ✅ covered |
| Angular           | Label click toggles, host (click) once, label `for`    | the label and the box toggle, and the root onClick fires once per click                            | ✅ covered |
| Angular           | Tristate selectable cycle                              | tristate cycles unchecked → indeterminate → checked → unchecked when tristateSelectable            | ✅ covered |
| Angular           | Tristate not selectable                                | a tristate checkbox that is not selectable leaves the mixed state but never returns to it          | ✅ covered |
| Angular           | Third state without tristate                           | without tristate, the third state value shows as unchecked                                         | ✅ covered |
| Angular           | Custom values                                          | custom values map to checked, unchecked and indeterminate                                          | ✅ covered |
| Angular           | Error state aria-invalid, state colours                | error state sets aria-invalid; other states colour the box but are valid                           | ✅ covered |
| Angular           | Clearing the state                                     | clearing the state removes the state colour and aria-invalid                                       | ✅ covered |
| Angular           | Readonly                                               | readOnly keeps the value, stays focusable and sets aria-readonly                                   | ✅ covered |
| Angular           | Display only                                           | displayOnly shows the value as a glyph without a box and ignores clicks                            | ✅ covered |
| Angular           | Check glyph                                            | a checked box shows the check glyph; unchecked shows none; the glyph is not part of the name       | ✅ covered |
| Angular           | Required                                               | required sets aria-required and shows the asterisk                                                 | ✅ covered |
| Angular           | Compact density                                        | compact density shrinks the box                                                                    | ✅ covered |
| Angular           | wrapLabel and valignLabel                              | wrapLabel lets long labels wrap; valignLabel top aligns the box with the first line                | ✅ covered |
| Angular           | focus() and focusChange                                | focus and blur call onFocusChange; the control ref focuses it                                      | ✅ covered |
| Angular           | Focus indicator (peer-focus classes)                   | the label shows the focus indicator while the control has focus                                    | ✅ covered |
| fundamental-react | checked, defaultChecked, indeterminate, onChange       | checked, defaultChecked and indeterminate (fundamental-react)                                      | ✅ covered |
| fundamental-react | disabled                                               | the disabled checkbox stops changes                                                                | ✅ covered |
| fundamental-react | aria-label without a visible label                     | is named by its label, or by aria-label                                                            | ✅ covered |
| fundamental-react | Spreading to root, input, label; class props; ref      | passes className, native props and the ref to the root; labelProps, inputProps and the class props | ✅ covered |
| fundamental-react | id on the input                                        | uses the given id for the input, so an external label works                                        | ✅ covered |
| fundamental-react | inline class                                           | —                                                                                                  | ➖ n/a     |
| fundamental-react | validationOverlayProps (popover, form message)         | — (form: describes a checkbox and the radios of a group)                                           | ➖ n/a     |

### Visual comparison

`pnpm visual checkbox`: 32 cases × 16 combinations, 512/512 matching after the fixes below. Cases, on the box by
pixels: unchecked (at rest and on hover), checked and mixed; disabled unchecked, checked and mixed; error, success,
warning and information each unchecked, on hover, checked and mixed; read-only unchecked, checked and mixed;
display-only checked and mixed. On the label: the disabled label by pixels (same text), the label at rest, the
display-only label and the required text with its asterisk (styles: the texts differ). Reviewed by eye in Horizon
cozy and compact, LTR and RTL (`States`, `ValidationStates`, `LabelWrapping`, `Forms`, `Default` with focus).

| Difference                                                                                                                                                           | Cause                                                                                             | Resolution                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Label text in the label colour (`--sapContent_LabelColor`, e.g. #556b82) with a 1rem line height; fundamental-styles: `--sapTextColor` (#131e29), line height normal | The label colour and `leading-4` of the label were inherited by the text (as in Angular)          | Fixed: `text-sap-text-color` and `leading-[normal]` on the text and its container. Angular issue.                                |
| High contrast: hovered success, warning and information boxes take `--sapSelectedColor` instead of `--sapField_Hover_Background` (black in HC Black)                 | The default state's `hc:` hover variable outlived the state's own value (only error overrides it) | Fixed: those states set the `hc:` hover background too. Angular issue.                                                           |
| Display-only icon: the box has a 16px font and a 16px line height; fundamental-styles keeps 14px with a normal line height and draws the icon at 1rem in a 1rem box  | `text-[1rem]` on the box (and `tailwind-merge` dropping `leading-[normal]` before it)             | Fixed: the icon is a 1rem flex box at 1rem; the box keeps the font size. In Angular a style difference only (no visible pixels). |
