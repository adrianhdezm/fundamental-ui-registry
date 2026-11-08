import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Input, Textarea } from '@/ui/input/input';
import { InputGroup } from '@/ui/input-group/input-group';
import { Link } from '@/ui/link/link';
import { MultiInput } from '@/ui/multi-input/multi-input';
import { Radio, RadioGroup } from '@/ui/radio/radio';
import { FormFieldset, FormGroup, FormGroupHeader, FormHeader, FormItem, FormLabel, FormLegend } from './form';
import { FormInputMessageGroup } from './form-input-message-group';
import { FormMessage, type FormMessageType } from './form-message';

const meta = {
    title: 'Components/Form',
    component: FormLabel,
    parameters: {
        docs: {
            description: {
                component:
                    'Building blocks for forms: header, fieldset and legend (on Base UI’s Fieldset), groups, items, ' +
                    'labels with required and colon markers and inline help, and value state messages, shown in a popover under ' +
                    'their field by a form input message group (on Base UI’s Field).'
            }
        }
    },
    args: {
        children: 'Dev',
        required: true,
        colon: false,
        allowWrap: false,
        disabled: false,
        inlineHelpContent: '',
        inlineHelpPlacement: 'after'
    }
} satisfies Meta<typeof FormLabel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <div className="max-w-sm">
            <FormItem>
                <FormLabel {...args} htmlFor="playground-input" />
                <Input id="playground-input" disabled={args.disabled} />
            </FormItem>
        </div>
    )
};

export const Labels: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'The required asterisk and the colon are drawn after the text, so they stay visible when a long ' +
                    'label is truncated. A label can carry an inline help icon after (or before) its text.'
            }
        }
    },
    render: () => (
        <div className="flex max-w-md flex-col gap-3">
            <FormItem>
                <FormLabel htmlFor="l1">Full Name</FormLabel>
                <Input id="l1" placeholder="e.g., Jane Doe" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="l2" required>
                    Email Address
                </FormLabel>
                <Input id="l2" type="email" placeholder="e.g., user@example.com" required />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="l3" colon>
                    Job Title
                </FormLabel>
                <Input id="l3" placeholder="e.g., Software Engineer" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="l4" required colon>
                    Required with colon
                </FormLabel>
                <Input id="l4" required />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="l5" inlineHelpContent="Help text for this field">
                    With inline help
                </FormLabel>
                <Input id="l5" />
            </FormItem>
            <FormItem>
                <FormLabel
                    htmlFor="l10"
                    inlineHelpContent="Help text for this field"
                    inlineHelpPlacement="before"
                    inlineHelpLabel="More about this field"
                >
                    Inline help before the label
                </FormLabel>
                <Input id="l10" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="l6" disabled>
                    Organization
                </FormLabel>
                <Input id="l6" disabled defaultValue="SAP" />
            </FormItem>
            <FormItem className="w-48">
                <FormLabel htmlFor="l7" allowWrap>
                    A long label that is allowed to wrap onto several lines
                </FormLabel>
                <Input id="l7" />
            </FormItem>
            <FormItem className="w-60">
                <FormLabel htmlFor="l9" colon>
                    Overflow proof colon, overflow proof colon, overflow proof colon
                </FormLabel>
                <Input id="l9" />
            </FormItem>
            <FormItem horizontal>
                <FormLabel htmlFor="l8">Horizontal</FormLabel>
                <Input id="l8" aria-describedby="l8-unit" />
                <FormLabel id="l8-unit" unitDescription>
                    EUR
                </FormLabel>
            </FormItem>
        </div>
    )
};

/** Focuses the inline help icon of a label, so axe checks the open help. */
export const OpenLabelInlineHelp: Story = {
    name: 'Open: label inline help',
    tags: ['!autodocs'],
    render: Labels.render,
    play: async ({ canvasElement }) => {
        canvasElement.querySelector<HTMLElement>('label[for=l5] [data-slot=inline-help]')!.focus();
        await waitFor(() =>
            expect(document.querySelector('[role=tooltip]')?.textContent).toContain('Help text for this field')
        );
    }
};

export const Items: Story = {
    name: 'Form items',
    parameters: {
        docs: {
            description: {
                story: 'A form item stacks its label above the control, or puts them on one line when `horizontal`.'
            }
        }
    },
    render: () => (
        <div className="flex max-w-md flex-col gap-4">
            <FormItem>
                <FormLabel htmlFor="item-1">Full Name:</FormLabel>
                <Input id="item-1" placeholder="e.g., Jane Doe" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="item-2" required>
                    Email Address:
                </FormLabel>
                <Input id="item-2" type="email" placeholder="e.g., user@example.com" required />
            </FormItem>
            <FormItem horizontal>
                <FormLabel htmlFor="item-3">Default Input</FormLabel>
                <Input id="item-3" placeholder="Field placeholder text" />
            </FormItem>
        </div>
    )
};

