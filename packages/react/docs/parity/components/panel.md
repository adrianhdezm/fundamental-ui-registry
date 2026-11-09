## panel

Sources: Angular [`registry/ui/panel`](../../../../angular/registry/ui/panel/) (itself from `@fundamental-ngx/core`'s
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

### Stories vs. sources

| Source             | Example                                             | React story    | Status     | Notes                                                                                            |
| ------------------ | --------------------------------------------------- | -------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| Angular            | Expandable                                          | `Expandable`   | ✅ covered | A controlled panel with the props as controls and its state shown below, and a collapsed one.    |
| Angular            | Fixed, header actions, fixed height and transparent | `Fixed`        | ✅ covered | The scrolling content is focusable (`tabIndex={0}`), as in Angular's story.                      |
| Angular            | Customizable (transparent, no radius, no padding)   | `Customizable` | ✅ covered | Accounts list in a transparent, square panel without padding; notes with transparent content.    |
| fundamental-styles | Fixed, Expandable, Fixed height, Transparent        | `Variants`     | ✅ new     | Their examples with their texts and the header toolbar (segmented button): the visual reference. |
| fundamental-styles | Borderless, Sticky Header                           | —              | ➖ n/a     | Modifiers not in the Angular API.                                                                |
| fundamental-react  | —                                                   | —              | ➖ n/a     | No fundamental-react source.                                                                     |

### Tests vs. sources

| Source  | Behaviour                                                          | React test                                                                                        | Status     |
| ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ---------- |
| Angular | Expand button toggles, aria-controls/expanded, Enter, Space, bound | expand button toggles expanded and controls the content via aria-controls / aria-expanded         | ✅ covered |
| Angular | Fixed: no expand button, content always shown, header content      | fixed panels have no expand button and always show the content                                    | ✅ covered |
| Angular | Title names the expand button and the region, ids                  | title is the label of the expand button and content region                                        | ✅ covered |
| Angular | Header corners follow the state, transparent                       | header and content corners follow the expanded state (also `noRadius`)                            | ✅ covered |
| Angular | Compact sizes                                                      | compact density sizes                                                                             | ✅ covered |
| Angular | Content height, minHeight, maxHeight                               | content height, minHeight and maxHeight size the content and make it scroll                       | ✅ covered |
| Angular | Title wraps or truncates                                           | title wraps long text by default and truncates when wrap is false                                 | ✅ covered |
| Angular | noPadding, transparent content                                     | noPadding and transparent content remove padding and background                                   | ✅ covered |
| Angular | Class merged into panel and content                                | className is merged into the panel and content classes                                            | ✅ covered |
| —       | Uncontrolled state                                                 | uncontrolled: defaultExpanded, then the button toggles it and reports the change                  | ✅ new     |
| —       | Children placed as Angular projects them                           | places the title first in the header and the content below it, whatever the order of the children | ✅ new     |
| —       | Toolbar in the header, fixed start padding                         | a toolbar in the header takes the end padding                                                     | ✅ new     |
| —       | Title level, native props, ref, weight                             | title: heading level, wrap and native props                                                       | ✅ new     |
| —       | Content outside a panel, `role={null}`                             | content outside a panel is a plain region; role can be removed                                    | ✅ new     |
| —       | RTL arrow                                                          | the collapsed arrow is mirrored in RTL                                                            | ✅ new     |
| —       | Native props, className, ref, ids                                  | passes native props, className and ref to the root; ids can be set                                | ✅ new     |

### Visual comparison

`pnpm visual panel`: 20 cases × 16 combinations, 320/320 matching (first run: 192/304 with 19 cases, before the
differences below were sorted out). Cases, against fundamental-styles' Panel stories, in the `Variants` story (their
examples with their texts): the collapsed panel (with its bottom margin), its header with a toolbar, the expand button
area and the expand button at rest, on hover and with keyboard focus, the title, the header toolbar; the expanded
panel, its header, expand button and content (Expandable); the header, wrapping title and content of the fixed panel
with a toolbar (Fixed); the fixed height content (Fixed height); the header and content of the transparent panel, the
header without an expand button and the content without padding (Transparent). Computed styles and pixels (3%).

| Difference                                                                                       | Cause                                                                                                                                         | Resolution                                                                                               |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Expand button line height 24px, fundamental-styles' `normal`                                     | The button's `text-base` comes after its `leading-[normal]`, so `tailwind-merge` drops the line height and Tailwind's `text-base` sets 1.5rem | Fixed: `text-base leading-[normal]`. Angular issue (computed style only, the height is fixed).           |
| Transparent panel: header background transparent, fundamental-styles' the group title background | Angular's `transparent` clears the header background too; `fd-panel--transparent` only sets the content background                            | Fixed: `transparent` clears the content background only. Angular issue (visible in Horizon Dark and HC). |
| Fixed height content: other text (10% of pixels)                                                 | Our story repeated the short text; fundamental-styles continues with other lorem ipsum                                                        | Fixed in the story: fundamental-styles' text.                                                            |
| Transparent fixed header (cozy HC): no bottom border in the screenshot                           | The header was captured at the bottom edge of the viewport after scrolling, where the screenshot lost its 2px border (the page paints it)     | Fixed in the story: the transparent example comes first, in the first screen.                            |
| Title weight                                                                                     | Angular's `font-bold` on the `72-Bold` header family (synthetic bold); fundamental-styles has `font-weight: 400`                              | Fixed before the first run: `font-normal`, `leading-[normal]`. Angular issue.                            |

Reviewed by eye in Horizon cozy and compact, LTR and RTL: `Expandable`, `Fixed`, `Customizable` and `Variants`.
