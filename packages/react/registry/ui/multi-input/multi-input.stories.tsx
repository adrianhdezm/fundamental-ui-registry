import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { FormGroup, FormItem, FormLabel } from '@/ui/form/form';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage } from '@/ui/form/form-message';
import { ListByline, ListContent, ListIcon, ListTitle } from '@/ui/list/list';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { MultiInput, type MultiInputProps } from './multi-input';

const FRUITS = ['Apple', 'Banana', 'Pineapple', 'Tomato', 'Kiwi', 'Strawberry', 'Blueberry', 'Orange'];
const MANY = [
    'Apple',
    'Apricot',
    'Avocado',
    'Banana',
    'Blackberry',
    'Blueberry',
    'Cherry',
    'Coconut',
    'Cranberry',
    'Date',
    'Fig',
    'Grape',
    'Grapefruit',
    'Guava',
    'Kiwi',
    'Lemon',
    'Lime',
    'Lychee',
    'Mango',
    'Melon',
    'Nectarine',
    'Orange',
    'Papaya',
    'Peach'
];
/** fundamental-react's data. */
const DATA = [
    'Apple',
    'Apricot',
    'Acai',
    'African Moringa',
    'Bearberry',
    'Bilberry',
    'Blood orange',
    'Barbadine',
    'Barbados cherry',
    'Balsam Apple',
    'Chokeberry',
    'Cranberry',
    'Cupuacu'
];

interface Product {
    id: number;
    name: string;
    icon: string;
}

const PRODUCTS: Product[] = [
    { id: 1, name: 'Laptop', icon: 'laptop' },
    { id: 2, name: 'Monitor', icon: 'sys-monitor' },
    { id: 3, name: 'Keyboard', icon: 'keyboard-and-mouse' },
    { id: 4, name: 'Printer', icon: 'print' },
    { id: 5, name: 'Phone', icon: 'iphone' }
];
const display = (item: Product) => item.name;
const value = (item: Product) => item.id;

const text = 'm-0 mt-1 block font-sap-font-family text-sap-font-small-size text-sap-content-label-color';
const json = (v: unknown) => JSON.stringify(v);

type PlaygroundArgs = MultiInputProps<string, string>;

const meta = {
    title: 'Components/Multi Input',
    component: MultiInput,
    parameters: {
        docs: {
            description: {
                component:
                    'A tokenizer field with a list of check box options. Typing filters the list and completes the ' +
                    'text; Enter selects the first match (or adds a new token). The focus stays in the input: Down ' +
                    'and Up highlight options and Enter toggles the highlighted one. Tokens are removed with their ' +
                    'close icon, Backspace or Delete. In mobile mode the list opens in a dialog with a select all ' +
                    'button.\n\n' +
                    '```tsx\n' +
                    '<MultiInput aria-label="Fruits" placeholder="Search" dropdownValues={fruits} selected={chosen} onSelectedChange={setChosen} />\n' +
                    '```'
            }
        }
    },
    argTypes: {
        state: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] },
        placement: { control: 'select', options: ['bottom', 'top'] }
    },
    args: {
        placeholder: 'Search here...',
        'aria-label': 'Fruits',
        state: 'default',
        disabled: false,
        includes: false,
        autoComplete: true,
        allowNewTokens: false,
        mobile: false,
        placement: 'bottom'
    },
    render: (args) => (
        <div className="max-w-lg">
            <MultiInput {...args} dropdownValues={FRUITS} />
        </div>
    )
} satisfies Meta<PlaygroundArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** fundamental-react's `dev` knobs are the controls. */
export const Playground: Story = {};

/* ------------------------------------------------------------------------------------------------------------------
 * fundamental-react
 * ---------------------------------------------------------------------------------------------------------------- */

export const Primary: Story = {
    render: () => (
        <FormItem className="max-w-lg">
            <FormLabel htmlFor="multiInputPrimaryExample">Primary</FormLabel>
            <MultiInput
                inputId="multiInputPrimaryExample"
                addOnButtonAriaLabel="Show options"
                placeholder="Placeholder"
                dropdownValues={DATA}
            />
        </FormItem>
    )
};

