## carousel

Sources: fundamental-react: none · Angular [`registry/ui/carousel`](../../../../angular/registry/ui/carousel/) ·
fundamental-styles [Carousel](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-carousel--docs)
Registry: `registry/ui/carousel/`, React and the DOM only: Base UI has no carousel primitive. The sliding and swiping
engine (CSS transforms, pointer events) is ported from Angular; the buttons are our `Button`, a loading slide our
`BusyIndicator`. The stories use the registry's `Card`, `MessagePage`, `Button` and `Title`.

API: Angular's components, composed the same way:

```tsx
<Carousel width="31.25rem" aria-label="Products" onSlideChange={(e) => setShown(e.activeItems)}>
  <CarouselItem value={a}>
    <img src="a.png" alt="A" />
  </CarouselItem>
  <CarouselItem value={b} loading={loadingB}>
    <img src="b.png" alt="B" />
  </CarouselItem>
</Carousel>
```

- **`Carousel`** (`fd-carousel`): the inputs as props with Angular's defaults (`pageIndicatorsOrientation` bottom,
  `height`, `width` 100%, `loop`, `navigation` true, `navigatorInPageIndicator` true, `numericIndicator`,
  `pageIndicatorContainer` true, `pageIndicator` true, `slideTransitionDuration` 150, `swipeEnabled` true, `vertical`,
  `noPaginationContainerBorder`, `contentBackground` translucent, `pageIndicatorBackground` solid, `visibleSlidesCount`
  1 or `auto`, and the labels `previousLabel`, `nextLabel`, `ofLabel`, `readerLabel`, `pageIndicatorLabel`).
  `slideChange` is `onSlideChange` with Angular's `{ activeItems, slideDirection }`, where an item is
  `{ id, index, value, element }` (`CarouselSlide`) instead of the item component. Angular's public `previous()`,
  `next()` and `focus()` are on `actionsRef` (`CarouselActions`), as the time's. `ariaLabel`, `ariaLabelledBy` and
  `ariaDescribedBy` are the native `aria-label`, `aria-labelledby` and `aria-describedby`, and go to the listbox, as
  Angular's; other native props, `id` (default `fd-carousel-…`), `className`, `style` and `ref` go to the root.
- **`CarouselItem`** (`fd-carousel-item`): `loading`, `initialWidth`, `initialHeight`, `value`; `id` (default
  `fd-carousel-item-…`), `aria-label`, `aria-labelledby`, `aria-describedby`, `title`, other native props,
  `className` and `ref` go to the option.
