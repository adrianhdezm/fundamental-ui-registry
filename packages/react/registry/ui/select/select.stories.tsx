import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { FormItem, FormLabel } from '@/ui/form/form';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage } from '@/ui/form/form-message';
import { Icon } from '@/ui/icon/icon';
import { ListGroupHeader, ListIcon, ListSecondary, ListTitle } from '@/ui/list/list';
import { Select, SelectOption, type SelectProps } from './select';

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Dragon fruit', 'Elderberry', 'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon'];
/** fundamental-react's options. */
const ITEMS = [
    { key: '1', text: 'List Item 1' },
    { key: '2', text: 'List Item 2' },
    { key: '3', text: 'List Item 3' },
    { key: '4', text: 'List Item 4' }
];
/** fundamental-styles' notebooks (Disabled and Read-only stories). */
const NOTEBOOKS = [
    { name: 'Notebook Basic 1', price: '1000 EUR' },
    { name: 'Notebook Basic 2', price: '1400 EUR' },
    { name: 'Notebook Basic 3', price: '700 EUR' },
    { name: 'Notebook Basic 4', price: '12000 EUR' },
    { name: 'Notebook Basic 5', price: '40 EUR' }
];

const TEXT = 'm-0 mt-1 block font-sap-font-family text-sap-font-small-size text-sap-content-label-color';
const HEADING = 'm-0 mt-6 mb-1 font-sap-font-header-family text-sap-font-header6-size text-sap-group-title-text-color';
const COLUMN = 'flex flex-col gap-6';

const fruitOptions = (fruits: readonly string[], disabled?: string) =>
    fruits.map((fruit) => (
        <SelectOption key={fruit} value={fruit} disabled={fruit === disabled}>
            {fruit}
        </SelectOption>
    ));

const itemOptions = () =>
    ITEMS.map((item) => (
        <SelectOption key={item.key} value={item.key}>
            {item.text}
        </SelectOption>
    ));

const notebookOptions = () =>
    NOTEBOOKS.map((item) => (
        <SelectOption key={item.name} value={item.name}>
            <ListTitle>{item.name}</ListTitle>
            <ListSecondary>{item.price}</ListSecondary>
        </SelectOption>
    ));

/** A select with its value in state, the value printed below it. */
function Stateful<T>({
    initial = null,
    children,
    print = (value: T | null) => String(value ?? ''),
    ...props
}: Omit<SelectProps<T>, 'value' | 'defaultValue'> & { initial?: T | null; print?: (value: T | null) => string }) {
    const [value, setValue] = useState<T | null>(initial);
    return (
        <>
            <Select<T> {...props} value={value} onValueChange={setValue}>
                {children}
            </Select>
            <small className={TEXT}>Selected value: {print(value)}</small>
        </>
    );
}

