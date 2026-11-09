import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { FormFieldset, FormItem, FormLabel } from '@/ui/form/form';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage } from '@/ui/form/form-message';
import { Link } from '@/ui/link/link';
import { Input, Textarea, type FormState } from './input';

const COLUMN = 'flex flex-col gap-2';
const STATES: FormState[] = ['default', 'success', 'information', 'warning', 'error'];
/** fundamental-styles' placeholders, so the fields compare by pixels. */
const STATE_PLACEHOLDER: Record<FormState, string> = {
    default: 'e.g., Jane Doe',
    success: 'e.g., +1 555 123 4567',
    information: 'e.g., Optional comments',
    warning: "e.g., Your first pet's name",
    error: 'Invalid username'
};

/** Angular's textarea state messages. */
const TEXTAREA_MESSAGES: [Exclude<FormState, 'default'>, ReactNode][] = [
    [
        'success',
        <>
            Description meets the <b>minimum requirement</b> of 100 characters. You can submit the form.
        </>
    ],
    [
        'error',
        <>
            Policy must include <code>authentication</code>, <code>authorization</code>, and{' '}
            <code>data encryption</code> sections. See <Link href="#">template</Link>.
        </>
    ],
    [
        'warning',
        <>
            This feedback contains <b>potentially sensitive information</b>. Ensure proper data handling before
            submission.
        </>
    ],
    [
        'information',
        <>
            Use <code>markdown</code> formatting for better readability. Include ticket references in format{' '}
            <code>JIRA-1234</code>.
        </>
    ]
];

/** Fields with value state messages (Angular's), shared by the story and its open variant. */
function ValueStateMessagesDemo() {
    return (
        <div className="flex max-w-md flex-col gap-4">
            <FormItem>
                <FormLabel htmlFor="input-success">Email Address</FormLabel>
                <FormInputMessageGroup>
                    <Input id="input-success" placeholder="your.name@company.com" state="success" />
                    <FormMessage type="success">
                        Email format is valid and the domain is verified. You will receive notifications at this
                        address.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="input-error">VAT Number - Message appears on hover</FormLabel>
                <FormInputMessageGroup triggers={['mouseenter', 'mouseleave']}>
                    <Input id="input-error" placeholder="DE123456789" state="error" />
                    <FormMessage type="error">
                        Invalid VAT number format. Must start with <b>country code</b> (2 letters) followed by{' '}
                        <b>9-12 digits</b>. See <Link href="#">validation rules</Link>.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="input-warning">Purchase Order Amount</FormLabel>
                <FormInputMessageGroup>
                    <Input id="input-warning" placeholder="0.00" state="warning" />
                    <FormMessage type="warning">
                        The amount exceeds your approval limit and needs a second approval.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="input-info">Cost Center</FormLabel>
                <FormInputMessageGroup>
                    <Input id="input-info" placeholder="CC-1000" state="information" />
                    <FormMessage type="information">The cost center is taken from your user profile.</FormMessage>
                </FormInputMessageGroup>
            </FormItem>
        </div>
    );
}

const meta = {
    title: 'Components/Input',
    component: Input,
    parameters: {
        docs: {
            description: {
                component:
                    'Text fields for a single line (`Input`) or several lines (`Textarea`), on Base UI’s Input. ' +
                    'Pair every field with a label, and use value states with a form message that explains them. ' +
                    'Compact density is `data-density="compact"` on the field or an ancestor.'
            }
        }
    },
    argTypes: {
        state: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] }
    },
    args: {
        state: 'default',
        placeholder: 'Field placeholder text',
        disabled: false,
        readOnly: false,
        noNumberSpinner: false,
        'aria-label': 'Playground'
    }
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <div className="max-w-sm">
            <Input {...args} />
        </div>
    )
};

