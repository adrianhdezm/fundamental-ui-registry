## layout-panel

Sources: fundamental-react [LayoutPanel](https://github.com/SAP/fundamental-react/tree/main/src/LayoutPanel)
(`LayoutPanel` with `.Header`, `.Head`, `.Actions`, `.Filters`, `.Body`, `.Footer`) · Angular
[`registry/ui/layout-panel`](../../../../angular/registry/ui/layout-panel/) · fundamental-styles
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

### Stories vs. sources

| Source            | Example                 | React story               | Status     | Notes                                                                                                                                                          |
| ----------------- | ----------------------- | ------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fundamental-react | primary                 | `Basic`                   | ✅ covered | Header (title, description, actions), filters, body, footer; the panel props as controls.                                                                      |
| fundamental-react | singleLayoutPanel       | `SingleLayoutPanel`       | ✅ covered | Same texts, `title`/`description` on the head, compact add button. The Color/Size popover menus and the tile are placeholders (menu buttons, a tile-like box). |
| fundamental-react | inAResponsiveLayoutGrid | `InAResponsiveLayoutGrid` | ✅ covered | `LayoutGrid` columns 8 + 4 and 3 + 9 from 600px, stacked below.                                                                                                |
| fundamental-react | noStyles                | —                         | ➖ n/a     | No `cssNamespace`.                                                                                                                                             |
| Angular           | Basic                   | `Basic`                   | ✅ covered |                                                                                                                                                                |
| Angular           | Edge bleed              | `EdgeBleed`               | ✅ covered | Table and image reaching the edges.                                                                                                                            |
| Angular           | Transparent             | `Transparent`             | ✅ covered | Emphasized action, as fundamental-styles' Transparent Background.                                                                                              |
| Angular           | Footer variations       | `FooterVariations`        | ✅ covered | End, start and centred, in fundamental-styles' order.                                                                                                          |

### Tests vs. sources

| Source            | Behaviour                                              | React test                                                                                   | Status     |
| ----------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Parts placed in order whatever the projected order, id | places header, filters, body and footer in that order whatever the order of the children     | ✅ covered |
| Angular           | Header with title, description, actions and filters    | header with title, description, actions and filters                                          | ✅ covered |
| Angular           | Body bleed                                             | body bleed removes the padding                                                               | ✅ covered |
| Angular           | Footer position                                        | footer position start/end                                                                    | ✅ covered |
| Angular           | Transparent and backgroundImage                        | transparent variant and backgroundImage                                                      | ✅ covered |
| fundamental-react | Prop spreading (panel and every part), ref forwarding  | spreads native props, merges className and style, and forwards the refs of every part        | ✅ covered |
| fundamental-react | Head heading level                                     | head renders the title and description props at the heading level (fundamental-react)        | ✅ covered |
| —                 | Unknown children and wrappers in place, explicit id    | keeps other children and wrapper components in place, and an explicit id                     | ✅ covered |
| —                 | Title level and render, group title size               | title level and render                                                                       | ✅ covered |
| —                 | Narrow and wide headers                                | a narrow header wraps the actions under the head …; a header wide enough keeps … on one line | ✅ covered |
| —                 | SAP typography, `render`                               | uses the SAP text typography; renders another element with render                            | ✅ covered |

### Visual comparison

`pnpm visual layout-panel`: 12 cases × 16 combinations, 192/192 matching. Cases: the panel (Primary), the
transparent panel, header, head, title, description and actions (Transparent Background), filters, body and footer
(Primary), footer end and footer start (Footer Variations). fundamental-styles' texts are the class names of the parts,
so the parts compare by computed styles (with display, justify-content and align-items for the flex parts, and the
description's top margin); the actions of the transparent panel (an emphasized "Action" button in both) also by
pixels, 0.0%. Widths of the head, title and description follow their texts and are ignored; so are the heights of the
start/end footers (two buttons here, a line of text there).

| Difference                                                | Cause                                                                                                                                           | Resolution                                                                                      |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Title weight 700 on the `72-Bold` face (synthetic bold)   | Angular's `font-bold`; fundamental-styles' `.fd-title` keeps `font-weight: 400` on the bold header family                                       | Fixed: `font-normal`. Angular issue.                                                            |
| Head squeezed to a few pixels and title under the actions | Seen by eye in the responsive grid story (3 of 12 columns): one-line flex header in Angular and fundamental-styles, the head has `min-width: 0` | Fixed: the header wraps and long words break (see the API notes). Angular issue (same classes). |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL, at 900px: Basic, Single layout panel, In a responsive
layout grid, Edge bleed and Footer variations.
