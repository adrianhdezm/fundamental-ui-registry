# Issue tracker: Angular issues found while porting to React

While porting the components to React (`packages/react`), about 215 issues were logged in this package. They are
listed in [the React parity README](../../../react/docs/parity/README.md#angular-issues-found-while-porting), section
"Angular issues found while porting" (component, description), and each component's React report
(`packages/react/docs/parity/components/<name>.md`) has more detail and the React fix. This folder tracks each of them
in the Angular package, from "reported" to "verified".

[`tracker.json`](tracker.json) is the source of truth; `pnpm tracker` rewrites the tables below from it, and
`pnpm check` (`pnpm tracker:check`) fails when they are out of date or an entry is incomplete for its status.

## Entries

Each issue has:

| Field       | Meaning                                                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`        | `<component>-<n>`: the component, then the row's number among that component's rows in the React README.                                                                                                           |
| `component` | The Angular component (`registry/ui/<component>/`), or the shared area (`content-density`: `registry/styles/fundamental.css`).                                                                                     |
| `issue`     | The React README row, verbatim.                                                                                                                                                                                    |
| `source`    | The component's React report.                                                                                                                                                                                      |
| `kind`      | `visual` (seen in a render), `computed-only` (a computed style differs, the pixels do not), `behaviour`, `a11y` (accessible name, ARIA, landmarks, keyboard reach, live regions, axe) or `test` (a spec or story). |
| `confirmed` | How the row was found: `rendered` (measured in a render), or `read from the code` (the row says so): those must be reproduced before they are fixed.                                                               |
| `pattern`   | The pattern entry of a root cause shared by several rows (see below), if any.                                                                                                                                      |
| `status`    | See below.                                                                                                                                                                                                         |
| `repro`     | How it was reproduced in Angular: the story id or spec, the steps, the measured value. For `not-reproducible`, the evidence.                                                                                       |
| `test`      | The name of the spec test, story `play` function or a11y check that fails before the fix.                                                                                                                          |
| `fix`       | The commit of the fix.                                                                                                                                                                                             |
| `notes`     | The question of a `decision-needed`, the reason of a `wont-fix`, and anything else worth knowing.                                                                                                                  |

A **pattern** groups the rows of one root cause in several components. It has an id (`pattern-…`), a title, the root
cause, the rule the fix follows, the ids of its rows (each of which links back with `pattern`), and the same `status`,
`repro`, `test`, `fix` and `notes` fields. A pattern's fix also covers occurrences in components without a row.

## Statuses

In order: **reported** (logged, nothing done yet) → **reproduced** (seen in Angular; `repro` filled) → **covered** (a
test fails because of it; `test` filled) → **fixed** (`fix` filled) → **verified** (the test passes, `pnpm check`
passes, and visual issues match fundamental-styles in all 16 theme × density × direction combinations).

Side exits: **not-reproducible** (the evidence in `repro`), **wont-fix** (the reason in `notes`), **decision-needed**
(a judgement call between fundamental-styles, Fiori/UI5 and Angular's current behaviour; the question in `notes`).

## Workflow

1. Reproduce it: Storybook, a spec, or Playwright against the built Storybook. Record how in `repro`.
2. Cover it: a spec test, a story with a `play` function, or an a11y check that fails before the fix. Computed-style
   issues get an assertion on the computed value. Record the test name in `test`.
3. Fix it in the component (the React port is a read-only reference, never an import), one commit per issue or
   pattern, naming the ids. Record the commit in `fix`.
4. Verify it, then set `verified`. Every pull request keeps this tracker in sync, and its body has a table of its
   issues with status, repro, test and fix.

## Tracker

<!-- tracker:start -->

**Progress:** 3 of 215 issues closed (verified, not reproducible or won’t fix).

Issues: ⬜ reported: 212 · ✅ verified: 2 · 🚫 won’t fix: 1.

Patterns: ⬜ reported: 7.

### Patterns

| Pattern                                                                                              | Root cause                                                                                                                                                                                                                                           | Rule                                                                                                                     | Issues                                                                                                              | Status      | Fix |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------- | --- |
| `pattern-leading-merge`: tailwind-merge drops a leading-* that comes before a text-* size            | tailwind-merge treats a font-size utility as also setting the line height, so a `leading-*` placed before a `text-*` size in the same class list (or merged in from a component) is removed.                                                         | Put `leading-*` after the `text-*` size in the same string or variant.                                                   | icon-1, menu-2, list-1, rating-indicator-2, checkbox-3, switch-2, object-status-4, tabs-3, panel-2, object-number-1 | ⬜ reported |     |
| `pattern-rounded-full`: `rounded-full` computes to a huge pixel radius instead of 50%                | Tailwind v4's `rounded-full` is `calc(infinity * 1px)` (3.35544e+07px computed); fundamental-styles uses `50%`.                                                                                                                                      | Use `rounded-[50%]` where fundamental-styles has 50% (and `100%` where it has that).                                     | avatar-4, wizard-1, tabs-4, shellbar-6, micro-process-flow-2, carousel-4                                            | ⬜ reported |     |
| `pattern-shadow-ring`: `shadow-sap-*` utilities add Tailwind's transparent ring layers               | Tailwind's `shadow-*` utilities compose `--tw-inset-shadow`, `--tw-inset-ring-shadow`, `--tw-ring-offset-shadow` and `--tw-ring-shadow` with the shadow, so the computed `box-shadow` has extra transparent layers that fundamental-styles' has not. | Write shadows as `[box-shadow:var(--sap…)]`.                                                                             | action-sheet-3, wizard-3, shellbar-5, card-4, slider-1, fixed-card-layout-2                                         | ⬜ reported |     |
| `pattern-synthetic-bold`: Synthetic bold: `font-bold` on the 72-Bold font                            | The 72-Bold face is registered with a normal weight; `font-bold` on top of it makes the browser embolden it again.                                                                                                                                   | Use `font-normal` with the bold font family, as fundamental-styles.                                                      | layout-panel-1, card-1, panel-1, feed-list-3                                                                        | ⬜ reported |     |
| `pattern-rtl-double-mirror`: `rtl:rotate-180` / a right arrow mirroring an icon that already mirrors | The icon component mirrors directional glyphs in RTL by itself; choosing the opposite glyph in RTL or rotating it again flips it back.                                                                                                               | Keep the LTR glyph and let the icon mirror it; no extra RTL rotation or glyph swap.                                      | nested-list-2, shellbar-2, user-menu-1, grid-list-4, settings-2                                                     | ⬜ reported |     |
| `pattern-compact-button-size`: `compact:*` button size classes override explicit sizes               | Button's `compact:min-w-8`, `compact:h-*` and `compact:px-*` are variant classes, so tailwind-merge keeps them next to a caller's unprefixed `min-w-*`, `h-*`, `w-*` or `p-0`, and they win in compact density.                                      | Pass the size for both densities (also `compact:`-prefixed), or have Button drop its compact sizes when a size is given. | button-1, dynamic-page-1, flexible-column-layout-1, carousel-3                                                      | ⬜ reported |     |
| `pattern-oklab-gradient`: `bg-linear-to-*` blends in oklab instead of sRGB                           | Tailwind v4's `bg-linear-to-*` interpolates `in oklab`; fundamental-styles' gradients use the default sRGB.                                                                                                                                          | Use `bg-linear-[to_top,…]`-style arbitrary gradients (sRGB) or `bg-linear-to-*/srgb`.                                    | dynamic-page-3, flexible-column-layout-2                                                                            | ⬜ reported |     |

### Decisions needed

None.

### Issues

#### icon

[React report](../../../react/docs/parity/components/icon.md) · ⬜ reported: 2

| ID     | Issue                                                                                                                                                                                                             | Kind   | Confirmed | Pattern               | Status      | Test | Fix | Notes |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | --------------------- | ----------- | ---- | --- | ----- |
| icon-1 | The icon box is taller than fundamental-styles' (35px instead of 32px at `md`): `tailwind-merge` drops `leading-none` because the size class (`text-[2rem]`) comes after it. Fixed in React by moving it after.   | visual | rendered  | pattern-leading-merge | ⬜ reported |      |     |       |
| icon-2 | Narrow glyphs get a box as wide as the glyph instead of 1em, so e.g. the menu arrow of an icon-only menu button is 10px wide and the button 6px narrower than fundamental-styles'. Fixed in React with `w-[1em]`. | visual | rendered  |                       | ⬜ reported |      |     |       |

#### link

[React report](../../../react/docs/parity/components/link.md) · ⬜ reported: 1

| ID     | Issue                                                                                                                                                                                                      | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| link-1 | No `text-underline-offset`: the underline sits 2px higher than fundamental-styles' (0.125rem), visible on subtle links and in the high-contrast themes. Fixed in React with `underline-offset-[0.125rem]`. | visual | rendered  |         | ⬜ reported |      |     |       |

#### busy-indicator

[React report](../../../react/docs/parity/components/busy-indicator.md) · ⬜ reported: 1

| ID               | Issue                                                                                                                                                                                                                                             | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----------------------------------------------------------------------- |
| busy-indicator-1 | The dots use `--sapContent_BusyColor` (`#0064d9` in Horizon, `#4db1ff` in Horizon Dark); fundamental-styles uses `--fdBusy_Indicator_Dot_Color`, `#0070f2` in both (the busy colour in HC). Fixed in React with the variable in `extensions.css`. | visual | rendered  |         | ⬜ reported |      |     | Decided: fundamental-styles’ `--fdBusy_Indicator_Dot_Color` (as React). |

#### layout-grid

[React report](../../../react/docs/parity/components/layout-grid.md) · ⬜ reported: 1

| ID            | Issue                                                                                                                     | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| layout-grid-1 | The grid sets no typography, so column text takes the page font instead of fundamental-styles' SAP font, size and colour. | visual | rendered  |         | ⬜ reported |      |     |       |

#### checkbox

[React report](../../../react/docs/parity/components/checkbox.md) · ⬜ reported: 3

| ID         | Issue                                                                                                                                                                                    | Kind          | Confirmed | Pattern               | Status      | Test | Fix | Notes |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | --------------------- | ----------- | ---- | --- | ----- |
| checkbox-1 | The label text inherits the label colour (`--sapContent_LabelColor`) and a 1rem line height; fundamental-styles uses `--sapTextColor` with a normal line height, so the text is lighter. | visual        | rendered  |                       | ⬜ reported |      |     |       |
| checkbox-2 | In the HC themes, hovered success, warning and information checkboxes get `--sapSelectedColor` instead of `--sapField_Hover_Background`.                                                 | visual        | rendered  |                       | ⬜ reported |      |     |       |
| checkbox-3 | The display-only box loses `leading-[normal]` to `tailwind-merge` (it comes before `text-[1rem]`); computed styles only, not visible.                                                    | computed-only | rendered  | pattern-leading-merge | ⬜ reported |      |     |       |

#### input

[React report](../../../react/docs/parity/components/input.md) · ⬜ reported: 1

| ID      | Issue                                                                                                                                                   | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| input-1 | Compact textareas stay one line high (26px): `textareaBase` sets `h-auto` but not `compact:h-auto`, so the compact field height wins whatever the rows. | visual | rendered  |         | ⬜ reported |      |     |       |

#### layout-panel

[React report](../../../react/docs/parity/components/layout-panel.md) · ⬜ reported: 2

| ID             | Issue                                                                                                                                                                  | Kind   | Confirmed          | Pattern                | Status      | Test | Fix | Notes |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------ | ---------------------- | ----------- | ---- | --- | ----- |
| layout-panel-1 | The title uses `font-bold` on the 72-Bold header font, so the browser adds synthetic bold; fundamental-styles has `font-weight: normal`.                               | visual | rendered           | pattern-synthetic-bold | ⬜ reported |      |     |       |
| layout-panel-2 | In a narrow panel the head shrinks to a few pixels and the title runs under the actions (seen in the React port with the same classes, not checked in Angular itself). | visual | read from the code |                        | ⬜ reported |      |     |       |

#### popover

[React report](../../../react/docs/parity/components/popover.md) · ⬜ reported: 2

| ID        | Issue                                                                                                                                                                                         | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| popover-1 | The resize handle has an empty `data-glyph`, so no glyph shows.                                                                                                                               | visual | rendered  |         | ⬜ reported |      |     |       |
| popover-2 | The resize handle is always at the bottom-end (top-end when above) corner, even for left/right placements and end alignments; fundamental-styles puts it in the corner away from the trigger. | visual | rendered  |         | ⬜ reported |      |     |       |

#### radio

[React report](../../../react/docs/parity/components/radio.md) · ⬜ reported: 2 · 🚫 won’t fix: 1

| ID      | Issue                                                                                                                                                                          | Kind   | Confirmed | Pattern | Status       | Test | Fix | Notes                                                                                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------- | ------- | ------------ | ---- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| radio-1 | The radio label text inherits `--sapField_TextColor` and `leading-4`; fundamental-styles uses `--sapTextColor` with a normal line height (#f5f6f7, not #fff, in Horizon Dark). | visual | rendered  |         | ⬜ reported  |      |     |                                                                                                                                                                                                    |
| radio-2 | In the HC themes, hovered success, warning and information radios take `--sapSelectedColor` instead of `--sapField_Hover_Background` (as checkbox).                            | visual | rendered  |         | ⬜ reported  |      |     |                                                                                                                                                                                                    |
| radio-3 | The read-only label has `cursor-default`; fundamental-styles keeps `pointer`.                                                                                                  | visual | rendered  |         | 🚫 won’t fix |      |     | Decided: keep `cursor-default` on the read-only label. A read-only radio cannot change, so a pointer would suggest an action that does not happen (fundamental-styles and React keep the pointer). |

#### switch

[React report](../../../react/docs/parity/components/switch.md) · ⬜ reported: 3

| ID       | Issue                                                                                                                                       | Kind          | Confirmed | Pattern               | Status      | Test | Fix | Notes |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | --------------------- | ----------- | ---- | --- | ----- |
| switch-1 | Hover colours never apply: `group-hover/sw:` sits on the element that is itself `group/sw`, and the variant only matches descendants.       | visual        | rendered  |                       | ⬜ reported |      |     |       |
| switch-2 | The on/off texts and icons lose their line height to `tailwind-merge` (a `leading-*` before a `text-*` size); computed styles only.         | computed-only | rendered  | pattern-leading-merge | ⬜ reported |      |     |       |
| switch-3 | A semantic switch without `ariaLabelledBy` is named only "Accept" or "Decline", and `ariaLabel` goes on the `<label>` instead of the input. | a11y          | rendered  |                       | ⬜ reported |      |     |       |

#### info-label

[React report](../../../react/docs/parity/components/info-label.md) · ⬜ reported: 1

| ID           | Issue                                                                      | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------------ | -------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| info-label-1 | `align-middle` (not in fundamental-styles) moves inline labels 0.3px down. | visual | rendered  |         | ⬜ reported |      |     |       |

#### avatar

[React report](../../../react/docs/parity/components/avatar.md) · ⬜ reported: 4

| ID       | Issue                                                                                                                                                             | Kind          | Confirmed | Pattern              | Status      | Test | Fix | Notes                                                           |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | -------------------- | ----------- | ---- | --- | --------------------------------------------------------------- |
| avatar-1 | With `border` plus `transparent`, `tile` or `placeholder` the border disappears and the hover border is wrong (tailwind-merge keeps the later `--av-border`).     | visual        | rendered  |                      | ⬜ reported |      |     |                                                                 |
| avatar-2 | A loaded image keeps the accent background and border colour around it; fundamental-styles uses `--sapAvatar_Lite_Background` and `--sapAvatar_Lite_BorderColor`. | visual        | rendered  |                      | ⬜ reported |      |     |                                                                 |
| avatar-3 | Value state badges use the state border tokens instead of the state text colours (e.g. `#e90b0b` instead of `#aa0808`).                                           | visual        | rendered  |                      | ⬜ reported |      |     |                                                                 |
| avatar-4 | `rounded-full` computes to 3.35544e+07px instead of 100%, and the badge loses its 1 line height; computed styles only.                                            | computed-only | rendered  | pattern-rounded-full | ⬜ reported |      |     | The badge line height (second half) is not part of the pattern. |

#### list

[React report](../../../react/docs/parity/components/list.md) · ⬜ reported: 3

| ID     | Issue                                                                                                    | Kind   | Confirmed | Pattern               | Status      | Test | Fix | Notes                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------- | ------ | --------- | --------------------- | ----------- | ---- | --- | -------------------------------------------------------------------------- |
| list-1 | List icons and the unread dot lose `leading-none` to tailwind-merge (20px/7px high instead of 18px/6px). | visual | rendered  | pattern-leading-merge | ⬜ reported |      |     | The unread dot is part of the same row; check it separately from the icon. |
| list-2 | Thumbnail icons stay 1rem instead of 2rem.                                                               | visual | rendered  |                       | ⬜ reported |      |     |                                                                            |
| list-3 | A hovered link keeps a transparent bottom border; fundamental-styles uses the list border colour.        | visual | rendered  |                       | ⬜ reported |      |     |                                                                            |

#### object-status

[React report](../../../react/docs/parity/components/object-status.md) · ⬜ reported: 4

| ID              | Issue                                                                                                                                           | Kind          | Confirmed | Pattern               | Status      | Test | Fix | Notes |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | --------------------- | ----------- | ---- | --- | ----- |
| object-status-1 | `min-w-6` makes icon-only statuses 24px wide instead of 16px (inverted 24px instead of 22px) and centres short texts.                           | visual        | rendered  |                       | ⬜ reported |      |     |       |
| object-status-2 | Large inverted statuses use 72-Semibold; fundamental-styles uses the regular 72 (6px narrower).                                                 | visual        | rendered  |                       | ⬜ reported |      |     |       |
| object-status-3 | `hcFocus()` builds its `hc:focus:` classes at runtime, so Tailwind never generates them and focused clickable statuses lose their colour in HC. | visual        | rendered  |                       | ⬜ reported |      |     |       |
| object-status-4 | The root line height is dropped by tailwind-merge (`leading-(--os-h)` before the font size); computed styles only.                              | computed-only | rendered  | pattern-leading-merge | ⬜ reported |      |     |       |

#### tree

[React report](../../../react/docs/parity/components/tree.md) · ⬜ reported: 4

| ID     | Issue                                                                                       | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------ | ------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| tree-1 | `wrapContent` items get `py-1`, so wrapping rows are 8px taller than fundamental-styles'.   | visual | rendered  |         | ⬜ reported |      |     |       |
| tree-2 | Tree item buttons get a 2px start margin; fundamental-styles' resolves to 0.                | visual | rendered  |         | ⬜ reported |      |     |       |
| tree-3 | The "No data" row is 1px too low (44px instead of 45px): its text has a normal line height. | visual | rendered  |         | ⬜ reported |      |     |       |
| tree-4 | The expander lacks the button corner radius (visible only with a focus outline).            | visual | rendered  |         | ⬜ reported |      |     |       |

#### bar

[React report](../../../react/docs/parity/components/bar.md) · ⬜ reported: 1

| ID    | Issue                                                                                                                       | Kind          | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ----- | --------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------- | ----------- | ---- | --- | ----- |
| bar-1 | `items-center` keeps the left, middle and right areas at their content height instead of the bar's (computed heights only). | computed-only | rendered  |         | ⬜ reported |      |     |       |

#### message-strip

[React report](../../../react/docs/parity/components/message-strip.md) · ⬜ reported: 3

| ID              | Issue                                                                                                                                                             | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| message-strip-1 | The icon box gets a 1.5rem line height from `text-base`; fundamental-styles uses `normal`.                                                                        | visual | rendered  |         | ⬜ reported |      |     |       |
| message-strip-2 | In HC themes the focused close button of an indication-colour strip keeps the button background and border.                                                       | visual | rendered  |         | ⬜ reported |      |     |       |
| message-strip-3 | Links in the strip lack fundamental-styles' `fd-message-strip--link` styles (0.25rem start margin and padding, contrast or subtle colours on indication colours). | visual | rendered  |         | ⬜ reported |      |     |       |

#### tile

[React report](../../../react/docs/parity/components/tile.md) · ⬜ reported: 3

| ID     | Issue                                                                                                                                                                             | Kind          | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------- | ----------- | ---- | --- | ----- |
| tile-1 | Line tiles hover with `--sapContent_Shadow2` in HC instead of the 0.125rem tile border ring of the other tiles.                                                                   | visual        | rendered  |         | ⬜ reported |      |     |       |
| tile-2 | The action close button and the indicator buttons lack fundamental-styles' 1px `--sapButton_Lite_BorderColor` border, so there is no ring in HC.                                  | visual        | rendered  |         | ⬜ reported |      |     |       |
| tile-3 | The KPI value uses `font-light` (300) where fundamental-styles uses `lighter`, and the active page dot uses the 0.063rem active shadow instead of 0.125rem; computed styles only. | computed-only | rendered  |         | ⬜ reported |      |     |       |

#### dialog

[React report](../../../react/docs/parity/components/dialog.md) · ⬜ reported: 3

| ID       | Issue                                                                                                                                              | Kind          | Confirmed | Pattern | Status      | Test | Fix | Notes |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------- | ----------- | ---- | --- | ----- |
| dialog-1 | The draggable header shows the grab cursor at rest; fundamental-styles shows it only while the window is hovered.                                  | visual        | rendered  |         | ⬜ reported |      |     |       |
| dialog-2 | Header and footer render `<header>`/`<footer>`, which become page landmarks (duplicates with two dialogs) while a dialog without backdrop is open. | a11y          | rendered  |         | ⬜ reported |      |     |       |
| dialog-3 | The title sits in a full-width bar element (592px instead of the text width); not visible.                                                         | computed-only | rendered  |         | ⬜ reported |      |     |       |

#### token

[React report](../../../react/docs/parity/components/token.md) · ⬜ reported: 4

| ID      | Issue                                                                                                                                         | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| token-1 | The tokenizer input is only 16px high: `h-full` resolves against a field that has only a min-height.                                          | visual | rendered  |         | ⬜ reported |      |     |       |
| token-2 | The read-only tokenizer's `border-dashed` loses to the field border style, and `shadow-none` drops the field shadow fundamental-styles keeps. | visual | rendered  |         | ⬜ reported |      |     |       |
| token-3 | Selected tokens keep their inset bottom line in the HC themes, where fundamental-styles has none.                                             | visual | rendered  |         | ⬜ reported |      |     |       |
| token-4 | A hovered tokenizer keeps the field shadow; fundamental-styles removes it.                                                                    | visual | rendered  |         | ⬜ reported |      |     |       |

#### input-group

[React report](../../../react/docs/parity/components/input-group.md) · ⬜ reported: 3 · ✅ verified: 1

| ID            | Issue                                                                                                               | Kind      | Confirmed | Pattern | Status      | Test                                                                                              | Fix     | Notes                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------- | --------- | --------- | ------- | ----------- | ------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| input-group-1 | Addon buttons keep a 1px transparent border, so text addon buttons are 2px wider than fundamental-styles'.          | visual    | rendered  |         | ⬜ reported |                                                                                                   |         |                                                                                      |
| input-group-2 | `INPUT_GROUP_BUTTON_VARS` makes the lite button backgrounds transparent in HC too (no background, no hover colour). | visual    | rendered  |         | ⬜ reported |                                                                                                   |         |                                                                                      |
| input-group-3 | A disabled group leaves a projected `fdInputGroupInput` enabled.                                                    | behaviour | rendered  |         | ⬜ reported |                                                                                                   |         |                                                                                      |
| input-group-4 | `describedBy` keeps the generated addon's id when a projected addon replaces it, so it points at nothing.           | a11y      | rendered  |         | ✅ verified | InputGroup › is described only by addons it renders: a projected addon replaces the generated one | 8f2c7a1 | Verified: the test fails before the fix and passes after; pnpm angular check passes. |

#### form

[React report](../../../react/docs/parity/components/form.md) · ⬜ reported: 2

| ID     | Issue                                                                                                               | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------ | ------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| form-1 | The form header line is 3px and the group header border 1px in the HC themes; fundamental-styles uses 2px for both. | visual | rendered  |         | ⬜ reported |      |     |       |
| form-2 | `static` messages use `w-auto`, which still fills a block container (`w-fit` needed).                               | visual | rendered  |         | ⬜ reported |      |     |       |

#### menu

[React report](../../../react/docs/parity/components/menu.md) · ⬜ reported: 2

| ID     | Issue                                                                                                                                        | Kind   | Confirmed | Pattern               | Status      | Test | Fix | Notes                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | --------------------- | ----------- | ---- | --- | ----------------------------------------- |
| menu-1 | In compact density the mobile shortcut keeps a 1rem end padding (fundamental-styles: 0.5rem): a mobile size setting overrides every density. | visual | rendered  |                       | ⬜ reported |      |     |                                           |
| menu-2 | The toggle checkmark and submenu arrow are 17px tall: `text-[1rem]` drops the icon's `leading-none` (the icon issue above).                  | visual | rendered  | pattern-leading-merge | ⬜ reported |      |     | Same cause as icon-1: may be fixed by it. |

#### calendar

[React report](../../../react/docs/parity/components/calendar.md) · ⬜ reported: 3

| ID         | Issue                                                                                                                                              | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- | ------- | ----------- | ---- | --- | ---------------------------------------------------------------------------------------------- |
| calendar-1 | The month view's short names ("Jan" in a cell named "January 2018") fail axe's `label-content-name-mismatch`; fundamental-styles shows long names. | a11y      | rendered  |         | ⬜ reported |      |     | Decided: long month names, as fundamental-styles (and React); this also fixes the axe failure. |
| calendar-2 | The next arrow's wrapper has `ms-auto` instead of a 0.25rem start margin, so the month and year header buttons are 2px wider.                      | visual    | rendered  |         | ⬜ reported |      |     |                                                                                                |
| calendar-3 | A calendar opened in the year view starts at today's year instead of the shown year.                                                               | behaviour | rendered  |         | ⬜ reported |      |     |                                                                                                |

#### message-page

[React report](../../../react/docs/parity/components/message-page.md) · ⬜ reported: 1

| ID             | Issue                                                                                                     | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ---------------------------------------------------------- |
| message-page-1 | The subtitle centres every line of a multi-line text (`text-center`); fundamental-styles start-aligns it. | visual | rendered  |         | ⬜ reported |      |     | Decided: start-aligned, as fundamental-styles (and React). |

#### time

[React report](../../../react/docs/parity/components/time.md) · ⬜ reported: 2

| ID     | Issue                                                                                                                                              | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| time-1 | The selected value in HC uses `--sapList_Background` (black/white) instead of the working background fundamental-styles shows (#2e2e2e / #d9d9d9). | visual | rendered  |         | ⬜ reported |      |     |       |
| time-2 | The collapsed value has `cursor: pointer` (fundamental-styles: default) and the column label lacks `cursor: text`.                                 | visual | rendered  |         | ⬜ reported |      |     |       |

#### step-input

[React report](../../../react/docs/parity/components/step-input.md) · ⬜ reported: 2

| ID           | Issue                                                                                                                               | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| step-input-1 | In HC, error and warning fields show the value and buttons in bold italic (14px wider in cozy).                                     | visual | rendered  |         | ⬜ reported |      |     |       |
| step-input-2 | A focused field with a value state loses its state shadow, and its buttons keep the field text colour (no active background in HC). | visual | rendered  |         | ⬜ reported |      |     |       |

#### select

[React report](../../../react/docs/parity/components/select.md) · ⬜ reported: 3

| ID       | Issue                                                                                                                                                                                                         | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| select-1 | Options keep the list dropdown `gap-x-4` (options with icons 32px wider), icons are 14px instead of 1.125rem, titles truncate without their minimum height, and secondary texts stop at 40% instead of 16rem. | visual | rendered  |         | ⬜ reported |      |     |       |
| select-2 | In HC the arrow button has no lite button background or hover colour, and covers 2px of the field border (control is `overflow-visible`).                                                                     | visual | rendered  |         | ⬜ reported |      |     |       |
| select-3 | In the mobile dialog Tab is prevented in the listbox, so Save and Cancel cannot be reached with the keyboard.                                                                                                 | a11y   | rendered  |         | ⬜ reported |      |     |       |

#### date-picker

[React report](../../../react/docs/parity/components/date-picker.md) · ⬜ reported: 3

| ID            | Issue                                                                                                                                                                            | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- | ------- | ----------- | ---- | --- | ---------------------------------------------------------------------------------------------------------------------- |
| date-picker-1 | A single-date picker with `dateRangeFormat` ignores the first month/year pick, then writes a DateRange into `selectedDate`.                                                      | behaviour | rendered  |         | ⬜ reported |      |     |                                                                                                                        |
| date-picker-2 | The today footer bar has no bottom corner radius and the Today button no 4rem minimum width.                                                                                     | visual    | rendered  |         | ⬜ reported |      |     |                                                                                                                        |
| date-picker-3 | input-group: the first input of a compact group keeps no compact padding, and `hc:placeholder:not-italic` makes the placeholder upright in HC (fundamental-styles keeps italic). | visual    | rendered  |         | ⬜ reported |      |     | Decided: italic placeholder in HC, as fundamental-styles (and React); the compact padding (first half) is a plain fix. |

#### button

[React report](../../../react/docs/parity/components/button.md) · ⬜ reported: 1

| ID       | Issue                                                                                                                                   | Kind   | Confirmed | Pattern                     | Status      | Test | Fix | Notes |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | --------------------------- | ----------- | ---- | --- | ----- |
| button-1 | `decisive` (`min-w-16`) loses to `compact:min-w-8`, so a decisive button is 32px wide in compact (`fullWidth` too, hidden by `w-full`). | visual | rendered  | pattern-compact-button-size | ⬜ reported |      |     |       |

#### combobox

[React report](../../../react/docs/parity/components/combobox.md) · ⬜ reported: 3

| ID         | Issue                                                                                                                                                    | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- | ------- | ----------- | ---- | --- | ----- |
| combobox-1 | Group headers in the list show a text cursor; fundamental-styles uses the default cursor.                                                                | visual    | rendered  |         | ⬜ reported |      |     |       |
| combobox-2 | In mobile immediate mode, Cancel, Close or Escape put the old text back without telling the form, so the field and the form value disagree.              | behaviour | rendered  |         | ⬜ reported |      |     |       |
| combobox-3 | The mobile dialog's search field has `aria-expanded="false"` while the list shows; with `noDropDownMaxWidth` the list still keeps a 40rem maximum width. | a11y      | rendered  |         | ⬜ reported |      |     |       |

#### nested-list

[React report](../../../react/docs/parity/components/nested-list.md) · ⬜ reported: 2

| ID            | Issue                                                                                                             | Kind   | Confirmed | Pattern                   | Status      | Test | Fix | Notes |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------------------------- | ----------- | ---- | --- | ----- |
| nested-list-1 | Rows are described by the list's last group header instead of the last header before them.                        | a11y   | rendered  |                           | ⬜ reported |      |     |       |
| nested-list-2 | In RTL the collapsed arrow picks `navigation-left-arrow`, which the icon mirrors again (it points the wrong way). | visual | rendered  | pattern-rtl-double-mirror | ⬜ reported |      |     |       |

#### time-picker

[React report](../../../react/docs/parity/components/time-picker.md) · ⬜ reported: 2

| ID            | Issue                                                                                                | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes                                                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------- | --------- | --------- | ------- | ----------- | ---- | --- | ---------------------------------------------------------------------------------------------------------------- |
| time-picker-1 | The button glyph is `fob-watch`; fundamental-styles and UI5 use `time-entry-request`.                | visual    | rendered  |         | ⬜ reported |      |     | Decided: `time-entry-request`, as fundamental-styles and UI5 (and React). A visible change from fundamental-ngx. |
| time-picker-2 | After a press outside, the focus goes back to the input even when the press focused another element. | behaviour | rendered  |         | ⬜ reported |      |     |                                                                                                                  |

#### multi-input

[React report](../../../react/docs/parity/components/multi-input.md) · ⬜ reported: 5

| ID            | Issue                                                                                              | Kind          | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------------- | -------------------------------------------------------------------------------------------------- | ------------- | --------- | ------- | ----------- | ---- | --- | ----- |
| multi-input-1 | The popup fills a wide field while its list stops at 600px; fundamental-styles caps both at 40rem. | visual        | rendered  |         | ⬜ reported |      |     |       |
| multi-input-2 | Multi-input options are 40px high; fundamental-styles' list items are 44px (45px selected).        | visual        | rendered  |         | ⬜ reported |      |     |       |
| multi-input-3 | The hovered multi-input field has no field hover shadow.                                           | visual        | rendered  |         | ⬜ reported |      |     |       |
| multi-input-4 | In high contrast the multi-input addon button makes the field 40px instead of 36px (26px compact). | visual        | rendered  |         | ⬜ reported |      |     |       |
| multi-input-5 | The multi-input list has a background of its own (not visible).                                    | computed-only | rendered  |         | ⬜ reported |      |     |       |

#### pagination

[React report](../../../react/docs/parity/components/pagination.md) · ⬜ reported: 5

| ID           | Issue                                                                                                                 | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| pagination-1 | Cozy pagination page buttons are 2px narrower because of `px-2` on page and current-page buttons.                     | visual | rendered  |         | ⬜ reported |      |     |       |
| pagination-2 | The mobile pagination "Page:" and "of N" labels lack the form-label end margin (the nav is 16px narrower).            | visual | rendered  |         | ⬜ reported |      |     |       |
| pagination-3 | The pagination root `gap-4` moves the nav 8px off centre.                                                             | visual | rendered  |         | ⬜ reported |      |     |       |
| pagination-4 | The pagination labels have no text cursor.                                                                            | visual | rendered  |         | ⬜ reported |      |     |       |
| pagination-5 | In the mobile pagination layout the nav's `aria-describedby` points at the results text, which is not rendered there. | a11y   | rendered  |         | ⬜ reported |      |     |       |

#### action-sheet

[React report](../../../react/docs/parity/components/action-sheet.md) · ⬜ reported: 4

| ID             | Issue                                                                                                                                                          | Kind          | Confirmed | Pattern             | Status      | Test | Fix | Notes |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------------------- | ----------- | ---- | --- | ----- |
| action-sheet-1 | The mobile action-sheet list keeps rounded top corners under the title bar: `[[data-sheet-bar]+&]` never matches, the list sits inside `fd-action-sheet-body`. | visual        | rendered  |                     | ⬜ reported |      |     |       |
| action-sheet-2 | The action-sheet title bar is raised (`z-[2]`) over the list, so its shadow falls on the first action; in fundamental-styles the list is on top.               | visual        | rendered  |                     | ⬜ reported |      |     |       |
| action-sheet-3 | The action-sheet `shadow-sap-content-shadow1/2` utilities add transparent ring layers.                                                                         | computed-only | rendered  | pattern-shadow-ring | ⬜ reported |      |     |       |
| action-sheet-4 | The action-sheet popover list has no corner radius, unlike fundamental-styles.                                                                                 | visual        | rendered  |                     | ⬜ reported |      |     |       |

#### overflow-layout

[React report](../../../react/docs/parity/components/overflow-layout.md) · ⬜ reported: 1

| ID                | Issue                                                                                                                                      | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- | --------- | ------- | ----------- | ---- | --- | ----- |
| overflow-layout-1 | The overflow-layout "more" control is measured only when it first appears, so a growing label ("9 more" to "10 more") keeps a stale width. | behaviour | rendered  |         | ⬜ reported |      |     |       |

#### wizard

[React report](../../../react/docs/parity/components/wizard.md) · ⬜ reported: 4

| ID       | Issue                                                                                                                       | Kind          | Confirmed | Pattern              | Status      | Test | Fix | Notes |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | -------------------- | ----------- | ---- | --- | ----- |
| wizard-1 | The wizard step indicator uses `rounded-full` (a huge pixel radius) instead of fundamental-styles' 50% (not visible).       | computed-only | rendered  | pattern-rounded-full | ⬜ reported |      |     |       |
| wizard-2 | The connector of the stacked top wizard step keeps `min-w-4`, so it is 16px instead of 5px and runs past its 4rem step.     | visual        | rendered  |                      | ⬜ reported |      |     |       |
| wizard-3 | The wizard progress bar uses the `shadow-sap-content-header-shadow` utility, which adds Tailwind's transparent ring layers. | computed-only | rendered  | pattern-shadow-ring  | ⬜ reported |      |     |       |
| wizard-4 | Stacked wizard steps hide their label with `display: none`, so a stacked step with only a glyph has no accessible name.     | a11y          | rendered  |                      | ⬜ reported |      |     |       |

#### tabs

[React report](../../../react/docs/parity/components/tabs.md) · ⬜ reported: 4

| ID     | Issue                                                                                                                                                                                                                                            | Kind          | Confirmed | Pattern               | Status      | Test | Fix | Notes                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | --------- | --------------------- | ----------- | ---- | --- | ------------------------------------------------------------- |
| tabs-1 | Every tab item is the first child of its overflow wrapper, so all default-mode tabs match the `:first-child` rules and lose their start padding and margin; in other modes the first tab keeps a start padding fundamental-styles does not have. | visual        | rendered  |                       | ⬜ reported |      |     |                                                               |
| tabs-2 | The tab tag uses `--sapContent_LabelColor`; fundamental-styles uses `--sapTextColor`.                                                                                                                                                            | visual        | rendered  |                       | ⬜ reported |      |     |                                                               |
| tabs-3 | `TabCount` in a mode loses `leading-4` to tailwind-merge (`text-sap-font-small-size` comes after it).                                                                                                                                            | visual        | rendered  | pattern-leading-merge | ⬜ reported |      |     |                                                               |
| tabs-4 | The round tab icon has a 16px line height instead of normal and a `rounded-full` radius (computed styles only).                                                                                                                                  | computed-only | rendered  | pattern-rounded-full  | ⬜ reported |      |     | The 16px line height (first half) is not part of the pattern. |

#### side-navigation

[React report](../../../react/docs/parity/components/side-navigation.md) · ⬜ reported: 1

| ID                | Issue                                                                                                                | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| side-navigation-1 | The side-navigation `<nav>` sets only the font family, so its lists take the page's line height instead of `normal`. | visual | rendered  |         | ⬜ reported |      |     |       |

#### breadcrumb

[React report](../../../react/docs/parity/components/breadcrumb.md) · ⬜ reported: 3

| ID           | Issue                                                                                                     | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------------ | --------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| breadcrumb-1 | The breadcrumb "more" link holds only icons and is 21px high instead of 24px.                             | visual | rendered  |         | ⬜ reported |      |     |       |
| breadcrumb-2 | The breadcrumb overflow layout's `gap-1` adds 4px between the "more" separator and the first item.        | visual | rendered  |         | ⬜ reported |      |     |       |
| breadcrumb-3 | Breadcrumb items' `py-px p-0` loses the 1px vertical padding to tailwind-merge, so items are 2px shorter. | visual | rendered  |         | ⬜ reported |      |     |       |

#### shellbar

[React report](../../../react/docs/parity/components/shellbar.md) · ⬜ reported: 7

| ID         | Issue                                                                                                                | Kind          | Confirmed | Pattern                   | Status      | Test | Fix | Notes |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------------------------- | ----------- | ---- | --- | ----- |
| shellbar-1 | The simple shellbar user menu has `order-1`, so it lands after the product switch.                                   | visual        | rendered  |                           | ⬜ reported |      |     |       |
| shellbar-2 | The RTL shellbar back button uses `slim-arrow-right`, which the icon mirrors, so it points left.                     | visual        | rendered  | pattern-rtl-double-mirror | ⬜ reported |      |     |       |
| shellbar-3 | The shellbar search field has no `--sapField_BackgroundStyle` bottom border.                                         | visual        | rendered  |                           | ⬜ reported |      |     |       |
| shellbar-4 | In HC the hovered shellbar search input takes the shell hover colour instead of staying transparent.                 | visual        | rendered  |                           | ⬜ reported |      |     |       |
| shellbar-5 | The shellbar bar and search shadows use `shadow-[…]` / `shadow-sap-field-shadow`, which add transparent ring layers. | computed-only | rendered  | pattern-shadow-ring       | ⬜ reported |      |     |       |
| shellbar-6 | `rounded-full` on the shellbar user menu button computes to 3.35544e+07px (computed styles only).                    | computed-only | rendered  | pattern-rounded-full      | ⬜ reported |      |     |       |
| shellbar-7 | The shellbar `ProductMenu` never shrinks or hides, so a size-s bar with one overflows.                               | visual        | rendered  |                           | ⬜ reported |      |     |       |

#### toolbar

[React report](../../../react/docs/parity/components/toolbar.md) · ⬜ reported: 3

| ID        | Issue                                                                                                             | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| --------- | ----------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| toolbar-1 | In an active info toolbar the label keeps the grey label colour on the teal bar.                                  | visual | rendered  |         | ⬜ reported |      |     |       |
| toolbar-2 | The icons of an active info toolbar use `--sapInfobar_TextColor`; fundamental-styles keeps `--sapList_TextColor`. | visual | rendered  |         | ⬜ reported |      |     |       |
| toolbar-3 | The active info toolbar's focus frame is inset by 2px; fundamental-styles uses 1px.                               | visual | rendered  |         | ⬜ reported |      |     |       |

#### inline-help

[React report](../../../react/docs/parity/components/inline-help.md) · ⬜ reported: 2

| ID            | Issue                                                                                                                    | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | --------- | --------- | ------- | ----------- | ---- | --- | ----- |
| inline-help-1 | In a button trigger the inline help's off-screen copy becomes part of the button's name.                                 | a11y      | rendered  |         | ⬜ reported |      |     |       |
| inline-help-2 | Clicking the form label's inline help icon focuses the field and closes the help again; on touch screens it never shows. | behaviour | rendered  |         | ⬜ reported |      |     |       |

#### product-switch

[React report](../../../react/docs/parity/components/product-switch.md) · ⬜ reported: 2

| ID               | Issue                                                                                                          | Kind          | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------- | ----------- | ---- | --- | ----- |
| product-switch-1 | The product-switch product focus frame is inset by 2px; fundamental-styles insets it by 3px.                   | visual        | rendered  |         | ⬜ reported |      |     |       |
| product-switch-2 | The product-switch product icon keeps `line-height: normal`; fundamental-styles uses 1 (computed styles only). | computed-only | rendered  |         | ⬜ reported |      |     |       |

#### split-button

[React report](../../../react/docs/parity/components/split-button.md) · ⬜ reported: 2

| ID             | Issue                                                                                                 | Kind          | Confirmed | Pattern | Status      | Test | Fix | Notes |
| -------------- | ----------------------------------------------------------------------------------------------------- | ------------- | --------- | ------- | ----------- | ---- | --- | ----- |
| split-button-1 | In HC the split-button buttons get `hc:bg-…` instead of staying transparent on the pad (not visible). | computed-only | rendered  |         | ⬜ reported |      |     |       |
| split-button-2 | In HC the split-button focus frame keeps rounded inner corners where the buttons are square.          | visual        | rendered  |         | ⬜ reported |      |     |       |

#### user-menu

[React report](../../../react/docs/parity/components/user-menu.md) · ⬜ reported: 1

| ID          | Issue                                                                                                                    | Kind   | Confirmed | Pattern                   | Status      | Test | Fix | Notes |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | ------ | --------- | ------------------------- | ----------- | ---- | --- | ----- |
| user-menu-1 | In RTL the user-menu mobile back button switches to `navigation-right-arrow`, which the icon mirrors, so it points left. | visual | rendered  | pattern-rtl-double-mirror | ⬜ reported |      |     |       |

#### object-marker

[React report](../../../react/docs/parity/components/object-marker.md) · ⬜ reported: 2

| ID              | Issue                                                                                                                                  | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| object-marker-1 | In RTL the object-marker `pe-1` gap of a mirrored glyph is flipped by the `rtl:-scale-x-100` transform, so the icon touches the label. | visual | rendered  |         | ⬜ reported |      |     |       |
| object-marker-2 | Clickable object markers inherit `leading-none`, 1–2px shorter than fundamental-styles' link markers.                                  | visual | rendered  |         | ⬜ reported |      |     |       |

#### object-number

[React report](../../../react/docs/parity/components/object-number.md) · ⬜ reported: 1

| ID              | Issue                                                                                                                                                       | Kind   | Confirmed | Pattern               | Status      | Test | Fix | Notes |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | --------------------- | ----------- | ---- | --- | ----- |
| object-number-1 | Regular and inverted object numbers lose their 1rem line height: tailwind-merge drops `leading-4` before `text-sap-font-size` / `text-sap-font-small-size`. | visual | rendered  | pattern-leading-merge | ⬜ reported |      |     |       |

#### card

[React report](../../../react/docs/parity/components/card.md) · ⬜ reported: 6

| ID     | Issue                                                                                                                                                      | Kind          | Confirmed | Pattern                | Status      | Test | Fix | Notes |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ---------------------- | ----------- | ---- | --- | ----- |
| card-1 | The card title uses `font-bold` on the 72-Bold font, so the browser adds synthetic bold; fundamental-styles uses normal weight.                            | visual        | rendered  | pattern-synthetic-bold | ⬜ reported |      |     |       |
| card-2 | The card counter inherits `line-height: normal` (14px instead of 16px), so the header is 2px shorter.                                                      | visual        | rendered  |                        | ⬜ reported |      |     |       |
| card-3 | Card badges are 16px instead of 18px (`min-h-0` and a 0.875rem line height).                                                                               | visual        | rendered  |                        | ⬜ reported |      |     |       |
| card-4 | `shadow-(--card-shadow)` adds Tailwind's transparent ring layers (computed styles only).                                                                   | computed-only | rendered  | pattern-shadow-ring    | ⬜ reported |      |     |       |
| card-5 | In HC banner cards lose their 1px ring: `hc:[--card-shadow:none]` applies to every card.                                                                   | visual        | rendered  |                        | ⬜ reported |      |     |       |
| card-6 | An `isOverlay` banner card keeps the image at 50% and the text at 50% − 3rem below 1024px; fundamental-styles uses a full-width image and 80% − 3rem text. | visual        | rendered  |                        | ⬜ reported |      |     |       |

#### generic-tag

[React report](../../../react/docs/parity/components/generic-tag.md) · ⬜ reported: 2

| ID            | Issue                                                                                                                                                    | Kind          | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------- | ----------- | ---- | --- | ----- |
| generic-tag-1 | The generic-tag status icon takes `text-base`, so its line height is 1.5rem instead of 1rem (computed only).                                             | computed-only | rendered  |         | ⬜ reported |      |     |       |
| generic-tag-2 | Pressed generic tags keep the hover background in Horizon and Dark: the `active:` classes come before the `enabled-hover:` variant in the generated CSS. | visual        | rendered  |         | ⬜ reported |      |     |       |

#### text

[React report](../../../react/docs/parity/components/text.md) · ⬜ reported: 2

| ID     | Issue                                                                                                                                      | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- | --------- | ------- | ----------- | ---- | --- | ----- |
| text-1 | Selected text is invisible in Horizon and Dark: the text uses `--sapContent_Selected_Background`, fundamental-styles `--sapSelectedColor`. | visual    | rendered  |         | ⬜ reported |      |     |       |
| text-2 | A text that starts expanded shows no Less toggle, and a text that changes while expanded is not measured again.                            | behaviour | rendered  |         | ⬜ reported |      |     |       |

#### panel

[React report](../../../react/docs/parity/components/panel.md) · ⬜ reported: 3

| ID      | Issue                                                                                                                                                  | Kind          | Confirmed | Pattern                | Status      | Test | Fix | Notes |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | --------- | ---------------------- | ----------- | ---- | --- | ----- |
| panel-1 | The panel title uses `font-bold` on the 72-Bold header font, so the browser adds synthetic bold; fundamental-styles has weight 400.                    | visual        | rendered  | pattern-synthetic-bold | ⬜ reported |      |     |       |
| panel-2 | The panel expand button's `text-base` comes after `leading-[normal]`, so tailwind-merge drops the line height (24px instead of normal; computed only). | computed-only | rendered  | pattern-leading-merge  | ⬜ reported |      |     |       |
| panel-3 | A `transparent` panel also clears the header background; fundamental-styles keeps it (visible in Horizon Dark and HC).                                 | visual        | rendered  |                        | ⬜ reported |      |     |       |

#### scrollbar

[React report](../../../react/docs/parity/components/scrollbar.md) · ⬜ reported: 1

| ID          | Issue                                                                                                                              | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| scrollbar-1 | The scrollbar sets no typography; fundamental-styles' `.fd-scrollbar` sets the SAP font, size, normal line height and text colour. | visual | rendered  |         | ⬜ reported |      |     |       |

#### status-indicator

[React report](../../../react/docs/parity/components/status-indicator.md) · ⬜ reported: 2

| ID                 | Issue                                                                                                                                                                  | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | --------------------------------- |
| status-indicator-1 | The status-indicator root sets the small font size and the label colour, so a neutral label is grey; fundamental-styles uses `sapTextColor` and `line-height: normal`. | visual | rendered  |         | ⬜ reported |      |     |                                   |
| status-indicator-2 | The status-indicator Clickable story handles Enter twice (its own `keydown.enter` plus the component's activation).                                                    | test   | rendered  |         | ⬜ reported |      |     | A story bug, not a component bug. |

#### progress-indicator

[React report](../../../react/docs/parity/components/progress-indicator.md) · ⬜ reported: 4

| ID                   | Issue                                                                                                                           | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| progress-indicator-1 | The progress-indicator label uses `leading-normal` (1.5) instead of `normal`, so it sits 1px over the track.                    | visual | rendered  |         | ⬜ reported |      |     |       |
| progress-indicator-2 | The progress-indicator label spans the whole root; fundamental-styles puts it 1px inside the track border, as wide as its text. | visual | rendered  |         | ⬜ reported |      |     |       |
| progress-indicator-3 | The progress-indicator bar sits 1px over the track border, has a 10px minimum width and is 2px wider at 100%.                   | visual | rendered  |         | ⬜ reported |      |     |       |
| progress-indicator-4 | The progress-indicator icon box is 17px instead of 18px, with the glyph 1px higher.                                             | visual | rendered  |         | ⬜ reported |      |     |       |

#### formatted-text

[React report](../../../react/docs/parity/components/formatted-text.md) · ⬜ reported: 1

| ID               | Issue                                                                             | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ---------------- | --------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| formatted-text-1 | Formatted-text links have no underline offset, hover colour or SAP focus outline. | visual | rendered  |         | ⬜ reported |      |     |       |

#### quick-view

[React report](../../../react/docs/parity/components/quick-view.md) · ⬜ reported: 1

| ID           | Issue                                                                                                                     | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| quick-view-1 | The quick-view subheader's `min-h-0` drops the bar's minimum height (44px, 40px compact), which fundamental-styles keeps. | visual | rendered  |         | ⬜ reported |      |     |       |

#### avatar-group

[React report](../../../react/docs/parity/components/avatar-group.md) · ⬜ reported: 4

| ID             | Issue                                                                                                                                                                         | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- | ------- | ----------- | ---- | --- | ----- |
| avatar-group-1 | The avatar-group overflow button uses avatar 1 colours, bold small text and a fixed square size instead of fundamental-styles' button-coloured avatar sized to its count.     | visual    | rendered  |         | ⬜ reported |      |     |       |
| avatar-group-2 | Avatars in individual avatar groups get no hover or press colours, and their focus frame is 0.25rem out instead of 0.3125rem.                                                 | visual    | rendered  |         | ⬜ reported |      |     |       |
| avatar-group-3 | Group-type avatar-group hover forces `--sapAvatar_6_Hover_Background` on every avatar instead of each avatar's own.                                                           | visual    | rendered  |         | ⬜ reported |      |     |       |
| avatar-group-4 | An avatar group that shrinks to fit (e.g. in a flex row) loses one avatar per measurement until only the overflow is left: every avatar width counts a gap, the last one too. | behaviour | rendered  |         | ⬜ reported |      |     |       |

#### slider

[React report](../../../react/docs/parity/components/slider.md) · ⬜ reported: 1

| ID       | Issue                                                                                                            | Kind          | Confirmed | Pattern             | Status      | Test | Fix | Notes |
| -------- | ---------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------------------- | ----------- | ---- | --- | ----- |
| slider-1 | The slider HC track and progress `hc:shadow-[…]` adds Tailwind's transparent ring layers (computed styles only). | computed-only | rendered  | pattern-shadow-ring | ⬜ reported |      |     |       |

#### rating-indicator

[React report](../../../react/docs/parity/components/rating-indicator.md) · ⬜ reported: 2

| ID                 | Issue                                                                                              | Kind   | Confirmed          | Pattern               | Status      | Test | Fix | Notes                                     |
| ------------------ | -------------------------------------------------------------------------------------------------- | ------ | ------------------ | --------------------- | ----------- | ---- | --- | ----------------------------------------- |
| rating-indicator-1 | In HC the rating-indicator focus outline has round corners; fundamental-styles' is square.         | visual | rendered           |                       | ⬜ reported |      |     |                                           |
| rating-indicator-2 | The rating-indicator half icons lose Icon's `leading-none` to tailwind-merge (read from the code). | visual | read from the code | pattern-leading-merge | ⬜ reported |      |     | Same cause as icon-1: may be fixed by it. |

#### datetime-picker

[React report](../../../react/docs/parity/components/datetime-picker.md) · ⬜ reported: 2 · ✅ verified: 1

| ID                | Issue                                                                                                                                                                                                       | Kind   | Confirmed | Pattern | Status      | Test                                                                                                    | Fix     | Notes                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| datetime-picker-1 | The datetime-picker footer has no decisive (4rem) OK and Cancel buttons and no popover bottom corners.                                                                                                      | visual | rendered  |         | ⬜ reported |                                                                                                         |         |                                                                                                                                                                                                                                                                                                                                                          |
| datetime-picker-2 | The mobile portrait datetime-picker dialog keeps the 18rem calendar instead of fundamental-styles' full-width portrait layout.                                                                              | visual | rendered  |         | ⬜ reported |                                                                                                         |         |                                                                                                                                                                                                                                                                                                                                                          |
| datetime-picker-3 | The flaky datetime-picker spec on `main` is a race: the echo of an earlier `dateChange` through `[(date)]` arrives after the next keystroke, and the linked `value`/`text` signals reformat the typed text. | test   | rendered  |         | ✅ verified | DatetimePicker modes › keeps what was typed when the date it emitted comes back after a later keystroke | c4a4b68 | Root cause in the component (the linked value/text signals), symptom in the spec "parses typed text with customDateTimeFormat"; it also fails the root `pnpm check` about one run in two. Verified: the new test fails before the fix and passes after; the flaky spec passed 10 of 10 runs after the fix (5 of 10 before); `pnpm angular check` passes. |

#### vertical-navigation

[React report](../../../react/docs/parity/components/vertical-navigation.md) · ⬜ reported: 4

| ID                    | Issue                                                                                                                                             | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| vertical-navigation-1 | Vertical-navigation has no space between icon and text, so first-level texts are 4px closer to the icon and out of line with second-level texts.  | visual | rendered  |         | ⬜ reported |      |     |       |
| vertical-navigation-2 | The vertical-navigation group header is a single bold text, not fundamental-styles' list group header title.                                      | visual | rendered  |         | ⬜ reported |      |     |       |
| vertical-navigation-3 | The condensed vertical-navigation panel has a padded header, 16px header text, second-level texts 8px further in, 12px corners and a 44px header. | visual | rendered  |         | ⬜ reported |      |     |       |
| vertical-navigation-4 | The vertical-navigation column sets only the font family, not fundamental-styles' size, line height and colour.                                   | visual | rendered  |         | ⬜ reported |      |     |       |

#### dynamic-page

[React report](../../../react/docs/parity/components/dynamic-page.md) · ⬜ reported: 4

| ID             | Issue                                                                                                                                                             | Kind          | Confirmed | Pattern                     | Status      | Test | Fix | Notes |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | --------------------------- | ----------- | ---- | --- | ----- |
| dynamic-page-1 | Compact dynamic-page collapse, expand and pin buttons are 32×26px instead of 24×24px: the button's `compact:` size classes override `h-6 w-6 min-w-6 p-0`.        | visual        | rendered  | pattern-compact-button-size | ⬜ reported |      |     |       |
| dynamic-page-2 | The dynamic-page collapse, expand and pin buttons use `--sapButton_Background`; fundamental-styles uses `--sapObjectHeader_Background` (visible in Horizon Dark). | visual        | rendered  |                             | ⬜ reported |      |     |       |
| dynamic-page-3 | The dynamic-page gradient lines next to the header buttons use `bg-linear-to-*`, which interpolates in oklab where fundamental-styles uses sRGB (computed only).  | computed-only | rendered  | pattern-oklab-gradient      | ⬜ reported |      |     |       |
| dynamic-page-4 | The dynamic-page title area has `cursor-pointer` at rest; fundamental-styles sets it on hover only (computed only).                                               | computed-only | rendered  |                             | ⬜ reported |      |     |       |

#### timeline

[React report](../../../react/docs/parity/components/timeline.md) · ⬜ reported: 1

| ID         | Issue                                                                                                                                      | Kind      | Confirmed          | Pattern | Status      | Test | Fix | Notes |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------------------ | ------- | ----------- | ---- | --- | ----- |
| timeline-1 | Switching the timeline `axis` keeps the old axis' inline line length and the double-layout `margin-top` on the nodes (read from the code). | behaviour | read from the code |         | ⬜ reported |      |     |       |

#### micro-process-flow

[React report](../../../react/docs/parity/components/micro-process-flow.md) · ⬜ reported: 2

| ID                   | Issue                                                                                                                                                  | Kind          | Confirmed | Pattern              | Status      | Test | Fix | Notes |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | --------- | -------------------- | ----------- | ---- | --- | ----- |
| micro-process-flow-1 | The micro-process-flow root's `leading-(--sapContent_LineHeight)` gives every part a 21px line height; fundamental-styles uses normal (computed only). | computed-only | rendered  |                      | ⬜ reported |      |     |       |
| micro-process-flow-2 | The micro-process-flow icon's `rounded-full` computes to 3.35544e+07px instead of 50% (computed only).                                                 | computed-only | rendered  | pattern-rounded-full | ⬜ reported |      |     |       |

#### multi-combobox

[React report](../../../react/docs/parity/components/multi-combobox.md) · ⬜ reported: 9

| ID               | Issue                                                                                                                                                          | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- | ------- | ----------- | ---- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| multi-combobox-1 | The multi-combobox popup fills a wide field while its list stops at 600px; fundamental-styles uses the field width minus 2px, capped at 40rem.                 | visual    | rendered  |         | ⬜ reported |      |     |                                                                                                                                                                                     |
| multi-combobox-2 | Multi-combobox options are 40px high; fundamental-styles' are 44px (45px selected).                                                                            | visual    | rendered  |         | ⬜ reported |      |     |                                                                                                                                                                                     |
| multi-combobox-3 | The hovered multi-combobox field has no field hover shadow.                                                                                                    | visual    | rendered  |         | ⬜ reported |      |     |                                                                                                                                                                                     |
| multi-combobox-4 | In HC the multi-combobox addon button makes the field 40px instead of 36px.                                                                                    | visual    | rendered  |         | ⬜ reported |      |     |                                                                                                                                                                                     |
| multi-combobox-5 | Multi-combobox secondary text uses `--sapContent_LabelColor`, capped at 40%; fundamental-styles uses the neutral text colour, sharing the row (24rem / 16rem). | visual    | rendered  |         | ⬜ reported |      |     |                                                                                                                                                                                     |
| multi-combobox-6 | The multi-combobox state message box has vertical and end padding and wraps, instead of fundamental-styles' truncated 2rem line.                               | visual    | rendered  |         | ⬜ reported |      |     | Decided: keep a wrapping message (truncation hides text); align the rest of the box with fundamental-styles where it does not prevent wrapping. Check UI5 in the multi-combobox PR. |
| multi-combobox-7 | Multi-combobox Shift ranges never apply on desktop check boxes: every check-box click clears the anchor.                                                       | behaviour | rendered  |         | ⬜ reported |      |     |                                                                                                                                                                                     |
| multi-combobox-8 | Mobile multi-combobox renders the state message's id twice (page field and dialog field).                                                                      | a11y      | rendered  |         | ⬜ reported |      |     |                                                                                                                                                                                     |
| multi-combobox-9 | The multi-combobox polite live region is created together with its text, so screen readers often do not announce it.                                           | a11y      | rendered  |         | ⬜ reported |      |     |                                                                                                                                                                                     |

#### facets

[React report](../../../react/docs/parity/components/facets.md) · ⬜ reported: 3

| ID       | Issue                                                                                                       | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes |
| -------- | ----------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ----- |
| facets-1 | The facet title has no 1rem bottom margin, so the content sits right on the title.                          | visual | rendered  |         | ⬜ reported |      |     |       |
| facets-2 | Facet form rows have `gap-1`, which adds 4px on top of the label's or icon's 0.5rem end margin.             | visual | rendered  |         | ⬜ reported |      |     |       |
| facets-3 | Facet form rows have `items-baseline`, which makes icon rows 18px high and puts links 2px below their icon. | visual | rendered  |         | ⬜ reported |      |     |       |

#### flexible-column-layout

[React report](../../../react/docs/parity/components/flexible-column-layout.md) · ⬜ reported: 3

| ID                       | Issue                                                                                                                                                                                                               | Kind   | Confirmed | Pattern                     | Status      | Test | Fix | Notes |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | --------------------------- | ----------- | ---- | --- | ----- |
| flexible-column-layout-1 | `data-density="compact"` on the flexible-column-layout separator buttons makes them 26×32px in both densities (`compact:min-w-8` wins over `w-6 min-w-6`); fundamental-styles has 32×24px cozy and 26×24px compact. | visual | rendered  | pattern-compact-button-size | ⬜ reported |      |     |       |
| flexible-column-layout-2 | The flexible-column-layout separator gradient lines use `bg-linear-to-t`/`-b`, which blends in oklab; fundamental-styles uses sRGB.                                                                                 | visual | rendered  | pattern-oklab-gradient      | ⬜ reported |      |     |       |
| flexible-column-layout-3 | Flexible-column-layout columns keep their 1px `--sapGroup_ContentBorderColor` borders in HC; fundamental-styles has none.                                                                                           | visual | rendered  |                             | ⬜ reported |      |     |       |

#### fixed-card-layout

[React report](../../../react/docs/parity/components/fixed-card-layout.md) · ⬜ reported: 2

| ID                  | Issue                                                                                                                      | Kind          | Confirmed | Pattern             | Status      | Test | Fix | Notes |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------------------- | ----------- | ---- | --- | ----- |
| fixed-card-layout-1 | The fixed card layout has `align-items: flex-start`; fundamental-styles has `center` (computed only).                      | computed-only | rendered  |                     | ⬜ reported |      |     |       |
| fixed-card-layout-2 | The fixed-card-layout drag preview's `shadow-sap-content-shadow2` adds Tailwind's transparent ring layers (computed only). | computed-only | rendered  | pattern-shadow-ring | ⬜ reported |      |     |       |

#### resizable-card-layout

[React report](../../../react/docs/parity/components/resizable-card-layout.md) · ⬜ reported: 4

| ID                      | Issue                                                                                                                                           | Kind          | Confirmed | Pattern | Status      | Test | Fix | Notes |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | ------- | ----------- | ---- | --- | ----- |
| resizable-card-layout-1 | The resizable-card-layout resize corner is as tall as the card (`[&>*]:h-full` applies to it), so its glyph sits in the middle of the end edge. | visual        | rendered  |         | ⬜ reported |      |     |       |
| resizable-card-layout-2 | In RTL the resizable-card-layout corner sits on the right (`rtl:-start-0`); fundamental-styles puts it at the bottom left.                      | visual        | rendered  |         | ⬜ reported |      |     |       |
| resizable-card-layout-3 | The RTL resizable-card-layout corner icon turns with `rotate` instead of `transform` (computed only).                                           | computed-only | rendered  |         | ⬜ reported |      |     |       |
| resizable-card-layout-4 | In RTL the resizable-card-layout pointer direction is reversed, so cards never move down while a card grows.                                    | behaviour     | rendered  |         | ⬜ reported |      |     |       |

#### feed-list

[React report](../../../react/docs/parity/components/feed-list.md) · ⬜ reported: 4

| ID          | Issue                                                                                                                                                                     | Kind   | Confirmed | Pattern                | Status      | Test | Fix | Notes |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ---------------------- | ----------- | ---- | --- | ----- |
| feed-list-1 | In RTL the feed-list desktop actions float to the start: `rtl:float-start` is added on top of `float-end`, which Tailwind v4 already makes logical.                       | visual | rendered  |                        | ⬜ reported |      |     |       |
| feed-list-2 | In a borderless feed list the last item's bottom padding is 12px instead of 16px (`[&+&]:py-3` beats `last:pb-4`).                                                        | visual | rendered  |                        | ⬜ reported |      |     |       |
| feed-list-3 | The feed-list author link renders in synthetic bold (`font-bold` on the 72-Bold link); fundamental-styles uses weight 400.                                                | visual | rendered  | pattern-synthetic-bold | ⬜ reported |      |     |       |
| feed-list-4 | A feed-list footer Reply link keeps the link's 1rem line height (22px footer instead of 17px), and the bylines are 9.6px instead of 10px (preflight sets `small` to 80%). | visual | rendered  |                        | ⬜ reported |      |     |       |

#### grid-list

[React report](../../../react/docs/parity/components/grid-list.md) · ⬜ reported: 4

| ID          | Issue                                                                                                         | Kind   | Confirmed | Pattern                   | Status      | Test | Fix | Notes |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------------------------- | ----------- | ---- | --- | ----- |
| grid-list-1 | The grid-list item title uses the header font (72-Bold) instead of fundamental-styles' regular 72.            | visual | rendered  |                           | ⬜ reported |      |     |       |
| grid-list-2 | The grid-list title bar text uses the toolbar label colour instead of the text colour.                        | visual | rendered  |                           | ⬜ reported |      |     |       |
| grid-list-3 | Grid-list group headers that follow items lack fundamental-styles' 0.75rem top margin.                        | visual | rendered  |                           | ⬜ reported |      |     |       |
| grid-list-4 | The grid-list navigation arrow points the wrong way in RTL: `rtl:rotate-180` undoes the icon's own mirroring. | visual | rendered  | pattern-rtl-double-mirror | ⬜ reported |      |     |       |

#### carousel

[React report](../../../react/docs/parity/components/carousel.md) · ⬜ reported: 4

| ID         | Issue                                                                                                                                             | Kind          | Confirmed | Pattern                     | Status      | Test | Fix | Notes                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | --------------------------- | ----------- | ---- | --- | ---------------------------------------------------------------------- |
| carousel-1 | After a resize or a `visibleSlidesCount` change, a fixed-count carousel keeps its old pixel offset and shows another slide than the selected one. | behaviour     | rendered  |                             | ⬜ reported |      |     |                                                                        |
| carousel-2 | The carousel live region announces "Displaying item 1 of 0" when there are no slides.                                                             | a11y          | rendered  |                             | ⬜ reported |      |     |                                                                        |
| carousel-3 | Compact carousel navigation buttons keep the button's 7px side padding: `p-0` does not override `compact:px-…` (computed only).                   | computed-only | rendered  | pattern-compact-button-size | ⬜ reported |      |     |                                                                        |
| carousel-4 | Carousel dots and buttons use `rounded-full` instead of 50% and lack minimum heights (computed only).                                             | computed-only | rendered  | pattern-rounded-full        | ⬜ reported |      |     | The missing minimum heights (second half) are not part of the pattern. |

#### file-uploader

[React report](../../../react/docs/parity/components/file-uploader.md) · ⬜ reported: 2

| ID              | Issue                                                                                                                             | Kind      | Confirmed | Pattern | Status      | Test | Fix | Notes |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- | ------- | ----------- | ---- | --- | ----- |
| file-uploader-1 | The file-uploader `my-0` removes the cozy field margins only, so the uploader is 36px instead of 44px in cozy.                    | visual    | rendered  |         | ⬜ reported |      |     |       |
| file-uploader-2 | A disabled file uploader accepts the drag, then ignores the drop without `preventDefault`, so the browser opens the dropped file. | behaviour | rendered  |         | ⬜ reported |      |     |       |

#### upload-collection

[React report](../../../react/docs/parity/components/upload-collection.md) · ⬜ reported: 6

| ID                  | Issue                                                                                                     | Kind          | Confirmed          | Pattern | Status      | Test | Fix | Notes                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------- | ------------- | ------------------ | ------- | ----------- | ---- | --- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| upload-collection-1 | The upload-collection link title takes the list text colour and line height.                              | visual        | read from the code |         | ⬜ reported |      |     | The React report says this was seen in the React port with the same classes, not checked in Angular itself: treated as read from the code. |
| upload-collection-2 | The upload-collection title link and rename field inherit `pointer-events: none` (read from the classes). | visual        | read from the code |         | ⬜ reported |      |     |                                                                                                                                            |
| upload-collection-3 | The upload-collection button group is 4px narrower (`gap-0.5`, no first margin, no space).                | visual        | rendered           |         | ⬜ reported |      |     |                                                                                                                                            |
| upload-collection-4 | The upload-collection separator has `leading-none` on the span instead of the bullet (computed only).     | computed-only | rendered           |         | ⬜ reported |      |     |                                                                                                                                            |
| upload-collection-5 | The upload-collection status group has no label colour (computed only).                                   | computed-only | rendered           |         | ⬜ reported |      |     |                                                                                                                                            |
| upload-collection-6 | A long upload-collection name next to a marker is not middle-shortened.                                   | visual        | rendered           |         | ⬜ reported |      |     |                                                                                                                                            |

#### notification

[React report](../../../react/docs/parity/components/notification.md) · ⬜ reported: 2

| ID             | Issue                                                                                              | Kind          | Confirmed | Pattern | Status      | Test | Fix | Notes |
| -------------- | -------------------------------------------------------------------------------------------------- | ------------- | --------- | ------- | ----------- | ---- | --- | ----- |
| notification-1 | The notification group header lacks fundamental-styles' transparent bottom border (computed only). | computed-only | rendered  |         | ⬜ reported |      |     |       |
| notification-2 | Notifications sit directly inside a `<ul>` as non-`<li>` elements, which axe reports.              | a11y          | rendered  |         | ⬜ reported |      |     |       |

#### settings

[React report](../../../react/docs/parity/components/settings.md) · ⬜ reported: 2

| ID         | Issue                                                                                                                                        | Kind   | Confirmed | Pattern                   | Status      | Test | Fix | Notes |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------------------------- | ----------- | ---- | --- | ----- |
| settings-1 | The settings profile card name uses 72 Semibold Duplex with a 1.4rem line height; fundamental-styles uses 72 Bold with a normal line height. | visual | rendered  |                           | ⬜ reported |      |     |       |
| settings-2 | In RTL the settings back button uses `navigation-right-arrow`, which the icon mirrors again, so it points left.                              | visual | rendered  | pattern-rtl-double-mirror | ⬜ reported |      |     |       |

#### content-density

[React report](../../../react/docs/parity/components/content-density.md) · ⬜ reported: 1

| ID                | Issue                                                                                                                                                                                                    | Kind   | Confirmed | Pattern | Status      | Test | Fix | Notes                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- | ------- | ----------- | ---- | --- | ------------------------------------------------------------------------------- |
| content-density-1 | The `compact` variant in `fundamental.css` stops at one level: a compact section inside a cozy island of a compact page stays cozy (Angular's own inheritance story shows it under the compact toolbar). | visual | rendered  |         | ⬜ reported |      |     | Shared styles (`registry/styles/fundamental.css`): every component is affected. |

<!-- tracker:end -->
