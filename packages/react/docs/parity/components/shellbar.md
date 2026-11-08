## shellbar

Sources: fundamental-react [Shellbar](https://github.com/SAP/fundamental-react/tree/main/src/Shellbar) (`Shellbar.js`,
its stories and tests) · Angular [`registry/ui/shellbar`](../../../../angular/registry/ui/shellbar/) ·
fundamental-styles [Shellbar](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-shellbar--docs)
Registry: `registry/ui/shellbar/`, with the `action-sheet` (overflow menu), `avatar`, `button` and `menu` (user menu,
product menu) components; React's `createPortal` places the search field.

API: the Angular parts as components, composed as direct children:

```tsx
<Shellbar showNavigationButton onNavigationButtonClick={toggleNav}>
  <ShellbarBranding interactiveBranding aria-label="Corporate Portal home" onClick={home}>
    <ShellbarLogo>
      <img src="logo.svg" alt="ACME" />
    </ShellbarLogo>
    <ShellbarTitle>Corporate Portal</ShellbarTitle>
  </ShellbarBranding>
  <ShellbarSearch placeholder="Search everything" onSearchSubmit={search} />
  <ShellbarActions user={{ fullName: 'Lisa Miller' }} userMenu={[{ text: 'Sign Out', callback: signOut }]}>
    <ShellbarAction glyph="bell" label="Notifications" notificationCount={3} onClick={openNotifications} />
  </ShellbarActions>
</Shellbar>
```

