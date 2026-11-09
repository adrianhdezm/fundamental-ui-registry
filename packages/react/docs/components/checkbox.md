## checkbox

Sources: fundamental-react [Checkbox](https://github.com/SAP/fundamental-react/tree/main/src/Forms) (`Forms/Checkbox.js`)
· Angular [`registry/ui/checkbox`](../../../angular/registry/ui/checkbox/) · fundamental-styles
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
