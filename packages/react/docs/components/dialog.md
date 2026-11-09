## dialog

Sources: fundamental-react [Dialog](https://github.com/SAP/fundamental-react/tree/main/src/Dialog) · Angular
[`registry/ui/dialog`](../../../angular/registry/ui/dialog/) · fundamental-styles
[Dialog](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-dialog--docs)
Registry: `registry/ui/dialog/`, on Base UI's `Dialog` (Root, Trigger, Portal, Backdrop, Viewport, Popup, Title,
Description, Close, createHandle), with the `bar`, `button`, `busy-indicator`, `icon` and `title` components.

API: composed parts for the declarative dialog, and a service for dialogs opened from code.

```tsx
<Dialog>
  <DialogTrigger render={<Button label="Open" />} />
  <DialogPopup width="25rem" draggable resizable>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogFullScreenButton />
      <DialogCloseButton />
      <DialogSubheader>…</DialogSubheader>
    </DialogHeader>
    <DialogBody>Content</DialogBody>
    <DialogFooter>
      <DialogClose render={<ButtonBar variant="emphasized" label="OK" />} />
    </DialogFooter>
  </DialogPopup>
</Dialog>
```

- `Dialog` (no element; Base UI Root) holds the state and the behaviour options: `open`/`defaultOpen`/`onOpenChange`
  (reason in `details`), `onOpenChangeComplete`, `handle` (`createDialogHandle`), `actionsRef`, and Angular's config
  flags `escKeyCloseable` (true), `backdropClickCloseable` (false), `focusTrapped` (true) and `hasBackdrop` (true); plus
  the `DialogRef` state as props: `fullScreen`/`defaultFullScreen`/`onFullScreenChange`, `loading` (boolean or
  `DialogLoadingConfig`) and `hidden`.
