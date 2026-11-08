## inline-help

Sources: Angular [`registry/ui/inline-help`](../../../../angular/registry/ui/inline-help/) (`inline-help.ts`, itself
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

### Stories vs. sources

| Source  | Example                 | React story                         | Status     | Notes                                                                                   |
| ------- | ----------------------- | ----------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| Angular | Placements and states   | `Default` ("Placements and states") | ✅ covered | Same rows: four placements, a long text, an `Input` trigger, disabled, close on Escape. |
| Angular | Open: Inline help       | `OpenDefault`                       | ✅ covered | Focuses the first icon.                                                                 |
| Angular | Template content        | `Template`                          | ✅ covered | A React node with bold text and a list.                                                 |
| Angular | Custom triggers         | `Triggers`                          | ✅ covered | Click on an icon and on a `Button` with `closeOnOutsideClick`.                          |
| Angular | Custom body class       | `Styled`                            | ✅ covered | `bodyClassName="bg-sap-information-background"`.                                        |
| —       | Playground              | `Playground`                        | ➕ extra   | Content, placement, arrow, disabled, Escape and outside click controls.                 |
| —       | Open: template, body bg | `OpenTemplate`, `OpenStyled`        | ➕ extra   | So axe checks the rich and the coloured body.                                           |
| —       | Help bodies             | `Bodies`                            | ➕ extra   | Open bodies in a container (arrow on each side, no arrow) for the visual comparison.    |

### Tests vs. sources

| Source  | Behaviour                                       | React test                                                                                   | Status     |
| ------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------- |
| Angular | Opens on hover, closes when the pointer leaves  | opens on hover and closes when the pointer leaves                                            | ✅ covered |
| Angular | Opens on focus, closes on blur, focus stays     | opens on focus and closes on blur, keeping focus on the trigger                              | ✅ covered |
| Angular | Escape closes with closeOnEscapeKey             | closes on Escape when closeOnEscapeKey is set                                                | ✅ covered |
| Angular | Escape without closeOnEscapeKey                 | stays open on Escape without closeOnEscapeKey                                                | ✅ covered |
| Angular | Disabled does not open                          | a disabled inline help does not open, and disabling an open help closes it                   | ✅ covered |
| Angular | Click trigger toggles                           | custom triggers: click toggles the help                                                      | ✅ covered |
| Angular | aria-describedby and the off-screen copy        | the help text is referenced via aria-describedby with a hidden copy next to the trigger      | ✅ covered |
| Angular | Template content in body and screen reader text | template content renders in the body and in the screen reader text                           | ✅ covered |
| Angular | Placement right and top                         | placement positions the body next to the trigger                                             | ✅ covered |
| Angular | RTL placements                                  | placement follows RTL: start-aligned placements align with the right edge, left/right stay … | ✅ covered |
| Angular | Closes when the trigger is destroyed            | the help closes when the trigger is destroyed                                                | ✅ covered |
| Angular | Escape closes a hover-opened help               | Escape closes a hover-opened help when closeOnEscapeKey is set                               | ✅ covered |
| Angular | Escape leaves a hover-opened help               | Escape leaves a hover-opened help open without closeOnEscapeKey                              | ✅ covered |
| Angular | Arrow; noArrow hides it                         | shows an arrow pointing at the trigger; noArrow hides it                                     | ✅ covered |
| Angular | maxWidth                                        | maxWidth limits the body width                                                               | ✅ covered |
| Angular | appendTo                                        | anchor (appendTo) positions the body against the given element                               | ✅ covered |
| Angular | scrollStrategy                                  | —                                                                                            | ➖ n/a     |
| Angular | Closing never moves focus (restoreFocusOnClose) | closing never moves focus: the help leaves focus where it is                                 | ✅ covered |
| Angular | additionalBodyClass                             | bodyClassName is applied to the body                                                         | ✅ covered |
| —       | Hoverable help                                  | stays open while the pointer moves from the trigger onto the help                            | ➕ extra   |
| —       | Tap: focus then click                           | a press that opens the help by focusing the trigger does not close it again with its click   | ➕ extra   |
| —       | Own aria-describedby                            | keeps the trigger’s own aria-describedby and adds the help text                              | ➕ extra   |
| —       | Button name                                     | the help text adds nothing to the name of a button trigger                                   | ➕ extra   |
| —       | Default placement                               | the default placement is below the trigger, centred                                          | ➕ extra   |
| —       | Outside click                                   | closeOnOutsideClick closes the help on a press outside, not on the trigger; stays open …     | ➕ extra   |
| —       | Padding and font                                | the body has the inline help padding and the small font                                      | ➕ extra   |
| —       | container, bodyRole, controlled open            | container renders the body …; bodyRole changes the role …; controlled: open shows the help … | ➕ extra   |
| —       | Native props, className, ref                    | passes className, native props and the ref to the trigger                                    | ➕ extra   |

`scrollStrategy` is the CDK overlay's; Base UI's positioner has no strategy to swap and follows the trigger itself.

### Visual comparison

`pnpm visual inline-help`: 5 cases × 16 combinations, 80/80 matching. fundamental-styles has no inline help story,
so the open bodies of our Help bodies story (arrow on top, at the bottom, at the start, at the end, and without
arrow) are compared with the popover bodies of its Placement and No Arrow stories by computed style: background,
corner radius, the shadow (`--sapContent_Shadow2` with an arrow, `Shadow1` without), border, colour and font. Their
bodies hold menus, ours a line of text, so sizes and pixels are not compared, and the padding and font size are the
`fd-popover__body--inline-help` modifier's, checked by the spec (12px, `--sapFontSmallSize`). No differences were
found. The arrow is the popover's (compared there).

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Placements and states with the long help open (it wraps
at the viewport and reads right to left in RTL), and Help bodies.

Angular issues: none in the visuals; the off-screen copy inside a button trigger becomes part of the button's name
(`<button fdButton fdInlineHelp>` in Angular's Custom triggers story is named "Click on me, to display inline help
Inline Help Tooltip").
