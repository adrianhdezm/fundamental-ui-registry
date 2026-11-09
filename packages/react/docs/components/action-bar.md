## action-bar

Sources: fundamental-react [ActionBar](https://github.com/SAP/fundamental-react/tree/main/src/ActionBar) · Angular
[`registry/ui/action-bar`](../../../angular/registry/ui/action-bar/) · fundamental-styles
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                        | Cause                                                                                       | Resolution                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Back button in RTL compact: 3.5% of pixels (2.2% cozy, within 3%) | Our `navigation-left-arrow` is mirrored in RTL (icon component); fundamental-styles' is not | Kept: Fiori mirrors navigation arrows in RTL, so the back arrow points right. |
