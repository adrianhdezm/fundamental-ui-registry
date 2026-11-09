## feed-input

Sources: Angular [`registry/ui/feed-input`](../../../angular/registry/ui/feed-input/) (itself from
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                             | Cause                                                                                    | Resolution                                                                                                                                                                   |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Send button glyph mirrored in RTL (3.7–4.1% of pixels, 6 combinations) | `rtl:-scale-x-100` on the paper plane, as Angular; fundamental-styles does not mirror it | Kept: UI5 mirrors the paper plane in RTL (`ltr: false` in `@ui5/webcomponents-icons`, scaled by `--_ui5_icon_transform_scale`), so the plane points in the reading direction |
