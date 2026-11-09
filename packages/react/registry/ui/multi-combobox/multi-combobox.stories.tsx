import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
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
import { ListByline, ListContent, ListTitle } from '@/ui/list/list';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { MultiCombobox, type MultiComboboxProps } from './multi-combobox';

interface Food {
    id: string;
    name: string;
    type: 'Fruits' | 'Vegetables';
}

const FOOD: Food[] = [
    { id: 'apple', name: 'Apple', type: 'Fruits' },
    { id: 'banana', name: 'Banana', type: 'Fruits' },
    { id: 'blueberry', name: 'Blueberry', type: 'Fruits' },
    { id: 'dragon', name: 'Dragon Fruit', type: 'Fruits' },
    { id: 'pineapple', name: 'Pineapple', type: 'Fruits' },
    { id: 'strawberry', name: 'Strawberry', type: 'Fruits' },
    { id: 'broccoli', name: 'Broccoli', type: 'Vegetables' },
    { id: 'carrot', name: 'Carrot', type: 'Vegetables' },
    { id: 'jalapeno', name: 'Jalapeño', type: 'Vegetables' },
    { id: 'red-pepper', name: 'Red Pepper', type: 'Vegetables' },
    { id: 'spinach', name: 'Spinach', type: 'Vegetables' },
    { id: 'sweet-potato', name: 'Sweet Potato', type: 'Vegetables' }
];

const COUNTRIES = [
    'Argentina',
    'Australia',
    'Austria',
    'Belgium',
    'Brazil',
    'Canada',
    'Chile',
    'Denmark',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'India',
    'Ireland',
    'Italy',
    'Japan',
    'Mexico',
    'Netherlands',
    'New Zealand',
    'Norway',
    'Portugal',
    'South Africa',
    'Spain',
    'Sweden',
    'United Kingdom',
    'United States'
];

const text = 'm-0 mt-1 block font-sap-font-family text-sap-font-small-size text-sap-content-label-color';
const json = (v: unknown) => JSON.stringify(v);

type PlaygroundArgs = MultiComboboxProps<string>;

const meta = {
    title: 'Components/Multi Combobox',
    component: MultiCombobox,
    parameters: {
        docs: {
            description: {
                component:
                    'Chooses several items; chosen items show as tokens. Typing filters the items (by default the ' +
                    'start of any word); text that matches nothing is rejected with a brief error. The focus stays ' +
                    'in the input: Down and Up highlight options, Space toggles, Enter toggles and closes, Ctrl+A ' +
                    'selects and Ctrl+Shift+A deselects all. While closed, Down and Up put the next item in the ' +
                    'input and Enter chooses it.\n\n' +
                    '```tsx\n' +
                    '<MultiCombobox inputId="fruits" displayKey="name" lookupKey="id" dataSource={fruits} selectedItems={chosen} onSelectedItemsChange={setChosen} />\n' +
                    '```'
            }
        }
    },
    argTypes: {
        state: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] },
        matchingStrategy: { control: 'select', options: ['startsWithPerTerm', 'startsWith', 'contains'] }
    },
    args: {
        placeholder: 'Type a country...',
        'aria-label': 'Countries',
        state: 'default',
        matchingStrategy: 'startsWithPerTerm',
        showSelectAll: false,
        disabled: false,
        readOnly: false
    },
    render: (args) => (
        <div className="max-w-lg">
            <MultiCombobox {...args} dataSource={COUNTRIES} />
        </div>
    )
} satisfies Meta<PlaygroundArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* ------------------------------------------------------------------------------------------------------------------
 * Angular
 * ---------------------------------------------------------------------------------------------------------------- */

