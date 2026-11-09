## object-number

Sources: fundamental-react: none · Angular [`registry/ui/object-number`](../../../angular/registry/ui/object-number/) ·
fundamental-styles [Object Number](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-object-number--docs)
Registry: `registry/ui/object-number/`, on Base UI's `useRender`, and Base UI's `Button` when interactive.

API: the Angular inputs as props: `number`, `decimal` (default 0), `unit`, `emphasized`, `large`, `status`,
`statusMessage`, `emphasizedText`, `interactive` and `inverted`; Angular's `ariaLabel` and `ariaLabelledBy` are the
native `aria-label` and `aria-labelledby`. Angular's `LOCALE_ID` is the `locale` prop (the runtime locale by default,
as step-input). Renders a `<span>`; `render` renders another element. Native props, `className` and `ref` pass
through.

Behaviour as Angular: the number is formatted with `Intl.NumberFormat` with exactly `decimal` decimal places
(Angular's `formatNumber` with `1.d-d`), in a `<bdi dir="ltr">` followed by a no-break space, and the unit in its own
`<bdi>`, so the minus stays in front of the digits and the unit goes to the left in RTL. The status colours the
number (or the badge, when inverted); a hidden text announces the value state ("Value State Error", …; `statusMessage`
overrides it) and "Emphasized" for emphasized numbers. `emphasized` is bold except when `large`. Both parts truncate
with an ellipsis in a narrow container.

**Differences from Angular, on purpose:**

- An interactive number is Base UI's `Button` (`nativeButton={false}` unless `render` is a `<button>`, detected from
  `render`; the `nativeButton` prop overrides it), as object-status: `role="button"`, `tabindex="0"`, Enter activates
  on keydown and Space on keyup with the page scroll prevented, as a native button. Angular activates Space on keydown.
- `locale` replaces the injected `LOCALE_ID`.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                                                              | Cause                                                                                                                                                          | Resolution                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| RTL: negative numbers read "-2,000.00" here and "2,000.00-" in fundamental-styles (the 7 cases with -2,000.00, 8 RTL combinations each) | fundamental-styles has no bidi isolation, so the minus is laid out at the end of the number in RTL; ours (as Angular) isolates the number in `<bdi dir="ltr">` | Kept: numbers are left-to-right in RTL layouts, and a trailing minus reads as a different number. |
