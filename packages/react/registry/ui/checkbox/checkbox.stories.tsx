import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FormEvent } from 'react';
import { expect, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { FormFieldset, FormLabel, FormLegend } from '@/ui/form/form';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage } from '@/ui/form/form-message';
import { Link } from '@/ui/link/link';
import { Checkbox, type FormState } from './checkbox';

const STATES = ['default', 'success', 'error', 'warning', 'information'] as const;

const meta = {
    title: 'Components/Checkbox',
    component: Checkbox,
    parameters: {
        docs: {
            description: {
                component:
                    'Checkboxes select one or more options. The whole label is clickable; Space toggles the focused ' +
                    'checkbox. A tristate checkbox shows a mixed state, for example for "select all". Use `checked` ' +
                    'and `onCheckedChange` for a boolean, or `value` and `onValueChange` with `values` and `tristate` ' +
                    'for other model values.'
            }
        }
    },
    argTypes: { state: { control: 'select', options: STATES } },
    args: {
        label: 'Option',
        state: 'default',
        defaultChecked: false,
        indeterminate: false,
        disabled: false,
        readOnly: false,
        displayOnly: false,
        required: false,
        tristate: false,
        tristateSelectable: false,
        wrapLabel: false
    }
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

const valueText = 'ms-2 text-sap-font-small-size text-sap-content-label-color';

export const Playground: Story = {};

function DefaultDemo() {
    const [value, setValue] = useState(false);
    return (
        <div>
            <FormLabel htmlFor="defaultCheckbox" required>
                Default checkbox
            </FormLabel>
            <Checkbox label="Option 1" required id="defaultCheckbox" checked={value} onCheckedChange={setValue} />
            <span className={valueText}>Value: {String(value)}</span>
            <div>
                <Checkbox>Default Checkbox</Checkbox>
            </div>
        </div>
    );
}

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: 'A required checkbox with an external label (through `id`), and an uncontrolled one.'
            }
        }
    },
    render: () => <DefaultDemo />
};

export const Indeterminate: Story = {
    parameters: {
        docs: {
            description: {
                story: '`indeterminate` shows the mixed state whatever the value, e.g. for a "select all" checkbox.'
            }
        }
    },
    render: () => <Checkbox indeterminate>Text Option</Checkbox>
};

function ControlledDemo() {
    const [checked, setChecked] = useState(false);
    return (
        <div className="flex items-center gap-2">
            <Checkbox checked={checked} onCheckedChange={setChecked}>
                Text Option
            </Checkbox>
            <Button label={checked ? 'Uncheck' : 'Check'} onClick={() => setChecked(!checked)} />
        </div>
    );
}

export const Controlled: Story = {
    parameters: {
        docs: { description: { story: '`checked` with `onCheckedChange`: the parent owns the state.' } }
    },
    render: () => <ControlledDemo />
};

export const DefaultChecked: Story = {
    name: 'Default checked',
    parameters: { docs: { description: { story: '`defaultChecked`: checked at first, then the checkbox owns it.' } } },
    render: () => <Checkbox defaultChecked>Text Option</Checkbox>
};

export const Disabled: Story = {
    render: () => (
        <div className="flex flex-col">
            <Checkbox disabled>Text Option</Checkbox>
            <Checkbox disabled defaultChecked>
                Selected State
            </Checkbox>
            <Checkbox disabled indeterminate>
                TriState Text
            </Checkbox>
        </div>
    )
};

export const Compact: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Compact density: set `data-density="compact"` on the checkbox or an ancestor, or use the Density toolbar switch.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col">
            <Checkbox data-density="compact">Text Option</Checkbox>
            <Checkbox data-density="compact" defaultChecked>
                Selected State
            </Checkbox>
            <Checkbox data-density="compact" indeterminate>
                Tri-State
            </Checkbox>
        </div>
    )
};

const STATE_NAMES: [Exclude<FormState, 'default'>, string][] = [
    ['error', 'Error'],
    ['warning', 'Warning'],
    ['information', 'Information'],
    ['success', 'Success']
];

