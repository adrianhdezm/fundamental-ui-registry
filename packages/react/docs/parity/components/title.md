## title

Sources: fundamental-react [Title](https://github.com/SAP/fundamental-react/tree/main/src/Title) · Angular
[`registry/ui/title`](../../../../angular/registry/ui/title/) · fundamental-styles
[Title](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-title--docs)
Registry: `registry/ui/title/`, on Base UI's `useRender`.

API: `level` (1–6) renders `<h1>`…`<h6>`, as fundamental-react's `level`; `headerSize` changes only the visual size
(Angular's input, fundamental-react's `levelStyle`); `wrap` and `twoLineClamp` as in Angular. `render` renders another
element (Angular's `[fdTitle]` on any element): a heading follows its own level, other elements use size 5.
`TitleSizeContext` replaces Angular's `FD_DEFAULT_TITLE_SIZE` token.

### Stories vs. sources

| Source            | Example                    | React story   | Status     | Notes                    |
| ----------------- | -------------------------- | ------------- | ---------- | ------------------------ |
| fundamental-react | semanticLevels             | `Semantic`    | ✅ covered |                          |
| fundamental-react | styledLevels               | `Visual`      | ✅ covered |                          |
| fundamental-react | truncated                  | `Elision`     | ✅ covered | All six levels at 300px. |
| fundamental-react | wrapped                    | `Wrapping`    | ✅ covered | All six levels at 300px. |
| fundamental-react | noStyles                   | —             | ➖ n/a     | No `cssNamespace`.       |
| Angular           | Semantic levels            | `Semantic`    | ✅ covered |                          |
| Angular           | Visual levels              | `Visual`      | ✅ covered |                          |
| Angular           | Truncation                 | `Elision`     | ✅ covered |                          |
| Angular           | Wrapping                   | `Wrapping`    | ✅ covered | With `twoLineClamp`.     |
| Angular           | Default size via injection | `DefaultSize` | ✅ covered | `TitleSizeContext`.      |

### Tests vs. sources

| Source            | Behaviour                                        | React test                                                            | Status     |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------------------- | ---------- |
| Angular           | Semantic heading, size follows the level         | stays a semantic heading and follows the heading level by default     | ✅ covered |
| Angular           | SAP header typography                            | uses the SAP header typography                                        | ✅ covered |
| Angular           | headerSize overrides the size                    | headerSize overrides the visual size independent of the heading level | ✅ covered |
| Angular           | Default size from a provider                     | TitleSizeContext sets the size for titles without headerSize          | ✅ covered |
| Angular           | Truncation, wrap, two-line clamp                 | truncates … / wrap shows … / twoLineClamp clamps …                    | ✅ covered |
| Angular           | User class, elementRef                           | merges a user class and passes props and the ref through              | ✅ covered |
| fundamental-react | Prop spreading, tag name, level style, wrap, ref | the tests above                                                       | ✅ covered |

### Visual comparison

`pnpm visual title`: 8 cases × 16 combinations, 128/128 matching. Cases: `h1`–`h6` against fundamental-styles'
Levels story and two re-sized headings against its Visual Level story. Titles are blocks as wide as their container
and the texts differ, so the computed typography and box height are compared, not pixels. No differences.

`leading-[normal]` comes after the size class in the class list, so `tailwind-merge` keeps it (the Angular title has
it before; the inherited line height is the same there, so nothing shows).
