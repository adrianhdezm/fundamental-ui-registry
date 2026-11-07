## popover

Sources: fundamental-react [Popover](https://github.com/SAP/fundamental-react/tree/main/src/Popover) · Angular
[`registry/ui/popover`](../../../../angular/registry/ui/popover/) (`popover.ts`, `popover-position.ts`) ·
fundamental-styles [Popover](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-popover--docs)
Registry: `registry/ui/popover/` (`popover.tsx`, `popover-position.ts`), on Base UI's `Popover` (Root, Trigger,
Portal, Backdrop, Positioner, Popup, Arrow, Title, Close).

API: composed parts instead of Angular's `fd-popover` / `fd-popover-control` / `fd-popover-body`:

```tsx
<Popover placement="bottom-start" noArrow={false}>
  <PopoverTrigger render={<Button label="Details" />} />
  <PopoverBody aria-label="Details" minWidth="25rem">
    <PopoverBodyHeader>…</PopoverBodyHeader>
    <div className="p-4">Content</div>
    <PopoverBodyFooter>…</PopoverBodyFooter>
  </PopoverBody>
</Popover>
```

- `Popover` (no element; Base UI Root) holds the state and the options: `open`/`defaultOpen`/`onOpenChange`
  (Angular's `isOpen` model), `placement` (12 placements, `bottom-start` by default), `sideOffset`, `alignOffset`,
  `fixedPosition`, `anchor` (Angular's `appendTo`), `collisionBoundary` (fundamental-react's `flipContainer`),
  `triggers`, `disabled`, `noArrow` (true by default, as fundamental-ngx), `closeOnOutsideClick`, `closeOnEscapeKey`,
  `focusTrapped`, `focusAutoCapture`, `restoreFocusOnClose`, `fillControlMode`, `maxWidth`, `disableScrollbar`,
  `resizable`, `applyOverlay`, `handle`, `actionsRef`, and fundamental-react's `onClickOutside` and `onEscapeKey`.
- `PopoverTrigger` (Base UI Trigger) is the control itself, with `aria-haspopup`, `aria-expanded` and
  `aria-controls`; `render={<Button … />}` for an SAP button, `nativeButton={false}` for any other element (it becomes
  tabbable, `role="button"`, opens with Enter and Space: Angular's "a non-focusable control becomes tabbable").
  Alt+ArrowDown opens. With `handle` it works outside its popover (Angular's `fdPopoverTrigger`).
- `PopoverBody` (Portal + Positioner + Popup) is the surface: `role="dialog"` by default, native props, `className`
  (Angular's `additionalBodyClass`), `ref`, `minWidth`/`maxWidth`/`minHeight`/`maxHeight`, `initialFocus`/`finalFocus`
  (Angular's `cdkFocusRegionStart`), `container` and `keepMounted`. Angular's `bodyRole`, `bodyAriaLabel`,
  `bodyAriaLabelledBy` and `bodyId` are the body's own `role`, `aria-label`, `aria-labelledby` and `id`.
- `PopoverBodyHeader` / `PopoverBodyFooter`: the sticky header and footer (`render` for `<header>`/`<footer>`);
  `PopoverTitle` labels the body (`aria-labelledby`); `PopoverClose` closes it (Angular's `popover.close()` from a
  button in the body).
- For other popups (menu, select, combobox, date picker): `popoverSurfaceVariants` (surface, shadow with or without
  arrow), `popoverArrowClassName` / `PopoverArrow` (the two-triangle arrow, keyed on Base UI's `data-side`),
  `getPlacement(placement)` → `{ side, align }`, `toPlacement`, `arrowEdge`, `normalizeTriggers`,
  `createPopoverHandle`.

`popover-position.ts` keeps Angular's `Placement`, `PopoverFillMode`, `TriggerConfig` and `normalizeTriggers`; the CDK
helpers (`getCdkPlacement`, `withFallbackPositions`, `arrowFor`) become `getPlacement`, `toPlacement` and `arrowEdge`,
because Base UI places the body (flip to the other side, shift along it) and the arrow (pointing at the trigger centre)
itself. RTL: `top`/`bottom` placements align `start`/`end` with the reading direction, `left`/`right` stay physical, as
in Angular.

fundamental-react: `body` and `control` are children (`PopoverBody`, `PopoverTrigger`); `placement` is the same
(an array of fallbacks is not supported: Base UI flips to the opposite side); `disableEdgeDetection` is
`fixedPosition`; `flipContainer` is `collisionBoundary`; `widthSizingType` `matchTarget`/`minTarget`/`none` is
`fillControlMode` `equal`/`at-least`/`fit-content` (`maxTarget` has no Angular equivalent; `maxWidth` caps the width);
`type` is `aria-haspopup` on the trigger; `show` is `open`; `disableTriggerOnClick` is `triggers={[]}`;
`popperProps`/`popperClassName` are the body's props; `disableKeyPressHandler`, `useArrowKeyNavigation`,
`firstFocusIndex` (use `initialFocus`) and `modalManager` are not needed.

**Differences, on purpose:**

- No wrapper element: `Popover` renders nothing and the trigger is the control itself, so the ARIA attributes are on
  the element that has focus. Native props for the popover go to `PopoverBody` or `PopoverTrigger`
  (fundamental-react spread them on a `div.fd-popover`).
- `disabled` also disables the trigger (Base UI Trigger); Angular only made the control wrapper inert to the pointer.
- Escape, outside press, nested popovers, scroll tracking and focus return are Base UI's. Leaving the body with Tab
  (with `focusTrapped={false}`) closes it, as Base UI does for non-modal popups; Angular kept it open. A press on a
  focusable element outside closes it through focus leaving the body; `closeOnOutsideClick={false}` keeps it open
  in both cases.
- Focus trap: a Tab handler on the body wraps from the last tabbable element to the first and back (Angular's, without
  focusable anchors in the body). Base UI still renders its own visually hidden, `aria-hidden` focus guards around the
  portal and the trigger to keep the tab order; the a11y run excludes those guards for every story
  (`.storybook/preview.tsx`), so no story turns off a rule. Base UI's `modal` is not used: it would trap focus only
  with a `Popover.Close` in the body and mark the page `aria-hidden`.
- `restoreFocusOnClose` returns focus also when `focusAutoCapture` is off (Angular returned it only with auto capture,
  dropping focus on the page when the user had tabbed into the body).
- `beforeOpen` is `onOpenChange(true)`; it is not called for a change of the controlled `open` prop.
- `setIgnoreTriggers`, `refreshPosition`, `applyNewPosition`, `cdkPositions`, `PopoverContainer`, `scrollStrategy`,
  `closeOnNavigation` and `preventSpaceKeyScroll` are not ported: `triggers={[]}`, Base UI's automatic position
  updates (trigger resize and ancestor scroll), a reactive `placement` with `sideOffset`/`alignOffset`, and the ARIA
  button pattern (Space on a trigger always toggles without scrolling) replace them. Base UI repositions on scroll
  and has no close/block/noop scroll strategies.
- The arrow is a Base UI `Popover.Arrow` element that points at the trigger centre; fundamental-styles and Angular
  draw it on the body with offsets for a button-sized trigger, 1px off its centre. Same triangles, colours and
  gap (0.5rem).
- The resize handle sits in the corner away from the trigger for every placement (the corner per placement of
  fundamental-styles' Resizable story; the left/right `center` placements use the bottom corner), with the
  `resize-corner` glyph.

### Stories vs. sources

| Source            | Example                      | React story           | Status     | Notes                                                                     |
| ----------------- | ---------------------------- | --------------------- | ---------- | ------------------------------------------------------------------------- |
| fundamental-react | placements                   | `Placements`          | ✅ covered | All 12 placements, arrow shown.                                           |
| fundamental-react | disableEdgeDetection         | `FixedPosition`       | ✅ covered | `fixedPosition`.                                                          |
| fundamental-react | withCustomFlipContainer      | `CustomFlipContainer` | ✅ covered | `collisionBoundary`; one placement (no fallback array).                   |
| fundamental-react | noArrow                      | `NoArrow`             | ✅ covered | Icon and avatar triggers; avatar stand-in until avatar.                   |
| fundamental-react | widthSizingTypes             | `FillControlMode`     | 🟡 partial | `matchTarget`/`minTarget`/`none`; `maxTarget` has no equivalent.          |
| fundamental-react | outOfBoundaries              | `ScrollContainer`     | 🟡 partial | Scrolling container instead of a dialog body (dialog not ported).         |
| fundamental-react | dev                          | `Playground`          | ✅ covered | Knobs are the Playground controls.                                        |
| fundamental-react | noStyles                     | —                     | ➖ n/a     | No `cssNamespace`.                                                        |
| Angular           | Simple                       | `Simple`              | ✅ covered | Header/footer bars and avatars are stand-ins until bar and avatar.        |
| Angular           | Placements                   | `Placements`          | ✅ covered |                                                                           |
| Angular           | Programmatic control         | `Programmatic`        | ✅ covered | `open`/`onOpenChange` log instead of `beforeOpen`/`isOpenChange`.         |
| Angular           | Trigger events               | `Triggers`            | ✅ covered | Hover, focus, double click.                                               |
| Angular           | External trigger             | `ExternalTrigger`     | ✅ covered | `createPopoverHandle()`.                                                  |
| Angular           | Fill control mode            | `FillControlMode`     | ✅ covered |                                                                           |
| Angular           | Prevent closing              | `Closing`             | ✅ covered | `PopoverClose` instead of `p.close()`.                                    |
| Angular           | Focus handling               | `Focus`               | 🟡 partial | No `preventSpaceKeyScroll` popover (not ported, see above).               |
| Angular           | Body roles                   | `NonDialog`           | ✅ covered |                                                                           |
| Angular           | Popover inside popover       | `Nested`              | ✅ covered |                                                                           |
| Angular           | Inside a scroll container    | `ScrollContainer`     | ✅ covered | No `PopoverContainer` needed.                                             |
| Angular           | Dynamic content              | `Dynamic`             | ✅ covered |                                                                           |
| Angular           | Text only                    | `Text`                | ✅ covered | Text as the body's children.                                              |
| Angular           | In a dialog                  | —                     | ⬜ missing | After dialog (the behaviour is tested with Base UI's Dialog in the spec). |
| Angular           | Append to                    | `AppendTo` ("Anchor") | ✅ covered | `anchor`.                                                                 |
| Angular           | CDK positions                | `Offsets`             | ✅ covered | The four presets as `placement` + `sideOffset`/`alignOffset`.             |
| Angular           | Scroll strategies            | —                     | ➖ n/a     | CDK scroll strategies; Base UI always repositions.                        |
| Angular           | Dropdown                     | `Dropdown`            | ✅ covered |                                                                           |
| Angular           | Resizable                    | `Resizable`           | ✅ covered |                                                                           |
| Angular           | Open: simple                 | `OpenSimple`          | ✅ covered |                                                                           |
| Angular           | Open: header and footer      | `OpenHeaderFooter`    | ✅ covered |                                                                           |
| Angular           | Open: body roles             | `OpenNonDialog`       | ✅ covered | A region body; Base UI's focus guards are out of the axe run (see above). |
| Angular           | Open: popover inside popover | `OpenNested`          | ✅ covered |                                                                           |
| Angular           | Open: in a dialog            | —                     | ⬜ missing | After dialog.                                                             |
| Angular           | Open: resizable              | `OpenResizable`       | ✅ covered |                                                                           |
| Angular           | Open: dropdown               | `OpenDropdown`        | ✅ covered |                                                                           |
| —                 | Body variants                | `BodyVariants`        | ➕ extra   | Open bodies in the page, the visual reference cases.                      |
| —                 | Open: prevent closing        | `OpenPrevent`         | ➕ extra   | The dimmed page and raised trigger checked by axe.                        |

### Tests vs. sources

| Source            | Behaviour                                                        | React test                                                                                         | Status     |
| ----------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Opens on click into the overlay, labelled dialog body, toggles   | opens on click into a portal with a labelled dialog body                                           | ✅ covered |
| Angular           | Closes on outside click (focus not pulled back)                  | closes on outside click and calls onClickOutside                                                   | ✅ covered |
| Angular           | Closes on Escape, focus back to the trigger                      | closes on Escape, calls onEscapeKey and returns focus to the trigger                               | ✅ covered |
| Angular           | closeOnOutsideClick / closeOnEscapeKey false                     | closeOnOutsideClick=false and closeOnEscapeKey=false keep it open                                  | ✅ covered |
| Angular           | Alt+ArrowDown opens                                              | opens with Alt+ArrowDown on the trigger                                                            | ✅ covered |
| Angular           | Hover triggers                                                   | opens and closes on hover with configured triggers                                                 | ✅ covered |
| Angular           | Disabled does not open                                           | a disabled popover does not open and disables its trigger                                          | ✅ covered |
| Angular           | isOpen two-way binding, beforeOpen                               | controlled open opens and closes; onOpenChange reports user changes; defaultOpen opens on creation | ✅ covered |
| Angular           | Default position, placement, flip, fixedPosition                 | opens below…; follows the placement prop…; flips…; fixedPosition keeps the placement…              | ✅ covered |
| Angular           | RTL: start aligns right, left/right physical                     | follows RTL: start aligns to the right, left/right placements stay physical                        | ✅ covered |
| Angular           | Position helpers                                                 | position helpers: placements, sides and triggers                                                   | ✅ covered |
| Angular           | Arrow off by default, on with gap, at the bottom upwards         | has no arrow by default; noArrow=false draws an arrow…; the arrow moves to the bottom…; start/end  | ✅ covered |
| Angular           | Focus into the body, Tab trapped, no aria-hidden anchors         | moves focus into the body and traps Tab inside it; traps focus without aria-hidden focusable…      | ✅ covered |
| Angular           | focusTrapped / focusAutoCapture / restoreFocusOnClose false      | focusTrapped=false lets Tab leave…; focusAutoCapture=false…; restoreFocusOnClose=false…            | ✅ covered |
| Angular           | fillControlMode at-least, equal (follows trigger), maxWidth, fit | the five fillControlMode tests                                                                     | ✅ covered |
| Angular           | fdPopoverTrigger ARIA, text body, region role                    | a handle opens and closes it from code and connects a trigger outside                              | ✅ covered |
| Angular           | Sticky header and footer while scrolling                         | header and footer stay in place while the body scrolls                                             | ✅ covered |
| Angular           | Body min/max sizes                                               | body minWidth, minHeight, maxWidth and maxHeight size the body                                     | ✅ covered |
| Angular           | additionalBodyClass                                              | className is added to the body and wins over the surface colour                                    | ✅ covered |
| Angular           | Resizable handle                                                 | resizable shows a handle that resizes the body; the handle sits in the corner away…; RTL           | ✅ covered |
| Angular           | disableScrollbar                                                 | disableScrollbar removes the scroll wrapper                                                        | ✅ covered |
| Angular           | bodyRole null, bodyAriaLabelledBy                                | role and aria-labelledby label the body; PopoverTitle labels it too                                | ✅ covered |
| Angular           | Non-focusable control tabbable, Enter/Space                      | a non-button trigger becomes tabbable and opens with Enter and Space                               | ✅ covered |
| Angular           | setIgnoreTriggers                                                | triggers=[] leaves opening to the open prop                                                        | ✅ covered |
| Angular           | Changing the trigger moves the listeners                         | a handle … connects a trigger outside                                                              | ✅ covered |
| Angular           | Closing via focusout does not move focus back                    | opens on focus and closes on focusout without moving focus back                                    | ✅ covered |
| Angular           | config object defaults                                           | —                                                                                                  | ➖ n/a     |
| Angular           | isOpen true on creation                                          | defaultOpen opens the popover on creation                                                          | ✅ covered |
| Angular           | closeOnOutsideClick changed while open                           | changing closeOnOutsideClick while open takes effect                                               | ✅ covered |
| Angular           | Destroying an open popover removes its overlay                   | unmounting an open popover removes its body                                                        | ✅ covered |
| Angular           | applyOverlay only when not dismissible, trigger above            | applyOverlay dims the page only when the popover cannot be dismissed                               | ✅ covered |
| Angular           | cdkPositions, applyNewPosition, refreshPosition                  | sideOffset, alignOffset and anchor move the body; the body follows its trigger when it moves       | ✅ covered |
| Angular           | Outside click on non-focusable element restores focus            | an outside click on a non-focusable element returns focus to the trigger                           | ✅ covered |
| Angular           | Setting isOpen false restores focus                              | setting open to false returns focus to the trigger                                                 | ✅ covered |
| Angular           | Escape inside a dialog closes only the popover                   | Escape inside a dialog closes only the popover (Base UI Dialog)                                    | ✅ covered |
| fundamental-react | disableEdgeDetection passed on, flip container, fallbacks        | fixedPosition keeps the placement even without room                                                | 🟡 partial |
| fundamental-react | Click toggles, outside mousedown and Escape close                | opens on click…; closes on outside click…; closes on Escape…                                       | ✅ covered |
| fundamental-react | Disabled does not open                                           | a disabled popover does not open and disables its trigger                                          | ✅ covered |
| fundamental-react | Prop spreading                                                   | passes native props and the ref to the body and the trigger                                        | ✅ covered |
| fundamental-react | Control tabindex, role, aria-haspopup/expanded/controls          | opens on click into a portal…; a non-button trigger becomes tabbable…                              | ✅ covered |
| fundamental-react | Space/Enter open                                                 | a non-button trigger becomes tabbable and opens with Enter and Space                               | ✅ covered |
| fundamental-react | widthSizingType modifiers                                        | the fillControlMode tests                                                                          | ✅ covered |
| fundamental-react | onClickOutside / onEscapeKey callbacks                           | closes on outside click and calls onClickOutside; closes on Escape, calls onEscapeKey…             | ✅ covered |
| —                 | Other DOM trigger events, nested popovers, initialFocus, Close   | other DOM events…; a popover inside a popover…; initialFocus…; PopoverClose closes…                | ➕ extra   |

The config object is Angular's way to set several inputs at once; in React they are props (spread an object). The
fundamental-react flip tests check Popper modifiers; the fallback-placement array is not supported (Base UI flips to
the opposite side), so only the edge-detection part is covered.

### Visual comparison

`pnpm visual popover`: 8 cases × 16 combinations, 120/128 matching. Cases (from the `BodyVariants` story, open bodies
rendered into the page): the surface without arrow (No arrow story) and with the arrow on each side (Placement story),
by computed style, since fundamental-styles' bodies hold menus (not ported yet) and ours a line of text; the scroll
wrapper by computed style; the resize handle below and above the trigger (Resizable story) by pixels. The arrow is a
pseudo-element in fundamental-styles, so it was compared by its computed styles in a separate script and by eye:
8px outline and 7px fill triangles in `--fdPopover_Border_Color` and the body colour, 8px from the trigger, as
fundamental-styles.

| Difference                                                      | Cause                                                                                                       | Resolution                                                         |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Body `box-shadow` with four extra transparent layers            | `shadow-sap-content-shadow1/2` compose Tailwind's ring and inset shadow variables                           | Fixed: `[box-shadow:var(--sapContent_Shadow1/2)]`. Not visible.    |
| Resize handle font size 14px and line height normal (16px)      | Not set on the handle, only on its glyph (as Angular)                                                       | Fixed: `text-[1rem] leading-4`.                                    |
| Resize handle glyph 3px to the start                            | The glyph is not centred in its 16px box (Angular)                                                          | Fixed: `after:justify-center`.                                     |
| Resize handle in RTL outside the body                           | The flex box starts at the right in RTL, so the rotated glyph ended up outside                              | Fixed: the handle lays out LTR and turns physically to its corner. |
| Resize handle below the trigger, LTR: 6–8% of pixels (8 combos) | fundamental-styles' body is 84.70px wide (menu text), so its handle sits at x.70 and anti-aliases 0.7px off | Kept: same glyph, size, colour and corner; sub-pixel, not visible. |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Body variants, Simple (open header and footer) and
Placements stories.

Angular issues: the resize handle has an empty `data-glyph`, so no glyph shows; and it is always in the bottom-end
corner (top-end above the trigger), also for `left`/`right` placements and `end` alignments, where
fundamental-styles puts it in the corner away from the trigger.
