## avatar

Sources: fundamental-react [Avatar](https://github.com/SAP/fundamental-react/tree/main/src/Avatar) · Angular
[`registry/ui/avatar`](../../../../angular/registry/ui/avatar/) · fundamental-styles
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

### Stories vs. sources

| Source             | Example                                  | React story          | Status     | Notes                                                                                               |
| ------------------ | ---------------------------------------- | -------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| fundamental-react  | primary                                  | `Playground`         | ✅ covered |                                                                                                     |
| fundamental-react  | sizes                                    | `Sizes`              | ✅ covered |                                                                                                     |
| fundamental-react  | initials                                 | `Initials`           | ✅ covered | "Wendy Wallace" row; the initials come from `label`.                                                |
| fundamental-react  | circle                                   | `Circle`             | ✅ covered | Person placeholder (fundamental-styles) instead of the washing machine.                             |
| fundamental-react  | backgroundImage                          | `BackgroundImage`    | ✅ covered | `assets/person.svg` in circles.                                                                     |
| fundamental-react  | transparent                              | `Transparent`        | ✅ covered |                                                                                                     |
| fundamental-react  | tile                                     | `Tile`               | ✅ covered |                                                                                                     |
| fundamental-react  | placeholder                              | `Placeholder`        | ✅ covered |                                                                                                     |
| fundamental-react  | zoom                                     | `ZoomIcon`           | ✅ covered | `zoomGlyph="edit"`.                                                                                 |
| fundamental-react  | border                                   | `Border`             | ✅ covered |                                                                                                     |
| fundamental-react  | accentColors                             | `AccentColors`       | ✅ covered | Accents 1-10 with fundamental-styles' product icon.                                                 |
| fundamental-react  | noStyles                                 | —                    | ➖ n/a     | No `cssNamespace`.                                                                                  |
| Angular            | Playground                               | `Playground`         | ✅ covered |                                                                                                     |
| Angular            | Icon                                     | `Icon`               | ✅ covered | Plus fundamental-styles' product and person placeholder rows.                                       |
| Angular            | Initials                                 | `Initials`           | ✅ covered | "Wendy Wallace" (fundamental-styles) in place of "Jane Doe".                                        |
| Angular            | Circle                                   | `Circle`             | ✅ covered |                                                                                                     |
| Angular            | Background image                         | `BackgroundImage`    | ✅ covered |                                                                                                     |
| Angular            | Transparent                              | `Transparent`        | ✅ covered |                                                                                                     |
| Angular            | Placeholder                              | `Placeholder`        | ✅ covered |                                                                                                     |
| Angular            | Tile                                     | `Tile`               | ✅ covered |                                                                                                     |
| Angular            | Accent and indication colors             | `AccentColors`       | ✅ covered |                                                                                                     |
| Angular            | Zoom icon                                | `ZoomIcon`           | ✅ covered | fundamental-styles' Badge story: edit badges, person placeholder and "WW" rows.                     |
| Angular            | Border                                   | `Border`             | ✅ covered | Plus a row of bordered images, as fundamental-styles' avatar group thumbnails.                      |
| Angular            | Image with alternative options           | `AlternativeOptions` | ✅ covered |                                                                                                     |
| Angular            | Value states                             | `ValueStates`        | ✅ covered | fundamental-styles' order and person placeholder icon.                                              |
| fundamental-styles | Interactive                              | `InteractiveStates`  | ✅ covered | Regular, toggled (`aria-pressed`) and disabled (`aria-disabled`) rows in fundamental-styles' order. |
| fundamental-styles | Color variations in Shell header context | —                    | ⬜ missing | Avatars in the shell bar: after shellbar.                                                           |
| fundamental-styles | Badge Indication Colors                  | —                    | ➖ n/a     | Badges in indication colours: neither Angular nor fundamental-react has them.                       |

### Tests vs. sources

| Source            | Behaviour                                                | React test                                                                                                 | Status     |
| ----------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Initials from label, glyph, image as background          | renders initials from label, a glyph, or the image as background                                           | ✅ covered |
| Angular           | alterIcon fallbacks (content, alt, backup, default icon) | falls back through alterIcon order (content, alt, backup image, default icon) when the image fails to load | ✅ covered |
| Angular           | role img / presentation, aria-label, decorative icon     | has role img with the aria-label, or is presentational without one                                         | ✅ covered |
| Angular           | Clickable: button role, tabindex, Enter, Space, click    | clickable avatar is a button: focusable, Enter and Space call onAvatarClick                                | ✅ covered |
| Angular           | Zoom glyph badge, focus kept, keyboard                   | zoom glyph shows a badge that calls onZoomGlyphClick                                                       | ✅ covered |
| Angular           | Size, circle, border, tile, transparent, accent tokens   | size, circle, border, tile, transparent and colorAccent apply the expected token classes                   | ✅ covered |
| Angular           | contain                                                  | contain scales the image to fit instead of covering                                                        | ✅ covered |
| —                 | Border wins over the loaded-image border                 | border wins over the loaded-image border, as fundamental-styles bordered thumbnails                        | ✅ covered |
| Angular           | placeholder                                              | placeholder uses the image placeholder background and foreground tokens                                    | ✅ covered |
| Angular           | colorIndication, accent wins                             | colorIndication applies the indication background and text tokens; an accent wins over it                  | ✅ covered |
| Angular           | valueState badge                                         | valueState shows the state badge with its icon and colour instead of the zoom glyph                        | ✅ covered |
| Angular           | random accent stable per label                           | random color accent is stable for the same label                                                           | ✅ covered |
| Angular           | Previously loaded URL without a new request              | returns to a previously loaded URL at once, from the browser image cache, without the initials             | ✅ covered |
| Angular           | One request per URL, no reload on re-render              | loads an image once and does not reload when the same URL is set again or the avatar re-renders            | ✅ covered |
| Angular           | Late earlier image ignored                               | ignores a slower earlier image when the URL changes quickly                                                | ✅ covered |
| Angular           | Failing image requested once                             | a failing image is requested only once before falling back                                                 | ✅ covered |
| —                 | Base UI loading status                                   | reports the image loading status                                                                           | ✅ covered |
| fundamental-react | Prop spreading                                           | passes className, native props and the ref through; role presentation without a name                       | ✅ covered |
| fundamental-react | role presentation by default                             | passes className, native props and the ref through; role presentation without a name                       | ✅ covered |
| fundamental-react | Forwards the ref (a `<span>`)                            | passes className, native props and the ref through; role presentation without a name                       | ✅ covered |
| fundamental-react | Empty role when children are passed                      | —                                                                                                          | ➖ n/a     |

### Visual comparison

`pnpm visual avatar`: 135 cases × 16 combinations, 2160/2160 matching after the fixes below (the high-contrast themes
rerun after the lite image colours fix, which resolve to the same transparent values in Horizon and Horizon Dark; the
bordered image cases rerun after ignoring their cursor). With the bordered image fix, `pnpm visual overflow-layout`
goes from 120/128 to 128/128. Cases, by pixels and computed style unless noted: initials, icon (product) and circle icon (person placeholder)
in all five sizes; circle initials in all five sizes; transparent, placeholder and tile avatars (xs and xl); accent
colours 1-10 and indication colours 1-10; bordered transparent avatars, square with an icon and circle with initials (xs
and xl); bordered circle images (xs and xl, by computed style against the thumbnails of fundamental-styles' Avatar Group
Overflow story, its only bordered images); the zoom badge avatars (circle with an icon and square with initials, five sizes each) and the badge itself in
five sizes; the four value state avatars and their badges; from fundamental-styles' Interactive story, eleven avatars
(circle icon and initials xs and xl, placeholder, tile, transparent, transparent with a border square and circle,
indication 1 and 10) each at rest, on hover, toggled (fundamental-styles' active/toggled), disabled (not for the
indication colours, which fundamental-styles has no disabled example of) and focused; and image avatars (four sizes and
shapes, plus contain and the interactive one) by computed style only, as the images differ. Horizon cozy and compact,
LTR and RTL were reviewed by eye (`Initials`, `ZoomIcon`, `ValueStates`, `InteractiveStates`, `BackgroundImage`,
`AlternativeOptions`).

| Difference                                                                                                                                                                                                                                                                | Cause                                                                                                                                                                           | Resolution                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Circles: border radius `3.35544e+07px` (Tailwind's `rounded-full`); fundamental-styles `100%`                                                                                                                                                                             | `rounded-full` on the circle, its focus frame and the badge, as in Angular; the same shape, another computed value                                                              | Fixed: `rounded-[100%]`. Angular issue (computed styles only).                                                                                                  |
| Bordered transparent, tile and placeholder avatars have no border (transparent instead of `--sapGroup_ContentBorderColor`); on hover, `--sapContent_IconColor` instead of `--sapAvatar_Hover_BorderColor`                                                                 | The `--av-border` of `transparent`, `tile` and `placeholder` comes after the one of `border`, and `tailwind-merge` keeps the last (as in Angular)                               | Fixed: `border` comes after them and also sets the hover border to `--sapAvatar_Hover_BorderColor`. Angular issue.                                              |
| Image avatars keep the accent background and border colour around the image (e.g. a light blue ring in Horizon); fundamental-styles' thumbnail uses `--sapAvatar_Lite_Background` and `--sapAvatar_Lite_BorderColor` (transparent in Horizon and Dark, black/white in HC) | Angular sets only the background image                                                                                                                                          | Fixed: a loaded image switches the avatar to the lite background and border. Angular issue.                                                                     |
| Bordered image avatars: border transparent (`--sapAvatar_Lite_BorderColor`) instead of `--sapGroup_ContentBorderColor` (Horizon and Dark; found by the overflow-layout port in its avatar group)                                                                          | The loaded-image classes came after `border` and `tailwind-merge` kept their `--av-border`; fundamental-styles' `fd-avatar--thumbnail fd-avatar--border` keeps the group border | Fixed: `border` comes last, after the loaded-image classes. Not an Angular issue: Angular sets no border for loaded images, so `border` keeps its colour there. |
| Value state badges: border in the state border colour (e.g. `--sapErrorBorderColor`, #e90b0b); fundamental-styles uses the state text colour (#aa0808)                                                                                                                    | Angular's state classes use the border tokens                                                                                                                                   | Fixed: `border-sap-negative-text-color` and the other text colours. Angular issue.                                                                              |
| Zoom and value state badges: line height `normal`; fundamental-styles 1 (e.g. 12px)                                                                                                                                                                                       | The icon's `leading-none` comes before the badge's font size, so `tailwind-merge` drops it (as in Angular)                                                                      | Fixed: `leading-none` after the badge's font size. Angular issue (computed styles only).                                                                        |
| Value state avatars: cursor `auto`; fundamental-styles `pointer`                                                                                                                                                                                                          | fundamental-styles' value state examples are edit buttons; ours (and Angular's) are images                                                                                      | Kept; `cursor` is not compared for these cases.                                                                                                                 |
| Bordered image avatars: cursor `auto`; fundamental-styles `pointer`                                                                                                                                                                                                       | fundamental-styles' only bordered images are the clickable avatars of its avatar group; ours are images                                                                         | Kept; `cursor` is not compared for these cases.                                                                                                                 |
| Image avatars: other `background-image`                                                                                                                                                                                                                                   | fundamental-styles' portraits and landscapes against `assets/person.svg` and `assets/landscape.svg`                                                                             | Kept: compared by computed style without the image.                                                                                                             |
