## token

Sources: fundamental-react [Token](https://github.com/SAP/fundamental-react/tree/main/src/Token) · Angular
[`registry/ui/token`](../../../../angular/registry/ui/token/) (`Token`, `Tokenizer`, `TokenizerInput`) ·
fundamental-styles [Token](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-token--docs) and
[Tokenizer](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-tokenizer--docs)
Registry: `registry/ui/token/token.tsx`: `Token`, `Tokenizer` and `TokenizerInput`; the overflow list on the ported
`Popover`, the remove and addon buttons on `Button`, the input on Base UI's `Input`.

API:

```tsx
<Tokenizer input={<TokenizerInput aria-label="Values" />} glyph="value-help" glyphAriaLabel="Value help">
  {values.map((value) => (
    <Token key={value} onCloseClick={() => remove(value)}>
      {value}
    </Token>
  ))}
</Tokenizer>
```

- `Token`: the Angular inputs `disabled`, `readOnly` and `selected` (a model: `selected`/`defaultSelected`/
  `onSelectedChange`), `ariaRoleDescription` as the native `aria-roledescription` (default `token`), and the outputs
  `onCloseClick` (with the click event, or without one when Backspace/Delete removes the token), `onRemove`,
  `onTokenClick`, `onTokenKeyDown` and `onFocusChange` (Angular's `elementFocused`). Native props, `className` and
  `ref` go to the `option` element. Angular's `focus()`, `text()` and `wrapper()` are the element itself (`ref`).
- `Tokenizer`: every Angular input (`disableKeyboardDeletion`, `tokenizerFocusable`, `glyph`, `glyphFont`,
  `glyphAriaLabel`, `glyphTitle`, `glyphHasPopup`, `glyphExpanded`, `buttonFocusable`, `disabled`, `moreTerm`,
  `showOverflowPopover`, `externalHiddenCount`, `open`, `state`, `readOnly` for `readonly`, `tokenizerLabel`,
  `removeLabel`, `tokensCountText`), `onMoreClick` for `moreClickedEvent`, `onAddOnButtonClick` for
  `addOnButtonClicked`, and `actionsRef` for the public `removeSelectedTokens()` and `focusTokenElement(index)`
  (what multi-input and multi-combobox call). Native props, `className` and `ref` go to the root.
- `TokenizerInput`: Angular's `fdTokenizerInput` directive as a component (Base UI `Input`, `onValueChange`).
- fundamental-react: `children`, `className`, `readOnly`, `ref` and prop spreading as above; `onClick` (its close
  button callback) is `onCloseClick`; `compact` is `data-density="compact"` on the token or an ancestor.

**Differences on purpose:**

- Slots instead of content projection: the tokens are `children` (rendered in the `listbox`), the input is the `input`
  prop and Angular's `[fd-tokenizer-extra]` content is `extra`. A listbox may only own options, so the input cannot be
  among the children.
- The tokenizer finds its tokens through a context they register with, in DOM order, instead of `contentChildren`;
  tokens in wrapper components work too. It sets the selection through each token's `onSelectedChange` (a controlled
  token changes only if its owner passes the new value back), and hides collapsed tokens with `display: none` on the
  token element as Angular does.
- `onFocusChange` instead of `elementFocused` (as checkbox's `focusChange`); `closeClickHandler()` is not public: the
  close icon and the overflow popover's remove buttons are the only click sources, so Angular's test of a call without
  an event has nothing to call.
- The arrow keys follow the computed `direction` of the tokenizer (a `dir` attribute anywhere above it) instead of the
  CDK `Directionality`.
- The token count is announced through a polite live region inside the tokenizer instead of the CDK `LiveAnnouncer`.
- The overflow link is the `PopoverTrigger` itself (`nativeButton={false}`: `role="button"`, tab stop, Enter and
  Space, plus `aria-haspopup`/`aria-expanded`); the popover body is marked `data-tokenizer-popover` so focus moving into
  it does not expand the tokens (the role of Angular's `.cdk-overlay-container` check). React events from the portal
  bubble to the tokenizer, so the focus handlers only count targets inside its DOM.
- After Backspace on a token, the previous token is focused in the next frame (Angular's `afterNextRender`), once the
  owner has removed the token.
- Not ported: Angular's `compactCollapse` (a no-op kept there for compatibility), fundamental-react's `buttonLabel`
  (the close icon is `aria-hidden` in Angular and here; removal is announced through the keyboard and the overflow
  popover's named buttons) and `cssNamespace`.
- Visual fixes over Angular (see the table below): the input fills the field height, the field has `cursor: text`, the
  field text colour, no field shadow on hover, the read-only field background, and no thicker bottom line on selected
  tokens in the HC themes.

### Stories vs. sources

| Source            | Example        | React story     | Status     | Notes                                                             |
| ----------------- | -------------- | --------------- | ---------- | ----------------------------------------------------------------- |
| fundamental-react | primary        | `Primary`       | ✅ covered |                                                                   |
| fundamental-react | compact        | `CompactTokens` | ✅ covered | `data-density="compact"`; also the global density toolbar.        |
| fundamental-react | readOnly       | `ReadOnly`      | ✅ covered |                                                                   |
| fundamental-react | dev            | `Playground`    | ✅ covered | Knobs are the Playground controls.                                |
| fundamental-react | noStyles       | —               | ➖ n/a     | No `cssNamespace`.                                                |
| Angular           | Tokens         | `Tokens`        | ✅ covered | Default, selected, read-only, disabled and a long truncated text. |
| Angular           | Compact tokens | `CompactTokens` | ✅ covered |                                                                   |
| Angular           | Tokenizer      | `Tokenizer`     | ✅ covered | Enter adds the typed fruit; "Fig" is read-only.                   |
| Angular           | Overflow       | `Overflow`      | ✅ covered | 20rem, 10 tokens.                                                 |
| Angular           | Compact        | `Compact`       | ✅ covered | Compact with the value-help addon button.                         |
| Angular           | Open: overflow | `OpenOverflow`  | ✅ covered | `play` opens the overflow popover for axe.                        |
| —                 | (visual)       | `States`        | ➕ extra   | fundamental-styles' token states, for the visual comparison.      |
| —                 | (visual)       | `FieldStates`   | ➕ extra   | Empty, with tokens, read-only, error and disabled tokenizers.     |

### Tests vs. sources

| Source            | Behaviour                                                    | React test                                                                          | Status     |
| ----------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------- |
| Angular           | onTokenClick on click, Enter and Space                       | emits onTokenClick on click, Enter and Space                                        | ✅ covered |
| Angular           | onCloseClick from the close icon only, no selection          | emits onCloseClick from the close icon only, without selecting the token            | ✅ covered |
| Angular           | closeClickHandler() without an event emits nothing           | —                                                                                   | ➖ n/a     |
| Angular           | Focusable option, roledescription, selected model            | is a focusable option described as a token, selected through its props              | ✅ covered |
| Angular           | elementFocused on focus and blur                             | emits onFocusChange on focus and blur                                               | ✅ covered |
| Angular           | Disabled: no onCloseClick, aria-disabled                     | does not emit onCloseClick when disabled and is aria-disabled                       | ✅ covered |
| Angular           | Read-only: no close icon                                     | has no close icon when read-only                                                    | ✅ covered |
| Angular           | Tokens as options with positions                             | lists tokens as options with their positions                                        | ✅ covered |
| Angular           | Arrow keys between the input and the tokens                  | moves between the input and the tokens with the arrow keys                          | ✅ covered |
| Angular           | Backspace and Delete remove tokens                           | removes tokens with Backspace and Delete                                            | ✅ covered |
| Angular           | Clicks, Shift clicks, outside click, Ctrl+A                  | selects with clicks, Shift clicks and Ctrl+A                                        | ✅ covered |
| Angular           | Space selects the focused token, Enter goes to the input     | selects the focused token with Space and moves to the input with Enter              | ✅ covered |
| Angular           | Collapse into the overflow link while not focused            | collapses tokens that do not fit into an overflow link while not focused            | ✅ covered |
| Angular           | externalHiddenCount in the link, no popover of its own       | counts externalHiddenCount in the n more link and leaves the hidden tokens to ...   | ✅ covered |
| Angular           | Hidden tokens in a named popover, removable                  | lists the hidden tokens in a named popover where they can be removed                | ✅ covered |
| Angular           | Ctrl and Meta clicks toggle                                  | toggles a token with a Ctrl click without clearing the others                       | ✅ covered |
| Angular           | Collapsed tokens shown again when wider                      | shows the collapsed tokens again when the tokenizer gets wider                      | ✅ covered |
| Angular           | Arrow keys mirrored in RTL                                   | mirrors the arrow keys in RTL                                                       | ✅ covered |
| Angular           | Tokens out of the tab order in a tokenizer                   | keeps tokens in a tokenizer out of the tab order                                    | ✅ covered |
| Angular (code)    | Caret not at the start keeps the arrows in the input         | keeps the arrow keys in the input while the caret is not at the start               | ✅ covered |
| Angular (code)    | disableKeyboardDeletion                                      | keeps the tokens with disableKeyboardDeletion                                       | ✅ covered |
| Angular (code)    | Selected tokens removed together                             | removes the selected tokens together with Backspace from the input                  | ✅ covered |
| Angular (code)    | open keeps the tokens expanded                               | keeps the tokens expanded while open                                                | ✅ covered |
| Angular (code)    | showOverflowPopover false                                    | only calls onMoreClick without showOverflowPopover                                  | ✅ covered |
| Angular (code)    | LiveAnnouncer on input focus                                 | announces the number of tokens when the input gets the focus                        | ✅ covered |
| Angular (code)    | removeSelectedTokens(), focusTokenElement()                  | removes the selected tokens and focuses a token through actionsRef                  | ✅ covered |
| Angular (code)    | Addon button: tabindex, title, haspopup, expanded, mousedown | renders an addon button that keeps the focus in the input unless buttonFocusable    | ✅ covered |
| Angular (code)    | Field focus frame, state, readonly, disabled                 | shows the focus frame, value states, read-only and disabled on the field            | ✅ covered |
| React             | Uncontrolled selection                                       | works uncontrolled with defaultSelected and reports onSelectedChange in a tokenizer | ✅ covered |
| fundamental-react | Prop spreading and ref                                       | passes native props, className and the ref to the option (fundamental-react)        | ✅ covered |
| fundamental-react | compact                                                      | is shorter in compact density                                                       | ✅ covered |
| React             | Root props and ref of the tokenizer                          | passes native props, className and the ref to the root                              | ✅ covered |

### Visual comparison

`pnpm visual token`: 17 cases × 16 combinations, 184/272 matching after the fixes below; the other 88 are the kept
differences of the table (24 selected-token background and line in Horizon and Dark, 40 HC field border, 24 read-only
field line and hover), all against fundamental-styles' own inconsistencies. Cases, by pixels: the token at rest, selected, hovered,
selected and hovered, focused, selected and focused, hovered and focused, and read-only (against fundamental-styles'
Token story, with its "tokenopolis" text); the close icon; the tokenizer field empty, hovered and with tokens, a token
and a read-only token inside it, and its input (Tokenizer story); the read-only tokenizer at rest and hovered (Readonly
story). Reviewed by eye in Horizon cozy and compact, LTR and RTL: `Tokens`, `FieldStates`, `Overflow` (also with the
input focused, expanded and scrolled to the end), `Compact` and `OpenOverflow`.

| Difference                                                                                                                                                     | Cause                                                                                                                     | Resolution                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The tokenizer input is 16px high (its text height) instead of the field height (36px, 26px compact), so only its text line takes clicks                        | `h-full`/`min-h-full` of the input and the inner row resolve against a field that only has a `min-height` (as in Angular) | Fixed: the inner row and the input stretch (`self-stretch`) to the field. Angular issue.                                                                                                                                                      |
| The tokenizer field has no `cursor: text`; Horizon Dark text colour `#f5f6f7` instead of the field text colour                                                 | Not in the Angular classes                                                                                                | Fixed: `cursor-text` and `text-sap-field-text-color` on the field. Angular issue (computed styles only).                                                                                                                                      |
| A hovered tokenizer keeps the field shadow; fundamental-styles removes it                                                                                      | No hover shadow rule in Angular                                                                                           | Fixed: `hover:[box-shadow:none]` (value states keep their own hover shadow). Angular issue.                                                                                                                                                   |
| Read-only tokenizer: Angular's `border-dashed` and `shadow-none` lose to the field border style (none in Horizon) and drop the field shadow                    | `[border-style:var(--sapField_BorderStyle)]` wins over `border-dashed`; `shadow-none` is not in fundamental-styles        | Fixed: the read-only field background style and colour with the field shadow, as fundamental-styles. Angular issue.                                                                                                                           |
| High contrast: a selected token keeps the 1px inset bottom line; fundamental-styles has none there                                                             | `--fdToken_Selected_Border_BottomStyle` is the plain selected background in HC                                            | Fixed: `hc:shadow-none` on selected tokens. Angular issue.                                                                                                                                                                                    |
| Selected token background: fundamental-styles transparent, ours `--sapButton_Selected_Background` (e.g. #edf6ff); the bottom line is a 2px gradient there      | fundamental-styles' `.fd-token--selected { background: … }` shorthand resets the background colour it sets just before    | Kept: the selected background is the Fiori selected token look (the hover state of fundamental-styles has it). The line is the same 2px (1px border + 1px inset shadow). Under the pixel tolerance (0.1–0.2%); the style comparison flags it. |
| Selected token bottom line in Horizon Dark: fundamental-styles `#0064d9`, ours `--sapButton_Selected_BorderColor` (#4db1ff)                                    | fundamental-styles hard-codes the Horizon colour in its Dark theme variable                                               | Kept: the line has the selected border colour, as the border itself.                                                                                                                                                                          |
| High contrast: the tokenizer field has the 2px field border (and the input is 4px smaller inside it); fundamental-styles has none                              | fundamental-styles 0.42 sets `border: none` on `.fd-tokenizer`, so the field is not visible on the HC background          | Kept: an HC field needs its border (fundamental-styles' own input has it).                                                                                                                                                                    |
| Read-only tokenizer bottom line dashed (`--sapField_ReadOnly_BackgroundStyle`), fundamental-styles solid; fundamental-styles' read-only field changes on hover | fundamental-styles uses the normal field style and hover for read-only tokenizers                                         | Kept: the Horizon read-only field style, the same as the read-only input; read-only fields do not hover.                                                                                                                                      |
| Tokenizer input `min-height`: fundamental-styles 100% (26px compact), ours none                                                                                | fundamental-styles' input class keeps its own minimum                                                                     | Ignored in the case (computed style only): the input stretches to the field.                                                                                                                                                                  |
