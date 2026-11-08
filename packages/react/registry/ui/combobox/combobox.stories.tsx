import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    DialogTrigger
} from '@/ui/dialog/dialog';
import { FormItem, FormLabel } from '@/ui/form/form';
import { Icon } from '@/ui/icon/icon';
import {
    ListByline,
    ListContent,
    ListIcon,
    ListMessage,
    ListSecondary,
    ListThumbnail,
    ListTitle
} from '@/ui/list/list';
import { Combobox, type ComboboxGroupFunction, type ComboboxProps } from './combobox';

const FRUITS = [
    'Apple',
    'Apricot',
    'Banana',
    'Blueberry',
    'Cherry',
    'Grape',
    'Kiwi',
    'Lemon',
    'Mango',
    'Orange',
    'Papaya',
    'Pineapple',
    'Raspberry',
    'Strawberry',
    'Watermelon'
];

/** fundamental-styles' combobox fruits, for the visual comparison. */
const FS_FRUITS = [
    'Apple',
    'Orange',
    'Banana',
    'Kiwi',
    'Nectarine',
    'Apricots',
    'Peache',
    'Plum',
    'Mango',
    'Strawberry',
    'Blueberry',
    'Watermelon',
    'Honeydew'
];

/** fundamental-react's countries (`{ key, text }`), shortened. */
interface Country {
    key: string;
    text: string;
}
const COUNTRIES: Country[] = [
    { key: 'AR', text: 'Argentina' },
    { key: 'AU', text: 'Australia' },
    { key: 'AT', text: 'Austria' },
    { key: 'BE', text: 'Belgium' },
    { key: 'BR', text: 'Brazil' },
    { key: 'CA', text: 'Canada' },
    { key: 'CL', text: 'Chile' },
    { key: 'CN', text: 'China' },
    { key: 'CO', text: 'Colombia' },
    { key: 'CR', text: 'Costa Rica' },
    { key: 'HR', text: 'Croatia' },
    { key: 'CU', text: 'Cuba' },
    { key: 'DK', text: 'Denmark' },
    { key: 'FR', text: 'France' },
    { key: 'DE', text: 'Germany' },
    { key: 'IN', text: 'India' },
    { key: 'IE', text: 'Ireland' },
    { key: 'IT', text: 'Italy' },
    { key: 'JP', text: 'Japan' },
    { key: 'MX', text: 'Mexico' },
    { key: 'NL', text: 'Netherlands' },
    { key: 'NZ', text: 'New Zealand' },
    { key: 'ES', text: 'Spain' },
    { key: 'GB', text: 'United Kingdom' },
    { key: 'US', text: 'United States of America' }
];
const countryText = (country: Country | null | undefined) => country?.text ?? '';

interface Product {
    id: string;
    name: string;
    type: 'Fruit' | 'Vegetable';
    price: string;
    icon: string;
}

const PRODUCTS: Product[] = [
    { id: 'A1', name: 'Apple', type: 'Fruit', price: '2.50 EUR', icon: 'nutrition-activity' },
    { id: 'B2', name: 'Banana', type: 'Fruit', price: '1.20 EUR', icon: 'nutrition-activity' },
    { id: 'P3', name: 'Pineapple', type: 'Fruit', price: '3.90 EUR', icon: 'nutrition-activity' },
    { id: 'B4', name: 'Broccoli', type: 'Vegetable', price: '1.80 EUR', icon: 'e-care' },
    { id: 'C5', name: 'Carrot', type: 'Vegetable', price: '0.90 EUR', icon: 'e-care' },
    { id: 'S6', name: 'Spinach', type: 'Vegetable', price: '2.10 EUR', icon: 'e-care' }
];
const productName = (item: Product | null | undefined) => item?.name ?? '';

const COLUMN = 'flex max-w-lg flex-col gap-4';
const ROW = 'flex flex-wrap items-start gap-8';
const TEXT = 'm-0 mt-1 block font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

