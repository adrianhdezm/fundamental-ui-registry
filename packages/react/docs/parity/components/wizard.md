## wizard

Sources: fundamental-react [Wizard](https://github.com/SAP/fundamental-react/tree/main/src/Wizard) · Angular
[`registry/ui/wizard`](../../../../angular/registry/ui/wizard/) · fundamental-styles
[Wizard](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-wizard--docs)
Registry: `registry/ui/wizard/`, with the `action-sheet` component (Base UI's Popover) for the list of stacked steps
and the `icon` component for the glyphs.

API: composed parts, as Angular's `fd-wizard` and its parts:

```tsx
<Wizard contentHeight="26rem">
  <WizardNavigation>
    <WizardProgressBar size="lg" aria-label="Steps">
      <WizardStep status={status[0]} onStatusChange={(s) => update(0, s)} label="Product type">
        <WizardStepIndicator glyph="product" />
        <WizardContent size="lg">
          …
          <WizardNextStep>
            <Button variant="emphasized" label="Step 2" onClick={() => go(1)} />
          </WizardNextStep>
        </WizardContent>
      </WizardStep>
    </WizardProgressBar>
  </WizardNavigation>
  <Bar barDesign="footer">…</Bar>
</Wizard>
```

| Angular                                                                       | React                                                                                                  |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `fd-wizard` (`role="region"` host)                                            | `Wizard`: a `<div role="region">`; native props, `className` and `ref` go to it                        |
| `appendToWizard`, `contentHeight`, `responsivePaddings`, `displaySummaryStep` | the same props                                                                                         |
| `ariaLabel` (default `Wizard`)                                                | `aria-label` (default `Wizard`), also the default name of the navigation                               |
| `fd-wizard-navigation` (`ariaLabel`)                                          | `WizardNavigation`: the `<nav>` itself (`aria-label`, native props)                                    |
| `ul[fd-wizard-progress-bar]` (`size`)                                         | `WizardProgressBar`: the `<ul role="list">` (`size`, native props)                                     |
| `li[fd-wizard-step]`: `status` model                                          | `WizardStep`: `status` (controlled), `defaultStatus` (`upcoming`), `onStatusChange`                    |
| `branching`, `label`, `optionalText`, `isSummary`, `stepClickValidator`       | the same props                                                                                         |
| `ariaLabel`, `ariaRoleDescription`, `id`                                      | `aria-label`, `ariaRoleDescription`, `id` (from `useId` by default; the content is `<id>-content`)     |
| `(stepClicked)`, `(stepIndicatorItemClicked)` (the `WizardStep` instance)     | `onStepClick`, `onStepIndicatorItemClick` with a `WizardStepInfo` (`id`, `label`, `index`)             |
| `fd-wizard-step-indicator` (`glyph`, `glyphFont`, `stackedLabel`)             | `WizardStepIndicator`, a child of the step; same props, `onItemClick` for `(stepIndicatorItemClicked)` |
| `fd-wizard-content` (`contentBackground`, `size`)                             | `WizardContent`: the `<section>` (native props go to it)                                               |
| `fd-wizard-next-step` (`floating`, `canHide`)                                 | `WizardNextStep`: a `<div>` around the button                                                          |

The behaviour is Angular's: `goToStep` makes a step current, the ones before it completed and the ones after
upcoming (each step's `onStatusChange` reports its new status); a step is visited once it was current or completed, and
completed for good once it went from current to completed (or when the summary shows); the content of the visited
steps shows one below the other (`appendToWizard`) or only the current one; a new current step scrolls its content to
the top (smoothly) and moves the focus to its first tabbable element (not on the first rendering); scrolling the
content makes the step at the top current; the summary replaces the steps (the progress bar hides) unless
`displaySummaryStep`; the steps form one tab stop (the current one) and Left and Right (mirrored in RTL) move between
the completed ones; Enter, Space and a click go to a visited step (after `stepClickValidator`); steps narrower than
168px stack, the earlier ones under the step before the current one and the later ones under the last one, and those
two indicators open an action sheet that lists them (visited ones enabled). The stacking algorithm and the widths are
Angular's line for line.

fundamental-react's integrated `Wizard` (steps with `title` and children, built-in titles, next buttons and footer) is
built from the parts in the stories: `navigationType="anchors"` is `appendToWizard`, `"tabs"` is
`appendToWizard={false}` with buttons in a footer `Bar`; `option="stacked"` is automatic; `headerSize` is the progress
bar's `size`, `contentSize` the content's `size`, `background` the content's `contentBackground`; a step's `title` is
`label`, `optionalLabel` is `optionalText`, `glyph` and `indicator` are the indicator's `glyph` and children;
`modifiers` are `status`; `connector` follows the status (active once completed, dashed when `branching`, none after
the last step); `menu` is the automatic action sheet; `valid` is the app disabling its next button;
`Wizard.Container` is `Wizard`, `Wizard.Footer` a footer `Bar`, `Wizard.NextStep` a `WizardNextStep` with a `Button`.

**Differences from Angular, on purpose:**

- Status follows React's controlled/uncontrolled pattern: a `status` prop without `onStatusChange` stays as given (the
  Fixed statuses story); Angular's one-way `[status]` lets the step change itself until the input changes again.
- Callbacks report a `WizardStepInfo` instead of the step instance.
- Each step tells the wizard about itself through context (registered in DOM order); the wizard renders one slot per
  shown step in its scrolling area and `WizardContent` renders into its slot with a portal (Angular renders the
  content template there). Outside a wizard step, `WizardContent` renders in place. As Angular's `ng-content select`,
  the step puts its `WizardStepIndicator` children in the step button, and the wizard puts its `WizardNavigation`
  children above the scrolling area and the rest (a footer bar) below it.
- No host wrappers: `WizardNavigation` is the `<nav>`, `WizardNextStep` a single `<div>`; the step sets its own
  `--wz-z` (stacking order) instead of the wizard writing it on the element.
- The first tabbable element of new content is found with a selector and visibility checks instead of the CDK's
  `InteractivityChecker`.
- Stacked steps keep their label visually hidden (`sr-only-sap`) instead of `display: none`, so a stacked step with a
  glyph indicator still has a name (axe `aria-command-name` in the Stacked story).
- Choosing a step in the stacked steps' action sheet closes it.
- The progress bar shadow is `[box-shadow:var(--sapContent_HeaderShadow)]`, the indicator radius `rounded-[50%]` and
  the stacked top connector `min-w-0` (see the visual comparison).

### Stories vs. sources

| Source            | Example                               | React story         | Status     | Notes                                                                                                         |
| ----------------- | ------------------------------------- | ------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| Angular           | Default                               | `Default`           | ✅ covered | Also `Playground` with the wizard props as controls.                                                          |
| Angular           | Current step only                     | `CurrentStepOnly`   | ✅ covered |                                                                                                               |
| Angular           | Branching steps and a visible summary | `Branching`         | ✅ covered | `RadioGroup` of the `radio` component; the second step is keyed by the payment type, as Angular's `@if`.      |
| Angular           | Stacked steps and a footer            | `Narrow`            | ✅ covered |                                                                                                               |
| Angular           | Customizable                          | `Customizable`      | ✅ covered |                                                                                                               |
| Angular           | Mobile, floating footer               | `Mobile`            | ✅ covered |                                                                                                               |
| Angular           | In a dialog                           | `InDialog`          | ✅ covered | A controlled `Dialog` of the `dialog` component; closing or dismissing writes the result below the button.    |
| Angular           | Loading                               | `Loading`           | ✅ covered | `Skeleton`s; the steps have no label, so no step button, as Angular.                                          |
| Angular           | Open: dialog                          | `OpenDialog`        | ✅ covered |                                                                                                               |
| Angular           | Open: stacked steps                   | `OpenStacked`       | ✅ covered | `play` opens the action sheet of the stacked steps and waits for the focus on its first item.                 |
| fundamental-react | anchorsMode                           | `AnchorsMode`       | ✅ covered | fundamental-react's integrated wizard built from the parts (`FrWizard` in the stories): titles, next buttons. |
| fundamental-react | tabsMode                              | `TabsMode`          | ✅ covered | `appendToWizard={false}`, Previous / Next / Cancel in the footer.                                             |
| fundamental-react | customLabels                          | `CustomLabels`      | ✅ covered |                                                                                                               |
| fundamental-react | NoTitles                              | `NoTitles`          | ✅ covered |                                                                                                               |
| fundamental-react | glyphs                                | `Glyphs`            | ✅ covered | Fourth step current and xl paddings, as fundamental-styles' responsive example (visual reference).            |
| fundamental-react | noLabels                              | —                   | n/a        | Angular has no label-less mode (a step without label has no button); narrow steps stack instead.              |
| fundamental-react | stacked                               | `Stacked`           | ✅ covered | Automatic: seven steps in 300px, fourth current, as fundamental-styles' mobile example.                       |
| fundamental-react | validator                             | `Validator`         | ✅ covered | The next button stays disabled until the checkbox is checked.                                                 |
| fundamental-react | tabsModeValidator                     | `TabsModeValidator` | ✅ covered |                                                                                                               |
| fundamental-react | branching                             | `BranchingChoice`   | ✅ covered | `Select` of the `select` component; `branching` until the choice is made.                                     |
| fundamental-react | tabsModeBranching                     | `TabsModeBranching` | ✅ covered |                                                                                                               |
| fundamental-react | sizes                                 | `Sizes`             | ✅ covered |                                                                                                               |
| fundamental-react | backgrounds                           | `Backgrounds`       | ✅ covered | On `--sapShellColor`'s background (`bg-sap-shell-background`) instead of a yellow page; md paddings.          |
| fundamental-react | manual                                | `Manual`            | ✅ covered | Fixed statuses: controlled `status` without `onStatusChange`.                                                 |

### Tests vs. sources

| Source            | Behaviour                                                   | React test                                                                              | Status     |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| Angular           | Steps in a list, content of the current step, ARIA          | shows the steps in a list and the content of the current step                           | ✅ covered |
| Angular           | Appends content, hides the next step, scrolls, moves focus  | appends the content of the steps as they become current                                 | ✅ covered |
| Angular           | Goes back to a visited step on click                        | goes back to a visited step when it is clicked (also `onStepClick`)                     | ✅ covered |
| Angular           | stepClickValidator                                          | asks the step click validator                                                           | ✅ covered |
| Angular           | Arrow keys between visited steps, Enter                     | moves the focus between visited steps with the arrow keys (also Space)                  | ✅ covered |
| Angular           | appendToWizard false                                        | shows only the current step without appendToWizard                                      | ✅ covered |
| Angular           | Summary replaces the steps                                  | replaces the steps by the summary                                                       | ✅ covered |
| Angular           | Scrolling makes the step at the top current                 | makes the step whose content scrolls to the top current                                 | ✅ covered |
| Angular           | Stacks steps, lists them in the indicator                   | stacks steps that do not fit and lists them in the indicator (also choosing one)        | ✅ covered |
| Angular           | Glyph of an indicator                                       | shows the glyph of a step indicator                                                     | ✅ covered |
| Angular           | Labels back when the wizard grows                           | gives stacked steps their labels back when the wizard grows                             | ✅ covered |
| Angular           | displaySummaryStep                                          | keeps the summary in the progress bar with displaySummaryStep                           | ✅ covered |
| Angular           | Dashed connector after a branching step                     | draws a dashed connector after a branching step                                         | ✅ covered |
| Angular           | Floating next step above the floating footer                | keeps a floating next step above the floating footer                                    | ✅ covered |
| Angular           | Arrow keys mirrored in RTL                                  | mirrors the arrow keys between steps in RTL                                             | ✅ covered |
| fundamental-react | Wizard created, prop spreading                              | renders the content of a step and passes native props, className and ref to the wizard  | ✅ covered |
| fundamental-react | WizardContent, WizardNavigation, WizardStep: prop spreading | (same test: native props on the nav, the list, the step, the indicator and the content) | ✅ covered |
| fundamental-react | WizardStep label and indicator                              | (same test)                                                                             | ✅ covered |
| fundamental-react | WizardStep icon only with a glyph                           | renders an icon only when the indicator has a glyph                                     | ✅ covered |
| fundamental-react | WizardContainer, WizardFooter                               | —                                                                                       | n/a        |
| —                 | Uncontrolled status; never-visited steps cannot be clicked  | keeps its own status without a status prop (uncontrolled)                               | ✅ new     |
| —                 | Parts outside a wizard                                      | renders the parts in place outside a wizard                                             | ✅ new     |

fundamental-react's `WizardContainer` is `Wizard` itself and `WizardFooter` a footer `Bar` (tested in `bar`).

### Visual comparison

`pnpm visual wizard`: 29 cases × 16 combinations, 464/464 matching. The `Glyphs` story is fundamental-styles'
responsive example (first wizard: five glyph steps, the fourth current, xl paddings) and `Stacked` its mobile example
(first wizard: seven glyph steps in 300px, the fourth current). Cases: from `Glyphs`, the progress bar, the completed
step, indicator, label and connector, the optional text, the current step, indicator (with the selection bar), label
and the connector after it, the upcoming last step, indicator and label, and a step button focused, by pixels; the
content section and its container, styles only (other texts). From `Stacked`, the progress bar, a stacked completed
step, the stacked top step, indicator and connector, the current step, a stacked upcoming step and the last one, by
pixels. Styles only, other texts: the next step (`Default` against the default example), numbered indicators current
and upcoming (`AnchorsMode` against the default example; the upcoming one also by pixels), the branching connector
(`BranchingChoice`) and the list content background (`Backgrounds`) against the customized example.

| Difference                                                        | Cause                                                                                          | Resolution                                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Indicator radius 3.4e7px instead of 50% (computed only)           | Angular's `rounded-full` (`calc(infinity * 1px)`); fundamental-styles has `border-radius: 50%` | Fixed: `rounded-[50%]`.                                                     |
| Stacked top connector 16px instead of 5px, reaching the next step | Angular's connector keeps `min-w-4` in the 4rem stacked top step                               | Fixed: `min-w-0` on the connector of the stacked top step.                  |
| Progress bar shadow with extra transparent layers                 | Angular's `shadow-sap-content-header-shadow` adds Tailwind's ring layers                       | Fixed before the comparison: `[box-shadow:var(--sapContent_HeaderShadow)]`. |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, Open: stacked steps, Stacked and Glyphs. In RTL
the steps run from the right, the selection bar sits under the current indicator and the action sheet opens under the
stacked indicator. Density changes nothing in the wizard itself (fixed 2rem indicators, as fundamental-styles).

Angular issues: the indicator uses `rounded-full` (a huge px radius, not visible); the stacked top step's connector
keeps `min-w-4` and runs 11px past its 4rem step; the progress bar uses the `shadow-sap-content-header-shadow`
utility (transparent ring layers); stacked steps hide their label with `display: none`, so a stacked step whose
indicator has only a glyph has no accessible name.
