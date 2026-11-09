## carousel

Sources: fundamental-react: none · Angular [`registry/ui/carousel`](../../../angular/registry/ui/carousel/) ·
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

### Visual differences from fundamental-styles, kept on purpose

| Difference             | Cause                                                 | Resolution                                                 |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| Vertical bar 8px lower | fundamental-styles' `<ol>` markup in that one example | Kept: their other bars match; compared without the height. |