const meta = {
    title: 'Components/Select',
    component: Select,
    parameters: {
        docs: {
            description: {
                component:
                    "A field that opens a list of options, on Base UI's Select. Closed, the arrow keys, Home, End and " +
                    'typing change the value directly, and Enter, Space, Alt+Down, F4 or a click open the list. Open, ' +
                    'the focus is on the highlighted option: Up, Down, Home, End and typing move it (disabled options ' +
                    'are skipped), Enter, Space or a click choose it, and Escape, Alt+Up or F4 close the list. Label ' +
                    'it with `aria-labelledby` (or `aria-label`). In mobile mode the list opens in a dialog. Compact ' +
                    'density is `data-density="compact"` on the select or an ancestor.\n\n' +
                    '```tsx\n' +
                    '<FormLabel id="fruit-label">Fruit</FormLabel>\n' +
                    '<Select aria-labelledby="fruit-label" placeholder="Select a fruit" value={fruit} onValueChange={setFruit}>\n' +
                    '    <SelectOption value="apple">Apple</SelectOption>\n' +
                    '    <SelectOption value="banana">Banana</SelectOption>\n' +
                    '</Select>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        state: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] },
        textOverflow: { control: 'inline-radio', options: ['ellipsis', 'full'] },
        fillControlMode: { control: 'select', options: ['at-least', 'equal', 'fit-content'] }
    },
    args: {
        placeholder: 'Select an option',
        'aria-label': 'Fruit',
        state: 'default',
        stateMessage: '',
        textOverflow: 'ellipsis',
        disabled: false,
        readOnly: false,
        required: false,
        inline: true,
        mobile: false,
        closeOnOutsideClick: true,
        fillControlMode: 'at-least'
    }
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    parameters: {
        docs: { description: { story: "Every option (fundamental-react's `dev` knobs); the chosen value is printed." } }
    },
    render: (args) => (
        <Stateful<string> {...(args as Omit<SelectProps<string>, 'value' | 'defaultValue'>)}>
            {fruitOptions(FRUITS)}
        </Stateful>
    )
};

export const Default: Story = {
    name: 'Default',
    parameters: {
        docs: {
            description: {
                story:
                    "fundamental-react's primary select and fundamental-styles' Default: a placeholder, and a selected " +
                    'item.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <div>
                <FormLabel id="select-default-label">Regular, Placeholder text</FormLabel>
                <Select aria-labelledby="select-default-label" placeholder="Select an option" id="select-default">
                    {itemOptions()}
                </Select>
            </div>
            <div>
                <FormLabel id="select-primary-label">Primary</FormLabel>
                <Select
                    aria-labelledby="select-primary-label"
                    placeholder="Select"
                    defaultValue="2"
                    id="select-primary"
                >
                    {itemOptions()}
                </Select>
            </div>
        </div>
    )
};

export const Modes: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Default, compact (`data-density="compact"` on an ancestor), disabled, read-only and full width ' +
                    '(`inline={false}`, with a disabled option).'
            }
        }
    },
    render: () => (
        <div>
            <h4 className={`${HEADING} mt-0`} id="sel-mode-1">
                Default select
            </h4>
            <Stateful<string> aria-labelledby="sel-mode-1" placeholder="Select an option">
                {fruitOptions(FRUITS)}
            </Stateful>

            <h4 className={HEADING} id="sel-mode-2">
                Compact select
            </h4>
            <div data-density="compact">
                <Stateful<string> aria-labelledby="sel-mode-2" placeholder="Select an option" initial="Banana">
                    {fruitOptions(FRUITS)}
                </Stateful>
            </div>

            <h4 className={HEADING} id="sel-mode-3">
                Select in disabled mode
            </h4>
            <Stateful<string> aria-labelledby="sel-mode-3" placeholder="Select an option" disabled initial="Cherry">
                {fruitOptions(FRUITS)}
            </Stateful>

            <h4 className={HEADING} id="sel-mode-4">
                Select in read-only mode
            </h4>
            <Stateful<string> aria-labelledby="sel-mode-4" placeholder="Select an option" readOnly initial="Kiwi">
                {fruitOptions(FRUITS)}
            </Stateful>

            <h4 className={HEADING} id="sel-mode-5">
                Full width
            </h4>
            <Stateful<string> aria-labelledby="sel-mode-5" placeholder="Select an option" inline={false}>
                {fruitOptions(FRUITS, 'Fig')}
            </Stateful>
        </div>
    )
};

export const Compact: Story = {
    parameters: {
        docs: {
            description: { story: 'fundamental-react\'s compact select: `data-density="compact"` on an ancestor.' }
        }
    },
    render: () => (
        <div data-density="compact">
            <Select aria-label="Compact" placeholder="Select" id="select-compact">
                {itemOptions()}
            </Select>
        </div>
    )
};

export const Disabled: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    "fundamental-react's disabled select (its placeholder is hidden) and fundamental-styles' Disabled: " +
                    'out of the tab order, the list does not open.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <div>
                <FormLabel id="select-disabled-label">Choose an option</FormLabel>
                <Select
                    aria-labelledby="select-disabled-label"
                    disabled
                    defaultValue="Notebook Basic 2"
                    id="select-disabled"
                >
                    {notebookOptions()}
                </Select>
            </div>
            <Select aria-label="Disabled" disabled placeholder="Select">
                {itemOptions()}
            </Select>
        </div>
    )
};

