## menu

Sources: fundamental-react [Menu](https://github.com/SAP/fundamental-react/tree/main/src/Menu) · Angular
[`registry/ui/menu`](../../../angular/registry/ui/menu/) · fundamental-styles
[Menu](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-menu--docs)
Registry: `registry/ui/menu/`, on Base UI's `Menu` (Root, Trigger, Portal, Positioner, Popup, List, Item,
SubmenuRoot, SubmenuTrigger, CheckboxItem, RadioGroup, RadioItem, `createHandle`), with the `popover` surface and
placement helpers, and the `dialog`, `bar`, `button`, `icon` and `input` components for the mobile mode and inputs.

API: composed parts, as the popover:

```tsx
<Menu placement="bottom-start" onActivePathChange={setPath}>
  <MenuTrigger render={<Button menu label="Actions" />} />
  <MenuPopup aria-label="Actions">
    <MenuItem onClick={edit}>Edit</MenuItem>
    <MenuItem submenu={<MenuItem>PDF</MenuItem>}>
      <MenuTitle>Export</MenuTitle>
      <MenuAddon submenuIndicator />
    </MenuItem>
  </MenuPopup>
</Menu>
```

- `Menu` (no element; Base UI Root) holds the state and the options, Angular's `fd-menu` inputs: `open`/`defaultOpen`/
  `onOpenChange` (Angular's `isOpen` model, `beforeOpen` is `onOpenChange(true)`), `placement`, `fixedPosition`,
  `fillControlMode`, `triggers` (click, and `mouseenter`/`mouseleave` for hover), `disabled`, `closeOnEscapeKey`,
  `closeOnOutsideClick`, `focusTrapped` (mobile), `focusAutoCapture`, `restoreFocusOnClose`, `disableScrollbar`,
  `openOnHoverTime`, `closeOnSelect`, `mobile`, `mobileConfig` (`title`, `approveButtonText`, `cancelButtonText`,
  `hasCloseButton`, and `dialogProps` for Angular's `dialogConfig`) and `onActivePathChange` (Angular's `activePath`:
  `{ id, title, submenu }` per open submenu and the last selected item). `handle` (`createMenuHandle()`) connects a
  trigger elsewhere and opens or closes the menu from code (Angular's `open()`, `close()`, `toggle()` and
  `[fdMenuTrigger]` on any element); `actionsRef` closes it.
- `MenuTrigger` (Base UI Trigger) is the control, with `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`;
  click, Enter, Space and ArrowDown open the menu.
- `MenuPopup` is the menu: the popover surface in a portal, a scrolling wrapper, the menu element (`<nav role="menu">`,
  Base UI List) and its `<ul>`. Native props, `id`, `aria-label`/`aria-labelledby`, `className` and `ref` go to the
  menu element (Angular's `id`, `ariaLabel`, `ariaLabelledby`, `role`); `bodyClassName` is Angular's
  `additionalBodyClass`, `listClassName` goes to the `<ul>`, `container` renders the menu and its submenus elsewhere,
  `anchor` places it against another element than the trigger (the split button's group).
- `MenuItem` is Angular's `li[fd-menu-item]` and `[fd-menu-interactive]` in one: an `<li role="none">` with the item
  element (`role="menuitem"`, a `<div>` by default, `<a>` with `href`, any element with `render`). Native props,
  `className`, `ref` and `onClick` (Angular's `onSelect`) go to the item element, `listItemProps` to the `<li>`.
  `disabled`, `hasSeparator`, `selected`, `label` and `submenu` (its items, or a `Submenu` with its own `aria-label`,
  `id` or class) follow Angular; `active`, `addonBefore`, `addonAfter` and `href` (`url`) come from
  fundamental-react. Plain text children become a `MenuTitle`.
- `MenuCheckboxItem` (`checked`/`defaultChecked`/`onCheckedChange`, Angular's `toggle` with `[(checked)]`) and
  `MenuRadioGroup` (`value`/`defaultValue`/`onValueChange`) with `MenuRadioItem` (`value`) are Angular's
  `fdMenuSegmentedButtonHeader`/`Option`: a checkmark or a dot in the icon column, `menuitemcheckbox`/`menuitemradio`
  with `aria-checked`, and the menu stays open.
- `MenuTitle`, `MenuSubtitle` (`truncate`), `MenuContent`, `MenuAddon` (`glyph`, `submenuIndicator`), `MenuShortcut`
  (`hideOnMobile`) and `MenuItemInput` (an `Input` that keeps the menu open and its keys) are Angular's directives.

Keyboard and ARIA as Angular: ArrowUp/ArrowDown move between the enabled items without wrapping (disabled items are
skipped and get `tabindex="-1"` and `aria-disabled`), Home/End go to the first and last enabled item, ArrowRight opens
a submenu and focuses its first item, ArrowLeft closes it (mirrored in RTL through Base UI's `DirectionProvider`),
Enter and Space activate, Escape closes the whole menu (also from a submenu) and returns the focus to the trigger, Tab
closes a desktop menu. Items carry `aria-posinset`/`aria-setsize`; submenu parents `aria-haspopup`, `aria-expanded`
and `aria-controls`, except in mobile mode. A menu opened by click focuses its first enabled item.

fundamental-react: `Menu` is the `<nav>` (now `MenuPopup`), `Menu.List` its `<ul>` (`listClassName`), `Menu.Item` is
`MenuItem` with `url` → `href`, `urlProps` → the item's own props, `addonProps` → a `MenuAddon` child, `separator` →
`hasSeparator`, `isLink` is not needed.

**Differences, on purpose:**

- Base UI owns the popup: placement, flipping, outside press, focus return, typeahead (typing a letter moves to the
  next item starting with it: not in Angular) and hover intent. Its list navigation would move onto disabled items
  and wrap, so the menu element handles ArrowUp/ArrowDown/Home/End itself, as Angular.
- Hovering an item does not move the focus (Base UI `highlightItemOnHover={false}`), as in Angular, so the focus frame
  only follows the keyboard.
- Submenus are Base UI popups at the inline end of their parent item, 0.25rem into it and 0.25rem below its top (the
  place of Angular's inline `<ul>`), in the same portal as the menu; Angular forced `disableScrollbar` for them,
  which is not needed. A submenu is labelled by its parent item (`aria-labelledby`) unless it has an `aria-label`.
- Base UI's `modal` is off: the page stays usable while the menu is open, as in Angular.
- Mobile mode renders the `dialog` component instead of Base UI's popup: the items are plain elements with the same
  roles, classes and keys (no Base UI Menu outside its popup), the submenu levels render into the dialog body one at
  a time, and the trigger toggles the dialog.
- `config` (all popover options at once) is not ported: props spread does the same. A single-choice group is a
  `role="group"` list after its header item (Angular kept header and options flat); name it with
  `aria-labelledby`. The group compares values with `Object.is` (Angular's `valueComparator` is not ported).
- Angular's `refreshPosition()` is not needed: Base UI repositions on trigger resize and scroll.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                      | Cause                                                                                       | Resolution                                                                  |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Surface and submenu list background (fundamental-styles' lists are transparent) | The menu sits in the popover surface, the submenu list has the list background (as Angular) | Kept: the items cover it, not visible; the cases ignore `background-color`. |
| Addons as tall as the item (43px instead of 16px)                               | `self-stretch` on the icon column (as Angular), the icon centred in it                      | Kept: same place of the icon; the icons themselves are compared.            |
| Icons 16px wide instead of the glyph width (12–14px)                            | The `icon` component's 1em box                                                              | Kept: centred in the same column, not visible.                              |
| Dot inherits the 16px font size and icon colour                                 | It is an empty element in the icon column                                                   | Kept: no text, not visible.                                                 |
