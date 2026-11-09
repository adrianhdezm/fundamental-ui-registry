## bar

Sources: fundamental-react [Bar](https://github.com/SAP/fundamental-react/tree/main/src/Bar) · Angular
[`registry/ui/bar`](../../../angular/registry/ui/bar/) · fundamental-styles
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
