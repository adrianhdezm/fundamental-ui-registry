## scrollbar

Sources: Angular [`registry/ui/scrollbar`](../../../../angular/registry/ui/scrollbar/) (itself from
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

### Stories vs. sources

| Source             | Example        | React story     | Status     | Notes                                                                                                          |
| ------------------ | -------------- | --------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| Angular            | Playground     | `Playground`    | ✅ covered | The three props as controls.                                                                                   |
| Angular            | Directions     | `Directions`    | ✅ covered | Both, vertical only and horizontal only; `play` checks the hidden overflows.                                   |
| fundamental-styles | Default        | `Default`       | ✅ covered | A 300 × 100 px box with 9000 × 9000 px content, as fundamental-styles' example; used by the visual comparison. |
| —                  | Always visible | `AlwaysVisible` | ✅ new     | `alwaysVisible` with content that fits, alone and with `noHorizontalScroll`.                                   |

Story differences from Angular: the boxes are labelled `role="region"`s (Angular: a focusable `div` with only
`aria-label`, which axe reports as a prohibited attribute on a generic element); the paragraphs take the text colour
from the scrollbar instead of a class of their own.

### Tests vs. sources

| Source  | Behaviour                                        | React test                                                               | Status     |
| ------- | ------------------------------------------------ | ------------------------------------------------------------------------ | ---------- |
| Angular | SAP scrollbar colours                            | applies the SAP scrollbar colors                                         | ✅ covered |
| Angular | CdkScrollable registered with the dispatcher     | reports its scrolling to scroll listeners, and popovers inside follow it | ✅ covered |
| Angular | Both directions by default, only when needed     | scrolls in both directions by default and only when needed               | ✅ covered |
| Angular | noHorizontalScroll                               | noHorizontalScroll hides the horizontal overflow                         | ✅ covered |
| Angular | noVerticalScroll                                 | noVerticalScroll hides the vertical overflow                             | ✅ covered |
| Angular | alwaysVisible, and a `no…Scroll` still wins      | alwaysVisible shows the scrollbars even when the content fits            | ✅ covered |
| Angular | `scroll()` scrolls the element                   | the ref scrolls the element (Angular scroll())                           | ✅ covered |
| —       | fundamental-styles typography                    | uses the SAP text typography                                             | ✅ new     |
| —       | Focus outline on keyboard focus only             | shows the SAP focus outline on keyboard focus only                       | ✅ new     |
| —       | Native props, className (overflow override), ref | passes native props and className, and render renders another element    | ✅ new     |

### Visual comparison

`pnpm visual scrollbar`: 1 case × 16 combinations, **16/16** matching: the `Default` story's scroll container against
fundamental-styles' `.fd-scrollbar` (same size and content), by computed style plus `scrollbar-color`,
`scrollbar-width`, `overflow-x`/`-y` and `box-sizing`, and by pixels. Headless Chromium hides scrollbars
(`--hide-scrollbars`), so the pixels show only the box; the scrollbars themselves were compared by eye with them
shown. Chromium draws standard scrollbars once `scrollbar-color` is set (the `::-webkit-scrollbar` rules of both apply
only in browsers without it), so ours and fundamental-styles' look the same.

| Difference                                                                | Cause                                                              | Resolution                                                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| Font family, size, line height, weight and colour of the content (styles) | Angular sets no typography; `.fd-scrollbar` sets the SAP text font | Fixed: the SAP text typography on the scrollbar. Angular issue. |
| Focus outline (not a case)                                                | fundamental-styles removes the outline on `:focus`                 | Kept: a focusable scroll region needs a visible keyboard focus. |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL, with scrollbars shown: Default, Directions and Always
visible. The vertical scrollbar moves to the left in RTL and horizontal scrolling starts at the right; density
changes nothing (the scrollbar size is a theme value).