function DataSourcesDemo() {
    const [one, setOne] = useState(['Austria']);
    const [two, setTwo] = useState<Food[]>([FOOD[1]]);
    const [three, setThree] = useState<Food[]>([]);
    const [five, setFive] = useState(COUNTRIES.slice(0, 15));
    const [limitless, setLimitless] = useState(false);
    // the data of the third field arrives later, like an HTTP response
    const [loaded, setLoaded] = useState<Food[]>([]);
    useEffect(() => {
        const timer = setTimeout(() => setLoaded(FOOD), 500);
        return () => clearTimeout(timer);
    }, []);
    return (
        <div className="flex max-w-lg flex-col gap-4">
            <FormItem>
                <FormLabel htmlFor="mcb-1">Array of strings (matching anywhere, select all)</FormLabel>
                <MultiCombobox
                    inputId="mcb-1"
                    showSelectAll
                    matchingStrategy="contains"
                    placeholder="Type some text..."
                    dataSource={COUNTRIES}
                    selectedItems={one}
                    onSelectedItemsChange={setOne}
                />
                <small className={text}>{`Selected: ${json(one)}`}</small>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mcb-2">Array of objects (start of any word)</FormLabel>
                <MultiCombobox
                    inputId="mcb-2"
                    displayKey="name"
                    lookupKey="id"
                    placeholder="Type some text..."
                    dataSource={FOOD}
                    selectedItems={two}
                    onSelectedItemsChange={setTwo}
                />
                <small className={text}>{`Selected: ${two.map((i) => i.id).join(', ')}`}</small>
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mcb-3">Loaded later</FormLabel>
                <MultiCombobox
                    inputId="mcb-3"
                    displayKey="name"
                    lookupKey="id"
                    placeholder="Type some text..."
                    dataSource={loaded}
                    selectedItems={three}
                    onSelectedItemsChange={setThree}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mcb-4">{`Limitless: ${limitless}`}</FormLabel>
                <MultiCombobox
                    inputId="mcb-4"
                    placeholder="Type some text..."
                    limitless={limitless}
                    dataSource={COUNTRIES}
                />
                <Button className="mt-2 self-start" label="Toggle limitless" onClick={() => setLimitless(!limitless)} />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mcb-5">&quot;n more&quot; link</FormLabel>
                <MultiCombobox
                    inputId="mcb-5"
                    placeholder="Type some text..."
                    dataSource={COUNTRIES}
                    selectedItems={five}
                    onSelectedItemsChange={setFive}
                />
            </FormItem>
        </div>
    );
}

export const DataSources: Story = { name: 'Data sources', render: () => <DataSourcesDemo /> };

function LayoutDemo() {
    return (
        <div className="flex max-w-lg flex-col gap-4">
            <FormItem>
                <FormLabel htmlFor="mcb-group">Groups</FormLabel>
                <MultiCombobox
                    inputId="mcb-group"
                    group
                    groupKey="type"
                    displayKey="name"
                    lookupKey="id"
                    placeholder="Type some text..."
                    dataSource={FOOD}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mcb-columns">Two columns</FormLabel>
                <MultiCombobox
                    inputId="mcb-columns"
                    displayKey="name"
                    lookupKey="id"
                    secondaryKey="type"
                    showSecondaryText
                    placeholder="Type some text..."
                    dataSource={FOOD}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mcb-byline">Byline template</FormLabel>
                <MultiCombobox
                    inputId="mcb-byline"
                    byline
                    displayKey="name"
                    lookupKey="id"
                    bodyMaxWidth="container"
                    placeholder="Type some text..."
                    dataSource={FOOD}
                    renderItem={(item) => (
                        <ListContent>
                            <ListTitle>{item.name}</ListTitle>
                            <ListByline>{item.type}</ListByline>
                        </ListContent>
                    )}
                />
            </FormItem>
        </div>
    );
}

export const Layout: Story = { name: 'Groups, columns and templates', render: () => <LayoutDemo /> };

const STATES = [
    { state: 'success', label: 'Success', message: 'Success message' },
    { state: 'warning', label: 'Warning', message: 'Warning message' },
    { state: 'error', label: 'Error', message: 'Error message' },
    { state: 'information', label: 'Information', message: 'Information message' }
] as const;

function StatesDemo() {
    return (
        <div className="flex max-w-lg flex-col gap-4">
            {STATES.map((s) => (
                <FormItem key={s.state}>
                    <FormLabel htmlFor={`mcb-state-${s.state}`}>{s.label}</FormLabel>
                    <MultiCombobox
                        inputId={`mcb-state-${s.state}`}
                        placeholder="Type some text..."
                        state={s.state}
                        stateMessage={s.message}
                        dataSource={COUNTRIES}
                    />
                </FormItem>
            ))}
            <FormItem>
                <FormLabel htmlFor="mcb-readonly">Read-only</FormLabel>
                <MultiCombobox
                    inputId="mcb-readonly"
                    readOnly
                    dataSource={COUNTRIES}
                    selectedItems={['Chile', 'Japan']}
                />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="mcb-disabled">Disabled</FormLabel>
                <MultiCombobox
                    inputId="mcb-disabled"
                    disabled
                    dataSource={COUNTRIES}
                    selectedItems={['Chile', 'Japan']}
                />
            </FormItem>
        </div>
    );
}

