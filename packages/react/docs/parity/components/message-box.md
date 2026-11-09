## message-box

Sources: fundamental-react [MessageBox](https://github.com/SAP/fundamental-react/tree/main/src/MessageBox) · Angular
[`registry/ui/message-box`](../../../../angular/registry/ui/message-box/) · fundamental-styles
[Message Box](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-message-box--docs)
Registry: `registry/ui/message-box/`, built on the `dialog` component (its window, parts and service, on Base UI's
`Dialog`), with the `bar`, `icon` and `title` components.

API: a window and parts for the declarative message box inside a `Dialog`, and a service for message boxes opened from
code.

```tsx
<Dialog>
  <DialogTrigger render={<Button label="Delete" />} />
  <MessageBox type="confirmation" showSemanticIcon>
    <MessageBoxHeader>
      <MessageBoxTitle>Delete order?</MessageBoxTitle>
    </MessageBoxHeader>
    <MessageBoxBody>The order will be deleted permanently.</MessageBoxBody>
    <MessageBoxFooter>
      <DialogClose render={<ButtonBar variant="emphasized" label="Delete" />} />
      <DialogClose render={<ButtonBar label="Cancel" />} />
    </MessageBoxFooter>
  </MessageBox>
</Dialog>
```

- `MessageBox` (Angular's `fd-message-box`) is a `DialogPopup` with `role="alertdialog"`: it takes every `DialogPopup`
  prop (`width`, `height`, `position`, `mobile`, `mobileOuterSpacing`, `size`, `responsivePadding`, `backdropClassName`,
  `initialFocus`, `container`, native props, `className`, `ref`, ...) plus Angular's config options `type`
  (`error`, `success`, `warning`, `information`, `confirmation`), `showSemanticIcon` and `customSemanticIcon`. Opened by
  the service, these default to the config. The `Dialog` around it holds the state and the behaviour options
  (`open`, `onOpenChange`, `escKeyCloseable`, `backdropClickCloseable`, `focusTrapped`, `hasBackdrop`, ...).
- `MessageBoxHeader` is a header bar (`role="group"`) with the semantic icon and the title in one bar element at its
  start, and the header line (`--sapContent_<Type>_HeaderShadow`) in the colour of the type; `BarLeft`/`BarMiddle`/
  `BarRight` children make a custom header. The title size inside is 5.
- `MessageBoxTitle` is the dialog title (an `<h2>` SAP title that labels the window); `MessageBoxSemanticIcon` is the
  decorative type icon (`error`, `sys-enter-2`, `alert`, `information`, `sys-help-2`) in the type colour, with
  `glyph` (and `font`) to replace it. `MessageBoxBody` is a `DialogBody` and `MessageBoxFooter` a `DialogFooter`
  (buttons at the end, at least 4rem wide; bar areas for a custom footer).

Service (Angular's `MessageBoxService`): `useMessageBoxService().open(content, config)` opens a message box in the
nearest `DialogProvider` (the dialog service, as Angular's service uses `DialogService`) and returns its
`MessageBoxRef` (a `DialogRef`). `content` is a render function `(ref, config) => <MessageBox>…</MessageBox>` (Angular's
template with `let-messageBox`), an element that reads `useMessageBoxRef()` (Angular's component with
`inject(MessageBoxRef)`), or a `MessageBoxContent` object (`title`, `titleId`, `titleHeadingLevel`, `content`,
`contentId`, approve and cancel buttons with ids, aria labels and callbacks). `config` is the `DialogConfig` plus
`type`, `showSemanticIcon` and `customSemanticIcon`; `responsivePadding` is on by default.
`<MessageBoxProvider defaultConfig>` is Angular's `MESSAGE_BOX_DEFAULT_CONFIG`. The service has `dismissAll(reason)`,
`dialogs`, `hasOpenDialogs` and `openDialogCount` (Angular's `dialogsOpen`). The object message box focuses its
approve button (Angular's `cdkFocusInitial`), unless `focusTrapped` is false, and is described by its body unless the
config sets `ariaDescribedBy`.

fundamental-react: `show` is the `Dialog`'s `open`, `onClose` its `onOpenChange(false)` (Escape and the actions),
`actions` are `DialogClose` buttons in `MessageBoxFooter` (so they still close it), `title` is a `MessageBoxTitle`,
`type` is `type` (with `showSemanticIcon` for the icon; fundamental-react always showed one, with the old
`message-*` glyphs; `default` is no type), `size` is `size`, `backdropClassName` is `backdropClassName`, `className`
and `contentProps` go to `MessageBox`, and `headerProps`/`bodyProps`/`footerProps` to the parts.

**Differences, on purpose:**

- Behaviour is the dialog's (Base UI): focus trap, initial focus, focus return, Escape, backdrop click, scroll lock,
  stacking, fade in and out; see the dialog report. `afterClosed` is a promise of `{ status, value | reason }`.
- The semantic icon is the `Icon` itself with its `color` variant per type (`neutral`, `negative`, `positive`,
  `critical`, `information`, `default` without a type), as fundamental-styles' single `<i>`; Angular wrapped it in a
  span and coloured it through a `--mb-ic` variable set on the window. Its font prop is the `Icon`'s `font` (Angular's
  `glyphFont`).
- Header and footer render `<div>`s (as the dialog's, so no page landmarks while a message box without backdrop is
  open); `render={<header />}` gives the element. The title is `<h2>` by default; Angular's object message box used
  `<div role="heading" aria-level="2">`.
- `MessageBoxBody` is the dialog body, so it also follows `horizontalPadding`/`disablePaddings` and shows the
  dialog's loader; Angular's message box body always had horizontal padding.
- The object message box's cancel button is a transparent bar button (`ButtonBar`), as Angular's.
- The window keeps `MessageBox`'s `data-message-box-type`, used by tests.

### Stories vs. sources

| Source            | Example                             | React story                                | Status     | Notes                                                   |
| ----------------- | ----------------------------------- | ------------------------------------------ | ---------- | ------------------------------------------------------- |
| fundamental-react | primary                             | `Default`                                  | ✅ covered |                                                         |
| fundamental-react | types                               | `Types`                                    | ✅ covered | Declarative, with semantic icons and semantic triggers. |
| fundamental-react | sizes                               | `Sizes`                                    | ✅ covered | `size` s, m, l, xl.                                     |
| Angular           | Template-based                      | `TemplateBased`                            | ✅ covered | A render function.                                      |
| Angular           | Component, object and custom layout | `Others`                                   | ✅ covered |                                                         |
| Angular           | Semantic types                      | `Types`, `ServiceTypes`                    | ✅ covered | Declarative and from code.                              |
| Angular           | Custom position                     | `Position`                                 | ✅ covered |                                                         |
| Angular           | Mobile                              | `Mobile`                                   | ✅ covered |                                                         |
| Angular           | Open: confirmation … information    | `OpenConfirmation` … `OpenInformation`     | ✅ covered | Five stories, one per type.                             |
| Angular           | Open: object                        | `OpenObject`                               | ✅ covered |                                                         |
| Angular           | Open: component                     | `OpenComponent`                            | ✅ covered |                                                         |
| Angular           | Open: custom header and footer      | `OpenComplex`                              | ✅ covered |                                                         |
| Angular           | Open: position                      | `OpenPosition`                             | ✅ covered |                                                         |
| Angular           | Open: mobile                        | `OpenMobile`                               | ✅ covered |                                                         |
| —                 | Playground                          | `Playground`, `OpenPlayground`             | ➕ extra   | Type, icon, width, mobile, Escape and backdrop options. |
| —                 | Open: default, extra large, render  | `OpenDefault`, `OpenSizes`, `OpenTemplate` | ➕ extra   | The a11y run checks them open.                          |
| —                 | Message box variants                | `Variants`                                 | ➕ extra   | Open boxes in the page: the visual reference cases.     |

### Tests vs. sources

| Source            | Behaviour                                                                          | React test                                                                                                                                                                          | Status     |
| ----------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Alert dialog named by its title, described by its body; approve focused and closes | opens an alert dialog named by its title and described by its body                                                                                                                  | ✅ covered |
| Angular           | Dismisses on Escape                                                                | dismisses on Escape                                                                                                                                                                 | ✅ covered |
| Angular           | No semantic icon unless asked                                                      | shows no semantic icon unless asked                                                                                                                                                 | ✅ covered |
| Angular           | Template and component with their data and ref                                     | opens from a render function and a component with their data and ref                                                                                                                | ✅ covered |
| Angular           | Cancel callback dismisses with its reason                                          | the cancel callback dismisses with its reason                                                                                                                                       | ✅ covered |
| Angular           | focusTrapped false: no approve focus, no trap                                      | focusTrapped false neither focuses the approve button nor traps the focus                                                                                                           | ✅ covered |
| Angular           | Glyph per type, custom icon                                                        | each type shows its semantic glyph, a custom icon replaces it                                                                                                                       | ✅ covered |
| Angular           | Projected semantic icon replaces the type icon                                     | a semantic icon in the header replaces the type icon                                                                                                                                | ✅ covered |
| Angular           | Footer bar areas                                                                   | the footer renders custom content in its bar areas                                                                                                                                  | ✅ covered |
| Angular           | Backdrop click only when backdropClickCloseable                                    | dismisses on a backdrop click only when backdropClickCloseable                                                                                                                      | ✅ covered |
| Angular           | Position, width and height                                                         | applies position, width and height                                                                                                                                                  | ✅ covered |
| Angular           | dialogPanelClass and ariaLabel                                                     | applies dialogPanelClass, ariaLabel and ariaDescribedBy                                                                                                                             | ✅ covered |
| Angular           | Mobile and mobileOuterSpacing                                                      | mobile mode fills the viewport, mobileOuterSpacing keeps a margin                                                                                                                   | ✅ covered |
| Angular           | Dismissed on navigation unless closeOnNavigation is false                          | dismisses on navigation unless closeOnNavigation is false                                                                                                                           | ✅ covered |
| Angular           | dismissAll closes all and removes the overlays                                     | dismissAll closes every open box and removes them                                                                                                                                   | ✅ covered |
| fundamental-react | Title; action click and Escape call onClose; Enter does not                        | opens from its trigger as an alert dialog, closes with its action…; closes on Escape…                                                                                               | ✅ covered |
| fundamental-react | Not shown when show is false                                                       | renders nothing while closed (fundamental-react show=false)                                                                                                                         | ✅ covered |
| fundamental-react | Prop spreading: main, content, header, body, footer                                | passes native props and the ref to the window, header, title, body and footer                                                                                                       | ✅ covered |
| —                 | Header line and icon colours, defaults, object ids, provider                       | colours the header line and the icon by type; has responsive paddings by default…; gives the object buttons…; builds an object message box without buttons…; needs a DialogProvider | ➕ extra   |
| —                 | Declarative parts                                                                  | shows the semantic icon…only with showSemanticIcon; a custom header keeps its bar areas; takes the size paddings…; adds classes…; renders the header as another element…            | ➕ extra   |

### Visual comparison

`pnpm visual message-box`: 26 cases × 16 combinations, 416/416 matching. Cases, from the `Variants` story (open
message boxes rendered into the page, 39rem wide as fundamental-styles' static ones, with their texts) against
fundamental-styles' Semantic types and Responsive stories: the five type windows, their header bars (the coloured
header line), their semantic icons (with the end margin), the title, the body, the footer bar, the emphasized and the
transparent decisive buttons, the four windows with the padding sizes s, m, l and xl, the xl body, and the "Show more"
block (margin) by pixels and computed style.

| Difference                                            | Cause                                                                                                        | Resolution                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Semantic icon element in 72-Bold instead of 72        | The icon inherits the header font of the bar element; fundamental-styles' `<i>` has the body font            | Fixed: `font-sap-font-family` on the icon. Not visible (the glyph is in the icon font).   |
| Footer bar with rounded bottom corners (12px, HC 4px) | `MessageBoxFooter` is the dialog footer, whose bar is rounded; fundamental-styles' message box footer is not | Fixed: square bar corners in the message box footer. Not visible (the window clips them). |

fundamental-styles has no "Show more" element in the components; the Variants story uses a block with a 1rem top margin
(`fd-message-box__more`), which matches.

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Message box variants, Open: object, Open: custom header and
footer, Open: mobile.

Angular issues: the semantic icon sits in the same header bar element and sets no font family, so it takes the 72-Bold
header font (computed styles only, not visible; from the shared structure, not run in Angular); the message box header
and footer are `<header>`/`<footer>` landmarks, as the dialog's.
