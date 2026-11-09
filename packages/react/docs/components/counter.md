## counter

Sources: fundamental-react [Counter](https://github.com/SAP/fundamental-react/tree/main/src/Counter) · Angular: none ·
fundamental-styles [Counter](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-counter--docs)
Registry: `registry/ui/counter/`, on Base UI's `useRender`.

API: fundamental-react's props in React 19 form: `notification` and `children` (the count), with `ref` as a regular
prop and native props passed through to the `<span>`; `render` renders another element. fundamental-react's
`localizedText.counterLabel` ("Unread count") is `counterLabel`. There is no Angular component: the classes come from
fundamental-styles' `fd-counter` and `fd-counter--notification`.

Deliberate difference: fundamental-react and fundamental-styles put the label in `aria-label` on the `<span>`. ARIA 1.2
prohibits `aria-label` on an element with no role (generic), and screen readers either ignore it or read it instead of
the number. The React counter renders `counterLabel` as hidden text before the count instead ("Unread count 5"); an
empty `counterLabel` leaves it out. In the notification story the bell buttons are named "Notifications, <count>
unread" rather than fundamental-styles' "Notifications", because axe's `label-content-name-mismatch` requires the
visible count in the name (speech input users say what they see).

### Visual differences from fundamental-styles, kept on purpose

| Difference                 | Cause                                                       | Resolution                                                                                                         |
| -------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| "999+" reads "+999" in RTL | Bidi reordering of the trailing "+" in a right-to-left line | Kept: fundamental-styles renders the same (the RTL cases match), and it is how the "more than" count reads in RTL. |
