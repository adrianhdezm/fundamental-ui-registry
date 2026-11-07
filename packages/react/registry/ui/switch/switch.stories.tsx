import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/ui/button/button';
import { Switch } from './switch';

const meta = {
    title: 'Components/Switch',
    component: Switch,
    parameters: {
        docs: {
            description: {
                component:
                    'A switch turns a setting on or off and takes effect immediately. It is a `role="switch"` control ' +
                    "on Base UI's Switch; Space toggles it and the whole label is clickable. Use a semantic switch " +
                    'for accept/decline decisions, and `activeText`/`inactiveText` for short texts instead of icons.'
            }
        }
    },
    args: {
        'aria-label': 'Playground',
        defaultChecked: false,
        semantic: false,
        disabled: false,
        required: false,
        activeText: '',
        inactiveText: ''
    }
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

const valueText = 'text-sap-font-small-size text-sap-content-label-color';

/** A form label above a switch, which names it through `aria-labelledby` (Angular's `fdFormLabel` pattern). */
function FormLabel({
    id,
    htmlFor,
    required,
    children
}: {
    id: string;
    htmlFor?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label
            id={id}
            htmlFor={htmlFor}
            className={
                'block font-sap-font-family text-sap-font-size leading-[normal] text-sap-content-label-color' +
                (required ? " after:ms-0.5 after:text-sap-field-required-color after:content-['*'_/_'']" : '')
            }
        >
            {children}
        </label>
    );
}

export const Playground: Story = {};

export const Default: Story = {
    parameters: { docs: { description: { story: 'A switch with its label after it (children).' } } },
    render: () => <Switch>Switch label</Switch>
};

export const Checked: Story = {
    parameters: { docs: { description: { story: '`defaultChecked`: on at first, then the switch owns it.' } } },
    render: () => <Switch defaultChecked>Switch label</Switch>
};

export const Compact: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Compact density: set `data-density="compact"` on the switch or an ancestor, or use the Density toolbar switch.'
            }
        }
    },
    render: () => <Switch data-density="compact">Switch label</Switch>
};

export const WithNoLabel: Story = {
    name: 'With no label',
    parameters: {
        docs: { description: { story: 'Without visible text, name the switch with `aria-label`.' } }
    },
    render: () => <Switch aria-label="Switch" />
};

export const Sizes: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Cozy and compact, with icons and with texts. Each switch is named by the label above it through `aria-labelledby`.'
            }
        }
    },
    render: () => (
        <div>
            <FormLabel id="sw-1" htmlFor="sw-1-input">
                Default Switch
            </FormLabel>
            <Switch id="sw-1-input" aria-labelledby="sw-1" />
            <FormLabel id="sw-2" htmlFor="sw-2-input">
                Compact Switch
            </FormLabel>
            <Switch id="sw-2-input" data-density="compact" defaultChecked aria-labelledby="sw-2" />
            <FormLabel id="sw-3" htmlFor="sw-3-input">
                Switch with Text
            </FormLabel>
            <Switch id="sw-3-input" activeText="On" inactiveText="Off" aria-labelledby="sw-3" />
            <FormLabel id="sw-4" htmlFor="sw-4-input">
                Compact Switch with Text
            </FormLabel>
            <Switch
                id="sw-4-input"
                data-density="compact"
                activeText="On"
                inactiveText="Off"
                defaultChecked
                aria-labelledby="sw-4"
            />
        </div>
    )
};

export const Text: Story = {
    parameters: {
        docs: {
            description: {
                story: '`activeText` and `inactiveText` replace the icons; the text is shown upper case.'
            }
        }
    },
    render: () => (
        <div>
            <FormLabel id="text-1" htmlFor="text-1-input">
                Text Switch (off)
            </FormLabel>
            <Switch id="text-1-input" activeText="on" inactiveText="off" aria-labelledby="text-1" />
            <FormLabel id="text-2" htmlFor="text-2-input">
                Text Switch (on)
            </FormLabel>
            <Switch id="text-2-input" activeText="on" inactiveText="off" defaultChecked aria-labelledby="text-2" />
        </div>
    )
};

export const Disabled: Story = {
    render: () => (
        <div>
            <FormLabel id="sw-d1">Default disabled Switch</FormLabel>
            <Switch disabled aria-labelledby="sw-d1" />
            <FormLabel id="sw-d2">Checked disabled Switch</FormLabel>
            <Switch disabled defaultChecked aria-labelledby="sw-d2" />
            <Switch disabled>Switch label</Switch>
        </div>
    )
};