- `DialogPopup` (Portal + Backdrop + Viewport + Popup) is the window (`fd-dialog`'s inner window): native props,
  `className` (Angular's `dialogPanelClass`/`windowClass`), `ref`, `role` (`alertdialog` for alerts), `id`,
  `aria-label`/`aria-labelledby`/`aria-describedby`, `initialFocus`/`finalFocus` (Angular's `cdkFocusInitial`), and
  the layout config: `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `position`, `mobile`,
  `mobileOuterSpacing`, `draggable`, `resizable`, `responsivePadding`, `verticalPadding`, `horizontalPadding`,
  `disablePaddings`, `bodyMinHeight`, `contentDensity`, `backdropClassName` (Angular's `backdropClass`), `container`
  and `keepMounted`; and `size` (fundamental-react's padding sizes `s`/`m`/`l`/`xl`).
- `DialogHeader`, `DialogBody` (`disablePaddings`), `DialogFooter`, `DialogSubheader`, `DialogTitle` (Base UI Title
  rendered as an SAP `Title`, `<h2>` with the header 5 size; it labels the window), `DialogDescription` (describes it),
  `DialogCloseButton`, `DialogFullScreenButton`, `DialogTrigger` and `DialogClose`.
- The header lays out its children as Angular's projection does: `DialogTitle` and any other content at the start,
  `DialogFullScreenButton` and `DialogCloseButton` at the end, `DialogSubheader` in a subheader bar below (the header
  bar becomes `header-with-subheader`); `BarLeft`/`BarMiddle`/`BarRight` children make a custom header. The footer puts
  its children in a `BarRight` unless they are bar areas; its buttons are at least 4rem wide (decisive buttons).

Service (Angular's `DialogService`): `<DialogProvider defaultConfig>` (Angular's `provideDialogDefaultConfig`) renders
the dialogs opened with `useDialogService().open(content, config)`, where `content` is a render function
`(ref, config) => <DialogPopup>…</DialogPopup>` (Angular's template with `let-dialog`), an element such as
`<MyDialog />` that reads `useDialogRef()` (Angular's component with `inject(DialogRef)`), or a
`DialogDefaultContent` object (title, subheader, content, approve/cancel/close buttons, full-screen toggle). `config` is
Angular's `DialogConfig` (`data`, sizes, `position`, aria, backdrop, Escape, focus trap, `container`, mobile, paddings,
`closeOnNavigation`, `contentDensity`, `draggable`, `resizable`). The service has `dialogs`, `hasOpenDialogs`,
`openDialogCount` and `dismissAll(reason)`; unmounting the provider dismisses its dialogs (`service destroyed`). The
`DialogRef` has `data`, `status`, `closeResult`, `isOpen`, `isClosed`, `isLoaded`, `isHidden`, `isFullScreen`,
`isLoading`, `loadingState`, `close(result)`, `dismiss(reason)`, `hide()`, `loading()`, `toggleFullScreen()`,
`afterClosed` and `afterLoaded`. `DialogDismissReason` has Angular's `escape`, `backdrop`, `navigation change` and
`service destroyed`, plus `close button`.

fundamental-react: `show` is `open`, `onClose` is `onOpenChange(false)` (Escape and the actions), `actions` are the
children of `DialogFooter` (`DialogClose` closes, so the default "actions close the dialog" stays; a plain button is
`disableAutoClose`), `title` is a `DialogTitle` (`headingLevel` its `level`, `headingStyle` its `headerSize`,
`titleProps` its props), `header` is other content in `DialogHeader`, `subheader` a `DialogSubheader`, `size` is
`DialogPopup`'s `size`, `backdropClassName` is `backdropClassName`, `className` and `contentProps` go to
`DialogPopup`, `headerProps`/`bodyProps`/`footerProps` to the parts, and `focusElementOnClose` is `finalFocus`.
`allowListForLockFocus` (react-focus-lock) is not needed: elements in portals that belong to the dialog, such as
popovers, are part of its focus trap.

**Differences, on purpose:**

- Behaviour from Base UI: the focus trap, initial focus (the first tabbable element, or `initialFocus`), focus return
  (to the trigger or the element focused before), Escape and outside press, nested dialogs (Escape closes the inner
  one), scroll lock and an inert page for modal dialogs. `focusTrapped` maps to Base UI's `modal` (`true` with a
  backdrop, `'trap-focus'` without, `false` when not trapped or hidden); without a focus trap the window itself takes
  the focus, as Angular. A hidden dialog lets the page be used. Base UI's focus guards are out of the a11y run for
  every story, as for popover.
- The page scroll is locked by Base UI only for modal dialogs with a backdrop (Angular set `overflow: hidden` on
  `<html>` for every open dialog).
- `afterClosed` is a promise that resolves with `{ status: 'closed', value }` or `{ status: 'dismissed', reason }`
  (Angular's observable emitted the value and errored with the reason; a rejected promise nobody awaits would be
  reported as an unhandled rejection). `afterLoaded` is a promise; the ref's signals are getters, and components that
  read a ref with `useDialogRef()` re-render when it changes.
- `DialogCloseButton` closes the dialog itself (Base UI `Close`, after its own `onClick`); Angular's close button only
  showed the icon and the dialog closed in its click handler. Opened by the service, it dismisses with
  `close button` unless the handler closed or dismissed the ref first. `DialogFullScreenButton` toggles the window
  itself (after its `onClick`, unless it calls `preventDefault()`), so `fullScreenButtonCallback` is a notification.
  Both buttons take the window's `mobile` for their density unless given.
- `DialogHeader` and `DialogFooter` render `<div>`s: a `<header>`/`<footer>` is a banner/content info landmark of the
  page while the dialog is not modal (axe found duplicate landmarks with two static windows); `render={<header />}`
  gives the element. The header bar keeps Angular's `role="group"`.
- The title is `<h2>` by default (fundamental-styles and Base UI); Angular's object dialog used
  `<div role="heading" aria-level="1">`. Each start item of the header is its own bar element, as fundamental-styles
  (Angular put them in one full-width element), so the title is as wide as its text and still truncates.
- `closeOnNavigation` listens to `popstate` and `hashchange` (there is no Angular `Location`); it is a service option,
  as in Angular. A declarative dialog closes with the router that unmounts its page.
- The text direction of a portal comes from Base UI's `DirectionProvider` (or `dir` on `<html>`): the viewport gets
  `dir="rtl"` inside an RTL provider, as Angular took it from `Directionality`.
- The backdrop is Base UI's `Backdrop` with the dimming in its `before:` layer (as Angular's host), so Angular's
  `backdropClass` strings such as `before:bg-sap-information-background before:opacity-90` work unchanged. Only the
  oldest open dialog renders it, for service and nested dialogs alike. Window and backdrop fade in (150ms) and out
  (75ms) with Base UI's starting and ending styles instead of the Web Animations API.

### Visual differences from fundamental-styles, kept on purpose

| Difference                 | Cause                                                                                                     | Resolution                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Loading window 43px taller | fundamental-styles' Loading story uses old busy indicator classes, so its loader shows no dots (0px high) | Kept: compared the loader box with the Default story instead (same margins); large dots as Angular. |
