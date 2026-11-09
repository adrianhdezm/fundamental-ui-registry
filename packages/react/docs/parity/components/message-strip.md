## message-strip

Sources: fundamental-react [MessageStrip](https://github.com/SAP/fundamental-react/tree/main/src/MessageStrip) ·
Angular [`registry/ui/message-strip`](../../../../angular/registry/ui/message-strip/) (`message-strip.ts`,
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

### Stories vs. sources

| Source            | Example                           | React story                 | Status     | Notes                                                                       |
| ----------------- | --------------------------------- | --------------------------- | ---------- | --------------------------------------------------------------------------- |
| fundamental-react | primary                           | `Types`                     | ✅ covered | The neutral "This is a message." strip.                                     |
| fundamental-react | dismissible                       | `Types`                     | ✅ covered | The dismissible normal strip.                                               |
| fundamental-react | noGlyph                           | `WithoutIcons`              | ✅ covered |                                                                             |
| fundamental-react | states                            | `Types`                     | ✅ covered |                                                                             |
| fundamental-react | statesWithCustomContentAndLinks   | `CustomContentAndLinks`     | ✅ covered | `link`/`linkText` as `Link` children, `localizedText` as `dismissBtnTitle`. |
| fundamental-react | dev                               | `Playground`                | ✅ covered |                                                                             |
| fundamental-react | noStyles                          | —                           | ➖ n/a     | No `cssNamespace`.                                                          |
| Angular           | Playground                        | `Playground`                | ✅ covered |                                                                             |
| Angular           | Types                             | `Types`                     | ✅ covered | fundamental-styles' texts.                                                  |
| Angular           | Without icons                     | `WithoutIcons`              | ✅ covered | fundamental-styles' texts.                                                  |
| Angular           | Widths                            | `Widths`                    | ✅ covered |                                                                             |
| Angular           | Indication colors and custom icon | `IndicationColors`          | ✅ covered | fundamental-styles' texts, icons and links (`cursor-arrow` for 8).          |
| Angular           | Auto dismiss                      | `AutoDismiss`               | ✅ covered | Controlled `open`.                                                          |
| Angular           | Alerts                            | `Alerts`                    | ✅ covered | The template alerts are function content.                                   |
| Angular           | Open: alerts                      | `OpenAlerts` (Open: alerts) | ✅ covered |                                                                             |

### Tests vs. sources

| Source            | Behaviour                                         | React test                                                                                     | Status     |
| ----------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Note labelled by type description and text        | is a note labelled by its hidden type description and its text                                 | ✅ covered |
| Angular           | Type colours, icons, descriptions                 | types use the semantic colours, their icon and type description                                | ✅ covered |
| Angular           | noIcon, custom icon                               | noIcon hides the icon; a custom icon replaces it                                               | ✅ covered |
| Angular           | Indication colours                                | indication colours change the background and text colour                                       | ✅ covered |
| Angular           | Dismiss button click                              | the dismiss button closes the strip and calls onDismiss                                        | ✅ covered |
| Angular           | Dismiss button keyboard, custom title             | the dismiss button works from the keyboard and takes a custom title                            | ✅ covered |
| Angular           | dismissible=false                                 | dismissible=false hides the dismiss button                                                     | ✅ covered |
| Angular           | open()                                            | actionsRef.open() shows a dismissed strip again                                                | ✅ covered |
| Angular           | dismiss()                                         | actionsRef.dismiss() calls onDismiss and hides the strip                                       | ✅ covered |
| Angular           | ariaLabel, marginBottom                           | aria-label sets the aria-label and marginBottom the bottom margin                              | ✅ covered |
| Angular           | dismissBtnTitle changes and fallback              | the dismiss button label follows dismissBtnTitle changes and falls back when it is empty       | ✅ covered |
| Angular           | Auto dismiss after the duration                   | starts hidden, opening shows it and it dismisses itself after the duration                     | ✅ covered |
| Angular           | mousePersist                                      | mousePersist pauses the timer while hovered and restarts it on leave                           | ✅ covered |
| Angular           | Hover without mousePersist                        | without mousePersist hovering does not keep it open                                            | ✅ covered |
| Angular           | Alerts in six positions, dismissAll               | opens alerts in the six positions                                                              | ✅ covered |
| Angular           | Newest first, role alert                          | newest alerts come first, and alerts are announced with role alert                             | ✅ covered |
| Angular           | Dismiss button and ref; afterDismissed, onDismiss | the dismiss button and the ref close an alert; afterDismissed and onDismiss fire               | ✅ covered |
| Angular           | Alerts dismiss themselves                         | alerts dismiss themselves after the duration                                                   | ✅ covered |
| Angular           | Template and component content                    | renders function and component content; components can read the ref                            | ✅ covered |
| Angular           | Narrow screens                                    | collapses all positions to the middle on narrow screens                                        | ✅ covered |
| fundamental-react | Prop spreading (root, button), onCloseClicked     | passes className, style, native props and the ref through; dismissButtonProps reach the button | ✅ covered |
| fundamental-react | Prop spreading to the link                        | — (a `Link` child takes its own props)                                                         | ➖ n/a     |
| —                 | Controlled and uncontrolled                       | open, defaultOpen and onOpenChange: controlled and uncontrolled                                | ✅ covered |
| —                 | Uncontrolled auto dismiss                         | uncontrolled: starts hidden and actionsRef.open() starts the timer                             | ✅ covered |
| —                 | No timer when not dismissible or negative         | does not dismiss when not dismissible or with a negative duration                              | ✅ covered |
| —                 | Links in the text                                 | links in the text are spaced, and take the contrast or subtle colour on indication colours     | ✅ covered |
| —                 | Strip props of alerts                             | passes strip props to the alerts                                                               | ✅ covered |
| —                 | Hook outside the provider                         | throws outside a provider                                                                      | ✅ covered |

### Visual comparison

`pnpm visual message-strip`: 32 cases × 16 combinations, 464/512 matching after the fixes below; the 48 others are
the three type icon cases, kept (last row). Cases, by pixels (texts, icons and links as fundamental-styles'): warning
and information strips with icon, the neutral strip, the warning, success and error icon boxes and the text; warning
and information dismissible without icon, success and error without icon or dismiss button; the close button at
rest, on hover and with focus; custom icon strips (neutral and error); indication colours 1, 1b, 3b, 4, 4b, 6, 9, 9b
and 10b; the close button of indication 4 and 4b on hover and of 4 with focus; a strip with an emphasized link, the
link, and the subtle links on indication 1 and 1b. The alerts are not in fundamental-styles; they were reviewed by
eye with the strips in Horizon cozy and compact, LTR and RTL.

| Difference                                                                                                                                                                                                                  | Cause                                                                                                                                                                                       | Resolution                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| The icon box has a 24px line height instead of `normal`                                                                                                                                                                     | `text-base` sets `line-height: 1.5rem` along with the size (Angular issue)                                                                                                                  | Fixed: `text-[1rem] leading-[normal]`.                                                                  |
| In HC, the focused close button of an indication colour strip keeps the button background and border                                                                                                                        | fundamental-styles clears them on focus unless hovered; Angular does not (Angular issue)                                                                                                    | Fixed: `focus:bg-transparent focus:border-transparent`, hover colours with `focus:enabled-hover:`.      |
| Links in the text sit right after the text, with no inline padding, in the link colour on indication colours                                                                                                                | Angular does not port fundamental-styles' `fd-message-strip--link` rules (Angular issue)                                                                                                    | Fixed: `[&_a]:ms-1 [&_a]:px-1`, and the contrast (1-10) or subtle (1b-10b) link colour and text shadow. |
| The type icons are filled (`alert`, `sys-enter-2`, `error`, `information`); fundamental-styles uses the outlined `message-warning`, `message-success`, `message-error` and `message-information` (8.8-9.1% of the icon box) | The Angular (fundamental-ngx) glyphs, the same as UI5 Web Components' message strip, the Fiori reference implementation (checked in `@ui5/webcomponents` 2.28.1, `MessageStripTemplate.js`) | Kept. Whole strips still match (0.1-0.2%).                                                              |