export const ReadOnly: Story = {
    name: 'Read-only',
    parameters: {
        docs: {
            description: {
                story:
                    "fundamental-react's read-only select and fundamental-styles' Read-only: no arrow, the list does " +
                    'not open.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <div>
                <FormLabel id="select-readonly-label">Choose an option</FormLabel>
                <Select
                    aria-labelledby="select-readonly-label"
                    readOnly
                    defaultValue="Notebook Basic 2"
                    id="select-readonly"
                >
                    {notebookOptions()}
                </Select>
            </div>
            <Select aria-label="readOnly" readOnly placeholder="Select" defaultValue="1">
                {itemOptions()}
            </Select>
        </div>
    )
};

const VALIDATION = [
    { state: 'error', placeholder: 'Error' },
    { state: 'warning', placeholder: 'Warning' },
    { state: 'success', placeholder: 'Success' },
    { state: 'information', placeholder: 'Information' }
] as const;

export const ValidationStates: Story = {
    name: 'Validation states',
    parameters: {
        docs: {
            description: {
                story:
                    "fundamental-react's validation states: `state` colours the field and `stateMessage` is shown " +
                    'above the options.'
            }
        }
    },
    render: () => (
        <div className="flex flex-wrap gap-4">
            {VALIDATION.map(({ state, placeholder }) => (
                <Select
                    key={state}
                    aria-label={`Select ${placeholder}`}
                    placeholder={placeholder}
                    state={state}
                    stateMessage="Test validation state"
                    id={`select-${state}`}
                >
                    {itemOptions()}
                </Select>
            ))}
        </div>
    )
};

const STATES = [
    {
        state: 'success',
        label: 'Success state (with visible long text)',
        short: 'Success message',
        message:
            'Success message. This is a longer success message to provide more detailed feedback about the selection. Make sure you selected the correct option and continue with the next steps.'
    },
    { state: 'warning', label: 'Warning state', short: 'Warning message', message: 'Warning message' },
    { state: 'error', label: 'Error state', short: 'Error message', message: 'Error message' },
    { state: 'information', label: 'Information state', short: 'Information message', message: 'Information message' }
] as const;

export const States: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Value states with a message in the list and a static form message below; the success select ' +
                    'is full width with a wrapped message (`textOverflow="full"`, `fillControlMode="equal"`). The ' +
                    'last one shows its form message on hover (`FormInputMessageGroup`).'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            {STATES.map((item) => (
                <FormItem key={item.state}>
                    <FormLabel id={`sel-state-${item.state}`}>{item.label}</FormLabel>
                    <Select
                        placeholder="Select value"
                        aria-labelledby={`sel-state-${item.state}`}
                        aria-describedby={`sel-state-msg-${item.state}`}
                        state={item.state}
                        stateMessage={item.message}
                        textOverflow={item.state === 'success' ? 'full' : 'ellipsis'}
                        fillControlMode={item.state === 'success' ? 'equal' : 'at-least'}
                        inline={item.state !== 'success'}
                    >
                        {fruitOptions(FRUITS.slice(0, 5))}
                    </Select>
                    <FormMessage static id={`sel-state-msg-${item.state}`} type={item.state}>
                        {item.short}
                    </FormMessage>
                </FormItem>
            ))}
            <FormItem>
                <FormLabel id="sel-state-hover">Form message with event triggers (hover)</FormLabel>
                <FormInputMessageGroup className="w-full" triggers={['mouseenter', 'mouseleave']}>
                    <Select
                        className="w-full"
                        placeholder="Select value"
                        aria-labelledby="sel-state-hover"
                        state="success"
                        stateMessage="Success message"
                        inline={false}
                    >
                        {fruitOptions(FRUITS.slice(0, 5))}
                    </Select>
                    <FormMessage type="success">Success message</FormMessage>
                </FormInputMessageGroup>
            </FormItem>
        </div>
    )
};

export const EmptyOption: Story = {
    name: 'Empty option',
    parameters: {
        docs: {
            description: {
                story:
                    "fundamental-react's `includeEmptyOption`: an option without a value (named with `aria-label`) " +
                    'clears the select.'
            }
        }
    },
    render: () => (
        <Stateful<string> aria-label="Select">
            <SelectOption aria-label="Select an option" label="">
                {' '}
            </SelectOption>
            {itemOptions()}
        </Stateful>
    )
};

interface Food {
    name: string;
    kCal: number;
}
const FOOD_FRUITS: Food[] = [
    { name: 'Apple', kCal: 52 },
    { name: 'Banana', kCal: 89 },
    { name: 'Pineapple', kCal: 50 }
];
const FOOD_VEGETABLES: Food[] = [
    { name: 'Broccoli', kCal: 34 },
    { name: 'Carrot', kCal: 41 },
    { name: 'Spinach', kCal: 23 }
];

