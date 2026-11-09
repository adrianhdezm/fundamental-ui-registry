## micro-process-flow

Sources: Angular [`registry/ui/micro-process-flow`](../../../angular/registry/ui/micro-process-flow/) (itself from
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
