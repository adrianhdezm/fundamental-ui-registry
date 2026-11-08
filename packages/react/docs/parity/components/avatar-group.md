## avatar-group

Sources: fundamental-react: none · Angular [`registry/ui/avatar-group`](../../../../angular/registry/ui/avatar-group/) ·
fundamental-styles: [Avatar Group](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-avatar-group--docs)
Registry: `registry/ui/avatar-group/`, on the registry's `Popover` (Base UI's Popover), `Bar` and `Avatar` (types).

API: the Angular inputs as props: `type` (`individual` | `group`), `size`, `orientation`, `maxVisibleItems`,
`overflowButtonShape` (`square` by default), `overflowPopoverTitle`, `overflowHeadingLevel`, `placement` (by default
`bottom`, `right` for vertical groups) and `ariaLabel` (on the list of an individual group or the hidden name of the
group button, not on the root, as Angular). Angular's `visibleCountChange` is `onVisibleCountChange`. Native props,
`className` and `ref` go to the root `<div>`.

Angular's directives become React parts:

- **`AvatarGroupItem`** is `*fdAvatarGroupItem`: its child is the avatar, `details` the details template
  (`fdAvatarGroupItem`; none when empty), `title` the title (`fdAvatarGroupItemTitle`) and `forceVisibility`
  (`fdAvatarGroupItemForceVisibility`). Items are the children of the group, each with a `key`.
- **`renderOverflowButton(hiddenItems)`** is `<ng-template fdAvatarGroupOverflowButton>` and
  **`renderOverflowBody(items)`** is `<ng-template fdAvatarGroupOverflowBody>`; both get `AvatarGroupItemRef`s
  (`key`, `avatar`, `title`, `details`, `forceVisibility`).
- **`AvatarGroupOverflowList`** is `fd-avatar-group-overflow-list` (the default overflow content), exported for custom
  bodies: `items`, `title`, `headingLevel`, `backLabel`.

Behaviour as Angular: individual groups are a `list` of `listitem`s; an avatar with details is wrapped in a
`role="button"` (Base UI's `Popover.Trigger`, `aria-haspopup="dialog"`) that opens a popover with an arrow, a dialog
named by the item's `title`; focus moves into it and returns on Escape. Avatars that do not fit (widths measured from
the DOM, a `ResizeObserver` on the root) or exceed `maxVisibleItems` (the overflow button takes a slot) go into the
"+N" overflow button (the last list item, named "+N more"), whose popover lists them; choosing one (click, Enter or
Space) shows its details with a back button that returns focus to it. Group-type groups are one `role="button"` with
overlapping avatars (hidden from assistive technology) and a hidden name ("Avatar group, N avatars" or `ariaLabel`),
which opens the list of all avatars. Forced avatars come first. Vertical groups ignore the width. The count is in a
`<bdi dir="ltr">`. Focus on an avatar of an individual group announces "2 of 6" in a polite live region (Angular's
`LiveAnnouncer`). Escape closes the popovers even when their content stops its propagation.

**Differences from Angular, on purpose:**

- **Visuals follow fundamental-styles** (see the visual comparison): the overflow button is an avatar with button
  colours (`fd-avatar--overflow`), the avatars of an individual group take the hover and press colours of interactive
  avatars, and group hover keeps each avatar's own hover background.
- **The avatar is not itself the button** (as Angular, unlike fundamental-styles): its initials as the visible text of
  a button named "Alexander Hamilton" fail axe's `label-content-name-mismatch`; the button wraps the avatar (named by
  it) and passes the hover and press colours down to it.
- **A custom overflow button is named by its content**, not "+N more", which could contradict its text
  (`label-content-name-mismatch` again).
- **Escape** closes the details popovers too when their content stops its propagation (Angular: the overflow list only).
- **`onVisibleCountChange`** fires when the count changes (and once after the first measure); Angular emits after every
  measure.
- **A group that hugs its avatars** (e.g. in a flex row) keeps them: the last avatar's width no longer counts a gap. In
  Angular such a group loses one avatar per measure until only "+12" is left (Angular issue).

### Stories vs. sources

