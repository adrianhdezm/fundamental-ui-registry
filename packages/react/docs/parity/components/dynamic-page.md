## dynamic-page

Sources: fundamental-react: none · Angular [`registry/ui/dynamic-page`](../../../../angular/registry/ui/dynamic-page/)
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

### Stories vs. sources

| Source  | Example                                          | React story                          | Status     | Notes                                                                                   |
| ------- | ------------------------------------------------ | ------------------------------------ | ---------- | --------------------------------------------------------------------------------------- |
| Angular | Facets, pinnable header and footer               | `Default`                            | ✅ covered | `FacetGroup` in the subheader; an image `Facet` (small avatar) is the header's `facet`. |
| Angular | Not collapsible, list background                 | `NotCollapsible`                     | ✅ covered |                                                                                         |
| Angular | Collapsed header, custom title and message strip | `Collapsed`                          | ✅ covered | `renderTitle`, `defaultCollapsed`, a `TabList`, transparent background.                 |
| Angular | Small width                                      | `Small`                              | ✅ covered |                                                                                         |
| Angular | Tabs                                             | `Tabs`                               | ✅ covered |                                                                                         |
| Angular | Stacked tabs                                     | `StackedTabs`                        | ✅ covered |                                                                                         |
| Angular | Responsive                                       | `Responsive`                         | ✅ covered | Width switcher; the size comes from `onSizeChange`.                                     |
| Angular | Dynamic height of the parent                     | `ContainerHeight`                    | ✅ covered | `actionsRef.current.refreshSize()` after the spaces render.                             |
| Angular | Inside a flexible column layout                  | `InFlexibleColumnLayout`             | ✅ covered | The page in the mid column of a `FlexibleColumnLayout`.                                 |
| Angular | With wizard                                      | `WithWizard`                         | ✅ covered |                                                                                         |
| —       | fundamental-styles Desktop, Collapsed Header     | `OtherNavigation`, `CollapsedHeader` | ✅ added   | fundamental-styles' texts, extra large; `DynamicPageTabs` with a navigation of links.   |

The page is not an overlay, so there is no "Open: …" story.

### Tests vs. sources

| Source  | Behaviour                                                      | React test                                                                            | Status     |
| ------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| Angular | Global actions toolbar overflows on small pages                | moves the global actions of a toolbar into its overflow when the page is small        | ✅ covered |
| Angular | Title area click toggles, not its links                        | toggles the header by clicking the title area but not its links                       | ✅ covered |
| Angular | Enter and Space on the header toggle                           | toggles the header with Enter and Space on the header button                          | ✅ covered |
| Angular | Scroll collapses, pinned stays expanded                        | collapses the header while the content scrolls, unless pinned                         | ✅ covered |
| Angular | `disableSnapOnScroll`                                          | keeps the header expanded with disableSnapOnScroll                                    | ✅ covered |
| Angular | Tab list scrolls and collapses                                 | scrolls the content of tabs in the tab list and collapses the header from it          | ✅ covered |
| Angular | Footer spacer per content, last only with stacked tabs         | leaves room for the footer below each content, or only the last with stacked tabs     | ✅ covered |
| Angular | No nested navigation around a breadcrumb                       | does not nest a navigation landmark around a Breadcrumb                               | ✅ covered |
| Angular | Global and layout actions are labelled toolbars                | global and layout actions are labelled toolbars                                       | ✅ covered |
| Angular | Title and subtitle; subtitle moves when collapsed              | renders title and subtitle, and moves the subtitle into the title area when collapsed | ✅ covered |
| Angular | `titleWrap` / `subtitleWrap`                                   | truncates the title and subtitle unless titleWrap/subtitleWrap are set                | ✅ covered |
| Angular | `titleId`, `headingLevel`, toggle described by the title       | uses titleId for the heading and sets aria-level from headingLevel                    | ✅ covered |
| Angular | Subtitle heading only with `subtitleHeadingLevel`              | gives the subtitle a heading role only with subtitleHeadingLevel                      | ✅ covered |
| Angular | Size from width, `autoResponsive` false                        | derives the size from the width and honours size when autoResponsive is false         | ✅ covered |
| Angular | Layout actions squash below 1280px                             | moves the layout actions into the breadcrumb row below 1280px                         | ✅ covered |
| Angular | Custom title and subtitle templates get the collapsed state    | passes the collapsed state to custom title and subtitle templates                     | ✅ covered |
| Angular | Message strip in the header does not toggle                    | renders a message strip in the header; clicking it does not toggle the header         | ✅ covered |
| Angular | Pin button pressed state and label                             | pin button toggles its pressed state and label                                        | ✅ covered |
| Angular | Collapse button labels, `collapsed` model both ways            | collapse button switches between Collapse and Expand Header and updates collapsed     | ✅ covered |
| Angular | Fills the viewport minus `offset`                              | fills the viewport below its top, minus offset (also `refreshSize()`)                 | ✅ covered |
| —       | Generated title id                                             | generates a title id when none is given                                               | ✅ covered |
| —       | `onSizeChange`                                                 | reports the size with onSizeChange                                                    | ✅ covered |
| —       | `defaultCollapsed`                                             | starts collapsed with defaultCollapsed                                                | ✅ covered |
| —       | Not collapsible: no toggle, no buttons, header shadow          | has no header toggle or collapse buttons when the subheader is not collapsible        | ✅ covered |
| —       | Facet while collapsed, snapped title size                      | shows the facet before the title only while collapsed                                 | ✅ covered |
| —       | Slots, `<footer>`, floating footer offset, no shadow with tabs | places the parts in their slots and the footer in a footer element                    | ✅ covered |
| —       | `list` and `transparent` backgrounds                           | uses the list and transparent backgrounds                                             | ✅ covered |
| —       | Prop spreading                                                 | passes className, native props and the ref to every part                              | ✅ covered |
| —       | `actionsRef.toggleCollapse()`                                  | toggleCollapse() collapses and expands the header                                     | ✅ covered |