export const Groups: Story = {
    name: 'Form groups',
    parameters: {
        docs: {
            description: {
                story: 'Form groups with inputs and textareas (fundamental-react’s FormGroup examples).'
            }
        }
    },
    render: () => (
        <div className="flex max-w-md flex-col gap-4">
            <FormGroup>
                <FormItem>
                    <FormLabel htmlFor="input-1">Default input:</FormLabel>
                    <Input id="input-1" placeholder="Field placeholder text" />
                </FormItem>
            </FormGroup>
            <FormGroup>
                <FormItem>
                    <FormLabel htmlFor="input-1c" required>
                        Required Input:
                    </FormLabel>
                    <Input id="input-1c" placeholder="Field placeholder text" required />
                </FormItem>
            </FormGroup>
            <FormGroup>
                <FormItem>
                    <FormLabel htmlFor="input-3" required>
                        Password
                    </FormLabel>
                    <Input id="input-3" type="password" placeholder="Field placeholder text" required />
                </FormItem>
            </FormGroup>
            <FormGroup>
                <FormItem>
                    <FormLabel htmlFor="textarea-1" required>
                        Text area
                    </FormLabel>
                    <Textarea
                        id="textarea-1"
                        required
                        defaultValue="Pellentesque metus lacus commodo eget justo ut rutrum varius nunc."
                    />
                </FormItem>
            </FormGroup>
            <FormGroup>
                <FormItem>
                    <FormLabel htmlFor="textarea-2">Text area with counter</FormLabel>
                    <Textarea id="textarea-2" maxLength={150} />
                </FormItem>
            </FormGroup>
        </div>
    )
};

export const FieldsetAndGroups: Story = {
    name: 'Fieldset and groups',
    render: () => (
        <div className="max-w-lg">
            <FormHeader>Form Header</FormHeader>
            <FormFieldset className="mt-4">
                <FormLegend>Shipping address</FormLegend>
                <FormGroup withSpacing>
                    <FormItem>
                        <FormLabel htmlFor="g1" required>
                            Street
                        </FormLabel>
                        <Input id="g1" required />
                    </FormItem>
                    <FormItem>
                        <FormLabel htmlFor="g2">City</FormLabel>
                        <Input id="g2" />
                    </FormItem>
                </FormGroup>
            </FormFieldset>
            <FormFieldset className="mt-4">
                <FormLegend>Inline group</FormLegend>
                <FormGroup isInline withSpacing>
                    <FormItem isInline>
                        <FormLabel htmlFor="g3">Postal code</FormLabel>
                        <Input id="g3" />
                    </FormItem>
                    <FormItem isInline>
                        <FormLabel htmlFor="g4">Country</FormLabel>
                        <Input id="g4" />
                    </FormItem>
                </FormGroup>
            </FormFieldset>
            <FormFieldset className="mt-4" disabled>
                <FormLegend>Disabled fieldset</FormLegend>
                <FormItem>
                    <FormLabel htmlFor="g5">Region</FormLabel>
                    <Input id="g5" defaultValue="EMEA" />
                </FormItem>
            </FormFieldset>
            <div className="mt-4 flex flex-col gap-8">
                {(
                    [
                        ['basicGroupHeader', 'Group Header', {}],
                        ['noPaddingGroupHeader', 'Group Header without inline padding', { noPadding: true }],
                        ['noBorderGroupHeader', 'Group Header without border', { noBorder: true }]
                    ] as const
                ).map(([id, text, props]) => (
                    <FormGroup key={id} role="group" aria-labelledby={id}>
                        <FormGroupHeader {...props} id={id} render={<h4 />}>
                            {text}
                        </FormGroupHeader>
                    </FormGroup>
                ))}
            </div>
        </div>
    )
};

export const Fieldsets: Story = {
    name: 'Fieldsets',
    parameters: {
        docs: {
            description: {
                story: 'Fieldsets with a legend give a group of fields a name (fundamental-react’s FormFieldset examples).'
            }
        }
    },
    render: () => (
        <div className="flex max-w-md flex-col gap-6">
            {(['Shipping Address', 'Billing Address'] as const).map((legend, g) => (
                <FormFieldset key={legend}>
                    <FormLegend>{legend}</FormLegend>
                    {['Name:', 'Street:', 'City:', 'ZIP code:'].map((label, i) => (
                        <FormItem key={label}>
                            <FormLabel htmlFor={`ex0${g * 4 + i + 1}`}>{label}</FormLabel>
                            <Input id={`ex0${g * 4 + i + 1}`} />
                        </FormItem>
                    ))}
                </FormFieldset>
            ))}
        </div>
    )
};

