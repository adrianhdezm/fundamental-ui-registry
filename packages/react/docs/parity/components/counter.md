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

### Stories vs. sources

| Source             | Example                         | React story    | Status     | Notes                                                                                                               |
| ------------------ | ------------------------------- | -------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| fundamental-react  | primary                         | `Playground`   | ✅ covered |                                                                                                                     |
| fundamental-react  | Default Counter (defaults)      | `Standalone`   | ✅ covered |                                                                                                                     |
| fundamental-react  | Counter inline with a paragraph | `Inline`       | ✅ covered |                                                                                                                     |
| fundamental-react  | Default Counter (notification)  | `Notification` | ✅ covered | Counts 1, 20, 300 and 999+ as fundamental-styles' (fundamental-react: 5, 25, 101, 999+), so pixels can be compared. |
| fundamental-react  | noStyles                        | —              | ➖ n/a     | No `cssNamespace`.                                                                                                  |
| fundamental-styles | Standalone                      | `Standalone`   | ✅ covered |                                                                                                                     |
| fundamental-styles | Text                            | `Inline`       | ✅ covered |                                                                                                                     |
| fundamental-styles | Notification                    | `Notification` | ✅ covered |                                                                                                                     |
| fundamental-styles | Tabs                            | `Tabs`         | ✅ covered | A counter after the text of a tab (`titleContent` of a `Tab`), with fundamental-styles' texts and disabled tab.     |

### Tests vs. sources

| Source             | Behaviour                               | React test                                                                                     | Status     |
| ------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| fundamental-react  | Prop spreading                          | passes className, native props and the ref through; render swaps the element                   | ✅ covered |
| fundamental-react  | Forwards the ref (a `<span>`)           | passes className, native props and the ref through; render swaps the element                   | ✅ covered |
| fundamental-react  | `aria-label` from `localizedText`       | announces counterLabel before the count; an empty label adds no hidden text                    | ✅ covered |
| fundamental-react  | `notification` modifier class           | notification moves the counter up by half its height and towards the start by 40% of its width | ✅ covered |
| fundamental-styles | Badge size, radius, typography, colours | renders a badge in the SAP badge colours, 1rem high and fully rounded                          | ✅ covered |

### Visual comparison

`pnpm visual counter`: 15 cases × 16 combinations, 240/240 matching. Cases: the four standalone counters (5, 25, 101,
999+), the counter inline with text, for each of the four notification counters (1, 20, 300, 999+) the counter
itself and the whole transparent bell button around it, and the counter in a tab and that whole tab ("Link 25")
against fundamental-styles' Tabs example; all by pixels and computed style. Horizon cozy and compact, LTR and RTL,
were also reviewed by eye.

| Difference                                                                                    | Cause                                                                                                     | Resolution                                                                                                         |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| None in the component. One run flagged the inline counter (Horizon cozy LTR, 9.2% of pixels). | The screenshot was cropped one pixel wider on our side (the counter sits at a fractional x); same pixels. | Not reproducible: the counter matches in later runs and with one worker. No change.                                |
| "999+" reads "+999" in RTL                                                                    | Bidi reordering of the trailing "+" in a right-to-left line                                               | Kept: fundamental-styles renders the same (the RTL cases match), and it is how the "more than" count reads in RTL. |

The border colour is fundamental-styles' `--fdBadge_Border_Color` (transparent in Horizon, the group border in the
other themes), already in `extensions.css`.
