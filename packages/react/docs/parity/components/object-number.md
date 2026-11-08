## object-number

Sources: fundamental-react: none · Angular [`registry/ui/object-number`](../../../../angular/registry/ui/object-number/) ·
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

### Stories vs. sources

| Source  | Example                                | React story                                                               | Status     | Notes                                                                                                                           |
| ------- | -------------------------------------- | ------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Angular | Playground                             | `Playground`                                                              | ✅ covered |                                                                                                                                 |
| Angular | Status, emphasized, decimals and units | `Status`, `Emphasized`, `Decimals`, `Units`, `Truncation`                 | ✅ covered | Split by section; fundamental-styles' numbers (1,000.00 and 100.00 instead of 1,000.37, 100.88). `Units` adds a `de-DE` number. |
| Angular | Interactive and inverted               | `Interactive`, `InteractiveEmphasized`, `Inverted`, `InvertedInteractive` | ✅ covered | Angular's interactive row alternates emphasized; that is `InteractiveEmphasized`, `Interactive` is fundamental-styles' row.     |
| Angular | Large                                  | `Large`                                                                   | ✅ covered |                                                                                                                                 |

### Tests vs. sources

| Source  | Behaviour                                        | React test                                                                                      | Status     |
| ------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------- |
| Angular | Decimals                                         | formats with the given number of decimals                                                       | ✅ covered |
| Angular | LOCALE_ID                                        | formats with the locale                                                                         | ✅ covered |
| Angular | Unit after the number                            | shows the unit after the number                                                                 | ✅ covered |
| Angular | Emphasized: bold number, announced               | emphasized makes the number bold and announces it                                               | ✅ covered |
| Angular | Large, ignores emphasized                        | large uses a bigger font and ignores emphasized                                                 | ✅ covered |
| Angular | Status colours                                   | status colours the number with the semantic text colour                                         | ✅ covered |
| Angular | Status text, statusMessage                       | status has a hidden text for assistive technology, overridable with statusMessage               | ✅ covered |
| Angular | Inverted badge colours                           | inverted shows a filled badge in the status colours                                             | ✅ covered |
| Angular | ariaLabel                                        | aria-label names the number                                                                     | ✅ covered |
| Angular | Not focusable unless interactive                 | is not focusable or a button unless interactive                                                 | ✅ covered |
| Angular | Interactive: role, tabindex, click, Enter, Space | interactive number is a focusable button that activates with click, Enter and Space             | ✅ covered |
| Angular | Space prevents the page scroll                   | Space on an interactive number is prevented so the page does not scroll, and activates on keyup | ✅ covered |
| Angular | `<bdi>` isolation in RTL                         | number and unit are isolated with &lt;bdi&gt; for RTL                                           | ✅ covered |
| —       | Native `<button>` activates once                 | an interactive &lt;button&gt; number activates once (natively)                                  | ✅ covered |
| —       | Inverted hover colours                           | inverted interactive number changes colours on hover                                            | ✅ covered |
| —       | Focus outline                                    | interactive number shows a focus outline                                                        | ✅ covered |
| —       | Underline of interactive numbers                 | underlines an interactive number, but not on hover or an inverted one                           | ✅ covered |
| —       | Truncation                                       | truncates a number wider than its container with an ellipsis                                    | ✅ covered |
| —       | Prop spreading, ref (registry convention)        | passes className, native props and the ref through; render swaps the element                    | ✅ covered |

### Visual comparison

`pnpm visual object-number`: 25 cases × 16 combinations, 344/400 matching; the 56 left are all one kept difference
(below). Cases, by pixels (numbers as fundamental-styles'): the five statuses, the number text and unit; emphasized
positive and its text; large negative, neutral and the large unit; interactive negative and its text at rest, the
text on hover, interactive neutral with focus; inverted negative, critical, informative, neutral and a text; inverted
interactive positive at rest and on hover, neutral on hover and negative with focus. Reviewed by eye in Horizon cozy
and compact, LTR and RTL (`Status`, `InvertedInteractive`, `Large`, `InteractiveEmphasized`, `Truncation`).

| Difference                                                                                                                              | Cause                                                                                                                                                                 | Resolution                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RTL: negative numbers read "-2,000.00" here and "2,000.00-" in fundamental-styles (the 7 cases with -2,000.00, 8 RTL combinations each) | fundamental-styles has no bidi isolation, so the minus is laid out at the end of the number in RTL; ours (as Angular) isolates the number in `<bdi dir="ltr">`        | Kept: numbers are left-to-right in RTL layouts, and a trailing minus reads as a different number.                                                               |
| Regular and inverted numbers would have a normal line height instead of 1rem (not seen in the comparison: fixed while porting)          | Angular's `leading-4` comes before `text-sap-font-size` (and `text-sap-font-small-size` in inverted), so `tailwind-merge` drops it; the parts inherit the line height | Fixed: the line heights after the font sizes; root, text and unit line heights match. Angular issue (from the classes; checked with the same `tailwind-merge`). |
