## popover

Sources: fundamental-react [Popover](https://github.com/SAP/fundamental-react/tree/main/src/Popover) · Angular
[`registry/ui/popover`](../../../angular/registry/ui/popover/) (`popover.ts`, `popover-position.ts`) ·
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                      | Cause                                                                                                       | Resolution                                                         |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Resize handle below the trigger, LTR: 6–8% of pixels (8 combos) | fundamental-styles' body is 84.70px wide (menu text), so its handle sits at x.70 and anti-aliases 0.7px off | Kept: same glyph, size, colour and corner; sub-pixel, not visible. |