- **`CarouselEngine`** (the engine behind Angular's `fdCarousel` directive): exported as a plain class with
  `CarouselConfig`, `CarouselItemRef`, `PanEndOutput` and `DEFAULT_TRANSITION_DURATION`. The `fdCarousel` and
  `fdCarouselItem` directives themselves are n/a in React: an element and its items are handed to the engine.

Behaviour and ARIA, as Angular: the slides are a `listbox` with `aria-roledescription="Carousel"`, one tab stop
(`tabindex="0"`) with `aria-activedescendant` on the first shown slide; each slide is an `option` with `aria-setsize`,
`aria-posinset`, `aria-selected` and `aria-hidden` (shown or not), and `aria-busy` while loading. Without slides (e.g.
only a message page) there is no listbox. The buttons are icon buttons with `aria-label` and `title`, disabled at the
ends unless `loop`; the dots are `role="img"` with "Item 2 of 5 displayed"; more than eight slides (or
`numericIndicator`) show "2 of 9"; a polite live region announces "Displaying item 2 of 5". Left and Right (and Up and
Down when vertical) move between the slides, mirrored in RTL, and keep the focus on the carousel; a click on the
slides focuses it; the focus frame goes around the whole carousel. `loop` wraps around with the next slide sliding in
beside the current one; `visibleSlidesCount` shows several slides per page (in `auto`, as many as fit, and the slides
area shrinks to them); a new count re-pages the slides and reports them (`None`); new slides go back to the first.
Dragging with the mouse or a finger moves the slides and snaps to the closest one past half a slide. The buttons over
the slides (`navigatorInPageIndicator={false}`) show on hover. Angular has no automatic sliding, so there is no
pause on hover or focus to port.

**Differences from Angular, on purpose:**

- `prefers-reduced-motion`: the slides move without a transition (the duration is 0 and the track has
  `motion-reduce:transition-none`).
- In loop mode the engine reorders the slides with the CSS `order` of the items (the track is a flex row, or column
  when vertical) where Angular moves the elements in the DOM: React keeps the DOM, and the DOM order (the focus and
  reading order) stays the slides' order. `CarouselEngine` therefore needs a flex container.
- After a resize, or a new `visibleSlidesCount`, the shown slide is moved back into place (the slides' width changed).
  Angular does that only for `auto`: a fixed-count carousel keeps the old offset and shows another slide than the one
  selected.
- The live region is empty without slides (Angular announces "Displaying item 1 of 0").
- A loading slide's busy indicator has no `tabindex` (Angular's `[tabindex]="null"`); our `BusyIndicator` takes no
  `null`, so the carousel passes it through a cast.

### Stories vs. sources

| Source            | Example                        | React story      | Status     | Notes                                                                                                            |
| ----------------- | ------------------------------ | ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Angular           | Basic                          | `Basic`          | ✅ covered | Five slides and ten (numeric indicator); `play` moves with the keys and checks the announcement.                 |
| Angular           | Navigation, vertical and loop  | `Navigation`     | ✅ covered | Buttons over the slides with indicators on top, vertical, looped, without buttons, without indicators.           |
| Angular           | Several slides at once         | `MultipleSlides` | ✅ covered | Two cards at a time with the last direction; `auto` with add and remove.                                         |
| Angular           | Backgrounds                    | `Backgrounds`    | ✅ covered | The five content and indicator background variants.                                                              |
| Angular           | Loading and error              | `States`         | ✅ covered | A loading slide with a toggle; a message page in a carousel.                                                     |
| fundamental-react | —                              | —                | ➖ n/a     | No Carousel in fundamental-react.                                                                                |
| —                 | —                              | `Playground`     | ➕ added   | The props as controls.                                                                                           |
| —                 | fundamental-styles' Bottom/Top | `PageIndicators` | ➕ added   | The visual reference: seven slides with the fifth shown (`actionsRef`), vertical, content buttons, numeric, top. |

### Tests vs. sources

| Source  | Behaviour                                               | React test                                                                                    | Status     |
| ------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------- |
| Angular | Listbox of options with page indicators                 | is a listbox of slides with page indicators                                                   | ✅ covered |
| Angular | Buttons, stops at the ends                              | moves with the buttons and stops at the ends                                                  | ✅ covered |
| Angular | Arrow keys                                              | moves with the arrow keys                                                                     | ✅ covered |
| Angular | Vertical Up and Down                                    | moves a vertical carousel with Up and Down                                                    | ✅ covered |
| Angular | Loop                                                    | wraps around with loop                                                                        | ✅ covered |
| Angular | Several slides at once                                  | shows several slides at once                                                                  | ✅ covered |
| Angular | Numeric indicator over eight slides                     | shows a numeric indicator for more than eight slides                                          | ✅ covered |
| Angular | Dragging                                                | slides by dragging                                                                            | ✅ covered |
| Angular | New slides go back to the first                         | goes back to the first slide when the slides change (`rerender`)                              | ✅ covered |
| Angular | Background and border tokens                            | contentBackground, pageIndicatorBackground and noPaginationContainerBorder apply their tokens | ✅ covered |
| Angular | Vertical glyphs                                         | a vertical carousel shows up and down navigation icons                                        | ✅ covered |
| Angular | A new visibleSlidesCount re-pages                       | changing visibleSlidesCount re-pages the slides (also: the offset follows the new width)      | ✅ covered |
| Angular | aria-activedescendant, aria-hidden, visibility          | aria-activedescendant and aria-hidden follow the active slide after navigating                | ✅ covered |
| Angular | Snap back before half a slide                           | releasing a drag before half a slide snaps back                                               | ✅ covered |
| Angular | Vertical dragging                                       | dragging a vertical carousel moves to the next slide                                          | ✅ covered |
| Angular | Directive: infinite keeps the active item in the middle | CarouselEngine: keeps the active item in the middle when infinite (CSS order, DOM untouched)  | ✅ covered |
| —       | RTL keys                                                | mirrors Left and Right in RTL                                                                 | ➕ extra   |
| —       | Loop places the previous slide beside the current one   | shows the next slide beside the current one when looping                                      | ➕ extra   |
| —       | numericIndicator, pageIndicator, pageIndicatorContainer | numericIndicator, pageIndicator and pageIndicatorContainer                                    | ➕ extra   |
| —       | Buttons over the slides, indicators on top              | puts the buttons over the slides and the indicators on top                                    | ➕ extra   |
| —       | navigation false                                        | navigation={false} hides the buttons; the keys still move                                     | ➕ extra   |
| —       | swipeEnabled false                                      | swipeEnabled={false} ignores dragging                                                         | ➕ extra   |
| —       | Resize keeps the slide in place (the Angular issue)     | keeps the shown slide in place when the carousel is resized                                   | ➕ extra   |
| —       | Transition duration and prefers-reduced-motion          | slides with the transition duration, and without one for prefers-reduced-motion               | ➕ extra   |
| —       | Click focuses the carousel                              | a click on the slides focuses the carousel; the buttons keep the focus                        | ➕ extra   |
| —       | Loading slide                                           | a loading slide shows a busy indicator                                                        | ➕ extra   |
| —       | Content without slides                                  | other content without slides is no listbox                                                    | ➕ extra   |
| —       | Public methods                                          | actionsRef moves and focuses the carousel                                                     | ➕ extra   |
| —       | Prop spreading, ref (registry convention)               | passes native props and the ref to the root, and the labels to the listbox                    | ➕ extra   |

The drags dispatch pointer events, as the Angular spec; the Angular host's signals are props changed with `rerender`.

### Visual comparison

`pnpm visual carousel`: 22 cases × 16 combinations, **352/352** matching. Our Page indicators story (seven
slides with the fifth shown, as fundamental-styles) against fundamental-styles' Bottom page indicator and Top page
indicator stories, by computed style and pixels: the bars with the buttons and dots (bottom, vertical, buttons in the
content, numeric "1 of 4", top, top numeric), the dots box, a dot and the active dot (with their margins), the previous
and next buttons at rest, on hover and focused. By computed style only: the numbers (ours the text, theirs its box),
the vertical bar (fundamental-styles' vertical example has an `<ol>` of `<li>` dots with the list's margins, 8px
higher; the height is not compared), the slides area (their images do not load: no height), and Angular's Backgrounds
story against their Background modifiers story for the transparent and solid content and the transparent,
translucent and borderless bars (three slides of 25rem against seven of 20rem: no width or height). The content
buttons only show on hover of the carousel, so they are reviewed by eye. Combinations fundamental-styles renders all.

Fixed while comparing:

| Difference                                                       | Cause                                                                                    | Resolution                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Dots and buttons: `border-radius` 3.4e7px → 50% (styles only)    | Angular's `rounded-full`; fundamental-styles uses 50% (the same circle)                  | Fixed: `rounded-[50%]` (and on the focus frame).                |
| Dots and buttons: `min-height` 0 → their size (styles only)      | fundamental-styles sets the minimum height to the size                                   | Fixed: `min-h-1`, `min-h-2` (HC `min-h-2`), `min-h-[2.125rem]`. |
| Compact buttons: 7px side padding → 0 (styles only, same pixels) | `p-0` does not override the button's `compact:px-…` (another variant for tailwind-merge) | Fixed: `compact:p-0`. Angular issue (the same classes).         |
| Vertical bar 8px lower                                           | fundamental-styles' `<ol>` markup in that one example                                    | Kept: their other bars match; compared without the height.      |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Page indicators, Navigation (hovered for the buttons over the
slides, horizontal and vertical), Several slides at once, Backgrounds, Loading and error. In RTL the slides run from
the right, the first dot is on the right, the previous button sits at the start with its arrow mirrored, and Left moves
to the next slide. A vertical slide whose image is lower than the slides area sits at its top (the busy indicator
wrapper is a block as high as the slide), as in Angular.

Angular issues found: a fixed-count carousel keeps its pixel offset after a resize or a new `visibleSlidesCount`, so
it shows another slide than the selected one (only `auto` is moved back); the live region announces "Displaying item 1
of 0" without slides; the compact navigation buttons keep the button's 7px side padding (`p-0` against
`compact:px-…`, computed styles only); `rounded-full` and the missing minimum heights of the dots and buttons
(computed styles only).
