## scrollbar

Sources: Angular [`registry/ui/scrollbar`](../../../angular/registry/ui/scrollbar/) (itself from
`@fundamental-ngx/core`'s `fd-scrollbar`) · no fundamental-react source · fundamental-styles
[Scrollbar](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-scrollbar--docs).
Registry: `registry/ui/scrollbar/`: the `Scrollbar` component, on Base UI's `useRender`, with the `scrollbar-sap`
utility of the theme (`fundamental.css`, already there: the SAP scrollbar colours and the WebKit thumb inset).

API, as Angular's directive:

| Angular                                     | React                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| `fdScrollbar` on an element                 | `<Scrollbar>` (a `<div>`; `render` renders another element)                      |
| `noHorizontalScroll`                        | `noHorizontalScroll` (`overflow-x: hidden`)                                      |
| `noVerticalScroll`                          | `noVerticalScroll` (`overflow-y: hidden`)                                        |
| `alwaysVisible`                             | `alwaysVisible` (`overflow: scroll`; a `no…Scroll` still wins)                   |
| `scroll(options)`                           | the ref is the element: `ref.current.scroll(options)`                            |
| `elementRef`, `exportAs: 'fdScrollbar'`     | `ref`                                                                            |
| `hostDirectives: [CdkScrollable]`           | none needed: Base UI's positioner follows every scrolling ancestor of its anchor |
| host classes `scrollbar-sap`, focus-visible | the same classes                                                                 |

**Differences on purpose:**

- The overflow is set with Tailwind classes (`overflow-x-auto`, …) instead of Angular's `[style.overflow-x]` binding,
  so a `className` such as `overflow-hidden` overrides it (tailwind-merge drops the default); Angular's inline style
  would win over any class.
- No CDK scrollable registration: React has no scroll dispatcher, and Base UI's popovers, menus and selects
  (floating-ui `autoUpdate`) already reposition when any ancestor scrolls. The spec checks that a popover opened
  inside a scrollbar follows its scrolling.
- The scrollbar sets fundamental-styles' `.fd-scrollbar` typography (`--sapFontFamily`, `--sapFontSize`, line height
  `normal`, `--sapTextColor`, `font-weight: 400`) and `box-sizing: border-box`; Angular sets none, so its content
  takes the page font (Angular's stories put `text-sap-text-color` on each paragraph instead). fundamental-styles'
  `forced-color-adjust: none` is left out, as in layout-grid: it is inherited and would switch Windows high contrast
  off for everything inside.
- Keyboard focus shows the SAP focus outline inside the box (`focus-visible:outline-sap -outline-offset-2`), as
  Angular; fundamental-styles removes the outline on `:focus` (and raises `z-index` to 5), which leaves a focusable
  scroll region without a visible focus. Mouse focus shows no outline in both.

### Visual differences from fundamental-styles, kept on purpose

| Difference                 | Cause                                              | Resolution                                                      |
| -------------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| Focus outline (not a case) | fundamental-styles removes the outline on `:focus` | Kept: a focusable scroll region needs a visible keyboard focus. |
