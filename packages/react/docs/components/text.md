## text

Sources: fundamental-react: none · Angular [`registry/ui/text`](../../../angular/registry/ui/text/) ·
fundamental-styles [Text](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-text--docs)
Registry: `registry/ui/text/`, on Base UI's `useRender`; the toggle is the registry's `Link`.

API: the Angular inputs as props: `maxLines`, `whitespaces`, `hyphenation` (`none`, `manual`, `auto`), `expandable`,
`subline`, `moreLabel` and `lessLabel`. Angular's `text` input is `children`, and its two-way `isCollapsed` model is
`collapsed` (controlled), `defaultCollapsed` (uncontrolled, `true` by default) and `onCollapsedChange`. Angular's
`<fd-text>` host wraps a `<p>`; here the root is the `<p>` itself (`render` renders another element), so native
props, `className` (on the paragraph in Angular too) and `ref` reach it.

Behaviour as Angular: the text sits in a span clamped to `maxLines` lines (0 or less: no limit). An expandable text
whose content is longer than `maxLines` shows a capitalized More/Less toggle after it, with `aria-expanded`; Enter,
Space and a click toggle it. The overflow is measured after every render and on resize (`ResizeObserver`), so the
toggle appears and disappears with the text and the width. `whitespaces` keeps line breaks and spaces
(`white-space: pre-wrap`); `subline` is the smaller, label-coloured text of two lines at most.

**Differences from Angular, on purpose:**

- The toggle is a native `<button>` rendered by `Link` (`render={<button type="button" />}`), so Enter and Space
  come from the browser; Angular uses an `<a fdLink role="button" tabindex="0">` with keydown handlers. Same role,
  name, `aria-expanded` and link look.
- The overflow is measured with the text clamped for a moment when it is expanded, so a text that starts expanded
  shows its Less toggle, and one whose text changes while expanded is measured again (both Angular issues).
- Selected text takes `--sapSelectedColor` behind the contrast text colour, as fundamental-styles (an Angular issue).
- `hyphenation` sets a `hyphens-*` class instead of an inline style; the root adds fundamental-styles' `font-normal`,
  `box-border`, `border-0` and `forced-color-adjust-none`.