export const CompactStory: Story = {
    name: 'Compact',
    render: () => (
        <FormItem className="max-w-lg" data-density="compact">
            <FormLabel htmlFor="multiInputCompactExample">Compact</FormLabel>
            <MultiInput inputId="multiInputCompactExample" placeholder="Placeholder" dropdownValues={DATA} />
        </FormItem>
    )
};

export const Disabled: Story = {
    render: () => (
        <FormItem className="max-w-lg">
            <FormLabel htmlFor="multiInputDisabledExample">Disabled</FormLabel>
            <MultiInput
                inputId="multiInputDisabledExample"
                disabled
                placeholder="Placeholder"
                dropdownValues={DATA}
                defaultSelected={['Apple', 'Acai']}
            />
        </FormItem>
    )
};

const VALIDATION = [
    { id: 'multiInputErrorExample', label: 'Multi input with an error', state: 'error', placeholder: 'Error' },
    { id: 'multiInputWarningExample', label: 'Multi input with a warning', state: 'warning', placeholder: 'Warning' },
    { id: 'multiInputSuccessExample', label: 'Successful Multi input', state: 'success', placeholder: 'Success' },
    {
        id: 'multiInputInfoExample',
        label: 'Multi input with some info',
        state: 'information',
        placeholder: 'Information'
    }
] as const;

function ValidationStatesDemo() {
    return (
        <div className="flex max-w-lg flex-col gap-10">
            {VALIDATION.map((v) => (
                <FormGroup key={v.id}>
                    <FormItem>
                        <FormLabel htmlFor={v.id}>{v.label}</FormLabel>
                        <FormInputMessageGroup>
                            <MultiInput
                                inputId={v.id}
                                state={v.state}
                                placeholder={v.placeholder}
                                dropdownValues={DATA}
                            />
                            <FormMessage type={v.state}>Test validation state</FormMessage>
                        </FormInputMessageGroup>
                    </FormItem>
                </FormGroup>
            ))}
        </div>
    );
}

