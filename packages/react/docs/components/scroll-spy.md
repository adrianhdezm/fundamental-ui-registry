## scroll-spy

Sources: Angular [`registry/ui/scroll-spy`](../../../angular/registry/ui/scroll-spy/) (itself from
`@fundamental-ngx/core`'s `fdScrollSpy` directive) · no fundamental-react source · no fundamental-styles story (the
scroll spy has no visuals of its own).
Registry: `registry/ui/scroll-spy/`: the `useScrollSpy` hook and the `ScrollSpy` component, on Base UI's `useRender`.
The tabs will build on it (Angular's `fd-tabs` puts the directive on its stacked content).

API, as Angular's directive:

| Angular                       | React                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `fdScrollSpy` on an element   | `<ScrollSpy>` (a `<div>`; `render` renders another element), or `useScrollSpy()`'s ref   |
| `trackedTags` (default `[]`)  | `trackedTags` (default `[]`, any case)                                                   |
| `fireEmpty`                   | `fireEmpty`                                                                              |
| `targetPercent`               | `targetPercent`                                                                          |
| `targetOffset`                | `targetOffset`                                                                           |
| `scrollSpyDisabled`           | `disabled`                                                                               |
| `(spyChange)`                 | `onSpyChange(element \| undefined)`                                                      |
| `(scroll)` host listener      | a passive `scroll` listener on the element                                               |
| `ResizeObserver` after render | a `ResizeObserver` from the ref callback (its first callback is the report after layout) |

The algorithm is Angular's line for line: the direct children with a tracked tag whose distance from the first child
(plus `targetOffset`) is within `scrollTop + offsetHeight × targetPercent`; the last such child is reported when it
changes, `undefined` only with `fireEmpty`, and the current child again on every resize.

**Differences on purpose:**

- `scrollSpyDisabled` is `disabled`: Angular prefixes it because a directive shares its host's inputs; a component
  has props of its own.
- `useScrollSpy(options)` returns a stable ref callback (React 19 ref cleanup removes the listener and the observer).
  The options are kept in a ref and read on every scroll, so changing them (or passing a new `onSpyChange` each
  render) neither re-subscribes nor resets the current child; Angular reads its signals the same way.
- `ScrollSpy` merges its ref with a `ref` prop and passes every other prop through; it has no classes of its own.
