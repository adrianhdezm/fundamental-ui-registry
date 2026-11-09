## generic-tag

Sources: fundamental-react: none · Angular [`registry/ui/generic-tag`](../../../../angular/registry/ui/generic-tag/) ·
fundamental-styles [Generic Tag](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-generic-tag--docs)
Registry: `registry/ui/generic-tag/`, on Base UI's `Button`.

API: the Angular inputs as props: `type` (`error`, `success`, `warning`, `information`; neutral when unset), `name`
(required), `value` and `ariaRoleDescription` ("Generic Tag" by default). Angular's `[fd-generic-tag]` attribute
component goes on any host; here it renders a `<div>`, and `render` renders another element (`nativeButton` is
detected for a `<button />`). Native props (`onClick`, `aria-*`, ...), `className` and `ref` pass through to the root.

Behaviour as Angular: the tag is a `role="button"` with `tabindex="0"` and the role description, named by its name
and value; the status icon (`message-<type>`) is decorative. Click, Enter and Space activate it: Base UI's `Button`
(non-native) does what Angular's `activate()` keydown handler does. The name and value truncate with an ellipsis and
keep their full text as `title`; the value stays visible next to a truncated name. The status is a decorator strip on
the start edge over the status background; hover and active take the list hover and active backgrounds (the HC themes
also switch the texts and icon to the active text colour), focus and active show the SAP focus outline (inset in HC).
Vertical margin 0.5625rem, 0.1875rem in compact.

**Differences from Angular, on purpose:** none in behaviour. The root sets fundamental-styles' `leading-[normal]`,
`font-normal`, `border-0`, `text-sap-text-color` and `forced-color-adjust-none`, which Angular leaves to the page, and
the shadow is `[box-shadow:var(--sapContent_Shadow0)]` instead of the `shadow-sap-content-shadow0` utility (whose ring
layers fail the style comparison).

### Stories vs. sources

| Source  | Example    | React story               | Status     | Notes                                                                                     |
| ------- | ---------- | ------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| Angular | Playground | `Playground`              | ✅ covered |                                                                                           |
| Angular | Types      | `Types`, `NamesAndValues` | ✅ covered | `Types` with fundamental-styles' texts; `NamesAndValues` with Angular's, plus truncation. |

### Tests vs. sources

| Source  | Behaviour                                        | React test                                                                              | Status     |
| ------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------- |
| Angular | Types: icon, background, strip and value colours | type (error, warning, success, information) shows the status icon and colors            | ✅ covered |
| Angular | Name and value, 12px apart; value optional       | name and value are rendered and separated                                               | ✅ covered |
| Angular | Role, role description, accessible name          | role description (ariaRoleDescription) and readable name/value for assistive technology | ✅ covered |
| Angular | Focusable, click, Enter and Space                | is focusable and activates with click, Enter and Space                                  | ✅ covered |
| Angular | Truncation with titles                           | truncation of the name with full text in title                                          | ✅ covered |
| —       | Hover background, focus outline                  | hover changes the background and keeps the status colours; focus shows the SAP outline  | ✅ covered |
| —       | Prop spreading, ref (registry convention)        | passes className, native props and the ref through; render swaps the element            | ✅ covered |

### Visual comparison

`pnpm visual generic-tag`: 13 cases × 16 combinations, **208/208** after the fixes below. Cases, by pixels, against
fundamental-styles' `Types` story with its texts: the five types at rest; the error tag's icon, name and value; the
neutral and error tags on hover and the error value on hover; the neutral and warning tags with focus. The active
state cannot be captured by the script (it hovers and focuses only): it was compared by hand, holding the mouse down
on the neutral and error tags, with fundamental-styles' `is-active` column (background, outline, text colours and
shadows), the same in the four themes after the second fix. Reviewed by eye in Horizon cozy and compact, LTR and RTL
(`Types`, `NamesAndValues`): the margin shrinks in compact, the decorator strip moves to the right edge in RTL.

| Difference                                                                                          | Cause                                                                                                                                   | Resolution                                                                                        |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Status icon 17px high with a normal line height instead of 16px                                     | Angular's icon takes `text-base` (a 1.5rem line height); fundamental-styles' icon has a 1rem line height                                | Fixed: `text-[1rem] leading-none`. Angular issue (computed only: the tag height is fixed).        |
| Pressed tags kept the hover background in Horizon and Horizon Dark (`#eaecee` instead of `#dee2e5`) | Angular's `active:` classes come before the `enabled-hover:` custom variant in the generated CSS, so the hover value wins while pressed | Fixed: `enabled-active:`, which comes after `enabled-hover:`. Angular issue (same classes there). |
