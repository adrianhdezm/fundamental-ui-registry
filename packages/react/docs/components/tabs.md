## tabs

Sources: fundamental-react [Tabs](https://github.com/SAP/fundamental-react/tree/main/src/Tabs) (TabGroup, Tab,
TabContent) · Angular [`registry/ui/tabs`](../../../angular/registry/ui/tabs/) · fundamental-styles
[Tabs](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-deprecated-components-tabs--docs) (deprecated;
the `fd-tabs` classes the Angular component ports) and [Counter](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-counter--tabs)
(its Tabs example)
Registry: `registry/ui/tabs/`, on Base UI's Tabs (`Tabs.Root`, `Tabs.List`, `Tabs.Tab`), the registry's
`OverflowLayout` (tabs that do not fit), `Menu` (the "More" menu) and `useScrollSpy` (stacked content).

API, as Angular's components:

| Angular                                                                            | React                                                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `fd-tab-list`                                                                      | `TabList`: native props, `className` and `ref` on the root `<div>`                          |
| `mode`, `size`, `collapseOverflow`, `maxVisibleTabs`, `stackContent`               | the same props                                                                              |
| `maxContentHeight`, `collapsibleTabs`, `selectDefaultOnTabsChange`                 | the same props                                                                              |
| `focusFirstFocusableElement`, `ariaLabel`, `moreLabel`                             | the same props                                                                              |
| `defaultTab`                                                                       | `defaultValue` (a tab id); `value` (id or `null`) makes the selection controlled            |
| `(selectedTabChange)`, `(selectedTabIndexChange)`                                  | `onValueChange(id, index)`                                                                  |
| `(visibleItemsCount)`, `(hiddenItemsCount)`                                        | `onVisibleItemsCountChange`, `onHiddenItemsCountChange`                                     |
| `selectTab(id)`, `scrollElement()`                                                 | the same, on `actionsRef` (as overflow-layout's `triggerRecalculation`)                     |
| `fd-tab` (`TabPanel`): `id`, `title`, `count`, `glyph`, `header`, `disabled`       | `Tab`, the same props; it renders the panel (`<div role="tabpanel">`, native props there)   |
| `tabState`, `ariaLabel`, `ariaLabelledBy`                                          | the same props (they name the tab; a native `aria-label` names the panel)                   |
| `<ng-template fdTabTitleTemplate>`                                                 | `titleContent` (a node, e.g. a `TabTag`)                                                    |
| `(opened)`, `(closed)`                                                             | `onOpenChange(open)`                                                                        |
| `fd-tab-nav` (`mode`, `size`), `fdTabItem`, `fdTabLink` (`active`, `disabled`)     | `TabNav` (a `<nav role="tablist">`), `TabItem`, `TabLink` (an `<a role="tab">`)             |
| `fdTabTag`, `fdTabCount`, `fdTabIcon`, `fdTabLabel`, `fdTabProcess`, `fdTabHeader` | `TabTag`, `TabCount`, `TabIcon` (`icon`, `iconFont`), `TabLabel`, `TabProcess`, `TabHeader` |
| `fdTabCounterHeader`, `fdTabProcessIcon`, `fdTabSeparator`                         | `TabCounterHeader`, `TabProcessIcon`, `TabSeparator`                                        |

fundamental-react's `TabGroup` is `TabList`: `selectedIndex` is `defaultValue` (or `value`) with the tab's id,
`onTabClick(event, index)` is `onValueChange`, `size` keeps its values (its default `l` pads the bar as Angular's
default `m`). Its `Tab` (`title`, `glyph`, `id`) is `Tab`; `linkProps` goes to the tab element as there, and
`tabContentProps` are the `Tab`'s own props (it is the panel). A `Tab` with only a `glyph` showed an icon; that is the
`icon-only` mode now, with the title as hidden text.

Behaviour, as Angular: the bar is a `tablist` (the row of the overflow layout, named by `ariaLabel`) of `<a
role="tab">`s with `aria-selected`, `aria-controls` (`<id>-panel`) and the tab's name; every panel is in the DOM
(`role="tabpanel"`, `aria-labelledby`, `tabindex="0"` while shown) and renders its content only while it is selected.
The first enabled tab (or `defaultValue`) is selected and reported, and the selection follows the default until a tab
is chosen; removing the selected tab selects the default again, `selectDefaultOnTabsChange` does on every change of
the tabs. Tabs that do not fit, or beyond `maxVisibleTabs`, go into a "More" menu (Angular's text button with an
arrow, `Menu` placed bottom-end); a tab picked there stays in the bar, is selected and gets the focus. The selected
tab always stays in the bar. `collapsibleTabs`: a click on the selected tab collapses it. `stackContent`: every
enabled panel shows, the content is a labelled, focusable `region`, a click scrolls to the panel (smoothly, with the
spy paused 600ms) and focuses its first focusable element (`focusFirstFocusableElement`), and scrolling selects the
tab of the panel at the top (`useScrollSpy`).

Keyboard, from Base UI's `Tabs.List` (Angular's `moveFocus`): Left and Right move between the visible enabled tabs,
wrapping around, Home and End go to the first and last; they move the focus only (manual activation), Enter and Space
select. The tabs are one tab stop: the focused, the selected or the first enabled tab. `TabNav` keeps Angular's own
handling (the same keys and tab stop, from the computed direction).

