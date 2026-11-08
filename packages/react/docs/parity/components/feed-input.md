## feed-input

Sources: Angular [`registry/ui/feed-input`](../../../../angular/registry/ui/feed-input/) (itself from
`@fundamental-ngx/core`'s feed-input) · no fundamental-react source · fundamental-styles
[Feed Input](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-feed-input--docs).
Registry: `registry/ui/feed-input/`: `FeedInput`, `FeedInputAvatar`, `FeedInputTextarea`, `FeedInputButton`. Built on
Avatar, Button (Base UI's Button), Icon and the field styles of Input (`fieldBase`, `textareaBase`). No Base UI
primitive applies to the group or the growing text area.

API:

| Angular                                                      | React                                                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `fd-feed-input` `disabled`, `ariaLabel`, `class`             | `FeedInput` `disabled`, `aria-label`, `className` (on the `role="group"` root)          |
| `fdFeedInputAvatar` (directive on an `fd-avatar`)            | `FeedInputAvatar`: an `Avatar` with the same props, size `s` by default                 |
| `textarea[fdFeedInputTextarea]` `fdFeedInputTextareaMaxRows` | `FeedInputTextarea` `maxRows`                                                           |
| `fdFeedInputTextarea` `(valueChange)`                        | `FeedInputTextarea` `onValueChange`, with `value` (controlled) or `defaultValue`        |
| `button[fdFeedInputButton]` `ariaLabel` (default "Send")     | `FeedInputButton` `aria-label` (default "Send", also the `title`); other `Button` props |

Behaviour as Angular: the text area starts at one row and, on every change, fits its height to its text
(`scrollHeight` plus the borders) up to `maxRows` rows (the line height times the rows; a `normal` line height counts
as 1.1 times the font size) or 20rem without `maxRows`, then scrolls. An initial text is fitted on mount; an empty one
keeps its natural height until the first change. The send button (paper plane, mirrored in RTL, always cozy) is
disabled (`disabled` and `aria-disabled`) while the feed input is disabled or the text is empty or only spaces. A
disabled feed input disables the text area and keeps its placeholder readable (upright, text colour, full opacity,
`cursor: not-allowed`). Below 20rem (a container query on the group) the avatar hides and the vertical margin goes.

**Differences on purpose:**

- The root is the `role="group"` element itself, and it is the size container: Angular's `fd-feed-input` host
  (`block h-full @container`) wraps the group; one element less, the same layout.
- `FeedInputAvatar` renders the avatar (Angular's directive goes on an `fd-avatar` the user writes) and defaults to
  size `s`, the size of fundamental-styles' thumbnail.
- The text area takes `value`/`defaultValue`/`onValueChange` like the other React fields; a controlled value set from
  outside is fitted too (Angular fits only on input events and on the first render).
- Outside a `FeedInput` the button is never disabled by the text (as in Angular, where it reads no feed).

### Stories vs. sources

| Source             | Example              | React story         | Status     | Notes                                                  |
| ------------------ | -------------------- | ------------------- | ---------- | ------------------------------------------------------ |
| Angular            | Default              | `Default`           | ✅ covered | The send button posts the text below                   |
| Angular            | Circle avatar        | `CircleAvatar`      | ✅ covered |                                                        |
| Angular            | Placeholder avatar   | `PlaceholderAvatar` | ✅ covered |                                                        |
| Angular            | No avatar            | `NoAvatar`          | ✅ covered |                                                        |
| Angular            | Grow up to 7 rows    | `Grow`              | ✅ covered | Starts with fundamental-styles' four-line text         |
| Angular            | Disabled             | `Disabled`          | ✅ covered |                                                        |
| Angular            | Narrow (below 20rem) | `Narrow`            | ✅ covered |                                                        |
| fundamental-styles | With text            | `WithText`          | ✅ covered | Added for the enabled button and the visual comparison |
| —                  | Controls             | `Playground`        | ✅ new     |                                                        |

### Tests vs. sources

| Source  | Behaviour                                           | React test                                         | Status     |
| ------- | --------------------------------------------------- | -------------------------------------------------- | ---------- |
| Angular | Send button enabled once there is text; group label | enables the send button once there is text         | ✅ covered |
| Angular | Grows up to the maximum rows, then scrolls          | grows with its text up to the maximum rows         | ✅ covered |
| Angular | Disabled text area and button                       | disables the text area and the button              | ✅ covered |
| Angular | `valueChange` while typing                          | emits onValueChange while typing                   | ✅ covered |
| Angular | 20rem cap without max rows                          | caps the height at 20rem without max rows          | ✅ covered |
| Angular | Row cap with a `normal` line height                 | computes the row cap when line-height is normal    | ✅ covered |
| Angular | Avatar hidden below 20rem                           | hides the avatar below 20rem                       | ✅ covered |
| —       | Shrinks back when the text goes                     | shrinks back when the text is removed              | ✅ new     |
| —       | Initial text fitted, button enabled                 | fits an initial text and enables the button for it | ✅ new     |
| —       | Native props, className, ref (registry convention)  | passes className, native props and the ref through | ✅ new     |
| —       | Parts outside a feed input                          | works outside a feed input                         | ✅ new     |

### Visual comparison

`pnpm visual feed-input`: 13 cases × 16 combinations, **202/208** matching, against fundamental-styles' Default, With
text, Disabled, Generic thumbnail and Multiline stories: the container, the avatar (styles only, another photo), the
placeholder avatar, the text area empty, hovered, focused, with text, disabled and grown (styles only: other rows and
trailing line), and the send button disabled (pixels), enabled, hovered and focused (styles only: fundamental-styles'
enabled stories show the `feeder-arrow` glyph). The 6 remaining differences are the RTL pixels of the disabled button,
kept on purpose (below). Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, With text, Grow, Disabled
and Narrow.

| Difference                                                             | Cause                                                                                                                                                | Resolution                                                                                                                                                                   |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Send button glyph mirrored in RTL (3.7–4.1% of pixels, 6 combinations) | `rtl:-scale-x-100` on the paper plane, as Angular; fundamental-styles does not mirror it                                                             | Kept: UI5 mirrors the paper plane in RTL (`ltr: false` in `@ui5/webcomponents-icons`, scaled by `--_ui5_icon_transform_scale`), so the plane points in the reading direction |
| Disabled text area `cursor: not-allowed` (fundamental-styles: `text`)  | Ours keeps pointer events for the readable placeholder; fundamental-styles' text area has `pointer-events: none` under a `cursor: not-allowed` group | Not visible: the same not-allowed cursor shows; ignored in the case                                                                                                          |

### Angular issues

None found.