### Visual comparison

`pnpm visual dynamic-page`: 21 cases × 16 combinations, 336/336 matching. The dynamic page is a layout in
fundamental-styles (`sap-design-layouts-dynamic-page--*`). `OtherNavigation` is aligned with its Desktop example
(fundamental-styles' texts, extra large, pinnable header with text) and `CollapsedHeader` with its Collapsed Header
example. Cases, from `OtherNavigation` against Desktop: the title area at rest and hovered, the header content region,
the visibility bar under it and the content by computed style (they are as wide as the page, whose container differs,
and the layout actions sit next to the breadcrumb below 1280px, see below); the title, the key information, the
subtitle, a layout action, the header button group, the start and end gradient lines, the collapse button (at rest,
hovered, focused) and the pin button (at rest, hovered) by pixels. From `CollapsedHeader` against Collapsed Header: the
collapsed title area and visibility bar by computed style, the collapsed (snapped) title and the expand button by
pixels.

| Difference                                                                               | Cause                                                                                                   | Resolution                                                                                                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Compact collapse, expand and pin buttons 32×26px instead of 24×24px                      | Angular's `h-6 w-6 min-w-6 p-0` loses to the button's `compact:` height, padding and minimum width      | Fixed: `compact:h-6 compact:max-h-6 compact:w-6 compact:min-w-6 compact:px-0`. An Angular issue (same classes).     |
| Collapse, expand and pin buttons on `--sapButton_Background` (`#1c242c` in Horizon Dark) | fundamental-styles sets the button background to `--sapObjectHeader_Background` (`#1d232a`)             | Fixed: `bg-sap-object-header-background` on the buttons (hover and pressed colours unchanged). An Angular issue.    |
| Gradient lines interpolated in oklab                                                     | Tailwind's `bg-linear-to-*` adds `in oklab`; fundamental-styles' `linear-gradient` interpolates in sRGB | Fixed: `[background-image:linear-gradient(…)]` on `--sapObjectHeader_BorderColor`. Computed only; an Angular issue. |
| Title area (and its texts) with `cursor: pointer` at rest                                | Angular's `cursor-pointer`; fundamental-styles sets the pointer on `:hover` only                        | Fixed: `hover:cursor-pointer`. Not visible (a cursor shows only on hover); an Angular issue, computed only.         |

Not compared: the title row with the layout actions. Below 1280px of page width (the 1248px of both Storybooks) the
layout actions move up next to the breadcrumb, Angular's (and fundamental-ngx's) behaviour; fundamental-styles' Desktop
keeps them next to the title, its Tablet example shows the moved row. The global actions are plain buttons here
(Angular's stories); fundamental-styles' are a transparent toolbar with a separator. The facets are compared in their
own report ([facets](facets.md)).

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: `Default`, `Tabs`, `Collapsed`, `Small` (also at 600px)
and `InFlexibleColumnLayout`.