export const ValidationStates: Story = {
    name: 'Validation states',
    parameters: {
        docs: {
            description: {
                story: 'Value states colour the box; `error` also sets `aria-invalid`. Unchecked, checked and mixed.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-2">
            {STATE_NAMES.map(([state, name]) => (
                <div key={state} className="flex flex-wrap">
                    <Checkbox state={state}>{`${name} State`}</Checkbox>
                    <Checkbox state={state} defaultChecked>{`${name} Selected State`}</Checkbox>
                    <Checkbox state={state} indeterminate>{`${name} Tri-State`}</Checkbox>
                </div>
            ))}
        </div>
    )
};

/** fundamental-react's validation states with their messages: each one opens under its checkbox on focus. */
function ValueStateMessagesDemo() {
    return (
        <div className="flex max-w-md flex-col gap-6">
            {STATE_NAMES.map(([state, name]) => (
                <FormInputMessageGroup key={state}>
                    <Checkbox state={state}>{`${name} State`}</Checkbox>
                    <FormMessage type={state}>
                        {state === 'error' ? (
                            <>
                                Accept the <Link href="#">terms and conditions</Link> to continue.
                            </>
                        ) : (
                            `Test validation state: ${name.toLowerCase()}.`
                        )}
                    </FormMessage>
                </FormInputMessageGroup>
            ))}
        </div>
    );
}

export const ValueStateMessages: Story = {
    name: 'Value state messages',
    parameters: {
        docs: {
            description: {
                story:
                    'A form input message group shows the message of a value state under the checkbox while it has ' +
                    'focus and describes the checkbox with it (`aria-describedby`); an error message also sets ' +
                    '`aria-invalid`.'
            }
        }
    },
    render: () => <ValueStateMessagesDemo />
};

/** Focuses the error checkbox so axe checks its open message (with a link). */
export const OpenValueStateMessage: Story = {
    name: 'Open: value state message',
    tags: ['!autodocs'],
    render: () => <ValueStateMessagesDemo />,
    play: async ({ canvasElement }) => {
        canvasElement.querySelector<HTMLElement>('[role=checkbox]')!.focus();
        await waitFor(() =>
            expect(
                [...document.querySelectorAll<HTMLElement>('[data-slot="form-message"]')].some(
                    (m) => m.checkVisibility() && m.textContent!.includes('terms and conditions')
                )
            ).toBe(true)
        );
    }
};

function TristateDemo() {
    const [v1, setV1] = useState<unknown>(null);
    const [v2, setV2] = useState<unknown>(null);
    return (
        <div>
            <div className="flex items-center">
                Third state selectable:
                <Checkbox label="Option 1" tristate tristateSelectable value={v1} onValueChange={setV1} />
                <span className={valueText}>Value: {JSON.stringify(v1)}</span>
            </div>
            <div className="flex items-center">
                Third state unselectable:
                <Checkbox label="Option 2" tristate value={v2} onValueChange={setV2} />
                <span className={valueText}>Value: {JSON.stringify(v2)}</span>
            </div>
        </div>
    );
}

export const Tristate: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    '`tristate` maps `values.thirdStateValue` (`null` by default) to the mixed state. With ' +
                    '`tristateSelectable` a click goes unchecked → mixed → checked; without it the mixed state can ' +
                    'only be set by the parent.'
            }
        }
    },
    render: () => <TristateDemo />
};

function CustomValuesDemo() {
    const [v1, setV1] = useState<unknown>('No');
    const [v2, setV2] = useState<unknown>('I dont have an opinion');
    return (
        <div>
            <div className="flex items-center">
                <Checkbox
                    label="I accept the new Terms of Service"
                    values={{ trueValue: 'Yes', falseValue: 'No' }}
                    value={v1}
                    onValueChange={setV1}
                />
                <span className={valueText}>Value: {String(v1)}</span>
            </div>
            <div className="flex items-center">
                <Checkbox
                    label="Banana is the best fruit"
                    tristate
                    tristateSelectable
                    values={{ trueValue: 'Yes', falseValue: 'No', thirdStateValue: 'I dont have an opinion' }}
                    value={v2}
                    onValueChange={setV2}
                />
                <span className={valueText}>Value: {String(v2)}</span>
            </div>
        </div>
    );
}

export const CustomValues: Story = {
    name: 'Custom values',
    render: () => <CustomValuesDemo />
};

function CustomLabelDemo() {
    const [value, setValue] = useState(false);
    return (
        <div className="flex items-center">
            <Checkbox checked={value} onCheckedChange={setValue}>
                I accept&nbsp;<Link href="#">Terms and conditions</Link>
            </Checkbox>
            <span className={valueText}>Value: {String(value)}</span>
        </div>
    );
}

export const CustomLabel: Story = {
    name: 'Custom label',
    parameters: { docs: { description: { story: 'Children instead of `label`, for rich content such as links.' } } },
    render: () => <CustomLabelDemo />
};

export const LabelWrapping: Story = {
    name: 'Label wrapping',
    render: () => (
        <div className="max-w-xl">
            <Checkbox wrapLabel>
                LABEL WILL BE POSITIONED IN THE MIDDLE. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Corporis ea eos in porro quae ullam. Aliquid corporis doloribus exercitationem facilis hic illo labore
                laudantium quam reprehenderit sapiente.
            </Checkbox>
            <Checkbox wrapLabel valignLabel="top">
                LABEL WILL BE POSITIONED ON THE TOP. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis
                ea eos in porro quae ullam. Aliquid corporis doloribus exercitationem facilis hic illo labore laudantium
                quam reprehenderit sapiente.
            </Checkbox>
            <div className="max-w-60">
                <Checkbox defaultChecked>
                    Apple ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
                </Checkbox>
            </div>
        </div>
    )
};

