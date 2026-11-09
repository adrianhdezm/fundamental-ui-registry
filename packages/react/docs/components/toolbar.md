## toolbar

Sources: fundamental-react: none · Angular [`registry/ui/toolbar`](../../../angular/registry/ui/toolbar/) ·
fundamental-styles [Toolbar](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-toolbar--docs)
Registry: `registry/ui/toolbar/`, on the registry's `Popover` (Base UI's Popover) for the overflow, `Button` and
`Title`, and Base UI's `useRender` (`ToolbarLabel`).

API: the Angular inputs as props of `Toolbar`: `variant` (Angular's `fdType`: `solid`, `transparent`, `auto`,
`info`), `title`, `titleId`, `headingLevel` (2), `active`, `clearBorder`, `shouldOverflow`, `forceOverflow` and
`moreLabel` ("More"). Angular's `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy` and `ariaOrientation` are the
native `aria-*` props (`aria-orientation` defaults to `horizontal`, `aria-labelledby` to the title's id when there is
a title). Angular's `overflowOpen` model is `overflowOpen` / `defaultOverflowOpen` / `onOverflowOpenChange`, and
`updateCollapsibleItems()` is on `actionsRef`, as the imperative actions of other components (overflow layout, list).
Native props, `className` and `ref` go to the root `<div role="toolbar">`; the id defaults to `fd-toolbar-<useId>`.

Angular's directives become components:

- **`ToolbarItem`** (`fd-toolbar-item`) wraps any control that should overflow: `<ToolbarItem overflowPriority="low">
<Checkbox label="Only mine" /></ToolbarItem>`. Angular's `fdOverflowPriority` and `fdOverflowGroup` are
  `overflowPriority` (`always`, `disappear`, `low`, `high` — the default —, `never`) and `overflowGroup` on every item.
  The first element of the wrapped content is measured, as Angular measures the host element.
- **`ToolbarLabel`** (`fd-toolbar-label`): a `<span>` that overflows, or another element through `render` (e.g.
  `render={<FormLabel htmlFor="…" />}`).
- **`ToolbarOverflowButton`** (`fdToolbarOverflowButton`): a `Button` (all its props) that overflows and stretches,
  start aligned, in the popover.
- **`ToolbarSpacer`** (`width`, `fixed`) and **`ToolbarSeparator`** (`role="separator"`): as Angular. A separator or
  spacer overflows when it is wrapped in a `ToolbarItem`.
- **`ToolbarForceOverflowContext`** is Angular's `FD_TOOLBAR_FORCE_OVERFLOW`: a container (the dynamic page's global
  actions, when ported) provides `true` to move every item of the toolbars inside it into the popover.
- **`toolbarOverflow(items, available, used, force)`**, the overflow algorithm, is exported as in Angular.

Behaviour as Angular: the overflow algorithm is Angular's, unchanged (higher priorities and earlier items stay
longest; a group overflows as a whole; `never` stays, `always` always overflows, `disappear` is hidden in the
popover; the available width leaves room for the "More" button, 36px cozy and 32px compact, its margins and the
separators; the title's width counts). Item widths are measured in a layout effect, so items that do not fit never
paint in the row, and remembered while an item is in the popover. A `ResizeObserver` on the toolbar, its title and
the items recomputes the overflow (also when a hidden toolbar becomes visible). With items in the overflow the
toolbar adds a flexible spacer (when it has none), a separator and the "More" button (transparent, `overflow` glyph,
`aria-haspopup`, named and titled by `moreLabel`) that opens a `Popover` (`bottom-end`) whose body is a dialog named
like the button; the first tabbable item takes the focus when it opens, and Tab wraps inside it. The panel is capped
at 50vh and scrolls; its items keep their height (`shrink-0` on each item's element). The popover closes
when nothing overflows any more. A title renders a `Title` as `<span role="heading" aria-level={headingLevel}>` with
the full text in `title`, truncated with an ellipsis; a `Title` child gives the toolbar the title look too. An
active info toolbar is focusable (`tabIndex=0`) and Enter and Space click it.

**Items move, as in Angular.** Angular moves an item's DOM element into the popover and back, so a control keeps its
state (typed text, a checked box, an open select). The React items render their content through a portal into a
container of their own, and the toolbar moves that container between the item's place in the row (a
`display: contents` anchor) and the popover's panel: React never re-renders the content, so it keeps its state too.

**Differences from Angular, on purpose:**

- Items are wrapped in `ToolbarItem` instead of marked with an attribute; the toolbar finds them through context, so
  they can be nested in other elements, as Angular's `descendants: true`.
- The overflow panel's items are React children of the toolbar, not of the popover body: React events from them do
  not reach the body. The toolbar therefore wraps Tab inside the panel itself (the popover's own focus trap is a
  React handler), and a select or menu opened from the panel is a separate overlay for the popover's outside-press
  check: choosing an option may close the overflow popover, as Angular's (the Angular spec reopens it).
- A `ToolbarLabel` in an info toolbar takes the info bar's text colour (Angular keeps `--sapContent_LabelColor`,
  grey on the active info bar's teal; fundamental-styles' info text is the bar's colour).
- The icons of an active info toolbar keep `--sapList_TextColor`, as fundamental-styles (Angular colours them with
  `--sapInfobar_TextColor`). Icons are matched as `[data-glyph]` (the `Icon` component), Angular's `fd-icon`.
- The focus frame of an active info toolbar is inset by 1px, as fundamental-styles (Angular: 2px).
- Base UI's Toolbar is not used: the toolbar has no arrow key navigation, as Angular and fundamental-styles; each
  control keeps its Tab stop.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                 | Cause                                                                                                                                                                          | Resolution                                                                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active info toolbar: `cursor` pointer against auto         | fundamental-styles leaves the cursor of its clickable info bar as it is                                                                                                        | Kept, as Angular and UI5's active toolbar: the bar is clickable. `cursor` ignored for the active info cases.                                          |
| Title heading: 16px `72-Bold` against 14px bold `72`       | fundamental-styles' Types story does not load the title styles: the heading is the browser's bold `h4` at the toolbar's size; its toolbar CSS sets `--sapGroup_Title_FontSize` | Kept (ours is what its CSS asks for): font family, size, weight and the size of the box ignored for that case, compared by computed style only.       |
| Label: `--sapContent_LabelColor` against `--sapTextColor`  | fundamental-styles' toolbar has plain text there; its overflow labels are `fd-label`s whose styles the story does not load                                                     | Kept, as Angular: a `ToolbarLabel` is a label. `color` ignored for the label cases (and the label element's default `cursor` for the overflow label). |
| Info icons in RTL: 18.8% of pixels (16)                    | The `undo` glyph is mirrored in RTL by the icon component (SAP icon metadata); fundamental-styles' is not                                                                      | Kept: a difference of the icon component, as Fiori mirrors directional glyphs in RTL.                                                                 |
| "More" button, HC Black and HC White compact: 3.4–3.7% (4) | fundamental-styles' story shows its popover open: the body's border and shadow overlap the bottom of its "More" button in compact                                              | Kept: no style difference; the button rows above match.                                                                                               |
| Overflow panel, Horizon and Dark compact: 3.1–3.4% (4)     | The first item of our open popover has the focus frame (it takes the focus when the popover opens), and the labels differ in colour (above); cozy stays within 3%              | Kept: behaviour (Angular's first focus) and the label colour above.                                                                                   |
| Border radius of the overflow panel (ignored)              | The popover's scroll wrapper rounds the corners here; fundamental-styles rounds the first child of the popover body                                                            | Kept: the same corners on screen; the radius properties are ignored for the panel.                                                                    |
