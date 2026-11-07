## object-status

Sources: fundamental-react [ObjectStatus](https://github.com/SAP/fundamental-react/tree/main/src/ObjectStatus) ·
Angular [`registry/ui/object-status`](../../../../angular/registry/ui/object-status/) · fundamental-styles
[Object Status](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-object-status--docs)
Registry: `registry/ui/object-status/`, on Base UI's `useRender`, and Base UI's `Button` when clickable.

API: the Angular inputs as props (`status`, `statusMessage`, `label`, `glyph`, `glyphFont`, `glyphAriaLabel`,
`indicationColor`, `secondaryIndication`, `clickable`, `inverted`, `large`, `truncate`). Renders a `<span>`; `render`
renders another element (Angular's `[fdObjectStatus]` on any host). Angular's `textTemplate` is `children`; label and
children can be combined. Renamed so they do not clash with native ARIA props: Angular's `ariaLabel` (the hidden
"Object Status" text) is `objectStatusLabel`, and `ariaRoleDescription` is `roleDescription` (a native
`aria-roledescription` overrides it). fundamental-react's `indication` is `indicationColor` (1–10 instead of 1–8),
`size="l"` is `large`, `link` is `clickable` with `render={<a href="…" />}`, and `ariaLabel` is the native
`aria-label`.

**Differences on purpose:**

- A clickable status is Base UI's `Button` (`nativeButton={false}` unless `render` is a `<button>`, detected from
  `render`; the `nativeButton` prop overrides it): `role="button"`, `tabindex="0"`, Enter activates on keydown and
  Space on keyup with the page scroll prevented, as a native button. Angular activates Space on keydown.
- A clickable status rendered as `<a href>` keeps the native link semantics (no `role="button"` or `tabindex`), as
  fundamental-react's `link`; Angular would make it a role button.
- fundamental-react made a status with `onClick` clickable on its own; here `clickable` is explicit, as in Angular.

### Stories vs. sources

| Source            | Example                          | React story                                                                          | Status     | Notes                                                |
| ----------------- | -------------------------------- | ------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------- |
| fundamental-react | primary                          | `Primary`                                                                            | ✅ covered | Glyphs as fundamental-styles' (error, alert, …).     |
| fundamental-react | icons (Icon Only)                | `IconOnly`                                                                           | ✅ covered | With `glyphAriaLabel`, and one `aria-label` example. |
| fundamental-react | text (Text Only)                 | `TextOnly`                                                                           | ✅ covered |                                                      |
| fundamental-react | iconAndText                      | `IconAndText`                                                                        | ✅ covered |                                                      |
| fundamental-react | indications                      | `IndicationColors`                                                                   | ✅ covered | 1–10.                                                |
| fundamental-react | inverted                         | `Inverted`                                                                           | ✅ covered |                                                      |
| fundamental-react | large                            | `Large`                                                                              | ✅ covered |                                                      |
| fundamental-react | clickable                        | `Clickable`, `InvertedClickable`                                                     | ✅ covered | `link` rows as `render={<a href="#" />}`.            |
| fundamental-react | dev                              | `Playground`                                                                         | ✅ covered | Actions are the Playground controls.                 |
| fundamental-react | noStyles                         | —                                                                                    | ➖ n/a     | No `cssNamespace`.                                   |
| Angular           | Playground                       | `Playground`                                                                         | ✅ covered |                                                      |
| Angular           | Icon, text and indication colors | `IconOnly`, `TextOnly`, `IconAndText`, `IndicationColors`, `Clickable`               | ✅ covered | Split by section, with fundamental-styles' texts.    |
| Angular           | Inverted                         | `Inverted`, `InvertedClickable`, `InvertedIndication`, `InvertedIndicationSecondary` | ✅ covered |                                                      |
| Angular           | Large                            | `Large`                                                                              | ✅ covered |                                                      |
| Angular           | Truncated                        | `Truncated`                                                                          | ✅ covered | fundamental-styles' truncate example.                |

### Tests vs. sources

