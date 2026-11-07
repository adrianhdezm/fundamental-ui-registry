## input-group

Sources: fundamental-react [InputGroup](https://github.com/SAP/fundamental-react/tree/main/src/InputGroup)
(`InputGroup.js`, `_InputGroupAddon.js`) · Angular [`registry/ui/input-group`](../../../../angular/registry/ui/input-group/)
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
`validationState.text` and `validationOverlayProps` (the message popover) belong to the form component's input
message group.

**Differences, on purpose:**

- `InputGroupInput` takes `disabled`, `readOnly` and `aria-invalid` (error state) from the group; Angular leaves a
  projected input alone, so a disabled group had an enabled input. Its own props win.
- The addon only describes the input (`aria-describedby`) when the group renders it; Angular adds the addon id even
  when a projected addon replaces it, so the reference points at nothing.
- A group with a text area grows with its rows (`has-[textarea]:h-auto`); Angular's group stays one line high.
- Addon buttons have no border (fundamental-styles' `border: none`) and keep the lite button backgrounds in the HC
  themes; see the Angular issues below.
- Field shadows use `[box-shadow:…]` instead of the `shadow-…` utilities (Angular), as in input.

### Stories vs. sources

| Source             | Example         | React story                         | Status     | Notes                                                                                     |
| ------------------ | --------------- | ----------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| fundamental-react  | primary         | `ButtonAddon`, `Compact`            | ✅ covered | Icon button before the input ("Left Aligned Icon Button Add-on"; "Select" in `Compact`).  |
| fundamental-react  | compact         | `Compact`                           | ✅ covered | `data-density="compact"` instead of `compact`.                                            |
| fundamental-react  | disabled        | `ProjectedParts`, `States`          | ✅ covered | The projected button and input in a disabled group.                                       |
| fundamental-react  | validationState | `States`                            | 🟡 partial | The four states with "$" addons; their message popover after form.                        |
| fundamental-react  | addonButton     | `ButtonAddon`                       | ✅ covered | Icon buttons after and before the input.                                                  |
| fundamental-react  | addonText       | `TextAddon`                         | ✅ covered | "€" after, "$" before (fundamental-styles' texts).                                        |
| fundamental-react  | addonIcon       | `IconAddon`                         | ✅ covered | fundamental-styles' employee and hide icons, and globe from parts.                        |
| fundamental-react  | textArea        | `TextArea`                          | ✅ covered | `InputGroupInput render={<textarea />}` with an icon addon.                               |
| fundamental-react  | dev             | `Playground`                        | ✅ covered |                                                                                           |
| fundamental-react  | noStyles        | —                                   | ➖ n/a     | No `cssNamespace`.                                                                        |
| Angular            | Playground      | `Playground`                        | ✅ covered |                                                                                           |
| Angular            | Text addon      | `TextAddon`                         | ✅ covered | fundamental-styles' texts and values; plus addons on both sides, as fundamental-styles.   |
| Angular            | Icon addon      | `IconAddon`                         | ✅ covered | fundamental-styles' icons and texts instead of the cart.                                  |
| Angular            | Button addon    | `ButtonAddon`                       | ✅ covered | Plus fundamental-styles' Input With Actions examples.                                     |
| Angular            | Projected parts | `ProjectedParts`                    | ✅ covered |                                                                                           |
| Angular            | States          | `States`                            | 🟡 partial | All groups (fundamental-styles' States first); the form messages wait for form.           |
| Angular            | Compact         | `Compact`                           | ✅ covered |                                                                                           |
| Angular            | Inline          | `Inline`                            | ✅ covered |                                                                                           |
| Angular            | Forms           | `Controlled`                        | ✅ covered | `value`/`onValueChange`, number type, disabled; touched and dirty printed.                |
| Angular            | Search          | `Search`                            | ✅ covered | `onSearch`, `onAddOnButtonClick`.                                                         |
| Angular            | Open: states    | —                                   | ⬜ missing | Needs form (input message group popover).                                                 |
| fundamental-styles | Focus           | `FocusDefault` … `FocusInformation` | ✅ covered | "Focus: …" stories (not in docs) focus their input in `play`, for the visual focus cases. |

### Tests vs. sources

| Source            | Behaviour                                                | React test                                                                       | Status     |
| ----------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------- |
| Angular           | Input labelled by its label, described by the text addon | renders an input labelled by its label and described by the text addon           | ✅ covered |
| Angular           | Addon before or after                                    | places the addon before or after the input                                       | ✅ covered |
| Angular           | Form control: value, touched, `setValue`, `disable()`    | works controlled …, and can be disabled; works uncontrolled … in a Base UI Field | ✅ covered |
| Angular           | Numbers for number inputs                                | reports numbers for number inputs                                                | ✅ covered |
| Angular           | `addOnButtonClicked`, `aria-controls`                    | calls onAddOnButtonClick from the addon button, which controls the input         | ✅ covered |
| Angular           | Non-focusable button keeps the focus in the input        | keeps the focus in the input when the button is not focusable                    | ✅ covered |
| Angular           | Projected input and addon replace the generated ones     | uses projected inputs and addons instead of its own                              | ✅ covered |
| Angular           | Addon accessible names (5 tests)                         | addon accessible names (5 tests)                                                 | ✅ covered |
| fundamental-react | Renders a `div`, prop spreading                          | renders a div and passes className, native props and the refs through            | ✅ covered |
| fundamental-react | `fd-input-group__input` on the input, not the addon      | styles the input as the group input, and spreads props on inputs and addons      | ✅ covered |
| fundamental-react | InputGroupAddon prop spreading                           | styles the input as the group input, and spreads props on inputs and addons      | ✅ covered |
| fundamental-react | `validationOverlayProps` (6 tests)                       | —                                                                                | ⬜ missing |
| —                 | `isControl`, `isExpanded`, `addonButtonAriaHidden`       | exposes a popup control with aria-haspopup and aria-expanded, and can hide …     | ✅ covered |
| —                 | Disabled, read-only, error passed to projected inputs    | passes disabled, readOnly and the error state to projected inputs                | ✅ covered |
| —                 | States                                                   | states set aria-invalid only for errors and change the group colours             | ✅ covered |
| —                 | Focus frame, `showFocus`                                 | shows the focus frame while the input has the focus, unless showFocus is off     | ✅ covered |
| —                 | Read-only, inline, `onSearch`, compact, text area        | read-only …; inline groups …; calls onSearch …; compact density …; grows with …  | ✅ covered |

The `validationOverlayProps` tests and the "Open: states" story wait for the form component (form message, input
message group).

### Visual comparison

`pnpm visual input-group`: 33 cases × 16 combinations, 528/528 matching after the fixes below. Cases, by pixels and computed style against fundamental-styles' Input Group
stories (our story texts are theirs): groups with a text addon before (at rest and hovered), after and on both sides,
the text addon and the input themselves (Text Add On); icon addons before and after (Input With Icons); text and icon
button addons (group, button at rest and hovered), two icon buttons and a text button before (Input With Actions);
success, error, warning and information groups at rest and hovered, the information button, disabled, read-only at
rest and hovered (States); the focused group in each value state ("Focus: …" stories against Focus's `is-focus`).

| Difference                                                                                   | Cause                                                                                                                         | Resolution                                                                      |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Groups 384px wide instead of the full width                                                  | The stories' `max-w-96` (Angular's)                                                                                           | Fixed in the stories: full width as fundamental-styles' (Playground keeps it).  |
| `min-height` 36px/26px instead of none                                                       | `fieldBase`'s field minimum height; fundamental-styles' group has none                                                        | Fixed: `min-h-0` on the group (not visible).                                    |
| Addon buttons 2px wider, 1px transparent border                                              | The button border stays; fundamental-styles' `.fd-input-group__button` has `border: none`                                     | Fixed: `[&_button]:border-0` in `INPUT_GROUP_BUTTON_VARS`.                      |
| HC: addon buttons transparent instead of black/white, hover transparent instead of `#795100` | `INPUT_GROUP_BUTTON_VARS` sets the lite button backgrounds to transparent in every theme; fundamental-styles keeps them in HC | Fixed: those three variables only `not-hc:`.                                    |
| Compact input end padding 4px instead of 8px                                                 | fundamental-styles' compact field padding (0.5rem) applies to the group input                                                 | Fixed: `compact:px-2` on the input (first/last child keep 0.625rem).            |
| Input `min-height` 0 and no corner radius                                                    | fundamental-styles' input keeps the field's `min-height: 100%` and radius                                                     | Kept (ignored in the case): the input has no background or border; not visible. |

Angular issues: Angular's addon buttons keep their 1px transparent border (text buttons 2px wider than
fundamental-styles') and lose the lite button backgrounds in the HC themes (transparent instead of black/white, no
hover colour); a disabled group leaves a projected input enabled; the addon's `aria-describedby` id is kept when a
projected addon replaces the generated one.

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Text addon, Icon addon, Button addon, Projected parts,
Text area, States, Compact and Inline stories.
