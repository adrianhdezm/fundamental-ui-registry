## bar

Sources: fundamental-react [Bar](https://github.com/SAP/fundamental-react/tree/main/src/Bar) · Angular
[`registry/ui/bar`](../../../../angular/registry/ui/bar/) · fundamental-styles
[Bar](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-bar--docs)
Registry: `registry/ui/bar/`, on Base UI's `useRender` (root) and the `button` component (`ButtonBar`).

API: the Angular parts as components: `Bar` (`barDesign`: `header`, `subheader`, `header-with-subheader`, `footer`,
`floating-footer`; `inPage`, `inHomePage` and `size` `s`, `m_l`, `xl` for page paddings and floating footer offsets;
`clear`; `initialSuggestionTitle`, `initialSuggestionSubline`; `role`, `toolbar` by default and removed with `null`),
`BarLeft`, `BarMiddle`, `BarRight` (`stackContentsVertically`), `BarElement` (`fullWidth`) and `ButtonBar`. Native
props, a `className` and the `ref` go to each part's element; `Bar` takes `render` to render another element (e.g.
`<header />` or `<footer />`). The bar sets its paddings, height, background, shadow and element typography through
CSS variables (`--bar-px`, `--bar-h`, `--bar-bg`, `--bar-shadow`, `--bar-tc`, ...), as in Angular, so a `className`
such as `[--bar-bg:var(--sapShellColor)]` restyles it (see the Custom shellbar story).

`ButtonBar` is a bar element with a `Button`, `transparent` by default: its props (`label`, `glyph`, `glyphFont`,
`glyphPosition`, `variant`, `disabled`, `type`, `title`, `aria-label`, ...) and `ref` go to the button, `fullWidth`
stretches the element and the button, and `elementProps` go to the element. Angular's `fdMenu` is the button's `menu`,
`ariaLabel` is `aria-label`. The id defaults to `fd-button-bar-<useId>`, as Angular's `fd-button-bar-<n>`. A disabled
`ButtonBar` element has `pointer-events: none`, as Angular.

fundamental-react's props map to the parts: `leftComponents`, `middleComponents` and `rightComponents` are the
children of `BarLeft`, `BarMiddle` and `BarRight` (each item in a `BarElement`), `type` is `barDesign` (`default` is
no design), `cozy` is `data-density="cozy"` on the bar or an ancestor, and the `header`/`footer` tags it picked by
type are `render={<header />}` or `render={<footer />}`.

**Differences, on purpose:**

- The areas render in source order. Angular projects them in the order left, middle, right whatever their order in
  the template; in React the app writes them in that order.
- The bar is a `toolbar` without arrow key navigation, as Angular and fundamental-styles: bars hold fields, links and
  groups as well as buttons, so each control keeps its Tab stop. Base UI's Toolbar is not used for that reason.
