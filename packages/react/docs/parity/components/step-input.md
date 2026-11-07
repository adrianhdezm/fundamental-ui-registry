## step-input

Sources: fundamental-react [StepInput](https://github.com/SAP/fundamental-react/tree/main/src/StepInput) · Angular
[`registry/ui/step-input`](../../../../angular/registry/ui/step-input/) · fundamental-styles
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
`validationState.text` and `validationOverlayProps` (the message popover) belong to the form component's input
message group.

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

### Stories vs. sources

| Source             | Example                       | React story                     | Status     | Notes                                                                                         |
| ------------------ | ----------------------------- | ------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| fundamental-react  | primary                       | `Primary`                       | ✅ covered | fundamental-styles' label "Default Step Input" instead of "Amount".                           |
| fundamental-react  | compact                       | `Compact`                       | ✅ covered | `data-density="compact"` instead of `compact`.                                                |
| fundamental-react  | disabled                      | `Disabled`                      | ✅ covered |                                                                                               |
| fundamental-react  | readOnly                      | `ReadOnly`                      | ✅ covered | fundamental-styles' Read Only, with the unit "Degree Celsius".                                |
| fundamental-react  | validationStates              | `States`                        | 🟡 partial | The four states with their placeholders; the message popover waits for form.                  |
| fundamental-react  | dev                           | `Playground`                    | ✅ covered |                                                                                               |
| fundamental-react  | noStyles                      | —                               | ➖ n/a     | No `cssNamespace`.                                                                            |
| Angular            | Playground                    | `Playground`                    | ✅ covered |                                                                                               |
| Angular            | Default                       | `Default`                       | ✅ covered |                                                                                               |
| Angular            | Formats, currencies and units | `Formats`                       | ✅ covered |                                                                                               |
| Angular            | States                        | `States`                        | 🟡 partial | The state messages (form input message group) wait for form.                                  |
| Angular            | Form                          | `Form`                          | ✅ covered | `value`/`onValueChange`, `onBlur`; value, dirty, touched and status printed; disabled toggle. |
| fundamental-styles | Primary                       | `Primary`                       | ✅ covered |                                                                                               |
| fundamental-styles | States                        | `States`                        | ✅ covered |                                                                                               |
| fundamental-styles | Focused                       | `FocusDefault` … `FocusWarning` | ✅ covered | "Focus: …" stories (not in docs) focus their input in `play`, for the visual focus cases.     |
| fundamental-styles | Disabled                      | `Disabled`                      | ✅ covered |                                                                                               |
| fundamental-styles | Read Only                     | `ReadOnly`                      | ✅ covered | Without buttons (Angular, Fiori).                                                             |
| fundamental-styles | Full Width                    | `FullWidth`                     | ✅ covered |                                                                                               |

### Tests vs. sources

| Source            | Behaviour                                                          | React test                                                                                       | Status     |
| ----------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------- |
| Angular           | Spin button with value and limits                                  | is a spin button with the value and its limits                                                   | ✅ covered |
| Angular           | Buttons step, disabled at the limits, focus stays in the input     | steps with the buttons and disables them at the limits                                           | ✅ covered |
| Angular           | Arrows, Home, End                                                  | steps with the keyboard                                                                          | ✅ covered |
| Angular           | Decimal steps without floating point noise                         | adds decimal steps without floating point noise                                                  | ✅ covered |
| Angular           | Parses locale text, limits it, ignores invalid text, clears        | parses typed text in the locale, limits it, and formats it on blur                               | ✅ covered |
| Angular           | Empty value starts at the minimum                                  | starts an empty value at the minimum going up, and at the maximum going down                     | ✅ covered |
| Angular           | Repeats while a button is held                                     | repeats while a button is held                                                                   | ✅ covered |
| Angular           | Unit describes the input; touched on blur                          | describes the input with the unit and is marked touched on blur in a Base UI Field               | ✅ covered |
| Angular           | `onFocusIn`, `onFocusOut`                                          | calls onFocus and onBlur of the root (Angular onFocusIn and onFocusOut)                          | ✅ covered |
| Angular           | Writes only null or numbers                                        | ignores values that are not numbers                                                              | ✅ covered |
| Angular           | Enter and Space on the buttons                                     | steps with Enter and Space on the buttons                                                        | ✅ covered |
| Angular           | Custom step, Page Up, Page Down                                    | steps by a custom step, and by ten steps with Page Up and Page Down; steps from typed text …     | ✅ covered |
| Angular           | Smaller in compact density                                         | is smaller in compact density                                                                    | ✅ covered |
| Angular           | Error state: `aria-invalid`, invalid border colour                 | shows the error state with aria-invalid and the invalid border colour                            | ✅ covered |
| Angular           | Titles, custom icons                                               | puts titles on the buttons and the input, and takes custom button icons                          | ✅ covered |
| Angular           | `inputId`, `ariaLabel`                                             | puts inputId, aria-label and aria-labelledby on the input                                        | ✅ covered |
| Angular           | Wheel only while focused, `disableWheel`                           | steps with the wheel only while focused, and not with disableWheel                               | ✅ covered |
| Angular           | Starts from the limit after clearing a value at the maximum        | starts from the limit when a value at the maximum is cleared                                     | ✅ covered |
| Angular           | Euros in currency mode                                             | formats and parses euros in currency mode, with the sign after the field                         | ✅ covered |
| Angular           | Read-only hides buttons, blocks changes                            | hides the buttons and blocks changes when read-only                                              | ✅ covered |
| Angular           | Form `disable()`: input and buttons disabled                       | disables the input and both buttons                                                              | ✅ covered |
| fundamental-react | Renders a `div`, data attribute                                    | renders a div and passes className, native props, the ref and the input ref through              | ✅ covered |
| fundamental-react | `onChange` for numbers, not for other text, and the step buttons   | calls onValueChange for typed numbers, not for other text, and for the step buttons              | ✅ covered |
| fundamental-react | `validationOverlayProps` (6 tests)                                 | —                                                                                                | ⬜ missing |
| —                 | Live announcement, `onValueCommitted`, form submission             | announces stepped values with the unit; calls onValueCommitted …; works uncontrolled and submits | ✅ covered |
| —                 | Focus frame, fraction digits, grouping, `hasStepButtons`, required | shows the focus frame …; formats with the fraction digits …; hides the buttons …; marks required | ✅ covered |

The `validationOverlayProps` tests and the state messages wait for the form component (form message, input message
group).

### Visual comparison

`pnpm visual step-input`: 33 cases × 16 combinations, 380/528 matching; the other 148 are the two kept differences
below (120 with the compact semantic button widths, 28 more with the HC focus frame only). Cases, by pixels and computed style against fundamental-styles'
Step Input stories (our story texts and values are theirs): the field at rest and hovered, both buttons, the hovered
increment button and the input (Primary); success, information, error and warning fields at rest and hovered, with
their increment button at rest and hovered (States); the disabled field and its button (Disabled); the read-only
field at rest and hovered and its input, by computed style (Read Only); the full-width field and an error one (Full
Width); the focused field in each value state and the focused error button ("Focus: …" stories against Focused's
`is-focus`).

| Difference                                                                                                                                     | Cause                                                                                                                                                             | Resolution                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| HC: error and warning fields 14px wider (cozy), value text and buttons bold italic                                                             | `fieldStates`' HC `italic font-bold` on the field is inherited by the input and the buttons; fundamental-styles keeps them regular                                | Fixed: `font-normal not-italic` on the input and the buttons.                                                                        |
| Focused fields with a value state lose their state shadow                                                                                      | `has-[input:focus]:[box-shadow:none]` for every state (Angular's); fundamental-styles keeps the state shadow while focused (none on hover)                        | Fixed: none only without a state; with a state, none only while hovered.                                                             |
| Buttons of a focused field with a value state: field text colour instead of the state colour (e.g. #131e29 → #aa0808), HC no active background | fundamental-styles colours the buttons of a focused state field (`--fdInput_Group_Button_*_Active_Text_Color`, active background)                                 | Fixed: `--sapButton_Lite_TextColor` from input-group's `STATE_BUTTON_VARS` and `bg-sap-button-lite-active-background` while focused. |
| Input `height`, `min-height` and corner radius                                                                                                 | fundamental-styles' input keeps the field height and radius and is clipped by the field (in HC 36px inside a 32px content box)                                    | Kept (ignored, styles only): the input has no background or border; not visible.                                                     |
| Read-only input: background and dashed line                                                                                                    | fundamental-styles draws the read-only background and dashed line on the input too, over the same on the field                                                    | Kept (ignored): same colours on the field behind; not visible.                                                                       |
| Read-only field narrower, no buttons                                                                                                           | fundamental-styles keeps the buttons of a read-only step input                                                                                                    | Kept: Angular and the Fiori guidelines hide them (read-only cases by computed style, width ignored).                                 |
| Disabled button cursor `not-allowed` instead of `pointer`                                                                                      | Button's disabled cursor                                                                                                                                          | Kept (ignored): the dimmed field takes no pointer events, so the cursor never shows.                                                 |
| Compact: error, warning and information buttons 32px instead of 36px (fields 8px narrower)                                                     | fundamental-styles' semantic rule uses `--fdStepInput_Button_Width_Semantic_Cozy` in every density; its own `--fdStepInput_Button_Width_Semantic_Compact` is 2rem | Kept: fundamental-styles bug; compact buttons are 2rem in every state, as Angular.                                                   |
| HC: the focus frame is missing beside the buttons                                                                                              | fundamental-styles' positioned buttons, with the HC lite backgrounds, paint over the field's focus outline                                                        | Kept: the frame goes around the whole field, as Angular and input-group (whose focus cases match fundamental-styles).                |

Angular issues: in the HC themes the value text and the buttons of error and warning fields are bold italic (the
field 14px wider in cozy); a focused field with a value state loses its state shadow and its buttons keep the field
text colour (no active background in HC); hovered buttons of state fields get the default field hover shadow instead
of the state shadow (no `STATE_BUTTON_VARS`, read from the code).

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, Formats, States, Form and Focus: error.
