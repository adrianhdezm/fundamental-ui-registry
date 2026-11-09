## progress-indicator

Sources: fundamental-react: none · Angular [`registry/ui/progress-indicator`](../../../angular/registry/ui/progress-indicator/)
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
