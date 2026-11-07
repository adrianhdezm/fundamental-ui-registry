import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState, type ComponentType, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/ui/button/button';
import { Radio, RadioGroup, type RadioGroupProps, type RadioState } from './radio';

type PlaygroundArgs = Omit<RadioGroupProps<string>, 'children'> & {
    state?: RadioState;
    wrapLabel?: boolean;
};

const STATES = ['default', 'success', 'error', 'warning', 'information'] as const;

const meta = {
    title: 'Components/Radio',
    component: RadioGroup,
    subcomponents: { Radio } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'Radio buttons select exactly one option of a small set. Put them in a `RadioGroup`, which owns ' +
                    'the value (`value`/`defaultValue`/`onValueChange`) and the `name`; arrow keys move the selection ' +
                    'inside the group, as with native radio buttons, and only the selected radio is a tab stop.'
            }
        }
    },
    argTypes: { state: { control: 'select', options: STATES } },
    args: {
        defaultValue: 'option1',
        state: 'default',
        inline: false,
        disabled: false,
        readOnly: false,
        required: false,
        wrapLabel: false
    },
    render: ({ state, wrapLabel, ...args }) => (
        <RadioGroup aria-label="Options" {...args}>
            <Radio value="option1" state={state} wrapLabel={wrapLabel}>
                Option 1
            </Radio>
            <Radio value="option2" state={state} wrapLabel={wrapLabel}>
                Option 2
            </Radio>
            <Radio value="option3" state={state} wrapLabel={wrapLabel}>
                Option 3
            </Radio>
        </RadioGroup>
    )
} satisfies Meta<PlaygroundArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

const valueText = 'text-sap-font-small-size text-sap-content-label-color';

/** A fieldset whose legend names the radio group inside it. */
function Group<V>({
    legend,
    children,
    className,
    ...props
}: Omit<RadioGroupProps<V>, 'children'> & { legend: string; children: ReactNode }) {
    const id = useId();
    return (
        <fieldset className={`m-0 mb-4 min-w-0 border-0 p-0 ${className ?? ''}`}>
            <legend id={id} className="p-0 font-sap-font-family text-sap-font-size text-sap-content-label-color">
                {legend}
            </legend>
            <RadioGroup<V> aria-labelledby={id} {...props}>
                {children}
            </RadioGroup>
        </fieldset>
    );
}

export const Playground: Story = {};

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: 'An uncontrolled group: `defaultValue` selects the first option, and the group owns the value.'
            }
        }
    },
    render: () => (
        <Group legend="Radio Buttons" defaultValue="option1">
            <Radio value="option1">Option 1</Radio>
            <Radio value="option2">Option 2</Radio>
            <Radio value="option3" disabled>
                Option 3 (disabled)
            </Radio>
        </Group>
    )
};

export const Inline: Story = {
    parameters: { docs: { description: { story: '`inline` shows the radio buttons in a row.' } } },
    render: () => (
        <Group legend="Inline Radio buttons" inline defaultValue="option1">
            <Radio value="option1">Option 1</Radio>
            <Radio value="option2">Option 2</Radio>
            <Radio value="option3">Option 3</Radio>
        </Group>
    )
};

export const Compact: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Compact density: set `data-density="compact"` on the group or an ancestor, or use the Density toolbar switch.'
            }
        }
    },
    render: () => (
        <Group legend="Compact radio buttons" data-density="compact" defaultValue="option1">
            <Radio value="option1">Option 1</Radio>
            <Radio value="option2">Option 2</Radio>
            <Radio value="option3">Option 3</Radio>
        </Group>
    )
};

export const Disabled: Story = {
    parameters: {
        docs: {
            description: {
                story: '`disabled` on a radio, or on the group for all of them. A disabled radio cannot be selected.'
            }
        }
    },
    render: () => (
        <div>
            <Group legend="Disabled radio buttons" defaultValue="option2">
                <Radio value="option1" disabled>
                    Option 1
                </Radio>
                <Radio value="option2" disabled>
                    Option 2
                </Radio>
                <Radio value="option3" disabled>
                    Option 3
                </Radio>
            </Group>
            <Group legend="Disabled group" disabled defaultValue="option1">
                <Radio value="option1">Option 1</Radio>
                <Radio value="option2">Option 2</Radio>
            </Group>
        </div>
    )
};

const STATE_NAMES: [RadioState, string][] = [
    ['default', 'Default'],
    ['success', 'Success'],
    ['error', 'Error'],
    ['warning', 'Warning'],
    ['information', 'Information']
];

export const ValidationStates: Story = {
    name: 'Validation states',
    parameters: {
        docs: {
            description: {
                story:
                    'Value states colour the circle and its dot; `error` also sets `aria-invalid`. Read-only radios ' +
                    'keep their value and stay focusable; disabled ones are dimmed.'
            }
        }
    },
    render: () => (
        <div>
            {STATE_NAMES.map(([state, name]) => (
                <Group key={state} legend={`${name} Interaction States`} defaultValue="checked">
                    <Radio value="rest" state={state}>{`${name} Radio Button`}</Radio>
                    <Radio value="checked" state={state}>{`${name} Checked Radio Button`}</Radio>
                    <Radio value="hover" state={state}>{`${name} Hover Radio Button`}</Radio>
                </Group>
            ))}
            <Group legend="Read-Only Interaction States" readOnly defaultValue="checked">
                <Radio value="rest">ReadOnly Radio Button</Radio>
                <Radio value="checked">ReadOnly Checked Radio Button</Radio>
                <Radio value="hover">ReadOnly Hover Radio Button</Radio>
            </Group>
            <Group legend="Disabled States" disabled>
                <Radio value="default">Disabled Radio Button</Radio>
                {STATE_NAMES.slice(1).map(([state, name]) => (
                    <Radio key={state} value={state} state={state}>{`${name} Radio Button (disabled)`}</Radio>
                ))}
            </Group>
        </div>
    )
};

