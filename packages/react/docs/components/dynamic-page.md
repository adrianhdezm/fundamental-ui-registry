## dynamic-page

Sources: fundamental-react: none · Angular [`registry/ui/dynamic-page`](../../../angular/registry/ui/dynamic-page/)
· fundamental-styles
[Dynamic Page](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-layouts-dynamic-page--docs)
Registry: `registry/ui/dynamic-page/`, with the `button` component (collapse and pin buttons), the `tabs` component
(a `TabList` of the page) and the `toolbar` component (`ToolbarForceOverflowContext` for the global actions).

API: composed parts, as Angular's `fd-dynamic-page` and its parts:

```tsx
<DynamicPage aria-label="Product">
  <DynamicPageHeader title="Product" subtitle="Details">
    <DynamicPageBreadcrumb>
      <Breadcrumb>…</Breadcrumb>
    </DynamicPageBreadcrumb>
    <DynamicPageTitleContent>Key information</DynamicPageTitleContent>
    <DynamicPageGlobalActions>
      <Button label="Edit" />
    </DynamicPageGlobalActions>
    <DynamicPageLayoutActions>
      <Button glyph="decline" aria-label="Close" />
    </DynamicPageLayoutActions>
    <MessageStrip type="warning">…</MessageStrip>
  </DynamicPageHeader>
  <DynamicPageSubheader pinnable>Header content</DynamicPageSubheader>
  <TabList>…</TabList> {/* optional; or DynamicPageTabs for other navigation */}
  <DynamicPageContent>Content</DynamicPageContent>
  <DynamicPageFooter>
    <Bar barDesign="floating-footer">…</Bar>
  </DynamicPageFooter>
</DynamicPage>
```

| Angular                                                                                     | React                                                                                                                       |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `fd-dynamic-page` (host `block h-full` around an `<article>`)                               | `DynamicPage`: the `<article>` itself; native props, `className` and `ref` go to it                                         |
| `disableSnapOnScroll`, `background`, `autoResponsive`, `size`, `offset`, `expandContent`    | the same props                                                                                                              |
| `positionRelative`, `toggleHeaderLabel`                                                     | the same props                                                                                                              |
| `ariaLabel`, `ariaRoledescription` (default `Dynamic Page`)                                 | `aria-label`, `aria-roledescription` (default `Dynamic Page`)                                                               |
| `exportAs: fdDynamicPage`: `size()`, `refreshSize()`, `scrollElement()`, `toggleCollapse()` | `onSizeChange` (the measured size and each change) and `actionsRef`: `refreshSize()`, `scrollElement()`, `toggleCollapse()` |
| `fd-dynamic-page-header`: `title`, `subtitle`, `titleWrap`, `subtitleWrap`                  | `DynamicPageHeader`: the same props (`title` and `subtitle` take any node; `title` replaces the native attribute)           |
| `headingLevel` (number or `'h3'`), `subtitleHeadingLevel`, `titleId`, `breadcrumbsLabel`    | the same props; `titleId` defaults to `fd-dynamic-page-title-<useId>`                                                       |
| `<ng-template fdDynamicPageHeaderTitle let-collapsed>` / `fdDynamicPageHeaderSubtitle`      | `renderTitle(collapsed)`, `renderSubtitle(collapsed)`                                                                       |
| projected `fd-facet` (shown before the title while collapsed)                               | `facet` (a node)                                                                                                            |
| projected `fd-message-strip`                                                                | any other child of the header (below the title area)                                                                        |
| `fd-dynamic-page-breadcrumb`, `-title-content` (`titleContentWrap`)                         | `DynamicPageBreadcrumb`, `DynamicPageTitleContent` (`titleContentWrap`)                                                     |
| `fd-dynamic-page-global-actions`, `-layout-actions` (`ariaLabel`)                           | `DynamicPageGlobalActions`, `DynamicPageLayoutActions` (`aria-label`, defaults `Global actions`, `Layout actions`)          |
| `fd-dynamic-page-subheader`: `collapsed` model, `collapsible`, `pinnable`                   | `DynamicPageSubheader`: `collapsed` / `defaultCollapsed` / `onCollapsedChange`, `collapsible`, `pinnable`                   |
| `expandLabel`, `collapseLabel`, `pinAriaLabel`, `unpinAriaLabel`, `headerAriaLabel`, …      | the same props; `id` defaults to `fd-dynamic-page-header-<useId>` (the region is `<id>-content`)                            |
| `fd-dynamic-page-content` (`id`, `tabLabel`)                                                | `DynamicPageContent` (native `id`); `tabLabel` is gone (unused by Angular's template, the `Tab` has the title)              |
| `fd-dynamic-page-footer`, `[fdDynamicPageTabs]`, `fd-tab-list`                              | `DynamicPageFooter`, `DynamicPageTabs`, a `TabList` child                                                                   |

The behaviour is Angular's: the page measures its width (ResizeObserver and window resize) for the size (small up to
599px, medium up to 1023px, large up to 1439px, extra large above) unless `autoResponsive` is false, and sets the page
padding (`--dp-px`: 1rem, 2rem, 2rem, 3rem), the floating footer offsets and the global actions padding from it; below
1280px the layout actions move up into the breadcrumb row; on small pages a `Toolbar` in the global actions moves all
its items into its overflow. With `expandContent` (default) the page is `calc(100svh - top - offset)` high. The header
collapses or expands from a click on the title area (not on its links, buttons, fields, breadcrumb, actions or message
strip, nor while text is selected), from the visually hidden header toggle (`role="button"`, Enter and Space,
`aria-expanded`, described by the title), from the collapse button (`aria-expanded`, `aria-controls` the header
region) and from `actionsRef.toggleCollapse()`; any of these unpins it. Scrolling the content (or the content area of a
`TabList`) collapses the header when scrolled and expands it at the top, unless the header is pinned (it stays
expanded) or `disableSnapOnScroll` is set. While collapsed the subtitle moves next to the title, the title takes the
snapped font size, the facet shows and the pin button hides. The content is focusable (`tabIndex` 0) for keyboard
scrolling, except inside a `TabList`, which scrolls instead; with a footer each content ends with a 3rem spacer (with
stacked tabs only the last). A `Breadcrumb` in the breadcrumb part is a navigation landmark of its own; other content
gets a `navigation` named `breadcrumbsLabel` around it.