- `Shellbar` is `fd-shellbar` and its inner bar: native props, `className` (Angular's `class`) and `ref` go to the bar
  (`data-size` and `data-density="cozy"` on it). Inputs: `size` (fixed; follows the width otherwise), `breakpoints`
  (`SHELLBAR_DEFAULT_BREAKPOINTS`: s 0, m 320, l 600, xl 1240), `groupFlex`, `showNavigationButton`,
  `navigationButton` (Angular's `navigationButtonTemplate`, a node), `showBackButton`, `navigationButtonLabel`,
  `backButtonLabel`, `cancelLabel`, `showSearchFieldOnSizeSmall`; outputs `onNavigationButtonClick` and
  `onBackButtonClick` (`navigationButtonClicked`, `backButtonClicked`).
- `ShellbarBranding` (`interactiveBranding`: `role="link"`, `tabIndex` 0, Enter clicks it; `aria-label`),
  `ShellbarLogo`, `ShellbarTitle` (an `<h1>`, hidden at s), `ShellbarSubtitle` (hidden at s), `ShellbarSeparator`
  (`role="separator"`, hidden at s and m): native props, `className` and `ref` to their element.
- `ShellbarContextArea` (`role="group"`, `aria-label` "Additional information" by default):
  `onContentItemVisibilityChange(hidden)` is `contentItemVisibilityChange`; Angular's `fdShellbarHidePriority`
  directive is a `data-hide-priority` attribute on a child (higher numbers hide first; children without it hide from
  the last; children with it do not shrink, as the directive's `shrink-0`).
- `ShellbarSearch` (`role="search"`): Angular's `value` model is `value`/`defaultValue`/`onValueChange`,
  `searchSubmit` is `onSearchSubmit`; `placeholder`, `clearLabel`, `submitLabel`; `aria-label` (default "Search")
  names the input, as in Angular, and `inputRef` reaches it; other native props go to the field.
- `ShellbarActions`: `user`, `userMenu`, `closePopoverOnSelect`, `assistiveTools`, `assistiveToolsLabel`,
  `overflowLabel`, `searchLabel`; `assistiveToolsCallback` is `onAssistiveToolsClick`. Angular's projected
  `fd-product-switch` is the `productSwitch` prop (a node, after the user menu, with Angular's `ms-2`).
- `ShellbarAction`: `glyph`, `glyphFont`, `label`, `notificationLabel`, `notificationCount`, `toggled`, `title`;
  `fdType` is `variant`, `callback` is `onClick`. Native props and `ref` go to the button (the collapsible wrapper
  has no props).
- `ShellbarUserMenu`: `user`, `userMenu`, `placement`, `triggers`, `fillControlMode`, `closeOnEscapeKey`,
  `closeOnOutsideClick`, `closeOnSelect`, `disabled`; `itemClicked` is `onItemClick`; `aria-label` names the avatar
  (default: the user's name); children are more `MenuItem`s (Angular's projected content); Angular's
  `fdShellbarUserMenuButton` is the `button` prop (an element that becomes the menu trigger, with the round button
  classes). New: `menuLabel`, the menu's name (default: the user's name).
- `ProductMenu`: `control`, `items` (`{ name, callback, link, glyph, newTab }`), `placement`, `triggers`,
  `fillControlMode`, `closeOnEscapeKey`, `closeOnOutsideClick`, `closePopoverOnSelect`, `disabled`. The menu is named
  by the control text.

Behaviour, as Angular: a `ResizeObserver` gives the size from the bar's width; `layout()` then shows everything and,
while the actions' end is past the bar's content box (mirrored in RTL), collapses the collapsible actions (actions,
search button, assistive tools) into the overflow action sheet (`aria-label` "Collapsed Item Menu, <sum of the
notifications>", the search and the actions as items with their badges, variants and toggles), hides the branding
title, hides context items by priority and closes a search opened in the actions. The search is in the middle at xl
without a context area; below, a search button (also an overflow item) opens it in the actions and focuses it; at s
it replaces everything, with a Cancel button. Enter and the search button call `onSearchSubmit`; an empty submit and
Escape close the opened search. Actions are named "Label, notification label" and show `aria-pressed` when toggled.
Transparent buttons in the shellbar take the shell colours through the button variables (Angular's
`SHELL_BUTTON_VARS`).

fundamental-react's props map to the parts: `logo` is a `ShellbarLogo` child, `logoSAP` is gone (pass your logo);
`productTitle` is a `ShellbarTitle` or a `ProductMenu` `control`; `productMenu` (`name`, `callback`, `link`, `glyph`)
is `ProductMenu` `items` (`url` and the icon `size` are gone); `subtitle` is a `ShellbarSubtitle`; `searchInput`
(`placeholder`, `onSearch`) is a `ShellbarSearch` (`onSearchSubmit`); its suggestions (`searchList`) are not part of
Angular's search field: a `SearchInput` with suggestions can sit in `ShellbarActions` (search-input's "In a shellbar"
story); `actions` (`glyph`, `label`, `notificationCount`, `callback`) are `ShellbarAction`s, and an action `menu` is
a `Menu` child of `ShellbarActions` with a `Button` trigger; `notifications` is a bell `ShellbarAction` (its
`notificationsBody` popover a `Popover` child); `profile` (`initials`, `userName`, `image`, `colorAccent`) and
`profileMenu` are `user` (`fullName` for `userName`) and `userMenu` (`text` for `name`; items with icons are
`MenuItem` children with `addonBefore`); `productSwitch` (`label`) and `productSwitchList` (`title`, `glyph`,
`callback`) are a `ProductSwitch` (`aria-label`) holding a `ProductSwitchBody` (`products`, `icon` for `glyph`) in the
`productSwitch` slot; `popoverPropsFor` is each part's own props (`placement`, ...); `backAction` is
`showBackButton` with `onBackButtonClick`; `localizedText` is `backButtonLabel`, `notificationLabel` and the other
labels; `copilot` is gone (CoPilot was retired; fundamental-styles shows a Joule action instead); `size` stays.

**Differences, on purpose:**

- React has no content projection: `Shellbar` and `ShellbarActions` sort their direct children by type
  (`ShellbarBranding`, `ShellbarLogo`, `ShellbarTitle`/`ProductMenu`/`ShellbarSubtitle`/`ShellbarSeparator`,
  `ShellbarContextArea`, `ShellbarSearch`, `ShellbarActions`; `ShellbarAction`, `ShellbarUserMenu`), so the parts must
  be direct children, not wrapped in your own components or fragments. Other children of `Shellbar` go into the
  product group after the branding (Angular's `fdShellbarSidenav` slot; Angular hid any other content); other
  children of `ShellbarActions` go first, as Angular's default slot.
- The search field is rendered through a portal into the middle group, the actions or a hidden holder (Angular moved
  its DOM node); the input is recreated on a move, so its text lives in the component and the opened search is
  focused once in its new place.
- The simple user menu sits in its slot after the actions and before the product switch, as fundamental-styles;
  Angular's `fd-shellbar-user-menu` has `order-1` and lands after the product switch (an Angular issue).
- The back button uses `nav-back` in both directions (the icon mirrors in RTL); Angular switches to
  `slim-arrow-right` in RTL, which the icon mirrors as well, so its arrow points left there (an Angular issue).
- The shellbar stays cozy in compact pages (`data-density="cozy"`, as Angular and fundamental-ngx, whose shellbar
  supports only cozy); fundamental-styles' Storybook compacts its buttons with the page.
- fundamental-react collapses the product switch into the overflow menu (a list of the products with a back item);
  as Angular, the product switch stays in the bar after the user menu and never collapses, and the stories show its
  list layout on small shellbars (`forceListMode`, Collapsible links at s).
- The full user menu (`fd-user-menu`) is not ported yet: the stories use a `ShellbarUserMenu` with Angular's items as
  stand-in; the object marker of the context area story is an icon and text.
- No message toasts (not ported): the stories report the last action in a live region.

### Stories vs. sources

| Source            | Example                           | React story                      | Status     | Notes                                                                                                                                                                                                              |
| ----------------- | --------------------------------- | -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| fundamental-react | basic                             | `MandatoryElements`              | ✅ covered | Logo, title and a user menu with initials (also fundamental-styles' mandatory elements).                                                                                                                           |
| fundamental-react | withProductMenu                   | `WithProductMenu`                | ✅ covered | Product menu, subtitle, search, notifications and a user image.                                                                                                                                                    |
| fundamental-react | withBackButton                    | `WithBackButton`                 | ✅ covered |                                                                                                                                                                                                                    |
| fundamental-react | coPilot                           | `CoPilot` ("Actions with menus") | ✅ covered | An action with a menu, Joule in place of the retired CoPilot image, the product switch.                                                                                                                            |
| fundamental-react | dev                               | `Playground`                     | ✅ covered | `size` and `showSearchFieldOnSizeSmall` controls.                                                                                                                                                                  |
| fundamental-react | noStyles                          | —                                | ➖ n/a     | No `cssNamespace`.                                                                                                                                                                                                 |
| Angular           | Basic                             | `Basic`                          | ✅ covered | User menu stand-in; a live region instead of toasts.                                                                                                                                                               |
| Angular           | Responsive sizes                  | `Responsive`                     | ✅ covered |                                                                                                                                                                                                                    |
| Angular           | Context area                      | `ContextArea`                    | ✅ covered | Object marker stand-in (icon and text).                                                                                                                                                                            |
| Angular           | Context area overflow             | `ContextAreaOverflow`            | ✅ covered |                                                                                                                                                                                                                    |
| Angular           | Product menu and simple user menu | `ProductMenuAndSimpleUserMenu`   | ✅ covered |                                                                                                                                                                                                                    |
| Angular           | Growing groups                    | `GrowingGroups`                  | ✅ covered |                                                                                                                                                                                                                    |
| Angular           | Collapsible links                 | `CollapsibleLinks`               | ✅ covered | The product switch shows its list at s (`forceListMode`), as Angular. At s (319px) the product menu keeps its width and the product switch runs past the bar's end, as in Angular (only the branding title hides). |
| Angular           | Open: user menu                   | `OpenUserMenu`                   | ✅ covered |                                                                                                                                                                                                                    |
| Angular           | Open: product switch              | `OpenProductSwitch`              | ✅ covered |                                                                                                                                                                                                                    |
| Angular           | Open: product menu                | `OpenProductMenu`                | ✅ covered |                                                                                                                                                                                                                    |
| Angular           | Open: simple user menu            | `OpenSimpleUserMenu`             | ✅ covered |                                                                                                                                                                                                                    |
| Angular           | Open: overflow menu               | `OpenOverflowMenu`               | ✅ covered |                                                                                                                                                                                                                    |

### Tests vs. sources

| Source            | Behaviour                                                      | React test                                                                                      | Status     |
| ----------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Size from the width, search in the middle at xl                | takes its size from its width and shows the search in the middle when extra large               | ✅ covered |
| Angular           | Action names with notifications, callbacks                     | names actions with their notifications and runs their callbacks                                 | ✅ covered |
| Angular           | Interactive branding: link, Enter                              | makes the interactive branding a link reachable with the keyboard                               | ✅ covered |
| Angular           | Search from a button below xl, focus, submit                   | opens the search from a button below extra large and submits it                                 | ✅ covered |
| Angular           | Overflow menu: name with the sum, items                        | collapses actions that do not fit into an overflow menu                                         | ✅ covered |
| Angular           | Search in place of everything at s, Cancel                     | opens the search in place of everything else on small screens                                   | ✅ covered |
| Angular           | Context items hide by priority                                 | hides context area items by priority when space runs out                                        | ✅ covered |
| Angular           | Hidden items reported and restored                             | onContentItemVisibilityChange reports the hidden items and restores them when space returns     | ✅ covered |
| Angular           | Toggled action `aria-pressed`                                  | a toggled action exposes aria-pressed (`rerender`)                                              | ✅ covered |
| Angular           | Navigation and back buttons                                    | the navigation and back buttons call their handlers                                             | ✅ covered |
| Angular           | Product menu items and callbacks, closes                       | the product menu opens and runs the callback of a selected item                                 | ✅ covered |
| Angular           | Simple user menu from `user`/`userMenu`                        | the user menu built from user and userMenu opens and runs callbacks                             | ✅ covered |
| Angular           | `groupFlex`                                                    | groupFlex lets a group shrink to its content so the others grow (`rerender`)                    | ✅ covered |
| fundamental-react | Back button on a shellbar with `backAction`                    | the navigation and back buttons call their handlers                                             | ✅ covered |
| fundamental-react | Back from the collapsed product switch                         | keeps the product switch out of the overflow menu, and returns from its products to the bar     | ✅ covered |
| fundamental-react | Prop spreading (an `xtest`)                                    | passes native props, className and ref to the bar (fundamental-react prop spreading)            | ✅ covered |
| —                 | Width changes and custom breakpoints                           | follows width changes and custom breakpoints                                                    | ➕ extra   |
| —                 | Escape, empty submit and clear on the opened search            | closes the search opened from its button with Escape or an empty search, and clears the text    | ➕ extra   |
| —                 | Overflow item runs the action and closes; actions come back    | runs an action from the overflow menu and closes it; shows the actions again when space returns | ➕ extra   |
| —                 | Product menu heading and links; user menu extras               | a product menu without items is a heading…; a user menu takes extra items, a custom button…     | ➕ extra   |
| —                 | Assistive tools, product switch slot, custom navigation button | shows the assistive tools button and the product switch, and a custom navigation button         | ➕ extra   |
| —                 | Shell colours on transparent buttons, cozy density             | applies the shell colours to transparent buttons and keeps cozy density                         | ➕ extra   |

fundamental-react's collapsed product switch (a product list with a back item inside its overflow menu) is adapted to
Angular's shellbar, where the product switch never collapses: at a width where the actions collapse, the overflow menu
holds the actions only, the product switch opens its products from the bar, and Escape (back) or choosing a product
closes them and returns to the bar.

### Visual comparison

`pnpm visual shellbar`: 23 cases × 16 combinations, 240/368 matching; the other 128 are the differences kept below
(96 of them compact). Cases: from `MandatoryElements` against fundamental-styles' mandatory elements (primary), the
product group, the branding at rest, hovered and focused, the logo, the title, the user menu button and its avatar;
from `CollapsibleLinks` (the 1000px bar, size l) against Responsive Paddings, the bar; from `Basic` (xl) against the
first bar of Actions in Overflow Toolbar, the bar with a navigation button, the navigation button, the search field
at rest and hovered, its input and search button, an action with a badge, an action hovered and focused, and the
product switch button; from `Responsive` (the 560px bar) the overflow button; from `ContextArea` against
the optional elements, the context area, a separator and the EMEA menu button. The bars, groups, branding, logo and
user menu are compared by computed style only (widths of the containers, an image logo that does not load and image
avatars there; a data SVG logo and initials here).

| Difference                                                                                     | Cause                                                                                                                                                       | Resolution                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search field without its bottom border line (4.4% of pixels)                                   | Angular paints the field with `bg-sap-shell-interactive-background` only; fundamental-styles adds `--sapField_BackgroundStyle` (the hover one when hovered) | Fixed: `[background:var(--sapField_BackgroundStyle)_var(--sapShell_InteractiveBackground)]`, the hover style on hover; also `cursor-text` and the field text colour (`#fff` in Horizon Dark). |
| HC hovered search input brown (82% of pixels)                                                  | Angular's `hc:hover:bg-sap-shell-hover-background` on the input; fundamental-styles keeps it transparent                                                    | Fixed: `hc:hover:bg-transparent`. An Angular issue.                                                                                                                                           |
| User menu button radius 3.35544e+07px (fundamental-styles 20rem)                               | `rounded-full` computes to a huge length                                                                                                                    | Fixed: `rounded-[20rem]`. Computed styles only.                                                                                                                                               |
| Bar paddings 2rem at 1248px (fundamental-styles' primary bar 1rem)                             | fundamental-styles' bar without a size modifier has 1rem; its responsive paddings follow the viewport (2rem at 1280px), ours the bar's width (Angular)      | Kept, as Angular: the bar always has the paddings of its size. Compared against Responsive Paddings with a bar of size l.                                                                     |
| Compact: buttons 26px high, search field and context area lower (96 comparisons)               | fundamental-styles' Storybook compacts the shellbar with the page                                                                                           | Kept: the shellbar is cozy only (`data-density="cozy"`), as Angular and fundamental-ngx (which supports only cozy for it).                                                                    |
| HC search field 3.2-3.9% of pixels; search input font Arial 13.5px, 32-34px high (style only)  | fundamental-styles' shellbar input sets no font (the browser's Arial) and draws its own 1px border inside the field                                         | Kept: ours uses the SAP font and size of every field (`72`, 14px), and the field draws the border in HC. fundamental-styles is wrong here.                                                    |
| Search button `min-height` 26px and 9px paddings (0.0% of pixels)                              | fundamental-styles' addon button keeps the button paddings; ours fixes its width (`--sb-btn-w`) with no paddings, as Angular                                | Kept: same size and glyph position, not visible.                                                                                                                                              |
| Product switch button: border, paddings and font (HC 8.0% of pixels; 0.0% in Horizon and Dark) | fundamental-styles' control is also an `fd-popover__control`, whose generic reset (no border, no paddings, the `72` font) overrides its button styles       | Kept: the product switch button is the same transparent `Button` as the other actions (fundamental-styles' Help action keeps its HC border too), as Angular and UI5's shell bar.              |
| Overflow button colours                                                                        | fundamental-styles shows it open (`is-toggled`)                                                                                                             | Not compared (colours ignored, style only); sizes match.                                                                                                                                      |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Basic, Responsive sizes, Context area, Collapsible links
and Open: overflow menu. In RTL the groups, the search and the overflow menu mirror and the back arrow points right;
in compact pages the shellbar keeps its cozy size.

Angular issues: the simple user menu (`order-1`) lands after the product switch; the RTL back button
(`slim-arrow-right`, mirrored) points left; the search field has no bottom border line (`--sapField_BackgroundStyle`)
and the HC hovered search input takes the shell hover colour instead of staying transparent; the bar and search
shadows use `shadow-[…]`/`shadow-sap-field-shadow` (transparent ring layers); `rounded-full` on the user menu button
computes to 3.35544e+07px (computed styles only); a `ProductMenu` never shrinks or hides, so a small bar with one overflows
(Collapsible links, s).
