## dynamic-side-content

Sources: Angular [`registry/ui/dynamic-side-content`](../../../angular/registry/ui/dynamic-side-content/) (itself
from `@fundamental-ngx/core`'s `fd-dynamic-side-content`) · no fundamental-react source · fundamental-styles
[Layouts/Dynamic Side Content](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-layouts-dynamic-side-content--docs).
Registry: `registry/ui/dynamic-side-content/`: `DynamicSideContent`, `DynamicSideContentMain` and
`DynamicSideContentSide`, each on Base UI's `useRender` (a `<div>`; `render` renders another element).

API, as Angular's:

| Angular                                                                      | React                                                                      |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `fd-dynamic-side-content`                                                    | `<DynamicSideContent>`                                                     |
| `position` (`left`, `right`, `bottom`, `equalSplit`, `none`; default `none`) | `position` (same values and default)                                       |
| `size` (`sm`, `md`, `lg`, `xl`; default `xl`)                                | `size` (same values and default)                                           |
| `id` (generated)                                                             | `id` (generated as `fd-dynamic-side-content-…` with `useId`)               |
| `class`                                                                      | `className`, merged with `cn()`; every other prop goes to the root         |
| `fd-dynamic-side-content-main` (`id`, `class`)                               | `<DynamicSideContentMain>` (generated id `fd-dynamic-side-content-main-…`) |
| `fd-dynamic-side-content-side` (`id`, `class`)                               | `<DynamicSideContentSide>` (generated id `fd-dynamic-side-content-side-…`) |

The classes are Angular's: a flex row with the main content at three quarters (`xl`) or two thirds (`md`, `lg`) and
the side content taking the rest (`flex: 1 1 0`), `sm` hiding the side content, `bottom` a column with both at full
width (the side content stays visible at `sm`), `equalSplit` 50% each. As in Angular, `left` puts the side content
first in the DOM, `right` and `bottom` put it last, `none` and `equalSplit` keep the order of the children.

**Differences on purpose:**

- Angular finds the projected parts with `contentChildren`; React reorders its direct `DynamicSideContentMain` and
  `DynamicSideContentSide` children (by component type, a stable order). Other children keep their place, and a part
  inside a wrapper component is not moved (as `layout-panel`).
- The parts have no classes of their own: the layout styles its `data-dsc-main` and `data-dsc-side` children, as
  Angular does.
