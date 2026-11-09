## micro-process-flow

Sources: Angular [`registry/ui/micro-process-flow`](../../../../angular/registry/ui/micro-process-flow/) (itself from
`@fundamental-ngx/core`'s micro process flow) · no fundamental-react source · fundamental-styles
[Micro Process Flow](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-micro-process-flow--docs).
Registry: `registry/ui/micro-process-flow/`: `MicroProcessFlow`, `MicroProcessFlowItem`, `MicroProcessFlowIcon`,
`MicroProcessFlowFocusableItem`, `MicroProcessFlowIntermediaryItem`. Built on Icon; the focusable and intermediary
items and the icon use Base UI's `useRender`. Base UI has no primitive for a scrolling row with a roving tab stop, so
the keyboard handling is Angular's.

API:

| Angular                                                             | React                                                                                    |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `fd-micro-process-flow` `independentSteps`                          | `MicroProcessFlow` `independentSteps`                                                    |
| `transitionSpeed` (300), `transitionTimingFunction` (`ease`)        | `transitionSpeed` (300), `transitionTimingFunction` (`ease`)                             |
| `previousLabel`, `nextLabel` ("previous steps", "next steps")       | `previousLabel`, `nextLabel` (same defaults)                                             |
| `goNext()`, `goBack()` (public)                                     | — (the links; see below)                                                                 |
| `fd-micro-process-flow-item` `state`, `intermediate`                | `MicroProcessFlowItem` `state`, `intermediate`                                           |
| `[fdMicroProcessFlowIntermediaryItem]` projected into the connector | a `MicroProcessFlowIntermediaryItem` child (a `<span>`; `render` renders e.g. an `Icon`) |
| `fd-micro-process-flow-icon` `glyph`, `font`, `ariaLabel`           | `MicroProcessFlowIcon` `glyph`, `font`, `glyphAriaLabel` (the inner icon's name)         |
| `[fdMicroProcessFlowFocusableItem]` on the icon                     | `MicroProcessFlowIcon` `focusable`                                                       |
| `[fdMicroProcessFlowFocusableItem]` on another element              | `MicroProcessFlowFocusableItem` (a `<div>`; `render` renders e.g. a `StatusIndicator`)   |

Behaviour as Angular: the steps are measured after rendering and on a resize of the row; the steps that fit from the
first one in view are shown, the others are reached with the "previous" link (the number of steps scrolled out,
"N previous steps") and the "next" link ("N next steps"), `role="button"` spans that move by one step on click,
Enter and Space, without scrolling past the last full row. The row slides with a `translateX` transition
(`transitionSpeed`, `transitionTimingFunction`), mirrored in RTL. Only the focusable elements of the steps in view are
in the tab order, and none while the focus is in the flow, so the flow is one tab stop; Left and Right (mirrored in
RTL) move the focus between the steps and scroll as little as needed to show the step. New steps start the row at
the first step again. The last step has no connector; independent steps hide the connector lines; an intermediate
connector shows the 4px negative mark. The state colours (and their hover and active values, `hc:` icon colours) and
the cozy and compact sizes are Angular's custom properties.

**Differences on purpose:**

- Angular projects intermediary items into the connector by selector; React takes the `MicroProcessFlowIntermediaryItem`
  children of a step (by component type) and renders them in the connector, the other children as the content.
- `ariaLabel` of the icon is `glyphAriaLabel`, as in other ports, because `aria-label` names the circle itself (e.g.
  the popover trigger of the popover story, Angular's `[attr.aria-label]`).
- `focusable` on `MicroProcessFlowIcon` stands for Angular's directive on the icon, so the common case needs no
  `render`; `MicroProcessFlowFocusableItem` stays for other elements.
- The tab order is rendered from the flow's state (context) instead of being set imperatively on the host; the
  focusable item's `tabIndex` wins over the one of a component it renders (e.g. a popover trigger), as Angular's
  imperative attribute did.
- Angular's public `goNext()`/`goBack()` and the `focusedItem` signal have no React counterpart: nothing outside the
  links and the keyboard used them.

### Stories vs. sources

| Source  | Example                        | React story     | Status     | Notes                                                                                         |
| ------- | ------------------------------ | --------------- | ---------- | --------------------------------------------------------------------------------------------- |
| Angular | Basic                          | `Basic`         | ✅ covered | States with an intermediate step, independent steps, objects between the steps, custom widths |
| Angular | Overflow                       | `Overflow`      | ✅ covered | Default and custom transition, 14 steps                                                       |
| Angular | Status indicators and popovers | `OtherControls` | ✅ covered | StatusIndicator through `MicroProcessFlowFocusableItem`; Popover with the icon as its trigger |
| Angular | Open: popover                  | `OpenPopover`   | ✅ covered | `play` opens the first step's popover                                                         |

### Tests vs. sources

| Source  | Behaviour                                                                     | React test                                                                | Status     |
| ------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------- |
| Angular | Connectors, not after the last; intermediate; independent                     | joins the steps with connectors, but not after the last                   | ✅ covered |
| Angular | One tab stop; Left and Right                                                  | is one tab stop; Left and Right move between the steps                    | ✅ covered |
| Angular | Hidden step counts, scrolling with the links                                  | shows how many steps are hidden and scrolls to them                       | ✅ covered |
| Angular | Arrow keys scroll a step into view                                            | scrolls a step into view when the arrow keys reach it                     | ✅ covered |
| Angular | Glyph in the given icon font; no glyph, no icon                               | renders the glyph in the given icon font                                  | ✅ covered |
| —       | RTL arrow keys                                                                | mirrors Left and Right in RTL                                             | ✅ new     |
| —       | Links with Enter and Space                                                    | the overflow links work with Enter and Space                              | ✅ new     |
| —       | New steps start at the first                                                  | starts again at the first step when the steps change                      | ✅ new     |
| —       | Focusable item on any element; a step outside a flow                          | the focusable item makes any element of a step the focus target           | ✅ new     |
| —       | State colours                                                                 | state colours the icon of a step                                          | ✅ new     |
| —       | Native props, className, ref (registry convention)                            | passes className, native props and the ref through                        | ✅ new     |
| React   | A step that gets wider (the icon font loading, new content) is measured again | measures again when a step gets wider, e.g. once the icon font has loaded | ✅ covered |

### Visual comparison

`pnpm visual micro-process-flow`: 20 cases × 16 combinations, 320/320 matching (first run 0/320, two causes, both
fixed). Our first Basic flow is fundamental-styles' default story (the same five states and glyphs, the second
connector intermediate), so it is compared by pixels and styles: the whole flow, each step and each icon at rest
(none, positive, information, negative, critical), the four coloured icons hovered, a focused icon, a connector and
the intermediate connector; the independent-steps flow against fundamental-styles' Independent steps story; and the
next link of the Overflow story against fundamental-styles' (styles only: other counts).

| Difference                                                                   | Cause                                                                                    | Resolution                             |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| Every element: `line-height` 21px instead of `normal` (all 320; not visible) | Angular's root sets `leading-(--sapContent_LineHeight)`; fundamental-styles has `normal` | Fixed: `leading-[normal]` on the root. |
| Icons: radius computes to 3.35544e+07px instead of 50% (not visible)         | `rounded-full`, as Angular                                                               | Fixed: `rounded-[50%]`.                |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Basic, Overflow, Status indicators and popovers, and
Open: popover. The row, the links and the slide are mirrored in RTL; compact shrinks the steps, connectors and icons.
With English labels in RTL nothing else changes. Custom widths overflow the 9-step maximum width at 8 + 4 + 10 + 10

- 10rem, so the last steps are reached with the next link, as in Angular.

### Angular issues

- The root's `leading-(--sapContent_LineHeight)` gives every part a 21px line height where fundamental-styles has
  `normal` (computed styles only).
- The icon's `rounded-full` computes to 3.35544e+07px instead of 50% (computed styles only; the same cause as the
  avatar issue).