const meta = {
    title: 'Components/Combobox',
    component: Combobox,
    parameters: {
        docs: {
            description: {
                component:
                    "An input that suggests values while typing, on Base UI's Combobox: it filters the list, completes " +
                    'the text inline and bolds the search text. The focus stays in the input: Down and Up highlight ' +
                    'values and put them in the input, Enter chooses, Escape closes, Alt+Down opens the whole list and ' +
                    'Alt+Up closes it. While closed, Down and Up step through the values. The value is the text, or ' +
                    'with `communicateByObject` the chosen item (or its `valueProperty`). In mobile mode the list opens ' +
                    'in a full-screen dialog. Compact density is `data-density="compact"` on the combobox or an ' +
                    'ancestor.\n\n' +
                    '```tsx\n' +
                    '<FormLabel htmlFor="fruit">Fruit</FormLabel>\n' +
                    '<Combobox inputId="fruit" placeholder="Type a fruit" dropdownValues={fruits} value={fruit} onValueChange={setFruit} />\n' +
                    '```'
            }
        }
    },
    argTypes: {
        state: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] },
        tabOutStrategy: { control: 'select', options: ['closeAndSelect', 'close'] }
    },
    args: {
        'aria-label': 'Fruit',
        placeholder: 'Type a fruit...',
        dropdownValues: FRUITS,
        state: 'default',
        stateMessage: 'placeholder text',
        disabled: false,
        readOnly: false,
        required: false,
        autoComplete: true,
        highlighting: true,
        includes: false,
        showAllEntries: false,
        isSearch: false,
        showClearButton: false,
        showDropdownButton: true,
        closeOnSelect: true,
        mobile: false,
        maxHeight: '250px',
        noMatchesText: 'No Matches',
        tabOutStrategy: 'closeAndSelect'
    }
} satisfies Meta<typeof Combobox<string>>;
export default meta;
type Story = StoryObj<typeof meta>;

/** fundamental-react's dev story and Angular's Playground: every option, with the callbacks printed. */
function PlaygroundExample(args: ComboboxProps<string>) {
    const [log, setLog] = useState<string[]>([]);
    const add = (line: string) => setLog((lines) => [line, ...lines].slice(0, 5));
    return (
        <div className="flex max-w-96 flex-col gap-2">
            <Combobox<string>
                {...args}
                onValueChange={(value) => add(`onValueChange: ${JSON.stringify(value)}`)}
                onItemSelect={({ item, index }) => add(`onItemSelect: ${item} (${index})`)}
                onOpenChange={(open) => add(`onOpenChange: ${open}`)}
                onSearch={(text) => add(`onSearch: "${text}"`)}
            />
            {log.map((line, index) => (
                <p key={index} className={TEXT}>
                    {line}
                </p>
            ))}
        </div>
    );
}

export const Playground: Story = {
    render: (args) => <PlaygroundExample {...(args as ComboboxProps<string>)} />
};

/** A labelled combobox in a form item, its value printed under it. */
function Field<T>({
    id,
    label,
    required,
    note,
    inCanvas = false,
    ...props
}: Partial<ComboboxProps<T>> & {
    id: string;
    label: ReactNode;
    note?: (value: unknown) => ReactNode;
    /** Renders the list into the story (for the visual comparison, which looks in the story root). */
    inCanvas?: boolean;
}) {
    const [value, setValue] = useState<unknown>(props.defaultValue ?? null);
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <FormItem ref={setBox}>
            <FormLabel htmlFor={id} required={required}>
                {label}
            </FormLabel>
            <Combobox<T>
                inputId={id}
                required={required}
                container={inCanvas ? box : undefined}
                {...props}
                onValueChange={(next) => {
                    setValue(next);
                    props.onValueChange?.(next);
                }}
            />
            {note && <small className={TEXT}>{note(value)}</small>}
        </FormItem>
    );
}

export const Primary: Story = {
    parameters: {
        docs: { description: { story: "fundamental-react's primary example: a labelled combobox of countries." } }
    },
    render: () => (
        <div className={COLUMN}>
            <Field<Country>
                id="cb-primary"
                label="Default"
                maxHeight="250px"
                placeholder="Enter country"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
            />
        </div>
    )
};

export const DisabledAndReadOnly: Story = {
    name: 'Disabled and read-only',
    parameters: {
        docs: {
            description: {
                story: "A disabled combobox dims the field and its button; a read-only one has no button and no list (fundamental-react's and fundamental-styles' examples)."
            }
        }
    },
    render: () => (
        <div className={ROW}>
            <Field
                id="cb-disabled"
                label="Disabled"
                disabled
                defaultValue="Orange"
                placeholder="Select Fruit"
                dropdownValues={FS_FRUITS}
            />
            <Field
                id="cb-readonly"
                label="Readonly"
                readOnly
                defaultValue="Orange"
                placeholder="Select Fruit"
                dropdownValues={FS_FRUITS}
            />
            <Field
                id="cb-disabled-empty"
                label="Disabled, empty"
                disabled
                placeholder="Enter country"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
            />
        </div>
    )
};

