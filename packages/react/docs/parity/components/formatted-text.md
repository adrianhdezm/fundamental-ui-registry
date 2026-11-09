## formatted-text

Sources: fundamental-react: none · Angular [`registry/ui/formatted-text`](../../../../angular/registry/ui/formatted-text/) ·
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

### Stories vs. sources

| Source  | Example                | React story | Status     | Notes                                                                                     |
| ------- | ---------------------- | ----------- | ---------- | ----------------------------------------------------------------------------------------- |
| Angular | Default                | `Default`   | ✅ covered | The same markup, with a script, an image with `onerror` and a `javascript:` link removed. |
| Angular | Fixed height and width | `Sized`     | ✅ covered |                                                                                           |

### Tests vs. sources

| Source  | Behaviour                                                          | React test                                                                                   | Status     |
| ------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------- |
| Angular | Allowed tags and attributes, scripts and handlers removed, empty   | sanitizes htmlText: keeps the allowed tags and attributes, strips scripts and event handlers | ✅ covered |
| Angular | Safe link schemes                                                  | sanitizeFormattedText keeps safe link schemes only (plus encoded and whitespace variants)    | ✅ covered |
| Angular | Link target, `rel="noopener"`, link colour, focus, hover           | links get convertedLinksDefaultTarget and rel noopener, and keep the link focus styles       | ✅ covered |
| Angular | Width and height scroll                                            | width and height constrain the container                                                     | ✅ covered |
| —       | Attribute allow-list, dropped containers, no mutation on reparsing | sanitizeFormattedText keeps the allowed attributes only and removes dangerous content        | ✅ covered |
| —       | Typography                                                         | restores the document typography with the SAP fonts                                          | ✅ covered |
| —       | Server rendering                                                   | renders nothing on the server and the content once hydrated                                  | ✅ covered |
| —       | Prop spreading, ref (registry convention)                          | passes className, native props and the ref through                                           | ✅ covered |

### Visual comparison

fundamental-styles has no formatted text, so `pnpm visual formatted-text` checks the typography of the sanitised markup
of our `Default` story against fundamental-styles' title, text and link: 4 cases × 16 combinations, **64/64** after the
fix below, styles only (the texts differ). Cases: the `h3` against the `h3` title, the first paragraph against the
text, an external link at rest and hovered against the link. The line height is not compared: ours is the SAP content
line height for multi-line rich text (as Angular), the single-line references have `normal`. Reviewed by eye in
Horizon cozy and compact, LTR and RTL (`Default`, `Sized`): density changes nothing; lists, quotes and definitions
indent on the start side.

| Difference                                  | Cause                                                                                  | Resolution                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Link underline offset `auto` instead of 2px | Angular sets no offset; fundamental-styles' link has `text-underline-offset: 0.125rem` | Fixed: `[&_a]:underline-offset-[0.125rem]`. Angular issue (hover only).              |
| Link hover colour and focus ring            | Angular keeps the link colour on hover and the browser's focus ring                    | Fixed: `sapLink_Hover_Color` and the SAP focus outline, as fundamental-styles' link. |

**Angular issues** (not fixed there): no underline offset, hover colour or SAP focus outline on links (see the table).