export const States: Story = { render: () => <StatesDemo /> };

function FormsDemo() {
    const [food, setFood] = useState<Food[]>([FOOD[6]]);
    const [touched, setTouched] = useState(false);
    return (
        <form className="flex max-w-lg flex-col gap-2" onSubmit={(event) => event.preventDefault()}>
            <FormItem>
                <FormLabel htmlFor="mcb-form">Form value</FormLabel>
                <MultiCombobox
                    inputId="mcb-form"
                    displayKey="name"
                    lookupKey="id"
                    placeholder="Select items..."
                    dataSource={FOOD}
                    selectedItems={food}
                    onSelectedItemsChange={setFood}
                    onBlur={() => setTouched(true)}
                />
            </FormItem>
            <small className={text}>{`Form value: ${food.map((f) => f.name).join(', ')}, touched: ${touched}`}</small>
            <div className="flex gap-2">
                <Button
                    type="button"
                    label="Select all fruits"
                    onClick={() => setFood(FOOD.filter((f) => f.type === 'Fruits'))}
                />
                <Button type="button" label="Clear" onClick={() => setFood([])} />
            </div>
        </form>
    );
}

export const Forms: Story = { render: () => <FormsDemo /> };

function MobileDemo() {
    const [selected, setSelected] = useState(['Norway']);
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <FormItem className="max-w-lg" ref={setBox}>
            <FormLabel htmlFor="mcb-mobile">Countries</FormLabel>
            <MultiCombobox
                inputId="mcb-mobile"
                mobile
                showSelectAll
                placeholder="Type some text..."
                mobileConfig={{ title: 'Countries', approveButtonText: 'OK', cancelButtonText: 'Cancel' }}
                dataSource={COUNTRIES}
                selectedItems={selected}
                onSelectedItemsChange={setSelected}
                container={box}
            />
            <small className={text}>{`Selected: ${json(selected)}`}</small>
        </FormItem>
    );
}

export const Mobile: Story = { render: () => <MobileDemo /> };

function DynamicDemo() {
    const [items, setItems] = useState<Food[]>([]);
    const [dataset, setDataset] = useState<'' | Food['type']>('');
    const [selected, setSelected] = useState<Food[]>([]);
    const switchTo = (type: Food['type']) => {
        setItems(FOOD.filter((f) => f.type === type));
        setDataset(type);
        setSelected([]);
    };
    // the first data set arrives later, like an HTTP response
    useEffect(() => {
        const timer = setTimeout(() => switchTo('Fruits'), 500);
        return () => clearTimeout(timer);
    }, []);
    return (
        <div className="flex max-w-lg flex-col gap-4">
            <p className={text}>{`Active data set: ${dataset || 'loading...'}`}</p>
            <SegmentedButton
                aria-label="Data set"
                value={dataset}
                onValueChange={(next) => switchTo(next as Food['type'])}
            >
                <SegmentedButtonItem value="Fruits" label="Fruits" />
                <SegmentedButtonItem value="Vegetables" label="Vegetables" />
            </SegmentedButton>
            <FormItem>
                <FormLabel htmlFor="mcb-dynamic">Search and select</FormLabel>
                <MultiCombobox
                    inputId="mcb-dynamic"
                    displayKey="name"
                    lookupKey="id"
                    placeholder="Type some text..."
                    dataSource={items}
                    selectedItems={selected}
                    onSelectedItemsChange={setSelected}
                />
                <small className={text}>{`Selected: ${json(selected.map((f) => f.name))}`}</small>
            </FormItem>
        </div>
    );
}

export const DynamicDataSource: Story = { name: 'Dynamic data source', render: () => <DynamicDemo /> };

