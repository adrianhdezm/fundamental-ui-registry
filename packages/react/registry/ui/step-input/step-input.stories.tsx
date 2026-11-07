import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect } from 'storybook/test';
import { Button } from '@/ui/button/button';
import type { FormState } from '@/ui/input/input';
import { StepInput, type StepInputProps } from './step-input';

/** Plain label until the form component is ported (form label with colon, required and inline help). */
function Label({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
    return (
        <label
            htmlFor={htmlFor}
            className="font-sap-font-family text-sap-font-size leading-[normal] text-sap-content-label-color"
        >
            {children}
            {required && (
                <span aria-hidden="true" className="ms-0.5 text-sap-field-required-color">
                    *
                </span>
            )}
        </label>
    );
}

const GRID = 'grid max-w-3xl grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-6';
const COLUMN = 'flex flex-col gap-4';
const ITEM = 'flex flex-col items-start';
const SMALL = 'm-0 mt-1 block font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

/** A labelled step input with its own value, printed below it. */
function Item({
    label,
    id,
    initial,
    print = true,
    density,
    ...props
}: Omit<StepInputProps, 'value' | 'defaultValue'> & {
    label: string;
    id: string;
    initial: number | null;
    print?: boolean;
    density?: 'compact';
}) {
    const [value, setValue] = useState<number | null>(initial);
    return (
        <div className={ITEM} data-density={density}>
            <Label htmlFor={id}>{label}</Label>
            <StepInput inputId={id} {...props} value={value} onValueChange={setValue} />
            {print && <small className={SMALL}>Value: {String(value)}</small>}
        </div>
    );
}

const meta = {
    title: 'Components/Step Input',
    component: StepInput,
    parameters: {
        docs: {
            description: {
                component:
                    'A number field with decrement and increment buttons that repeat while pressed, on Base UI’s ' +
                    'NumberField. The value is formatted for the locale as a decimal or a currency and parsed back from ' +
                    'what is typed; `onValueChange` follows the typed number, `onValueCommitted` the final one. Up and ' +
                    'Down step the value, Page Up and Page Down by ten steps, Home and End go to the limits, and the ' +
                    'mouse wheel steps while the field has the focus. Compact density is `data-density="compact"` on the ' +
                    'step input or an ancestor.\n\n' +
                    '```tsx\n' +
                    '<label htmlFor="qty">Quantity</label>\n' +
                    '<StepInput inputId="qty" min={0} max={10} value={quantity} onValueChange={setQuantity} />\n' +
                    '<StepInput aria-label="Price" mode="currency" currency="EUR" defaultValue={19.99} />\n' +
                    '```'
            }
        }
    },
    argTypes: {
        state: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] },
        mode: { control: 'inline-radio', options: ['decimal', 'currency'] },
        textAlign: { control: 'inline-radio', options: ['left', 'center', 'right'] }
    },
    args: {
        'aria-label': 'Quantity',
        step: 1,
        state: 'default',
        disabled: false,
        readOnly: false,
        hasStepButtons: true,
        fullWidth: false,
        placeholder: 'Placeholder'
    }
} satisfies Meta<typeof StepInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<number | null>(5);
        return <StepInput {...args} value={value} onValueChange={setValue} />;
    }
};

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Limits, compact density, full width, a decimal step without the wheel, read-only, disabled, and no buttons.'
            }
        }
    },
    render: () => (
        <div className={GRID}>
            <Item label="Default (min 1, max 2)" id="si-1" min={1} max={2} initial={1} />
            <Item label="Compact" id="si-2" density="compact" initial={100} />
            <Item label="Full width" id="si-3" fullWidth initial={null} print={false} />
            <Item label="Wheel disabled, step 0.5" id="si-4" disableWheel step={0.5} initial={2.5} />
            <Item label="Read-only" id="si-5" readOnly initial={12} print={false} />
            <Item label="Disabled" id="si-6" disabled initial={3} print={false} />
            <Item
                label="Without buttons, centered"
                id="si-7"
                textAlign="center"
                hasStepButtons={false}
                initial={100}
                print={false}
            />
        </div>
    )
};

