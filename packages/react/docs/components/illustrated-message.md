## illustrated-message

Sources: fundamental-react: none · Angular
[`registry/ui/illustrated-message`](../../../angular/registry/ui/illustrated-message/) · fundamental-styles
[Illustrated Message](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-illustrated-message--docs)
Registry: `registry/ui/illustrated-message/`, on Base UI's `useRender` (every part).

API: Angular's component and directives as components, composed the same way:

```tsx
<IllustratedMessage type="dialog" svgConfig={noMail} svgAriaLabel="Empty mailbox">
  <IllustratedMessageFigcaption>
    <IllustratedMessageTitle>No mail</IllustratedMessageTitle>
    <IllustratedMessageText>Check again later.</IllustratedMessageText>
  </IllustratedMessageFigcaption>
  <IllustratedMessageActions>
    <Button label="Refresh" />
  </IllustratedMessageActions>
</IllustratedMessage>
```

- **`IllustratedMessage`** (`[fd-illustrated-message]`): a `<figure>` (`render` for another element) with Angular's
  inputs `type` (`scene`/`large`, `dialog`/`medium`, `spot`/`small`, `dot`/`xsmall`, `base`), `svgConfig`,
  `svgAriaLabel`, `noSvg` and `id` (`fd-illustrated-message-…` by default). `data-size` names the size shown. Without a
  `type` the size follows the width (a `ResizeObserver`, as Angular: large from 682px, medium from 361px, small from
  261px, extra small from 161px, text only below); a message created while hidden picks its size once it shows.
  Native props, `className` and `ref` go to the figure.
- The illustration is an `<svg><use href="url#id"></svg>` of the size's `svgConfig` item (`scene` … `dot` or `large` …
  `xsmall`): `url` points to a sprite or SVG file, `file` is inline SVG markup inserted into a hidden element next to
  it (Angular's `bypassSecurityTrustHtml`; React's `dangerouslySetInnerHTML`, so trusted markup only). It is
  decorative (`aria-hidden`) unless `svgAriaLabel` names it (`role="img"`).
- **`IllustratedMessageFigcaption`** (`<figcaption>`), **`IllustratedMessageTitle`** (`<h3>`; `render={<h2 />}` for
  another level), **`IllustratedMessageText`** (`<p>`) and **`IllustratedMessageActions`** (`<div>`; Angular's
  `fd-illustrated-message-actions` element): the figcaption child goes into the container under the illustration
  (Angular's content projection), the other children after it.
- **The illustrations are not part of the component**, as in Angular: apps bring their own SAP illustrations (for
  example from `@ui5/webcomponents-fiori`'s `dist/illustrations`) as files, a sprite or inline markup. The stories use
  eight of them (No Mail and Unable To Load in the four sizes), copied unmodified as Angular's into
  [`docs/assets/illustrations`](../assets/illustrations/) and imported as `?raw` strings (`file`); nothing comes
  from fundamental-styles at run time.

Deliberate differences: the hidden inline SVG is only rendered while the illustration shows (Angular keeps it with
`noSvg`); the size is only observed without a `type`.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                | Cause                                                                                                                         | Resolution                                                                                                 |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Container lower by the actions in the xsmall and base sizes (height only) | fundamental-styles' Extra Small and Base examples put the actions into `__container`, its other examples and Angular after it | Kept: the message and every part have the same size and place; the container height is not compared there. |
