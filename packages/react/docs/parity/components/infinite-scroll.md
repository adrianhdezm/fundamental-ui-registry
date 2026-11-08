## infinite-scroll

Sources: Angular [`registry/ui/infinite-scroll`](../../../../angular/registry/ui/infinite-scroll/) (itself from
`@fundamental-ngx/core`'s `fdInfiniteScroll` directive) · no fundamental-react source · fundamental-styles has no
component for it, only the list's
[Infinite scroll](https://sap.github.io/fundamental-styles/?path=/story/sap-design-components-list-standard--scroll)
example (`fd-list__infinite-scroll`: a scrolling list).
Registry: `registry/ui/infinite-scroll/`: the `useInfiniteScroll` hook, the `InfiniteScroll` component on Base UI's
`useRender`, and `shouldTriggerAction`. The list's Infinite scroll story uses the hook.

API, as Angular's directive:

| Angular                                 | React                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `fdInfiniteScroll` on an element        | `<InfiniteScroll>` (a `<div>`; `render={<List />}` renders another element), or the hook's ref |
| `scrollPercent` (default 75)            | `scrollPercent` (default 75)                                                                   |
| `scrollOffset`                          | `scrollOffset`                                                                                 |
| `(onScrollAction)`                      | `onScrollAction()`                                                                             |
| `fromEvent(scroll)`, `debounceTime(50)` | a passive `scroll` listener and a 50ms timeout, restarted by every scroll event                |
| `shouldTriggerAction()`                 | `shouldTriggerAction(element, { scrollPercent, scrollOffset })`                                |
| `takeUntilDestroyed`                    | the ref callback's cleanup (React 19), which also cancels a pending check                      |

The check is Angular's line for line: with a `scrollOffset` (other than 0), `scrollTop + offsetHeight` past
`scrollHeight - scrollOffset`; otherwise `(scrollTop + offsetHeight) / scrollHeight` past `scrollPercent / 100`. It
runs 50ms after the last scroll event of a burst, and calls again on every later burst that ends past the line (the
caller guards against loading twice, as Angular's stories do).

**Differences on purpose:**

- A component and a hook instead of a directive: `useInfiniteScroll(options)` returns a stable ref callback for any
  element (e.g. `<List ref={ref}>`), and `InfiniteScroll` wraps it with `render` for a ready element. The options are
  kept in a ref and read on every check, so changing them, or passing a new `onScrollAction` each render, neither
  re-subscribes nor drops a pending check; Angular reads its signals the same way.
- `shouldTriggerAction` is a function of the element instead of a method of the directive instance, which React has
  no handle on.
- No styles: like Angular's directive, it gives the element no height, overflow or scrollbar; the stories add
  `scrollbar-sap`, a height and the overflow.

### Stories vs. sources

| Source  | Example            | React story        | Status     | Notes                                                                                                                                                     |
| ------- | ------------------ | ------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular | Loading more items | `LoadingMoreItems` | ✅ covered | `render={<List />}` with `scrollOffset={40}`, a busy indicator in a last `noData` item, the item count; `play` scrolls to the end and waits for 30 items. |
| —       | Scroll percent     | `ScrollPercent`    | ✅ new     | The same list without `scrollOffset`, at `scrollPercent={50}`; used by the visual comparison (no `play`).                                                 |
| —       | With the hook      | `Hook`             | ✅ new     | `useInfiniteScroll` on a `List` (`ref`), five more items at 75% under a block busy indicator, as the list's Infinite scroll story.                        |

Story differences from Angular: the items are "List item n" as fundamental-styles' example (Angular: "Item n"); the
list scrolls vertically only (`overflow-y-scroll`, as fundamental-styles' `overflow: scroll` in that direction, and as
the list's Infinite scroll story) instead of `overflow-auto`; the item count is a `role="status"`, so screen readers
hear new items arrive, and uses the SAP font. The args are the props as controls.

### Tests vs. sources

| Source  | Behaviour                                    | React test                                                                              | Status     |
| ------- | -------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| Angular | Emits within scrollPercent of the end        | calls onScrollAction when the scroll position is within scrollPercent of the end        | ✅ covered |
| Angular | Custom scrollPercent                         | follows a custom scrollPercent                                                          | ✅ covered |
| Angular | scrollOffset instead of the percentage       | scrollOffset fires within that many pixels of the end instead of a percentage           | ✅ covered |
| Angular | Debounces a burst into one emission          | debounces a burst of scroll events into one call                                        | ✅ covered |
| Angular | No emission after more content               | does not call again after more content moved the end away                               | ✅ covered |
| Angular | Its own scroll container only                | listens to its own scroll container only                                                | ✅ covered |
| Angular | Stops listening when destroyed               | stops listening when unmounted, also with a check still pending                         | ✅ covered |
| —       | `shouldTriggerAction`, offset 0 falls back   | shouldTriggerAction tells whether the position is far enough                            | ✅ new     |
| —       | Prop changes (`rerender`) without remounting | takes option and callback changes without remounting                                    | ✅ new     |
| —       | Native props, className, ref, `render`       | passes native props, className and the ref to a div, and render renders another element | ✅ new     |
| —       | The hook on an element of your own           | useInfiniteScroll › loads more on an element of your own                                | ✅ new     |

### Visual comparison

The infinite scroll renders nothing of its own, so, as for scroll-spy, the comparison checks the demo: `pnpm visual
infinite-scroll` has 4 cases × 16 combinations, **64/64** matching, on the list of the Scroll percent story (the
Loading more items story's `play` scrolls it) against fundamental-styles' infinite scroll list, styles only (its list
is as wide as the page and 11rem high, ours `max-w-md` and `h-72`, so the item boxes differ in width): the list as
scroll container (plus `overflow-y`, without the sizes), the first item, its title, and a hovered item.

| Difference                       | Cause                                                                     | Resolution                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `overflow-x` (not compared)      | fundamental-styles' `overflow: scroll` also draws an empty horizontal bar | Kept `auto`: the titles truncate, so a horizontal scrollbar would never have anything to scroll.        |
| Scrollbar colours (not compared) | fundamental-styles' example has no `fd-scrollbar`, so browser colours     | Kept: the stories use `scrollbar-sap`, the SAP scrollbar colours, as every other scroll container here. |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL, with scrollbars shown: Loading more items (after its
`play`: 30 items, scrolled), Scroll percent and With the hook.
