## dynamic-side-content

Sources: Angular [`registry/ui/dynamic-side-content`](../../../../angular/registry/ui/dynamic-side-content/) (itself
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

### Stories vs. sources

| Source             | Example                         | React story   | Status     | Notes                                                                                                     |
| ------------------ | ------------------------------- | ------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| Angular            | Projected order                 | `Basic`       | ✅ covered | Main first and side first, without a position.                                                            |
| Angular            | Positions                       | `Positioning` | ✅ covered | Left (side second), right (side first), bottom and equal split.                                           |
| Angular            | Sizes                           | `Sizes`       | ✅ covered | sm, md, xl, all `right`.                                                                                  |
| fundamental-styles | Left, Right, Below, Equal split | `Positioning` | ✅ covered | The visual cases use it.                                                                                  |
| fundamental-styles | Responsiveness                  | `Sizes`       | ✅ covered | fundamental-styles narrows its md and sm examples with `max-width`; ours are full width, sizes are props. |
| —                  | Playground                      | `Playground`  | ✅ new     | `position` and `size` as controls.                                                                        |

Story differences from Angular: the boxes are 4rem high with SAP indication colours (as layout-grid's story blocks,
after fundamental-styles' `docs-layout-grid-bg`) instead of Angular's 5rem bordered group-content boxes; the headings
are `Title` (`level={3} headerSize={5}`).

### Tests vs. sources

| Source  | Behaviour                                                           | React test                                                                                              | Status     |
| ------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------- |
| Angular | left/right/bottom place the side content in the DOM                 | position left/right/bottom renders the side content before/after the main content in the DOM            | ✅ covered |
| Angular | Moves the side content when the position changes                    | moves the side content when the position changes (`rerender`)                                           | ✅ covered |
| Angular | none/equalSplit keep the projected order                            | position none/equalSplit keeps the order of the children (and none is the default)                      | ✅ covered |
| Angular | sm hides the side; md/lg 66.666%; xl 75%                            | size sm hides the side content; md/lg give main 66.666%; xl (default) 75%                               | ✅ covered |
| Angular | bottom stacks with full widths (side visible at sm); equalSplit 50% | bottom stacks vertically with full widths; equalSplit gives 50% each                                    | ✅ covered |
| —       | Generated and given ids                                             | generates ids and keeps given ones                                                                      | ✅ new     |
| —       | Native props, className, refs, `render`                             | passes native props, className and refs to the layout and its parts, and render renders another element | ✅ new     |
| —       | Other children                                                      | keeps other children in their place                                                                     | ✅ new     |

### Visual comparison

`pnpm visual dynamic-side-content`: 11 cases × 16 combinations, **176/176** matching on the first run. fundamental-
styles fills its examples with docs boxes in colours of its own, so every case compares computed styles (with
`display`, the flex properties, `box-sizing` and margins) and box sizes, not pixels: the layout, main and side
content of the Left example, the layout, main and side of Below, main and side of Equal split, main and side of
Responsiveness' md example and the main content of its sm example (both without the width: fundamental-styles caps
those examples at 920px and 420px).

| Difference | Cause | Resolution |
| ---------- | ----- | ---------- |
| None       | —     | —          |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Positions and Sizes. Density changes nothing (no sized
controls). In RTL the flex row mirrors, so `left` shows the side content on the right (start side), as
fundamental-styles' Left example in RTL and as Angular.
