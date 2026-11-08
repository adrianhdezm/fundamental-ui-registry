## fixed-card-layout

Sources: fundamental-react: none · Angular [`registry/ui/fixed-card-layout`](../../../../angular/registry/ui/fixed-card-layout/) ·
fundamental-styles [Fixed Card Layout](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-layouts-fixed-card-layout--docs)
Registry: `registry/ui/fixed-card-layout/`, React and the DOM only (no Base UI part fits a sortable layout); drag and
drop with pointer events (no library), copying the Angular CDK's behaviour, as `product-switch`. The cards are the
registry's `Card` (stories and tests).

API: Angular's component and its card template, composed the same way:

```tsx
<FixedCardLayout onCardDraggedDropped={save}>
  <FixedCardLayoutCard key="orders" rank={1}>
    <Card>...</Card>
  </FixedCardLayoutCard>
</FixedCardLayout>
```

| Angular                                                      | React                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `fd-fixed-card-layout`                                       | `FixedCardLayout` (native props, `className` and `ref` on the root)                         |
| `disableDragDrop`, `dragStartDelay` (200)                    | `disableDragDrop`, `dragStartDelay` (200)                                                   |
| `cardMinimumWidth` (320, at least 20rem)                     | `cardMinimumWidth` (320, at least 20rem)                                                    |
| `columnsWidthConfig`, `maxColumns` (10)                      | `columnsWidthConfig`, `maxColumns` (10)                                                     |
| `(layoutChange)`                                             | `onLayoutChange({ numberOfColumns, screenSize })`                                           |
| `(cardDraggedDropped)`                                       | `onCardDraggedDropped({ previousIndex, currentIndex, layoutColumns, items })`               |
| `<ng-template [fdCardDef]="rank">` + `fdFixedCardLayoutItem` | `FixedCardLayoutCard` with `rank`: the focusable `group` (native props, `className`, `ref`) |
| `CardDefinition[]` in `items`, `rank()`                      | `{ key, rank }[]`: the card's React `key` (or its position) and its new rank                |
| `focusCard(card)`                                            | n/a: the card's `ref` is the focus target (`ref.current.focus()`)                           |

Behaviour, as Angular: the layout measures its width (a ResizeObserver; not while dragging) and shows as many columns
of `cardMinimumWidth` with 1rem gaps as fit, capped by `maxColumns`, the card count and 10. Cards are placed row by row
(card _i_ in column _i_ % columns) in a wrapping flex column whose height is the highest column plus 4px, measured
again when a card changes height; the DOM order stays the rank order. `columnsWidthConfig` gives the free space to the
columns by their modifiers. A drop or a keyboard move swaps the ranks of two cards; a rank changed this way is kept
until the card's own `rank` changes (Angular's `linkedSignal`). Each card is a `group` with `tabindex="0"` labelled by
the card title inside it (the first heading with an id). Tab reaches every card; the arrow keys alone move the focus
in rank order with wrap (Right and Down forward, Left and Up back; Left and Right swapped in RTL), as the CDK's
`FocusKeyManager`; Alt with an arrow key swaps the card with its neighbour in the next column (Left and Right, in
reading direction) or row (Up and Down) and keeps the focus on it; `disableDragDrop` turns the Alt moves and dragging
off. Dragging, as the CDK: the pointer is held for `dragStartDelay`, then moved 5px (moving earlier cancels the drag);
the card's place is freed (the cards below move up), a preview with fundamental-styles' `card-preview` look (element
radius, `--sapContent_Shadow2`) follows the pointer, and a dashed placeholder (a copy of the card at 30% opacity) goes
above the card under the pointer. The drop swaps the dragged card with that card, except that within a column of two
the upper card dropped on the lower one keeps the order; dropping with no card entered changes nothing. The layout
keeps room for the placeholder while dragging.

**Differences from Angular, on purpose:**

- Drag and drop is written with pointer events instead of the CDK (threshold, start delay, placeholder above the card
  under the pointer, preview, the swap on drop). The card under the pointer is found with `elementFromPoint` on the
  live layout, where the CDK also limits it to the container positions cached when the drag starts. Touch drags are not
  supported: the browser scrolls instead (`pointercancel` ends the drag), where the CDK holds the scroll after the
  delay. The click that ends a drag is swallowed.
- The preview and the placeholder are copies of the card's DOM without ids (the CDK's clone; Angular renders the card
  template again for the placeholder), so the placeholder has no duplicate ids and no focusable content (`inert`).
- The placeholder has a 1rem gap to the card below it. Angular sets that margin from the entered list's first sorted
  item, which during a CDK drag is the dragged card itself, so the margin likely never applies there.
- The preview shadow is the token (`[box-shadow:var(--sapContent_Shadow2)]`); Angular's `shadow-sap-content-shadow2`
  adds Tailwind's transparent ring layers.
- `align-items: center` on the card layout, as fundamental-styles' `fd-fixed-card-layout__card-layout` (Angular
  `flex-start`; no visible difference, every column line is as wide as its cards).
- The arrow keys read the direction (RTL) when pressed; Angular's key manager reads it when the cards change.
- `items` in `onCardDraggedDropped` are `{ key, rank }` objects instead of the card template directives.

### Stories vs. sources