export const Examples: Story = {
    render: () => (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="input-default">Default Input:</FormLabel>
                <Input id="input-default" placeholder="e.g., Jane Doe" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="input-required" required>
                    Required Input:
                </FormLabel>
                <Input id="input-required" type="email" placeholder="e.g., user@example.com" required />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="input-password">Password</FormLabel>
                <Input id="input-password" type="password" placeholder="Field placeholder text" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="input-compact">Compact</FormLabel>
                <Input id="input-compact" data-density="compact" placeholder="Compact" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="input-number">Number without spinner</FormLabel>
                <Input id="input-number" type="number" noNumberSpinner defaultValue={42} />
            </FormItem>
        </div>
    )
};

export const States: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Read-only fields show a dotted line; disabled fields are dimmed and not focusable. Only the error state sets `aria-invalid`.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            {STATES.map((state) => (
                <FormItem key={state}>
                    <FormLabel htmlFor={`state-${state}`}>{state}</FormLabel>
                    <Input id={`state-${state}`} state={state} placeholder={STATE_PLACEHOLDER[state]} />
                </FormItem>
            ))}
            <FormItem>
                <FormLabel htmlFor="state-readonly">Read-only</FormLabel>
                <Input id="state-readonly" readOnly defaultValue="Canada" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="state-disabled" disabled>
                    Disabled
                </FormLabel>
                <Input id="state-disabled" disabled defaultValue="SAP" />
            </FormItem>
        </div>
    )
};

export const ValueStateMessages: Story = {
    name: 'Value state messages',
    parameters: {
        docs: {
            description: {
                story:
                    'A form input message group shows the message under the field (on focus by default, here on hover ' +
                    'for the VAT number) and links it with `aria-describedby`; an error message sets `aria-invalid`.'
            }
        }
    },
    render: () => <ValueStateMessagesDemo />
};

/** Points at the error field (its message opens on hover) so axe checks the open message with rich content. */
export const OpenValueStateMessage: Story = {
    name: 'Open: value state message',
    tags: ['!autodocs'],
    render: () => <ValueStateMessagesDemo />,
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector<HTMLInputElement>('#input-error')!);
        await waitFor(() =>
            expect(
                [...document.querySelectorAll<HTMLElement>('[data-slot="form-message"]')].some(
                    (m) => m.checkVisibility() && m.textContent!.includes('Invalid VAT number format')
                )
            ).toBe(true)
        );
    }
};

export const Controlled: Story = {
    name: 'Controlled',
    parameters: {
        docs: {
            description: {
                story: '`value` with `onValueChange`, the React form of Angular’s reactive forms example.'
            }
        }
    },
    render: function Render() {
        const [form, setForm] = useState({ inputControl: 'Default value', disabledInputControl: 'Disabled value' });
        return (
            <div className="flex max-w-md flex-col gap-2">
                <FormItem>
                    <FormLabel htmlFor="form-input-1">Default Input:</FormLabel>
                    <Input
                        id="form-input-1"
                        placeholder="Field placeholder text"
                        value={form.inputControl}
                        onValueChange={(inputControl) => setForm({ ...form, inputControl })}
                    />
                </FormItem>
                <FormItem>
                    <FormLabel htmlFor="form-input-2">Disabled Input:</FormLabel>
                    <Input id="form-input-2" disabled value={form.disabledInputControl} />
                </FormItem>
                <pre className="text-sap-font-small-size text-sap-text-color">{JSON.stringify(form, null, 2)}</pre>
            </div>
        );
    }
};

export const TextareaExamples: Story = {
    name: 'Textarea',
    render: () => (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="textarea-default">Default textarea:</FormLabel>
                <Textarea id="textarea-default" placeholder="Field placeholder text" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="textarea-required" required>
                    Required textarea:
                </FormLabel>
                <Textarea id="textarea-required" rows={4} placeholder="Write something here" required />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="textarea-compact" required>
                    Compact and Required textarea:
                </FormLabel>
                <Textarea
                    id="textarea-compact"
                    data-density="compact"
                    placeholder="Field placeholder text"
                    defaultValue="Compact textarea"
                    required
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="textarea-readonly-text">Read-only textarea</FormLabel>
                <Textarea id="textarea-readonly-text" readOnly defaultValue="Read-only text that cannot be changed." />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="textarea-project">Project Description:</FormLabel>
                <FormInputMessageGroup>
                    <Textarea id="textarea-project" state="error" placeholder="Describe the project" />
                    <FormMessage type="error">The description must have at least 20 characters.</FormMessage>
                </FormInputMessageGroup>
            </FormItem>
        </div>
    )
};

