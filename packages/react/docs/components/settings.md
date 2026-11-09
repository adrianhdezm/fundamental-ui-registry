## settings

Sources: Angular [`registry/ui/settings`](../../../angular/registry/ui/settings/) (itself from
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
