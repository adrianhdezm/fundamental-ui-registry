## inline-help

Sources: Angular [`registry/ui/inline-help`](../../../angular/registry/ui/inline-help/) (`inline-help.ts`, itself
from `@fundamental-ngx/core`'s `fdInlineHelp` directive) · no fundamental-react source (its `FormLabel` only keeps an
`isInlineHelp` layout flag, see form) ·
fundamental-styles has no Inline Help story any more: its popover keeps the
`fd-popover__body--inline-help` modifier (0.75rem padding, `--sapFontSmallSize`), and the body is compared with the
[Popover](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-popover--docs) stories.
Registry: `registry/ui/inline-help/inline-help.tsx`, on Base UI's `Tooltip` (Root, Portal, Positioner, Popup, Arrow)
and `useRender`, with the popover's surface and arrow (`popoverSurfaceVariants`, `popoverArrowClassName`).

API: Angular's directive goes on any element; `InlineHelp` renders its trigger, a focusable question-mark `Icon`
named "Help" by default, or another element with `render` (`render={<Input />}`, `render={<Button />}`). Native props,
`className`, `children` and the `ref` go to the trigger.

| Angular                                | React                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `fdInlineHelp` / `fd-inline-help`      | `content` (a string or any React node; Angular's template)                      |
| host element (`fd-icon`, `input`, ...) | the default icon trigger (`tabIndex={0}`, `aria-label="Help"`), or `render`     |
| `placement` (default `bottom`)         | `placement` (default `bottom`)                                                  |
| `triggers` (hover and focus)           | `triggers`, the popover's format (`['click']`, `{ trigger, openAction, ... }`)  |
| `closeOnOutsideClick` (false)          | `closeOnOutsideClick` (false)                                                   |
| `closeOnEscapeKey` (false)             | `closeOnEscapeKey` (false)                                                      |
| `noArrow` (false)                      | `noArrow` (false)                                                               |
| `fixedPosition`                        | `fixedPosition`                                                                 |
| `disabled`                             | `disabled` (does not open; closes an open help)                                 |
| `additionalBodyClass`                  | `bodyClassName`                                                                 |
| `appendTo`                             | `anchor` (the element the body is placed against); `container` for the portal   |
| `maxWidth`                             | `maxWidth` (px)                                                                 |
| `bodyId`, `bodyRole` (`tooltip`)       | `bodyId`, `bodyRole` (`tooltip`)                                                |
| `open()`, `close()`                    | `open`/`defaultOpen`/`onOpenChange`                                             |
| `aria-describedby` = `<bodyId>-text`   | the same, added after the trigger's own `aria-describedby`                      |
| `closeOnNavigation`                    | — (no router; the help closes when its trigger unmounts)                        |
| `restoreFocusOnClose`                  | — (the help never takes focus, so there is nothing to restore; Angular's no-op) |
| `scrollStrategy`                       | — (Base UI's positioner follows scrolling and resizing)                         |

Behaviour: the help opens on `mouseenter` and `focusin` and closes on `mouseleave` and `focusout` of the trigger;
focus never moves (Angular: `focusTrapped` and `focusAutoCapture` off). Escape and outside presses close it only with
`closeOnEscapeKey` and `closeOnOutsideClick`, as Angular. The body is the SAP popover surface with the arrow and its
stronger shadow, 0.5rem from the trigger, with fundamental-styles' inline help padding (0.75rem) and small font, and
wraps its text.

**Differences, on purpose:**

- **Tooltip, not Popover.** Angular's trigger behaviour is a tooltip's: hover and focus, no focus management, and
  `role="tooltip"`. Base UI's Popover moves focus into its popup and puts focus guards after the trigger while open
  (see form's message group); its Tooltip has no focus management, so focus stays on the trigger and Tab moves on.
  The open state is the component's own, driven by listeners on the trigger for the Angular `triggers` (Base UI's
  Tooltip trigger only knows hover and focus, with delays, and closes on a press); Tooltip's dismiss handles Escape
  and outside presses, cancelled unless enabled.
- The screen reader copy of the text is a **hidden** `<span>` right after the trigger, not an off-screen one inside
  it: `aria-describedby` reads hidden elements, and a hidden copy adds nothing to the name of the trigger (Angular's
  copy inside a `<button fdButton fdInlineHelp>` becomes part of the button's name) or of a `<label>` around it.
  Angular puts it inside the trigger except for void elements (after an `<input>`).
- The default trigger is the question-mark icon with the form label's help icon classes (`inlineHelpIconClassName`:
  content icon colour, pointer cursor, SAP focus outline with a 0.25rem radius) and the name "Help"; Angular's
  stories put `fd-icon` with `tabindex` and `ariaLabel="Help"` on the page themselves, with the inherited colour and
  the browser's focus ring.
- With hover triggers the help closes 100ms after the pointer leaves, and stays open while the pointer is on the
  help (WCAG 1.4.13, hoverable content); Angular closes at once on `mouseleave`.
- A click trigger that toggles keeps a help the same press opened by focusing the trigger (a tap on a touch screen
  focuses, then clicks, which would close the help again in Angular).
- Base UI keeps the arrow 0.5rem from the body corner and on the trigger centre, so a start or end aligned body of
  the 1rem icon goes 8px past the icon edge; Angular's `ICON_BODY_CLASS` aligns the body with the edge and moves the
  arrow 3px off the icon centre (it treats the icon as 1.375rem, fundamental-styles' `--inline-help-icon` size).
