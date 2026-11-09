## action-sheet

Sources: fundamental-react: none · Angular [`registry/ui/action-sheet`](../../../angular/registry/ui/action-sheet/) ·
fundamental-styles
[Action Sheet](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-action-sheet--docs)
Registry: `registry/ui/action-sheet/`, on the `popover` component (Base UI's Popover) on desktop and the `dialog`
component (Base UI's Dialog) in mobile mode, with the `button` and `bar` components.

API: composed parts, as Angular's `fd-action-sheet` with its control, body and items:

```tsx
<ActionSheet mobile={isPhone} controlTitle="Choose an action">
  <ActionSheetControl render={<Button glyph="settings" aria-label="Actions" />} />
  <ActionSheetBody aria-label="Actions">
    <ActionSheetItem label="Download" glyph="download" onClick={download} />
    <ActionSheetItem label="Reject" glyph="cancel" disabled />
    <ActionSheetItem label="Cancel" negative isCloseButton />
  </ActionSheetBody>
</ActionSheet>
```

- `ActionSheet` (no element) holds the state and Angular's inputs: `mobile`, `placement` (`bottom` by default),
  `noArrow` (an arrow by default, as fundamental-styles), `open`/`defaultOpen`/`onOpenChange` (Angular's `isOpen`
  model and `open()`/`close()`/`toggle()`; `details.reason` is Base UI's `trigger-press`, `outside-press`,
  `escape-key`, …, or `item-press` for a close button and `tab-key` for Tab), `controlTitle` and
  `controlTitleHeading` (2 by default). It renders a `Popover`, or with `mobile` a modal `Dialog`.
- `ActionSheetControl` is Angular's `fd-action-sheet-control`, but it is the control itself (a Base UI trigger, as
  `PopoverTrigger`), not a wrapper: `render={<Button … />}` for an SAP button, `nativeButton={false}` for another
  element. It gets `aria-haspopup="menu"` and `aria-expanded` (and `aria-controls` on desktop); click, Enter and
  Space toggle the sheet; native props and `ref` pass through.
- `ActionSheetBody` is Angular's `fd-action-sheet-body`: the `<ul role="menu">` (Angular's `actionSheetBodyId`,
  `ariaLabel` and `ariaLabelledby` are its own `id`, `aria-label` and `aria-labelledby`; native props, `className` and
  `ref` go to it). On desktop it sits in a `PopoverBody` without a role of its own (Angular's `bodyRole` null); in
  mobile mode in a `DialogPopup` at the bottom of the screen, as wide as it, after the title bar. `container` renders
  it into another element; `initialFocus` (Base UI's) changes what gets the focus on opening (the first enabled
  action by default).
- `ActionSheetItem` is Angular's `li[fd-action-sheet-item]`: an `<li role="none">` with a full-width `Button`
  (`role="menuitem"`), with `label`, `glyph`, `glyphFont`, `negative` (centred, negative button), `isCloseButton`,
  `disabled`, `variant` (Angular's `fdType`; `standard` shows as `transparent`) and `toggled`. Native props,
  `className`, `ref` and `onClick` go to the button, `listItemProps` to the `<li>` (as the menu's items).

Behaviour, as Angular: opening focuses the first enabled action; the list is one tab stop (the active action, roving
`tabIndex`); ArrowDown/ArrowUp move to the next/previous enabled action and wrap, Home and End go to the first and
last, disabled actions are skipped; Tab closes the sheet (default prevented) and Escape closes it, and the focus
returns to the control; a close button closes it after its `onClick`; in mobile mode a click on the block layer closes
it and the title is a `role="heading"` with `aria-level`.

**Differences, on purpose:**

- The mobile sheet is a modal Base UI Dialog (`role="dialog"`, `aria-modal`, labelled by the title, or by the list's
  label without a title) instead of Angular's plain fixed overlay: the page behind it is inert and the focus is kept
  in it, which the overlay did not do. The block layer is the dialog's (same classes as Angular's overlay).
- The mobile title bar has no `toolbar` role (Angular: `role="toolbar"` with `aria-label="Actions"`): it holds only
  the heading, no controls.
- Each opening focuses the first enabled action, in the popover too (Angular's popover focused the first tabbable
  element, which after a reopening was the last active action).
- `focusEscapeList` is not ported: Angular declared it but never emitted it. `class` on `fd-action-sheet` (`userClass`)
  was unused in Angular; `ActionSheet` renders no element.
- The popover is not `focusTrapped`: Tab never moves inside the sheet, it closes it.
