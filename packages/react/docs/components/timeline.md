## timeline

Sources: Angular [`registry/ui/timeline`](../../../angular/registry/ui/timeline/) (itself from
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
