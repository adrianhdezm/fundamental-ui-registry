## avatar

Sources: fundamental-react [Avatar](https://github.com/SAP/fundamental-react/tree/main/src/Avatar) · Angular
[`registry/ui/avatar`](../../../angular/registry/ui/avatar/) · fundamental-styles
[Avatar](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-avatar--docs)
Registry: `registry/ui/avatar/`, on Base UI's `Avatar` (`Avatar.Root`, `Avatar.Image`, `Avatar.Fallback`).

API: the Angular inputs as props: `label`, `size` (`xs`, `s`, `m`, `l` (default), `xl`, and the aliases `sm`, `md`,
`lg`), `font`, `glyph`, `zoomGlyph`, `circle`, `interactive`, `transparent`, `contain`, `placeholder`, `tile`,
`border`, `colorAccent`, `colorIndication`, `random`, `clickable`, `valueState`, `image`, `alterIcon`, `backupImage`,
and `aria-label`/`aria-labelledby`/`id`/`tabIndex`/`role` as native props. Angular's outputs are `onAvatarClick`
(`avatarClicked`, with the click or key event) and `onZoomGlyphClick` (`zoomGlyphClicked`). Angular's host `alt`
attribute is the `alt` prop, and its projected content is `children`: hidden, read for the "content" fallback, as in
Angular. `avatarInitials`, `labelColorAccent` and `randomColorAccent` are exported as in Angular. The id defaults to
a generated `fd-avatar-…` one. Base UI's `onLoadingStatusChange` is `onImageLoadingStatusChange` (statuses of the
image, then of the backup image).

fundamental-react's props map to these: `glyph`, `size`, `circle`, `transparent`, `border`, `placeholder`, `tile` and
`role` as they are; `color` (1-9) is `colorAccent` (1-10); `backgroundImageUrl` is `image`; `zoom` is
`zoomGlyph="edit"`; `label` stays the accessible name and also gives the initials, so fundamental-react's visible
children (`<Avatar label="Wendy Wallace">WW</Avatar>`) become `<Avatar label="Wendy Wallace" />`; `zoomLabel` is not
ported (see below); `cssNamespace` is gone.

Base UI: `Avatar.Root` is the root `<span>`, `Avatar.Image` loads the image (one request per URL, ignoring a late
answer for an earlier URL) and `Avatar.Fallback` holds the initials or icon until the image has loaded. As in
fundamental-styles and Angular, the image is painted as the root's background (`cover`, or `contain`), so
`Avatar.Image` renders an empty hidden `<span>` instead of an `<img>`, and the root reads Base UI's loading status for
its background. When the image fails, the `alterIcon` options are tried in order, as Angular's: "content" (initials
of the children's text), "alt", "backup" (`backupImage`, through the same `Avatar.Image`), "default-icon"; then the
person placeholder icon.

ARIA and keyboard, as Angular's: `role="img"` with the name from `aria-label`, `label`, the fallback text or `alt`;
`role="presentation"` without a name; `role="button"` and `tabIndex={0}` when `clickable` or with a `zoomGlyph`, with
Enter and Space acting as a click. A mouse down on the badge keeps the focus on the avatar, and the click reaches the
avatar. Icons inside the avatar are decorative (`aria-hidden`). A `role` prop wins (fundamental-react's `role`, e.g. a
button that opens a popover).

**Differences on purpose:**

- A `glyph` is part of the fallback: it shows while there is no loaded image, and the image replaces it. Angular
  draws the glyph over a loaded image.
- Returning to an image the avatar loaded before creates a new `Image` request (Base UI's loader), which the browser
  answers from its memory cache at once, so the image shows without the initials in between; Angular keeps its own
  set of loaded URLs and makes no request. The test checks the visible result.
- fundamental-react's `zoomLabel` (a name on the zoom icon) is not ported: as in Angular, the whole avatar is the
  button and the badge is decorative; the avatar's `aria-label` describes the action.
- fundamental-react's `role=""` when children are passed is not kept: the role follows Angular's rules.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                          | Cause                                                                                                   | Resolution                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Value state avatars: cursor `auto`; fundamental-styles `pointer`    | fundamental-styles' value state examples are edit buttons; ours (and Angular's) are images              | Kept; `cursor` is not compared for these cases.     |
| Bordered image avatars: cursor `auto`; fundamental-styles `pointer` | fundamental-styles' only bordered images are the clickable avatars of its avatar group; ours are images | Kept; `cursor` is not compared for these cases.     |
| Image avatars: other `background-image`                             | fundamental-styles' portraits and landscapes against `assets/person.svg` and `assets/landscape.svg`     | Kept: compared by computed style without the image. |
