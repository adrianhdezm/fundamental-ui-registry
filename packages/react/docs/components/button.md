## button

Sources: fundamental-react [Button](https://github.com/SAP/fundamental-react/tree/main/src/Button) · Angular
[`registry/ui/button`](../../../angular/registry/ui/button/) · fundamental-styles
[Button](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-buttons-button--docs)
Registry: `registry/ui/button/`, on Base UI's `Button`.

API: the Angular inputs as props (`variant`, `label`, `glyph`, `glyphPosition`, `glyphFont`, `menu`, `toggled`,
`selected`, `fullWidth`, `decisive`, `description`, `typeDescription`), plus:

- `disabled` with `focusableWhenDisabled` (Base UI) for Angular's `aria-disabled` and fundamental-react's
  `allowFocusOnDisable`;
- `disabledMessage` and `enabledMessage` from fundamental-react: the first describes a focusable disabled button, the
  second is announced in a polite live region when it becomes enabled;
- `badge` from fundamental-react, next to the `ButtonBadge` component (Angular's `fd-button-badge`);
- links: `render={<a href="…" />}` with `nativeButton={false}`; Base UI keeps a disabled link out of the tab order
  and swallows its clicks.

fundamental-react's `option` and `type` are `variant`, `iconBeforeText` is `glyphPosition`, `typeAttr` is `type`, and
`compact` is `data-density="compact"` on the button or an ancestor.

**Differences from Angular, on purpose:** `selected` shows the selected colours with a `data-selected` attribute
(`toggled:` matches it) and sets `aria-selected` only when the button has a role that supports it (option, tab, …);
axe rejects `aria-selected` on a plain button. Angular sets it always; its segmented button gives the role.
