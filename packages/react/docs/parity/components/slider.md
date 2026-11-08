## slider

Sources: Angular [`registry/ui/slider`](../../../../angular/registry/ui/slider/) (itself from `@fundamental-ngx/core`'s
`fd-slider`) · no fundamental-react source · fundamental-styles
[Slider](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-slider--docs).
Registry: `registry/ui/slider/`: the `Slider` component on Base UI's `Slider` (`Root`, `Control`, `Track`,
`Indicator`, `Thumb`) and `DirectionProvider`, with Angular's classes.

API, as Angular's inputs:

| Angular                                                  | React                                                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `value` model, `ControlValueAccessor`                    | `value`/`defaultValue`/`onValueChange(value)`: a number, `[a, b]`, or the custom value item(s) |
| `mode`, `min`, `max`, `step`, `jump`                     | the same (`jump` is Base UI's `largeStep`)                                                     |
| `customValues`                                           | `customValues` (`{ value, label }[]`; Base UI works on their indexes)                          |
| `showTicks`, `showTicksLabels`, `tickmarksBetweenLabels` | the same                                                                                       |
| `hideProgressBar`, `tooltipMode`, `vertical`, `cozy`     | the same (`vertical` is Base UI's `orientation`)                                               |
| `disabled`, `setDisabledState`                           | `disabled`                                                                                     |
| `ariaLabel`, `ariaLabelledBy`, `ariaValueText`           | `aria-label`, `aria-labelledby`, `aria-valuetext`, put on each handle                          |
| `rangeAriaLabel`                                         | `rangeAriaLabel` ("Range from {min} to {max}")                                                 |
| `id`, `class`                                            | `id`, `className` and other native props on the root `<div>`; `ref` to the root                |
| `onTouched` (focus leaves the slider)                    | the root's `onBlur` (check `relatedTarget`), or a Base UI `Field` (touched, dirty)             |
| —                                                        | `name`: Base UI's range inputs submit the value with a form (indexes for custom values)        |

ARIA and keyboard as Angular: each handle is a `slider` (Base UI's visually hidden `<input type="range">` inside the
handle) with `aria-valuenow`, the minimum and maximum, `aria-orientation`, the name and, with custom values,
`aria-valuetext` the label; a range has a focusable `role="group"` between the handles named by `rangeAriaLabel`,
whose drag and keys move both handles keeping the range's size, and range changes are announced in a polite live
region (Angular's `LiveAnnouncer`). The arrows move by `step`, Shift+arrows and Page Up/Down by `jump` (one value with
custom values), Home and End to the ends, mirrored in RTL; a press on the track moves the nearer handle there and
drags it; ticks closer than 8px collapse to the two ends; the read-only tooltip shows while the slider is hovered or
focused, the editable one takes typed numbers (a decimal comma too) on Enter and blur.

**Differences, on purpose:**

- Base UI renders and positions the handles (inline `inset-inline-start`/`bottom` and `translate`), the progress
  (`Indicator`) and handles the pointer (presses, drags, touch). The keys are handled by the slider itself, with
  Angular's rules, so Base UI's keyboard handling is skipped (`preventDefault`).
- The focus is on Base UI's range input inside the handle: the handle's focus styles use `has-focus:`; disabled
  handles are disabled inputs (out of the tab order) instead of Angular's `tabindex="-1"` and `aria-disabled`. Base UI
  sets `aria-orientation="horizontal"` too.
- A range keeps its values sorted (Base UI): when a handle passes the other (a drag, End or Home), the values swap
  between the two handles and the focus moves to the handle with the moved value; Angular keeps the handle and sorts
  only the value it reports. Its `[(value)]` model, unsorted while dragging, is always sorted here.
- The direction is the CSS direction of the slider (as Angular's `Directionality` and the other ported components),
  passed to Base UI with a `DirectionProvider` around it, so a `dir` attribute alone mirrors keys and pointer.
- A press on the dots at the ends of the track counts as a press on the track (Base UI's control includes them).
- Field shadows use `[box-shadow:…]` (track, progress in HC, tooltip) instead of the `shadow-…` utilities, and the
  tick labels take the small font and label colour each (fundamental-styles), not from their container.

### Stories vs. sources

| Source             | Example                    | React story           | Status     | Notes                                                                                     |
| ------------------ | -------------------------- | --------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| Angular            | Playground                 | `Playground`          | ✅ covered | Every prop as a control.                                                                  |
| Angular            | Basic                      | `Basic`               | ✅ covered | Default, negative minimum, step 5, step 0.2, cozy and disabled sliders with their values. |
| Angular            | Ticks, labels and tooltips | `TicksAndLabels`      | ✅ covered |                                                                                           |
| Angular            | Range                      | `Range`               | ✅ covered |                                                                                           |
| Angular            | Vertical                   | `Vertical`            | ✅ covered |                                                                                           |
| Angular            | Form                       | `Form`                | ✅ covered | `value`/`onValueChange`, touched from `onBlur`, dirty; `name` for the form.               |
| Angular            | Open: Editable tooltip     | `OpenEditableTooltip` | ✅ covered | `play` focuses the first handle, so axe checks the tooltip inputs.                        |
| fundamental-styles | Standard                   | `Standard`            | ✅ covered | Half-page width, value 50, as fundamental-styles; hover and focus by the visual cases.    |
| fundamental-styles | Range                      | `Standard`            | ✅ covered | 40 to 80.                                                                                 |
| fundamental-styles | Mobile                     | `Standard`            | ✅ covered | `cozy`.                                                                                   |
| fundamental-styles | Ticks, Ticks and labels    | `Ticks`               | ✅ covered | A tick every 10, value 50.                                                                |
| fundamental-styles | Vertical Slider            | `Vertical`            | ✅ covered |                                                                                           |

### Tests vs. sources

| Source  | Behaviour                                              | React test                                                                                          | Status     |
| ------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ---------- |
| Angular | ARIA slider with value, limits, name, position         | exposes the value as an ARIA slider                                                                 | ✅ covered |
| Angular | Arrows by step, Shift by jump, Home, End               | moves by step with the arrows, by jump with Shift …; steps Shift+arrows and Page Up/Down by jump    | ✅ covered |
| Angular | Track press and handle drag                            | sets the value from a press on the track and a drag of the handle                                   | ✅ covered |
| Angular | Range handles separately and together                  | moves the handles of a range separately and together                                                | ✅ covered |
| Angular | Custom values                                          | works with custom values; works with a range of custom values                                       | ✅ covered |
| Angular | Disabled form control                                  | is disabled                                                                                         | ✅ covered |
| Angular | Cozy handles are larger                                | cozy makes the handles larger                                                                       | ✅ covered |
| Angular | Vertical: orientation, from the bottom, Up/Down, press | vertical slider is aria-orientation vertical, fills from the bottom and steps with Up/Down          | ✅ covered |
| Angular | Range drag moves both, stops at the end                | dragging the range between the handles moves both                                                   | ✅ covered |
| Angular | Pointer beyond the ends clamps                         | a pointer beyond either end clamps to min or max                                                    | ✅ covered |
| Angular | Steps of 0.2 without floating point noise              | steps of 0.2 produce values without floating point noise                                            | ✅ covered |
| Angular | Ticks per step, labels every n                         | shows a tick per step and a label every tickmarksBetweenLabels ticks                                | ✅ covered |
| Angular | Range handles cross, value sorted                      | range handles can cross and the value stays sorted                                                  | ✅ covered |
| Angular | Read-only tooltip on hover and focus                   | readonly tooltip shows the value on hover and focus                                                 | ✅ covered |
| Angular | Editable tooltip on Enter                              | editable tooltip sets the value on Enter and blur                                                   | ✅ covered |
| Angular | RTL mirrors position and keys                          | RTL mirrors the handle position and arrow keys (DirectionProvider); RTL follows the dir attribute … | ✅ covered |
| —       | Live announcement of ranges                            | announces range changes in a polite live region                                                     | ✅ covered |
| —       | Ticks collapse below 8px                               | collapses ticks closer than 8px to the two ends                                                     | ✅ covered |
| —       | Tooltip input names in a range                         | names the tooltip inputs of a range by their position                                               | ✅ covered |
| —       | Uncontrolled, form submission, Base UI `Field` touched | works uncontrolled, submits its value and reports touched in a Base UI Field                        | ✅ covered |
| —       | Native props, `className`, `ref`                       | passes className, native props and the ref to the root                                              | ✅ covered |
| —       | Value changes from the parent, snapped to the domain   | follows value changes from the parent                                                               | ✅ covered |

### Visual comparison

`pnpm visual slider`: 19 cases × 16 combinations, 292/304 matching; the other 12 are the two kept differences below
(the RTL range slider and anti-aliasing of the HC tick labels in RTL). Cases, by pixels and computed style against
fundamental-styles' stories at their width and values (our `Standard` and `Ticks` stories): the slider, its handle at
rest, hovered and focused, the track and the progress (Standard); the range slider, its handle at rest and hovered (by
computed style), its progress and the focused range between the handles (computed style and outline) (Range); the
cozy slider and handle (Mobile); the ticks and the slider with ticks (Ticks); the inner box with ticks and labels and
the labels (Ticks and labels); the vertical handle, and the vertical track by computed style (Vertical Slider).

| Difference                                                                                     | Cause                                                                                                                         | Resolution                                                                                      |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Track and progress `box-shadow` with four transparent layers (HC), none instead of a 0px inset | Angular's `hc:shadow-[…]` utilities add Tailwind's ring layers; fundamental-styles has an inset track shadow of 0 (1px in HC) | Fixed: `[box-shadow:…]` with fundamental-styles' values. Computed styles only.                  |
| Tick labels: 14px text colour on the labels box                                                | Angular puts the small size and label colour on the box; fundamental-styles on each label                                     | Fixed: on each label; horizontal labels are centred by a zero-width box, as fundamental-styles. |
| `cursor: pointer` on the track, the progress and the ticks, `grab` on the range                | They take presses and drags (Angular, Base UI's control); fundamental-styles' static markup has no behaviour                  | Kept (ignored): pointer feedback on interactive parts.                                          |
| Slider with labels 16px taller (52px)                                                          | `pb-8` (Angular) keeps the labels inside the slider; fundamental-styles' labels overflow onto the content below               | Kept: compared by the inner box instead.                                                        |
| RTL range slider: the range sits at 20–60% from the left instead of 40–80%                     | fundamental-styles' Range story positions its handles and range with physical `left` styles, which do not mirror              | Kept: ours mirrors (40–80% from the right), as its single slider and Angular.                   |
| Range handles 7–11% of pixels                                                                  | fundamental-styles' Range story puts the handles 0.75px off the pixel grid (its headings), so they anti-alias differently     | Kept: compared by computed style, which matches.                                                |
| HC tick labels in RTL: 3.4% of pixels                                                          | Sub-pixel anti-aliasing of white text on black; the label texts and positions are the same                                    | Kept: not visible.                                                                              |

Angular issues: the track and progress HC shadows use the `shadow-…` utility with Tailwind's transparent ring layers
(computed styles only).

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Standard, Ticks, Range, Vertical and Open: Editable
tooltip.
