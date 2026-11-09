## button

Sources: fundamental-react [Button](https://github.com/SAP/fundamental-react/tree/main/src/Button) · Angular
[`registry/ui/button`](../../../../angular/registry/ui/button/) · fundamental-styles
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

### Stories vs. sources

| Source            | Example    | React story  | Status     | Notes                                                      |
| ----------------- | ---------- | ------------ | ---------- | ---------------------------------------------------------- |
| fundamental-react | primary    | `Playground` | ✅ covered |                                                            |
| fundamental-react | options    | `Options`    | ✅ covered | Same labels; the visual reference for three types.         |
| fundamental-react | types      | `Types`      | ✅ covered |                                                            |
| fundamental-react | icons      | `Icons`      | ✅ covered | Text + icon and icon-only rows for every type.             |
| fundamental-react | sizes      | `Sizes`      | ✅ covered | `data-density` instead of `compact`.                       |
| fundamental-react | badges     | `Badge`      | ✅ covered | The `badge` prop row, cozy and compact.                    |
| fundamental-react | states     | `States`     | ✅ covered | Default, selected, disabled, focusable for every type.     |
| fundamental-react | dev        | `Playground` | ✅ covered | Knobs are the Playground controls.                         |
| fundamental-react | noStyles   | —            | ➖ n/a     | No `cssNamespace`.                                         |
| Angular           | Playground | `Playground` | ✅ covered |                                                            |
| Angular           | Types      | `Types`      | ✅ covered | With `aria-description`, `description`, `typeDescription`. |
| Angular           | Menu       | `Menu`       | ✅ covered | Icon-only row uses `cart`, as fundamental-styles.          |
| Angular           | Sizes      | `Sizes`      | ✅ covered |                                                            |
| Angular           | Icons      | `Icons`      | ✅ covered |                                                            |
| Angular           | State      | `State`      | ✅ covered | Links through `render`.                                    |
| Angular           | Toggled    | `Toggled`    | ✅ covered | Labels as fundamental-styles' Toggle story.                |
| Angular           | Badge      | `Badge`      | ✅ covered |                                                            |

### Tests vs. sources

| Source            | Behaviour                                               | React test                                                                                                 | Status     |
| ----------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Variants in rest, hover, toggled and disabled states    | variants (standard, emphasized, …) use their token classes in all states                                   | ✅ covered |
| Angular           | Glyph before/after, icon-only name, glyph-name fallback | glyph-only button requires aria-label; glyph before/after label                                            | ✅ covered |
| Angular           | disabled vs aria-disabled, disabled anchors             | disabled vs focusableWhenDisabled: focusable disabled buttons stay in the tab order but swallow clicks     | ✅ covered |
| Angular           | toggled and selected                                    | toggled sets aria-pressed; selected shows the selected styles and aria-selected where the role allows it   | ✅ covered |
| Angular           | fdMenu arrow, aria-haspopup and expanded with a menu    | menu adds the menu arrow at the end; a menu trigger announces and opens its menu                           | ✅ covered |
| Angular           | type "button" by default in forms                       | type defaults to "button" inside forms                                                                     | ✅ covered |
| Angular           | Generated and custom ids                                | generates a unique id with the fd-button prefix and accepts a custom id                                    | ✅ covered |
| Angular           | Semantic descriptions, custom and external descriptions | semantic variants announce their meaning through the hidden description                                    | ✅ covered |
| Angular           | Badge content, attention, compact placement             | badge (ButtonBadge or the badge prop) shows content and attention style                                    | ✅ covered |
| Angular           | Compact density                                         | compact density shrinks height via data-density                                                            | ✅ covered |
| —                 | Decisive minimum width in cozy and compact density      | decisive buttons are at least 4rem wide in cozy and compact density                                        | ➕ extra   |
| Angular           | Focus on click                                          | focuses the button on click                                                                                | ✅ covered |
| fundamental-react | Prop spreading, className, ref                          | passes className, native props and the ref to the button                                                   | ✅ covered |
| fundamental-react | Spreading className to the text, props to the icon      | —                                                                                                          | ➖ n/a     |
| fundamental-react | Icon before/after the text                              | glyph-only button requires aria-label; glyph before/after label                                            | ✅ covered |
| fundamental-react | Disabled message: aria-describedby and matching ids     | disabledMessage describes a focusable disabled button; enabledMessage is announced when it becomes enabled | ✅ covered |

The menu row renders the button as a `MenuTrigger` (`render={<Button menu … />}`): it gets `aria-haspopup="menu"`
and `aria-expanded`, opens on click and closes on Escape. `textClassName` and `iconProps` (fundamental-react) are not ported: the label and icon take no extra
props; pass children instead.

### Visual comparison

`pnpm visual button`: 16 cases × 16 combinations, 256/256 matching (also after `fix(button)`; no case is decisive, the
date picker's today button compares it). Cases: default, emphasized, transparent, ghost, positive, negative and
attention at rest; default and emphasized on hover; toggled; disabled; icon-only standard and emphasized; icon-only
menu button; badge and attention badge (styles only: the numbers differ).

| Difference                                                                                    | Cause                                                                                                               | Resolution                                                                                        |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Icon-only menu button 6px narrower (52px vs 58px)                                             | The arrow icon was as wide as its glyph (10px), not 1em                                                             | Fixed in the icon (`fix(icon)`): a 1em box.                                                       |
| Compact decisive button narrower than 4rem (found by the date picker's today button: 53–57px) | `decisive`'s `min-w-16` lost to the compact minimum `compact:min-w-8`; fundamental-styles' footer buttons keep 4rem | Fixed: `decisive` also sets `compact:min-w-16` (`fix(button)`). Angular issue (the same classes). |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Badge and Menu stories.
