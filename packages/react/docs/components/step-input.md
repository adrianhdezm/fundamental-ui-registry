## step-input

Sources: fundamental-react [StepInput](https://github.com/SAP/fundamental-react/tree/main/src/StepInput) · Angular
[`registry/ui/step-input`](../../../angular/registry/ui/step-input/) · fundamental-styles
[Step Input](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-step-input--docs)
Registry: `registry/ui/step-input/`, on Base UI's `NumberField` (`Root`, `Group`, `Input`, `Decrement`, `Increment`),
with the `fieldBase`/`fieldStates` of [input](input.md), the field button classes of [input-group](input-group.md)
(`INPUT_GROUP_BUTTON_VARS`, `STATE_BUTTON_VARS`, `STATE_FOCUS_COLOR`) and our `Button` rendered by the stepper parts.

API: Angular's inputs as props: `min`, `max`, `step`, `inputId`, `name`, `placeholder`, `inputTitle`,
`incrementLabel`, `decrementLabel`, `incrementButtonIcon`, `decrementButtonIcon`, `hasStepButtons`, `disabled`,
`readOnly` (Angular's `readonly`), `required`, `state`, `fullWidth` (Angular's `isFullWidth`, as Button's
`fullWidth`), `textAlign`, `disableWheel`, `locale`, `localeMatcher`, `mode`, `currency`, `currencyDisplay`, `unit`,
`useGrouping`, `minFractionDigits`, `maxFractionDigits`. `aria-label`, `aria-labelledby`, `aria-describedby` and
`aria-roledescription` (default "Step Input") go to the input (Angular's `ariaLabel`, `ariaLabelledBy`,
`ariaRoleDescription`), as in input-group. Angular's `value` model and `ControlValueAccessor` become
`value`/`defaultValue`/`onValueChange(value, details)` (numbers, `null` when empty), plus Base UI's
`onValueCommitted`; touched and dirty come from a Base UI `Field` around it (or `onBlur`). `onFocusIn`/`onFocusOut`
are the root's `onFocus`/`onBlur` (React's bubble as `focusin`/`focusout`); `increment()`/`decrement()` and `format()`
have no React counterpart (the value is controlled; `inputRef` reaches the input). `inputProps` and `inputRef` go to
the input; other native props, `id`, `className` and `ref` to the root `<div>`. With `name`, Base UI's hidden number
input submits the value with a form.

fundamental-react's props map as follows: `compact` is `data-density="compact"`; `inputId`, `placeholder`,
`disabled`, `readOnly` and `value` keep their names; `localizedText.stepUpLabel`/`stepDownLabel` are
`incrementLabel`/`decrementLabel`; `validationState.state` is `state`; `onChange(value)` is `onValueChange`.
`validationState` and `validationOverlayProps` (the message popover) are form's `FormInputMessageGroup` around the step
input with a `FormMessage`: `validationState.text` is the message, `show` is `defaultOpen`, `wrapperProps` and
`className` are the group's own props, `formMessageProps` the message's; the message describes the input after its
unit (Base UI's hidden number input is left out) and errors set `aria-invalid`.

ARIA and keyboard as Angular: the input is a `spinbutton` with `aria-valuenow`, `aria-valuetext` (the formatted
value), `aria-valuemin`/`aria-valuemax`, `aria-required`, `aria-invalid` (error state) and `aria-describedby` the unit
or currency sign shown after the field; the buttons are out of the tab order (`tabindex="-1"`), named and titled by
their labels and `aria-controls` the input; clicks keep the focus in the input and a held button repeats (Base UI:
after 400ms every 60ms; Angular: 500ms and 40ms). Up and Down step, Page Up and Page Down step ten times, Home and End
go to `min`/`max`, and the wheel steps while the input has the focus; a step from an empty value starts at `min` going
up and at `max` going down, as Angular (Base UI starts at the in-range value nearest 0). Stepped values are announced
in a polite live region with the unit (Angular's `LiveAnnouncer`).

**Differences, on purpose:**

- The value follows the typed text (Base UI, and fundamental-react's `onChange`), clamped to `min`/`max` and rounded to
  `maxFractionDigits`; the text is formatted on blur. Angular applies typed text on `change` (blur or Enter), so Enter
  only formats there; here Enter does nothing. Letters and other characters the number format does not use cannot be
  typed (Base UI), so the currency sign is not typed either (it shows after the field).
- A step past a limit stops at the limit and the button is disabled only at the limit (Base UI); Angular ignores a
  single step that would pass the limit and disables the button one step before it.
- Shift with Up and Down steps ten times as Page Up and Page Down (Base UI's `largeStep`); Alt steps once (`smallStep`
  is `step`).
- Values from the app are not clamped to `min`/`max` (Angular's `writeValue` clamps them silently, without telling the
  form); values that are not numbers are ignored as in Angular.
- While a field with a value state has the focus it keeps its state shadow, and its buttons take the state colour (in
  HC the active background), as fundamental-styles; Angular drops the shadow and leaves the buttons alone.
- In the HC themes the value text and the buttons of error and warning fields stay regular, as fundamental-styles; see
  the Angular issues below.
- Field shadows use `[box-shadow:…]` instead of the `shadow-…` utilities (Angular), as in input.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                 | Cause                                                                                                                                                             | Resolution                                                                                                            |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Input `height`, `min-height` and corner radius                                             | fundamental-styles' input keeps the field height and radius and is clipped by the field (in HC 36px inside a 32px content box)                                    | Kept (ignored, styles only): the input has no background or border; not visible.                                      |
| Read-only input: background and dashed line                                                | fundamental-styles draws the read-only background and dashed line on the input too, over the same on the field                                                    | Kept (ignored): same colours on the field behind; not visible.                                                        |
| Read-only field narrower, no buttons                                                       | fundamental-styles keeps the buttons of a read-only step input                                                                                                    | Kept: Angular and the Fiori guidelines hide them (read-only cases by computed style, width ignored).                  |
| Disabled button cursor `not-allowed` instead of `pointer`                                  | Button's disabled cursor                                                                                                                                          | Kept (ignored): the dimmed field takes no pointer events, so the cursor never shows.                                  |
| Compact: error, warning and information buttons 32px instead of 36px (fields 8px narrower) | fundamental-styles' semantic rule uses `--fdStepInput_Button_Width_Semantic_Cozy` in every density; its own `--fdStepInput_Button_Width_Semantic_Compact` is 2rem | Kept: fundamental-styles bug; compact buttons are 2rem in every state, as Angular.                                    |
| HC: the focus frame is missing beside the buttons                                          | fundamental-styles' positioned buttons, with the HC lite backgrounds, paint over the field's focus outline                                                        | Kept: the frame goes around the whole field, as Angular and input-group (whose focus cases match fundamental-styles). |
