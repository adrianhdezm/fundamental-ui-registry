## icon

Sources: fundamental-react [Icon](https://github.com/SAP/fundamental-react/tree/main/src/Icon) · Angular
[`registry/ui/icon`](../../../../angular/registry/ui/icon/) · fundamental-styles
[SAP icons](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-icons-sap-icons--docs)
Registry: `registry/ui/icon/`.

API: `glyph`, `font`, `size`, `color`, `background` as in Angular; `aria-label` and `aria-hidden` are the native props
(fundamental-react's `ariaLabel`/`ariaHidden`). fundamental-react's sizes `s`, `m`, `l`, `xl` are `sm`, `md`, `lg`,
`xl`.

### Stories vs. sources

| Source            | Example            | React story          | Status     | Notes                                                        |
| ----------------- | ------------------ | -------------------- | ---------- | ------------------------------------------------------------ |
| fundamental-react | primary            | `Playground`         | ✅ covered |                                                              |
| fundamental-react | sizes              | `Sizes`              | ✅ covered | Same `cart` glyph.                                           |
| fundamental-react | iconList           | `SapIcons`           | ✅ covered | With a search field.                                         |
| fundamental-react | noStyles           | —                    | ➖ n/a     | `cssNamespace` does not exist: there are no CSS class names. |
| Angular           | Playground         | `Playground`         | ✅ covered |                                                              |
| Angular           | Sizes              | `Sizes`              | ✅ covered |                                                              |
| Angular           | Colors             | `Colors`             | ✅ covered | `da` glyph, as fundamental-styles' Colors story.             |
| Angular           | Accessible icon    | `Accessible`         | ✅ covered |                                                              |
| Angular           | Mirroring in RTL   | `RTL`                | ✅ covered |                                                              |
| Angular           | All SAP-icons      | `SapIcons`           | ✅ covered |                                                              |
| Angular           | All SAP-icons-TNT  | `TntIcons`           | ✅ covered |                                                              |
| Angular           | All Business Suite | `BusinessSuiteIcons` | ✅ covered |                                                              |

### Tests vs. sources

| Source            | Behaviour                                      | React test                                                                                     | Status     |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Glyphs of the three fonts; unknown glyphs      | resolves glyph names of SAP-icons, TNT and Business Suite fonts; unknown glyph renders nothing | ✅ covered |
| Angular           | RTL mirroring                                  | mirrored glyphs flip in RTL                                                                    | ✅ covered |
| Angular           | Decorative by default, label makes it an image | decorative icons are aria-hidden; aria-label makes them role img                               | ✅ covered |
| Angular           | Size, colour and background                    | size, color and background variants                                                            | ✅ covered |
| fundamental-react | click on icon                                  | passes className, native attributes, event handlers and the ref through                        | ✅ covered |
| fundamental-react | passes aria-label / aria-hidden                | decorative icons are aria-hidden; aria-label makes them role img                               | ✅ covered |
| fundamental-react | prop spreading, forwards the ref               | passes className, native attributes, event handlers and the ref through                        | ✅ covered |

### Visual comparison

`pnpm visual icon`: 6 cases (sizes `md` and `xxl`, a narrow glyph, colours default, negative and information) × 16
combinations, 96/96 matching after the fixes below.

| Difference                                                       | Cause                                                              | Resolution                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| Icon box 3px taller than fundamental-styles (35px vs 32px at md) | `tailwind-merge` dropped `leading-none` before the font-size class | Fixed: `leading-none` follows the size class.   |
| Narrow glyphs (e.g. `slim-arrow-down`) narrower than 1em (10px)  | The box was as wide as the glyph                                   | Fixed: `w-[1em]`, as fundamental-styles' icons. |
