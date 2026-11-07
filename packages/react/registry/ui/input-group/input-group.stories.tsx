import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { FormItem, FormLabel } from '@/ui/form/form';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage } from '@/ui/form/form-message';
import { Icon } from '@/ui/icon/icon';
import type { FormState } from '@/ui/input/input';
import { Link } from '@/ui/link/link';
import { InputGroup, InputGroupAddon, InputGroupInput, type InputGroupValue } from './input-group';

const COLUMN = 'flex flex-col gap-4';
const TEXT = 'm-0 font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

const meta = {
    title: 'Components/Input Group',
    component: InputGroup,
    subcomponents: { InputGroupInput, InputGroupAddon },
    parameters: {
        docs: {
            description: {
                component:
                    'An input with text, icon or button addons before or after it. With its own input the group takes ' +
                    '`value`/`onValueChange` (numbers for `type="number"`) and works inside a Base UI `Field`; compose ' +
                    '`InputGroupInput` and `InputGroupAddon` for other layouts. A text or icon addon describes the input; ' +
                    'a button addon needs an accessible name. Compact density is `data-density="compact"` on the group ' +
                    'or an ancestor.\n\n' +
                    '```tsx\n' +
                    '<InputGroup addOnText="$" placement="before" placeholder="Amount" aria-label="Amount" />\n' +
                    '<InputGroup glyph="decline" glyphAriaLabel="Clear" button onAddOnButtonClick={clear} />\n' +
                    '<InputGroup>\n' +
                    '    <InputGroupInput aria-label="Date" />\n' +
                    '    <InputGroupAddon button>\n' +
                    '        <Button variant="transparent" glyph="calendar" aria-label="Calendar" />\n' +
                    '    </InputGroupAddon>\n' +
                    '</InputGroup>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        placement: { control: 'inline-radio', options: ['before', 'after'] },
        state: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] }
    },
    args: {
        placement: 'after',
        addOnText: '$',
        placeholder: 'Amount',
        'aria-label': 'Amount',
        button: false,
        disabled: false,
        readOnly: false,
        inline: false,
        state: 'default'
    }
} satisfies Meta<typeof InputGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <div className="max-w-96">
            <InputGroup {...args} />
        </div>
    )
};