function InsideDialogDemo() {
    const [selected, setSelected] = useState<string[]>([]);
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
                        <DialogTitle>Multi combobox in a dialog</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <FormItem>
                            <FormLabel htmlFor="mcb-dialog">Countries</FormLabel>
                            <MultiCombobox
                                inputId="mcb-dialog"
                                showSelectAll
                                placeholder="Type some text..."
                                dataSource={COUNTRIES}
                                selectedItems={selected}
                                onSelectedItemsChange={setSelected}
                            />
                        </FormItem>
                        <p className={text}>{`Selected: ${selected.join(', ') || 'none'}`}</p>
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose
                            render={<ButtonBar variant="emphasized" label="Interested" />}
                            onClick={() => setReason('Dialog closed with result: Continue')}
                        />
                        <DialogClose
                            render={<ButtonBar label="Cancel" />}
                            onClick={() => setReason('Dialog dismissed with result: Cancel')}
                        />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
            <p className={text}>{reason}</p>
        </>
    );
}

export const InsideDialog: Story = {
    name: 'Inside a dialog',
    parameters: {
        docs: {
            description: {
                story: 'Escape closes the list of a multi-combobox in a dialog; only a second Escape closes the dialog.'
            }
        }
    },
    render: () => <InsideDialogDemo />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Visual reference: fundamental-styles' multi combobox
 * ---------------------------------------------------------------------------------------------------------------- */

/*
 * fundamental-styles' multi comboboxes are inline blocks as wide as their content; their input's padding differs from
 * the tokenizer input's, so the reference stories take their widths (cozy, then compact and high
 * contrast differences) for a pixel comparison.
 */
const AS_FORM_ITEM_WIDTH =
    'max-w-full [--d:0px] compact:[--d:-30px] [--h:0px] hc:[--h:4px] w-[calc(519.359375px+var(--d)+var(--h))]';
const REFERENCE_WIDTH =
    'max-w-full [--d:0px] compact:[--d:-20px] [--h:0px] hc:[--h:4px] w-[calc(475.5px+var(--d)+var(--h))]';

/** fundamental-styles' "As Form Item" multi combobox, with the list rendered in the story. */
function AsFormItemDemo() {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setBox}>
            <FormItem id="mcb-form-item">
                <FormLabel htmlFor="formItemMultiCombobox">Multi Combobox as form item</FormLabel>
                <MultiCombobox
                    inputId="formItemMultiCombobox"
                    className={AS_FORM_ITEM_WIDTH}
                    glyphAriaLabel="down arrow"
                    aria-label="Fruits"
                    dataSource={['Apple', 'Orange', 'Banana', 'Kiwi', 'Lemon']}
                    defaultSelectedItems={['Apple', 'Orange', 'Kiwi', 'Banana']}
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

interface Produce {
    name: string;
    type: string;
    code: string;
}

/** fundamental-styles' grouping and two-column examples: fruits and vegetables with a code. */
const PRODUCE: Produce[] = [
    { name: 'Apple', type: 'Fruits', code: 'A2' },
    { name: 'Orange', type: 'Fruits', code: 'A1' },
    { name: 'Banana', type: 'Fruits', code: 'A3' },
    { name: 'Kiwi', type: 'Fruits', code: 'A1' },
    { name: 'Lemon', type: 'Fruits', code: 'A2' },
    { name: 'Onion', type: 'Vegetables', code: 'A3' },
    { name: 'Tomato', type: 'Vegetables', code: 'A1' }
];

/** A multi-combobox of fundamental-styles' examples, with the list rendered in the story. */
function ReferenceDemo(props: Partial<MultiComboboxProps<Produce>>) {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setBox}>
            <MultiCombobox<Produce>
                inputId="referenceMultiCombobox"
                className={REFERENCE_WIDTH}
                aria-label="Fruits"
                glyphAriaLabel="down arrow"
                displayKey="name"
                lookupKey="name"
                dataSource={PRODUCE}
                defaultSelectedItems={PRODUCE.filter((p) => ['Apple', 'Orange', 'Banana'].includes(p.name))}
                container={box}
                {...props}
            />
        </div>
    );
}

export const OpenGrouping: Story = {
    name: 'Open: grouping (fundamental-styles)',
    tags: ['!autodocs'],
    render: () => <ReferenceDemo group groupKey="type" />,
    play: ({ canvasElement }) =>
        openMultiCombobox(canvasElement, 'referenceMultiCombobox', '[role=listbox] [role=group]')
};

