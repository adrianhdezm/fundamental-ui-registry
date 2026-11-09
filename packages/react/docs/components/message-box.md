## message-box

Sources: fundamental-react [MessageBox](https://github.com/SAP/fundamental-react/tree/main/src/MessageBox) · Angular
[`registry/ui/message-box`](../../../angular/registry/ui/message-box/) · fundamental-styles
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
