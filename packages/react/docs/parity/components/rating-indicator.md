## rating-indicator

Sources: Angular [`registry/ui/rating-indicator`](../../../../angular/registry/ui/rating-indicator/) (itself from
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

### Stories vs. sources

| Source             | Example                  | React story            | Status     | Notes                                                                                          |
| ------------------ | ------------------------ | ---------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| Angular            | Playground               | `Playground`           | ✅ covered |                                                                                                |
| Angular            | Default                  | `Default`              | ✅ covered | Whole and half ratings, 7 stars, form (value, touched), disabled, non-interactive, empty.      |
| Angular            | Sizes and display mode   | `Sizes`                | ✅ covered |                                                                                                |
| Angular            | Ratings and custom icons | `Ratings`              | ✅ covered |                                                                                                |
| Angular            | Open: Votes per rating   | `OpenVotes`            | ✅ covered | `play` hovers the votes, so axe checks the popover.                                            |
| fundamental-styles | Sizes                    | `Sizes`                | ✅ covered |                                                                                                |
| fundamental-styles | Half values              | `Sizes`, `CustomIcons` | ✅ covered | "Halves" column; fundamental-styles' custom icon halves in `CustomIcons`.                      |
| fundamental-styles | Custom icons             | `CustomIcons`          | ✅ covered | `message-error` (their `notification`) and `bo-strategy-management`, halves as in Half values. |
| fundamental-styles | Disabled                 | `CustomIcons`          | ✅ covered | Also `Default`'s disabled row.                                                                 |
| fundamental-styles | Display mode             | `Sizes`                | ✅ covered | "Display" column.                                                                              |
| fundamental-styles | Different values         | `CustomIcons`          | ✅ covered | 6 and 7 icons.                                                                                 |

### Tests vs. sources

| Source  | Behaviour                                        | React test                                                                               | Status     |
| ------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------- |
| Angular | Slider with the rating as its value              | is a slider with the rating as its value                                                 | ✅ covered |
| Angular | Keyboard                                         | rates with the keyboard; steps by halves with allowHalves; mirrors Left and Right in RTL | ✅ covered |
| Angular | Half clicks                                      | rates halves by clicking the first half of a star; … from the right in RTL               | ✅ covered |
| Angular | Rounding                                         | rounds values to whole or half stars                                                     | ✅ covered |
| Angular | Average and votes of ratings                     | shows the average and the number of votes of ratings                                     | ✅ covered |
| Angular | Read-only display mode                           | is read-only in display mode, with smaller unrated icons and filled unrated stars        | ✅ covered |
| Angular | Votes popover                                    | lists the votes per rating in a named popover with displayAllRatings; opens … on focus   | ✅ covered |
| Angular | Custom icons                                     | uses custom rated and unrated icons                                                      | ✅ covered |
| Angular | Sizes                                            | sizes the icons with size                                                                | ✅ covered |
| Angular | Capacity, fallback to 5                          | sets the maximum with indicatorCapacity and falls back to 5 for 0                        | ✅ covered |
| Angular | Half values in the value text                    | shows half values in the value text                                                      | ✅ covered |
| Angular | `dynamicTextIndicator`                           | puts dynamicTextIndicator between the rating and the maximum                             | ✅ covered |
| Angular | `ratingChanged` on a click, not for the same one | calls onValueChange on a click (Angular ratingChanged), not for the same rating again    | ✅ covered |
| Angular | Disabled form control                            | is disabled                                                                              | ✅ covered |
| —       | `ratingAverage`, `totalRatings`, hidden text     | shows ratingAverage and totalRatings, and hides the text without a rating                | ✅ covered |
| —       | `aria-labelledby`, `aria-roledescription`        | takes aria-labelledby and aria-roledescription                                           | ✅ covered |
| —       | Uncontrolled, touched                            | works uncontrolled and reports touched through onBlur                                    | ✅ covered |
| —       | Native props, `className`, `ref`                 | passes className, native props and the ref to the root                                   | ✅ covered |

### Visual comparison

`pnpm visual rating-indicator`: 22 cases × 16 combinations, 352/352 matching. Cases, by pixels and computed style
against fundamental-styles' stories: the four sizes, the large one hovered and focused, a star and its rated and
unrated halves, and the dynamic text (Sizes); the four sizes in display mode and a small unrated star (Display mode);
halves at medium size (Half values) and large by computed style; custom icons with halves, medium and large (Half
values' custom icons); 6 and 7 icons (Different values); disabled (Disabled).

| Difference                                                      | Cause                                                                                                              | Resolution                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| HC: the focus outline has round corners (3.3% of pixels in LTR) | Angular's `rounded-[0.5rem]` on the slider in every theme; fundamental-styles' corner radius is 0 in the HC themes | Fixed: `hc:rounded-none`.                                          |
| Custom icons: no rated icons                                    | fundamental-styles' `notification` glyph (U+E0B1) is `message-error` in the current SAP icon font                  | Fixed in the story: `ratedIcon="message-error"`.                   |
| Icon halves: `box-shadow` none instead of a 2px (HC 1px) shadow | fundamental-styles' icons carry a text shadow colour as a box shadow                                               | Kept (ignored): the half's `clip-path` clips it away; not visible. |

Angular issues: in the HC themes the focus outline of the slider has round corners (fundamental-styles: square); the
half icons lose Icon's `leading-none` to tailwind-merge (as the icon issue above, read from the code), fixed here by
`leading-none` after the icon size.

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, Sizes and Ratings.
