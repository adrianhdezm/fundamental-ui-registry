## token

Sources: fundamental-react [Token](https://github.com/SAP/fundamental-react/tree/main/src/Token) · Angular
[`registry/ui/token`](../../../angular/registry/ui/token/) (`Token`, `Tokenizer`, `TokenizerInput`) ·
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                                                                                                     | Cause                                                                                                                  | Resolution                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Selected token background: fundamental-styles transparent, ours `--sapButton_Selected_Background` (e.g. #edf6ff); the bottom line is a 2px gradient there      | fundamental-styles' `.fd-token--selected { background: … }` shorthand resets the background colour it sets just before | Kept: the selected background is the Fiori selected token look (the hover state of fundamental-styles has it). The line is the same 2px (1px border + 1px inset shadow). Under the pixel tolerance (0.1–0.2%); the style comparison flags it. |
| Selected token bottom line in Horizon Dark: fundamental-styles `#0064d9`, ours `--sapButton_Selected_BorderColor` (#4db1ff)                                    | fundamental-styles hard-codes the Horizon colour in its Dark theme variable                                            | Kept: the line has the selected border colour, as the border itself.                                                                                                                                                                          |
| High contrast: the tokenizer field has the 2px field border (and the input is 4px smaller inside it); fundamental-styles has none                              | fundamental-styles 0.42 sets `border: none` on `.fd-tokenizer`, so the field is not visible on the HC background       | Kept: an HC field needs its border (fundamental-styles' own input has it).                                                                                                                                                                    |
| Read-only tokenizer bottom line dashed (`--sapField_ReadOnly_BackgroundStyle`), fundamental-styles solid; fundamental-styles' read-only field changes on hover | fundamental-styles uses the normal field style and hover for read-only tokenizers                                      | Kept: the Horizon read-only field style, the same as the read-only input; read-only fields do not hover.                                                                                                                                      |
