## busy-indicator

Sources: fundamental-react [BusyIndicator](https://github.com/SAP/fundamental-react/tree/main/src/BusyIndicator) ·
Angular [`registry/ui/busy-indicator`](../../../angular/registry/ui/busy-indicator/) · fundamental-styles
[Busy Indicator](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-busy-indicator--docs)
Registry: `registry/ui/busy-indicator/`, on Base UI's `useRender`.

API: the Angular inputs as props (`loading`, `size`, `block`, `contrast`, `label`, `preventWheelEvents`) and
`BusyIndicatorExtended`. `aria-label`, `aria-labelledby`, `aria-valuetext`, `aria-live`, `title` and `tabIndex` are the
native props and apply only while loading, as Angular's. fundamental-react's `show` is `loading`; its
`localizedText.loading` is `aria-label`.

**Difference from Angular, on purpose:** without `aria-label` or `aria-labelledby` the progressbar is named "Loading"
(fundamental-react's default), so it always has an accessible name; Angular leaves it unnamed.