function RichExample({ container }: { container?: HTMLElement | null }) {
    const [value, setValue] = useState<Food | null>(null);
    const group = (title: string, glyph: string, items: Food[]) => [
        <ListGroupHeader key={title} role="presentation">
            <ListTitle>{title}</ListTitle>
        </ListGroupHeader>,
        ...items.map((item) => (
            <SelectOption key={item.name} value={item}>
                <ListIcon glyph={glyph} />
                <ListTitle>{item.name}</ListTitle>
                <ListSecondary>{item.kCal} kcal</ListSecondary>
            </SelectOption>
        ))
    ];
    return (
        <>
            <FormLabel id="sel-rich">Food</FormLabel>
            <Select<Food>
                aria-labelledby="sel-rich"
                placeholder="Select an option"
                value={value}
                onValueChange={setValue}
                container={container}
                renderValue={(_text, selected) => (
                    <span className="inline-flex items-center gap-2">
                        <Icon glyph="action-settings" />
                        {selected?.value?.name || 'Select an option'}
                    </span>
                )}
            >
                {group('Fruits', 'nutrition-activity', FOOD_FRUITS)}
                {group('Vegetables', 'e-care', FOOD_VEGETABLES)}
            </Select>
            <small className={TEXT}>Selected value: {JSON.stringify(value)}</small>
        </>
    );
}

export const RichOptions: Story = {
    name: 'Groups, icons and custom trigger',
    parameters: {
        docs: {
            description: {
                story:
                    'Group headers (`ListGroupHeader role="presentation"`), options with an icon, a title and a ' +
                    'secondary text, object values, and a custom control text (`renderValue`).'
            }
        }
    },
    render: () => <RichExample />
};

function FormsExample() {
    const [fruit, setFruit] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [disabledFruit, setDisabledFruit] = useState<string | null>('Banana');
    const [submitted, setSubmitted] = useState('');
    return (
        <>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
                }}
            >
                <FormLabel id="sel-form-1" required>
                    Default select
                </FormLabel>
                <Select
                    aria-labelledby="sel-form-1"
                    name="fruit"
                    required
                    placeholder="Select a fruit"
                    value={fruit}
                    onValueChange={setFruit}
                    onBlur={() => setTouched(true)}
                >
                    {fruitOptions(FRUITS.slice(0, 6))}
                </Select>
                <small className={TEXT}>Value: {fruit ?? 'null'}</small>
                <small className={TEXT}>
                    Touched: {String(touched)}, status: {fruit ? 'VALID' : 'INVALID'}
                </small>
                <Button className="mt-2" type="submit" label="Submit" />
                <small className={TEXT}>Submitted: {submitted}</small>
            </form>

            <div className="mt-6">
                <FormLabel id="sel-form-2">Disabled select</FormLabel>
                <Select
                    aria-labelledby="sel-form-2"
                    disabled={disabled}
                    value={disabledFruit}
                    onValueChange={setDisabledFruit}
                >
                    {fruitOptions(FRUITS.slice(0, 6))}
                </Select>
            </div>
            <small className={TEXT}>
                Value: {disabledFruit}, status: {disabled ? 'DISABLED' : 'VALID'}
            </small>
            <Button className="mt-2" label="Toggle disabled state" onClick={() => setDisabled(!disabled)} />
        </>
    );
}

export const Forms: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'In a form: `name` submits the value through a hidden input, `required` marks the field, ' +
                    '`onBlur` tells when it was left; a select disabled and enabled from outside.'
            }
        }
    },
    render: () => <FormsExample />
};

function ProgrammaticExample() {
    const [options, setOptions] = useState(FRUITS.slice(0, 5));
    const [value, setValue] = useState<string | null>('Apple');
    const [open, setOpen] = useState(false);
    return (
        <>
            <div className="mb-3 flex flex-wrap gap-2">
                <Button
                    label="Change Value"
                    onClick={() => setValue(options[Math.floor(Math.random() * options.length)] ?? null)}
                />
                <Button label="Open" onClick={() => setOpen(true)} />
                <Button label="Close" onClick={() => setOpen(false)} />
                <Button label="Add Option" onClick={() => setOptions((o) => [...o, `Option ${o.length + 1}`])} />
                <Button label="Remove Option" onClick={() => setOptions((o) => o.slice(0, -1))} />
            </div>
            <FormLabel id="sel-prog">Fruit</FormLabel>
            <Select
                aria-labelledby="sel-prog"
                placeholder="Select value"
                closeOnOutsideClick={false}
                maxHeight="12rem"
                value={value}
                onValueChange={setValue}
                open={open}
                onOpenChange={setOpen}
            >
                {fruitOptions(options)}
            </Select>
            <small className={TEXT}>Selected value: {value}</small>
        </>
    );
}

