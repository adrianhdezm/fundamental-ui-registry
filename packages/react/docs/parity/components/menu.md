## menu

Sources: fundamental-react [Menu](https://github.com/SAP/fundamental-react/tree/main/src/Menu) · Angular
[`registry/ui/menu`](../../../../angular/registry/ui/menu/) · fundamental-styles
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

### Stories vs. sources

| Source            | Example                               | React story            | Status     | Notes                                                        |
| ----------------- | ------------------------------------- | ---------------------- | ---------- | ------------------------------------------------------------ |
| fundamental-react | primary                               | `Primary`              | ✅ covered | In a menu with its trigger.                                  |
| fundamental-react | separator                             | `Separator`            | ✅ covered | `hasSeparator`.                                              |
| fundamental-react | states                                | `States`               | ✅ covered | `active`, `selected`, `disabled`.                            |
| fundamental-react | addOns                                | `AddOns`               | ✅ covered | `addonBefore`/`addonAfter`.                                  |
| fundamental-react | noStyles                              | —                      | ➖ n/a     | No `cssNamespace`.                                           |
| Angular           | Menu                                  | `Basic`                | ✅ covered |                                                              |
| Angular           | Icons and shortcuts                   | `Addons`               | ✅ covered |                                                              |
| Angular           | Submenus                              | `Submenus`             | ✅ covered | Shows the active path.                                       |
| Angular           | Submenus from data                    | `Dynamic`              | ✅ covered | Recursive rendering; no `parentSubmenu` needed.              |
| Angular           | Toggle, single-choice group and input | `Extended`             | ✅ covered |                                                              |
| Angular           | Mobile mode                           | `Mobile`               | ✅ covered |                                                              |
| Angular           | Programmatic control                  | `Programmatic`         | ✅ covered | Controlled `open` instead of `open()`/`close()`/`toggle()`.  |
| Angular           | Scrollbar                             | `Scrollbar`            | ✅ covered |                                                              |
| Angular           | Disabled states                       | `Disabled`             | ✅ covered |                                                              |
| Angular           | Placement and triggers                | `PlacementAndTriggers` | ✅ covered | Selects for the placement and the fill mode, as Angular.     |
| Angular           | Open: menu                            | `OpenBasic`            | ✅ covered |                                                              |
| Angular           | Open: icons                           | `OpenIcons`            | ✅ covered |                                                              |
| Angular           | Open: shortcuts                       | `OpenShortcuts`        | ✅ covered |                                                              |
| Angular           | Open: submenus                        | `OpenSubmenus`         | ✅ covered | Milk products › Cheese open, by keyboard.                    |
| Angular           | Open: extended items                  | `OpenExtended`         | ✅ covered |                                                              |
| Angular           | Open: mobile                          | `OpenMobile`           | ✅ covered |                                                              |
| Angular           | Open: scrollbar                       | `OpenScrollbar`        | ✅ covered |                                                              |
| Angular           | Open: placement                       | `OpenPlacement`        | ✅ covered |                                                              |
| —                 | Playground                            | `Playground`           | ➕ extra   | The `Menu` options as controls.                              |
| —                 | Detached trigger                      | `DetachedTrigger`      | ➕ extra   | `createMenuHandle()`, Angular's `[fdMenuTrigger]` elsewhere. |
| —                 | Open: mobile submenu                  | `OpenMobileSubmenu`    | ➕ extra   | The second level of the mobile dialog, checked by axe.       |
| —                 | Variants, Mobile variant              | `Variants`, …          | ➕ extra   | Open menus in the page, the visual reference cases.          |

### Tests vs. sources

| Source            | Behaviour                                                                                                                                                                                                                                 | React test                                                                                | Status     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| Angular           | Opens from the trigger, announced, first item focused, posinset                                                                                                                                                                           | opens from its trigger, announces it and focuses the first item                           | ✅ covered |
| Angular           | Arrow keys skip disabled items, Escape closes                                                                                                                                                                                             | skips disabled items with the arrow keys and closes on Escape                             | ✅ covered |
| Angular           | ArrowRight opens a submenu, ArrowLeft returns, active path                                                                                                                                                                                | opens a submenu with ArrowRight and returns with ArrowLeft                                | ✅ covered |
| Angular           | Plain item selects and closes                                                                                                                                                                                                             | selects a plain item and closes the menu                                                  | ✅ covered |
| Angular           | Toggles and options keep the menu open                                                                                                                                                                                                    | keeps the menu open for toggles and single-choice options                                 | ✅ covered |
| Angular           | Second trigger click closes                                                                                                                                                                                                               | a second trigger click closes the menu                                                    | ✅ covered |
| Angular           | Enter and Space open a submenu                                                                                                                                                                                                            | Enter and Space on a submenu parent open it and focus its first child                     | ✅ covered |
| Angular           | Checkmark and dot                                                                                                                                                                                                                         | shows a check mark on a toggle that is on and a dot on the chosen option                  | ✅ covered |
| Angular           | Disabled menu does not open (click, ArrowDown, mobile)                                                                                                                                                                                    | a disabled menu does not open from its trigger                                            | ✅ covered |
| Angular           | Options from `config`                                                                                                                                                                                                                     | placement, fillControlMode and bodyClassName shape the popup                              | ✅ covered |
| Angular           | open/close/toggle, items only while open, isOpenChange                                                                                                                                                                                    | controlled open renders the items only while open and reports user changes                | ✅ covered |
| Angular           | beforeOpen once per opening, before render                                                                                                                                                                                                | onOpenChange(true) comes once per opening, before the items render                        | ✅ covered |
| Angular           | Home and End, no wrap                                                                                                                                                                                                                     | Home and End focus the first and last enabled items, without wrapping                     | ✅ covered |
| Angular           | Space activates and closes                                                                                                                                                                                                                | Space activates the focused item and closes the menu                                      | ✅ covered |
| Angular           | Clicking a disabled item does nothing                                                                                                                                                                                                     | clicking a disabled item does nothing                                                     | ✅ covered |
| Angular           | Hover opens a submenu after openOnHoverTime, sibling closes it                                                                                                                                                                            | hovering a submenu parent opens it after openOnHoverTime and hovering a sibling closes it | ✅ covered |
| Angular           | Submenu parents announce their submenu except in mobile mode                                                                                                                                                                              | submenu parents announce their submenu except in mobile mode                              | ✅ covered |
| Angular           | Mobile dialog title and buttons                                                                                                                                                                                                           | mobile mode opens a dialog with the mobileConfig title and buttons                        | ✅ covered |
| Angular           | Mobile submenu and back                                                                                                                                                                                                                   | mobile mode navigates into a submenu and back                                             | ✅ covered |
| Angular           | Shortcuts hidden in mobile mode                                                                                                                                                                                                           | hides shortcuts in mobile mode unless hideOnMobile is false                               | ✅ covered |
| Angular           | Addons before and after the title                                                                                                                                                                                                         | renders addons before and after the title                                                 | ✅ covered |
| Angular           | truncate                                                                                                                                                                                                                                  | truncate clips the title and subtitle to one line                                         | ✅ covered |
| Angular           | disableScrollbar                                                                                                                                                                                                                          | disableScrollbar removes the scroll container                                             | ✅ covered |
| Angular           | restoreFocusOnClose=false                                                                                                                                                                                                                 | restoreFocusOnClose=false leaves the focus where it was                                   | ✅ covered |
| fundamental-react | Prop spreading to the menu, list, item, addon and link; ref                                                                                                                                                                               | passes className, native props and the ref to the menu, its item and the item `<li>`      | ✅ covered |
| fundamental-react | `url`, `addonBefore`, `addonAfter`                                                                                                                                                                                                        | url (href), addonBefore and addonAfter render a link with icons                           | ✅ covered |
| —                 | RTL arrows, Tab, outside click and Escape options, Escape in a submenu, focusAutoCapture, hover triggers, menu id, a disabled menu while open, input items, closeOnSelect, selected and separators, href, submenus from data, icon column | one test each                                                                             | ➕ extra   |

### Visual comparison

`pnpm visual menu`: 27 cases × 16 combinations, 432/432 matching. Cases: open menus rendered into the page
(`Variants` and `Mobile variant` stories) against fundamental-styles' Default, List different states, List with
separated items, List with Icon, Extended items (segmented button, toggle button, input), With Submenu and Mobile Mode
stories: the surface, an item and its title, hover, active, selected, selected and hover, disabled and focus states,
a separator, an item of an icon list with its icons, icon column, shortcut and aligned title, a subtitle, the
single-choice header, dot and checkmark, the item input, the expanded submenu parent and its arrow, the submenu list
and a hovered submenu item, and a mobile item and shortcut. Where widths or texts differ (fundamental-styles' lists
fill their containers or hold longer texts), computed styles are compared without pixels.

| Difference                                                                      | Cause                                                                                       | Resolution                                                                                       |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Toggle checkmark and submenu arrow 17px tall (line height `normal`)             | `text-[1rem]` on the `Icon` after its `leading-none`: tailwind-merge drops the line height  | Fixed: the icons keep the icon size (1rem) and its `leading-none`. Angular has the same classes. |
| Mobile shortcut end padding 1rem in compact (fundamental-styles 0.5rem)         | `MOBILE_VARS` sets `--mi-sc-pr` with `!` for every density                                  | Fixed: `compact:[--mi-sc-pr:0.5rem]!`. Angular issue.                                            |
| Dot radius `3.35544e+07px` instead of `100%`                                    | `rounded-full`                                                                              | Fixed: `rounded-[100%]`. Computed styles only.                                                   |
| Surface and submenu list background (fundamental-styles' lists are transparent) | The menu sits in the popover surface, the submenu list has the list background (as Angular) | Kept: the items cover it, not visible; the cases ignore `background-color`.                      |
| Addons as tall as the item (43px instead of 16px)                               | `self-stretch` on the icon column (as Angular), the icon centred in it                      | Kept: same place of the icon; the icons themselves are compared.                                 |
| Icons 16px wide instead of the glyph width (12–14px)                            | The `icon` component's 1em box                                                              | Kept: centred in the same column, not visible.                                                   |
| Dot inherits the 16px font size and icon colour                                 | It is an empty element in the icon column                                                   | Kept: no text, not visible.                                                                      |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Variants, Open: icons, Open: submenus (the submenu opens
to the inline end, its arrow mirrored), Open: extended items and Open: mobile submenu stories.