export const ValidationStates: Story = {
    name: 'Validation states',
    parameters: {
        docs: {
            description: {
                story:
                    'The value state colours the field; its message is a form message in a form input message ' +
                    'group, shown while the field has the focus.'
            }
        }
    },
    render: () => <ValidationStatesDemo />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Angular
 * ---------------------------------------------------------------------------------------------------------------- */

function DefaultDemo() {
    const [one, setOne] = useState(['Banana']);
    const [two, setTwo] = useState(['Apple', 'Kiwi']);
    const [three, setThree] = useState<string[]>([]);
    const [four, setFour] = useState(['Orange']);
    const [five, setFive] = useState(MANY.slice(0, 16));
    const [term, setTerm] = useState('');
    return (
        <div className="flex max-w-lg flex-col gap-4">
            <FormItem>
                <FormLabel htmlFor="mi-1">Multi input</FormLabel>
                <MultiInput
                    inputId="mi-1"
                    placeholder="Search here..."
                    dropdownValues={FRUITS}
                    selected={one}
                    onSelectedChange={setOne}
                    onSearchTermChange={setTerm}
                />
                <small className={text}>{`Selected: ${json(one)}, search term: "${term}"`}</small>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-2">Disabled</FormLabel>
                <MultiInput
                    inputId="mi-2"
                    disabled
                    placeholder="Search here..."
                    dropdownValues={FRUITS}
                    selected={two}
                    onSelectedChange={setTwo}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-3">Hidden addon button, any part of the text matches</FormLabel>
                <MultiInput
                    inputId="mi-3"
                    includes
                    placeholder="Search here..."
                    displayAddonButton={false}
                    dropdownValues={FRUITS}
                    selected={three}
                    onSelectedChange={setThree}
                />
            </FormItem>
            <FormItem data-density="compact">
                <FormLabel htmlFor="mi-4">Compact</FormLabel>
                <MultiInput
                    inputId="mi-4"
                    placeholder="Search here..."
                    dropdownValues={FRUITS}
                    selected={four}
                    onSelectedChange={setFour}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-5">Many selected values</FormLabel>
                <MultiInput
                    inputId="mi-5"
                    placeholder="Search here..."
                    dropdownValues={MANY}
                    selected={five}
                    onSelectedChange={setFive}
                />
                <small className={text}>{`${five.length} selected; the "n more" link lists them.`}</small>
            </FormItem>
        </div>
    );
}

export const Default: Story = { render: () => <DefaultDemo /> };

function ItemsDemo() {
    const [one, setOne] = useState([2]);
    const [two, setTwo] = useState<number[]>([]);
    const [three, setThree] = useState([1, 4]);
    const [four, setFour] = useState(['Kiwi']);
    const [clicks, setClicks] = useState(0);
    return (
        <div className="flex max-w-lg flex-col gap-4">
            <FormItem>
                <FormLabel htmlFor="mi-items-1">Objects with display and value functions</FormLabel>
                <MultiInput
                    inputId="mi-items-1"
                    placeholder="Search here..."
                    dropdownValues={PRODUCTS}
                    displayFn={display}
                    valueFn={value}
                    selected={one}
                    onSelectedChange={setOne}
                />
                <small className={text}>{`Selected ids: ${json(one)}`}</small>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-items-2">Item template</FormLabel>
                <MultiInput
                    inputId="mi-items-2"
                    placeholder="Search here..."
                    dropdownValues={PRODUCTS}
                    displayFn={display}
                    valueFn={value}
                    renderItem={(item) => (
                        <>
                            <ListIcon glyph={item.icon} />
                            <ListTitle>{item.name}</ListTitle>
                        </>
                    )}
                    selected={two}
                    onSelectedChange={setTwo}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-items-3">Bylines with a list as wide as the field</FormLabel>
                <MultiInput
                    inputId="mi-items-3"
                    byline
                    bodyMaxWidth="container"
                    placeholder="Search here..."
                    dropdownValues={PRODUCTS}
                    displayFn={display}
                    valueFn={value}
                    renderItem={(item) => (
                        <ListContent>
                            <ListTitle>{item.name}</ListTitle>
                            <ListByline>{`Product number ${item.id}`}</ListByline>
                        </ListContent>
                    )}
                    selected={three}
                    onSelectedChange={setThree}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-items-4">New tokens</FormLabel>
                <MultiInput
                    inputId="mi-items-4"
                    allowNewTokens
                    placeholder="Type and press Enter"
                    dropdownValues={FRUITS}
                    selected={four}
                    onSelectedChange={setFour}
                />
                <small className={text}>{`Selected: ${json(four)}`}</small>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-items-5">Addon button handled by the app</FormLabel>
                <MultiInput
                    inputId="mi-items-5"
                    placeholder="Search here..."
                    openDropdownOnAddOnClicked={false}
                    dropdownValues={FRUITS}
                    onAddOnButtonClick={() => setClicks((c) => c + 1)}
                />
                <small className={text}>{`Addon button clicks: ${clicks}`}</small>
            </FormItem>
        </div>
    );
}

export const Items: Story = { name: 'Objects, templates and new tokens', render: () => <ItemsDemo /> };

function FormsDemo() {
    const [fruits, setFruits] = useState(['Pineapple']);
    const [touched, setTouched] = useState(false);
    const [dirty, setDirty] = useState(false);
    return (
        <form className="flex max-w-lg flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
            <FormItem>
                <FormLabel htmlFor="mi-form-1" required>
                    Fruits
                </FormLabel>
                <MultiInput
                    inputId="mi-form-1"
                    required
                    state="information"
                    placeholder="Search here..."
                    dropdownValues={FRUITS}
                    selected={fruits}
                    onSelectedChange={(next) => {
                        setFruits(next);
                        setDirty(true);
                    }}
                    onBlur={() => setTouched(true)}
                />
                <small className={text}>{`Value: ${json(fruits)}, touched: ${touched}, dirty: ${dirty}`}</small>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-form-2">Error state</FormLabel>
                <MultiInput
                    inputId="mi-form-2"
                    state="error"
                    placeholder="Search here..."
                    dropdownValues={FRUITS}
                    defaultSelected={['Tomato']}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-form-3">Disabled control</FormLabel>
                <MultiInput
                    inputId="mi-form-3"
                    disabled
                    placeholder="Search here..."
                    dropdownValues={FRUITS}
                    defaultSelected={['Apple']}
                />
            </FormItem>
        </form>
    );
}

export const Forms: Story = { render: () => <FormsDemo /> };

function MobileDemo() {
    const [selected, setSelected] = useState(['Kiwi']);
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <FormItem className="max-w-lg" ref={setBox}>
            <FormLabel htmlFor="mi-mobile">Fruits</FormLabel>
            <MultiInput
                inputId="mi-mobile"
                mobile
                placeholder="Search here..."
                mobileConfig={{ title: 'Fruits', approveButtonText: 'Select', cancelButtonText: 'Cancel' }}
                dropdownValues={FRUITS}
                selected={selected}
                onSelectedChange={setSelected}
                container={box}
            />
            <small className={text}>{`Selected: ${json(selected)}`}</small>
        </FormItem>
    );
}