export const TextareaStates: Story = {
    name: 'Textarea states',
    parameters: {
        docs: {
            description: {
                story: 'Textareas with value state messages (shown on focus), plus disabled and read-only textareas.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            {TEXTAREA_MESSAGES.map(([state, message]) => (
                <FormItem key={state}>
                    <FormLabel
                        htmlFor={`textarea-${state}`}
                    >{`${state[0].toUpperCase()}${state.slice(1)} message:`}</FormLabel>
                    <FormInputMessageGroup>
                        <Textarea
                            id={`textarea-${state}`}
                            state={state}
                            rows={2}
                            placeholder="Enter your message here"
                        />
                        <FormMessage type={state}>{message}</FormMessage>
                    </FormInputMessageGroup>
                </FormItem>
            ))}
            <FormItem>
                <FormLabel htmlFor="textarea-disabled" disabled>
                    Message (Disabled)
                </FormLabel>
                <Textarea id="textarea-disabled" rows={2} disabled defaultValue="Disabled textarea" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="textarea-readonly">Message (Read-Only)</FormLabel>
                <Textarea id="textarea-readonly" rows={2} readOnly defaultValue="Read Only textarea" />
            </FormItem>
        </div>
    )
};

export const TextareaCounter: Story = {
    name: 'Textarea counter',
    parameters: {
        docs: {
            description: {
                story: '`maxLength` limits the length and shows the characters left below the textarea; the counter describes it (`aria-describedby`).'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="textarea-counter">Message</FormLabel>
                <Textarea id="textarea-counter" rows={4} maxLength={200} placeholder="Write something here" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="textarea-max-length">Max length</FormLabel>
                <Textarea id="textarea-max-length" maxLength={150} defaultValue="Max Length" />
            </FormItem>
        </div>
    )
};

export const TextareaControlled: Story = {
    name: 'Textarea controlled',
    render: function Render() {
        const [value, setValue] = useState('');
        const [touched, setTouched] = useState(false);
        return (
            <div className="flex max-w-md flex-col gap-2">
                <FormFieldset className="flex flex-col gap-2">
                    <FormItem>
                        <FormLabel htmlFor="textarea-21">Textarea:</FormLabel>
                        <Textarea
                            id="textarea-21"
                            placeholder="Field placeholder text"
                            value={value}
                            onValueChange={setValue}
                            onBlur={() => setTouched(true)}
                        />
                    </FormItem>
                    <FormItem>
                        <FormLabel htmlFor="textarea-22">Disabled Textarea:</FormLabel>
                        <Textarea
                            id="textarea-22"
                            disabled
                            value="Disabled value"
                            placeholder="Field placeholder text"
                        />
                    </FormItem>
                </FormFieldset>
                <pre className="text-sap-font-small-size text-sap-text-color">
                    {`Value: ${JSON.stringify({ textAreaControl: value, disabledTextAreaControl: 'Disabled value' })}\nTouched: ${touched}  Dirty: ${value !== ''}`}
                </pre>
            </div>
        );
    }
};

export const TextareaPlayground: Story = {
    name: 'Textarea playground',
    args: { 'aria-label': 'Textarea playground' },
    argTypes: { noNumberSpinner: { table: { disable: true } } },
    render: ({ state, placeholder, disabled, readOnly, 'aria-label': ariaLabel }) => (
        <div className="max-w-sm">
            <Textarea
                state={state}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                aria-label={ariaLabel}
                defaultValue="Default"
            />
        </div>
    )
};
