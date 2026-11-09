## radio

Sources: fundamental-react [FormRadioGroup and FormRadioItem](https://github.com/SAP/fundamental-react/tree/main/src/Forms)
(`Forms/FormRadioGroup.js`, `Forms/FormRadioItem.js`) · Angular [`registry/ui/radio`](../../../angular/registry/ui/radio/)
· fundamental-styles [Radio](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-radio--docs)
Registry: `registry/ui/radio/`, on Base UI's `RadioGroup` and `Radio` (`Radio.Root`, `Radio.Indicator`).

API: two components. `RadioGroup` owns what Angular binds on every `fd-radio-button` (`name`, the `ngModel`/form
control) and what fundamental-react's `FormRadioGroup` hands to its children: `value`/`defaultValue`/`onValueChange`
(Base UI; `null` selects none), `name`, `disabled`, `readOnly`, `required`, `form`, `inputRef`, and `inline`
(fundamental-react, fundamental-styles' `fd-form-group--inline`). `Radio` takes Angular's per-radio inputs: `value`
(any type, compared with `===`), `label` or `children`, `state` (`error` sets `aria-invalid`), `disabled`, `readOnly`,
`wrapLabel`, `valignLabel`, `title`, `readOnlyDescription`, `id` (the hidden input's, for an external
`<label htmlFor>`), `aria-label`/`aria-labelledby`/`aria-describedby`, plus `labelClassName`, `textClassName`,
`labelProps`, `inputProps` (props of the focusable control) and `inputRef`, as the checkbox.

fundamental-react's props map as follows: `FormRadioItem`'s `data` is `value` (the group's `onValueChange` receives
it, as `onChange(event, data)` did); its `checked`/`defaultChecked` are the group's `value`/`defaultValue`; `name` is
the group's (Base UI generates none: without `name` nothing is submitted); `compact` is `data-density="compact"` on
the group or an ancestor; `inline` is the group's; `inputProps`, `labelProps` and native props spread as before (to the
control, the label and the root `<span>`, which replaces the `FormItem` `<div>`). The `ref` is the root, `inputRef`
the hidden native input (fundamental-react forwarded `ref` to its `<input>`).

**Differences on purpose:**

- Base UI renders each radio as a focusable `<span role="radio">` (with `aria-checked`, `aria-disabled`,
  `aria-invalid`) next to a visually hidden native input (which takes `id`, `name` and the submitted value), inside a
  `<div role="radiogroup">`; Angular focuses and announces the native input itself and has no group element. The
  group is a composite: one tab stop (the checked radio, else the first enabled one), arrow keys move the selection
  and skip disabled radios, wrapping at the ends, and follow the reading direction in RTL; Space selects, Enter does
  not — as native radio buttons in Angular.
- `required` and the read-only state of the whole group are on `RadioGroup` (`aria-required`, `aria-readonly` belong
  to `radiogroup`, not to `radio`). A read-only radio is described by `aria-description` (`readOnlyDescription`), as
  in Angular and fundamental-styles; a click on its label only focuses it.
- A `Radio` needs a `RadioGroup` (Base UI's radio has no checked state of its own). Angular's `selectedValue` and
  `standalone` (a lone radio, e.g. in a list item) are a `RadioGroup` with `value` around it.
- The dot is Base UI's `Radio.Indicator` inside the circle, rendered only when checked; fundamental-styles and Angular
  draw it as the label's `::after`.
- The label text has fundamental-styles' `--sapTextColor` and normal line height (Angular: inherited from the label,
  `--sapField_TextColor` and 1rem); see the visual comparison.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                                                                                                                   | Cause                                                                                                                            | Resolution                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RTL only, at random: a label's text 3.8–8% off by pixels (sub-pixel glyph offsets, no style difference), different cases on every run; once, a text 1–3px wider (LTR and RTL) in one capture | Not in the component: geometry measured identical to fundamental-styles' (same label, text and circle boxes) in repeated renders | Kept: each case passes when its combination is run again. Likely the harness (the left-edge snap leaves a fractional right edge in RTL, where the text is laid out from the right; a late font swap at load). |