export const Primary: Story = {
    parameters: {
        docs: { description: { story: 'fundamental-styles’ and fundamental-react’s primary step input.' } }
    },
    render: () => (
        <div className={ITEM}>
            <Label htmlFor="si-primary">Default Step Input</Label>
            <StepInput inputId="si-primary" defaultValue={0} />
        </div>
    )
};

export const Compact: Story = {
    render: () => (
        <div className={ITEM} data-density="compact">
            <Label htmlFor="si-compact">Amount</Label>
            <StepInput inputId="si-compact" defaultValue={0} />
        </div>
    )
};

export const Disabled: Story = {
    render: () => (
        <div className={ITEM}>
            <Label htmlFor="si-disabled">Disabled Step Input</Label>
            <StepInput inputId="si-disabled" disabled defaultValue={0} />
        </div>
    )
};

export const ReadOnly: Story = {
    name: 'Read-only',
    parameters: {
        docs: {
            description: {
                story: 'A read-only step input has no buttons; the unit after the field describes the input.'
            }
        }
    },
    render: () => (
        <div className={ITEM}>
            <Label htmlFor="si-readonly">Temperature set to</Label>
            <StepInput inputId="si-readonly" readOnly defaultValue={23} unit="Degree Celsius" />
        </div>
    )
};

const STATES = ['success', 'information', 'error', 'warning'] as const;
const STATE_LABELS = { success: 'Success', information: 'Information', error: 'Error', warning: 'Warning' };

export const States: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Value states colour the field and its buttons; only `error` sets `aria-invalid`. The state ' +
                    'messages follow with the form component.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            {STATES.map((state) => (
                <div key={state} className={ITEM}>
                    <Label htmlFor={`si-state-${state}`}>{STATE_LABELS[state]} Step Input</Label>
                    <StepInput
                        inputId={`si-state-${state}`}
                        state={state}
                        defaultValue={0}
                        placeholder={STATE_LABELS[state]}
                    />
                </div>
            ))}
        </div>
    )
};

export const FullWidth: Story = {
    render: () => (
        <div className={COLUMN}>
            {(['default', ...STATES] as const).map((state) => (
                <div key={state} className="flex flex-col">
                    <Label htmlFor={`si-full-${state}`}>
                        {state === 'default' ? 'Default' : STATE_LABELS[state]} Step Input
                    </Label>
                    <StepInput inputId={`si-full-${state}`} state={state} fullWidth defaultValue={0} />
                </div>
            ))}
        </div>
    )
};

/** A step input with the focus in its input, as fundamental-styles' Focused story; one story per value state. */
const focusStory = (state: FormState): Story => ({
    name: `Focus: ${state}`,
    tags: ['!autodocs'],
    render: () => (
        <div className={ITEM}>
            <Label htmlFor="si-focus">Focused Step Input</Label>
            <StepInput inputId="si-focus" state={state} defaultValue={0} />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector<HTMLInputElement>('#si-focus')!;
        input.focus();
        await expect(input).toHaveFocus();
    }
});

export const FocusDefault = focusStory('default');
export const FocusSuccess = focusStory('success');
export const FocusInformation = focusStory('information');
export const FocusError = focusStory('error');
export const FocusWarning = focusStory('warning');