export const Compact: Story = {
    parameters: {
        docs: { description: { story: 'Compact sizes with `data-density="compact"` (fundamental-react `compact`).' } }
    },
    render: () => (
        <div data-density="compact" className={COLUMN}>
            <Field<Country>
                id="cb-compact"
                label="Compact"
                maxHeight="250px"
                placeholder="Enter country"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
            />
        </div>
    )
};

const STATES = [
    ['error', 'Combobox with error', 'Please select country of residence'],
    ['warning', 'Combobox with warning', 'Country can be edited only once'],
    ['information', 'Combobox with information', 'This data will not be shared.'],
    ['success', 'Combobox with success', 'Service is supported in these countries.']
] as const;

export const ValidationStates: Story = {
    name: 'Validation states',
    parameters: {
        docs: {
            description: {
                story: '`state` colours the field and `stateMessage` explains it: under the field while it has the focus (a form message) and at the top of the open list (a list message).'
            }
        }
    },
    render: () => (
        <div className={ROW}>
            {STATES.map(([state, label, message]) => (
                <Field<Country>
                    key={state}
                    id={`cb-state-${state}`}
                    label={label}
                    required={state === 'error'}
                    maxHeight="250px"
                    placeholder="Enter country"
                    displayFn={countryText}
                    dropdownValues={COUNTRIES}
                    state={state}
                    stateMessage={message}
                />
            ))}
        </div>
    )
};

export const SelectionType: Story = {
    name: 'Selection type',
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's selection types: `manual` (`autoComplete={false}`: the text is the value until an item is chosen) and `auto-inline` (`autoComplete`, the default: the typed text is completed with the first matching value)."
            }
        }
    },
    render: () => (
        <div className={ROW}>
            <Field<Country>
                id="cb-manual"
                label="Country (Manual Select)"
                autoComplete={false}
                communicateByObject
                valueProperty="key"
                maxHeight="250px"
                noMatchesText="No Matches"
                placeholder="Enter Country Name"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
                note={(value) => `Selected country code: ${value || 'none'}`}
            />
            <Field<Country>
                id="cb-auto-inline"
                label="Country (Auto Select and Inline Auto Complete)"
                communicateByObject
                valueProperty="key"
                maxHeight="250px"
                noMatchesText="No Matches"
                placeholder="Enter Country Name"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
                note={(value) => `Selected country code: ${value || 'none'}`}
            />
        </div>
    )
};

