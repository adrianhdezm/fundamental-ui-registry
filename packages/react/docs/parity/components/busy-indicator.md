## busy-indicator

Sources: fundamental-react [BusyIndicator](https://github.com/SAP/fundamental-react/tree/main/src/BusyIndicator) ·
Angular [`registry/ui/busy-indicator`](../../../../angular/registry/ui/busy-indicator/) · fundamental-styles
[Busy Indicator](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-busy-indicator--docs)
Registry: `registry/ui/busy-indicator/`, on Base UI's `useRender`.

API: the Angular inputs as props (`loading`, `size`, `block`, `contrast`, `label`, `preventWheelEvents`) and
`BusyIndicatorExtended`. `aria-label`, `aria-labelledby`, `aria-valuetext`, `aria-live`, `title` and `tabIndex` are the
native props and apply only while loading, as Angular's. fundamental-react's `show` is `loading`; its
`localizedText.loading` is `aria-label`.

**Difference from Angular, on purpose:** without `aria-label` or `aria-labelledby` the progressbar is named "Loading"
(fundamental-react's default), so it always has an accessible name; Angular leaves it unnamed.

### Stories vs. sources

| Source            | Example               | React story        | Status     | Notes                                                                                                                               |
| ----------------- | --------------------- | ------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| fundamental-react | primary               | `Basic`            | ✅ covered |                                                                                                                                     |
| fundamental-react | sizes                 | `Sizes`            | ✅ covered |                                                                                                                                     |
| fundamental-react | dev                   | `Playground`       | ✅ covered |                                                                                                                                     |
| fundamental-react | noStyles              | —                  | ➖ n/a     | No `cssNamespace`.                                                                                                                  |
| Angular           | Playground            | `Playground`       | ✅ covered |                                                                                                                                     |
| Angular           | Basic                 | `Basic`            | ✅ covered |                                                                                                                                     |
| Angular           | Sizes                 | `Sizes`            | ✅ covered |                                                                                                                                     |
| Angular           | Contrast              | `Contrast`         | ✅ covered | Size `l`, as fundamental-styles' Contrast Mode story.                                                                               |
| Angular           | As a wrapper          | `Wrapper`          | ✅ covered | Plain token-styled fields until the input is ported.                                                                                |
| Angular           | With label (extended) | `Extended`         | ✅ covered |                                                                                                                                     |
| Angular           | With message toast    | `WithMessageToast` | ✅ covered | An extended contrast indicator in a message toast opened from a render function (Angular's template), duration 0, until "Hide all". |
| Angular           | Open: message toast   | `OpenMessageToast` | ✅ covered | `play` opens the toast and waits for its progressbar, so axe checks it.                                                             |

### Tests vs. sources

| Source            | Behaviour                                    | React test                                                                                             | Status     |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| Angular           | ARIA while loading, none when idle           | loading shows the dots with role progressbar, aria-busy and the label; idle renders no ARIA attributes | ✅ covered |
| Angular           | Label under the dots                         | shows the label under the dots                                                                         | ✅ covered |
| Angular           | Block mode: overlay, inert content, keyboard | block mode overlays the content and makes it inert while loading                                       | ✅ covered |
| Angular           | Sizes and contrast                           | size s, m, l and the contrast variant                                                                  | ✅ covered |
| Angular           | Reduced motion                               | respects prefers-reduced-motion                                                                        | ✅ covered |
| Angular           | aria-live, preventWheelEvents                | aria-live announces the label; preventWheelEvents blocks scrolling of the covered content              | ✅ covered |
| Angular           | Inline block, custom aria-valuetext          | is inline-block by default and uses a custom aria-valuetext while loading                              | ✅ covered |
| Angular           | aria-live assertive and off                  | sets aria-live assertive and off                                                                       | ✅ covered |
| Angular           | Wheel listener removed                       | stops blocking wheel events when preventWheelEvents turns off and removes the listener on unmount      | ✅ covered |
| fundamental-react | Prop spreading, ref                          | passes className, native props and the ref through                                                     | ✅ covered |

### Visual comparison

`pnpm visual busy-indicator`: 8 cases × 16 combinations, 128/128 matching after the fix below. Cases: the first and
last dot of each size (pixels, size, colour and spacing), the contrast dot, and the extended label (styles). The dots
are compared one by one because the wrappers differ (ours is a block, fundamental-styles' an inline block); the
visual script turns animations off on both sides.

| Difference                                                                                                    | Cause                                                                                                                               | Resolution                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dots `#0064d9` (Horizon) and `#4db1ff` (Horizon Dark) instead of fundamental-styles' `#0070f2` in both themes | We used `--sapContent_BusyColor`; fundamental-styles uses its own `--fdBusy_Indicator_Dot_Color` (`#0070f2`, the busy colour in HC) | Fixed: `--fdBusy_Indicator_Dot_Color` in `extensions.css`, as the other fundamental-styles theme values. The Fiori guidelines were not checked against it. |
