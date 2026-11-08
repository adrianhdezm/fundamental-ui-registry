## object-marker

Sources: fundamental-react: none · Angular [`registry/ui/object-marker`](../../../../angular/registry/ui/object-marker/) ·
fundamental-styles [Object Marker](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-object-marker--docs)
Registry: `registry/ui/object-marker/`, on Base UI's `useRender`.

API: the Angular inputs as props: `glyph`, `glyphFont`, `label`, `clickable`, `statusText`, `activeText`,
`inactiveText`, `title` and `id`; Angular's `ariaLabelledBy` is the native `aria-labelledby`. Angular's
`[fdObjectMarker]` goes on any host; here it renders a `<span>` and `render` renders another element, e.g.
`render={<a href="…" />}` for a clickable marker that navigates. Native props, `className` and `ref` pass through;
extra `children` come after the label (Angular's `<ng-content />`). Ids come from `id`, or `useId` (Angular counts
instances).

Behaviour as Angular: a hidden status text ("Inactive Object Marker", or "Active Object Marker" when clickable;
`statusText` overrides it) is read before the label through `aria-labelledby`. With a label the icon is
presentational; an icon-only marker is `role="img"`, named by `title` (the glyph name by default), which is also the
icon's tooltip. Non-clickable markers have `tabindex="-1"`. A clickable marker is a `role="link"` with `tabindex="0"`
in the link colours and the filled Horizon focus (an outline in high contrast); when its element is not a native link
or button, Enter activates it with a click, as Angular's `activate()`. No Base UI primitive covers a link role, so this
is a keydown handler. Markers next to each other are 0.5rem apart.

**Differences from Angular, on purpose:** `title` names the icon of an icon-only marker and is not put on the root
(Angular's input shadows the host attribute in the same way). A user `onKeyDown` runs first and can prevent the Enter
activation with `preventDefault()`.

### Stories vs. sources

| Source  | Example                  | React story                                        | Status     | Notes                                                                                        |
| ------- | ------------------------ | -------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| Angular | Playground               | `Playground`                                       | ✅ covered |                                                                                              |
| Angular | Icon, text and clickable | `IconOnly`, `TextOnly`, `IconAndText`, `Clickable` | ✅ covered | Split by section, with fundamental-styles' glyphs and texts; the lock toggle in `Clickable`. |
| —       | (adjacent markers)       | `Adjacent` ("Next to each other")                  | ➕ added   | Shows the 0.5rem spacing of markers next to each other.                                      |

### Tests vs. sources

| Source  | Behaviour                                          | React test                                                                      | Status     |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------------- | ---------- |
| Angular | Label with glyph: presentational icon, name, order | label with glyph: icon is presentational, name is the status text and the label | ✅ covered |
| Angular | glyphFont                                          | glyphFont passes the icon font to the marker icon                               | ✅ covered |
| Angular | Label only                                         | label only renders no icon                                                      | ✅ covered |
| Angular | Icon-only image named by title / glyph             | glyph-only marker is an image named by its title (defaulting to the glyph name) | ✅ covered |
| Angular | statusText, ariaLabelledBy                         | statusText and aria-labelledby override the accessible name                     | ✅ covered |
| Angular | Not in the tab order                               | non-clickable markers are not in the tab order                                  | ✅ covered |
| Angular | Clickable: link role, tabindex, name, cursor       | clickable marker is a focusable link announced as active                        | ✅ covered |
| Angular | Click and Enter                                    | clickable marker activates with a click and with Enter                          | ✅ covered |
| Angular | Enter ignored when not clickable                   | Enter does not activate a non-clickable marker                                  | ✅ covered |
| Angular | Native anchor activates once                       | a clickable anchor marker activates once with Enter (natively)                  | ✅ covered |
| Angular | Filled focus                                       | clickable marker shows the filled focus style                                   | ✅ covered |
| —       | activeText, inactiveText                           | activeText and inactiveText set the default status texts                        | ✅ covered |
| —       | Adjacent spacing                                   | adjacent markers are spaced apart                                               | ✅ covered |
| —       | Prop spreading, ref (registry convention)          | passes className, native props and the ref through; render swaps the element    | ✅ covered |

### Visual comparison

`pnpm visual object-marker`: 14 cases × 16 combinations, 208/224 matching after the fixes below; the 16 left are the
two differences kept below. Cases, by pixels (glyphs and texts as fundamental-styles'): the icon-only marker (request)
and one with a narrow glyph (flag); the text-only marker and its text; icon-and-text markers (favourite, locked) and a
text; the clickable marker, its text and the clickable locked marker at rest, the marker and its text on hover, and
both clickable markers with focus. Reviewed by eye in Horizon cozy and compact, LTR and RTL (`IconOnly`, `TextOnly`,
`IconAndText`, `Clickable`, `Adjacent`): no density dependence, the icon stays on the label's start side in RTL.

| Difference                                                                                                                                                                           | Cause                                                                                                                                                          | Resolution                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icons 4px narrower than fundamental-styles' 20px, so markers with an icon were 4px narrower; narrow glyphs 4px wider                                                                 | `Icon` is a 1em box with `border-box` sizing, so the `pe-1` gap was taken from the glyph; fundamental-styles' marker icon is as wide as the glyph plus the gap | Fixed: the marker icon is `w-auto` (as wide as the glyph) with the gap as a margin.                                                                              |
| RTL: a mirrored glyph (e.g. request) had its gap on the outer side, touching the label                                                                                               | Mirrored glyphs are flipped with a `scale-x` transform, which also flips the padding                                                                           | Fixed: the gap is a margin (`me-1`), outside the transformed box. Angular issue.                                                                                 |
| Clickable markers 1px lower (17px instead of 18px), their text 2px                                                                                                                   | The marker's `leading-none` also applies to link markers; fundamental-styles' `fd-object-marker--link` has a normal line height                                | Fixed: `leading-[normal]` on clickable markers. Angular issue.                                                                                                   |
| RTL: the request glyph is mirrored; fundamental-styles draws it unmirrored (icon only, 8 combinations)                                                                               | Our `Icon` mirrors the glyphs UI5 marks as mirrored in RTL, request among them                                                                                 | Kept: the icon convention of the registry (as UI5 and the Angular icon).                                                                                         |
| Focused clickable marker in Horizon and Horizon Dark: the icon is white; fundamental-styles' keeps the marker icon colour, nearly invisible on the focus background (8 combinations) | `[&:focus_[data-glyph]]:text-inherit` (Angular's `[&:focus_fd-icon]:text-inherit`): the icon takes the contrast text colour of the focused link                | Kept: fundamental-styles is wrong (the icon disappears into the focus colour); Fiori's focused links show their content in the contrast colour. HC themes match. |
