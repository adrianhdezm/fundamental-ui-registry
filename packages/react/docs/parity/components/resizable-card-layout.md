## resizable-card-layout

Sources: fundamental-react: none · Angular [`registry/ui/resizable-card-layout`](../../../../angular/registry/ui/resizable-card-layout/) ·
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

### Stories vs. sources

| Source  | Example         | React story    | Status     | Notes                                                                                            |
| ------- | --------------- | -------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| Angular | Resizable cards | `Default`      | ✅ covered | Six list cards, configured with `config`; a live region with the last resize.                    |
| Angular | Layout config   | `LayoutConfig` | ✅ covered | The same cards with one `layoutConfig` array.                                                    |
| Angular | Item inputs     | `ItemInputs`   | ✅ covered | The item props; each list shows the rows that fit and a counter, updated on `onStepChange`.      |
| —       | —               | `Resizing`     | ➕ added   | "State: resizing": `play` starts a resize (another pointer id), for the axe run and the visuals. |

### Tests vs. sources

| Source  | Behaviour                                        | React test                                                                                                      | Status     |
| ------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------- |
| Angular | Layout size, columns and paddings from the width | layout size from the available width (≤656 sm, ≤975 md, ≤1359 lg, else xl) sets 1–4 columns and paddings        | ✅ covered |
| Angular | Placement by rank, layout height                 | cards are placed by rank at the topmost position where they fit (layout height = highest column + 1rem)         | ✅ covered |
| Angular | Focusable groups named by the title              | cards are focusable groups named by their title                                                                 | ✅ covered |
| Angular | Widths limited to the columns, restored          | card widths are limited to the columns and restored when there is room again (`rerender`)                       | ✅ covered |
| Angular | Edge and corner snap the width                   | dragging the end edge/corner snaps the width to columns once past half a column (emits stepChange, resized)     | ✅ covered |
| Angular | Dashed frame and indication while resizing       | the card shows a dashed frame while resizing and an indication of the next column                               | ✅ covered |
| Angular | Cards at the end of the row move down and back   | growing a card past half a column moves cards at the end of its row down; shrinking back restores their ranks   | ✅ covered |
| Angular | Bottom edge, rows, mini content and mini header  | dragging the bottom edge snaps the height to 1rem rows; below mini content snaps to it, then to the mini header | ✅ covered |
| Angular | `resizable` false                                | resizable=false shows no handles                                                                                | ✅ covered |
| Angular | RTL resizing and placement                       | RTL: horizontal resizing is mirrored and cards are placed from the right (also: cards move down while growing)  | ✅ covered |
| Angular | Arrow keys in rank order                         | arrow keys move focus between cards in rank order                                                               | ✅ covered |
| Angular | `layoutChange`                                   | onLayoutChange emits the configuration (rank, spans) when it changes                                            | ✅ covered |
| Angular | `layoutConfig`                                   | layoutConfig assigns title, rank, spans and resizable to the cards in content order                             | ✅ covered |
| Angular | A one-column card stays one column               | a one-column card dragged left stays one column wide                                                            | ✅ covered |
| Angular | Item inputs                                      | item props (title, rank, cardWidthColSpan, cardHeightRowSpan, resizable) place and size a card like config      | ✅ covered |
| —       | Corner position (the Angular issue)              | (in the end edge/corner test) and the corner sits at the bottom left in RTL                                     | ➕ extra   |
| —       | RTL arrows                                       | swaps ArrowLeft and ArrowRight in RTL                                                                           | ➕ extra   |
| —       | A new span from the props                        | a new span from the props replaces the resized one (`rerender`)                                                 | ➕ extra   |
| —       | Prop spreading, ref (registry convention)        | passes native props, className and ref to the roots                                                             | ➕ extra   |

The resizes dispatch pointer events, as the Angular spec; the Angular host's signals are props changed with
`rerender`.

### Visual comparison

`pnpm visual resizable-card-layout`: 8 cases × 16 combinations, **128/128** matching, by computed style: our Resizable
cards story against fundamental-styles' Resizable Card Layout story for the layout (position, 1rem top margin and
padding at 1280px, `lg` as their `md`), a card's frame (flex row, 20rem minimum), card area (order, flex, position),
end edge (1px, order 2) and bottom edge; our State: resizing story against their Horizontal and Vertical Direction
story for the dashed frame (`indication-border`), the corner (`icon-wrapper`: 24px, bottom -0.35rem, end 0; in RTL
bottom -0.125rem, end -0.25rem) and its icon (`resize-corner`, 1rem SAP-icons in `--sapButton_Lite_TextColor`, turned
in RTL). The cards and so the sizes differ; the corner icon is the same glyph pixel for pixel, but the dashed frame
shows through its box with another dash phase, so it is compared by style.

Fixed while comparing:

| Difference                                        | Cause                                                         | Resolution                                      |
| ------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| RTL corner icon: `transform` none → rotate(90deg) | Tailwind's `rotate-90` sets `rotate`, not `transform`         | Fixed: `rtl:[transform:rotate(90deg)]`.         |
| Corner icon 14–18% of pixels                      | The dashed frame behind it (another dash phase), not the icon | The icon case compares styles only (see above). |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Resizable cards, Item inputs and State: resizing (the
dashed frame, the next-column indication, the corner at the bottom end, the cards at the end of the row moved down).
Density changes the cards' content only; the layout's columns, rows and paddings are fixed sizes, as fundamental-styles.

Angular issues found: the resize corner is as high as the card (`[&>*]:h-full` of the card area also applies to it), so
its glyph sits in the middle of the end edge; in RTL the corner is at the right (`rtl:-start-0`) where
fundamental-styles puts it at the bottom left (-0.25rem); the RTL icon turns with `rotate` instead of `transform`
(computed styles only).
