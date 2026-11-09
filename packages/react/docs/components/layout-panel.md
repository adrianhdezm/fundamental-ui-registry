## layout-panel

Sources: fundamental-react [LayoutPanel](https://github.com/SAP/fundamental-react/tree/main/src/LayoutPanel)
(`LayoutPanel` with `.Header`, `.Head`, `.Actions`, `.Filters`, `.Body`, `.Footer`) · Angular
[`registry/ui/layout-panel`](../../../angular/registry/ui/layout-panel/) · fundamental-styles
[Layout Panel](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-layouts-layout-panel--docs)
Registry: `registry/ui/layout-panel/`, on Base UI's `useRender`.

API: nine components, as Angular's:

- `LayoutPanel`: `transparent`, `backgroundImage` (a URL, covering the panel), and an `id` that defaults to a
  generated `fd-layout-panel-…` one, as Angular's.
- `LayoutPanelHeader`, `LayoutPanelHead`, `LayoutPanelTitle` (Angular's `fd-layout-panel-title` directive: an `<h3>`
  by default, `level` 1-6 for another heading, `render` for any element), `LayoutPanelDescription` (a `<p>`),
  `LayoutPanelActions`, `LayoutPanelFilters`.
- `LayoutPanelBody`: `bleed` removes the padding; the first and last children lose their outer margins.
- `LayoutPanelFooter`: `position` `'start' | 'end'`, centred by default.

All render a `<div>` (the title a heading, the description a `<p>`), pass native props and refs through, merge
`className` and `style`, and take `render` for another element (e.g. `<section>`, `<header>`, `<footer>`). As
Angular's slots, the panel places header, filters, body and footer in that order, and the header the head before the
actions, whatever the order of the children.

fundamental-react's sub-components (`LayoutPanel.Header`, …) are the named exports. Its `LayoutPanel.Head` props are
kept on `LayoutPanelHead`: `title` and `description` render a `LayoutPanelTitle` and a `LayoutPanelDescription` before
the children, and `headingLevel` (default 3) is the title's level. `headingStyle` is not ported: the panel title has
the group title size (`--sapGroup_Title_FontSize`) whatever the level, in fundamental-styles as in Angular, so it
changed nothing visible. `title` replaces the native `title` attribute on the head (use it on another element for a
tooltip). `cssNamespace` is gone.

**Differences from Angular, on purpose:**

- The title has `font-weight: normal` on the header font, as fundamental-styles (`.fd-title`): the header family is
  the `72-Bold` face, so Angular's `font-bold` adds synthetic bold on top of it.
- Children the panel does not know (text, other elements, a wrapper component that renders a part) keep their place;
  only the parts themselves are sorted. Angular projects unknown content last. In React a part inside a wrapper
  component (e.g. a `function Header()` returning `<LayoutPanelHeader>`) is not recognised, and Angular's rule would
  move the header behind the body.
- The header wraps: when the head and the actions do not fit on one line, the actions go under the head (gap 0.5rem)
  instead of squeezing it, and long words in the head break instead of running under the actions. Angular and
  fundamental-styles keep one line, and in narrow panels (e.g. 3 of 12 columns) the head shrinks to a few pixels and
  the title runs under the action button. One line whenever it fits, so the comparison with fundamental-styles is
  unchanged.
- The panel sets `line-height: normal` and `font-weight: normal` with the SAP text font, as fundamental-styles'
  `.fd-layout-panel`; Angular sets only the font, size and colour.
