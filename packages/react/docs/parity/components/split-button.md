## split-button

Sources: fundamental-react: none · Angular [`registry/ui/split-button`](../../../../angular/registry/ui/split-button/) ·
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

### Stories vs. sources

| Source  | Example                                 | React story                                         | Status     | Notes                                                                                              |
| ------- | --------------------------------------- | --------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| Angular | Types                                   | `Types`                                             | ✅ covered | The texts and order of fundamental-styles' story (the main action is the first option).            |
| Angular | Main action behaviours                  | `Behaviors`                                         | ✅ covered | Default, additional main action, constant main action, flexible width, disabled; a live log.       |
| Angular | Template title and custom arrow         | `Template` (Content title and custom arrow)         | ✅ covered | The template is a `mainActionTitle` with an icon; `glyph="menu"`, `expandButtonTitle`, addons.     |
| Angular | Programmatic selection and open / close | `Programmatic`                                      | ✅ covered | `selected`/`onSelectedChange` and `open`/`onOpenChange` driven by buttons; outside clicks ignored. |
| Angular | Open: menu                              | `OpenMenu` (Open: menu)                             | ✅ covered |                                                                                                    |
| —       | —                                       | `Playground`                                        | ➕ added   | Controls for the props.                                                                            |
| fs      | Split menu button                       | `Types`, `OpenMenu` (the "arrow toggled" row, open) | ✅ covered | The icon examples (cart before the text, icon only) have no separate story; see `Template`.        |

### Tests vs. sources

| Source  | Behaviour                                               | React test                                                                                    | Status     |
| ------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------- |
| Angular | First item is the main action, run from the main button | shows the first item as the main action and runs it from the main button                      | ✅ covered |
| Angular | Arrow opens the menu, the chosen item becomes main      | opens the menu from the arrow and makes the chosen item the main action                       | ✅ covered |
| Angular | Constant main action and its callback                   | keeps a constant main action and runs its callback                                            | ✅ covered |
| Angular | `selected` sets the main action                         | the selected prop sets the main action and the main button runs it                            | ✅ covered |
| Angular | ArrowDown, Enter, Space open and focus the first item   | ArrowDown, Alt+ArrowDown, Enter and Space on the arrow open the menu and focus the first item | ✅ covered |
| Angular | Escape closes and returns the focus to the arrow        | Escape closes the menu and returns the focus to the arrow                                     | ✅ covered |
| Angular | Disabled: both buttons, no menu                         | disabled disables both buttons and does not open the menu                                     | ✅ covered |
| Angular | aria-controls points to the open menu                   | aria-controls points to the open menu, named by the arrow label                               | ✅ covered |
| Angular | fixedWidth                                              | fixedWidth keeps the main button width when a longer item is chosen                           | ✅ covered |
| Angular | Main action marked in the menu (effect)                 | marks the main action as selected in the menu                                                 | ✅ added   |
| Angular | Additional main action until a choice (story)           | shows an additional main action until an item is chosen                                       | ✅ added   |
| Angular | Group and arrow labels, group focus to the arrow        | labels the group and the arrow, with the arrow title; focusing the group moves the focus to … | ✅ added   |
| Angular | Menu below the group (group is the trigger element)     | places the menu below the whole group, at its start                                           | ✅ added   |
| Angular | Arrow pressed while open                                | shows the arrow pressed while the menu is open                                                | ✅ added   |
| —       | Stretched group (toolbar overflow)                      | a stretched group grows the main button and keeps the arrow at the end                        | ✅ added   |
| Angular | Item titles, submenu items                              | takes the title of an item from its MenuTitle or label, and chooses items of submenus         | ✅ added   |
| Angular | Programmatic open / close (story)                       | opens and closes the menu from outside (controlled open)                                      | ✅ added   |
| —       | Alt+ArrowDown on the main button                        | Alt+ArrowDown on the main button opens the menu; ArrowDown alone does not                     | ✅ added   |
| —       | Controlled selection                                    | a controlled selection follows the selected prop                                              | ✅ added   |
| —       | Prop spreading, ref (registry convention)               | passes className, native props and the ref to the group                                       | ✅ added   |

### Visual comparison

`pnpm visual split-button`: 21 cases × 16 combinations, 336/336 matching. The `Types` story has fundamental-styles'
texts and order, so every case is compared by pixels with its "Split menu button" story: the seven groups (pad,
inset border and separator); the main and arrow buttons of the emphasized, standard and transparent groups; hover on
the main and arrow buttons (emphasized and standard; the separator hides on hover); keyboard focus on the main and the
arrow button; and, from `Open: menu`, the emphasized group with its menu open and its pressed arrow against
fundamental-styles' "arrow toggled" row. Reviewed by eye in Horizon cozy and compact, LTR and RTL (`Open: menu`,
`Main action behaviours`, `Content title and custom arrow`): the menu opens below the group at its start, mirrored in
RTL.

| Difference                                                                                    | Cause                                                                                                                                 | Resolution                                                                                                                                    |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| HC: both buttons with the button background; fundamental-styles keeps them transparent        | Angular's `HC_BUTTON` sets `hc:bg-…` (fundamental-styles' `--fdButton_Split_Background_Color: transparent`)                           | Fixed: only the HC border colours are kept, the pad shows through. Not visible (≤2% pixels, same colours); Angular issue, computed styles.    |
| HC: focus frame of the main button rounded at the inner end (6–10% pixels), same on the arrow | Angular keeps the button's focus radius; fundamental-styles squares the inner corners (`--fdButton_Border_Radius_Outline_Left/Right`) | Fixed: `hc:focus:after:rounded-e-none` on the main button, `rounded-s-none` on the arrow, with the full corner radius outside. Angular issue. |
| Open menu: separator shown next to the pressed arrow                                          | Angular hides the separator on hover only; fundamental-styles' "arrow toggled" row hides it (`is-hover`)                              | Fixed: the separator also hides while the menu is open (`data-open`).                                                                         |

Angular issues found: in HC the split buttons get the button background instead of staying transparent on the pad
(not visible); in HC the focus frame of the main and arrow buttons keeps rounded inner corners where the buttons are
square.
