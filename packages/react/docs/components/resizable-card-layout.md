## resizable-card-layout

Sources: fundamental-react: none · Angular [`registry/ui/resizable-card-layout`](../../../angular/registry/ui/resizable-card-layout/) ·
fundamental-styles [Resizable Card Layout](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-layouts-resizable-card-layout--docs)
Registry: `registry/ui/resizable-card-layout/`, React and the DOM only (no Base UI part fits), with the registry's
`Icon` glyph map for the corner (`resize-corner`). Resizing uses pointer events, as Angular (no CDK there either). The
stories use the registry's `Card` and `List`.

API: Angular's two components, composed the same way:

```tsx
<ResizableCardLayout onLayoutChange={save}>
  <ResizableCardItem
    key="sales"
    title="Sales"
    cardWidthColSpan={2}
    cardHeightRowSpan={20}
    cardMiniHeaderRowSpan={5}
    cardMiniContentRowSpan={10}
  >
    <Card>...</Card>
  </ResizableCardItem>
</ResizableCardLayout>
```

- **`ResizableCardLayout`** (`fd-resizable-card-layout`): `layoutConfig`; the outputs `stepChange`, `resizing`,
  `resized`, `miniHeaderReached`, `miniContentReached` and `layoutChange` are `onStepChange`, `onResizing`,
  `onResized`, `onMiniHeaderReached`, `onMiniContentReached` and `onLayoutChange`. Native props, `className` and `ref`
  go to the root. Angular's public `updateLayout()` and `arrangeCards()` are n/a: the layout places the cards on every
  change.
- **`ResizableCardItem`** (`fd-resizable-card-item`): `config`, `title`, `rank`, `cardWidthColSpan` (1),
  `cardHeightRowSpan`, `cardMiniHeaderRowSpan`, `cardMiniContentRowSpan`, `resizable` (true), `id` (default
  `fd-card-item-…`), and `onResizing`, `onResized`, `onMiniHeaderReached`, `onMiniContentReached`. Native props,
  `className` and `ref` go to the card's element. As Angular, `config` wins over the layout's `layoutConfig` entry,
  which wins over the props; a rank or span that changes resets what resizing changed (Angular's `linkedSignal`).
- **`ResizedEvent`** is Angular's, with `card` the card's state (`key`, `title`, `rank`, the spans, `resizable`)
  instead of the item component; the constants (`horizontalResizeStep` …) and types are exported as in Angular.

Behaviour, as Angular: the layout size comes from the width of the layout's container (or the window): up to 656px
`sm` (1 column, 0.5rem padding), 975px `md` (2, 1rem), 1359px `lg` (3, 1rem), else `xl` (4, 3rem); the layout is as
wide as its columns and as high as its highest column plus 1rem. Cards are placed by rank, each at the topmost
position where it fits (Angular's placement, line for line), and animate to it; card widths are limited to the
columns and restored when there is room. Each card is a `group` named by its `title` with `tabindex="0"`; the arrow
keys move the focus in rank order with wrap (Left and Right swapped in RTL). A resizable card has a 1px end edge
(horizontal), a 1px bottom edge (vertical) and, on hover or while resizing, the corner icon (both). While resizing, the
card has a 2px dashed `--sapContent_DragAndDropActiveColor` frame, sits above the others, and an indication shows the
width missing to the next column once it is past half a column. On release the width snaps to whole columns once it
changed by more than half a column, and the height to 1rem rows; shrinking below mini header + mini content snaps to
that height, shrinking further to the mini header, and growing from there back to the mini content height (with
`onMiniContentReached` / `onMiniHeaderReached`). Growing a card into the next column moves the cards at the end of its
row down, and shrinking back restores their ranks; `onStepChange` reports each of these steps and every row passed.

**Differences from Angular, on purpose:**

- The corner sits at the bottom end corner of the card, 24px square, at the bottom left in RTL (fundamental-styles'
  `icon-wrapper`). In Angular, the card area's `[&>*]:h-full` also makes the corner as high as the card (its glyph in
  the middle of the end edge, the resize cursor along the whole edge), and in RTL its `rtl:-start-0` puts it on the
  right; here the card-area rules skip the corner and RTL sets the end inset to -0.25rem.
- The RTL corner icon is turned with `transform: rotate(90deg)` as fundamental-styles (Angular's `rotate-90` sets the
  `rotate` property; the same picture).
- Growing and shrinking are told by the card's width (`CardState` 1 wider, -1 narrower). Angular takes the pointer
  direction, which is the other way round in RTL, so there the cards at the end of the row never move down while a
  card grows.
- `onStepChange` during a horizontal resize fires only when cards move: the height span before a resize starts as the
  current one (Angular starts it at 0 for every gesture, so every horizontal move also reports a step).
- `onLayoutChange` is called when the configuration changes (once on mount), not on every placement with the same
  configuration.
- A cancelled pointer (`pointercancel`) ends the resize like a release; only the pointer that started a resize moves
  it. The arrow keys use the current ranks (Angular's key manager keeps the ranks of the last content change).