export const Mobile: Story = { render: () => <MobileDemo /> };

/** Matches the start of the text, case-sensitively (the default filter ignores case). */
const customFilter = (items: string[], term: string) => (term ? items.filter((item) => item.startsWith(term)) : items);

function CustomFilterDemo() {
    const [selected, setSelected] = useState<string[]>([]);
    return (
        <FormItem className="max-w-lg">
            <FormLabel htmlFor="mi-filter">Case-sensitive filter</FormLabel>
            <MultiInput
                inputId="mi-filter"
                placeholder="Search here..."
                dropdownValues={['Apple', 'Banana', 'Pineapple', 'Tomato']}
                filterFn={customFilter}
                selected={selected}
                onSelectedChange={setSelected}
            />
            <small
                className={text}
            >{`Only "Apple" matches "A"; "a" matches nothing. Selected: ${json(selected)}`}</small>
        </FormItem>
    );
}

export const CustomFilter: Story = { name: 'Custom filter', render: () => <CustomFilterDemo /> };

interface OptionItem {
    label: string;
    value: string;
}

const OPTION_ITEMS: OptionItem[] = FRUITS.map((label) => ({ label, value: `${label.toLowerCase()}_value` }));

const ASYNC_ITEMS: OptionItem[] = [
    'Apple',
    'Watermelon',
    'Orange',
    'Pear',
    'Cherry',
    'Strawberry',
    'Nectarine',
    'Grape',
    'Mango',
    'Blueberry',
    'Pomegranate',
    'Carambola',
    'Plum',
    'Banana',
    'Raspberry',
    'Mandarin',
    'Jackfruit',
    'Papaya',
    'Kiwi',
    'Pineapple',
    'Lime',
    'Lemon',
    'Apricot',
    'Grapefruit',
    'Melon',
    'Coconut',
    'Avocado',
    'Peach'
].map((label) => ({ label, value: `${label.toLowerCase()}_value` }));

const optionLabel = (item: OptionItem) => item.label;
const optionValue = (item: OptionItem) => item.value;

