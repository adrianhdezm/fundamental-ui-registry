## tabs

Sources: fundamental-react [Tabs](https://github.com/SAP/fundamental-react/tree/main/src/Tabs) (TabGroup, Tab,
TabContent) · Angular [`registry/ui/tabs`](../../../../angular/registry/ui/tabs/) · fundamental-styles
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

### Stories vs. sources

| Source            | Example                           | React story     | Status     | Notes                                                                                                                       |
| ----------------- | --------------------------------- | --------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| fundamental-react | primary                           | `Basic`         | ✅ covered | Tabs from titles (Angular's); Tab 4's `glyph` is the icon-only mode (`Icons`).                                              |
| fundamental-react | allButtons                        | `Icons`         | ✅ covered | All tabs with the cart glyph: icon-only mode, size s, with fundamental-styles' counts (12, 15, 1) for the pixel comparison. |
| fundamental-react | selectedIndex                     | `SelectedIndex` | ✅ covered | `defaultValue` with the second tab's id.                                                                                    |
| fundamental-react | disabled                          | `Disabled`      | ✅ covered | No tab selected, none in the tab order.                                                                                     |
| fundamental-react | sizes                             | `Sizes`         | ✅ covered | s, m, l, xl, xxl.                                                                                                           |
| fundamental-react | dev                               | `Playground`    | ✅ covered | `onTabClick` is `onValueChange` (the Actions panel).                                                                        |
| fundamental-react | noStyles                          | —               | ➖ n/a     | No `cssNamespace`.                                                                                                          |
| Angular           | Playground                        | `Playground`    | ✅ covered | The tab list props as controls on three tabs (Angular's per-tab title, glyph and count controls are fixed values).          |
| Angular           | Basic                             | `Basic`         | ✅ covered | `titleContent` for `fdTabTitleTemplate`.                                                                                    |
| Angular           | Modes                             | `Modes`         | ✅ covered |                                                                                                                             |
| Angular           | Overflow, collapsible and dynamic | `Behaviour`     | ✅ covered | `actionsRef.selectTab` for `list.selectTab`.                                                                                |
| Angular           | Stacked content                   | `Stacked`       | ✅ covered | The section titles are `Title` (`h4`, header size 5).                                                                       |
| Angular           | Default tab                       | `DefaultTab`    | ✅ covered |                                                                                                                             |
| Angular           | Form content                      | `FormContent`   | ✅ covered |                                                                                                                             |
| Angular           | Navigation                        | `Navigation`    | ✅ covered | `TabNav`, `TabItem`, `TabLink`, `TabTag`.                                                                                   |
| Angular           | Open: More menu                   | `OpenMore`      | ✅ covered |                                                                                                                             |

### Tests vs. sources

| Source            | Behaviour                                                           | React test                                                                                       | Status     |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Angular           | Links tabs and panels, selects the first tab                        | links tabs and panels and selects the first tab                                                  | ✅ covered |
| Angular           | Click selects, disabled tabs do not                                 | selects tabs by click and skips disabled ones                                                    | ✅ covered |
| Angular           | Arrow keys, one tab stop, disabled skipped, wrap, End + Enter       | moves between tabs with the arrow keys as one tab stop                                           | ✅ covered |
| Angular           | Home and End                                                        | Home moves to the first enabled tab, End to the last                                             | ✅ covered |
| Angular           | Collapsible tabs                                                    | collapses the selected tab when collapsible                                                      | ✅ covered |
| Angular           | "More" menu lists the hidden tabs; picking one shows and selects it | lists tabs that do not fit in a "More" menu                                                      | ✅ covered |
| Angular           | "More" menu by keyboard, Escape returns the focus                   | the More menu opens with the keyboard and returns the focus to the More button on Escape         | ✅ covered |
| Angular           | TabNav: active link, tab stop, arrow keys                           | TabNav › marks the active link and makes it the tab stop                                         | ✅ covered |
| Angular           | defaultTab, bound ids, follows the default until a tab is chosen    | TabList selection › selects the default tab first, and follows the default until a tab is chosen | ✅ covered |
| Angular           | selectTab() by id and panel id, emits                               | selectTab() selects a tab by id (or panel id) and reports the change                             | ✅ covered |
| Angular           | Adding and removing tabs keeps the selection                        | adding and removing tabs keeps the selected tab selected                                         | ✅ covered |
| Angular           | selectDefaultOnTabsChange                                           | selectDefaultOnTabsChange selects the default tab again when the tabs change                     | ✅ covered |
| Angular           | Compact density                                                     | compact density makes the tabs smaller                                                           | ✅ covered |
| Angular           | Stacked: every panel shown, the tab follows the scrolling           | TabList with stacked content › shows every panel and marks the tab of the panel in view          | ✅ covered |
| Angular           | Stacked: a click scrolls and focuses, focusFirstFocusableElement    | selecting a stacked tab scrolls to its panel and focuses its first focusable element             | ✅ covered |
| Angular           | TabNav: tab stop when links are added                               | TabNav › updates the tab stop when links are added and skips disabled links                      | ✅ covered |
| fundamental-react | Tab selection (`selectedIndex`, clicks)                             | selects tabs by click and skips disabled ones; value controls the selected tab                   | ✅ covered |
| fundamental-react | Tab `onClick`                                                       | selects tabs by click and skips disabled ones (`onValueChange`)                                  | ✅ covered |
| fundamental-react | TabContent `aria-expanded` shown and hidden                         | links tabs and panels and selects the first tab (panels hidden and shown; no `aria-expanded`)    | ✅ covered |
| fundamental-react | Prop spreading (TabGroup, Tab, links, content), ref                 | passes className, native props and the ref to the root, the panels and the tab links             | ✅ covered |
| —                 | RTL arrow keys                                                      | mirrors the arrow keys in RTL                                                                    | ✅ new     |
| —                 | collapseOverflow false                                              | without collapseOverflow, tabs that do not fit are hidden without a More button                  | ✅ new     |
| —                 | Visible and hidden counts                                           | reports the visible and hidden tab counts                                                        | ✅ new     |
| —                 | Titles, counts, states, title content per mode                      | renders titles, counts, states and title content by mode                                         | ✅ new     |
| —                 | ariaLabel, ariaLabelledBy                                           | names tabs with ariaLabel or ariaLabelledBy                                                      | ✅ new     |
| —                 | opened / closed                                                     | calls onOpenChange of a tab when its panel opens and closes                                      | ✅ new     |
| —                 | Controlled `value`                                                  | value controls the selected tab                                                                  | ✅ new     |
| —                 | TabNav parts: props, ref, mode, size                                | TabNav › passes className, native props and the ref to the nav and the parts                     | ✅ new     |

fundamental-react's panels had `aria-expanded`, which is not allowed on `tabpanel`; they are hidden instead (as Angular).

### Visual comparison

`pnpm visual tabs`: 28 cases × 16 combinations, 440/448 matching; the 8 differences are one kept difference (the first filter tab in RTL, below).

The tabs are compared with fundamental-styles' (deprecated) Tabs stories, whose `fd-tabs` classes the Angular
component ports: the bar (default and the s, l and xl paddings), an unselected and the selected tab and tag (also
hovered), a count, the semantic tags, the icon tabs (tab, selected, keyboard focus, icon, selected icon, count, a
semantic icon), the process tab, label and arrow, the filter header, its count and separator, a filter tab and its
label, and a `TabNav` link. Texts differ from fundamental-styles' ("Link 1" against "Link"), so the text tabs are
compared by computed style; the `Icons` story matches the icon-only story (size s, cart icons, counts 12, 15 and 1, the
second selected) and is also compared by pixels, which covers the selection bar and the focus frame
(pseudo-elements). Cozy and compact, LTR and RTL in Horizon were also checked by eye (Basic, Modes, Icons, Overflow,
Stacked, Navigation, and the open "More" menu).

| Difference                                                                                                                            | Cause                                                                                                                                                                                                 | Resolution                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First tab: start padding and margin (tabs 12px further apart than fundamental-styles' in default mode; the first icon tab 12px wider) | Angular's `:first-child` rules: in a tab list each item is the first child of its overflow wrapper, so every default-mode tab matched them, and only the default mode removed the first tab's padding | Fixed: the tab list marks the first visible item from the overflow layout's `first`; its tab has no start padding in every mode (and a 0.1875rem start margin without a mode). `TabItem` in a `TabNav` keeps `:first-child`. |
| Tag text `--sapContent_LabelColor` (rgb(85, 107, 130)) against `--sapTextColor`                                                       | Angular's tag colour                                                                                                                                                                                  | Fixed: `--sapTextColor`, as fundamental-styles' `fd-tabs__tag`.                                                                                                                                                              |
| Round icon: line height 16px against normal; radius 3.35544e+07px against 50%                                                         | The icon inherits the tab's `leading-4`; `rounded-full`                                                                                                                                               | Fixed: `leading-[normal]` and `rounded-[50%]` (computed styles only).                                                                                                                                                        |
| Count in a mode: line height                                                                                                          | Angular's `text-sap-font-small-size` comes after `leading-4`, and tailwind-merge drops the line height                                                                                                | Fixed: the line height after the size.                                                                                                                                                                                       |
| Process arrow 32px wide against 30px                                                                                                  | An `Icon` is a 1em box; fundamental-styles' glyph is a `::before` as wide as the glyph                                                                                                                | Fixed: the arrow is the glyph as `::before` content, mirrored in RTL (fundamental-styles rotates it).                                                                                                                        |
| Semantic warning and neutral tags: `--sapCriticalTextColor`, `--sapNeutralTextColor` against `--sapWarningColor`, `--sapNeutralColor` | fundamental-styles colours the text with the element colours, about 3:1 on the bar (WCAG asks 4.5:1 for text; axe's colour-contrast fails)                                                            | Kept (Angular's text colours): `color` ignored for those two cases. Error and the selected colours match.                                                                                                                    |
| Filter separator: end border against a right border in RTL                                                                            | fundamental-styles uses a physical right border                                                                                                                                                       | Kept (mirrored with the layout): a 1px line between two margins, drawn at the same place; the border sides are ignored for that case.                                                                                        |
| First filter tab in RTL: no start padding against 0.188rem (8 combinations)                                                           | fundamental-styles' RTL rule restores `padding-inline: 0.188rem` on the first filter tab, while LTR has 0                                                                                             | Kept: ours mirrors the LTR layout (Fiori mirrors RTL); 3px, not noticeable.                                                                                                                                                  |
| Bar of the Basic story: 2rem padding against none                                                                                     | fundamental-styles' story has no size modifier; ours has the default size m (Angular's)                                                                                                               | Kept: padding ignored for that case; the s, l and xl paddings match.                                                                                                                                                         |
| Disabled tab: 0.4 opacity                                                                                                             | fundamental-styles has no disabled tab style (the counter story's disabled item looks enabled)                                                                                                        | Kept (Angular's `--sapContent_DisabledOpacity`, the Fiori disabled look); not compared.                                                                                                                                      |
| "More" button: a text button with an arrow against fundamental-styles' icon-only transparent button                                   | Angular's design (`moreLabel`, default "More")                                                                                                                                                        | Kept; not compared.                                                                                                                                                                                                          |

Angular issues (the same classes in `packages/angular`): every tab of a tab list matches the `:first-child` rules
(each item is the first child of its overflow wrapper), so default-mode tabs lose their start padding and margin, while
in the other modes the first tab keeps its start padding; the tag text uses `--sapContent_LabelColor` instead of
`--sapTextColor`; counts in a mode lose `leading-4` to tailwind-merge; the round icon has a 16px line height and a
`rounded-full` radius (computed styles only).
