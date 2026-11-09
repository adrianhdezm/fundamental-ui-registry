## message-toast

Sources: Angular [`registry/ui/message-toast`](../../../angular/registry/ui/message-toast/) (itself from
`@fundamental-ngx/core`'s `MessageToastService`) · no fundamental-react source · fundamental-styles
[Message Toast](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-message-toast--docs)
Registry: `registry/ui/message-toast/`, on Base UI's `Toast` (Provider, Portal, Viewport, Root, Positioner,
`useToastManager`).

API: a service, as Angular's, in the React form of the dialog service (`DialogProvider` / `useDialogService`):

```tsx
<MessageToastProvider defaultConfig={{ duration: 5000 }}>
  <App />
</MessageToastProvider>;

const toasts = useMessageToastService();
const ref = toasts.open('Order saved', { position: 'top-right' });
await ref.afterDismissed;
```

| Angular                                                                                                          | React                                                                                              |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `MessageToastService` (`providedIn: 'root'`)                                                                     | `<MessageToastProvider>` at the root of the app, `useMessageToastService()` below it               |
| `provideMessageToastConfig(config)`                                                                              | `<MessageToastProvider defaultConfig>`                                                             |
| `open(string)`                                                                                                   | `open('text')`; `ref.data` is the text, as Angular's                                               |
| `open(Component)` + `inject(MessageToastRef)`                                                                    | `open(<MyToast />)`; the element reads `useMessageToastRef()` (data in `ref.data`)                 |
| `open(TemplateRef)` with `let-toast`                                                                             | `open((ref) => …)`: a render function that gets the ref                                            |
| `MESSAGE_TOAST_DATA`                                                                                             | `useMessageToastRef().data`                                                                        |
| config `data`, `ariaLabel`, `id`, `duration` (3000, 0 = stays), `mousePersist` (true), `animated` (false), sizes | the same `MessageToastConfig`                                                                      |
| config `position`: placement / global / `ConnectedPosition & { boundTo }`                                        | placement / global (the same) / `{ boundTo, side, align, sideOffset, alignOffset }` (Base UI)      |
| `hideAll()`, `setNewPositionStrategy(position)`                                                                  | the same                                                                                           |
| `openCount()` signal, `hasOpenMessageToasts()`                                                                   | `openCount`, `hasOpenMessageToasts` and `toasts` (re-render the component that reads them)         |
| `MessageToastRef`: `data`, `dismiss()`, `dismissAfter(ms)`, `cancelDismiss()`                                    | the same, plus `id` and `isOpen`                                                                   |
| `afterOpened()`, `afterDismissed()`, `afterTimeout` (Observables)                                                | `afterOpened`, `afterDismissed` (Promises; `afterTimeout` was the same stream as `afterDismissed`) |
| `fd-message-toast`, `fd-message-toast-stack`, `fdMessageToastTemplate`                                           | internal: Base UI's toast root and our stack elements; a render function needs no directive        |
| —                                                                                                                | `<MessageToastProvider container>`: the element the toasts are rendered in (default `body`)        |

Behaviour from Base UI where it fits Angular's:

- **Open from code and stacking:** `open()` adds the toast to Base UI's toast store (`useToastManager`, captured
  during the provider's render, so `open()` also works in the first effect of a child). The viewport groups the
  toasts by position into stacks, oldest first: a column with a 1rem gap that grows away from the edge (bottom
  positions upwards), 1rem off the screen edges, aligned to start, centre or end as Angular's overlay panes. No
  limit (Base UI hides toasts beyond 3 by default; Angular shows all).
- **Duration:** Base UI's timer, started once the toast is shown (after the slide-in), as Angular's `afterNextRender`;
  `duration: 0` keeps it open. `dismissAfter(ms)` / `cancelDismiss()` restart or stop that timer.
- **Pause on hover:** Base UI's viewport pauses the timers while the pointer is over a toast (`mousePersist`, the
  default), and also while the toasts have the keyboard focus or the window is in the background. A toast hovered
  before its duration starts waits for the pointer to leave, as in Angular.
- **Bound toasts:** Base UI's toast positioner places the stack next to `boundTo`, flipping to the other side when
  there is no room.
- **Live region and ARIA:** each toast keeps Angular's ARIA: `role="alert"`, `aria-live="polite"`, `tabindex="-1"`,
  `id` and `aria-label` from the config. Base UI's viewport stays as the landmark (`role="region"`, "Notifications")
  that F6 focuses; its own `aria-live` is off so a toast is not announced twice.
- **Animation:** `animated` slides the toast in (1rem, 150ms, ease-out) and fades it out (75ms), through Base UI's
  `data-starting-style` / `data-ending-style`; the toast is removed (and `afterDismissed` resolves) after the fade.

**Differences from Angular, on purpose:**

- Hovering any toast pauses every toast of the provider (Base UI's viewport), and the timer resumes with the time that
  was left; Angular paused only the hovered toast and restarted its full duration on leave. Without `mousePersist`
  the toast's timer is the ref's own `setTimeout`, which ignores the pointer, as Angular's.
- F6 moves the focus to the toasts (then Tab to the first toast) and Escape closes the focused toast: Base UI's
  keyboard handling, which Angular did not have (its toasts were not reachable from the keyboard). Swipe to dismiss
  is off (`swipeDirection={[]}`): Angular's toasts close by time or from code.
- Bound positions use Base UI's `side` / `align` / `sideOffset` / `alignOffset` instead of the CDK's
  `originX/originY/overlayX/overlayY/offsetX/offsetY` (`{ boundTo, originY: 'top', overlayY: 'bottom', offsetY: -16 }`
  is `{ boundTo, side: 'top', sideOffset: 16 }`), and flip to the other side when there is no room (Angular: no push,
  no flip).
- Custom global positions with the same values share a stack; Angular keyed stacks by object identity, so every
  `open()` with a new `{ top, left }` object got a stack of its own.
- The animation respects `prefers-reduced-motion` (no slide or fade); Angular's Web Animations did not.
- The shadow is written `[box-shadow:var(--sapContent_Lite_Shadow)]` (`none` in Horizon and Horizon Dark, a glow and
  outline in the HC themes), as the repository's convention for shadows.