export const OpenTwoColumns: Story = {
    name: 'Open: two columns (fundamental-styles)',
    tags: ['!autodocs'],
    render: () => <ReferenceDemo secondaryKey="code" showSecondaryText dataSource={PRODUCE.slice(0, 3)} />,
    play: ({ canvasElement }) =>
        openMultiCombobox(canvasElement, 'referenceMultiCombobox', '[role=listbox] [role=option]')
};

export const OpenSemantic: Story = {
    name: 'Open: semantic (fundamental-styles)',
    tags: ['!autodocs'],
    render: () => <ReferenceDemo state="success" stateMessage="Success Message" dataSource={PRODUCE.slice(0, 5)} />,
    play: ({ canvasElement }) =>
        openMultiCombobox(canvasElement, 'referenceMultiCombobox', '[role=presentation] [data-slot=list-message]')
};

/* ------------------------------------------------------------------------------------------------------------------
 * Open: … (axe checks the open list or dialog)
 * ---------------------------------------------------------------------------------------------------------------- */

/** Clicks the addon button of the multi-combobox whose input has the given id and waits for its popup. */
async function openMultiCombobox(scope: HTMLElement, inputId: string, popup: string): Promise<void> {
    // the input sits in the field next to the addon button
    const input = scope.querySelector<HTMLInputElement>(`#${inputId}`)!;
    await userEvent.click(
        input.parentElement!.parentElement!.querySelector<HTMLButtonElement>('button[aria-haspopup]')!
    );
    await waitFor(() => expect(document.querySelector(popup)).not.toBeNull());
    await waitFor(() => expect(input.getAttribute('aria-expanded')).toBe('true'));
}

export const OpenDefault: Story = {
    name: 'Open: as form item',
    tags: ['!autodocs'],
    render: () => <AsFormItemDemo />,
    play: ({ canvasElement }) =>
        openMultiCombobox(canvasElement, 'formItemMultiCombobox', '[role=listbox] [role=option]')
};

export const OpenSelectAll: Story = {
    name: 'Open: select all',
    tags: ['!autodocs'],
    render: () => <DataSourcesDemo />,
    play: ({ canvasElement }) => openMultiCombobox(canvasElement, 'mcb-1', '[role=listbox] [role=option]')
};

export const OpenGroups: Story = {
    name: 'Open: groups',
    tags: ['!autodocs'],
    render: () => <LayoutDemo />,
    play: ({ canvasElement }) => openMultiCombobox(canvasElement, 'mcb-group', '[role=listbox] [role=group]')
};

export const OpenColumns: Story = {
    name: 'Open: two columns',
    tags: ['!autodocs'],
    render: () => <LayoutDemo />,
    play: ({ canvasElement }) => openMultiCombobox(canvasElement, 'mcb-columns', '[role=listbox] [role=option]')
};

export const OpenTemplate: Story = {
    name: 'Open: custom item template',
    tags: ['!autodocs'],
    render: () => <LayoutDemo />,
    play: ({ canvasElement }) =>
        openMultiCombobox(canvasElement, 'mcb-byline', '[role=listbox] [data-slot=list-byline]')
};

export const OpenState: Story = {
    name: 'Open: state message',
    tags: ['!autodocs'],
    render: () => <StatesDemo />,
    play: ({ canvasElement }) =>
        openMultiCombobox(canvasElement, 'mcb-state-error', '[role=presentation] [data-slot=list-message]')
};

export const OpenInsideDialog: Story = {
    name: 'Open: inside a dialog',
    tags: ['!autodocs'],
    render: () => <InsideDialogDemo />,
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector<HTMLElement>('button')!);
        await waitFor(() => expect(document.querySelector('[role=dialog] #mcb-dialog')).not.toBeNull());
        await openMultiCombobox(
            document.querySelector<HTMLElement>('[role=dialog]')!,
            'mcb-dialog',
            '[role=listbox] [role=option]'
        );
    }
};

export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: () => <MobileDemo />,
    play: ({ canvasElement }) =>
        openMultiCombobox(canvasElement, 'mcb-mobile', '[role=dialog] [role=listbox] [role=option]')
};
