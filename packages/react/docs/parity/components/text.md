## text

Sources: fundamental-react: none · Angular [`registry/ui/text`](../../../../angular/registry/ui/text/) ·
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

### Stories vs. sources

| Source             | Example         | React story   | Status     | Notes                                                                                        |
| ------------------ | --------------- | ------------- | ---------- | -------------------------------------------------------------------------------------------- |
| Angular            | Basic           | `Basic`       | ✅ covered | fundamental-styles' long text.                                                               |
| Angular            | Max lines       | `MaxLines`    | ✅ covered | fundamental-styles' text, full width as theirs.                                              |
| Angular            | Expandable      | `Expandable`  | ✅ covered | Collapsed, expanded by default (fundamental-styles' "Show Less"), controlled, custom labels. |
| Angular            | Whitespaces     | `Whitespaces` | ✅ covered | fundamental-styles' indented text, with and without preservation.                            |
| Angular            | Hyphenation     | `Hyphenation` | ✅ covered | fundamental-styles' pair (300px, soft hyphens) first, then Angular's none, manual and auto.  |
| —                  | (subline input) | `Subline`     | ➕ added   | Angular has the input but no story.                                                          |
| —                  | (all inputs)    | `Playground`  | ➕ added   |                                                                                              |
| fundamental-styles | AI highlight    | —             | ➖ n/a     | `fd-text__ai-highlight` is not part of the Angular component.                                |

### Tests vs. sources

| Source  | Behaviour                                        | React test                                                                   | Status     |
| ------- | ------------------------------------------------ | ---------------------------------------------------------------------------- | ---------- |
| Angular | maxLines clamps                                  | maxLines clamps the text                                                     | ✅ covered |
| Angular | More/Less, aria-expanded, Enter and Space, model | expandable shows More/Less and toggles the collapsed state (uncontrolled)    | ✅ covered |
| Angular | The parent sets the state                        | collapsed is controlled by the parent                                        | ✅ covered |
| Angular | No toggle when the text fits                     | shows no toggle when the text fits in maxLines                               | ✅ covered |
| Angular | Whitespace and hyphenation                       | whitespace preserve and hyphenation                                          | ✅ covered |
| Angular | Subline                                          | subline variant                                                              | ✅ covered |
| Angular | maxLines 0 or negative                           | maxLines 0 or negative does not clamp and shows no toggle                    | ✅ covered |
| Angular | Custom labels                                    | custom moreLabel and lessLabel replace the toggle text                       | ✅ covered |
| —       | Starting expanded (Angular issue)                | an expandable text that starts expanded shows the Less toggle                | ✅ covered |
| —       | Selection colours (Angular issue)                | selected text takes the selection colours                                    | ✅ covered |
| —       | Prop spreading, ref (registry convention)        | passes className, native props and the ref through; render swaps the element | ✅ covered |

### Visual comparison

`pnpm visual text`: 13 cases × 16 combinations, **208/208**. Cases, by pixels with fundamental-styles' texts: the
basic text; the text with preserved whitespace; the text without a line limit and clamped to 2 and 3 lines; the
expanded text and its Less toggle; the More toggle at rest, on hover and with focus; the texts without and with
hyphenation (300px, soft hyphens); and by style only the collapsed text, which fundamental-styles cuts by hand
(`…ultricies...`) where ours is clamped. Reviewed by eye in Horizon cozy and compact, LTR and RTL (`Basic`,
`MaxLines`, `Expandable`, `Whitespaces`, `Hyphenation`, `Subline`): no density dependence; in RTL the toggle starts
on the right and the ellipsis ends the clamped text on the left.

| Difference                                                                                     | Cause                                                                                                              | Resolution                                                                           |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Selected text invisible in Horizon (white on `#fff`) and Horizon Dark (`#1d232a` on `#1d232a`) | Angular's selection background is `--sapContent_Selected_Background`; fundamental-styles uses `--sapSelectedColor` | Fixed: `selection:bg-sap-selected-color`. Angular issue. Not captured by the script. |