export const Formats: Story = {
    name: 'Formats, currencies and units',
    parameters: {
        docs: {
            description: {
                story:
                    'Fraction digits, grouping, currencies (their sign follows the field), units and locales. ' +
                    '`maxFractionDigits` also rounds the value.'
            }
        }
    },
    render: () => (
        <div className={GRID}>
            <Item label="4 minimum fraction digits" id="si-f1" minFractionDigits={4} initial={1.5} />
            <Item label="1 maximum fraction digit" id="si-f2" maxFractionDigits={1} step={0.1} initial={0.3} />
            <Item label="Integers only" id="si-f9" maxFractionDigits={0} initial={3} />
            <Item label="Min max limitation (-10 to 10)" id="si-f10" min={-10} max={10} initial={0} />
            <Item label="No grouping" id="si-f3" useGrouping={false} step={1000} initial={12000} print={false} />
            <Item
                label="Custom icons"
                id="si-f4"
                incrementButtonIcon="arrow-top"
                decrementButtonIcon="arrow-bottom"
                initial={5}
                print={false}
            />
            <Item label="Euro" id="si-f5" mode="currency" currency="EUR" initial={19.99} />
            <Item
                label="Japanese yen"
                id="si-f6"
                mode="currency"
                currency="JPY"
                step={100}
                initial={2500}
                print={false}
            />
            <Item
                label="US dollars, custom label"
                id="si-f11"
                mode="currency"
                currency="USD"
                unit="Grand"
                initial={12}
            />
            <Item label="German locale" id="si-f7" locale="de-DE" minFractionDigits={2} initial={1234.5} />
            <Item label="Spanish locale" id="si-f12" locale="es-ES" initial={12345.5} />
            <Item label="Polish locale" id="si-f13" locale="pl-PL" initial={12345.5} />
            <Item label="Saudi Arabia locale (Arabic digits)" id="si-f14" locale="ar-SA" initial={12345.5} />
            <Item label="Unit" id="si-f8" unit="kg" min={0} initial={70} print={false} />
        </div>
    )
};

/** Value, dirty and touched of a step input, the React form of Angular's form control examples. */
function FormItem({
    label,
    id,
    initial,
    required,
    error,
    toggleDisabled,
    ...props
}: Omit<StepInputProps, 'value'> & {
    label: string;
    id: string;
    initial: number | null;
    error?: (value: number | null) => string | null;
    toggleDisabled?: boolean;
}) {
    const [value, setValue] = useState<number | null>(initial);
    const [dirty, setDirty] = useState(false);
    const [touched, setTouched] = useState(false);
    const [disabled, setDisabled] = useState(!!toggleDisabled);
    const problem = error?.(value) ?? null;
    return (
        <div className={ITEM}>
            <Label htmlFor={id} required={required}>
                {label}
            </Label>
            <StepInput
                inputId={id}
                required={required}
                disabled={disabled}
                state={problem ? 'error' : null}
                {...props}
                value={value}
                onValueChange={(next) => {
                    setValue(next);
                    setDirty(true);
                }}
                onBlur={() => setTouched(true)}
            />
            <small className={SMALL}>
                Value: {String(value)}, dirty: {String(dirty)}, touched: {String(touched)}, status:{' '}
                {disabled ? 'DISABLED' : problem || (required && value == null) ? 'INVALID' : 'VALID'}
                {problem && ` (${problem})`}
            </small>
            {toggleDisabled && (
                <Button className="mt-2" label="Toggle disabled state" onClick={() => setDisabled((d) => !d)} />
            )}
        </div>
    );
}

export const Form: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    '`value` with `onValueChange`, the React form of Angular’s reactive and template driven forms ' +
                    '(touched from `onBlur`). Inside a Base UI `Field` the step input reports dirty and touched too.'
            }
        }
    },
    render: () => (
        <div className={GRID}>
            <FormItem label="Reactive forms (min value 0)" id="si-form" required min={0} initial={null} />
            <FormItem
                label="Reactive forms (min value 5, max value 10)"
                id="si-form-limits"
                required
                min={5}
                max={10}
                initial={5}
                error={(value) => (value == null ? 'a value is required' : null)}
            />
            <FormItem label="Template driven forms" id="si-form-template" initial={100} />
            <FormItem label="Disabled control" id="si-form-disabled" initial={100} toggleDisabled />
            <FormItem label="Read-only control" id="si-form-readonly" readOnly initial={100} />
        </div>
    )
};