export const Programmatic: Story = {
    name: 'Programmatic control',
    parameters: {
        docs: {
            description: {
                story:
                    'The value and the open state controlled from outside (`value`, `open` and `onOpenChange`), ' +
                    'options added and removed; the list stays open on outside clicks (`closeOnOutsideClick={false}`).'
            }
        }
    },
    render: () => <ProgrammaticExample />
};

interface CarType {
    id: number;
    name: string;
}
const TYPES: CarType[] = [
    { id: 1, name: 'Sedan' },
    { id: 2, name: 'Coupe' },
    { id: 3, name: 'Convertible' }
];

function ComparatorExample() {
    const [value, setValue] = useState<CarType | null>({ id: 2, name: 'Coupe' });
    return (
        <>
            <FormLabel id="sel-cmp">Car type</FormLabel>
            <Select<CarType>
                aria-labelledby="sel-cmp"
                compareWith={(a, b) => a.id === b.id}
                value={value}
                onValueChange={(next) => setValue(next ? { ...next } : next)}
            >
                {TYPES.map((type) => (
                    <SelectOption key={type.id} value={type}>
                        {type.name}
                    </SelectOption>
                ))}
            </Select>
            <small className={TEXT}>The value is a copy of the option; the comparator matches options by id.</small>
        </>
    );
}

export const CustomComparator: Story = {
    name: 'Custom comparator',
    render: () => <ComparatorExample />
};

const MOBILE_CONFIG = {
    title: 'Favourite fruit',
    hasCloseButton: true,
    approveButtonText: 'Save',
    cancelButtonText: 'Cancel'
};

export const Mobile: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'The list opens in a full-screen dialog with a title, a close button and Save and Cancel: the ' +
                    'choice is applied only with Save. The dialog list highlights options with ' +
                    '`aria-activedescendant`.'
            }
        }
    },
    render: () => (
        <>
            <FormLabel id="sel-mobile">Favourite fruit</FormLabel>
            <Stateful<string>
                aria-labelledby="sel-mobile"
                placeholder="Select an option"
                stateMessage="Select your favourite fruit"
                state="information"
                mobile
                mobileConfig={MOBILE_CONFIG}
            >
                {fruitOptions(FRUITS)}
            </Stateful>
        </>
    )
};

const MANY = ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blueberry', 'Bing Cherry', 'Mango', 'Mandarin', 'Melon'];

export const MaxHeight: Story = {
    name: 'Max height',
    parameters: {
        docs: { description: { story: 'The list scrolls beyond `maxHeight` (250px here; 45vh by default).' } }
    },
    render: () => (
        <>
            <FormLabel id="sel-height">Fruit</FormLabel>
            <Stateful<string> aria-labelledby="sel-height" placeholder="Select an option" maxHeight="250px">
                {fruitOptions(MANY)}
            </Stateful>
        </>
    )
};

/* ------------------------------------------------------------------------------------------------------------------
 * Overlays opened in `play` (checked by axe) and states for the visual comparison
 * ---------------------------------------------------------------------------------------------------------------- */

/** Clicks the first select of the story and waits for its list (or mobile dialog). */
async function openSelect(canvas: HTMLElement, popup: string): Promise<void> {
    const combobox = canvas.querySelector<HTMLElement>('[role=combobox]')!;
    await userEvent.click(combobox);
    await waitFor(() => expect(document.querySelector(popup)).not.toBeNull());
    await waitFor(() => expect(combobox.getAttribute('aria-expanded')).toBe('true'));
}

/** A box the list renders into, so it is part of the story. */
function InStory({ children }: { children: (container: HTMLElement | null) => ReactNode }) {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setBox} className="min-h-80">
            {children(box)}
        </div>
    );
}

