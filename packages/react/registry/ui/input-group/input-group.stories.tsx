import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';
import type { FormState } from '@/ui/input/input';
import { InputGroup, InputGroupAddon, InputGroupInput, type InputGroupValue } from './input-group';

/** Plain label until the form component is ported (form label with colon, required and inline help). */
function Label({
    htmlFor,
    id,
    required,
    children
}: {
    htmlFor: string;
    id?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label
            htmlFor={htmlFor}
            id={id}
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

const COLUMN = 'flex flex-col gap-4';
const ITEM = 'flex flex-col';
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
            <div className={ITEM}>
                <Label htmlFor="ig-text-1" required>
                    Left Aligned Text Add-on
                </Label>
                <InputGroup
                    inputId="ig-text-1"
                    addOnText="$"
                    placement="before"
                    required
                    placeholder="Placeholder"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-text-2">Right Aligned Text Add-on</Label>
                <InputGroup inputId="ig-text-2" addOnText="€" placeholder="Placeholder" defaultValue="100" />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-text-3">Left and Right Aligned Text Add-ons</Label>
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
            </div>
            <div className={ITEM}>
                <InputGroup addOnText="$" placeholder="Amount" aria-label="Right Aligned Text Add-on (aria-label)" />
            </div>
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
            <div className={ITEM}>
                <Label htmlFor="ig-icon-1">Input with icon on the left</Label>
                <InputGroup
                    inputId="ig-icon-1"
                    placement="before"
                    glyph="employee"
                    glyphAriaLabel="Employee"
                    placeholder="Name"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-icon-2">Input with icon on the right</Label>
                <InputGroup inputId="ig-icon-2" glyph="hide" glyphAriaLabel="Hide" placeholder="Enter content" />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-icon-3">Icon addon from parts</Label>
                <InputGroup>
                    <InputGroupAddon>
                        <Icon glyph="globe" aria-label="Globe" />
                    </InputGroupAddon>
                    <InputGroupInput id="ig-icon-3" placeholder="Type text here" />
                </InputGroup>
            </div>
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
            <div className={ITEM}>
                <Label htmlFor="ig-button-1">Input with text add-on</Label>
                <InputGroup
                    inputId="ig-button-1"
                    addOnText="Submit"
                    button
                    placeholder="Placeholder"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-button-2">Input with icon action</Label>
                <InputGroup
                    inputId="ig-button-2"
                    glyph="navigation-down-arrow"
                    glyphAriaLabel="Show options"
                    button
                    placeholder="Placeholder"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-button-3">Input with 2 icon actions</Label>
                <InputGroup>
                    <InputGroupInput id="ig-button-3" placeholder="Placeholder" defaultValue="100" />
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="decline" aria-label="Clear input" />
                    </InputGroupAddon>
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="search" aria-label="Search value" />
                    </InputGroupAddon>
                </InputGroup>
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-button-4">Input with text action on left</Label>
                <InputGroup
                    inputId="ig-button-4"
                    addOnText="Action"
                    button
                    placement="before"
                    placeholder="Placeholder"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-button-5">Left Aligned Icon Button Add-on</Label>
                <InputGroup
                    inputId="ig-button-5"
                    placement="before"
                    glyph="cart"
                    glyphAriaLabel="Add to Cart"
                    placeholder="Amount"
                    button
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-button-6">Button that keeps the focus in the input</Label>
                <InputGroup
                    inputId="ig-button-6"
                    glyph="value-help"
                    glyphAriaLabel="Value help"
                    placeholder="Value"
                    button
                    buttonFocusable={false}
                />
            </div>
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
            <div className={ITEM}>
                <Label htmlFor="ig-complex-1" id="ig-complex-label-1">
                    Input Group with complex button addon
                </Label>
                <InputGroup>
                    <InputGroupInput id="ig-complex-1" />
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="calendar" aria-label="Calendar" title="Calendar" />
                    </InputGroupAddon>
                </InputGroup>
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-complex-2">Input Group with complex span addon</Label>
                <InputGroup>
                    <InputGroupInput id="ig-complex-2" aria-describedby="ig-complex-addon-2" />
                    <InputGroupAddon id="ig-complex-addon-2">Addon</InputGroupAddon>
                </InputGroup>
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-complex-3">Addons on both sides</Label>
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
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-complex-4">Disabled</Label>
                <InputGroup disabled>
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="navigation-down-arrow" aria-label="Open menu" disabled />
                    </InputGroupAddon>
                    <InputGroupInput id="ig-complex-4" />
                </InputGroup>
            </div>
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
            <div className={ITEM}>
                <Label htmlFor="ig-textarea">Notes</Label>
                <InputGroup>
                    <InputGroupInput id="ig-textarea" render={<textarea rows={3} />} defaultValue="Default" />
                    <InputGroupAddon>
                        <Icon glyph="hide" aria-label="Hide" />
                    </InputGroupAddon>
                </InputGroup>
            </div>
        </div>
    )
};

