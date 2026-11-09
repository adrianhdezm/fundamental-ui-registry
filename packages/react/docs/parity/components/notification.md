## notification

Sources: Angular [`registry/ui/notification`](../../../../angular/registry/ui/notification/) (itself from
`@fundamental-ngx/core`'s notification and `NotificationService`) · no fundamental-react source · fundamental-styles
[Notifications](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-notifications--docs)
Registry: `registry/ui/notification/`: the parts on Base UI's `useRender` (each renders its element or `render`), the
service as a provider and hooks in the React form of the dialog service. Uses `Icon` (group header arrow) and `Link`
(More/Less).

API, as Angular's:

| Angular                                                                                                          | React                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `fd-notification` (`width`, `selected`, `actionKeyHandler`, `class`)                                             | `Notification` (`width`, `selected`, `onActionKey(event, 'enter' \| 'delete')`, `className`)                    |
| `fd-notification-body`, `-content`, `-header`, `-actions`                                                        | `NotificationBody`, `NotificationContent`, `NotificationHeader` (`id`), `NotificationActions`                   |
| `[fd-notification-title]` (`unread`, `id`), `[fd-notification-paragraph]` (`id`)                                 | `NotificationTitle` (an `<h4>`; `unread`, `id`), `NotificationParagraph` (a `<p>`; `id`)                        |
| `fd-notification-footer` (`manualShowTrigger`, `[(manualExpanded)]`, `moreLabel`, `lessLabel`)                   | `NotificationFooter` (`showTrigger`, `expanded`/`defaultExpanded`/`onExpandedChange`, `moreLabel`, `lessLabel`) |
| `[fd-notification-footer-content]`, `[fd-notification-separator]`                                                | `NotificationFooterContent`, `NotificationSeparator`                                                            |
| `[fd-notification-message-strip-container]`, `[fd-notification-message-strip]`                                   | `NotificationMessageStripContainer`, `NotificationMessageStrip`                                                 |
| `[fd-notification-list]` (`ariaLabel`), `[fd-notification-popover]`                                              | `NotificationList` (a `<ul>`; `aria-label`, default "Notifications"), `NotificationPopover`                     |
| `fd-notification-group` (`expanded`, `ariaLabel`, `expandedDescription`, `collapsedDescription`)                 | `NotificationGroup` (an `<li>`; `defaultExpanded`, plus `expanded`/`onExpandedChange`, the descriptions)        |
| `fd-notification-group-header` (`title`), `[fd-notification-group-header-title]` (`ariaLevel`, `id`)             | `NotificationGroupHeader` (`title`), `NotificationGroupHeaderTitle` (`ariaLevel`, `id`)                         |
| `fd-notification-group-list` (`id`)                                                                              | `NotificationGroupList` (a `<ul>`; `id`)                                                                        |
| `fd-notification-group-growing-item` (`ariaLabel`), `-growing-item-title`                                        | `NotificationGroupGrowingItem` (`aria-label`), `NotificationGroupGrowingItemTitle`                              |
| `NotificationService` (`providedIn: 'root'`)                                                                     | `<NotificationProvider>` at the root of the app, `useNotificationService()` below it                            |
| `open(Component \| TemplateRef, config)`                                                                         | `open(<MyNotification />, config)` (reads `useNotificationRef()`) or `open((ref) => …, config)`                 |
| `notifications()` signal, `isAnyOpened()`, `destroyAll()`                                                        | `notifications` (re-renders the component that reads it), `isAnyOpened()`, `destroyAll()`                       |
| `NotificationRef`: `data`, `close(result)`, `dismiss(reason)`, `afterClosed` (errors on dismiss)                 | `data`, `close(result)`, `dismiss(reason)`, `isClosed`; `afterClosed` resolves `{ status, value, reason }`      |
| config `id`, `data`, `width`, `ariaLabel`, `ariaLabelledBy`, `shouldTrapFocus` (true), `escKeyCloseable` (false) | the same `NotificationConfig`                                                                                   |
| `fd-notification-container`, `fd-notification-host`                                                              | internal: the provider's portal column and each notification's ref/config contexts                              |
| —                                                                                                                | `<NotificationProvider container>`: the element the banners are rendered in (default `body`)                    |

Behaviour, as Angular's:

- **Naming and descriptions:** a notification is named by its first title, else its first paragraph
  (`aria-labelledby`), or by the service config's `ariaLabel` / `ariaLabelledBy`. The buttons of
  `NotificationActions` get `aria-describedby` of the first header unless they have one; a `MutationObserver` covers
  buttons added later.
- **More/Less:** a `ResizeObserver` on the notification shows the link while the title or paragraph is cut off (or
  the texts are expanded); the link is a `Link` with `role="button"`, `aria-expanded` and Angular's labels ("More
  button. Show the full texts." / "Less button. Show less text."), toggled by click, Enter and Space. Expanded, the
  title and paragraph drop their two-line clamp.
- **Groups:** the header is a `role="button"` with `aria-expanded`, `aria-controls` (the group list) and the
  `Expand/Collapse` title; Enter and Space toggle it; the arrow is `slim-arrow-right` (mirrored in RTL) or
  `slim-arrow-down`. The group is a `listitem` of level 1, `tabindex="-1"`, named by its header title and described
  as expanded/collapsed. Notifications in a group list are list items of level 2; ArrowUp/ArrowDown, Home and End
  move between them and keep the focused element (e.g. the second action button) by its child path.
- **onActionKey:** Enter and Delete/Backspace on the notification, not from its buttons, links or fields.
- **Service:** banners are a column 2rem from the top end of the screen (`z-[5000]`, max 26rem, mirrored in RTL from
  Base UI's `useDirection`) with `--sapContent_Shadow2`. With `shouldTrapFocus` a banner takes the focus, Tab and
  Shift+Tab wrap inside it (without focusable `aria-hidden` anchors), and when it closes the focus goes to the newest
  remaining banner, or back to the element focused before. `escKeyCloseable` dismisses it with the reason "escape".

**Differences from Angular, on purpose:**

- Notifications in a `NotificationList` or `NotificationGroupList` render an `<li>` (Angular: the `fd-notification`
  element inside a `<ul>`, which axe reports), and groups an `<li>`; fundamental-styles' markup is the same.
- `NotificationGroup` takes `defaultExpanded` (Angular's `expanded`, the initial state) and also `expanded` /
  `onExpandedChange` for a controlled group; `NotificationFooter`'s `expanded` / `onExpandedChange` are Angular's
  `[(manualExpanded)]`, `showTrigger` its `manualShowTrigger`. Collapsed groups do not render their list and growing
  item (Angular: content projection inside `@if`).
- `NotificationGroupGrowingItem` (a `role="button"`) activates with Enter and Space (Angular: click only).
- `afterClosed` is a Promise of `{ status: 'closed' | 'dismissed', value, reason }`, as the React dialog service's
  (Angular: an Observable that errors on dismiss).
- The focus to restore is taken when the first focus-trapping banner opens (Angular: when the first banner opens, so
  a non-trapping banner opened first lost it). Unmounting the provider closes its banners.
- The group header has fundamental-styles' transparent bottom border (computed styles only).
- The banner shadow is written `[box-shadow:var(--sapContent_Shadow2)]`, as the repository's convention for shadows.

### Stories vs. sources

| Source             | Example                | React story    | Status     | Notes                                                                                                    |
| ------------------ | ---------------------- | -------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| Angular            | Notifications          | `States`       | ✅ covered | Unread, selected, long (More/Less), overflow actions (`ActionSheet`), a message strip.                   |
| Angular            | Groups in a popover    | `Group`        | ✅ covered | `Popover` with a header, a dismissible strip and two groups; Enter/Delete report an action.              |
| Angular            | Service                | `Service`      | ✅ covered | From a component (25rem, data, close/dismiss) and from a render function (`escKeyCloseable`), Close all. |
| Angular            | Open: groups           | `OpenGroup`    | ✅ covered | `play` opens the popover.                                                                                |
| Angular            | Open: overflow actions | `OpenOverflow` | ✅ covered | `play` opens the action sheet.                                                                           |
| Angular            | Open: service banner   | `OpenService`  | ✅ covered | `play` opens a banner.                                                                                   |
| fundamental-styles | Primary                | `Primary`      | ✅ new     | Its four notifications and texts (the first with `showTrigger`): the visual reference.                   |
| fundamental-styles | Notification group     | `Groups`       | ✅ new     | The popover body inline: message strip, expanded and collapsed groups, growing item.                     |
| fundamental-styles | Notification banner    | `OpenBanners`  | ✅ new     | Two banners from the service, rendered in the story root (`container`).                                  |
| fundamental-react  | —                      | —              | ➖ n/a     | No fundamental-react source.                                                                             |

### Tests vs. sources

| Source  | Behaviour                                                         | React test                                                                                                      | Status     |
| ------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------- |
| Angular | Group header expands, aria-controls, listitem, labelledby, arrows | expands a group from its header and lists its notifications                                                     | ✅ covered |
| Angular | More/Less for truncated texts                                     | offers More/Less for truncated texts (also Enter/Space, the focus stays on the link)                            | ✅ covered |
| Angular | Service banner: focus, Escape, focus return                       | opens banners with the service, focuses them and returns the focus                                              | ✅ covered |
| Angular | Action buttons described by the first header                      | describes the action buttons by the first header and keeps existing descriptions                                | ✅ covered |
| Angular | No description without a header                                   | does not describe the action buttons without a header                                                           | ✅ covered |
| Angular | Tab trap without aria-hidden anchors                              | keeps Tab inside a banner without focusable aria-hidden anchors                                                 | ✅ covered |
| Angular | Labels of list, group, heading, growing item                      | lists and groups › labels the list, the group, its heading and the growing item                                 | ✅ covered |
| Angular | Space toggles the header, other keys do not                       | lists and groups › toggles the group header with Space and ignores other keys                                   | ✅ covered |
| Angular | Arrow glyphs, mirrored in RTL                                     | lists and groups › points the header arrow right when collapsed and down when expanded, mirrored in RTL         | ✅ covered |
| Angular | ArrowUp and Home                                                  | lists and groups › moves between notifications with ArrowUp and Home                                            | ✅ covered |
| Angular | Keeps the focused button column                                   | lists and groups › keeps the focused action button column across notifications                                  | ✅ covered |
| Angular | actionKeyHandler keys                                             | lists and groups › runs onActionKey on Enter, Delete and Backspace but not on other keys or from nested buttons | ✅ covered |
| Angular | Labelled by the paragraph without a title                         | lists and groups › labels a notification without a title by its paragraph                                       | ✅ covered |
| Angular | Template banners and destroyAll                                   | opens a banner from a template and destroyAll closes every banner                                               | ✅ covered |
| —       | Native props, className, ref, width, `render`                     | passes native props, className and the ref to the root, and renders another element with render                 | ✅ new     |
| —       | Selected and unread                                               | shows the selected and unread states                                                                            | ✅ new     |
| —       | `<li>` in a NotificationList                                      | renders list items in a NotificationList                                                                        | ✅ new     |
| —       | `showTrigger`, controlled `expanded`, labels                      | takes control of the More/Less link with showTrigger and expanded                                               | ✅ new     |
| —       | Controlled group, growing item keys                               | controls a group with expanded and onExpandedChange, and the growing item works with the keyboard               | ✅ new     |
| —       | Config id, aria-label, width, shadow, position                    | applies the config of the service: id, aria-label, width and the banner shadow                                  | ✅ new     |
| —       | RTL position                                                      | places the banners at the top left in RTL                                                                       | ✅ new     |
| —       | Focus to the newest banner, `shouldTrapFocus: false`              | moves the focus to the newest remaining banner and leaves the focus alone without shouldTrapFocus               | ✅ new     |
| —       | Provider unmount                                                  | closes its notifications when the provider unmounts                                                             | ✅ new     |
| —       | Hooks outside their provider                                      | throws when the hooks are used outside their provider or notification                                           | ✅ new     |

### Visual comparison

`pnpm visual notification`: 21 cases × 16 combinations, **240/336** matching: 168/168 in Horizon and Horizon Dark,
72/168 in the HC themes, where fundamental-styles cannot render the notification (below). Cases, on our
fundamental-styles stories (its texts): the four notifications of Primary (unread with status icon, More link and
object status; long texts clamped with two actions; without avatar; hover; focus), the unread and the read title (room
for one and two actions), the clamped paragraph, the footer, a footnote, a separator, the More link, the actions; from
the Notification group story the expanded and collapsed group headers, a header title, a notification in a group, the
growing item at rest and hovered and the popover message strip; and a banner opened by the service against the
Notification banner story (shadow included).

| Difference                                                                                                                                                                                                     | Cause                                                                                                                                                                                                                         | Resolution                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Group header without fundamental-styles' 1px transparent bottom border (computed only)                                                                                                                         | Not in Angular                                                                                                                                                                                                                | Added; Angular issue (computed only)                                                                                                                                        |
| Footer 1170px wide instead of 298px (computed width only)                                                                                                                                                      | Angular's footer has `w-full`; fundamental-styles' is as wide as its footnotes, so their 50% maximum resolves against themselves and two short footnotes get truncated                                                        | Kept `w-full` (seen by eye: "Product na…"); the footer case compares styles without the width, and the footnote, separator and More link cases pixels                       |
| HC themes: top and side borders white/black instead of the list border colour, square corners, no hover background, header title 14px, group list and growing item without the 0.5rem side margins (96 of 168) | fundamental-styles defines its `--fdNotification_*` theme variables only for Horizon and Horizon Dark: in HC the variables are missing, so those properties fall back to `currentcolor`, `0`, transparent, the inherited size | Kept: ours uses the SAP tokens of each theme (`--sapList_BorderColor`, `--sapTile_BorderCornerRadius`, `--sapList_Hover_Background`, `--sapFontHeader5Size`), as in Horizon |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Notifications (unread, selected, More link on the long
one, overflow and message strip), Groups in a popover (open), and a service banner (top end, mirrored to the top left
in RTL, focused with the SAP focus outline).
