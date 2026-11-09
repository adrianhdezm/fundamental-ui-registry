## formatted-text

Sources: fundamental-react: none · Angular [`registry/ui/formatted-text`](../../../angular/registry/ui/formatted-text/) ·
fundamental-styles: none (no formatted text story; its title, text and link are the reference for the typography)
Registry: `registry/ui/formatted-text/`, on Base UI's `useRender`. No new npm dependency: the sanitiser is plain
TypeScript on the browser's `DOMParser`.

API: the Angular inputs as props: `htmlText`, `convertedLinksDefaultTarget` (`_blank` by default; `''`, `_self`,
`_top`, `_parent`, `_search`), `height` and `width` (CSS lengths; each turns on scrolling on its axis). The sanitiser is
exported as `sanitizeFormattedText(html, linkTarget)`, as in Angular. Native props, `className`, `style` (merged with
`height`/`width`), `ref` and `render` go to the root.

Behaviour as Angular, with Angular's allow-list unchanged:

- Kept tags: `a`, `abbr`, `blockquote`, `br`, `cite`, `code`, `dl`, `dt`, `dd`, `em`, `h1`–`h6`, `p`, `pre`,
  `strong`, `span`, `u`, `ul`, `ol`, `li`. Kept attributes: `class`, `style`, `href`, `target`, `download`,
  `hreflang`, `rel`, `type`, `title`; every other attribute (event handlers, `id`, `data-*`, `src`, ...) is removed.
- Removed with their content: `script`, `style`, `template`, `noscript`, `iframe`, `object`, `embed`, `svg`, `math`.
  Any other element (`div`, `img`, `form`, `textarea`, ...) is dropped and its text kept; markup inside a `textarea`
  stays text.
- An `href` with a colon keeps only the `http:`, `https:`, `ftp:` and `mailto:` schemes; `javascript:`, `data:`,
  `vbscript:`, mixed-case and entity- or whitespace-encoded schemes lose the `href` (the parser decodes them first).
- Links: no `href` or an in-page `#` link loses `target`; other links get `convertedLinksDefaultTarget` (when not
  empty); `target="_blank"` adds `rel="noopener"` to the existing `rel`.
- The typography restores what Tailwind's preflight removes, with the SAP fonts and sizes: margins of paragraphs,
  lists, quotes and headings, list markers, header sizes and families, bold, italic, underline, dotted `abbr`,
  monospace `code`/`pre`, link colour with underline on hover.

How it is safe without Angular's `DomSanitizer`: the input is parsed by `DOMParser` into an inert document (scripts do
not run, images do not load), and the allowed nodes are copied one by one into a second inert document
(`document.implementation.createHTMLDocument`). Only that copy is serialised and set with `dangerouslySetInnerHTML`.
The output contains only allow-listed HTML elements and text, so parsing it again gives the same tree (tested).

**Differences from Angular, on purpose:**

- Copies are created in an inert document instead of the page's `document`, and an allowed tag name only counts in
  the HTML namespace (an `a` inside an `svg` goes with the `svg`). Same output for the Angular test inputs.
- Links get the hover colour (`sapLink_Hover_Color`) and the SAP focus outline on keyboard focus, as fundamental-styles'
  link; Angular has the hover underline only and the browser's focus ring.
- Sanitising needs a DOM: on the server the component renders an empty root and fills it in on hydration
  (`useSyncExternalStore`), so the markup never differs between server and client. Angular has no server rendering.
