## split-button

Sources: fundamental-react: none · Angular [`registry/ui/split-button`](../../../angular/registry/ui/split-button/) ·
fundamental-styles
[Split Button](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-buttons-button-split--docs)
Registry: `registry/ui/split-button/`, on the registry's `Button` (two of them) and `Menu` (`Menu`, `MenuTrigger`,
`MenuPopup`, on Base UI's Menu).

API: `SplitButton` takes Angular's inputs: `variant` (both buttons), `glyph` (`slim-arrow-down`) and `glyphFont` of
the arrow, `disabled`, `expandButtonTitle`, `expandButtonAriaLabel` ("More actions"), `aria-label` ("Split button",
Angular's `ariaLabel`), `fixedWidth` (true) and `mainAction` (`{ mainActionTitle, keepMainAction, callback }`).
Angular's `primaryButtonClicked` output is `onPrimaryButtonClick(event)`. The menu items are the children
(`MenuItem`s, also in fragments and with submenus), where Angular projects an `fd-menu`:

```tsx
<SplitButton variant="emphasized" onPrimaryButtonClick={log}>
  <MenuItem onClick={save}>Save</MenuItem>
  <MenuItem onClick={saveAs}>Save as</MenuItem>
</SplitButton>
```

- Angular's `selected` input (a `MenuItem` instance) is `selected`/`defaultSelected`/`onSelectedChange` with the `id`
  of a `MenuItem` (items without an `id` get a generated one, in order). `onSelectedChange` reports a choice from the
  menu.
- Angular's `fd-split-button-action-title` template is `mainAction.mainActionTitle`, which takes any content (a text
  or nodes, e.g. an icon between words).
- The options of the projected `fd-menu` are `menuProps` (any `Menu` prop, e.g. `closeOnOutsideClick`, `placement`,
  `mobile`) and `menuPopupProps` (the menu element: `id`, `aria-label`, `className`, …). Angular's `menu.open()` /
  `close()` are the `open`/`defaultOpen`/`onOpenChange` props.
- Native props, `className` and `ref` go to the root `<div role="group" tabindex="-1">`; `mainButtonClassName` and
  `arrowButtonClassName` style the buttons.

Behaviour and ARIA as Angular: without a `mainAction` the first item is the main action; a chosen item (a click,
Enter or Space, also in a submenu) becomes the main action unless `keepMainAction`, and is marked `selected` in the
menu; the main button shows the item's title (its `label`, the text of its `MenuTitle`, or its text) and calls
`onPrimaryButtonClick`, then the item's `onClick` (with the main button's click event) or `mainAction.callback`.
With `fixedWidth` the main button keeps the width it had before the first choice, and a stretched group (e.g. in a
toolbar's overflow popover) grows the main button so the arrow stays at the end; titles truncate at 8.5rem (9rem
compact). The arrow is the `MenuTrigger`: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` while open, named
by `expandButtonAriaLabel` and titled by `expandButtonTitle` (or the name); click, Enter, Space and ArrowDown open the
menu and focus its first item, Escape closes it and returns the focus to the arrow. It shows the active (pressed)
colours while the menu is open. Focusing the group moves the focus to the arrow. `disabled` disables both buttons and
the menu. The menu is placed below the whole group, at its start, as Angular sets the group as the menu's trigger
element; it is named by `expandButtonAriaLabel` unless `menuPopupProps` names it.

**Differences on purpose:**

- **Alt/Option+ArrowDown** opens the menu from the arrow and from the main button (the Fiori split button
  shortcut); Angular's `keydown.arrowdown` only handles ArrowDown without modifiers, on the arrow.
- `selected` is the `id` of an item instead of an item instance, and is controlled (with `onSelectedChange`) or
  uncontrolled (`defaultSelected`); Angular's `selected` is a linked signal that the next choice overrides. Items are
  read from the children, so `MenuItem`s wrapped in other components are not seen as items.
- The main button calls the item's `onClick` prop; Angular clicks the item element. The menu's `onActivePathChange` in
  `menuProps` is still called.
- The separator also hides while the menu is open, as fundamental-styles' "arrow toggled" example (Angular hides it
  on hover only).
- The pad's inset border is written `before:[box-shadow:…]` (no Tailwind ring layers), as segmented-button.
- `MenuPopup` gained an `anchor` prop (Base UI Positioner `anchor`) for the placement against the group.