export const RadioButtonGroups: Story = {
    name: 'Radio button groups',
    parameters: {
        docs: {
            description: {
                story: 'Group radio buttons in a fieldset: its legend names the radio group.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-4">
            <FormFieldset>
                <FormLegend>Radio Buttons</FormLegend>
                <RadioGroup defaultValue={1}>
                    <Radio value={1}>Field label</Radio>
                    <Radio value={2}>Field label</Radio>
                    <Radio value={3}>Field label</Radio>
                </RadioGroup>
            </FormFieldset>
            <FormFieldset disabled>
                <FormLegend>Radio buttons disabled</FormLegend>
                <RadioGroup defaultValue={1} disabled>
                    <Radio value={1}>Option 1</Radio>
                    <Radio value={2}>Option 2</Radio>
                    <Radio value={3}>Option 3</Radio>
                </RadioGroup>
            </FormFieldset>
            <FormFieldset>
                <FormLegend>Inline Radio buttons</FormLegend>
                <RadioGroup defaultValue={2} inline>
                    <Radio value={1}>Option 1</Radio>
                    <Radio value={2}>Option 2</Radio>
                    <Radio value={3}>Option 3</Radio>
                </RadioGroup>
            </FormFieldset>
            <FormFieldset>
                <FormLegend>Compact Radio buttons</FormLegend>
                <RadioGroup defaultValue={2} data-density="compact">
                    <Radio value={1}>Option 1</Radio>
                    <Radio value={2}>Option 2</Radio>
                    <Radio value={3}>Option 3</Radio>
                </RadioGroup>
            </FormFieldset>
        </div>
    )
};

export const Legend: Story = {
    name: 'Legend',
    render: () => <FormLegend>Default</FormLegend>
};

/** fundamental-styles' Form Message texts, so the messages compare by pixels. */
const MESSAGES: [Exclude<FormMessageType, 'default'>, string][] = [
    ['success', 'Email address looks good.'],
    ['error', 'Username must be at least 6 characters.'],
    ['warning', 'Make sure this is easy for you to remember.'],
    ['information', 'You can leave this blank if not applicable.']
];

export const Messages: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Each type has an icon, a background and a hidden description ("Invalid Entry", "Warning", …). `static` messages are as wide as their text, `embedded` ones have no shadow.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col items-start gap-3">
            {MESSAGES.map(([type, text]) => (
                <FormMessage key={type} type={type} static data-type={type}>
                    {text}
                </FormMessage>
            ))}
            <FormMessage type="error">This is an error message that explains the value state of a field.</FormMessage>
            <FormMessage type="information" static>
                Static message
            </FormMessage>
            <FormMessage type="warning" embedded>
                Embedded message without shadow
            </FormMessage>
        </div>
    )
};

const DIETS = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut Allergy',
    'Shellfish Allergy',
    'Kosher',
    'Halal'
];

/** Angular's "Form Message Input Group" example: a message group around each kind of field. */
function MessageGroupDemo() {
    const [open, setOpen] = useState(false);
    const [openRich, setOpenRich] = useState(false);
    const [diets, setDiets] = useState(['Vegan']);
    return (
        <div className="flex max-w-md flex-col gap-10">
            <FormItem>
                <FormLabel htmlFor="mg-1">Account Number</FormLabel>
                <FormInputMessageGroup>
                    <Input id="mg-1" placeholder="Enter 10-digit account number" state="information" />
                    <FormMessage type="information">
                        Your account number is shown on your monthly statement or in the mobile app under Account
                        Settings.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mg-2">Password Requirements</FormLabel>
                <FormInputMessageGroup placement="bottom" triggers={[]} open={open} onOpenChange={setOpen}>
                    <InputGroup
                        inputId="mg-2"
                        state="information"
                        button
                        addOnText="Show Requirements"
                        onAddOnButtonClick={() => setOpen(!open)}
                    />
                    <FormMessage type="information">
                        Password must contain at least 8 characters, including one uppercase letter, one lowercase
                        letter, one number, and one special character.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mg-3">Country Code</FormLabel>
                <FormInputMessageGroup
                    placement="bottom"
                    triggers={['mouseenter', 'mouseleave', 'focusin', 'focusout']}
                >
                    <InputGroup
                        inputId="mg-3"
                        glyph="world"
                        glyphAriaLabel="Select country code"
                        state="information"
                        button
                    />
                    <FormMessage type="information">
                        Select your country code from the list. This determines your tax jurisdiction and available
                        payment methods.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mg-4">Additional Comments</FormLabel>
                <FormInputMessageGroup placement="bottom">
                    <Textarea
                        id="mg-4"
                        state="information"
                        placeholder="Provide any additional details about your request"
                    />
                    <FormMessage type="information">
                        Please include any relevant context or special requirements. This helps our team process your
                        request more efficiently.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mg-5">Dietary Restrictions</FormLabel>
                <FormInputMessageGroup triggers={['mouseover', 'mouseout']}>
                    <MultiInput
                        inputId="mg-5"
                        placeholder="Select all that apply"
                        state="information"
                        dropdownValues={DIETS}
                        selected={diets}
                        onSelectedChange={setDiets}
                    />
                    <FormMessage type="information">
                        Select all dietary restrictions that apply. This information will be shared with catering for
                        company events.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mg-6">Budget Approval Code</FormLabel>
                <FormInputMessageGroup placement="bottom" triggers={[]} open={openRich} onOpenChange={setOpenRich}>
                    <InputGroup
                        inputId="mg-6"
                        state="information"
                        button
                        addOnText="Where to Find"
                        onAddOnButtonClick={() => setOpenRich(!openRich)}
                    />
                    <FormMessage type="information">
                        <div>
                            Your approval code is sent via email when your budget request is approved. Check your inbox
                            for messages with subject line starting with <code>[Budget Approved]</code>.
                        </div>
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
        </div>
    );
}