| Source            | Behaviour                                      | React test                                                                                     | Status     |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Status text and icon colours                   | status colours the text with the semantic text colour and the icon with the element colour     | ✅ covered |
| Angular           | Glyph before label, decorative unless labelled | renders the glyph before the label, decorative unless glyphAriaLabel is set                    | ✅ covered |
| Angular           | Icon-only status                               | icon-only status renders no text                                                               | ✅ covered |
| Angular           | Inverted colours                               | inverted status is a filled badge in the button colours                                        | ✅ covered |
| Angular           | Indication colours 1–10, announced             | indication colours 1–10 replace the status colour and are announced                            | ✅ covered |
| Angular           | Inverted and secondary indication colours      | inverted indication colours, and the secondary set                                             | ✅ covered |
| Angular           | Not focusable unless clickable                 | is neither focusable nor a button unless clickable                                             | ✅ covered |
| Angular           | ariaRoleDescription                            | roleDescription overrides the role description of a clickable status                           | ✅ covered |
| Angular           | Clickable: role, tabindex, click, Enter, Space | clickable status is a focusable role button that activates with click, Enter and Space         | ✅ covered |
| Angular           | Space prevents the page scroll                 | Space on a clickable status is prevented so the page does not scroll, and activates on keyup   | ✅ covered |
| Angular           | Native `<button>` activates once               | a clickable &lt;button&gt; status activates once (natively) with Enter and Space               | ✅ covered |
| Angular           | Filled focus style                             | clickable status shows the filled focus style                                                  | ✅ covered |
| Angular           | Large font and icon                            | large uses a bigger font and icon                                                              | ✅ covered |
| Angular           | Truncation                                     | truncate shortens long text with an ellipsis instead of wrapping                               | ✅ covered |
| Angular           | "Object Status" / ariaLabel / role description | announces "Object Status" (or objectStatusLabel) when not clickable; clickable uses the role … | ✅ covered |
| Angular           | Status messages, statusMessage                 | announces a status message per status, overridable with statusMessage                          | ✅ covered |
| Angular           | Text template                                  | renders children as the text                                                                   | ✅ covered |
| fundamental-react | Prop spreading, ref                            | passes className, native props and the ref through; render swaps the element                   | ✅ covered |
| —                 | Link statuses (fundamental-react `link`)       | a clickable link status keeps the native link semantics                                        | ✅ covered |
| —                 | High-contrast focus                            | in high contrast, a focused clickable status keeps its colour and shows a dotted outline       | ✅ covered |
| —                 | Inverted hover colours                         | inverted clickable status changes colours on hover                                             | ✅ covered |
| —                 | Underline of clickable statuses                | underlines the text of a clickable status, but not on hover or of an inverted one              | ✅ covered |

### Visual comparison

`pnpm visual object-status`: 35 cases × 16 combinations, 560/560 matching after the fixes below. Cases, by pixels
(texts as fundamental-styles'): icon and text (negative, neutral), the icon, text only (positive, informative), icon
only (critical), indication colours 3 and 7; clickable negative at rest, on hover and with focus (the status and its
underlined text), clickable neutral, clickable indication 5 with focus; inverted negative, neutral, informative, icon
only, and icon and text; inverted clickable positive at rest, on hover and with focus, inverted clickable neutral on
hover; inverted indication 4, indication 7 on hover and 10 with focus; secondary indication 6b, and 2b on hover; large
positive, neutral and inverted; the wrapping, truncated and inverted truncated statuses. Reviewed by eye in Horizon
cozy and compact, LTR and RTL (`Clickable`, `Inverted`, `Large`, `Truncated`, `IconAndText`).

| Difference                                                                                                                             | Cause                                                                                                                                              | Resolution                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Icon-only status 24px wide instead of 16px; inverted icon-only 24px instead of 22px; texts narrower than 24px ("Info") centred in 24px | `min-w-6` on every status and again for icon-only ones (overriding the inverted `min-w-[1.375rem]`); fundamental-styles has no minimum width there | Fixed: no minimum width on plain statuses; inverted ones keep 1.375rem (1.75rem large). Angular issue.                                        |
| Large inverted text in 72-Semibold, 6px wider; fundamental-styles uses the regular 72 font                                             | `font-sap-font-semibold-family` in the large inverted classes                                                                                      | Fixed: `font-sap-font-family`. Angular issue.                                                                                                 |
| Focused inverted clickable status: four extra transparent shadow layers (computed styles only, not visible)                            | `shadow-[…]` adds Tailwind's ring layers                                                                                                           | Fixed: `[box-shadow:…]`.                                                                                                                      |
| High contrast: a focused clickable status takes the contrast text colour instead of keeping its status colour                          | Angular builds the `hc:focus:` colour classes at runtime (`hcFocus()`), so Tailwind never generates them                                           | Not in React: the contrast colour is set with `not-hc:focus:` literal classes. Angular issue (found while porting; the HC focus cases match). |
| Root line height dropped (computed styles only: the text spans carry the 1rem line height)                                             | `tailwind-merge` drops `leading-(--os-h)` before `text-(length:--os-font)`                                                                         | Fixed: the line height after the font size. Angular issue.                                                                                    |