function AsyncDemo() {
    const [term, setTerm] = useState('');
    const [items, setItems] = useState<OptionItem[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    // emulates a server request: at most five matches after a delay
    useEffect(() => {
        const query = term.trim().toLowerCase();
        const timer = setTimeout(
            () => setItems(ASYNC_ITEMS.filter((item) => item.value.startsWith(query)).slice(0, 5)),
            500
        );
        return () => clearTimeout(timer);
    }, [term]);
    return (
        <FormItem className="max-w-lg">
            <FormLabel htmlFor="mi-async">Fruits from a server</FormLabel>
            <MultiInput
                inputId="mi-async"
                placeholder="Search here..."
                dropdownValues={items}
                displayFn={optionLabel}
                valueFn={optionValue}
                selected={selected}
                onSelectedChange={setSelected}
                onSearchTermChange={setTerm}
            />
            <small className={text}>
                {`Each search term loads at most five matches after a delay. Selected: ${json(selected)}`}
            </small>
        </FormItem>
    );
}

export const AsyncValues: Story = { name: 'Async values', render: () => <AsyncDemo /> };

function OptionItemsDemo() {
    const [selected, setSelected] = useState(OPTION_ITEMS.slice(0, 7).map((item) => item.value));
    return (
        <FormItem className="max-w-lg">
            <FormLabel htmlFor="mi-option-items">Option items</FormLabel>
            <MultiInput<OptionItem, string>
                inputId="mi-option-items"
                placeholder="Search here..."
                dropdownValues={OPTION_ITEMS}
                selected={selected}
                onSelectedChange={setSelected}
            />
            <small className={text}>
                Items with <code>label</code> and <code>value</code> need no display or value function. Selected:{' '}
                {json(selected)}
            </small>
        </FormItem>
    );
}

export const OptionItems: Story = { name: 'Option items', render: () => <OptionItemsDemo /> };

const LONG = [
    'SomeLongTextToShowThatWidthWillGrowWithTheContent',
    'Banana',
    'Pineapple',
    'Tomato',
    'Kiwi',
    'Strawberry',
    'Blueberry',
    'Orange'
];
const WRAPPING = ['Some long option to show title wrapping', ...LONG.slice(1)];

function DropdownWidthDemo() {
    const [one, setOne] = useState(['SomeLongTextToShowThatWidthWillGrowWithTheContent', 'Banana']);
    const [two, setTwo] = useState(['Some long option to show title wrapping', 'Banana']);
    const [three, setThree] = useState(['Kiwi']);
    return (
        <div className="flex flex-col gap-6">
            <FormItem>
                <FormLabel htmlFor="mi-width-1">Default: the list grows with the content</FormLabel>
                <MultiInput
                    inputId="mi-width-1"
                    className="w-[200px]"
                    placeholder="Search here..."
                    dropdownValues={LONG}
                    selected={one}
                    onSelectedChange={setOne}
                />
                <small className={text}>{`Selected: ${json(one)}`}</small>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-width-2">Strict: at most 300px, titles wrap</FormLabel>
                <MultiInput
                    inputId="mi-width-2"
                    className="w-[300px]"
                    byline
                    placeholder="Search here..."
                    bodyMaxWidth={300}
                    dropdownValues={WRAPPING}
                    renderItem={(item) => (
                        <ListContent>
                            <ListTitle wrap>{item}</ListTitle>
                            <ListByline>Some description</ListByline>
                        </ListContent>
                    )}
                    selected={two}
                    onSelectedChange={setTwo}
                />
                <small className={text}>{`Selected: ${json(two)}`}</small>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mi-width-3">Dynamic: as wide as the field</FormLabel>
                <MultiInput
                    inputId="mi-width-3"
                    className="w-[250px]"
                    bodyMaxWidth="container"
                    placeholder="Search here..."
                    dropdownValues={LONG}
                    selected={three}
                    onSelectedChange={setThree}
                />
                <small className={text}>{`Selected: ${json(three)}`}</small>
            </FormItem>
        </div>
    );
}

export const DropdownWidth: Story = { name: 'Dropdown width', render: () => <DropdownWidthDemo /> };

const COUNTS = [10, 100, 200, 1000];

function ManyTokensDemo() {
    const [count, setCount] = useState(1000);
    const options = useMemo(() => Array.from({ length: count }, (_, i) => `Option ${i + 1}`), [count]);
    const [selected, setSelected] = useState(options);
    return (
        <div className="flex max-w-lg flex-col gap-4">
            <SegmentedButton
                aria-label="Number of tokens"
                value={String(count)}
                onValueChange={(next) => {
                    const n = Number(next);
                    setCount(n);
                    setSelected(Array.from({ length: n }, (_, i) => `Option ${i + 1}`));
                }}
            >
                {COUNTS.map((n) => (
                    <SegmentedButtonItem key={n} value={String(n)} label={String(n)} />
                ))}
            </SegmentedButton>
            <FormItem>
                <FormLabel htmlFor="mi-many">{`${count} selected options`}</FormLabel>
                <MultiInput
                    inputId="mi-many"
                    placeholder="Type to search"
                    maxVisibleTokens={12}
                    dropdownValues={options}
                    selected={selected}
                    onSelectedChange={setSelected}
                />
                <small className={text}>
                    Without the focus only 12 tokens render and the rest count in the &quot;n more&quot; link; the focus
                    renders all of them.
                </small>
            </FormItem>
        </div>
    );
}

export const ManyTokens: Story = { name: 'Many tokens', render: () => <ManyTokensDemo /> };

/* ------------------------------------------------------------------------------------------------------------------
 * Visual reference: fundamental-styles' "As Form Item" multi input
 * ---------------------------------------------------------------------------------------------------------------- */

/** fundamental-styles' form item example (full width, as theirs), with the list rendered inside the story. */
function AsFormItemDemo() {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setBox}>
            <FormItem id="mi-form-item">
                <FormLabel htmlFor="formItemMultiInput">Multi Input as form item</FormLabel>
                <MultiInput
                    inputId="formItemMultiInput"
                    addOnButtonAriaLabel="show options"
                    aria-label="list of fruits"
                    dropdownValues={['Apple', 'Orange', 'Banana', 'Kiwi', 'Lemon']}
                    defaultSelected={['Apple', 'Orange', 'Kiwi', 'Banana']}
                    container={box}
                />
            </FormItem>
        </div>
    );
}