export const PreSelected: Story = {
    name: 'Pre-selected value',
    parameters: {
        docs: {
            description: {
                story: "A value given up front (fundamental-react's `selectedKey`): with `valueProperty` the key of the item."
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <Field<Country>
                id="cb-preselected"
                label="Pre Selected Combobox"
                communicateByObject
                valueProperty="key"
                defaultValue="CR"
                maxHeight="250px"
                noMatchesText="No Matches"
                placeholder="Enter country"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
                note={() => 'Clear the field to see more options'}
            />
        </div>
    )
};

function FreetypeExample() {
    const [text, setText] = useState('');
    return (
        <div className={COLUMN}>
            <FormItem>
                <FormLabel htmlFor="cb-freetype">Freetype Combobox</FormLabel>
                <Combobox<Country>
                    inputId="cb-freetype"
                    autoComplete={false}
                    maxHeight="250px"
                    noMatchesText="No Matches"
                    placeholder="Enter country"
                    displayFn={countryText}
                    dropdownValues={COUNTRIES}
                    value={text}
                    onValueChange={(value) => setText(`${value ?? ''}`)}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="cb-freetype-text">Text</FormLabel>
                <input
                    id="cb-freetype-text"
                    className="font-sap-font-family text-sap-font-size"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                />
            </FormItem>
        </div>
    );
}

export const Freetype: Story = {
    parameters: {
        docs: {
            description: {
                story: "Free text (fundamental-react's freetype example): the value is the text, controlled with `value` and `onValueChange`, and written from outside by the second field."
            }
        }
    },
    render: () => <FreetypeExample />
};

export const ShowAllEntries: Story = {
    name: 'Show all entries',
    parameters: {
        docs: {
            description: { story: '`showAllEntries` lists the values that do not match after the matching ones.' }
        }
    },
    render: () => (
        <div className={ROW}>
            <Field<Country>
                id="cb-only-matching"
                label="Show only matching entries Combobox (Default)"
                communicateByObject
                valueProperty="key"
                defaultValue="CR"
                maxHeight="250px"
                placeholder="Enter country"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
            />
            <Field<Country>
                id="cb-all-entries"
                label="Show all entries Combobox"
                showAllEntries
                communicateByObject
                valueProperty="key"
                defaultValue="CR"
                maxHeight="250px"
                placeholder="Enter country"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
            />
        </div>
    )
};

export const SearchFullString: Story = {
    name: 'Search the full string',
    parameters: {
        docs: {
            description: {
                story: '`includes` matches the typed text anywhere in the values (fundamental-react `searchFullString`).'
            }
        }
    },
    render: () => (
        <div className={ROW}>
            <Field<Country>
                id="cb-beginning"
                label="Search by the beginning of the string Combobox (Default)"
                maxHeight="250px"
                placeholder="Enter country"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
            />
            <Field<Country>
                id="cb-full-string"
                label="Search by the full string Combobox"
                includes
                autoComplete={false}
                maxHeight="250px"
                placeholder="Enter country"
                displayFn={countryText}
                dropdownValues={COUNTRIES}
            />
        </div>
    )
};

function StandardExample() {
    return (
        <div className={COLUMN}>
            <Field
                id="cb-1"
                label="Standard with custom width (in px)"
                width="300px"
                maxHeight="250px"
                placeholder="Type some text..."
                dropdownValues={FRUITS}
                note={(value) => `Search term: ${value ?? ''}`}
            />
            <Field
                id="cb-2"
                label="Disable highlighting"
                placeholder="Type some text..."
                highlighting={false}
                dropdownValues={FRUITS}
            />
            <Field
                id="cb-3"
                label="Disable auto complete"
                placeholder="Type some text..."
                autoComplete={false}
                dropdownValues={FRUITS}
            />
            <div data-density="compact">
                <Field id="cb-4" label="Compact" placeholder="Type some text..." dropdownValues={FRUITS} />
            </div>
            <Field
                id="cb-5"
                label="Read-only"
                readOnly
                defaultValue="Banana"
                placeholder="Type some text..."
                dropdownValues={FRUITS}
            />
            <Field
                id="cb-6"
                label="Hide addon button, match any part of the values"
                includes
                showDropdownButton={false}
                placeholder="Type some text..."
                dropdownValues={FRUITS}
            />
        </div>
    );
}

export const Standard: Story = {
    parameters: {
        docs: {
            description: {
                story: 'A custom width and list height, without highlighting, without inline completion, compact, read-only, and without the dropdown button matching any part of the values.'
            }
        }
    },
    render: () => <StandardExample />
};

function SearchExample() {
    const [searches, setSearches] = useState(0);
    return (
        <div className={COLUMN}>
            <Field
                id="cb-search-1"
                label="Search field"
                isSearch
                placeholder="Search"
                glyphAriaLabel="Search"
                dropdownValues={FRUITS}
                onSearch={() => setSearches((n) => n + 1)}
                note={(value) => `Search term: ${value ?? ''}, searches: ${searches}`}
            />
            <Field
                id="cb-search-2"
                label="Combobox with a clear button"
                showClearButton
                defaultValue="Mango"
                placeholder="Type some text..."
                dropdownValues={FRUITS}
            />
            <Field
                id="cb-search-3"
                label="Full dropdown width"
                showClearButton
                noDropdownMaxWidth
                placeholder="Type some text..."
                dropdownValues={FRUITS}
            />
        </div>
    );
}

export const Search: Story = {
    name: 'Search and clear',
    parameters: {
        docs: {
            description: {
                story: '`isSearch` gives a search button (it calls `onSearch`, as Enter does) and a clear button; `showClearButton` adds the clear button to a combobox.'
            }
        }
    },
    render: () => <SearchExample />
};

function TemplatesExample() {
    const [clicked, setClicked] = useState<unknown>(null);
    return (
        <div className={COLUMN}>
            <Field<Product>
                id="cb-tpl-1"
                label="Columns"
                placeholder="Type some text..."
                displayFn={productName}
                dropdownValues={PRODUCTS}
                renderItem={(item) => (
                    <>
                        <ListTitle>{item.name}</ListTitle>
                        <ListSecondary>{item.price}</ListSecondary>
                    </>
                )}
            />
            <Field<Product>
                id="cb-tpl-2"
                label="Item template with icons"
                placeholder="Select a product..."
                displayFn={productName}
                dropdownValues={PRODUCTS}
                onItemSelect={setClicked}
                renderItem={(item) => (
                    <>
                        <ListIcon glyph={item.icon} />
                        <ListTitle>{item.name}</ListTitle>
                    </>
                )}
                note={() => `onItemSelect: ${JSON.stringify(clicked)}`}
            />
            <Field<Product>
                id="cb-tpl-3"
                label="Byline"
                byline
                isSearch
                glyphAriaLabel="Search"
                placeholder="Search..."
                displayFn={productName}
                dropdownValues={PRODUCTS}
                renderItem={(item) => (
                    <>
                        <ListThumbnail>
                            <Icon glyph={item.icon} />
                        </ListThumbnail>
                        <ListContent>
                            <ListTitle render={<div />}>{item.name}</ListTitle>
                            <ListByline>
                                {item.type}, {item.price}
                            </ListByline>
                        </ListContent>
                    </>
                )}
            />
        </div>
    );
}

export const Templates: Story = {
    name: 'Templates, columns and bylines',
    parameters: {
        docs: {
            description: {
                story: '`renderItem` renders the items (`fdComboboxItem` and `itemTemplate` in Angular): a secondary column, an icon, or a two-line `byline` item with a thumbnail.'
            }
        }
    },
    render: () => <TemplatesExample />
};

interface GroupItem {
    name: string;
    type: 'Fruits' | 'Vegetables';
}

const GROUP_VALUES: GroupItem[] = [
    { name: 'Apple', type: 'Fruits' },
    { name: 'Banana', type: 'Fruits' },
    { name: 'Pineapple', type: 'Fruits' },
    { name: 'Strawberry', type: 'Fruits' },
    { name: 'Broccoli', type: 'Vegetables' },
    { name: 'Carrot', type: 'Vegetables' },
    { name: 'Jalapeño', type: 'Vegetables' },
    { name: 'Spinach', type: 'Vegetables' }
];
const groupByType: ComboboxGroupFunction<GroupItem> = (items) => ({
    Fruits: items.filter((item) => item.type === 'Fruits'),
    Vegetables: items.filter((item) => item.type === 'Vegetables')
});

const groupsExample = (inCanvas = false) => (
    <div className={COLUMN}>
        <Field<GroupItem>
            inCanvas={inCanvas}
            id="cb-groups"
            label="Groups"
            maxHeight="250px"
            placeholder="Type some text..."
            groupFn={groupByType}
            displayFn={(item) => item?.name ?? ''}
            dropdownValues={GROUP_VALUES}
            note={(value) => `Search term: ${value ?? ''}`}
        />
    </div>
);

export const Groups: Story = {
    parameters: {
        docs: { description: { story: '`groupFn` groups the values under headers.' } }
    },
    render: () => groupsExample()
};

const formsExample = () => (
    <form className={COLUMN}>
        <Field<Product>
            id="cb-form-1"
            label="Communication via objects"
            required
            state="information"
            communicateByObject
            placeholder="Type some text..."
            displayFn={productName}
            dropdownValues={PRODUCTS}
            note={(value) => `Value: ${JSON.stringify(value)}`}
        >
            <ListMessage type="information">Choose a product from the list</ListMessage>
        </Field>
        <Field<Product>
            id="cb-form-2"
            label='Value property "id"'
            communicateByObject
            valueProperty="id"
            defaultValue="C5"
            placeholder="Type some text..."
            displayFn={productName}
            dropdownValues={PRODUCTS}
            note={(value) => `Value: ${JSON.stringify(value)}`}
        />
        <Field<Product>
            id="cb-form-3"
            label="Communication via the displayed text"
            defaultValue="Banana"
            placeholder="Type some text..."
            displayFn={productName}
            dropdownValues={PRODUCTS}
            note={(value) => `Value: ${JSON.stringify(value)}`}
        />
        <Field id="cb-form-4" label="Disabled" disabled defaultValue="Cherry" dropdownValues={FRUITS} />
    </form>
);

export const Forms: Story = {
    parameters: {
        docs: {
            description: {
                story: 'The value as the item (`communicateByObject`), as a property of it (`valueProperty`) or as the text; a list message (`ListMessage` children) at the top of the list; a disabled combobox.'
            }
        }
    },
    render: formsExample
};

const mobileExample = () => (
    <div className={COLUMN}>
        <Field
            id="cb-mobile-1"
            label="Confirmation in the dialog"
            mobile
            placeholder="Search here..."
            mobileConfig={{
                title: 'Fruit',
                approveButtonText: 'Save',
                cancelButtonText: 'Cancel',
                instruction: 'Choose your favourite fruit'
            }}
            dropdownValues={FRUITS}
            note={(value) => `Committed value: ${value || 'None'}`}
        />
        <Field
            id="cb-mobile-2"
            label="Immediate selection"
            mobile
            placeholder="Search here..."
            mobileConfig={{ title: 'Fruit', cancelButtonText: 'Cancel' }}
            dropdownValues={FRUITS}
            note={(value) => `Committed value: ${value || 'None'}`}
        />
    </div>
);

export const Mobile: Story = {
    parameters: {
        docs: {
            description: {
                story: 'In mobile mode the field opens a full-screen dialog with a search field and the list. With `approveButtonText` the choice is applied by the approve button and discarded by Cancel; without it every choice applies at once.'
            }
        }
    },
    render: mobileExample
};

function BehaviourExample() {
    const [log, setLog] = useState<string[]>([]);
    const [asyncValues, setAsyncValues] = useState<string[] | null>(null);
    useEffect(() => {
        const timer = setTimeout(
            () =>
                setAsyncValues([
                    'Apple',
                    'Pineapple',
                    'Tomato',
                    'Grapes',
                    'Pumpkin',
                    'Banana',
                    'Kiwi',
                    'Raspberries',
                    'Watermelons',
                    'Nectarines',
                    'Oranges'
                ]),
            100
        );
        return () => clearTimeout(timer);
    }, []);
    const fruits = ['Apple', 'Banana', 'Kiwi', 'Strawberry', 'Tomato', 'Pineapple'];
    return (
        <div className={COLUMN}>
            <Field
                id="cb-filter"
                label="Custom filter (case-sensitive start of the text)"
                placeholder="Type to filter the list..."
                filterFn={(values: string[], term: string) => values.filter((value) => value.startsWith(term))}
                dropdownValues={fruits}
            />
            <Field
                id="cb-open"
                label="Open state control"
                maxHeight="250px"
                placeholder="Combobox with open state subscription"
                dropdownValues={fruits}
                onOpenChange={(open) => setLog((lines) => [...lines, open ? 'Opened' : 'Closed'])}
                note={() => `onOpenChange: ${log.join(', ') || 'none yet'}`}
            />
            <Field
                id="cb-async"
                label="Values loaded later"
                placeholder="Type some text..."
                dropdownValues={asyncValues}
                note={(value) => `Search term: ${value ?? ''}`}
            />
        </div>
    );
}

export const Behaviour: Story = {
    name: 'Custom filter, open state and async values',
    parameters: {
        docs: {
            description: {
                story: '`filterFn` filters the list, `onOpenChange` reports the list opening and closing, and `dropdownValues` can arrive later (Angular: an async pipe).'
            }
        }
    },
    render: () => <BehaviourExample />
};

function InsideDialogExample() {
    const [reason, setReason] = useState('');
    return (
        <>
            <Dialog
                onOpenChange={(open, details) => {
                    if (!open && details.reason !== 'close-press')
                        setReason(`Dialog dismissed with result: ${details.reason}`);
                }}
            >
                <DialogTrigger render={<Button label="Open dialog" />} />
                <DialogPopup responsivePadding>
                    <DialogHeader>
                        <DialogTitle>Combobox inside a dialog</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Field
                            id="cb-dialog"
                            label="Fruit"
                            maxHeight="250px"
                            width="300px"
                            placeholder="Type some text..."
                            dropdownValues={['Apple', 'Pineapple', 'Banana', 'Kiwi', 'Strawberry']}
                            note={(value) => `Search term: ${value ?? ''}`}
                        />
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose
                            render={<ButtonBar variant="emphasized" label="OK" />}
                            onClick={() => setReason('Dialog closed with result: Continue')}
                        />
                        <DialogClose
                            render={<ButtonBar label="Cancel" />}
                            onClick={() => setReason('Dialog dismissed with result: Cancel')}
                        />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
            <p className={TEXT}>{reason}</p>
        </>
    );
}

export const InsideDialog: Story = {
    name: 'Inside a dialog',
    parameters: {
        docs: {
            description: {
                story: 'Escape closes the list of a combobox in a dialog, and only a second Escape closes the dialog.'
            }
        }
    },
    render: () => <InsideDialogExample />
};

/** fundamental-styles' "As form item" combobox, for the visual comparison. */
const asFormItem = (inCanvas = false) => (
    <div className="flex flex-col gap-4">
        <Field
            id="cb-fs"
            label="Combobox as a form item"
            placeholder="Select Fruit"
            dropdownValues={FS_FRUITS}
            inCanvas={inCanvas}
        />
    </div>
);

export const AsFormItem: Story = {
    name: 'As a form item',
    parameters: {
        docs: { description: { story: "fundamental-styles' combobox as a form item." } }
    },
    render: () => asFormItem()
};

/** fundamental-styles' two-column items, for the visual comparison. */
const twoItems = (inCanvas = false) => (
    <div className={COLUMN}>
        <Field<{ name: string; price: string }>
            inCanvas={inCanvas}
            id="cb-two-items"
            label="Product prices"
            placeholder="Select Product"
            displayFn={(item) => item?.name ?? ''}
            dropdownValues={[
                { name: 'Product 1', price: '1000 EUR' },
                { name: 'Product 2', price: '750 EUR' },
                { name: 'Product 3', price: '780 EUR' },
                { name: 'Product 4', price: '40 EUR' }
            ]}
            renderItem={(item) => (
                <>
                    <ListTitle>{item.name}</ListTitle>
                    <ListSecondary>{item.price}</ListSecondary>
                </>
            )}
        />
    </div>
);

/** Clicks the button of the combobox (or, in mobile mode, its field) and waits for the list. */
async function openCombobox(root: HTMLElement, popup: string, mobile = false): Promise<void> {
    const input = root.querySelector<HTMLInputElement>('input[role=combobox]')!;
    const target = mobile ? input : input.parentElement!.querySelector<HTMLElement>('button[aria-haspopup]')!;
    await userEvent.click(target);
    await waitFor(() => expect(document.querySelector(popup)).not.toBeNull());
    await waitFor(() => expect(input.getAttribute('aria-expanded')).toBe('true'));
}

// The "Open: …" stories show one combobox: while a list is open Base UI hides the rest of the page from assistive
// technology, so the other fields of a story would be focusable elements in hidden content.
export const OpenDropdown: Story = {
    name: 'Open: dropdown',
    tags: ['!autodocs'],
    render: () => (
        <div className={COLUMN}>
            <Field
                inCanvas
                id="cb-open-dropdown"
                label="Standard with custom width (in px)"
                width="300px"
                maxHeight="250px"
                placeholder="Type some text..."
                dropdownValues={FRUITS}
            />
        </div>
    ),
    play: ({ canvasElement }) => openCombobox(canvasElement, '[role=listbox] [role=option]')
};
export const OpenGroups: Story = {
    name: 'Open: groups',
    tags: ['!autodocs'],
    render: () => groupsExample(true),
    play: ({ canvasElement }) => openCombobox(canvasElement, '[role=listbox] [role=group] [role=option]')
};
export const OpenListMessage: Story = {
    name: 'Open: list message',
    tags: ['!autodocs'],
    render: () => (
        <div className={COLUMN}>
            <Field<Product>
                inCanvas
                id="cb-open-message"
                label="Communication via objects"
                required
                state="information"
                communicateByObject
                placeholder="Type some text..."
                displayFn={productName}
                dropdownValues={PRODUCTS}
            >
                <ListMessage type="information">Choose a product from the list</ListMessage>
            </Field>
        </div>
    ),
    play: ({ canvasElement }) => openCombobox(canvasElement, '[role=listbox] [data-slot=list-message]')
};
export const OpenInsideDialog: Story = {
    name: 'Open: inside a dialog',
    tags: ['!autodocs'],
    render: () => <InsideDialogExample />,
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector<HTMLElement>('button')!);
        await waitFor(() => expect(document.querySelector('[role=dialog] input[role=combobox]')).not.toBeNull());
        await openCombobox(document.querySelector<HTMLElement>('[role=dialog]')!, '[role=listbox] [role=option]');
    }
};
export const OpenMobile: Story = {
    name: 'Open: mobile dialog',
    tags: ['!autodocs'],
    render: mobileExample,
    play: ({ canvasElement }) => openCombobox(canvasElement, '[role=dialog] [role=listbox] [role=option]', true)
};
export const OpenAsFormItem: Story = {
    name: 'Open: as a form item',
    tags: ['!autodocs'],
    render: () => asFormItem(true),
    play: ({ canvasElement }) => openCombobox(canvasElement, '[role=listbox] [role=option]')
};
export const OpenFiltered: Story = {
    name: 'Open: filtered',
    tags: ['!autodocs'],
    render: () => asFormItem(true),
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector<HTMLInputElement>('input[role=combobox]')!;
        await userEvent.type(input, 'App');
        await waitFor(() => expect(document.querySelector('[role=listbox] [role=option]')).not.toBeNull());
        await userEvent.keyboard('{ArrowDown}');
    }
};
export const OpenSelected: Story = {
    name: 'Open: selected value',
    tags: ['!autodocs'],
    render: () => (
        <div className="flex flex-col gap-4">
            <Field
                inCanvas
                id="cb-selected"
                label="Selected"
                defaultValue="Apple"
                placeholder="Select Fruit"
                dropdownValues={FS_FRUITS}
            />
        </div>
    ),
    play: ({ canvasElement }) => openCombobox(canvasElement, '[role=listbox] [role=option][aria-selected=true]')
};
export const OpenTwoItems: Story = {
    name: 'Open: two columns',
    tags: ['!autodocs'],
    render: () => twoItems(true),
    play: ({ canvasElement }) => openCombobox(canvasElement, '[role=listbox] [role=option]')
};
export const OpenCompact: Story = {
    name: 'Open: compact',
    tags: ['!autodocs'],
    render: () => <div data-density="compact">{asFormItem(true)}</div>,
    play: ({ canvasElement }) => openCombobox(canvasElement, '[role=listbox] [role=option]')
};
const openState = (index: number): Story => {
    const [state, label, message] = STATES[index]!;
    return {
        name: `Open: ${state}`,
        tags: ['!autodocs'],
        render: () => (
            <div className={COLUMN}>
                <Field
                    inCanvas
                    id={`cb-open-${state}`}
                    label={label}
                    placeholder="Select Fruit"
                    dropdownValues={FS_FRUITS}
                    state={state}
                    stateMessage={message}
                />
            </div>
        ),
        play: ({ canvasElement }) => openCombobox(canvasElement, '[role=listbox] [data-slot=list-message]')
    };
};
export const OpenError = openState(0);
export const OpenWarning = openState(1);
export const OpenInformation = openState(2);
export const OpenSuccess = openState(3);
export const OpenNoMatches: Story = {
    name: 'Open: no matches',
    tags: ['!autodocs'],
    render: () => (
        <div className={COLUMN}>
            <Field
                inCanvas
                id="cb-no-matches"
                label="No matches"
                noMatchesText="No Matches"
                autoComplete={false}
                dropdownValues={FS_FRUITS}
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        await userEvent.type(canvasElement.querySelector<HTMLInputElement>('input[role=combobox]')!, 'xyz');
        await waitFor(() => expect(document.querySelector('[role=status]')?.textContent).toBe('No Matches'));
    }
};

/** The field with the focus in its input and its value state message, for the visual focus case. */
export const Focus: Story = {
    name: 'Focus: default',
    tags: ['!autodocs'],
    render: () => asFormItem(true),
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector<HTMLInputElement>('input[role=combobox]')!;
        input.focus();
        await expect(input).toHaveFocus();
    }
};
