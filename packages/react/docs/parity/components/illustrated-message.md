## illustrated-message

Sources: fundamental-react: none · Angular
[`registry/ui/illustrated-message`](../../../../angular/registry/ui/illustrated-message/) · fundamental-styles
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
  [`docs/assets/illustrations`](../../assets/illustrations/) and imported as `?raw` strings (`file`); nothing comes
  from fundamental-styles at run time.

Deliberate differences: the hidden inline SVG is only rendered while the illustration shows (Angular keeps it with
`noSvg`); the size is only observed without a `type`.

### Stories vs. sources

| Source  | Example                     | React story    | Status     | Notes                                                                                                         |
| ------- | --------------------------- | -------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| Angular | Scene                       | `Scene`        | ✅ covered | Labelled illustration.                                                                                        |
| Angular | Dialog                      | `DialogSize`   | ✅ covered | Unable To Load.                                                                                               |
| Angular | Spot                        | `Spot`         | ✅ covered |                                                                                                               |
| Angular | Dot                         | `Dot`          | ✅ covered |                                                                                                               |
| Angular | Responsive (resize the box) | `Responsive`   | ✅ covered |                                                                                                               |
| Angular | Without illustration        | `TextOnly`     | ✅ covered |                                                                                                               |
| Angular | In a dialog                 | `InDialog`     | ✅ covered | The registry's `Dialog`; the title labels it, the figcaption describes it.                                    |
| Angular | Open: in a dialog           | `OpenInDialog` | ✅ covered |                                                                                                               |
| —       | —                           | `Playground`   | ➕ added   | Controls for `type`, `svgAriaLabel` and `noSvg`.                                                              |
| —       | Large … Base (fs)           | `Sizes`        | ➕ added   | fundamental-styles' five examples with their texts and buttons, SAP illustrations; for the visual comparison. |

### Tests vs. sources

| Source  | Behaviour                                          | React test                                                                                                   | Status     |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| Angular | Illustration of the size, inline SVG or sprite URL | shows the illustration of its size from inline SVG or a sprite URL                                           | ✅ covered |
| Angular | Decorative unless labelled                         | is decorative unless the illustration is labelled                                                            | ✅ covered |
| Angular | Size follows the width without a type              | follows the available width without a type (all five breakpoints)                                            | ✅ covered |
| Angular | `noSvg`                                            | renders the text without an illustration with noSvg                                                          | ✅ covered |
| Angular | `type="base"`                                      | renders text only with type base                                                                             | ✅ covered |
| Angular | Created hidden, sized once visible                 | picks its size once a message created while hidden becomes visible                                           | ✅ covered |
| —       | SAP size names, figcaption and actions placement   | accepts the size names …; places the figcaption under the illustration …                                     | ➕ added   |
| —       | Sizes of each type, `render`, id, props/class/ref  | sets the sizes of each type; renders the parts as other elements …; generates an id …; merges a user class … | ➕ added   |

### Visual comparison

`pnpm visual illustrated-message`: 34 cases × 16 combinations, 544/544 matching. Cases, against fundamental-styles'
Large, Medium, Small, Extra Small and Base stories (our `Sizes` story has their texts and buttons): for each size the
message, the container and the illustration by computed styles and box size (fundamental-styles draws its own demo
illustrations, an ice cream, a folder and a phone; ours are SAP illustrations of the same box size), and the
figcaption, title, text and actions also by pixels.

| Difference                                                                | Cause                                                                                                                         | Resolution                                                                                                 |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Container lower by the actions in the xsmall and base sizes (height only) | fundamental-styles' Extra Small and Base examples put the actions into `__container`, its other examples and Angular after it | Kept: the message and every part have the same size and place; the container height is not compared there. |

No other differences: the sizes (padding, illustration box, gaps, title and text sizes, figcaption width) are
Angular's, which match fundamental-styles in every theme, density and direction.

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Sizes, Scene, Dialog, Spot, Dot, Responsive and Without
illustration. The illustrations use the `--sapContent_Illustrative_Color*` tokens, so they follow the theme.