export const TextAddon: Story = {
    name: 'Text addon',
    parameters: {
        docs: {
            description: {
                story: 'The text addon (e.g. a currency or unit) describes the input (`aria-describedby`). Addons on both sides are composed from parts.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="ig-text-1" required>
                    Left Aligned Text Add-on
                </FormLabel>
                <InputGroup
                    inputId="ig-text-1"
                    addOnText="$"
                    placement="before"
                    required
                    placeholder="Placeholder"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-text-2">Right Aligned Text Add-on</FormLabel>
                <InputGroup inputId="ig-text-2" addOnText="€" placeholder="Placeholder" defaultValue="100" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-text-3">Left and Right Aligned Text Add-ons</FormLabel>
                <InputGroup>
                    <InputGroupAddon id="ig-text-3-before">$</InputGroupAddon>
                    <InputGroupInput
                        id="ig-text-3"
                        placeholder="Placeholder"
                        defaultValue="65"
                        aria-describedby="ig-text-3-before ig-text-3-after"
                    />
                    <InputGroupAddon id="ig-text-3-after">.00</InputGroupAddon>
                </InputGroup>
            </FormItem>
            <FormItem>
                <InputGroup addOnText="$" placeholder="Amount" aria-label="Right Aligned Text Add-on (aria-label)" />
            </FormItem>
        </div>
    )
};

export const IconAddon: Story = {
    name: 'Icon addon',
    parameters: {
        docs: { description: { story: 'The icon is named by `glyphAriaLabel` (or its glyph name).' } }
    },
    render: () => (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="ig-icon-1">Input with icon on the left</FormLabel>
                <InputGroup
                    inputId="ig-icon-1"
                    placement="before"
                    glyph="employee"
                    glyphAriaLabel="Employee"
                    placeholder="Name"
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-icon-2">Input with icon on the right</FormLabel>
                <InputGroup inputId="ig-icon-2" glyph="hide" glyphAriaLabel="Hide" placeholder="Enter content" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-icon-3">Icon addon from parts</FormLabel>
                <InputGroup>
                    <InputGroupAddon>
                        <Icon glyph="globe" aria-label="Globe" />
                    </InputGroupAddon>
                    <InputGroupInput id="ig-icon-3" placeholder="Type text here" />
                </InputGroup>
            </FormItem>
        </div>
    )
};

export const ButtonAddon: Story = {
    name: 'Button addon',
    parameters: {
        docs: {
            description: {
                story:
                    'A button addon calls `onAddOnButtonClick` and controls the input (`aria-controls`). With ' +
                    '`buttonFocusable={false}` it leaves the tab order and clicks keep the focus in the input.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="ig-button-1">Input with text add-on</FormLabel>
                <InputGroup
                    inputId="ig-button-1"
                    addOnText="Submit"
                    button
                    placeholder="Placeholder"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-button-2">Input with icon action</FormLabel>
                <InputGroup
                    inputId="ig-button-2"
                    glyph="navigation-down-arrow"
                    glyphAriaLabel="Show options"
                    button
                    placeholder="Placeholder"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-button-3">Input with 2 icon actions</FormLabel>
                <InputGroup>
                    <InputGroupInput id="ig-button-3" placeholder="Placeholder" defaultValue="100" />
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="decline" aria-label="Clear input" />
                    </InputGroupAddon>
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="search" aria-label="Search value" />
                    </InputGroupAddon>
                </InputGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-button-4">Input with text action on left</FormLabel>
                <InputGroup
                    inputId="ig-button-4"
                    addOnText="Action"
                    button
                    placement="before"
                    placeholder="Placeholder"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-button-5">Left Aligned Icon Button Add-on</FormLabel>
                <InputGroup
                    inputId="ig-button-5"
                    placement="before"
                    glyph="cart"
                    glyphAriaLabel="Add to Cart"
                    placeholder="Amount"
                    button
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-button-6">Button that keeps the focus in the input</FormLabel>
                <InputGroup
                    inputId="ig-button-6"
                    glyph="value-help"
                    glyphAriaLabel="Value help"
                    placeholder="Value"
                    button
                    buttonFocusable={false}
                />
            </FormItem>
        </div>
    )
};

export const ProjectedParts: Story = {
    name: 'Projected parts',
    parameters: {
        docs: {
            description: {
                story:
                    '`InputGroupInput` and `InputGroupAddon` for layouts the generated parts do not cover. A ' +
                    'transparent `Button` in a button addon takes the look of a field button; the group passes ' +
                    '`disabled` and `readOnly` to its `InputGroupInput`.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="ig-complex-1" id="ig-complex-label-1">
                    Input Group with complex button addon
                </FormLabel>
                <InputGroup>
                    <InputGroupInput id="ig-complex-1" />
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="calendar" aria-label="Calendar" title="Calendar" />
                    </InputGroupAddon>
                </InputGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-complex-2">Input Group with complex span addon</FormLabel>
                <InputGroup>
                    <InputGroupInput id="ig-complex-2" aria-describedby="ig-complex-addon-2" />
                    <InputGroupAddon id="ig-complex-addon-2">Addon</InputGroupAddon>
                </InputGroup>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-complex-3">Addons on both sides</FormLabel>
                <InputGroup>
                    <InputGroupAddon id="ig-complex-addon-3a">https://</InputGroupAddon>
                    <InputGroupInput
                        id="ig-complex-3"
                        placeholder="example"
                        aria-describedby="ig-complex-addon-3a ig-complex-addon-3b"
                    />
                    <InputGroupAddon id="ig-complex-addon-3b">.com</InputGroupAddon>
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="decline" aria-label="Clear" />
                    </InputGroupAddon>
                </InputGroup>
            </FormItem>
            <FormItem>
                <FormLabel disabled htmlFor="ig-complex-4">
                    Disabled
                </FormLabel>
                <InputGroup disabled>
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="navigation-down-arrow" aria-label="Open menu" disabled />
                    </InputGroupAddon>
                    <InputGroupInput id="ig-complex-4" />
                </InputGroup>
            </FormItem>
        </div>
    )
};

export const TextArea: Story = {
    name: 'Text area',
    parameters: {
        docs: {
            description: {
                story: '`InputGroupInput` with `render={<textarea />}`: the group grows with its rows.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="ig-textarea">Notes</FormLabel>
                <InputGroup>
                    <InputGroupInput id="ig-textarea" render={<textarea rows={3} />} defaultValue="Default" />
                    <InputGroupAddon>
                        <Icon glyph="hide" aria-label="Hide" />
                    </InputGroupAddon>
                </InputGroup>
            </FormItem>
        </div>
    )
};

/** Angular's value state groups with buttons, and their messages. */
const STATE_GROUPS: {
    state: Exclude<FormState, 'default'>;
    label: string;
    addOnText: string;
    placeholder: string;
    message: ReactNode;
}[] = [
    {
        state: 'information',
        label: 'Discount Code',
        addOnText: 'Apply',
        placeholder: 'Enter promo code',
        message: (
            <>
                Use code <code>WELCOME20</code> for 20% off your first order. Valid until end of month.
            </>
        )
    },
    {
        state: 'success',
        label: 'Invitation Code',
        addOnText: 'Verify',
        placeholder: '8-digit code',
        message: 'Code verified successfully. You can now access the conference portal.'
    },
    {
        state: 'warning',
        label: 'Account Number',
        addOnText: 'Check',
        placeholder: '10-digit account number',
        message: (
            <>
                This account number matches a <b>closed account</b>. Verify the number or contact{' '}
                <Link href="#">support</Link>.
            </>
        )
    },
    {
        state: 'error',
        label: 'License Key',
        addOnText: 'Activate',
        placeholder: 'XXXX-XXXX-XXXX-XXXX',
        message: 'Invalid license key format. Keys must be 16 characters (letters and numbers) separated by dashes.'
    }
];

/** The States story, shared with its open variant. */
function StatesDemo() {
    return (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="ig-state-success">Success</FormLabel>
                <InputGroup
                    inputId="ig-state-success"
                    state="success"
                    addOnText="$"
                    placement="before"
                    placeholder="Enter amount"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-state-error">Error</FormLabel>
                <InputGroup
                    inputId="ig-state-error"
                    state="error"
                    glyph="hide"
                    glyphAriaLabel="Hide"
                    placeholder="Enter value"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-state-warning">Warning</FormLabel>
                <InputGroup
                    inputId="ig-state-warning"
                    state="warning"
                    addOnText="$"
                    placement="before"
                    placeholder="Enter value"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-state-information">Information</FormLabel>
                <InputGroup
                    inputId="ig-state-information"
                    state="information"
                    addOnText="Button"
                    button
                    placeholder="Enter info"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel disabled htmlFor="ig-state-disabled">
                    Disabled
                </FormLabel>
                <InputGroup
                    inputId="ig-state-disabled"
                    disabled
                    addOnText="$"
                    placement="before"
                    placeholder="Disabled input"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-state-readonly">Read-Only</FormLabel>
                <InputGroup
                    inputId="ig-state-readonly"
                    readOnly
                    addOnText="Button"
                    button
                    placeholder="Read-only value"
                    defaultValue="100"
                />
            </FormItem>
            <FormItem>
                <FormLabel disabled htmlFor="ig-state-disabled-button">
                    Disabled with button
                </FormLabel>
                <InputGroup
                    inputId="ig-state-disabled-button"
                    glyph="search"
                    glyphAriaLabel="Search"
                    button
                    disabled
                    placeholder="Search"
                />
            </FormItem>
            {STATE_GROUPS.map(({ state, label, addOnText, placeholder, message }) => (
                <FormItem key={state}>
                    <FormLabel htmlFor={`ig-state-button-${state}`}>{label}</FormLabel>
                    <FormInputMessageGroup>
                        <InputGroup
                            inputId={`ig-state-button-${state}`}
                            state={state}
                            addOnText={addOnText}
                            button
                            placeholder={placeholder}
                        />
                        <FormMessage type={state}>{message}</FormMessage>
                    </FormInputMessageGroup>
                </FormItem>
            ))}
        </div>
    );
}

export const States: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Value states colour the whole group and its button; only `error` sets `aria-invalid`. Read-only ' +
                    'groups show a dotted line; disabled groups are dimmed. In a `FormInputMessageGroup` with a ' +
                    '`FormMessage`, the groups with buttons show their value state message while the focus is in them.'
            }
        }
    },
    render: () => <StatesDemo />
};

/** Focuses the error group so its value state message opens and axe checks it. */
export const OpenStates: Story = {
    name: 'Open: states',
    tags: ['!autodocs'],
    render: () => <StatesDemo />,
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector<HTMLInputElement>('#ig-state-button-error')!);
        await waitFor(() =>
            expect(
                [...document.querySelectorAll<HTMLElement>('[data-slot="form-message"]')].some(
                    (m) => m.checkVisibility() && m.textContent!.includes('license key')
                )
            ).toBe(true)
        );
    }
};

/** A group with the focus in its input, as fundamental-styles' Focus story; one story per value state. */
const focusStory = (state: FormState): Story => ({
    name: `Focus: ${state}`,
    tags: ['!autodocs'],
    render: () => (
        <FormItem>
            <FormLabel htmlFor="ig-focus">Focus</FormLabel>
            <InputGroup
                inputId="ig-focus"
                state={state}
                defaultValue="100"
                placeholder="Placeholder"
                {...(state === 'default'
                    ? { addOnText: '$', placement: 'before' as const }
                    : { glyph: 'hide', glyphAriaLabel: 'Hide' })}
            />
        </FormItem>
    ),
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector<HTMLInputElement>('#ig-focus')!;
        input.focus();
        await expect(input).toHaveFocus();
    }
});

export const FocusDefault = focusStory('default');
export const FocusSuccess = focusStory('success');
export const FocusError = focusStory('error');
export const FocusWarning = focusStory('warning');
export const FocusInformation = focusStory('information');

export const Compact: Story = {
    render: () => (
        <div className={COLUMN} data-density="compact">
            <FormItem>
                <FormLabel htmlFor="ig-compact-1">Compact size</FormLabel>
                <InputGroup inputId="ig-compact-1" addOnText="$" placement="before" placeholder="Amount" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-compact-2">Compact size button</FormLabel>
                <InputGroup
                    inputId="ig-compact-2"
                    glyph="cart"
                    glyphAriaLabel="Add to cart"
                    placeholder="Amount"
                    button
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="ig-compact-3">Select</FormLabel>
                <InputGroup>
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="navigation-down-arrow" aria-label="Open menu" />
                    </InputGroupAddon>
                    <InputGroupInput id="ig-compact-3" />
                </InputGroup>
            </FormItem>
        </div>
    )
};

export const Inline: Story = {
    render: () => (
        <p className="m-0 font-sap-font-family text-sap-font-size text-sap-text-color">
            Pay <InputGroup inline addOnText="EUR" placeholder="0.00" aria-label="Amount" className="w-48" /> by the end
            of the month.
        </p>
    )
};

export const Controlled: Story = {
    parameters: {
        docs: {
            description: {
                story: '`value` with `onValueChange`, the React form of Angular’s reactive forms example: `type="number"` reports numbers (`null` when empty).'
            }
        }
    },
    render: function Render() {
        const [text, setText] = useState<InputGroupValue>('Text');
        const [number, setNumber] = useState<InputGroupValue>(42);
        const [touched, setTouched] = useState({ text: false, number: false });
        const [dirty, setDirty] = useState({ text: false, number: false });
        return (
            <div className={COLUMN}>
                <FormItem>
                    <FormLabel disabled htmlFor="ig-form-1">
                        Disabled Input
                    </FormLabel>
                    <InputGroup
                        inputId="ig-form-1"
                        glyph="decline"
                        glyphAriaLabel="Clear"
                        placeholder="Search"
                        button
                        disabled
                        value="Disabled"
                    />
                </FormItem>
                <p className={TEXT}>Disabled Input Value: Disabled</p>
                <FormItem>
                    <FormLabel htmlFor="ig-form-2">Enabled Input (Type Text)</FormLabel>
                    <InputGroup
                        inputId="ig-form-2"
                        placeholder="Enter text"
                        value={text}
                        onValueChange={(value) => {
                            setText(value);
                            setDirty((d) => ({ ...d, text: true }));
                        }}
                        onBlur={() => setTouched((t) => ({ ...t, text: true }))}
                    />
                </FormItem>
                <p className={TEXT}>
                    Value: {String(text)} ({typeof text}), touched: {String(touched.text)}, dirty: {String(dirty.text)}
                </p>
                <FormItem>
                    <FormLabel htmlFor="ig-form-3">Enabled Input (Type Number)</FormLabel>
                    <InputGroup
                        inputId="ig-form-3"
                        type="number"
                        placeholder="Enter a number"
                        value={number}
                        onValueChange={(value) => {
                            setNumber(value);
                            setDirty((d) => ({ ...d, number: true }));
                        }}
                        onBlur={() => setTouched((t) => ({ ...t, number: true }))}
                    />
                </FormItem>
                <p className={TEXT}>
                    Value: {String(number)} ({typeof number}), touched: {String(touched.number)}, dirty:{' '}
                    {String(dirty.number)}
                </p>
            </div>
        );
    }
};

export const Search: Story = {
    parameters: {
        docs: {
            description: {
                story: '`onSearch` is the native `search` event of a `type="search"` input (Enter).'
            }
        }
    },
    render: function Render() {
        const [term, setTerm] = useState<InputGroupValue>('Fiori');
        const [second, setSecond] = useState<InputGroupValue>('');
        const [searched, setSearched] = useState<InputGroupValue>('');
        return (
            <div className="flex max-w-96 flex-col gap-2">
                <FormItem>
                    <FormLabel htmlFor="ig-search-1">Search input</FormLabel>
                    <InputGroup
                        inputId="ig-search-1"
                        glyph="decline"
                        glyphAriaLabel="Clear"
                        placeholder="Search"
                        button
                        value={term}
                        onValueChange={setTerm}
                        onAddOnButtonClick={() => setTerm('')}
                    />
                </FormItem>
                <p className={TEXT}>Search term: {term}</p>
                <FormItem className="mt-4">
                    <FormLabel htmlFor="ig-search-2">Search input with search type</FormLabel>
                    <InputGroup
                        inputId="ig-search-2"
                        type="search"
                        glyph="search"
                        glyphAriaLabel="Search"
                        placeholder="Search"
                        button
                        value={second}
                        onValueChange={setSecond}
                        onSearch={() => setSearched(second)}
                        onAddOnButtonClick={() => setSearched(second)}
                    />
                </FormItem>
                <p className={TEXT}>
                    Search term: {second}, searched for: {searched}
                </p>
            </div>
        );
    }
};
