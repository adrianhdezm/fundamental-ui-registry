## object-status

Sources: fundamental-react [ObjectStatus](https://github.com/SAP/fundamental-react/tree/main/src/ObjectStatus) ·
Angular [`registry/ui/object-status`](../../../angular/registry/ui/object-status/) · fundamental-styles
[Object Status](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-object-status--docs)
Registry: `registry/ui/object-status/`, on Base UI's `useRender`, and Base UI's `Button` when clickable.

API: the Angular inputs as props (`status`, `statusMessage`, `label`, `glyph`, `glyphFont`, `glyphAriaLabel`,
`indicationColor`, `secondaryIndication`, `clickable`, `inverted`, `large`, `truncate`). Renders a `<span>`; `render`
renders another element (Angular's `[fdObjectStatus]` on any host). Angular's `textTemplate` is `children`; label and
children can be combined. Renamed so they do not clash with native ARIA props: Angular's `ariaLabel` (the hidden
"Object Status" text) is `objectStatusLabel`, and `ariaRoleDescription` is `roleDescription` (a native
`aria-roledescription` overrides it). fundamental-react's `indication` is `indicationColor` (1–10 instead of 1–8),
`size="l"` is `large`, `link` is `clickable` with `render={<a href="…" />}`, and `ariaLabel` is the native
`aria-label`.

**Differences on purpose:**

- A clickable status is Base UI's `Button` (`nativeButton={false}` unless `render` is a `<button>`, detected from
  `render`; the `nativeButton` prop overrides it): `role="button"`, `tabindex="0"`, Enter activates on keydown and
  Space on keyup with the page scroll prevented, as a native button. Angular activates Space on keydown.
- A clickable status rendered as `<a href>` keeps the native link semantics (no `role="button"` or `tabindex`), as
  fundamental-react's `link`; Angular would make it a role button.
- fundamental-react made a status with `onClick` clickable on its own; here `clickable` is explicit, as in Angular.
