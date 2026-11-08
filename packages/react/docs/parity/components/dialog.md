## dialog

Sources: fundamental-react [Dialog](https://github.com/SAP/fundamental-react/tree/main/src/Dialog) · Angular
[`registry/ui/dialog`](../../../../angular/registry/ui/dialog/) · fundamental-styles
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

### Stories vs. sources

| Source            | Example                                 | React story                     | Status     | Notes                                                                       |
| ----------------- | --------------------------------------- | ------------------------------- | ---------- | --------------------------------------------------------------------------- |
| fundamental-react | primary                                 | `Default`                       | ✅ covered |                                                                             |
| fundamental-react | header                                  | `Header`                        | ✅ covered | Header text before the title.                                               |
| fundamental-react | subheader                               | `Subheader`                     | ✅ covered |                                                                             |
| fundamental-react | sizes                                   | `Sizes`                         | ✅ covered | `size` s, m, l, xl.                                                         |
| fundamental-react | small, medium, large, xl                | `Variants`                      | ✅ covered | Open windows in the page (they were open dialogs without docs).             |
| fundamental-react | dev                                     | `Playground`                    | ✅ covered | Knobs are the Playground controls.                                          |
| fundamental-react | noStyles                                | —                               | ➖ n/a     | No `cssNamespace`.                                                          |
| Angular           | Template-based dialog                   | `TemplateBased`                 | ✅ covered | A render function.                                                          |
| Angular           | Component-based dialog                  | `ComponentBased`                | ✅ covered | An element with `useDialogRef()`; draggable, resizable, full screen, stack. |
| Angular           | Dialog from an object                   | `ObjectBased`                   | ✅ covered |                                                                             |
| Angular           | Configuration                           | `Configuration`                 | ✅ covered | Declarative dialogs.                                                        |
| Angular           | Custom header, subheader and footer     | `Complex`                       | ✅ covered | A list of checkboxes for the selection.                                     |
| Angular           | Position                                | `Position`                      | ✅ covered |                                                                             |
| Angular           | Mobile                                  | `Mobile`                        | ✅ covered | Plus `mobileOuterSpacing`.                                                  |
| Angular           | Closing, dismissing, hiding and loading | `States`                        | ✅ covered |                                                                             |
| Angular           | Backdrop and container                  | `Backdrop`                      | ✅ covered |                                                                             |
| Angular           | Form                                    | `Form`                          | ✅ covered | `FormGroup`, `FormItem` and `FormLabel` (required, colon), as Angular.      |
| Angular           | Inner popovers                          | `InnerPopovers`                 | ✅ covered | Two multi inputs; their lists open above the dialog.                        |
| Angular           | Playground                              | `Playground`                    | ✅ covered |                                                                             |
| Angular           | Open: template                          | `OpenTemplate`                  | ✅ covered |                                                                             |
| Angular           | Open: component                         | `OpenComponent`                 | ✅ covered |                                                                             |
| Angular           | Open: object                            | `OpenObject`                    | ✅ covered |                                                                             |
| Angular           | Open: custom header and footer          | `OpenComplex`                   | ✅ covered |                                                                             |
| Angular           | Open: loading                           | `OpenLoading`                   | ✅ covered |                                                                             |
| Angular           | Open: position                          | `OpenPosition`                  | ✅ covered |                                                                             |
| Angular           | Open: mobile                            | `OpenMobile`                    | ✅ covered |                                                                             |
| Angular           | Open: inner popover                     | `OpenInnerPopover`              | ✅ covered | The popover list is above the dialog.                                       |
| Angular           | Open: form                              | `OpenForm`                      | ✅ covered |                                                                             |
| Angular           | Open: playground                        | `OpenPlayground`                | ✅ covered |                                                                             |
| —                 | Open: default, subheader, resizable     | `OpenDefault`, `OpenSubheader`… | ➕ extra   | Also `OpenResizable` and `OpenBackdrop` (custom backdrop).                  |
| —                 | Window variants                         | `Variants`                      | ➕ extra   | Open windows in the page, the visual reference cases.                       |

### Tests vs. sources

| Source            | Behaviour                                                         | React test                                                                                        | Status     |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Labelled modal, takes the focus, gives it back                    | is a labelled modal that takes the focus and gives it back when closed                            | ✅ covered |
| Angular           | Escape dismisses unless escKeyCloseable is false                  | dismisses on Escape unless escKeyCloseable is false                                               | ✅ covered |
| Angular           | Focus stays inside                                                | keeps the focus inside the dialog                                                                 | ✅ covered |
| Angular           | Backdrop click only when backdropClickCloseable                   | dismisses on a backdrop click only when backdropClickCloseable                                    | ✅ covered |
| Angular           | One block layer for stacked dialogs                               | dims the page once for stacked dialogs; nested dialogs: … dimmed once                             | ✅ covered |
| Angular           | hide, loading and full screen through the ref                     | hides, shows a loader and toggles full screen through its ref                                     | ✅ covered |
| Angular           | Object dialog with footer buttons, approve focused, close button  | builds a dialog from an object with its footer buttons                                            | ✅ covered |
| Angular           | Component dialog with its DialogRef and data                      | opens a component and gives it its DialogRef and data                                             | ✅ covered |
| Angular           | Object dialog without buttons has no footer                       | builds an object dialog without buttons with no footer                                            | ✅ covered |
| Angular           | dismissAll closes all, removes the overlays and the scroll lock   | dismissAll closes every open dialog and removes them; locks the page scroll while a modal…        | ✅ covered |
| Angular           | close()/dismiss() status and result; closed stays closed          | close() sets the status closed and exposes the result; dismiss() the reason                       | ✅ covered |
| Angular           | Position                                                          | places the dialog at the configured position                                                      | ✅ covered |
| Angular           | Width, height, min/max                                            | applies width, height and min/max sizes                                                           | ✅ covered |
| Angular           | dialogPanelClass and backdropClass                                | applies dialogPanelClass to the window and backdropClass to the backdrop                          | ✅ covered |
| Angular           | Mobile and mobileOuterSpacing                                     | mobile mode fills the viewport, mobileOuterSpacing keeps a margin                                 | ✅ covered |
| Angular           | Drag by the header only when draggable                            | drags by the header only when draggable                                                           | ✅ covered |
| Angular           | Resize handle and "Resizable" description                         | resizes with the handle when resizable and announces it; resizes towards the left in RTL          | ✅ covered |
| Angular           | ariaLabel, ariaDescribedBy, role                                  | applies ariaLabel, ariaLabelledBy, ariaDescribedBy and id from the config                         | ✅ covered |
| Angular           | Dismissed on navigation unless closeOnNavigation is false         | dismisses on navigation unless closeOnNavigation is false                                         | ✅ covered |
| fundamental-react | Title; action click and Escape call onClose; other keys do not    | opens from its trigger, closes with an action…; closes on Escape (fundamental-react onClose)…     | ✅ covered |
| fundamental-react | Not shown when show is false                                      | renders nothing while closed (fundamental-react show=false)                                       | ✅ covered |
| fundamental-react | headingLevel                                                      | passes native props and the ref to the window, header, body, footer and title (an `<h3>`)         | ✅ covered |
| fundamental-react | Classes on the backdrop and on the dialog                         | adds classes to the backdrop and to the window                                                    | ✅ covered |
| fundamental-react | Prop spreading: dialog, content, header, title, body, footer      | passes native props and the ref to the window, header, body, footer and title                     | ✅ covered |
| —                 | Service: subheader and full-screen toggle, provider defaults, ... | builds an object dialog with a subheader…; applies the provider defaults…; dismisses its dialogs… | ➕ extra   |
| —                 | Without backdrop and focus trap; container; content density       | keeps the page usable without backdrop and focus trap; renders into a container…; forces a…       | ➕ extra   |
| —                 | Declarative parts                                                 | is controlled…; lays out the header…; toggles full screen…; a mobile window…; custom header…      | ➕ extra   |
| —                 | Paddings, loading, hidden, alertdialog, initialFocus, handle      | sets the body paddings…; shows a busy indicator…; hidden hides…; is an alert dialog…; …handle…    | ➕ extra   |
| —                 | Popover in a dialog; close button outside; header/footer render   | Escape in a popover inside the dialog leaves the dialog open; a close button outside…; renders…   | ➕ extra   |

### Visual comparison

`pnpm visual dialog`: 14 cases × 16 combinations, 224/224 matching. Cases, from the `Variants` story (open windows
rendered into the page, 39rem wide as fundamental-styles' static dialogs) against fundamental-styles' Sizes,
Resizable, Draggable and Default stories: the four windows with the padding sizes s, m, l and xl, the resizable window,
the header bar, the title, the body (s and xl), the footer bar, the decisive button and the resize handle by pixels;
the draggable header hovered (grab cursor) by pixels and style; the loader by computed style (margins, alignment).

| Difference                                              | Cause                                                                                                     | Resolution                                                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Title 592px wide instead of its text (96px)             | Angular puts the title in a full-width bar element                                                        | Fixed: one bar element per start item, with `min-w-0` so long titles still truncate.                |
| Grab cursor on the header of a draggable window at rest | Angular sets it whenever the device can hover; fundamental-styles only while the window is hovered        | Fixed: `hover:` variant, as fundamental-styles. Same cursor whenever the pointer is over it.        |
| Loading window 43px taller                              | fundamental-styles' Loading story uses old busy indicator classes, so its loader shows no dots (0px high) | Kept: compared the loader box with the Default story instead (same margins); large dots as Angular. |
| Window shadow without Tailwind's ring layers            | `shadow-sap-content-shadow3` (Angular) composes transparent ring and inset layers                         | Written as `[box-shadow:var(--sapContent_Shadow3)]`, as the brief asks. Not visible.                |

The high-contrast windows differ by 0.6% of pixels (anti-aliasing of the rounded corners), within the tolerance.

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Open: default, component (draggable, resizable, full-screen
button, RTL handle in the bottom left corner), object, custom header and footer, mobile and loading, and Window
variants.

Angular issues: the title sits in a full-width bar element (592px instead of its text, not visible); the draggable
header shows the grab cursor at rest, not only while the window is hovered; the dialog's `<header>`/`<footer>` are
banner/content info landmarks while a dialog without backdrop is open (not checked by Angular's stories, which open one
modal dialog at a time).
