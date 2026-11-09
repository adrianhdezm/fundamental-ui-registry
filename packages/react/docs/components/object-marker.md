## object-marker

Sources: fundamental-react: none · Angular [`registry/ui/object-marker`](../../../angular/registry/ui/object-marker/) ·
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                                                                                                           | Cause                                                                                                                                           | Resolution                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RTL: the request glyph is mirrored; fundamental-styles draws it unmirrored (icon only, 8 combinations)                                                                               | Our `Icon` mirrors the glyphs UI5 marks as mirrored in RTL, request among them                                                                  | Kept: the icon convention of the registry (as UI5 and the Angular icon).                                                                                         |
| Focused clickable marker in Horizon and Horizon Dark: the icon is white; fundamental-styles' keeps the marker icon colour, nearly invisible on the focus background (8 combinations) | `[&:focus_[data-glyph]]:text-inherit` (Angular's `[&:focus_fd-icon]:text-inherit`): the icon takes the contrast text colour of the focused link | Kept: fundamental-styles is wrong (the icon disappears into the focus colour); Fiori's focused links show their content in the contrast colour. HC themes match. |
