## link

Sources: fundamental-react [Link](https://github.com/SAP/fundamental-react/tree/main/src/Link) · Angular
[`registry/ui/link`](../../../../angular/registry/ui/link/) · fundamental-styles
[Link](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-link--docs)
Registry: `registry/ui/link/`, on Base UI's `useRender`.

API: the Angular inputs as props (`emphasized`, `disabled`, `inverted`, `subtle`, `undecorated`, `touchTarget`,
`emphasizedLabel`, `subtleLabel`); fundamental-react's `disabled` and `subtle` are the same. Renders an `<a>`;
`render` renders another element, e.g. a router link or a `<button>` for an in-page action (Angular's `[fdLink]` on
any element). Icons are `Icon` children before or after the text.

### Stories vs. sources

| Source            | Example          | React story       | Status     | Notes              |
| ----------------- | ---------------- | ----------------- | ---------- | ------------------ |
| fundamental-react | primary          | `Standard`        | ✅ covered |                    |
| fundamental-react | disabled         | `States`          | ✅ covered |                    |
| fundamental-react | subtle           | `VisualModifiers` | ✅ covered |                    |
| fundamental-react | noStyles         | —                 | ➖ n/a     | No `cssNamespace`. |
| Angular           | Playground       | `Playground`      | ✅ covered |                    |
| Angular           | Standard         | `Standard`        | ✅ covered |                    |
| Angular           | Visual modifiers | `VisualModifiers` | ✅ covered |                    |
| Angular           | Inverted         | `Inverted`        | ✅ covered |                    |
| Angular           | States           | `States`          | ✅ covered |                    |
| Angular           | Icon support     | `Icons`           | ✅ covered |                    |

### Tests vs. sources

| Source            | Behaviour                                                   | React test                                                                                         | Status     |
| ----------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Emphasized, subtle, inverted, disabled; disabled navigation | emphasized, subtle, inverted and disabled styles; disabled link is aria-disabled and not navigable | ✅ covered |
| Angular           | Focus and activation                                        | is focusable and activates like a native link when enabled                                         | ✅ covered |
| Angular           | tabindex of links without href                              | keeps the tabindex of links without href, unless disabled                                          | ✅ covered |
| Angular           | Underline on hover/focus, undecorated, touch target         | underlines on hover and focus only; undecorated never; touchTarget enlarges the hit area           | ✅ covered |
| Angular           | Combined modifiers                                          | combines modifiers: subtle undecorated and emphasized inverted                                     | ✅ covered |
| Angular           | Screen reader hints                                         | emphasized and subtle links announce emphasizedLabel / subtleLabel                                 | ✅ covered |
| fundamental-react | Prop spreading, ref                                         | passes className, native props and the ref through; render swaps the element                       | ✅ covered |

### Visual comparison

`pnpm visual link`: 7 cases × 16 combinations, 112/112 matching after the fix below. Cases: emphasized and subtle
links (pixels), and the regular link, its text at rest and on hover, the disabled and the inverted link (styles: the
texts or backgrounds differ).

| Difference                                                                                               | Cause                                                     | Resolution                            |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| Underline 2px higher than fundamental-styles' (subtle links, and every link in the high-contrast themes) | No `text-underline-offset` (fundamental-styles: 0.125rem) | Fixed: `underline-offset-[0.125rem]`. |
