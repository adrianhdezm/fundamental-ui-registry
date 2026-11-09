## wizard

Sources: fundamental-react [Wizard](https://github.com/SAP/fundamental-react/tree/main/src/Wizard) · Angular
[`registry/ui/wizard`](../../../angular/registry/ui/wizard/) · fundamental-styles
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