| Source  | Example                   | React story        | Status     | Notes                                                                  |
| ------- | ------------------------- | ------------------ | ---------- | ---------------------------------------------------------------------- |
| Angular | Responsive columns        | `Default`          | ✅ covered | Eight cards, the column count and the last move in a live region.      |
| Angular | At most two columns       | `MaxColumns`       | ✅ covered |                                                                        |
| Angular | Custom column widths      | `ColumnWidths`     | ✅ covered | `{ 1: 2, 2: 1, 3: 1 }` with three columns.                             |
| Angular | Drag and drop disabled    | `DisabledDragDrop` | ✅ covered |                                                                        |
| Angular | Mobile display            | `Mobile`           | ✅ covered | One column in a 22rem container.                                       |
| Angular | Custom card minimum width | `CardMinimumWidth` | ✅ covered | 400px.                                                                 |
| —       | —                         | `Playground`       | ➕ added   | `maxColumns`, `cardMinimumWidth`, `disableDragDrop`, `dragStartDelay`. |

### Tests vs. sources

| Source  | Behaviour                                                 | React test                                                                                                            | Status     |
| ------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------- |
| Angular | `cardMinimumWidth` reduces the columns, never below 20rem | a larger cardMinimumWidth reduces the number of columns (never below 20rem)                                           | ✅ covered |
| Angular | Columns follow the width, `maxColumns`, the card count    | number of columns follows the width (cards at least 20rem, 1rem gaps), capped by maxColumns and the card count        | ✅ covered |
| Angular | Row-by-row placement, 1rem gaps, DOM in rank order        | cards are placed row by row: card i goes to column i % columns, DOM order stays the rank order                        | ✅ covered |
| Angular | Focusable groups labelled by the title                    | cards are focusable groups labelled by their card title                                                               | ✅ covered |
| Angular | Height of the highest column, re-measured                 | container height is the highest column; re-measured when a card changes height                                        | ✅ covered |
| Angular | `columnsWidthConfig`                                      | columnsWidthConfig distributes the free space by the column modifiers                                                 | ✅ covered |
| Angular | Drop swaps ranks, `cardDraggedDropped`                    | dragging a card onto another swaps their ranks and emits onCardDraggedDropped (previous/current index)                | ✅ covered |
| Angular | Cards below the dragged one move up                       | the cards below the dragged one move up, and can be dropped on where they are now                                     | ✅ covered |
| Angular | Column of two: lower onto upper swaps, not the other way  | within a column of two, dragging the lower card onto the upper one swaps them, the other way keeps the order          | ✅ covered |
| Angular | Alt + arrows (RTL), focus kept                            | Alt+Arrow keys swap with the neighbour card (left/right respect RTL, up/down by row) and keep focus on the moved card | ✅ covered |
| Angular | Arrows move the focus with wrap                           | arrow keys without Alt move focus between cards with wrap                                                             | ✅ covered |
| Angular | Tab                                                       | Tab moves into and out of the cards one by one                                                                        | ✅ covered |
| Angular | `disableDragDrop`                                         | disableDragDrop disables pointer and keyboard moves (`rerender`)                                                      | ✅ covered |
| Angular | `layoutChange`                                            | onLayoutChange emits the number of columns and width                                                                  | ✅ covered |
| —       | Placeholder and preview                                   | shows a placeholder above the card under the pointer and a preview that follows it while dragging                     | ➕ extra   |
| —       | RTL arrows                                                | swaps ArrowLeft and ArrowRight in RTL                                                                                 | ➕ extra   |
| —       | `dragStartDelay`                                          | a press shorter than dragStartDelay that moves does not drag                                                          | ➕ extra   |
| —       | `rank` from the cards, a new rank                         | takes ranks from the cards and follows a new rank (`rerender`)                                                        | ➕ extra   |
| —       | Prop spreading, ref (registry convention)                 | passes native props, className and ref to the roots                                                                   | ➕ extra   |

The drags use the real mouse (Chrome DevTools Protocol), as the product-switch spec; the Angular host's inputs are
props changed with `rerender`.

### Visual comparison

`pnpm visual fixed-card-layout`: 5 cases × 16 combinations, **80/80** matching, our Responsive columns story against
fundamental-styles' Fixed Card Layout story (both three columns at 1280px), by computed style without the sizes (the
cards differ, so the column heights): the card layout (wrapping flex column, the -1rem margins), the card places of
the first three columns (order, 20rem minimum, 1rem start and top padding) and the card in its place (the `Card`
itself is compared in the card's cases). The layout draws nothing of its own besides the drag preview and placeholder,
which fundamental-styles' story does not show; they use its `card-preview` (element radius, `--sapContent_Shadow2`) and
`card-placeholder` (2px dashed `--sapContent_DragAndDropActiveColor`, 30% opacity) values.

No differences were found. Taken from fundamental-styles instead of Angular before comparing: `align-items: center`
on the card layout (Angular `flex-start`, which the comparison would report).

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Responsive columns, Custom column widths, and Responsive
columns while dragging (preview, placeholder, the freed place). Density changes nothing in the layout (the cards are
not density-dependent); in RTL the columns run from the right.

Angular issues found: the card layout has `align-items: flex-start` where fundamental-styles has `center` (computed
styles only); the drag preview's `shadow-sap-content-shadow2` adds Tailwind's transparent ring layers (computed styles
only).
