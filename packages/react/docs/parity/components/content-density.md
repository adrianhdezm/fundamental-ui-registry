## content-density

Sources: Angular [`registry/ui/content-density`](../../../../angular/registry/ui/content-density/) (itself from
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

### Stories vs. sources

| Source  | Example                    | React story       | Status     | Notes                                                                                   |
| ------- | -------------------------- | ----------------- | ---------- | --------------------------------------------------------------------------------------- |
| Angular | Content density modes      | `DensityModes`    | ✅ covered | Cozy, compact and condensed sections with a button and an input.                        |
| Angular | Directives and inheritance | `Directives`      | ✅ covered | Global, cozy, inherited, condensed, compact and a cozy island inside compact.           |
| Angular | Toggle directive           | `ToggleDirective` | ✅ covered | A `Switch` toggles `compact`.                                                           |
| —       | Density in a portal        | `OpenPortal`      | ✅ new     | `play` opens a popover whose body takes the section's density from `useContentDensity`. |
| —       | Nested densities           | `NestedDensities` | ✅ new     | The visual check: the other density, then the toolbar density again inside it.          |

### Tests vs. sources

| Source  | Behaviour                                              | React test                                                                                          | Status     |
| ------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ---------- |
| Angular | data-density from the explicit input or the shorthands | sets data-density from the explicit density or the shorthands                                       | ✅ covered |
| Angular | Ancestor switches compact: utilities, subtree only     | data-density="compact" on an ancestor switches compact: utilities on descendants                    | ✅ covered |
| Angular | Density on the document element                        | density on the document element applies to the whole page                                           | ✅ covered |
| Angular | Cozy island inside compact                             | a cozy island inside a compact subtree restores cozy sizes                                          | ✅ covered |
| Angular | Condensed falls back to compact sizes                  | condensed falls back to compact sizes where no condensed size exists                                | ✅ covered |
| Angular | Child density wins over its parent                     | a density set on a child wins over the density of its parent                                        | ✅ covered |
| Angular | fdCompact back to false                                | compact set back to false removes data-density so the inherited density applies                     | ✅ covered |
| —       | Nearest density through alternating levels             | the nearest density wins through alternating levels (compact, cozy, compact, cozy)                  | ✅ new     |
| —       | Native props, className, ref, `render`                 | passes native props, className and the ref to a div, and render renders another element             | ✅ new     |
| —       | `useContentDensity`                                    | useContentDensity returns the density of the nearest ContentDensity, inherited through ones without | ✅ new     |
| —       | `resolveContentDensity`, `contentDensityProps`         | resolveContentDensity and contentDensityProps follow the same order                                 | ✅ new     |

### Visual comparison

`ContentDensity` renders nothing of its own and fundamental-styles has no story for it. As for scroll-spy, a demo is
compared instead: `pnpm visual content-density`, 3 cases × 16 combinations, **48/48** matching. The Nested densities
story wraps a button ("Default Button") and an input in a section of the other density and, inside it, a section of
the toolbar density again; they match fundamental-styles' default button (at rest and hovered) and its input
(`#input-default`, styles only without the width: fundamental-styles' fills the story) of the toolbar density only if
both overrides work.

| Difference                                                               | Cause                                                                                      | Resolution                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Compact combinations: button and input 36px high instead of 26px (24/48) | The `compact` variant ignored a compact section inside a cozy island inside a compact page | Fixed in `styles/fundamental.css` (nearest density wins, 4 levels) |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: the inheritance story (each box in its own density in both
toolbar densities, including the compact box inside the cozy one under the compact toolbar) and the compact popover
body of the portal story.