export const Semantic: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Accept/decline colours and icons. The state is announced after the name, with `acceptLabel` ' +
                    'and `declineLabel` ("Accept"/"Decline" by default).'
            }
        }
    },
    render: () => (
        <div>
            <FormLabel id="semantic-switch-1" htmlFor="semantic-switch-1-input">
                Default Semantic Switch
            </FormLabel>
            <Switch id="semantic-switch-1-input" semantic aria-labelledby="semantic-switch-1" />
            <FormLabel id="semantic-switch-2" htmlFor="semantic-switch-2-input">
                Default Semantic Compact Switch
            </FormLabel>
            <Switch
                id="semantic-switch-2-input"
                semantic
                data-density="compact"
                defaultChecked
                aria-labelledby="semantic-switch-2"
            />
            <Switch semantic>Switch label</Switch>
        </div>
    )
};

function InternalLabelsDemo() {
    const [first, setFirst] = useState(false);
    const [second, setSecond] = useState(false);
    return (
        <div>
            <div className="flex items-center">
                <Switch activeText="on" inactiveText="off" checked={first} onCheckedChange={setFirst}>
                    Show Internal Labels
                </Switch>
                <span className={valueText}>{first ? 'on' : 'off'}</span>
            </div>
            <div className="flex items-center">
                <Switch semantic checked={second} onCheckedChange={setSecond}>
                    Show Internal Labels and Icons
                </Switch>
                <span className={valueText}>{second ? 'on' : 'off'}</span>
            </div>
        </div>
    );
}

export const InternalLabels: Story = {
    name: 'Internal labels',
    parameters: {
        docs: {
            description: {
                story:
                    "fundamental-react's `internalLabels`: texts inside the track (`activeText`/`inactiveText`) or " +
                    'the semantic icons, with the state text shown next to the switch.'
            }
        }
    },
    render: () => <InternalLabelsDemo />
};

function BindingDemo() {
    const [first, setFirst] = useState(false);
    const [second, setSecond] = useState(true);
    return (
        <div>
            <FormLabel id="b1">Switch 1</FormLabel>
            <Switch checked={first} onCheckedChange={setFirst} aria-labelledby="b1" />
            <FormLabel id="b2">Switch 2</FormLabel>
            <Switch checked={second} onCheckedChange={setSecond} aria-labelledby="b2" />
            <div className="mt-2 flex gap-2">
                <Button
                    label="Switch Both"
                    onClick={() => {
                        setFirst(!first);
                        setSecond(!second);
                    }}
                />
                <Button label="Switch 1" onClick={() => setFirst(!first)} />
                <Button label="Switch 2" onClick={() => setSecond(!second)} />
            </div>
            <div aria-live="polite" className="mt-4 font-sap-font-family text-sap-text-color">
                Switch 1: {String(first)}
                <br />
                Switch 2: {String(second)}
            </div>
        </div>
    );
}

export const Binding: Story = {
    parameters: {
        docs: { description: { story: '`checked` with `onCheckedChange`: the parent owns the state.' } }
    },
    render: () => <BindingDemo />
};

function FormDemo() {
    const [submitted, setSubmitted] = useState<Record<string, string> | null>(null);
    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>);
    };
    return (
        <div>
            <form onSubmit={onSubmit}>
                <FormLabel id="f1" htmlFor="f1-input" required>
                    Form Switch 1
                </FormLabel>
                <Switch id="f1-input" name="switch1" required aria-labelledby="f1" />
                <FormLabel id="f2" htmlFor="f2-input">
                    Form Switch 2
                </FormLabel>
                <Switch id="f2-input" name="switch2" formValue="yes" defaultChecked aria-labelledby="f2" />
                <FormLabel id="f3">Disabled Form Switch 3</FormLabel>
                <Switch name="switch3" disabled aria-labelledby="f3" />
                <FormLabel id="f4">Disabled Form Switch 4</FormLabel>
                <Switch name="switch4" disabled defaultChecked aria-labelledby="f4" />
                <Button type="submit" label="Submit" />
            </form>
            <small className={valueText}>
                Submitted: {submitted ? JSON.stringify(submitted) : '—'} (a required switch must be on; disabled
                switches are not submitted)
            </small>
        </div>
    );
}

export const Forms: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Switches in a native form: `name` and `formValue` are submitted when on ("on" without ' +
                    '`formValue`); a `required` switch must be on before the form submits.'
            }
        }
    },
    render: () => <FormDemo />
};
