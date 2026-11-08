## user-menu

Sources: Angular [`registry/ui/user-menu`](../../../../angular/registry/ui/user-menu/) (itself from
`@fundamental-ngx/core`'s `fd-user-menu`) · no fundamental-react source · fundamental-styles
[User Menu](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-user-menu--docs)
Registry: `registry/ui/user-menu/`, on the `popover` (desktop menu and submenus, Base UI's Popover), `dialog` (mobile
mode, Base UI's Dialog), `bar`, `button`, `icon` and `title` components.

API: the Angular parts as components, composed the same way:

```tsx
<UserMenu>
  <UserMenuControl>
    <UserMenuControlElement render={<Avatar size="xs" circle interactive aria-label="Lisa Miller" />} />
  </UserMenuControl>
  <UserMenuBody>
    <UserMenuHeader>
      <Avatar circle size="l" zoomGlyph="edit" aria-label="Edit avatar" image={photo} />
      <UserMenuHeaderContainer>
        <UserMenuUserName>Lisa Miller</UserMenuUserName>
        <UserMenuSubline>lisa.miller@test.com</UserMenuSubline>
      </UserMenuHeaderContainer>
      <UserMenuHeaderContentArea>…</UserMenuHeaderContentArea>
    </UserMenuHeader>
    <UserMenuContentContainer>
      <UserMenuList aria-label="User actions">
        <UserMenuListItem icon="action-settings" text="Settings" onClick={openSettings} />
        <UserMenuListItem
          icon="globe"
          text="Language"
          submenu={
            <UserMenuSublist>
              <UserMenuListItem text="English" />
            </UserMenuSublist>
          }
        />
      </UserMenuList>
    </UserMenuContentContainer>
  </UserMenuBody>
  <UserMenuFooter>
    <Bar barDesign="footer">…</Bar>
  </UserMenuFooter>
</UserMenu>
```

| Angular                                                                    | React                                                                                                     |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `fd-user-menu`: `isOpen` model, `mobile`, `placement` (`bottom-end`)       | `UserMenu`: `open`/`defaultOpen`/`onOpenChange`, `mobile`, `placement`; native props to its `inline-flex` |
| `backLabel` ("Go back"), `closeLabel` ("Close")                            | the same                                                                                                  |
| `open()`, `close()`, `toggle()` (`#menu="fdUserMenu"`)                     | `open` / `onOpenChange`, and `useUserMenu()` (`open`, `mobile`, `setOpen`, `close`, `toggle`) inside      |
| `fd-user-menu-control`                                                     | `UserMenuControl` (native props, `className`, `ref`)                                                      |
| `[fd-user-menu-control-element]` (`data-state="open"`)                     | `UserMenuControlElement` (`render` your element; a `<span>` by default)                                   |
| `fd-user-menu-body` (`class`)                                              | `UserMenuBody` (`className`)                                                                              |
| `[fd-user-menu-header]`, `-header-container`, `-header-content-area`       | `UserMenuHeader`, `UserMenuHeaderContainer`, `UserMenuHeaderContentArea` (`<div>`s)                       |
| `[fd-user-menu-user-name]`: `id`, `truncate`, `wrap`                       | `UserMenuUserName`: the same                                                                              |
| `[fd-user-menu-subline]`: `truncate`, `wrap`                               | `UserMenuSubline`: the same                                                                               |
| `[fd-user-menu-content-container]`                                         | `UserMenuContentContainer`                                                                                |
| `fd-user-menu-list`: `ariaLabel`                                           | `UserMenuList`: `aria-label` and other native props on its `<nav>`                                        |
| `[fd-user-menu-sublist]`: `hasIcons`, in an `<ng-template>`                | `UserMenuSublist`: `hasIcons`, passed as an item's `submenu`                                              |
| `[fd-user-menu-list-item]`: `text`, `icon`, `iconAfter`, `iconAfterActive` | `UserMenuListItem`: the same                                                                              |
| `subtitle`, `truncateText`, `truncateSubtitle`, `selected`                 | the same                                                                                                  |
| `uniqueId`, `textId`, `subtitleId`                                         | `id` (the `<li>`), `textId`, `subtitleId`                                                                 |
| `hasSubmenu`, `submenu` (`TemplateRef`)                                    | `submenu` (a node); `hasSubmenu` defaults to whether `submenu` is given                                   |
| `focus()`, `click()` of the item                                           | `buttonRef`: the `<button role="menuitem">`                                                               |
| `fd-user-menu-footer`                                                      | `UserMenuFooter`                                                                                          |
| —                                                                          | `container`: the element the popover or dialog is rendered into (the visual stories)                      |

Behaviour, as Angular:

- **Desktop:** the control is the trigger of a popover (`PopoverTrigger` with `nativeButton={false}`: `role="button"`,
  `tabIndex` 0, `aria-haspopup="dialog"`, `aria-expanded`; click, Enter and Space toggle it). The body is a
  `role="dialog"` labelled by the user name, with the arrow, a focus trap (Tab wraps) and no automatic focus capture:
  the first item of the main list takes the focus when it opens. Escape and outside presses close it; the focus goes
  back to the control unless the user moved it elsewhere (Angular's check, as the popover's `finalFocus`).
- **User name header:** an `IntersectionObserver` on the user name (44px under the header bar) shows the name in a
  header bar (`aria-hidden`) once it scrolls out of view; a `MutationObserver` keeps its text. Both run while the name
  is mounted, i.e. while the menu is open.
- **Lists:** `role="menu"` lists of `<li role="none">` with `<button role="menuitem">` items. Arrow Up/Down, Home and
  End move between the items of a list (not into submenus); one item is in the tab order: the last focused one, back
  to the first when the focus leaves the menu (moving into a submenu keeps it). The subtitle describes its item.
- **Submenus:** an item with a `submenu` opens it in a popover at `left-start` (flipping when there is no room) on
  hover, click or the Right arrow (Left in RTL), which also focuses its first item; the Left arrow (Right in RTL) and
  Escape close it and focus the item. Hovering an item closes its siblings' submenus; leaving an item or a submenu
  closes it after 150ms unless the pointer comes back (a submenu keeps its ancestors open). The open item shows the
  selection colours. Submenus are `role="menu"` named by the item's text.
- **Mobile:** the menu opens in a full-screen dialog (Escape closes it, the backdrop does not) with a header bar: the
  user name in the middle once it scrolls out of view, a close button at the end. An item with a submenu replaces the
  main view with its submenu: the header shows a back button and the item text as an `<h1>`; back focuses the item
  that opened the level. Closing goes back to the main view.
- Clicks inside the body do not bubble out of the menu (`stopPropagation`), as in fundamental-ngx; the footer's do.

**Differences, on purpose:**

- React has no content projection: `UserMenuControl`, `UserMenuBody` and `UserMenuFooter` must be direct children of
  `UserMenu`, which places the body and footer in the popover or dialog. A submenu is a node passed to `submenu`
  instead of an `<ng-template>`.
- Native props of an item go to its `<li>`, as Angular's host; `buttonRef` reaches the menu item. The submenu popover
  of an item is rendered after its list (each list renders the popovers of its items): Base UI leaves a hidden
  `aria-owns` owner element where a popover is rendered, which a `role="menu"` may not contain (axe
  `aria-required-children`). As a result, React events of a submenu bubble to the list's container, not through the
  item, so a click handler on an item does not get its submenu's clicks (as in Angular, where the submenu is in the
  overlay).
- The submenu arrow and the mobile back button use `navigation-right-arrow` and `navigation-left-arrow` in both
  directions: the icon mirrors these glyphs in RTL. Angular adds `rtl:-scale-x-100` to the arrow (merged with the
  icon's own, so the same result) and switches the back button to `navigation-right-arrow` in RTL, which the icon
  mirrors back: its back arrow points left in RTL (an Angular issue).
- The control opens on Enter and Space through Base UI's button behaviour (Space on key up); Angular handled the
  keys itself on key down.
- The open state of the control (`data-state="open"`) is a component with `render`, not an attribute directive.

### Stories vs. sources

| Source             | Example                    | React story      | Status     | Notes                                                                                                                                                            |
| ------------------ | -------------------------- | ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular            | Default                    | `Default`        | ✅ covered | Header with a message strip and an action, accounts, actions with two levels of submenus, footer; toasts on choice. The accounts panel is a stand-in (no panel). |
| Angular            | Mobile                     | `Mobile`         | ✅ covered |                                                                                                                                                                  |
| Angular            | Open: desktop              | `OpenDesktop`    | ✅ covered |                                                                                                                                                                  |
| Angular            | Open: long name, scrolling | `OpenLong`       | ✅ covered |                                                                                                                                                                  |
| Angular            | Open: submenu              | `OpenSubmenu`    | ✅ covered | Opens the submenu from the keyboard (mirrored in RTL).                                                                                                           |
| Angular            | Open: mobile               | `OpenMobile`     | ✅ covered |                                                                                                                                                                  |
| fundamental-styles | Default (first example)    | `Variants`       | ✅ new     | Open in a box of the page (`container`) with its submenu open: the visual reference cases.                                                                       |
| fundamental-styles | Mobile                     | `VariantsMobile` | ✅ new     | The mobile dialog, open: visual reference cases of mobile mode.                                                                                                  |
| fundamental-react  | —                          | —                | ➖ n/a     | No fundamental-react source.                                                                                                                                     |

### Tests vs. sources

| Source  | Behaviour                                                       | React test                                                                               | Status     |
| ------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------- |
| Angular | Opens in a popover labelled by the user name, focuses the first | opens from the control in a popover labelled by the user name and focuses the first item | ✅ covered |
| Angular | Arrow keys, Home, End, one tab stop                             | moves between items with the arrow keys and keeps one tab stop                           | ✅ covered |
| Angular | Right arrow opens a submenu, Left arrow closes it               | opens a submenu with the Right arrow and closes it with the Left arrow                   | ✅ covered |
| Angular | Hover opens a submenu, its items are clickable                  | opens a submenu on hover (the click does not reach the parent item)                      | ✅ covered |
| Angular | Escape closes and returns the focus to the control              | closes with Escape and returns the focus to the control                                  | ✅ covered |
| Angular | Mobile dialog, submenu levels, back, close                      | opens in a dialog in mobile mode and shows submenus in place of the main view            | ✅ covered |
| Angular | Clicks in the body do not bubble out, the footer's do           | keeps clicks inside the body from bubbling out of the menu                               | ✅ covered |
| Angular | Control: button role, tabindex 0, aria-haspopup dialog          | the control is a focusable button (tabindex 0, aria-haspopup dialog)                     | ✅ covered |
| Angular | Space opens, other keys do not                                  | opens with Space and ignores other keys on the control                                   | ✅ covered |
| Angular | Reopening starts on the first item                              | reopening after moving the focus starts on the first item                                | ✅ covered |
| Angular | Leaving the menu resets the tab stop                            | moving the focus out of the menu resets the tab stop to the first item                   | ✅ covered |
| Angular | RTL arrows                                                      | submenu arrows are mirrored in RTL                                                       | ✅ covered |
| Angular | Mobile focuses the first item                                   | mobile mode focuses the first item when it opens and opens from the keyboard             | ✅ covered |
| Angular | User name clamps / truncates                                    | user name clamps to two lines, truncate keeps one line                                   | ✅ covered |
| Angular | Subline truncates unless it wraps                               | a subline truncates to one line unless it wraps                                          | ✅ covered |
| —       | Escape in a submenu closes only the submenu                     | closes a submenu with Escape and keeps the menu open                                     | ✅ new     |
| —       | Click opens a submenu, hovering a sibling closes it             | a click on an item with a submenu opens it, and hovering another item closes it          | ✅ new     |
| —       | User name in the header bar after scrolling                     | shows the user name in the header bar once it scrolls out of view                        | ✅ new     |
| —       | `UserMenuControlElement`, `useUserMenu().close()`, list name    | marks the control element while open and closes from useUserMenu                         | ✅ new     |
| —       | Subtitle description, icon after, selected, truncation, arrow   | item options: subtitle describes the item, icons, selection and truncation               | ✅ new     |
| —       | Native props, `className`, `ref`, `buttonRef`                   | passes native props, className and ref to the root elements                              | ✅ new     |

### Visual comparison

`pnpm visual user-menu`: 21 cases × 16 combinations, 336/336 matching (first run: 208/320 with 20 cases, before the differences below were sorted out). Cases, against fundamental-styles' User Menu Default
(first example) and Mobile stories, in the `Variants` and `VariantsMobile` stories (open in a box of the page, the
submenu opened and the focus removed by `play`): the popover body, the user menu body, header container, user name,
subline, header content area, the menu list, an item with an icon, its icon column, glyph and title, the expanded
item with a subtitle and its submenu arrow, an item on hover and with keyboard focus, the two submenu items, the
footer bar, and in mobile mode the body and an item. Computed styles and pixels (3%), except where noted.

| Difference                                                                                                         | Cause                                                                                                                          | Resolution                                                                            |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Icon column and submenu arrow column 43-44px high, fundamental-styles' 16-17px                                     | Our addons stretch over the item height with the icon centred (Angular's `self-stretch`, as the menu component)                | Kept, not visible: columns compared without the height, the glyph compared on its own |
| Hovered item shows a focus frame (10% of pixels)                                                                   | The hovered item takes the focus (Angular); the story opened its submenu from the keyboard, so Chromium shows `:focus-visible` | Kept: compared by styles (equal); after a mouse click the hover shows no frame        |
| First and last submenu items and the footer bar: no rounded outer corners (fundamental-styles: the popover radius) | Our popover body clips its content to its rounded corners instead                                                              | Kept, not visible (the same pixels): the radii are not compared                       |
| Mobile body as wide as the viewport (fundamental-styles: 288px)                                                    | Our mobile dialog fills the screen; fundamental-styles draws a phone-sized frame                                               | Kept: compared without width and height                                               |
| Message strip with a dismiss button in the first visual run                                                        | `MessageStrip` is dismissible by default; Angular's story turned it off                                                        | Fixed in the stories (`dismissible={false}`)                                          |

Reviewed by eye in Horizon cozy and compact, LTR and RTL: `Variants`, `OpenSubmenu` (the submenu flips to the free
side), `OpenLong` scrolled (the name in the header bar) and `OpenMobile`, also scrolled.