export const MessageGroup: Story = {
    name: 'Message group',
    parameters: {
        docs: {
            description: {
                story:
                    'A form input message group shows the message of a field in a popover: on focus by default, on ' +
                    'hover, or controlled with `open` and no triggers (here from an input group button). It works ' +
                    'with inputs, input groups, textareas and multi inputs, and the message can hold rich content.'
            }
        }
    },
    render: () => <MessageGroupDemo />
};

export const MessageStates: Story = {
    name: 'Message states',
    render: () => (
        <div className="flex max-w-md flex-col gap-10">
            <FormItem>
                <FormLabel htmlFor="ms-info">Employee ID</FormLabel>
                <FormInputMessageGroup>
                    <Input id="ms-info" placeholder="e.g., EMP12345" state="information" />
                    <FormMessage type="information">
                        Your employee ID can be found on your company badge or ID card.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ms-warning">Cost Center</FormLabel>
                <FormInputMessageGroup>
                    <Input id="ms-warning" placeholder="e.g., CC-1000" state="warning" />
                    <FormMessage type="warning">
                        This cost center will be retired next quarter. Please check{' '}
                        <Link href="#">Available Cost Centers</Link>.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ms-error">Email Address</FormLabel>
                <FormInputMessageGroup>
                    <Input id="ms-error" placeholder="your.name@company.com" state="error" />
                    <FormMessage type="error">
                        Please enter a valid email address in the format <b>name@domain.com</b>.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ms-success">Username</FormLabel>
                <FormInputMessageGroup>
                    <Input id="ms-success" placeholder="Choose a unique username" state="success" />
                    <FormMessage type="success">
                        Great! This username is available and meets all requirements.
                    </FormMessage>
                </FormInputMessageGroup>
            </FormItem>
        </div>
    )
};

/** Waits until a shown message popover holds the given text. */
async function waitForMessage(text: string): Promise<void> {
    await waitFor(() =>
        expect(
            [...document.querySelectorAll<HTMLElement>('[data-slot="form-message"]')].some(
                (m) => m.checkVisibility() && m.textContent!.includes(text)
            )
        ).toBe(true)
    );
}

/** Focuses the first field so axe checks the open message popover. */
export const OpenMessageGroup: Story = {
    name: 'Open: message group',
    tags: ['!autodocs'],
    render: () => <MessageGroupDemo />,
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector<HTMLInputElement>('#mg-1')!);
        await waitForMessage('monthly statement');
    }
};

/** Opens the controlled message with rich content from its button. */
export const OpenRichMessage: Story = {
    name: 'Open: rich message',
    tags: ['!autodocs'],
    render: () => <MessageGroupDemo />,
    play: async ({ canvasElement }) => {
        const row = canvasElement.querySelector<HTMLInputElement>('#mg-6')!.parentElement!;
        await userEvent.click(row.querySelector<HTMLButtonElement>('button')!);
        await waitForMessage('Budget Approved');
    }
};

/** Focuses the warning field so axe checks an open message with a link in it. */
export const OpenMessageStates: Story = {
    name: 'Open: message states',
    tags: ['!autodocs'],
    render: MessageStates.render,
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector<HTMLInputElement>('#ms-warning')!);
        await waitForMessage('Available Cost Centers');
    }
};