function StatesDemo() {
    const [j, setJ] = useState(true);
    const [k, setK] = useState<boolean | null>(null);
    return (
        <div className="flex flex-col gap-2">
            <p>States:</p>
            <div className="flex flex-wrap">
                <Checkbox defaultChecked label="No state" />
                <Checkbox defaultChecked state="information" label="Info state" />
                <Checkbox defaultChecked state="success" label="Success state" />
                <Checkbox defaultChecked state="warning" label="Warning state" />
                <Checkbox defaultChecked state="error" label="Error state" />
            </div>
            <p>Disabled:</p>
            <div>
                <Checkbox defaultChecked disabled label="Disabled label" />
            </div>
            <p>Read only:</p>
            <div className="flex flex-wrap">
                <Checkbox defaultValue={false} readOnly label="Readonly label when false" />
                <Checkbox defaultValue={null} readOnly tristate label="Readonly label when null (in tristate)" />
                <Checkbox defaultValue={true} readOnly label="Readonly label when true" />
            </div>
            <p>Display-only:</p>
            <div className="flex items-center gap-2">
                <Checkbox checked={j} displayOnly label="Display-only label" />
                <Button label={`Change value to ${j ? 'false' : 'true'}`} onClick={() => setJ(!j)} />
            </div>
            <div className="flex items-center gap-2">
                <Checkbox value={k} displayOnly tristate label="Display-only tristate label" />
                <Button label="Next tristate value" onClick={() => setK(k === null ? true : k ? false : null)} />
            </div>
        </div>
    );
}

export const States: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Value states, disabled, read-only (focusable, keeps its value) and display-only (the value as an ' +
                    'icon, without the box).'
            }
        }
    },
    render: () => <StatesDemo />
};

type Agreements = { termsAndConditions: boolean; marketing: boolean; newsletter: boolean };

/** Upstream's "Accept all" pattern: a tristate parent that reflects and drives three agreements. */
function AcceptAll() {
    const [agreements, setAgreements] = useState<Agreements>({
        termsAndConditions: false,
        marketing: false,
        newsletter: false
    });
    const all = Object.values(agreements);
    const acceptAll = all.every(Boolean) ? true : all.some(Boolean) ? null : false;
    const set = (key: keyof Agreements) => (checked: boolean) => setAgreements((a) => ({ ...a, [key]: checked }));
    return (
        <div>
            <div className="flex flex-col">
                <Checkbox
                    label="Accept all"
                    tristate
                    value={acceptAll}
                    onValueChange={(v) => setAgreements({ termsAndConditions: !!v, marketing: !!v, newsletter: !!v })}
                />
                <FormFieldset className="flex flex-col ps-6">
                    <FormLegend className="sr-only-sap">Agreements</FormLegend>
                    <Checkbox
                        label="I accept Terms and Conditions"
                        checked={agreements.termsAndConditions}
                        onCheckedChange={set('termsAndConditions')}
                    />
                    <Checkbox
                        label="I want to receive Marketing Materials"
                        checked={agreements.marketing}
                        onCheckedChange={set('marketing')}
                    />
                    <Checkbox
                        label="I want to sign up for a Newsletter"
                        checked={agreements.newsletter}
                        onCheckedChange={set('newsletter')}
                    />
                </FormFieldset>
            </div>
            <small className="mt-2 block text-sap-font-small-size text-sap-content-label-color">
                Value: {JSON.stringify({ acceptAll, agreements })}
            </small>
        </div>
    );
}

function FormDemo() {
    const [newsletterDisabled, setNewsletterDisabled] = useState(true);
    const [submitted, setSubmitted] = useState<Record<string, string>>({});
    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>);
    };
    return (
        <div>
            <AcceptAll />
            <form className="mt-6 flex flex-col items-start" onSubmit={onSubmit}>
                <Checkbox name="accepted" defaultChecked label="I accept the terms" />
                <Checkbox
                    name="newsletter"
                    formValue="weekly"
                    disabled={newsletterDisabled}
                    label="Newsletter (disabled control)"
                />
                <div className="flex gap-2">
                    <Button type="submit" label="Submit" />
                    <Button label="Toggle newsletter enabled" onClick={() => setNewsletterDisabled((d) => !d)} />
                </div>
            </form>
            <pre className="text-sap-font-small-size">Submitted: {JSON.stringify(submitted)}</pre>
        </div>
    );
}

export const Forms: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'A tristate "Accept all" derived from its children, and checkboxes in a native form: `name` and ' +
                    '`formValue` are submitted when checked ("on" without `formValue`).'
            }
        }
    },
    render: () => <FormDemo />
};