| Source             | Example                                          | React story             | Status     | Notes                                                                                    |
| ------------------ | ------------------------------------------------ | ----------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| Angular            | Individual (resize to overflow)                  | `Individual`            | ✅ covered | Details are a quick view (subheader and contact group) in place of Angular's plain card. |
| Angular            | Group type                                       | `Group`                 | ✅ covered |                                                                                          |
| Angular            | Max visible, square overflow button and vertical | `MaxVisibleAndVertical` | ✅ covered |                                                                                          |
| Angular            | Popover placement                                | `PopoverPlacement`      | ✅ covered |                                                                                          |
| Angular            | Overflow button shape                            | `OverflowButtonShape`   | ✅ covered |                                                                                          |
| Angular            | Open: avatar details                             | `OpenDetails`           | ✅ covered |                                                                                          |
| Angular            | Open: group popover                              | `OpenGroup`             | ✅ covered |                                                                                          |
| Angular            | Open: overflow list                              | `OpenOverflow`          | ✅ covered |                                                                                          |
| fundamental-react  | —                                                | —                       | n/a        | No avatar group in fundamental-react.                                                    |
| fundamental-styles | Overflow, Group Type                             | `Overflow`              | ➕ added   | The same avatars and counts ("+4", "+8"), for the visual comparison.                     |
| —                  | —                                                | `CustomOverflow`        | ➕ added   | `renderOverflowButton`, `renderOverflowBody` with `AvatarGroupOverflowList`.             |
| —                  | —                                                | `OpenOverflowDetails`   | ➕ added   | The details view of the overflow popover, for axe.                                       |
| —                  | —                                                | `Playground`            | ➕ added   | The props as controls.                                                                   |

### Tests vs. sources

| Source  | Behaviour                                                       | React test                                                                                  | Status     |
| ------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| Angular | Avatars that fit, "+N" overflow, list semantics, "+N more" name | shows as many avatars as fit and moves the rest into the overflow button ("+N")             | ✅ covered |
| Angular | No overflow button when all fit                                 | shows all avatars without overflow button when they fit                                     | ✅ covered |
| Angular | maxVisibleItems, forced visibility                              | maxVisibleItems caps the visible avatars; forceVisibility keeps an avatar visible           | ✅ covered |
| Angular | `<bdi dir="ltr">` count in RTL                                  | overflow count is wrapped in `<bdi dir="ltr">` so "+8" stays readable in RTL                | ✅ covered |
| Angular | Individual details popover: name, focus, Escape, Enter, Space   | individual type: each avatar opens its details popover                                      | ✅ covered |
| Angular | Group type opens the list of all avatars                        | group type: the whole group opens the list of all avatars                                   | ✅ covered |
| Angular | Overflow list → details → back, focus                           | overflow popover: list stage → details stage → back button returns and restores focus       | ✅ covered |
| Angular | Re-measures on resize and item changes                          | re-measures when the container resizes or items change                                      | ✅ covered |
| Angular | Group button name, hidden avatars, list label                   | group trigger has an accessible name built from the visible avatars                         | ✅ covered |
| Angular | Overflow button shape                                           | the overflow button is square by default and circular with overflowButtonShape=circle       | ✅ covered |
| Angular | Vertical placement to the right, placement override             | vertical groups open their popovers to the right unless placement is set                    | ✅ covered |
| Angular | Position announcement                                           | focusing an avatar of an individual group announces its position                            | ✅ covered |
| Angular | maxVisibleItems larger than what fits                           | a maxVisibleItems larger than what fits still leaves room for the overflow button           | ✅ covered |
| Angular | Escape with content that stops propagation                      | Escape closes the overflow popover even when its content stops propagation                  | ✅ covered |
| Angular | visibleCountChange                                              | onVisibleCountChange follows changes of maxVisibleItems                                     | ✅ covered |
| Angular | maxVisibleItems 0 and the total count                           | maxVisibleItems: 0 hides every avatar, the total count hides none, and changes apply        | ✅ covered |
| Angular | Group type and maxVisibleItems                                  | group type respects maxVisibleItems                                                         | ✅ covered |
| Angular | Vertical orientation                                            | vertical orientation caps by maxVisibleItems and ignores the container width                | ✅ covered |
| Angular | Shape in group-type groups                                      | overflowButtonShape applies to group-type groups and follows changes                        | ✅ covered |
| —       | Escape in a details popover                                     | Escape closes a details popover even when its content stops propagation                     | ✅ covered |
| —       | Custom overflow button and body                                 | renderOverflowButton and renderOverflowBody replace the overflow button and popover content | ✅ covered |
| —       | Custom overflow button name                                     | a custom overflow button is named by its content                                            | ✅ covered |
| —       | No details: no button; `AvatarGroupOverflowList` alone          | avatars without details are not buttons; the overflow list exports on its own               | ✅ covered |
| —       | fundamental-styles hover colours                                | avatars take the hover colours of their button, and of the whole group in group-type groups | ✅ covered |
| —       | Shrink-wrapped group (Angular issue)                            | a group that hugs its avatars (in a flex row) keeps them                                    | ✅ covered |
| —       | Prop spreading, ref (registry convention)                       | passes className, native props and the ref to the root (registry convention)                | ✅ covered |

