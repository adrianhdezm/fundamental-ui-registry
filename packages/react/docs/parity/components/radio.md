## radio

Sources: fundamental-react [FormRadioGroup and FormRadioItem](https://github.com/SAP/fundamental-react/tree/main/src/Forms)
(`Forms/FormRadioGroup.js`, `Forms/FormRadioItem.js`) · Angular [`registry/ui/radio`](../../../../angular/registry/ui/radio/)
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

### Stories vs. sources

| Source            | Example                       | React story             | Status     | Notes                                                                        |
| ----------------- | ----------------------------- | ----------------------- | ---------- | ---------------------------------------------------------------------------- |
| fundamental-react | primary                       | `Default`               | ✅ covered | With fundamental-styles' texts: option 1 selected, option 3 disabled.        |
| fundamental-react | inline                        | `Inline`                | ✅ covered |                                                                              |
| fundamental-react | compact                       | `Compact`               | ✅ covered | `data-density="compact"`.                                                    |
| fundamental-react | disabled                      | `Disabled`              | ✅ covered | Disabled radios with one selected, and a disabled group.                     |
| fundamental-react | validationStates              | `ValidationStates`      | ✅ covered | fundamental-styles' "interaction states": rest, checked, hover per state.    |
| fundamental-react | dev                           | `Playground`            | ✅ covered | Knobs are the Playground controls (`inline`, `disabled`, `state`, ...).      |
| fundamental-react | noStyles                      | —                       | ➖ n/a     | No `cssNamespace`.                                                           |
| Angular           | Examples                      | `Examples`              | ✅ covered | Controlled groups in form fieldsets; the legend names each group.            |
| Angular           | States                        | `States`                | ✅ covered | Cozy, compact, disabled and read-only groups.                                |
| Angular           | Reactive form                 | `Forms`                 | ✅ covered | A native form with `FormData`, a required group and a disabled group.        |
| Angular           | Label wrapping and truncation | `LabelWrapping`         | ✅ covered | fundamental-styles' text and 400px width, so it is compared by pixels.       |
| —                 | Value state messages          | `ValueStateMessages`    | ➕ extra   | A message per group in a form input message group; it describes every radio. |
| —                 | Open: value state message     | `OpenValueStateMessage` | ➕ extra   | The open error message (with a link), checked by axe.                        |

### Tests vs. sources

| Source            | Behaviour                                                     | React test                                                                                                   | Status     |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| Angular           | ngModel: the model selects one radio, a click writes it, null | controlled: the value selects one radio, a click calls onValueChange, null selects none                      | ✅ covered |
| Angular           | Reactive forms, including disable()                           | uncontrolled in a form: submits the group name, and a disabled group stops changes                           | ✅ covered |
| Angular           | selectedValue without a form                                  | a value from outside selects the radio (Angular selectedValue)                                               | ✅ covered |
| Angular           | Arrow keys move the selection; one tab stop                   | arrow keys move the selection inside the group; only the checked radio is tabbable                           | ✅ covered |
| Angular           | Arrow keys skip disabled radios                               | arrow keys skip disabled radios                                                                              | ✅ covered |
| Angular           | Disabled radio cannot be selected, dimmed                     | a disabled radio cannot be selected and is dimmed                                                            | ✅ covered |
| Angular           | No aria-description unless read-only                          | a radio that is not read-only has no aria-description                                                        | ✅ covered |
| Angular           | Read-only keeps the value, focusable, described               | readOnly keeps the value, stays focusable and is described as read-only                                      | ✅ covered |
| Angular           | Error state aria-invalid; states colour the circle            | error state sets aria-invalid; every state colours the circle                                                | ✅ covered |
| Angular           | Checked radio shows the dot                                   | the checked radio shows the dot                                                                              | ✅ covered |
| Angular           | Compact density shrinks the circle                            | compact density shrinks the circle and the dot                                                               | ✅ covered |
| Angular           | (classes) focus indicator, wrapLabel, valignLabel, required   | the label shows the focus indicator…; wrapLabel lets long labels wrap…; a long label is truncated…; required | ✅ covered |
| —                 | Space selects, Enter does not; read-only group                | Space selects the focused radio; Enter does not; a read-only group keeps its value and describes every radio | ✅ added   |
| fundamental-react | Group disabled disables every item                            | a disabled group disables every radio (fundamental-react)                                                    | ✅ covered |
| fundamental-react | Group inline                                                  | inline shows the radios in a row (fundamental-react)                                                         | ✅ covered |
| fundamental-react | Group and item onChange (with data)                           | a group onValueChange gets the value of the selected radio, of any type (fundamental-react data)             | ✅ covered |
| fundamental-react | checked, defaultChecked                                       | checked and defaultChecked of fundamental-react are the group value and defaultValue                         | ✅ covered |
| fundamental-react | disabled                                                      | a disabled radio cannot be selected and is dimmed                                                            | ✅ covered |
| fundamental-react | Spreading to item, label and input; ref                       | passes className, native props and the ref to the root; labelProps, inputProps, inputRef and the class props | ✅ covered |
| fundamental-react | id on the input                                               | uses the given id for the input, so an external label works; is named by its label, or by aria-label         | ✅ covered |

### Visual comparison

`pnpm visual radio`: 32 cases × 16 combinations, 508/512 in the full run; the 4 differences (RTL text, below) pass
when their combinations are run again. The stories use fundamental-styles' texts, so every case is compared by
pixels: the whole label (circle, dot and text, against fundamental-styles' label with its `::before` and `::after`)
checked, unchecked, disabled and with keyboard focus (`Default` against "Primary"); the label text; the inline group
(`Inline`); default, success, error, warning, information and read-only each at rest, checked and on hover, and the
disabled states (`ValidationStates` against "Interaction States"); a truncated, a wrapped and a top-aligned wrapped
400px label (`LabelWrapping` against "Text Truncation"). Reviewed by eye in Horizon cozy and compact, LTR and RTL
(`States`, `ValidationStates`, `Examples`, `LabelWrapping`, with keyboard focus).

| Difference                                                                                                                                                                                   | Cause                                                                                                                            | Resolution                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label text in `--sapField_TextColor` with a 1rem line height; fundamental-styles: `--sapTextColor` (#f5f6f7 instead of #fff in Horizon Dark) and a normal line height                        | Angular's text inherits the label's colour and `leading-4`                                                                       | Fixed: `text-sap-text-color` and `leading-[normal]` on the text. Angular issue.                                                                                                                               |
| High contrast: hovered success, warning and information circles would take `--sapSelectedColor` instead of `--sapField_Hover_Background`                                                     | Angular's states set no `hc:` hover background, so the default state's one applies (only error overrides it); as in the checkbox | Fixed: those states set the `hc:` hover background too (confirmed by the hover cases in HC Black and HC White). Angular issue.                                                                                |
| Read-only label: Angular has `cursor: default`; fundamental-styles keeps `pointer`                                                                                                           | Angular's `cursor-default`                                                                                                       | Fixed: the read-only label keeps the pointer (a click focuses the radio). Angular issue (cursor only).                                                                                                        |
| RTL only, at random: a label's text 3.8–8% off by pixels (sub-pixel glyph offsets, no style difference), different cases on every run; once, a text 1–3px wider (LTR and RTL) in one capture | Not in the component: geometry measured identical to fundamental-styles' (same label, text and circle boxes) in repeated renders | Kept: each case passes when its combination is run again. Likely the harness (the left-edge snap leaves a fractional right edge in RTL, where the text is laid out from the right; a late font swap at load). |
