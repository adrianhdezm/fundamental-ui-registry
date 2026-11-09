## infinite-scroll

Sources: Angular [`registry/ui/infinite-scroll`](../../../angular/registry/ui/infinite-scroll/) (itself from
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                       | Cause                                                                     | Resolution                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `overflow-x` (not compared)      | fundamental-styles' `overflow: scroll` also draws an empty horizontal bar | Kept `auto`: the titles truncate, so a horizontal scrollbar would never have anything to scroll.        |
| Scrollbar colours (not compared) | fundamental-styles' example has no `fd-scrollbar`, so browser colours     | Kept: the stories use `scrollbar-sap`, the SAP scrollbar colours, as every other scroll container here. |