### Visual comparison

`pnpm visual avatar-group`: 9 cases × 16 combinations, 120/144 matching, the 24 others kept (below). Our
`Overflow (fundamental-styles)` story has the avatars and counts of fundamental-styles' Overflow story (four small
avatars and a circle "+4") and Group Type story (six medium avatars and "+8"). Compared: the gap of the individual row;
an individual avatar at rest and on hover (pixels); the overflow button at rest, on hover and with keyboard focus
(pixels); the first avatar of the group type (pixels, with the overlapping icon avatar); the overlap margins of the
second avatar and of the group's overflow button (styles: photos differ). Cozy and compact in Horizon, LTR and RTL,
were also checked by eye (Individual, Group type, Max visible and vertical, Overflow, Custom overflow and the open
details, group and overflow popovers).

| Difference                                                                                                                                                                                                                                                                                                                    | Cause                                                                              | Resolution                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overflow button: avatar 1 colours (yellow in Horizon), bold, `--sapFontSize` text, a fixed square of the avatar size; fundamental-styles: button colours (`--sapButton_Background`, `_BorderColor`, `_TextColor`), normal weight, the avatar's font size, as wide as the count (`padding-inline: 0.5rem`), a pill when circle | Angular's overflow button classes do not follow `fd-avatar--overflow`              | Fixed: the button colours, hover (`--sapButton_Hover_Background`, the avatars' hover border, as fundamental-styles computes it) and press colours, the avatar's font size and height, `w-fit px-2` in a row, half-height radius when circle. Angular issue. |
| Overflow button with keyboard focus: no padding; fundamental-styles adds `padding-block: 0.125rem` (`.fd-avatar[tabindex="0"]:focus`)                                                                                                                                                                                         | The focus styles of interactive avatars                                            | Fixed: `focus:py-0.5`, and the avatars' focus frame (`-0.3125rem`).                                                                                                                                                                                         |
| Individual avatars: no hover or press colours, focus frame `0.25rem` outside; fundamental-styles' avatar buttons take `--sapAvatar_Hover_BorderColor` and their hover background on hover, button active colours when pressed, focus frame `0.3125rem` outside                                                                | Angular's wrapper button has only a focus ring                                     | Fixed: the wrapper passes the interactive avatar's hover, press and press-hover colours to its avatar, and its focus frame is `0.3125rem` outside. Angular issue.                                                                                           |
| Group type hover: every avatar gets `--sapAvatar_6_Hover_Background`; fundamental-styles keeps each avatar's own hover background (`--fdAvatarHoverBackgroundColor`) and colours the overflow button too                                                                                                                      | Angular sets fixed tokens on the avatars                                           | Fixed: the group sets each avatar's (and the overflow button's) own hover, press and press-hover variables. Angular issue.                                                                                                                                  |
| Overflow button in RTL (rest, hover, focus; 24): "+4" against "4+" (3.3–3.7% of pixels)                                                                                                                                                                                                                                       | fundamental-styles lets the bidi algorithm move the "+" to the end in RTL          | Kept: the count stays "+4" in a `<bdi dir="ltr">`, as Angular (and its spec); "4+" reads as another number.                                                                                                                                                 |
| Group overflow button pixels (5–10%)                                                                                                                                                                                                                                                                                          | The corners of its box show the photo of the avatar beneath, another photo in each | Not a difference: the case compares styles only (they match).                                                                                                                                                                                               |
