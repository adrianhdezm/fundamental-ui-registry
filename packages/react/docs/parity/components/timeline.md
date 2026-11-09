## timeline

Sources: Angular [`registry/ui/timeline`](../../../../angular/registry/ui/timeline/) (itself from
`@fundamental-ngx/core`'s timeline) · no fundamental-react source · no fundamental-styles story (the timeline's styles
are fundamental-ngx's own; the [fundamental-ngx documentation](https://sap.github.io/fundamental-ngx/#/core/timeline)
is the visual reference).
Registry: `registry/ui/timeline/`: `Timeline`, `TimelineNode`, `TimelineNodeHeader`, `TimelineNodeHeaderInfo`,
`TimelineNodeHeaderInfoTitle`, `TimelineNodeHeaderInfoText`, `TimelineNodeHeaderInfoSubtitle`, `TimelineNodeBody`,
`TimelineNodeFooter`. Built on Icon, Skeleton (loading placeholders) and Text (the collapsible post text); the three
header info parts use Base UI's `useRender`. No Base UI primitive applies (a static list).

API:

| Angular                                                                 | React                                                                                                    |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `fd-timeline` `dataSource` (null/undefined: loading)                    | `Timeline` `dataSource` (null/undefined: loading)                                                        |
| `*fdTimelineNodeDef="let node; let i = index"` (one, or one per index)  | `renderNode(item, index)`                                                                                |
| `trackBy(index, item)` (default: the item)                              | `trackBy(index, item)` returning a React key (default: the item's identity, see below)                   |
| `axis` (`vertical`), `layout` (`right`)                                 | `axis` (`vertical`), `layout` (`right`)                                                                  |
| `ariaLabel` (default "Timeline")                                        | `aria-label` (default "Timeline")                                                                        |
| `calculatePositions()` (`exportAs: 'fdTimeline'`)                       | `actionsRef` → `calculatePositions()`                                                                    |
| `fd-timeline-node` `glyph`, `glyphFont`, `ariaLabel`                    | `TimelineNode` `glyph`, `glyphFont`, `aria-label`                                                        |
| `fd-timeline-node-header`, `fd-timeline-node-header-info`               | `TimelineNodeHeader`, `TimelineNodeHeaderInfo` (`<div>`s)                                                |
| `fdTimelineNodeHeaderInfoTitle`, `fdTimelineNodeHeaderInfoText` (attrs) | `TimelineNodeHeaderInfoTitle`, `TimelineNodeHeaderInfoText` (`<span>`; `render` renders another element) |
| `fdTimelineHeaderInfoSubTitle` (attr)                                   | `TimelineNodeHeaderInfoSubtitle` (`<div>`; `render` renders another element)                             |
| `fd-timeline-node-body` `content`, `maxLines`                           | `TimelineNodeBody` `content`, `maxLines`; children follow the text, as Angular's projected content       |
| `fd-timeline-node-footer`                                               | `TimelineNodeFooter`                                                                                     |

Behaviour as Angular: the timeline is a `role="list"` of `role="listitem"` nodes, `aria-busy` while loading. With
`left`/`top` the nodes are in the first list, with `right`/`bottom` in the second, with `double` even indexes go to
the first and odd ones to the second. Without data, three placeholder nodes (a Skeleton header and text lines) show on
the used side. After every render, on a resize of the timeline or of any post (wrapping, More/Less) and on
`calculatePositions()`, the lines are laid out: in a double vertical timeline each node is pushed down to at least
24px below the previous node's marker, then every line runs to 4px before the next marker along the axis (in RTL from
the right), and the last line is hidden. The post arrows point to the line in LTR and RTL.

**Differences on purpose:**

- Templates are a render prop: `renderNode` gets the index, so "one template per index" is a condition in it, and an
  index it returns nothing for renders nothing (as an index without a template in Angular).
- Keys: Angular tracks by the item itself; React keys must be strings, so without `trackBy` each object gets an id of
  its own (a `WeakMap`), and primitives are keyed by value. The same item twice gets two keys.
- The layout also observes each post (Angular observes only the timeline, and relies on the body's More/Less to call
  `calculatePositions()`, which ours still does): a post that resizes on its own, e.g. a More link that appears after
  the first measurement, keeps its lines right.
- The layout clears the line length and the double-layout margins of the other axis when the axis changes (see the
  Angular issue below).
- `fdTimelineHeaderInfoSubTitle` is `TimelineNodeHeaderInfoSubtitle`, named like its siblings.

### Stories vs. sources