function ExamplesDemo() {
    const [a, setA] = useState('val1');
    const [b, setB] = useState('val2');
    const [c, setC] = useState('val1');
    const options = (disabledFirst = false) => [
        <Radio key="val1" value="val1" disabled={disabledFirst}>
            Option One
        </Radio>,
        <Radio key="val2" value="val2">
            Option Two
        </Radio>,
        <Radio key="val3" value="val3">
            Option Three
        </Radio>
    ];
    return (
        <div>
            <h4 className="m-0 mb-4 font-sap-font-header-family text-sap-font-header5-size text-sap-group-title-text-color">
                Radio Buttons Examples
            </h4>
            <Group legend="Radio buttons" name="radio-1" value={a} onValueChange={setA}>
                {options()}
            </Group>
            <Group legend="Radio buttons disabled" name="radio-2" value={b} onValueChange={setB}>
                {options(true)}
            </Group>
            <Group legend="Radio buttons - Inline" name="radio-3" inline value={c} onValueChange={setC}>
                {options()}
            </Group>
            <p className={valueText}>
                Values: {a}, {b}, {c}
            </p>
        </div>
    );
}

export const Examples: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Controlled groups (`value` with `onValueChange`), one with a disabled option, one inline.'
            }
        }
    },
    render: () => <ExamplesDemo />
};

function StatesDemo() {
    const [value, setValue] = useState('val1');
    const group = (legend: string, extra: { disabled?: boolean; readOnly?: boolean; compact?: boolean } = {}) => (
        <Group
            legend={legend}
            value={value}
            onValueChange={setValue}
            disabled={extra.disabled}
            readOnly={extra.readOnly}
            data-density={extra.compact ? 'compact' : undefined}
        >
            <Radio value="val0" state="default">
                Default Option
            </Radio>
            <Radio value="val1" state="success">
                Valid(Success) Option
            </Radio>
            <Radio value="val2" state="warning">
                Warning Option
            </Radio>
            <Radio value="val3" state="error">
                Invalid(Error) Option
            </Radio>
            <Radio value="val4" state="information">
                Information Option
            </Radio>
            {!extra.disabled && !extra.readOnly && (
                <Radio value="val5" readOnly>
                    Read-only Option
                </Radio>
            )}
        </Group>
    );
    return (
        <div className="flex flex-wrap gap-12">
            {group('Radio button States')}
            {group('Radio button States compact mode', { compact: true })}
            {group('Radio button States disabled mode', { disabled: true })}
            {group('Radio button States in read only mode', { readOnly: true })}
        </div>
    );
}

export const States: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Every value state in cozy and compact density, and the same group disabled and read-only.'
            }
        }
    },
    render: () => <StatesDemo />
};

function FormDemo() {
    const [submitted, setSubmitted] = useState<Record<string, string>>({});
    const [value, setValue] = useState<number | null>(1);
    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>);
    };
    return (
        <form className="flex flex-col items-start" onSubmit={onSubmit}>
            <div className="flex flex-wrap gap-12">
                <Group legend="Form control" name="radioInput" required value={value} onValueChange={setValue}>
                    {[1, 2, 3].map((option) => (
                        <Radio key={option} value={option}>{`Option ${option}`}</Radio>
                    ))}
                </Group>
                <Group legend="Disabled form control" name="disabledRadio" disabled defaultValue={2}>
                    {[1, 2, 3].map((option) => (
                        <Radio key={option} value={option}>{`Option ${option}`}</Radio>
                    ))}
                </Group>
            </div>
            <p className={valueText}>Value: {JSON.stringify(value)}</p>
            <div className="flex gap-2">
                <Button type="submit" label="Submit" />
                <Button label="Clear" onClick={() => setValue(null)} />
            </div>
            <pre className="text-sap-font-small-size">Submitted: {JSON.stringify(submitted)}</pre>
        </form>
    );
}

export const Forms: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Groups in a native form: the selected value is submitted under the group `name` (a disabled ' +
                    'group submits nothing); `required` asks for a selection; `null` clears it.'
            }
        }
    },
    render: () => <FormDemo />
};

const LONG_LABEL =
    'Field label ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et ' +
    'dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ' +
    'commodo consequat.';

export const LabelWrapping: Story = {
    name: 'Label wrapping and truncation',
    parameters: {
        docs: {
            description: {
                story:
                    'Long labels (here at most 400px wide) are truncated; `wrapLabel` wraps them, and ' +
                    '`valignLabel="top"` keeps the circle on the first line.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col">
            <RadioGroup aria-label="Truncated" defaultValue="a">
                <Radio value="a" labelClassName="max-w-[400px]">
                    {LONG_LABEL}
                </Radio>
            </RadioGroup>
            <RadioGroup aria-label="Wrapped" defaultValue="b">
                <Radio value="b" wrapLabel labelClassName="max-w-[400px]">
                    {LONG_LABEL}
                </Radio>
            </RadioGroup>
            <RadioGroup aria-label="Wrapped, top aligned" defaultValue="c">
                <Radio value="c" wrapLabel valignLabel="top" labelClassName="max-w-[400px]">
                    {LONG_LABEL}
                </Radio>
            </RadioGroup>
        </div>
    )
};
