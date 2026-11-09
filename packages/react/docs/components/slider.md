## slider

Sources: Angular [`registry/ui/slider`](../../../angular/registry/ui/slider/) (itself from `@fundamental-ngx/core`'s
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                      | Cause                                                                                                                     | Resolution                                                                    |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `cursor: pointer` on the track, the progress and the ticks, `grab` on the range | They take presses and drags (Angular, Base UI's control); fundamental-styles' static markup has no behaviour              | Kept (ignored): pointer feedback on interactive parts.                        |
| Slider with labels 16px taller (52px)                                           | `pb-8` (Angular) keeps the labels inside the slider; fundamental-styles' labels overflow onto the content below           | Kept: compared by the inner box instead.                                      |
| RTL range slider: the range sits at 20–60% from the left instead of 40–80%      | fundamental-styles' Range story positions its handles and range with physical `left` styles, which do not mirror          | Kept: ours mirrors (40–80% from the right), as its single slider and Angular. |
| Range handles 7–11% of pixels                                                   | fundamental-styles' Range story puts the handles 0.75px off the pixel grid (its headings), so they anti-alias differently | Kept: compared by computed style, which matches.                              |
| HC tick labels in RTL: 3.4% of pixels                                           | Sub-pixel anti-aliasing of white text on black; the label texts and positions are the same                                | Kept: not visible.                                                            |