| Source  | Example                                 | React story        | Status     | Notes                                    |
| ------- | --------------------------------------- | ------------------ | ---------- | ---------------------------------------- |
| Angular | Vertical, right                         | `Vertical`         | ✅ covered | Icons, footer actions                    |
| Angular | Vertical, left, dots and collapsed text | `VerticalLeft`     | ✅ covered | Dots, `maxLines={2}` with More/Less      |
| Angular | Vertical, double-sided                  | `VerticalDouble`   | ✅ covered |                                          |
| Angular | Horizontal, bottom                      | `Horizontal`       | ✅ covered |                                          |
| Angular | Horizontal, top                         | `HorizontalTop`    | ✅ covered |                                          |
| Angular | Horizontal, double-sided                | `HorizontalDouble` | ✅ covered |                                          |
| Angular | Loading                                 | `Loading`          | ✅ covered | "Load posts" / "Reload" toggles the data |

### Tests vs. sources

| Source  | Behaviour                                          | React test                                                                                | Status     |
| ------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| Angular | Nodes from the data source, one template per index | renders nodes from the data source with renderNode (which gets the index)                 | ✅ covered |
| Angular | Layouts left/right/top/bottom/double               | layout left/right/top/bottom puts all nodes on one side; double alternates by index       | ✅ covered |
| Angular | Connecting lines, LTR and RTL; last hidden         | connecting lines reach the next node along the axis; the last line is hidden              | ✅ covered |
| Angular | Double vertical spacing                            | double vertical layout spaces alternating nodes so each comes after the previous          | ✅ covered |
| Angular | Lines update on More/Less and on resize            | lines update when a post resizes (e.g. More/Less in the body) or the timeline resizes     | ✅ covered |
| Angular | Loading placeholders, aria-busy                    | without data shows three loading placeholders and aria-busy                               | ✅ covered |
| Angular | list/listitem roles, post arrows in LTR and RTL    | role list / listitem; arrows of the posts point to the line in LTR and RTL                | ✅ covered |
| Angular | trackBy keeps the DOM of unchanged items           | with trackBy, replacing the data keeps the DOM nodes of unchanged items                   | ✅ covered |
| Angular | Without trackBy new objects re-render              | without trackBy, new data objects re-render the nodes; the same objects keep them         | ✅ covered |
| Angular | Appending extends the previous line                | appending an item adds a node and extends the previous line                               | ✅ covered |
| —       | `calculatePositions()`                             | calculatePositions (actionsRef) redraws the lines after a post changed its size           | ✅ new     |
| —       | Axis change clears the other axis' layout          | switching the axis clears the line length and the double-layout spacing of the other axis | ✅ new     |
| —       | Header parts, body children, footer                | header parts, body children and footer render their elements with their classes           | ✅ new     |
| —       | Native props, className, ref (registry convention) | passes className, native props and the ref through (timeline and node)                    | ✅ new     |

### Visual comparison

fundamental-styles has no timeline, so the timeline itself was compared by hand with the fundamental-ngx
documentation (Horizon, cozy, LTR; its basic example against our Vertical and Vertical left stories), by computed
style: the timeline, node wrapper and container, icon wrapper, dot, icon, connecting line, post, post arrow, header,
header info, title, text, subtitle, body text and footer actions all match (the dot's 6px, `--sapContent_ForegroundBorderColor`;
the post's 1px `--sapGroup_ContentBorderColor` border, 4px radius, 8px padding and 0 0 20px 16px margin; the 0.8rem
arrow at 16px/-7px rotated -135°; the 22px icon in `--sapContent_NonInteractiveIconColor`; the 0.3rem title gap, the
0.3125rem header info gap and the small label-coloured subtitle). The only differences are not visible: content-box
heights in fundamental-ngx (the same box), `border-style: solid` of zero-width borders (Tailwind preflight), the
rotation written as `rotate` instead of `transform`, and `display` of hosts whose content is a block.

`pnpm visual timeline` then checks the fundamental-styles parts of a post: 5 cases × 16 combinations, 80/80 matching:
the header avatar (circle xs, styles only: other initials) against fundamental-styles' Circle avatar, the post text
(styles only) against its Text, and the More toggle at rest, hovered and focused (pixels and styles) against its
expandable Text. Reviewed by eye in Horizon, cozy and compact, LTR and RTL: all seven stories. Density changes only
the footer buttons, which are compact in every density (as in Angular and fundamental-ngx).

| Difference | Cause | Resolution |
| ---------- | ----- | ---------- |
| None       |       |            |

In RTL the English title and text of a header read "John Licreated" in our story (and Angular's): both are LTR runs,
so the bidi algorithm puts them side by side in LTR order with the title's end margin on the outside. Right-to-left
texts are spaced correctly.

### Angular issues

- Switching `axis` keeps the nodes (same lists) but leaves the inline line length of the old axis (a vertical line's
  `height` stays on what is now a horizontal line, drawing a box) and, from a double vertical layout, the nodes'
  `margin-top`; `layoutLines` only sets the new axis' size and resets margins only for double vertical layouts. Found
  by reading the code, not checked in Angular itself; fixed in React.
