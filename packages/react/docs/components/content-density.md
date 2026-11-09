## content-density

Sources: Angular [`registry/ui/content-density`](../../../angular/registry/ui/content-density/) (itself from
`@fundamental-ngx/core`'s content density directives) · no fundamental-react source · no fundamental-styles story (its
density is the `is-compact` class its toolbar sets; the Content Density docs page has no example).
Registry: `registry/ui/content-density/`: the `ContentDensity` component on Base UI's `useRender`, the
`useContentDensity` hook and two helpers. Density itself is CSS: the `compact:` and `condensed:` variants of
`styles/fundamental.css` read the nearest `data-density`.

API, as Angular's directive:

| Angular                                                          | React                                                                                         |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `[fdContentDensity]="'compact'"` on an element                   | `<ContentDensity density="compact">` (a `<div>`; `render` renders another element)            |
| `fdCompact`, `fdCozy`, `fdCondensed`                             | `compact`, `cozy`, `condensed`                                                                |
| `density()` (explicit, else compact, condensed, cozy, else none) | `resolveContentDensity(options)`, the same order                                              |
| `ContentDensity` type                                            | `ContentDensityMode` (`ContentDensity` is the component)                                      |
| host `data-density`                                              | `data-density` on the element; `contentDensityProps(options)` for an element of your own      |
| —                                                                | `useContentDensity()`: the density of the nearest `ContentDensity`, to carry it into a portal |

**Differences on purpose:** a directive is an attribute on any element; in React it is a component (with `render`)
or the `contentDensityProps` spread. Portals (popovers, dialogs) leave the DOM subtree, so `data-density` on an
ancestor does not reach them; `useContentDensity()` reads the density through React context so a portalled body can
set it (the `Open: density in a portal` story). Angular has no such helper.

**Styles changed:** the `compact` variant in `registry/styles/fundamental.css` now lets the nearest density win
through four alternating levels (compact › cozy › compact › cozy). Before, any element inside a cozy island inside
compact stayed cozy, so a compact section inside a cozy island of a compact page (Angular's own "Directives and
inheritance" story under the compact toolbar) did not get compact sizes. The same variant is in the Angular package
(an Angular issue). The selector keeps zero specificity; the density-related specs of the other components pass.
