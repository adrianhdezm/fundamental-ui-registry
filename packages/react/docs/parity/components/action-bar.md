## action-bar

Sources: fundamental-react [ActionBar](https://github.com/SAP/fundamental-react/tree/main/src/ActionBar) · Angular
[`registry/ui/action-bar`](../../../../angular/registry/ui/action-bar/) · fundamental-styles
[Action Bar](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-action-bar--docs)
Registry: `registry/ui/action-bar/`, on Base UI's `useRender` (root) and the `title` component (heading).

API: the Angular parts as components: `ActionBar` (`size`: `s`, `m_l` by default, `xl`), `ActionBarHeader`,
`ActionBarBack`, `ActionBarTitle`, `ActionBarActions` and `ActionBarDescription` (`withBackBtn`). Native props, a
`className` and the `ref` go to each part's element; `ActionBar` takes `render` to render another element (e.g.
`<header />`). The back button and the actions are `Button`s the app puts in `ActionBarBack` and `ActionBarActions`;
`hidden` on `ActionBarActions` hides them, as in Angular. The back button and description are hidden below a 600px
viewport.

fundamental-react's props map to the parts: `title` is `ActionBarTitle`'s children, `headingLevel` its `level`,
`headingStyle` its `headerSize`, `titleProps` its `headingProps` (e.g. an `id` for `aria-labelledby`);
`description`/`descriptionProps` are `ActionBarDescription`; `actions`/`actionProps`/`actionClassName` are
`ActionBarActions`; `onBackClick`, `backButtonLabel`, `buttonProps` and `buttonContainerClassName` are the app's own
`Button` inside `ActionBarBack` (whose `className` is the container class). The description indent follows
`withBackBtn`, not the presence of a back button, as in Angular.

**Differences, on purpose:**

- `ActionBarTitle` takes `level` (2 by default, the Angular `<h2>`) and `headerSize` (3 by default, the size of
  fundamental-styles' `fd-title--h3`) from fundamental-react, through the `Title` component. Its line height is the
  Title's `normal`, as fundamental-styles; Angular sets `leading-7` (28px), the same height for the 24px font.
- No landmark or labels by default: fundamental-styles' examples add `role="banner"`, `aria-labelledby`,
  `aria-describedby` and a `role="group"` on the actions; Angular sets none, and a page may have only one banner.
  Apps pass them as native props (the spec covers it).
- The shadow is `[box-shadow:var(--sapContent_HeaderShadow)]`, not the `shadow-sap-content-header-shadow` utility,
  which prepends Tailwind's transparent ring and inset layers; the computed shadow is now the token's alone.

### Stories vs. sources

| Source            | Example                            | React story          | Status     | Notes                                                 |
| ----------------- | ---------------------------------- | -------------------- | ---------- | ----------------------------------------------------- |
| fundamental-react | primary                            | `Default`            | ✅ covered | "With back button" row.                               |
| fundamental-react | noBackButton                       | `Default`            | ✅ covered | "Without back button" row.                            |
| fundamental-react | contextualMenu                     | `ContextualMenu`     | ✅ covered | The overflow button opens the page actions in a menu. |
| fundamental-react | noDescription                      | `Default`            | ✅ covered | "Without description" row.                            |
| fundamental-react | noActions                          | `Default`            | ✅ covered | "Without actions" row.                                |
| fundamental-react | dev                                | `Playground`         | ✅ covered | Title, description, back button, level and size args. |
| fundamental-react | noStyles                           | —                    | ➖ n/a     | No `cssNamespace`.                                    |
| Angular           | Back button, title and description | `Default`            | ✅ covered | Texts as fundamental-styles' (Save, Submit, Go back). |
| Angular           | Responsive paddings                | `Sizes`              | ✅ covered |                                                       |
| Angular           | Contextual menu                    | `ContextualMenu`     | ✅ covered | The menu is placed `bottom-end`, as in Angular.       |
| Angular           | Small screen                       | `Mobile`             | ✅ covered | Size `s`; the overflow button opens a mobile menu.    |
| Angular           | Open: contextual menu              | `OpenContextualMenu` | ✅ covered |                                                       |
| Angular           | Open: mobile actions               | `OpenMobile`         | ✅ covered | The actions in the mobile menu dialog.                |

### Tests vs. sources

| Source            | Behaviour                                              | React test                                                                          | Status     |
| ----------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------- |
| Angular           | Back button name, type, click and Enter                | back button has an accessible name and is clickable                                 | ✅ covered |
| Angular           | Back button before the title                           | back button comes first in the header, before the title                             | ✅ covered |
| Angular           | Title is an `<h2>`                                     | renders the title as a level 2 heading in the header 3 size                         | ✅ covered |
| Angular           | Title tall enough for descenders                       | the title is tall enough for its descenders                                         | ✅ covered |
| Angular           | Long title truncates on one line                       | a long title truncates on one line                                                  | ✅ covered |
| Angular           | Long title keeps the actions in the bar                | the long title never pushes the actions out of the bar                              | ✅ covered |
| Angular           | Description below the title                            | description is rendered below the title                                             | ✅ covered |
| Angular           | `withBackBtn` indent                                   | withBackBtn indents the description to the title next to the back button            | ✅ covered |
| Angular           | Actions at the end in LTR and RTL                      | actions area aligns to the end in LTR and RTL                                       | ✅ covered |
| Angular           | `size` paddings                                        | size sets the horizontal padding                                                    | ✅ covered |
| Angular           | `hidden` hides the actions                             | the hidden attribute hides the actions                                              | ✅ covered |
| Angular           | Back button and description hidden on small screens    | hides the back button and description on small screens                              | ✅ covered |
| Angular           | Overflow menu opens, focus back on Escape              | the overflow button in the actions opens its menu and gets the focus back on Escape | ✅ covered |
| fundamental-react | headingLevel / headingStyle                            | level and headerSize change the heading level and size                              | ✅ covered |
| fundamental-react | Prop spreading to the bar, back button, title, actions | passes className, native props and the ref to every part                            | ✅ covered |
| fundamental-react | Forwards the ref                                       | passes className, native props and the ref to every part                            | ✅ covered |
| —                 | `render` for another root element                      | render renders another root element                                                 | ✅ covered |

### Visual comparison

`pnpm visual action-bar`: 13 cases × 16 combinations, 204/208 matching. Cases: the bar, header, title and
description (with and without back button) against fundamental-styles' Default and No back button stories; the bar
without description; the long title; the bar at sizes `s`, `m_l` and `xl` against the Mobile and Responsive stories;
the back button, the actions and the overflow button by pixels. The bar, header, title and description are as wide
as their container, which differs between the two Storybooks, so their computed styles and heights are compared, not
pixels; the `s` bar ignores the height too (fundamental-styles' Mobile story has no description).

| Difference                                                        | Cause                                                                                       | Resolution                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Bar `box-shadow` with four extra transparent layers               | `shadow-sap-content-header-shadow` composes Tailwind's ring and inset shadow variables      | Fixed: `[box-shadow:var(--sapContent_HeaderShadow)]`. Not visible.            |
| Back button in RTL compact: 3.5% of pixels (2.2% cozy, within 3%) | Our `navigation-left-arrow` is mirrored in RTL (icon component); fundamental-styles' is not | Kept: Fiori mirrors navigation arrows in RTL, so the back arrow points right. |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default and Mobile (at a 480px viewport: back button and
description hidden) stories.