/** fundamental-styles' "Active, Selected Item": five items, the second selected. */
function OpenDefaultExample({ props }: { props?: Partial<SelectProps<string>> }) {
    return (
        <InStory>
            {(container) => (
                <>
                    <FormLabel id="select-open-label">Active, Selected Item</FormLabel>
                    <Select
                        aria-labelledby="select-open-label"
                        defaultValue="List item 2"
                        container={container}
                        id="select-open"
                        {...props}
                    >
                        {['List item 1', 'List item 2', 'List item 3', 'List item 4', 'List item 5'].map((item) => (
                            <SelectOption key={item} value={item}>
                                {item}
                            </SelectOption>
                        ))}
                    </Select>
                </>
            )}
        </InStory>
    );
}

export const OpenDefault: Story = {
    name: 'Open: default',
    tags: ['!autodocs'],
    render: () => <OpenDefaultExample />,
    play: ({ canvasElement }) => openSelect(canvasElement, '[role=listbox] [role=option]')
};

export const OpenFitContent: Story = {
    name: 'Open: fit content',
    tags: ['!autodocs'],
    parameters: {
        docs: { description: { story: 'The list as wide as its options (`fillControlMode="fit-content"`).' } }
    },
    render: () => <OpenDefaultExample props={{ fillControlMode: 'fit-content' }} />,
    play: ({ canvasElement }) => openSelect(canvasElement, '[role=listbox] [role=option]')
};

export const OpenCompact: Story = {
    name: 'Open: compact',
    tags: ['!autodocs'],
    render: () => (
        <div data-density="compact">
            <OpenDefaultExample />
        </div>
    ),
    play: ({ canvasElement }) => openSelect(canvasElement, '[role=listbox] [role=option]')
};

export const OpenError: Story = {
    name: 'Open: error',
    tags: ['!autodocs'],
    render: () => <OpenDefaultExample props={{ state: 'error', stateMessage: 'error message' }} />,
    play: ({ canvasElement }) => openSelect(canvasElement, '[role=listbox] [role=option]')
};

export const OpenSuccessFull: Story = {
    name: 'Open: success, full message',
    tags: ['!autodocs'],
    render: () => (
        <OpenDefaultExample
            props={{
                state: 'success',
                stateMessage: STATES[0].message,
                textOverflow: 'full',
                fillControlMode: 'equal',
                inline: false
            }}
        />
    ),
    play: ({ canvasElement }) => openSelect(canvasElement, '[role=listbox] [role=option]')
};

const NOTEBOOK_ICONS = ['laptop', 'save', 'desktop-mobile', 'touch', 'sap-box'];

export const OpenTwoColumns: Story = {
    name: 'Open: two columns and icons',
    tags: ['!autodocs'],
    render: () => (
        <InStory>
            {(container) => (
                <>
                    <FormLabel id="select-two-col-label">Choose an option</FormLabel>
                    <Select
                        aria-labelledby="select-two-col-label"
                        defaultValue="Notebook Basic 2"
                        container={container}
                        id="select-two-col"
                    >
                        {NOTEBOOKS.map((item, index) => (
                            <SelectOption key={item.name} value={item.name}>
                                <ListIcon glyph={NOTEBOOK_ICONS[index]!} />
                                <ListTitle>{item.name}</ListTitle>
                                <ListSecondary>{item.price}</ListSecondary>
                            </SelectOption>
                        ))}
                    </Select>
                </>
            )}
        </InStory>
    ),
    play: ({ canvasElement }) => openSelect(canvasElement, '[role=listbox] [role=option]')
};

export const OpenRich: Story = {
    name: 'Open: groups and icons',
    tags: ['!autodocs'],
    render: () => <InStory>{(container) => <RichExample container={container} />}</InStory>,
    play: ({ canvasElement }) => openSelect(canvasElement, '[role=listbox] [role=option]')
};

export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: Mobile.render,
    play: ({ canvasElement }) => openSelect(canvasElement, '[role=dialog] [role=listbox]')
};

export const Focus: Story = {
    name: 'Focus: default',
    tags: ['!autodocs'],
    render: () => (
        <>
            <FormLabel id="select-focus-label">Focus, Placeholder text</FormLabel>
            <Select aria-labelledby="select-focus-label" placeholder="Select an option" id="select-focus">
                {itemOptions()}
            </Select>
        </>
    ),
    play: async ({ canvasElement }) => {
        canvasElement.querySelector<HTMLElement>('[role=combobox]')!.focus();
    }
};
