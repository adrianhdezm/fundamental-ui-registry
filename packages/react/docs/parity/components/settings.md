## settings

Sources: Angular [`registry/ui/settings`](../../../../angular/registry/ui/settings/) (itself from
`@fundamental-ngx/core`'s settings) · no fundamental-react source · fundamental-styles
[Settings](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-settings--docs)
Registry: `registry/ui/settings/`: parts on Base UI's `useRender`, built from the ported `Bar`, `Button`, `List`
(`ListItem`) and `Title`; `settingsDialogConfig()` takes the `DialogConfig` of the dialog service.

API, as Angular's:

| Angular                                                                                                | React                                                                                                                 |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `fd-settings-container` (`detailsAreaTitleHeading`, `detailsAreaTitleHeadingSize`, `backBtnAriaLabel`) | `SettingsContainer` (the same props)                                                                                  |
| `pushView(template, title)`, `popView()`, `clearViewStack()`, `select(item)`                           | `useSettings()` inside it, or `actionsRef`: `pushView(view, title)`, `popView()`, `clearViewStack()`, `select(value)` |
| `viewMode` (lg ≥ 1024px, md ≥ 600px, sm; window width), `data-settings-view`                           | the same, from a `resize` listener; `useSettings().viewMode`                                                          |
| `li[fd-list-item][settingsListTpl]` (`selected` on the first)                                          | `SettingsListItem` (a `ListItem`; `view`, `defaultSelected`, `value`, `viewTitle`)                                    |
| the item title from `[fd-list-title]`                                                                  | the text of its `ListTitle`, or `viewTitle`                                                                           |
| `ul[fd-list][settingsList]`, `[settingsListFooter]`                                                    | `SettingsList`, `SettingsListFooter` (a `List` with the scrolling / top border classes)                               |
| `[fd-settings-list-area]`, `[fd-settings-list-container]`                                              | `SettingsListArea`, `SettingsListContainer`                                                                           |
| `[fd-settings-detail-area]`, `[fd-settings-header]`, `[fd-settings-header-button]`                     | rendered by `SettingsContainer` (`SettingsDetailArea` is exported too)                                                |
| `[fd-settings-content]` (`noPadding`, `noBackground`), `[fd-settings-content-container]`               | `SettingsContent`, `SettingsContentContainer`                                                                         |
| `[fd-settings-spacing]` (`size`)                                                                       | `SettingsSpacing` (`size`)                                                                                            |
| `[fd-settings-profile-card]`, `-name`, `-subline`                                                      | `SettingsProfileCard`, `SettingsProfileCardName`, `SettingsProfileCardSubline`                                        |
| `[fd-settings]`                                                                                        | `Settings`                                                                                                            |
| `SETTINGS_DIALOG_CLASS`, `settingsDialogConfig(config)`                                                | the same (for `useDialogService().open`), or `className={SETTINGS_DIALOG_CLASS}` on a `DialogPopup`                   |
| `[fd-settings-dialog-body]`, `[fd-settings-dialog-content]` (compatibility markers)                    | ➖ not ported: `settingsDialogConfig` sizes the dialog                                                                |
| —                                                                                                      | `SettingsContainer` `value` / `defaultValue` / `onValueChange`: the open item                                         |

Behaviour, as Angular's: the item with `defaultSelected` opens first; a click (or Enter on its `ListLink`) opens an
item, moves the selection (`data-selected`) and clears the pushed views. On medium and small windows the view
replaces the list with a back button (`navigation-left-arrow`, mirrored in RTL; named and titled by
`backBtnAriaLabel`) that gets the focus; back returns to the list and focuses the open item. Pushed views show a back
button on large windows too and go back one at a time. In a dialog the open item (or the first) takes the focus once
the dialog has placed it. The detail title is a heading of `detailsAreaTitleHeading` in header size
`detailsAreaTitleHeadingSize`.

**Differences from Angular, on purpose:**

- Views are React nodes (`view`, `pushView(view, title)`) instead of templates, and an item is identified by a
  `value` (generated by default) so the open item can be controlled (`value` / `onValueChange`).
- While the view replaces it, the list area stays mounted but `hidden` (Angular removes it), so its items keep their
  state and registration.
- The detail title is an `<h2>` (`Title level`), where Angular uses a `<div role="heading" aria-level>`.
- The back button uses `navigation-left-arrow` in both directions: the icon mirrors itself in RTL. Angular picks
  `navigation-right-arrow` in RTL, which the icon mirrors again, so it points left (an Angular issue).
- The profile card name uses fundamental-styles' `--sapFontBoldFamily` with a normal line height; Angular's uses
  72 Semibold Duplex with a 1.4rem line height (an Angular issue).

### Stories vs. sources

| Source             | Example                                                             | React story   | Status     | Notes                                                                                                               |
| ------------------ | ------------------------------------------------------------------- | ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Angular            | Dialog                                                              | `Dialog`      | ✅ covered | `useDialogService().open` with `settingsDialogConfig`; Close, or Save/Cancel while Reset is open.                   |
| Angular            | Inline                                                              | `Inline`      | ✅ covered | The same settings in a 60rem × 42.5rem frame: account, appearance, language, notifications (pushes details), reset. |
| Angular            | Open: dialog                                                        | `OpenDialog`  | ✅ covered | `play` opens the dialog.                                                                                            |
| fundamental-styles | User account                                                        | `UserAccount` | ✅ new     | Its list, header and profile card with its texts, inline at the size of its dialog body: the visual reference.      |
| fundamental-styles | Appearance, Language & Region, Notifications, Notifications details | `Inline`      | ✅ covered | The views of the Angular story.                                                                                     |
| fundamental-styles | XL, MD, SM                                                          | —             | ➖ n/a     | The view mode follows the window width: `Inline` / `Dialog` in a narrow window; tested in the spec.                 |
| fundamental-react  | —                                                                   | —             | ➖ n/a     | No fundamental-react source.                                                                                        |

### Tests vs. sources

| Source  | Behaviour                                                 | React test                                                                           | Status     |
| ------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------- |
| Angular | Side by side on large screens                             | shows the list and the view of the selected item side by side on large screens       | ✅ covered |
| Angular | Click opens the view and moves the selection              | opens the view of a clicked item and moves the selection                             | ✅ covered |
| Angular | pushView with a focused back button                       | pushes further views with a back button                                              | ✅ covered |
| Angular | Medium screens: view replaces the list, back focuses item | replaces the list with the view on medium screens                                    | ✅ covered |
| Angular | Spacing hidden from assistive technology                  | spacing is hidden from assistive technology                                          | ✅ covered |
| Angular | Two pushed views go back one at a time                    | two pushed views go back one at a time                                               | ✅ covered |
| Angular | Selecting clears the pushed views                         | selecting another item clears the pushed views                                       | ✅ covered |
| Angular | popView on an empty stack                                 | popView on an empty stack keeps the item view                                        | ✅ covered |
| —       | Enter on an item, controlled `value`                      | opens items with Enter and follows a controlled value                                | ✅ new     |
| —       | `useSettings().pushView` from a view                      | pushes views from inside a view with useSettings                                     | ✅ new     |
| —       | `viewTitle`, className, list area width and border        | takes viewTitle as the title of the detail area and lays out the list area           | ✅ new     |
| —       | Focus in a dialog, `settingsDialogConfig` size            | focuses the selected item in a dialog and sizes the dialog with settingsDialogConfig | ✅ new     |
| —       | Small screens, back button name                           | shows the list full width and the view with a back button on small screens           | ✅ new     |
| —       | Profile card name font, `render`                          | renders the profile card name with the bold font and another element with render     | ✅ new     |
| —       | `useSettings` outside a container                         | throws when useSettings is used outside a container                                  | ✅ new     |
| —       | Items without a container                                 | works without a container: the items keep their own selection                        | ✅ new     |

### Visual comparison

`pnpm visual settings`: 11 cases × 16 combinations, **176/176** matching. Cases, on the `UserAccount` story against
fundamental-styles' User account story (its texts; inline at the size of its dialog body): the list area, the selected
item, an item at rest and its link hovered, the detail area, its header bar, the content, the profile card (styles
only: its avatar image is a photo), the name, a subline and the Manage Account button. The window width (1280px) is
the large view mode; md and sm are checked in the spec and by eye.

| Difference                                                            | Cause                                                                                         | Resolution                                          |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Profile card name font and line height (checked before the first run) | Angular uses 72 Semibold Duplex with a 1.4rem line height; fundamental-styles 72 Bold, normal | Fundamental-styles' classes in React; Angular issue |
| Compact: list and detail areas 4px lower (first run, 24/176)          | Our story frame had the cozy body height; fundamental-styles' compact footer bar is 2.5rem    | Story frame `compact:h-[40rem]`                     |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: the inline settings (list with icons and the footer list,
the account view), the open dialog, and the md layout (900px window: the list full width with navigation arrows, as
Angular's; fundamental-styles' md story shows none).
