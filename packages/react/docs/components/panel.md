## panel

Sources: Angular [`registry/ui/panel`](../../../angular/registry/ui/panel/) (itself from `@fundamental-ngx/core`'s
`fd-panel`) · no fundamental-react source · fundamental-styles
[Panel](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-panel--docs)
Registry: `registry/ui/panel/`, on Base UI's Collapsible (`Collapsible.Root`, `.Trigger`, `.Panel`) and the `button`
component.

API: the Angular component and its two directives as three components:

```tsx
<Panel expanded={open} onExpandedChange={setOpen} expandAriaLabel="Details" expandAriaLabelledBy="details-title">
  <PanelTitle id="details-title">Details</PanelTitle>
  <Button variant="transparent" glyph="edit" aria-label="Edit" />
  <PanelContent aria-labelledby="details-title">…</PanelContent>
</Panel>
```

| Angular                                                             | React                                                                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `fd-panel`: `[(expanded)]` model (default `false`)                  | `Panel`: `expanded` / `defaultExpanded` (default `false`) / `onExpandedChange`                          |
| `fixed`, `transparent`, `noRadius`                                  | the same (`transparent`: see the differences)                                                           |
| `expandAriaLabel` (name and `title` of the expand button)           | the same                                                                                                |
| `expandAriaLabelledBy` (`aria-labelledby` = it and the button's id) | the same                                                                                                |
| `id` (`fd-panel-N`), `expandId` (`fd-panel-expand-N`)               | `id` (`fd-panel-…`), `expandId` (`fd-panel-expand-…`), generated with `useId`                           |
| `class`                                                             | `className`, merged; native props and `ref` go to the root `<div>` (`Collapsible.Root`)                 |
| `toggleExpand()`                                                    | the expand button, or `expanded` / `onExpandedChange`                                                   |
| `[fd-panel-title]`: `id` (`fd-panel-title-N`), `wrap` (default on)  | `PanelTitle`: the same; an `<h4>` by default, `level` 1-6 for another heading, `render` for any element |
| `[fd-panel-content]`: `id`, `role` (`region`, `null` removes it)    | `PanelContent`: the same                                                                                |
| `ariaLabel`, `ariaLabelledBy`                                       | the native `aria-label`, `aria-labelledby`                                                              |
| `height`, `minHeight`, `maxHeight` (inline styles)                  | the same, merged with `style`                                                                           |
| `noPadding`, `transparent`, `class`                                 | `noPadding`, `transparent`, `className`; native props, `ref` and `render` pass through                  |

Behaviour, as Angular:

- The expand button is a transparent `Button` rendered by `Collapsible.Trigger`: a native `<button>` (Enter and Space
  toggle it) with `aria-expanded`, `aria-controls` pointing at the content, the `slim-arrow-right` glyph when
  collapsed (mirrored in RTL, as fundamental-styles rotates it) and `slim-arrow-down` when expanded, in a 2.75rem box
  (2.5rem compact) at the start of the header.
- The content is `Collapsible.Panel`: unmounted while the panel is collapsed (Angular's `@if`), a `region` named by
  `aria-label` or `aria-labelledby`, scrolling (`overflow: auto`, SAP scrollbar) when a height limits it.
- Fixed panels have no expand button and always show the content; the header starts at 0.75rem instead.
- The header's bottom corners are rounded while the content is hidden; `noRadius` squares header and content; a
  toolbar (`role="toolbar"`) in the header takes the end padding (Angular's `has-[fd-toolbar]:pe-0`).
- Children are placed as Angular projects them: the `PanelTitle` first in the header, then the other children
  (actions, a toolbar), and the `PanelContent` below the header, whatever their order. Only direct children are
  recognised.
- `PanelContent` outside a `Panel` renders a plain region (Angular injects the panel optionally).

**Differences, on purpose:**

- `aria-controls` is set only while the content is rendered (Base UI's Collapsible): it would point at a missing
  element while collapsed. Angular sets it always.
- `transparent` on the panel clears the content background only; the header keeps the group title background, as
  fundamental-styles' `fd-panel--transparent`. Angular also makes the header transparent (an Angular issue, see the
  visual comparison).
- The title has `font-weight: normal` and `line-height: normal`, as fundamental-styles' `.fd-panel__title`: the header
  family is the `72-Bold` face, so Angular's `font-bold` adds synthetic bold on top of it.
- The expand button keeps the button's `line-height: normal` with its 1rem glyph size: Angular's `class="text-base"`
  comes after the button's `leading-[normal]`, so `tailwind-merge` drops it and the line height becomes 1.5rem
  (computed style only; the button height is fixed).
- fundamental-styles' `fd-panel--borderless` and `fd-panel--sticky` modifiers (the Borderless and Sticky Header
  stories) are not in the Angular API and are not ported.
