## message-strip

Sources: fundamental-react [MessageStrip](https://github.com/SAP/fundamental-react/tree/main/src/MessageStrip) ·
Angular [`registry/ui/message-strip`](../../../angular/registry/ui/message-strip/) (`message-strip.ts`,
`message-strip-alert.ts`) · fundamental-styles
[Message Strip](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-message-strip--docs)
Registry: `registry/ui/message-strip/` (`message-strip.tsx`, `message-strip-alert.tsx`), with `Button` for the dismiss
button and `Icon` for the type icon.

API: the Angular inputs as props (`type`, `indicationColor`, `dismissible` (default true), `noIcon`,
`dismissBtnTitle`, `width`, `minWidth`, `marginBottom`, `id`); Angular's `ariaLabel` and `ariaLabelledBy` are the
native `aria-label` and `aria-labelledby`, and the `*fdMessageStripIcon` template is the `icon` prop
(`icon={<Icon glyph="survey" />}`). `onDismiss` is called by the dismiss button, the timer and
`actionsRef.dismiss()`. Angular's `visible` signal with `open()`/`dismiss()` is `open`/`defaultOpen`/`onOpenChange`,
plus `actionsRef` (`open()`, `dismiss()`, as Base UI's `actionsRef`). Angular's `AutoDismissMessageStrip` directive
is the `autoDismiss`, `duration` (default 10000) and `mousePersist` props: such a strip starts hidden (unless
`defaultOpen` or `open`), and the timer starts whenever it opens. The strip is a `role="note"` labelled by a hidden
type description ("Warning Message Strip Closable") and its text; the dismiss button is a compact transparent
`Button` with `aria-controls` the strip and the "… Close" label and title.

fundamental-react's `onCloseClicked` is `onDismiss`, `localizedText.close` is `dismissBtnTitle`, `noGlyph` is
`noIcon`, `buttonProps` is `dismissButtonProps`; `link`, `linkText` and `linkProps` are a `Link` child (links in the
text get fundamental-styles' spacing and, on indication colours, its link colours).

Alerts (Angular's `MessageStripAlertService`): `MessageStripAlertProvider` wraps the app, `useMessageStripAlerts()`
returns `open(config)`, `dismissAll()` and `openAlerts` (newest first). `open` takes `position` (six positions,
default `top-middle`; below 600px always the middle), `content` and `messageStrip` (the strip props plus `duration`,
default 10000, 0 keeps it open). It returns a `MessageStripAlertRef` with `dismiss()`, `dismissed` and an
`afterDismissed` promise. Each alert is a `role="alert"` wrapper around the strip, in a fixed layer per position
(portal to `<body>`, `dir` from Base UI's `DirectionProvider`), with Angular's container classes: gap, padding,
scrolling at half the screen height when both edges have alerts, newest next to the edge.

**Differences on purpose:**

- Angular's content is text, a `TemplateRef` (context: the ref) or a component class (that injects the ref). Here it
  is any `ReactNode` (components in it read the ref with `useMessageStripAlertRef()`) or a function of the ref.
- `afterDismissed` is a promise instead of an Observable.
- Alerts are not Base UI's Toast: Toast has its own semantics (a live region of dialogs that always pauses on hover
  and focus), while the Angular alerts are message strips announced with `role="alert"` and pause on hover only with
  `mousePersist`. Toast is for message-toast.
- fundamental-react unmounted a dismissed strip and had `role="alert"`; here, as in Angular, the strip is hidden
  (`display: none`) and is a `note`.
- Links in the text get fundamental-styles' `fd-message-strip--link` styles (0.25rem start margin and inline padding;
  contrast or subtle colours on indication colours). Angular has none; the link focus background on indication
  colours is not ported.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                                                                                                                                                  | Cause                                                                                                                                                                                       | Resolution                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| The type icons are filled (`alert`, `sys-enter-2`, `error`, `information`); fundamental-styles uses the outlined `message-warning`, `message-success`, `message-error` and `message-information` (8.8-9.1% of the icon box) | The Angular (fundamental-ngx) glyphs, the same as UI5 Web Components' message strip, the Fiori reference implementation (checked in `@ui5/webcomponents` 2.28.1, `MessageStripTemplate.js`) | Kept. Whole strips still match (0.1-0.2%). |