**Differences, on purpose:**

- As Angular's content projection, the page places its parts by type: the header and subheader in the `<header>`, a
  `TabList` or `DynamicPageTabs`, other children (contents) in source order, and the footer in the `<footer>`. The parts
  must be direct children (not wrapped in a component or fragment), as Angular's `ng-content select`. The header does
  the same for its parts; its other children take the message strip slot.
- The page holds the collapsed state; the subheader's `collapsed`, `defaultCollapsed` and `onCollapsedChange` (Angular's
  two-way `collapsed` model on `fd-dynamic-page-subheader`) control it, read by the page from its subheader child.
- A `TabList` child gets the page classes through its `className` (bar paddings and stacking, content background by
  `background`) and the page reads its scroll element through a merged `actionsRef` (the app's own `actionsRef` still
  works). Angular styles `fd-tab-list` with descendant selectors on the page.
- `offset` and `expandContent` changes apply at once; Angular applied `offset` only on the next measure.
- Clicks that bubble through React from a portal (e.g. the toolbar overflow popover) do not toggle the header.
- The shadows are `[box-shadow:var(--sapContent_HeaderShadow)]`, not Angular's `shadow-sap-content-header-shadow`,
  which prepends Tailwind's transparent ring and inset layers.

**Facets:** the stories use the `facets` component, as Angular's: a `FacetGroup` of an image, a form and three
key-value facets in the subheader, and an image `Facet` with a small `Avatar` as the header's `facet` (its 2rem end
margin, Angular's; fundamental-styles' header facet has none). The header's `facet` takes any node.

**Flexible column layout:** `InFlexibleColumnLayout` puts the page in the mid column of the `flexible-column-layout`
component (TwoColumnsMidExpanded), as Angular's; its layout actions switch to OneColumnMidFullScreen and close the
column, and the separator expands or collapses the list.
