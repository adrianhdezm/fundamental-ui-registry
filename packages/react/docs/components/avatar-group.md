## avatar-group

Sources: fundamental-react: none · Angular [`registry/ui/avatar-group`](../../../angular/registry/ui/avatar-group/) ·
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                              | Cause                                                                     | Resolution                                                                                                  |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Overflow button in RTL (rest, hover, focus; 24): "+4" against "4+" (3.3–3.7% of pixels) | fundamental-styles lets the bidi algorithm move the "+" to the end in RTL | Kept: the count stays "+4" in a `<bdi dir="ltr">`, as Angular (and its spec); "4+" reads as another number. |