export const States: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Value states colour the whole group and its button; only `error` sets `aria-invalid`. Read-only ' +
                    'groups show a dotted line; disabled groups are dimmed. The state messages follow with the form component.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <div className={ITEM}>
                <Label htmlFor="ig-state-success">Success</Label>
                <InputGroup
                    inputId="ig-state-success"
                    state="success"
                    addOnText="$"
                    placement="before"
                    placeholder="Enter amount"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-state-error">Error</Label>
                <InputGroup
                    inputId="ig-state-error"
                    state="error"
                    glyph="hide"
                    glyphAriaLabel="Hide"
                    placeholder="Enter value"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-state-warning">Warning</Label>
                <InputGroup
                    inputId="ig-state-warning"
                    state="warning"
                    addOnText="$"
                    placement="before"
                    placeholder="Enter value"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-state-information">Information</Label>
                <InputGroup
                    inputId="ig-state-information"
                    state="information"
                    addOnText="Button"
                    button
                    placeholder="Enter info"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-state-disabled">Disabled</Label>
                <InputGroup
                    inputId="ig-state-disabled"
                    disabled
                    addOnText="$"
                    placement="before"
                    placeholder="Disabled input"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-state-readonly">Read-Only</Label>
                <InputGroup
                    inputId="ig-state-readonly"
                    readOnly
                    addOnText="Button"
                    button
                    placeholder="Read-only value"
                    defaultValue="100"
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-state-disabled-button">Disabled with button</Label>
                <InputGroup
                    inputId="ig-state-disabled-button"
                    glyph="search"
                    glyphAriaLabel="Search"
                    button
                    disabled
                    placeholder="Search"
                />
            </div>
            {(['information', 'success', 'warning', 'error'] as const).map((state, i) => (
                <div key={state} className={ITEM}>
                    <Label htmlFor={`ig-state-button-${state}`}>
                        {['Discount Code', 'Invitation Code', 'Account Number', 'License Key'][i]}
                    </Label>
                    <InputGroup
                        inputId={`ig-state-button-${state}`}
                        state={state}
                        addOnText={['Apply', 'Verify', 'Check', 'Activate'][i]}
                        button
                        placeholder={
                            ['Enter promo code', '8-digit code', '10-digit account number', 'XXXX-XXXX-XXXX-XXXX'][i]
                        }
                    />
                </div>
            ))}
        </div>
    )
};

/** A group with the focus in its input, as fundamental-styles' Focus story; one story per value state. */
const focusStory = (state: FormState): Story => ({
    name: `Focus: ${state}`,
    tags: ['!autodocs'],
    render: () => (
        <div className={ITEM}>
            <Label htmlFor="ig-focus">Focus</Label>
            <InputGroup
                inputId="ig-focus"
                state={state}
                defaultValue="100"
                placeholder="Placeholder"
                {...(state === 'default'
                    ? { addOnText: '$', placement: 'before' as const }
                    : { glyph: 'hide', glyphAriaLabel: 'Hide' })}
            />
        </div>
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
            <div className={ITEM}>
                <Label htmlFor="ig-compact-1">Compact size</Label>
                <InputGroup inputId="ig-compact-1" addOnText="$" placement="before" placeholder="Amount" />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-compact-2">Compact size button</Label>
                <InputGroup
                    inputId="ig-compact-2"
                    glyph="cart"
                    glyphAriaLabel="Add to cart"
                    placeholder="Amount"
                    button
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="ig-compact-3">Select</Label>
                <InputGroup>
                    <InputGroupAddon button>
                        <Button variant="transparent" glyph="navigation-down-arrow" aria-label="Open menu" />
                    </InputGroupAddon>
                    <InputGroupInput id="ig-compact-3" />
                </InputGroup>
            </div>
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
                <div className={ITEM}>
                    <Label htmlFor="ig-form-1">Disabled Input</Label>
                    <InputGroup
                        inputId="ig-form-1"
                        glyph="decline"
                        glyphAriaLabel="Clear"
                        placeholder="Search"
                        button
                        disabled
                        value="Disabled"
                    />
                </div>
                <p className={TEXT}>Disabled Input Value: Disabled</p>
                <div className={ITEM}>
                    <Label htmlFor="ig-form-2">Enabled Input (Type Text)</Label>
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
                </div>
                <p className={TEXT}>
                    Value: {String(text)} ({typeof text}), touched: {String(touched.text)}, dirty: {String(dirty.text)}
                </p>
                <div className={ITEM}>
                    <Label htmlFor="ig-form-3">Enabled Input (Type Number)</Label>
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
                </div>
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
                <div className={ITEM}>
                    <Label htmlFor="ig-search-1">Search input</Label>
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
                </div>
                <p className={TEXT}>Search term: {term}</p>
                <div className={`${ITEM} mt-4`}>
                    <Label htmlFor="ig-search-2">Search input with search type</Label>
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
                </div>
                <p className={TEXT}>
                    Search term: {second}, searched for: {searched}
                </p>
            </div>
        );
    }
};
