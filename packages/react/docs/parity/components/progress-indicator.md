## progress-indicator

Sources: fundamental-react: none · Angular [`registry/ui/progress-indicator`](../../../../angular/registry/ui/progress-indicator/)
· fundamental-styles [Progress Indicator](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-progress-indicator--docs)
Registry: `registry/ui/progress-indicator/`, with Popover (Base UI's Popover), Button and Icon.

API: the Angular inputs as props: `valueNow` (0), `valueMin` (0), `valueMax` (100), `valueText` (the value and the unit
by default), `unit` (`%`), `state` (`informative`, `positive`, `critical`, `negative`; neutral when unset), `animate`
and `closeLabel` ("Close", the name of the popover's close button). Angular's `ariaLabel` and `ariaLabelledBy` are the
native `aria-label` and `aria-labelledby` (and `aria-describedby`): they go to the progressbar, not to the root. The
other native props, `className` and `ref` go to the root.

Behaviour as Angular: the root holds the value text above a track; the track is the `progressbar` with
`aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext` (the text), and the visible text is
`aria-hidden`. The bar is the share of the range (clamped, none for an empty range or 0), with Horizon's dots at both
ends of the track in the bar colour; a state colours bar, track and dots and adds its icon (`information`,
`sys-enter-2`, `alert`, `sys-cancel-2`) after the track. `animate` transitions the width (0.5s). A text that does not
fit (measured on resize and when the text changes) becomes a button that opens a popover below it, as wide as the
label, with the full text, named by the text, and a close button; Escape, outside click and the close button close it
and the focus returns to the label. Mirrors in RTL.

**Differences from Angular, on purpose** (each a fundamental-styles alignment, see the visual table):

- The label sits inside the track border (1px in) and is as wide as its text, at most the track; Angular's label spans
  the whole root from its corner. The truncation popover is as wide as the label, so as wide as the track.
- The bar is a flex item inside the track border, with `min-width` equal to its width, as fundamental-styles'; Angular
  positions it 1px over the border, with a 10px minimum, and 2px wider at 100%.
- The label's line height is `normal` (Angular's `leading-normal` is Tailwind's 1.5), and the icon is laid out as
  fundamental-styles' (a 14px line with the 16px glyph middle-aligned).
- The root sets fundamental-styles' typography (`sapFontSize`, `line-height: normal`, `sapTextColor`, `font-normal`,
  `forced-color-adjust-none`), which Angular leaves to the page.

### Stories vs. sources

| Source             | Example                  | React story      | Status     | Notes                                                                                 |
| ------------------ | ------------------------ | ---------------- | ---------- | ------------------------------------------------------------------------------------- |
| Angular            | Playground               | `Playground`     | ✅ covered |                                                                                       |
| Angular            | Values                   | `Values`         | ✅ covered | Full width (Angular: `max-w-xl`), so the first five compare with fundamental-styles'. |
| Angular            | States                   | `States`         | ✅ covered | Full width, as fundamental-styles' Value States.                                      |
| Angular            | Truncation               | `Truncation`     | ✅ covered |                                                                                       |
| Angular            | Open: Truncation popover | `OpenTruncation` | ✅ covered | `play` opens the popover, so the a11y run checks it.                                  |
| Angular            | Animation                | `Animation`      | ✅ covered |                                                                                       |
| fundamental-styles | Layout                   | `Values`         | ✅ covered | 0%, 42%, 69%, 100% and "80 of 100 MB", in their order.                                |
| fundamental-styles | States                   | `States`         | ✅ covered |                                                                                       |
| fundamental-styles | Truncation Behaviour     | `Truncation`     | ✅ covered | Angular's text and width; theirs is a static popover markup with a 400px root.        |

### Tests vs. sources

| Source  | Behaviour                                    | React test                                                                     | Status     |
| ------- | -------------------------------------------- | ------------------------------------------------------------------------------ | ---------- |
| Angular | Progressbar with its value                   | is a progress bar with its value                                               | ✅ covered |
| Angular | Text, clamping, no bar at 0                  | shows a text and clamps the bar                                                | ✅ covered |
| Angular | State icon                                   | shows an icon for a state                                                      | ✅ covered |
| Angular | Truncated text in a popover                  | shows a truncated text in full in a popover                                    | ✅ covered |
| Angular | Width relative to the range, fill to the end | computes the width relative to valueMin and valueMax                           | ✅ covered |
| Angular | Unit                                         | appends the unit to the default value text                                     | ✅ covered |
| Angular | `ariaLabelledBy`                             | names the bar with aria-labelledby and describes it with aria-describedby      | ✅ covered |
| Angular | Animate                                      | animate adds a width transition                                                | ✅ covered |
| —       | State colours of bar, track, dots and icon   | colours the bar, the track and the icon by state                               | ✅ covered |
| —       | Keyboard, close label, popover width         | opens the popover from the keyboard and names the close button with closeLabel | ✅ covered |
| —       | Layout and RTL                               | lays out the label above the track, the icon after it, the bar over it         | ✅ covered |
| —       | Prop spreading, ref (registry convention)    | passes className, native props and the ref through                             | ✅ covered |

### Visual comparison

`pnpm visual progress-indicator`: 26 cases × 16 combinations, **416/416** after the fixes below, all by pixels and
styles: the five indicators of fundamental-styles' Layout (0%, 42%, 69%, 100%, "80 of 100 MB") and of its States,
whole; for each state the track, the bar and (with a state) the icon; the 42% and 100% labels. The largest pixel
difference is 0.2% (the bars). Reviewed by eye in Horizon cozy and compact, LTR and RTL (`Values`, `States`, `Open:
Truncation popover`): density changes nothing (fundamental-styles has no compact size); in RTL the bar starts on the
right, the label is right-aligned and the icon is on the left.

| Difference                                                                      | Cause                                                                                                                                                                             | Resolution                                                                                                                    |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Label 21px high, its last line 1px over the track                               | Angular's `leading-normal` is Tailwind's 1.5; fundamental-styles has `line-height: normal` (16px)                                                                                 | Fixed: `leading-[normal]`. Angular issue.                                                                                     |
| Label full width at the root's corner instead of shrink-to-fit inside the track | Angular places it with `inset-x-0 top-0` on the root; fundamental-styles positions it in the track (1px inside the border, at most its width)                                     | Fixed: `start-px top-px max-w-[calc(100%-1.25rem-2px)]`, as wide as the text. Angular issue (1px, and truncation 20px later). |
| Bar 1px to the start, 10px minimum, 2px wider at 100%                           | Angular positions it absolutely at `-start-px` (and `end-[-0.0625rem]` at 100%); fundamental-styles' bar is a flex item inside the border                                         | Fixed: a flex item with `min-width` equal to its width. Angular issue.                                                        |
| Status icon 17px high, glyph 1px higher (7–14% of the icon's pixels)            | Angular sets the 16px size on the icon itself, and tailwind-merge drops the icon's `leading-none`; fundamental-styles has a 14px `normal` line with the 16px glyph middle-aligned | Fixed: the icon takes fundamental-styles' line and the glyph its size, colour and `vertical-align: middle`. Angular issue.    |
| Root typography                                                                 | Angular leaves font size, line height and colour to the page                                                                                                                      | Fixed: fundamental-styles' (`sapFontSize`, `normal`, `sapTextColor`). Not visible (the label sets its own).                   |

**Angular issues** (not fixed there): the label line height (Tailwind's `leading-normal`, 1.5, instead of `normal`), the
label's position and width, the bar's position and minimum width, and the icon's line box, as in the table.