export const AsFormItem: Story = {
    name: 'As form item',
    parameters: {
        docs: { description: { story: "fundamental-styles' form item example, for the visual comparison." } }
    },
    render: () => <AsFormItemDemo />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Open: … (axe checks the open list or dialog)
 * ---------------------------------------------------------------------------------------------------------------- */

/** Clicks the addon button of the multi input whose field has the given id and waits for its popup. */
async function openMultiInput(canvasElement: HTMLElement, inputId: string, popup: string): Promise<void> {
    // the input sits in the field next to the addon button
    const field = canvasElement.querySelector<HTMLInputElement>(`#${inputId}`)!.parentElement!.parentElement!;
    await userEvent.click(field.querySelector<HTMLButtonElement>('button[aria-haspopup]')!);
    await waitFor(() => expect(document.querySelector(popup)).not.toBeNull());
}

export const OpenDefault: Story = {
    name: 'Open: as form item',
    tags: ['!autodocs'],
    render: AsFormItem.render,
    play: ({ canvasElement }) => openMultiInput(canvasElement, 'formItemMultiInput', '[role=listbox] [role=option]')
};

export const OpenItemTemplate: Story = {
    name: 'Open: item template',
    tags: ['!autodocs'],
    render: () => <ItemsDemo />,
    play: ({ canvasElement }) =>
        openMultiInput(canvasElement, 'mi-items-2', '[role=listbox] [role=option] [data-slot=list-icon]')
};

export const OpenFiltered: Story = {
    name: 'Open: filtered',
    tags: ['!autodocs'],
    render: () => <DefaultDemo />,
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector<HTMLInputElement>('#mi-1')!;
        await userEvent.type(input, 'b');
        await waitFor(() => expect(document.querySelector('[role=listbox] [role=option] b')).not.toBeNull());
        await userEvent.keyboard('{ArrowDown}');
    }
};

export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: () => <MobileDemo />,
    play: ({ canvasElement }) =>
        openMultiInput(canvasElement, 'mi-mobile', '[role=dialog] [role=listbox] [role=option]')
};

export const OpenValidationState: Story = {
    name: 'Open: validation state',
    tags: ['!autodocs'],
    render: () => <ValidationStatesDemo />,
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector<HTMLInputElement>('#multiInputErrorExample')!);
        await waitFor(() =>
            expect(
                [...document.querySelectorAll<HTMLElement>('[data-slot="form-message"]')].some((m) =>
                    m.checkVisibility()
                )
            ).toBe(true)
        );
    }
};
