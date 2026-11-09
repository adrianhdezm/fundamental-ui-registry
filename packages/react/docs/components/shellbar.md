## shellbar

Sources: fundamental-react [Shellbar](https://github.com/SAP/fundamental-react/tree/main/src/Shellbar) (`Shellbar.js`,
its stories and tests) · Angular [`registry/ui/shellbar`](../../../angular/registry/ui/shellbar/) ·
fundamental-styles [Shellbar](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-shellbar--docs)
Registry: `registry/ui/shellbar/`, with the `action-sheet` (overflow menu), `avatar`, `button`, `menu` (simple user
menu, product menu) and `user-menu` (the full user menu's slot) components; React's `createPortal` places the search
field.

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
  `fd-user-menu` is a `UserMenu` child (from `user-menu`), placed after the simple user menu and before the product
  switch, as Angular's `ng-content` order, and kept from shrinking (`shrink-0`); it never collapses. Angular's
  projected `fd-product-switch` is the `productSwitch` prop (a node, after the user menu, with Angular's `ms-2`).
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
  `ShellbarContextArea`, `ShellbarSearch`, `ShellbarActions`; `ShellbarAction`, `ShellbarUserMenu`, `UserMenu`), so the parts must
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
- The object marker of the context area story is an icon and text (object marker is not ported yet).

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                     | Cause                                                                                                                                                  | Resolution                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bar paddings 2rem at 1248px (fundamental-styles' primary bar 1rem)                             | fundamental-styles' bar without a size modifier has 1rem; its responsive paddings follow the viewport (2rem at 1280px), ours the bar's width (Angular) | Kept, as Angular: the bar always has the paddings of its size. Compared against Responsive Paddings with a bar of size l.                                                        |
| Compact: buttons 26px high, search field and context area lower (96 comparisons)               | fundamental-styles' Storybook compacts the shellbar with the page                                                                                      | Kept: the shellbar is cozy only (`data-density="cozy"`), as Angular and fundamental-ngx (which supports only cozy for it).                                                       |
| HC search field 3.2-3.9% of pixels; search input font Arial 13.5px, 32-34px high (style only)  | fundamental-styles' shellbar input sets no font (the browser's Arial) and draws its own 1px border inside the field                                    | Kept: ours uses the SAP font and size of every field (`72`, 14px), and the field draws the border in HC. fundamental-styles is wrong here.                                       |
| Search button `min-height` 26px and 9px paddings (0.0% of pixels)                              | fundamental-styles' addon button keeps the button paddings; ours fixes its width (`--sb-btn-w`) with no paddings, as Angular                           | Kept: same size and glyph position, not visible.                                                                                                                                 |
| Product switch button: border, paddings and font (HC 8.0% of pixels; 0.0% in Horizon and Dark) | fundamental-styles' control is also an `fd-popover__control`, whose generic reset (no border, no paddings, the `72` font) overrides its button styles  | Kept: the product switch button is the same transparent `Button` as the other actions (fundamental-styles' Help action keeps its HC border too), as Angular and UI5's shell bar. |
