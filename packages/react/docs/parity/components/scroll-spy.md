## scroll-spy

Sources: Angular [`registry/ui/scroll-spy`](../../../../angular/registry/ui/scroll-spy/) (itself from
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

### Stories vs. sources

| Source  | Example             | React story          | Status     | Notes                                                                                                                               |
| ------- | ------------------- | -------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Angular | Table of contents   | `TableOfContents`    | ✅ covered | Its args are the props as controls. `play` clicks "Usage" and waits for it to become the current entry (`aria-current="location"`). |
| Angular | Detection threshold | `DetectionThreshold` | ✅ covered | `targetPercent: 0.5`.                                                                                                               |
| Angular | Offset              | `Offset`             | ✅ covered | `targetOffset: 100`, `fireEmpty`.                                                                                                   |
| —       | With the hook       | `Hook`               | ✅ new     | `useScrollSpy` on an `<article>`, tracking its `h2` headings with `fireEmpty`; `play` scrolls to "Details" and back.                |

Story differences from Angular: the section titles are `Title` (`level={3} headerSize={5}`, so `--sapTextColor` as
fundamental-styles' titles, where Angular's story used `--sapTitleColor` classes); the content is a labelled
`role="region"` (Angular: a focusable `div` with only `aria-label`) with the SAP focus outline; section ids come from
`useId` instead of a module counter.

### Tests vs. sources

| Source  | Behaviour                                           | React test                                                                              | Status     |
| ------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| Angular | Emits once on render                                | reports once on render with the tracked child at the top                                | ✅ covered |
| Angular | Nearest section while scrolling, no repeat, back up | reports the section nearest the top while scrolling                                     | ✅ covered |
| Angular | trackedTags filters                                 | trackedTags filters the children                                                        | ✅ covered |
| Angular | Case-insensitive, several tags                      | matches tag names case-insensitively and tracks several tags                            | ✅ covered |
| Angular | targetOffset                                        | targetOffset moves the reach line                                                       | ✅ covered |
| Angular | targetPercent                                       | targetPercent counts part of the container height as reached                            | ✅ covered |
| Angular | fireEmpty                                           | fireEmpty reports undefined when no tracked child is reached yet                        | ✅ covered |
| Angular | Without fireEmpty keeps the last one                | without fireEmpty, scrolling back above all tracked children keeps the last one         | ✅ covered |
| Angular | scrollSpyDisabled                                   | disabled stops the reports                                                              | ✅ covered |
| Angular | Re-emits on resize                                  | reports the current child again when the container is resized                           | ✅ covered |
| —       | Default `trackedTags`                               | tracks nothing without trackedTags                                                      | ✅ new     |
| —       | Prop changes (`rerender`) without remounting        | takes option and callback changes without remounting                                    | ✅ new     |
| —       | Native props, className, ref, `render`              | passes native props, className and the ref to a div, and render renders another element | ✅ new     |
| —       | Cleanup                                             | stops listening when unmounted                                                          | ✅ new     |
| —       | The hook on an element of your own                  | useScrollSpy › spies on an element of your own                                          | ✅ new     |

### Visual comparison

The scroll spy renders nothing of its own and fundamental-styles has no story for it, so there is nothing of it to
compare. `pnpm visual scroll-spy` keeps 4 cases × 16 combinations, 64/64 matching, on the table of contents of the
Detection threshold story (the first story's `play` leaves a link focused), styles only (the texts are the section
names): the current entry against fundamental-styles' emphasized link, another entry at rest and hovered against its
regular link, and a section title (`h3` in header size 5) against its `h5` title. They check that the demo is built
from Link and Title as fundamental-styles draws them.

| Difference                                                            | Cause                                                                   | Resolution                                                  |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| Current entry: focus colours instead of the emphasized link (Horizon) | First run used the Table of contents story, whose `play` focuses a link | Fixed in the cases: they use the Detection threshold story. |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Table of contents (after its `play`), Detection threshold
and With the hook. Density changes nothing (no sized controls).
