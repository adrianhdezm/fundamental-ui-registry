## rating-indicator

Sources: Angular [`registry/ui/rating-indicator`](../../../angular/registry/ui/rating-indicator/) (itself from
`@fundamental-ngx/core`'s `fd-rating-indicator`) · no fundamental-react source · fundamental-styles
[Rating Indicator](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-rating-indicator--docs).
Registry: `registry/ui/rating-indicator/`: the `RatingIndicator` component, with our [icon](icon.md) for the stars,
[link](link.md) for the number of votes and [popover](popover.md) for the votes per rating. Base UI has no rating
primitive: the slider behaviour is Angular's, written in React.

API, as Angular's inputs:

| Angular                                                         | React                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `value` model, `ControlValueAccessor`, `ratingChanged` output   | `value`/`defaultValue`/`onValueChange(value)` (one callback for both)      |
| `indicatorCapacity`, `allowHalves`, `size`                      | the same                                                                   |
| `displayMode`, `nonInteractive`, `disabled`, `setDisabledState` | the same                                                                   |
| `ratings`, `ratingAverage`, `totalRatings`, `displayAllRatings` | the same                                                                   |
| `showDynamicText`, `dynamicTextIndicator`, `totalRatingsLabel`  | the same                                                                   |
| `ratedIcon`, `unratedIcon`                                      | the same (SAP icon names)                                                  |
| `ariaLabel`, `ariaLabelledBy`, `ariaRoledescription`            | `aria-label`, `aria-labelledby`, `aria-roledescription`, put on the slider |
| `class`, host element                                           | `className` and other native props on the root `<div>`; `ref` to the root  |
| `onTouched` (blur of the slider)                                | the root's `onBlur`                                                        |

ARIA and keyboard as Angular (and fundamental-styles' markup): a focusable `role="slider"` with
`aria-roledescription` "Rating Indicator", `aria-valuemin` 0, `aria-valuemax` the capacity, `aria-valuenow` the
rounded rating, `aria-valuetext` "2 of 5", `aria-readonly` in display mode and non-interactive, `aria-disabled` and
`tabindex="-1"` when disabled; the icons are `aria-hidden`. Left/Down and Right/Up change the rating by one (a half
with `allowHalves`), mirrored in RTL; Home and End go to 0 and the capacity; a digit sets it (capped). A click on a
star rates it, on its first half (the right half in RTL) a half with `allowHalves`, and focuses the slider. The same
rating again is no change. Values round to whole stars (or halves: above .25 a half, above .5 the next star). With
`ratings` the average and the number of votes show; with `displayAllRatings` the number is a link that opens a
popover (hover and focus) named by `totalRatingsLabel` listing the votes per rating.

**Differences, on purpose:**

- The direction of the keys and the half clicks is the CSS direction of the element (as the other ported components)
  instead of Angular's `Directionality`.
- The votes popover is our `Popover` with the link as its `PopoverTrigger` (`role="button"`, `aria-haspopup="dialog"`, `aria-expanded`), and
  opens on hover and focus of the link itself instead of Angular's wrapping `fd-popover-control` span.
- `leading-none` after the icon font size (tailwind-merge drops a line height before a font size), and square corners
  in the HC themes (fundamental-styles); see the Angular issues below.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                      | Cause                                                                | Resolution                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Icon halves: `box-shadow` none instead of a 2px (HC 1px) shadow | fundamental-styles' icons carry a text shadow colour as a box shadow | Kept (ignored): the half's `clip-path` clips it away; not visible. |