**Differences from Angular, on purpose:**

- Disabled tabs are rendered as plain `<a role="tab" aria-disabled="true" tabindex="-1">`, not as Base UI tabs, so
  the arrow keys skip them as in Angular (Base UI's tabs keep disabled tabs focusable and navigable).
- The direction of the arrow keys comes from Base UI's `DirectionProvider` (as the registry's other Base UI
  components), not from the computed `direction`.
- The arrow keys only work from a tab: on the "More" button Base UI would move into the tabs; Angular ignores them.
- A disabled tab in the "More" menu is a disabled menu item; Angular lists it as an enabled item that does nothing.
- `onValueChange(null, -1)` when a tab collapses (Angular emits the collapsed tab, which is no longer selected).
- `value`/`defaultValue` instead of `defaultTab`; the selection by `value` is controlled (no fallback is applied).

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                                                            | Cause                                                                                                                                      | Resolution                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic warning and neutral tags: `--sapCriticalTextColor`, `--sapNeutralTextColor` against `--sapWarningColor`, `--sapNeutralColor` | fundamental-styles colours the text with the element colours, about 3:1 on the bar (WCAG asks 4.5:1 for text; axe's colour-contrast fails) | Kept (Angular's text colours): `color` ignored for those two cases. Error and the selected colours match.                             |
| Filter separator: end border against a right border in RTL                                                                            | fundamental-styles uses a physical right border                                                                                            | Kept (mirrored with the layout): a 1px line between two margins, drawn at the same place; the border sides are ignored for that case. |
| First filter tab in RTL: no start padding against 0.188rem (8 combinations)                                                           | fundamental-styles' RTL rule restores `padding-inline: 0.188rem` on the first filter tab, while LTR has 0                                  | Kept: ours mirrors the LTR layout (Fiori mirrors RTL); 3px, not noticeable.                                                           |
| Bar of the Basic story: 2rem padding against none                                                                                     | fundamental-styles' story has no size modifier; ours has the default size m (Angular's)                                                    | Kept: padding ignored for that case; the s, l and xl paddings match.                                                                  |
| Disabled tab: 0.4 opacity                                                                                                             | fundamental-styles has no disabled tab style (the counter story's disabled item looks enabled)                                             | Kept (Angular's `--sapContent_DisabledOpacity`, the Fiori disabled look); not compared.                                               |
| "More" button: a text button with an arrow against fundamental-styles' icon-only transparent button                                   | Angular's design (`moreLabel`, default "More")                                                                                             | Kept; not compared.                                                                                                                   |