- `size` takes `s`, `m_l` or `xl`, or nothing for the default paddings (Angular's `''`).
- `ButtonBar`'s native props go to the button instead of the host element, since the button is what an app labels,
  focuses and listens to; the element takes `elementProps`.
- The bar and its elements set `font-weight: normal`, `line-height: normal` and `forced-color-adjust: none`, as
  fundamental-styles; Angular inherits them.
- The shadow is `[box-shadow:var(--bar-shadow)]`, not Angular's `shadow-(--bar-shadow)`, which prepends Tailwind's
  transparent ring and inset layers.

### Stories vs. sources

| Source            | Example                      | React story           | Status     | Notes                                                                                                              |
| ----------------- | ---------------------------- | --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| fundamental-react | primary                      | `Default`             | ✅ covered | First bar; as fundamental-styles' Default.                                                                         |
| fundamental-react | cozy                         | `Density`             | ✅ covered | Cozy and compact bars.                                                                                             |
| fundamental-react | header                       | `Header`              | ✅ covered |                                                                                                                    |
| fundamental-react | subheader                    | `Subheader`           | ✅ covered | With compact buttons, and a subheader with a full width field.                                                     |
| fundamental-react | headerWithSubheader          | `HeaderWithSubheader` | ✅ covered |                                                                                                                    |
| fundamental-react | footer                       | `Footer`              | ✅ covered | Compact buttons, as fundamental-react and fundamental-styles.                                                      |
| fundamental-react | floatingFooter               | `FloatingFooter`      | ✅ covered |                                                                                                                    |
| Angular           | Playground                   | `Playground`          | ✅ covered | Design, page, home page, size and clear args.                                                                      |
| Angular           | Designs                      | `Designs`             | ✅ covered | Default, title, header, header with subheader, footer.                                                             |
| Angular           | Floating footer              | `FloatingFooter`      | ✅ covered | Plus a floating footer in a home page, size xl (fundamental-styles').                                              |
| Angular           | In page, responsive paddings | `PageSizes`           | ✅ covered | Plus the home page size `s`.                                                                                       |
| Angular           | Custom shellbar              | `CustomShellbar`      | ✅ covered | A compact search `Combobox` (`isSearch`), as Angular; a plain bar, not a `Shellbar` (see [shellbar](shellbar.md)). |

The middle group of buttons of fundamental-react's and fundamental-styles' examples is a `role="group"` of
`Button`s until segmented-button is ported.

### Tests vs. sources

| Source            | Behaviour                                                    | React test                                                                         | Status     |
| ----------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------- |
| Angular           | Toolbar with left, middle, right areas in order              | is a toolbar with left, middle and right areas in order                            | ✅ covered |
| Angular           | Role can be overridden or removed                            | role toolbar can be overridden or removed                                          | ✅ covered |
| Angular           | Default background, shadow and height                        | defaults to the page header background and shadow                                  | ✅ covered |
| Angular           | `clear` removes the shadow                                   | clear removes the shadow                                                           | ✅ covered |
| Angular           | Header text colour and font                                  | header uses the page header text color and the header font                         | ✅ covered |
| Angular           | Header before a subheader drops its shadow; subheader height | a header followed by a subheader drops its shadow; the subheader is taller         | ✅ covered |
| Angular           | Footer background, border, no shadow                         | footer uses the page footer background with a top border and no shadow             | ✅ covered |
| Angular           | Floating footer position and shadow                          | floating footer floats above the bottom of its container with a shadow             | ✅ covered |
| Angular           | `inPage` paddings                                            | inPage paddings follow size s, m_l and xl                                          | ✅ covered |
| Angular           | `inHomePage` paddings                                        | inHomePage paddings follow every size and the default                              | ✅ covered |
| Angular           | `fullWidth` element                                          | fullWidth makes a bar element fill its area                                        | ✅ covered |
| Angular           | Initial suggestion paddings                                  | initialSuggestionTitle and initialSuggestionSubline let the bar grow with their... | ✅ covered |
| Angular           | Floating footer offset in a page                             | a floating footer in a page is offset by the page size                             | ✅ covered |
| Angular           | Middle centred                                               | middle stays centred between equal side areas                                      | ✅ covered |
| Angular           | Titles truncate before buttons                               | areas truncate titles before buttons                                               | ✅ covered |
| Angular           | Button bar: transparent, label, glyph, title, id, aria-label | ButtonBar renders a transparent button with label and glyph                        | ✅ covered |
| Angular           | Button bar compact                                           | ButtonBar is compact in compact density                                            | ✅ covered |
| Angular           | Compact bar height                                           | compact density makes the bar shorter                                              | ✅ covered |
| Angular           | Button bar clicks, disabled inert                            | ButtonBar clicks reach the handler; a disabled one is inert                        | ✅ covered |
| fundamental-react | Renders left, middle and right contents                      | renders the left, middle and right contents                                        | ✅ covered |
| fundamental-react | Prop spreading                                               | passes className, native props and the ref to every part                           | ✅ covered |
| —                 | Areas in RTL                                                 | puts the left area at the end in RTL                                               | ✅ covered |
| —                 | `stackContentsVertically`                                    | stackContentsVertically stacks the elements of an area                             | ✅ covered |
| —                 | `render` for another root element                            | render renders another root element                                                | ✅ covered |
| —                 | `ButtonBar` keeps a given id                                 | ButtonBar keeps an id that is passed                                               | ✅ covered |
| —                 | `ButtonBar` `fullWidth`                                      | ButtonBar fullWidth stretches the element and its button over the area             | ✅ covered |

### Visual comparison

`pnpm visual bar`: 23 cases × 16 combinations, 368/368 matching. Cases, against fundamental-styles' Default, Header,
Subheader, Header With Subheader, Footer, Floating Footer and Responsive stories: the plain, header, subheader,
header with subheader, subheader after a header, footer, floating footer (home page `xl`) and page `m_l` bars and the
full width element by computed style (they are as wide as their container, which differs between the two
Storybooks); the left areas with a title, with navigation buttons, with compact buttons and with the header text, the
title element, the header and footer texts, the footer actions and a transparent button element (at rest, hovered and
focused) by pixels; the right area and the floating footer actions by computed style. The middle areas
(fundamental-styles' segmented button) and the avatars (an image there, initials here) are not compared.

| Difference                                                    | Cause                                                                                                  | Resolution                                                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Areas as high as their content (18-36px) instead of the bar's | Angular's `items-center` on the bar; fundamental-styles lets the areas stretch and centres inside them | Fixed: no `items-center` on the bar. Not visible (the areas are transparent); an Angular issue. |
| Footer actions in HC White, compact RTL: 5.4% of pixels, once | Anti-aliasing of the button borders in one run                                                         | A rerun of the combination matches (0.0%). Not a difference.                                    |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, Designs, Floating footer and Custom shellbar
stories.
