import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Avatar } from '@/ui/avatar/avatar';
import { Button } from '@/ui/button/button';
import { Link } from '@/ui/link/link';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import {
    GridList,
    GridListFilterBar,
    GridListFooter,
    GridListGroupHeader,
    GridListItem,
    GridListItemBody,
    GridListItemFooterBar,
    GridListItemImage,
    GridListItemToolbar,
    GridListMoreButton,
    GridListTitleBar,
    GridListTitleBarSpacer,
    type GridListActions,
    type GridListItemProps,
    type GridListItemType,
    type GridListSelectionMode
} from './grid-list';

interface Product {
    id: number;
    name: string;
    vendor: string;
    type: GridListItemType;
    counter?: number;
}

const PRODUCTS: Product[] = [
    { id: 1, name: 'Notebook Basic 15', vendor: 'Very Best Screens', type: 'navigation', counter: 10 },
    { id: 2, name: 'Notebook Basic 17', vendor: 'Very Best Screens', type: 'detail' },
    { id: 3, name: 'Notebook Professional 15', vendor: 'Smartcards', type: 'active', counter: 5 },
    { id: 4, name: 'Ergo Screen E-I', vendor: 'Technocom', type: 'detailsAndActive' },
    { id: 5, name: 'Flat Future', vendor: 'Red Point Stores', type: 'inactive' }
];

const productImage = (
    <GridListItemImage render={<Avatar size="s" image="assets/landscape.svg" aria-label="Product image" />} />
);

/** The address and e-mail of fundamental-styles' examples. */
const BODY = (
    <GridListItemBody>
        <p className="m-0">781 Main Street</p>
        <p className="m-0">Anytown, SD 57401</p>
        <p className="m-0 mb-3.5">USA</p>
        <Link href="#">john_li@example.com</Link>
    </GridListItemBody>
);

/** A contact card as in fundamental-styles' examples. */
function Contact({ children, ...props }: GridListItemProps & { children?: ReactNode }) {
    return (
        <GridListItem title="John Li" description="Product Owner, Company B" {...props}>
            {children}
            <GridListItemImage render={<Avatar size="s" image="assets/person.svg" aria-label="Photo of John Li" />} />
            {BODY}
        </GridListItem>
    );
}

/** fundamental-styles' title bar: the title with the count, then sort, filter and group buttons. */
function ProductsTitleBar({ count = '(420)', className }: { count?: string | null; className?: string }) {
    return (
        <GridListTitleBar title="Products" additionalTitle={count} className={className}>
            <GridListTitleBarSpacer />
            <Button variant="transparent" glyph="sort" aria-label="Sort" title="Sort" />
            <Button variant="transparent" glyph="filter" aria-label="Filter" title="Filter" />
            <Button variant="transparent" glyph="group-2" aria-label="Group" title="Group" />
        </GridListTitleBar>
    );
}

const MODES: GridListSelectionMode[] = [
    'none',
    'multiSelect',
    'singleSelect',
    'singleSelectLeft',
    'singleSelectRight',
    'delete'
];

function SelectionModesDemo() {
    const actions = useRef<GridListActions>(null);
    const [mode, setMode] = useState<GridListSelectionMode>('multiSelect');
    const [products, setProducts] = useState(PRODUCTS);
    const [selection, setSelection] = useState<number[]>([]);
    const [log, setLog] = useState('none');
    return (
        <div className="flex flex-col gap-4">
            <SegmentedButton
                aria-label="Selection mode"
                value={mode}
                onValueChange={(value) => setMode(value as GridListSelectionMode)}
            >
                {MODES.map((m) => (
                    <SegmentedButtonItem key={m} value={m} label={m} />
                ))}
            </SegmentedButton>
            <GridListTitleBar title="Products" additionalTitle={`(${products.length})`} className="px-2">
                <GridListTitleBarSpacer />
                <Button variant="transparent" glyph="sort" aria-label="Sort" title="Sort" />
                <Button variant="transparent" glyph="filter" aria-label="Filter" title="Filter" />
            </GridListTitleBar>
            <GridList<number>
                aria-label="Products"
                actionsRef={actions}
                selectionMode={mode}
                onValueChange={setSelection}
            >
                {products.map((product) => (
                    <GridListItem<number>
                        key={product.id}
                        value={product.id}
                        type={product.type}
                        counter={product.counter}
                        title={product.name}
                        description={product.vendor}
                        selected={product.id === 1}
                        onPress={() => setLog(`press ${product.name}`)}
                        onDetail={() => setLog(`detail ${product.name}`)}
                        onNavigate={() => setLog(`navigate ${product.name}`)}
                        onDelete={() => {
                            setProducts((list) => list.filter((p) => p.id !== product.id));
                            setLog(`delete ${product.id}`);
                        }}
                    >
                        {productImage}
                        <GridListItemBody>
                            <p className="m-0">781 Main Street</p>
                            <p className="m-0">Anytown, SD 57401</p>
                            <p className="m-0">USA</p>
                        </GridListItemBody>
                    </GridListItem>
                ))}
            </GridList>
            <div className="flex items-center gap-4 font-sap-font-family text-sap-font-size text-sap-text-color">
                <Button label="Clear selection" onClick={() => actions.current?.clearSelection()} />
                <Button label="Reset items" onClick={() => setProducts(PRODUCTS)} />
                <span aria-live="polite">
                    Selection: {selection.join(', ') || 'none'} · Last event: {log}
                </span>
            </div>
        </div>
    );
}

const meta = {
    title: 'Components/Grid List',
    component: GridList,
    subcomponents: {
        GridListItem,
        GridListItemImage,
        GridListItemBody,
        GridListItemToolbar,
        GridListItemFooterBar,
        GridListTitleBar,
        GridListTitleBarSpacer,
        GridListGroupHeader,
        GridListFilterBar,
        GridListMoreButton,
        GridListFooter
    } as Meta['subcomponents'],
    parameters: {
        docs: {
            description: {
                component:
                    'Grid lists show items as cards in a responsive grid (`layoutPattern` sets the items per row for ' +
                    'XL, L, M and S screens). Items can be selected (multiSelect, singleSelect with or without a ' +
                    'radio button), deleted, navigated or activated. Arrow keys move between items (up and down by ' +
                    'row), Enter or F2 moves into the item and Escape or F2 back, Space selects; in multi selection ' +
                    'Shift with arrows, Home, End or a click selects ranges.'
            }
        }
    }
} satisfies Meta<typeof GridList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SelectionModes: Story = {
    name: 'Selection modes and item types',
    render: () => <SelectionModesDemo />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const grid = canvas.getByRole('grid', { name: 'Products' });
        const cards = within(grid).getAllByRole('gridcell');
        // the first item starts selected (its `selected` prop)
        await expect(cards[0]).toHaveAttribute('aria-selected', 'true');
        cards[0].focus();
        await userEvent.keyboard('{ArrowRight} ');
        await expect(cards[1]).toHaveAttribute('aria-selected', 'true');
        await expect(canvas.getByText(/Selection: 1, 2/)).toBeVisible();
    }
};

/** One example of fundamental-styles' Selection stories: four contacts, the given ones selected. */
function SelectionExample({ mode, selected }: { mode: GridListSelectionMode; selected: number[] }) {
    return (
        <GridList<number> aria-label="Contacts" selectionMode={mode} defaultValue={selected}>
            <ProductsTitleBar />
            <Contact value={1} type="navigation" counter={10} />
            <Contact value={2} type="detail" />
            <Contact value={3} counter={5} />
            <Contact value={4} />
        </GridList>
    );
}

export const SelectionNone: Story = {
    name: 'Selection: none',
    render: () => <SelectionExample mode="none" selected={[]} />
};

export const SelectionMulti: Story = {
    name: 'Selection: multiple',
    render: () => <SelectionExample mode="multiSelect" selected={[1, 3]} />
};

export const SelectionSingle: Story = {
    name: 'Selection: single (the item)',
    render: () => <SelectionExample mode="singleSelect" selected={[1]} />
};

export const SelectionSingleLeft: Story = {
    name: 'Selection: single, radio at the start',
    render: () => <SelectionExample mode="singleSelectLeft" selected={[2]} />
};

export const SelectionSingleRight: Story = {
    name: 'Selection: single, radio at the end',
    render: () => <SelectionExample mode="singleSelectRight" selected={[2]} />
};

export const DeleteMode: Story = {
    name: 'Delete mode',
    render: () => <SelectionExample mode="delete" selected={[]} />
};

export const States: Story = {
    name: 'States',
    render: () => (
        <GridList aria-label="Contacts">
            <ProductsTitleBar count="(6)" />
            <GridListGroupHeader>State: Unread</GridListGroupHeader>
            <Contact state="unread" type="navigation" counter={10} />
            <GridListGroupHeader>State: Error</GridListGroupHeader>
            <Contact state="error" status="error" type="detail" />
            <Contact state="error">
                <GridListItemFooterBar>Custom error message</GridListItemFooterBar>
            </Contact>
            <GridListGroupHeader>State: Locked</GridListGroupHeader>
            <Contact state="locked" />
            <GridListGroupHeader>State: Draft</GridListGroupHeader>
            <Contact state="draft">
                <GridListItemToolbar>Custom text</GridListItemToolbar>
            </Contact>
            <Contact state="draft" type="active" navigated />
        </GridList>
    )
};

export const Statuses: Story = {
    name: 'Highlight statuses',
    render: () => (
        <GridList aria-label="Contacts">
            <Contact status="success" />
            <Contact status="warning" />
            <Contact status="error" />
            <Contact status="neutral" />
        </GridList>
    )
};

export const Layout: Story = {
    name: 'Layout patterns',
    render: () => (
        <div className="flex flex-col gap-6">
            <GridList aria-label="Two per row" layoutPattern="XL2-L2-M2-S1">
                <GridListTitleBar title="layoutPattern XL2-L2-M2-S1" />
                <Contact type="active" />
                <Contact type="active" />
                <Contact type="active" />
            </GridList>
            <GridList aria-label="Item spans" layoutPattern="XL4-L3-M2-S1">
                <GridListTitleBar title="Item layoutItemPattern XL6-L8-M12 next to default items" />
                <Contact layoutItemPattern="XL6-L8-M12" />
                <Contact />
                <Contact />
            </GridList>
            <GridList aria-label="Fixed width" layoutPattern="XL6-L4-M3-S2">
                <GridListTitleBar title="Fixed item width, auto height and no padding" />
                <GridListItem width="12rem" autoHeight title="Auto height">
                    <GridListItemBody>Short</GridListItemBody>
                </GridListItem>
                <GridListItem width="12rem" title="Row height">
                    <GridListItemBody>Stretches to the row</GridListItemBody>
                </GridListItem>
                <GridListItem width="12rem" noPadding aria-label="Landscape">
                    <GridListItemBody
                        render={<img src="assets/landscape.svg" alt="Landscape" className="block h-32 object-cover" />}
                    />
                </GridListItem>
                <GridListItem width="12rem" autoHeight title="Tall content">
                    <GridListItemBody>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                    </GridListItemBody>
                </GridListItem>
            </GridList>
        </div>
    )
};

const ALL = [...PRODUCTS, ...PRODUCTS.map((p) => ({ ...p, id: p.id + 10, name: `${p.name} II` }))];

function MoreDemo() {
    const [count, setCount] = useState(4);
    const [filtered, setFiltered] = useState(true);
    return (
        <GridList aria-label="Products">
            <GridListTitleBar title="Products" />
            {filtered && (
                <GridListFilterBar onClose={() => setFiltered(false)}>
                    Filtered by: Vendor (Very Best Screens, Smartcards)
                </GridListFilterBar>
            )}
            {ALL.slice(0, count).map((product) => (
                <GridListItem
                    key={product.id}
                    type={product.type}
                    counter={product.counter}
                    title={product.name}
                    description={product.vendor}
                >
                    {productImage}
                    <GridListItemBody>781 Main Street, Anytown</GridListItemBody>
                </GridListItem>
            ))}
            {count < ALL.length && (
                <GridListMoreButton
                    displayCount={count}
                    totalCount={ALL.length}
                    onShowMore={() => setCount(count + 2)}
                />
            )}
            <GridListFooter>
                Footer text: {count} of {ALL.length} products shown.
            </GridListFooter>
        </GridList>
    );
}

export const More: Story = {
    name: 'Filter bar, more button and footer',
    render: () => <MoreDemo />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /More/ }));
        await expect(canvas.getByText('Footer text: 6 of 10 products shown.')).toBeVisible();
    }
};

/** fundamental-styles' "More" example: the more button after four contacts. */
export const MoreButton: Story = {
    name: '"More" button',
    render: () => (
        <GridList aria-label="Contacts">
            <ProductsTitleBar count={null} />
            <Contact type="navigation" counter={10} />
            <Contact type="detail" />
            <Contact />
            <Contact />
            <GridListMoreButton displayCount={5} totalCount={10} />
        </GridList>
    )
};

/** fundamental-styles' Filter Infobar and Footer examples. */
export const FilterAndFooter: Story = {
    name: 'Filter info bar and footer',
    render: () => (
        <GridList aria-label="Contacts">
            <ProductsTitleBar />
            <GridListFilterBar>Filtered by: Company (Company A, Company B)</GridListFilterBar>
            <Contact />
            <Contact />
            <GridListFooter>This is footer text</GridListFooter>
        </GridList>
    )
};

function GroupDemo() {
    const [grouped, setGrouped] = useState(true);
    const card = (n: number) => (
        <GridListItem key={n} title={`Title ${n}`} description={`Description ${n}`}>
            <GridListItemToolbar>Custom text</GridListItemToolbar>
            {productImage}
            <GridListItemBody>781 Main Street, Anytown</GridListItemBody>
        </GridListItem>
    );
    return (
        <GridList aria-label="Products by company">
            <GridListTitleBar title="Products" additionalTitle="(7)" />
            {grouped && (
                <>
                    <GridListFilterBar onClose={() => setGrouped(false)}>
                        Grouped by: Company (Company A, Company B)
                    </GridListFilterBar>
                    <GridListGroupHeader>Company: Company A</GridListGroupHeader>
                </>
            )}
            {[1, 2, 3, 4].map(card)}
            {grouped && <GridListGroupHeader>Company: Company B</GridListGroupHeader>}
            {[5, 6, 7].map(card)}
        </GridList>
    );
}

export const Group: Story = {
    name: 'Groups',
    render: () => <GroupDemo />
};

function FocusDemo() {
    const actions = useRef<GridListActions>(null);
    return (
        <GridList aria-label="Products" actionsRef={actions}>
            <GridListTitleBar title="Products" additionalTitle={`(${PRODUCTS.length})`}>
                <GridListTitleBarSpacer />
                <Button variant="transparent" label="Focus first" onClick={() => actions.current?.focusItem(0)} />
                <Button
                    variant="transparent"
                    label="Focus last"
                    onClick={() => actions.current?.focusItem(PRODUCTS.length - 1)}
                />
            </GridListTitleBar>
            {PRODUCTS.map((product) => (
                <GridListItem
                    key={product.id}
                    type={product.type}
                    counter={product.counter}
                    title={product.name}
                    description={product.vendor}
                >
                    {productImage}
                    {BODY}
                </GridListItem>
            ))}
        </GridList>
    );
}

export const FocusProgrammatically: Story = {
    name: 'Focusing an item programmatically',
    render: () => <FocusDemo />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Focus last' }));
        const items = canvasElement.querySelectorAll<HTMLElement>('[data-grid-list-item]');
        await expect(items[items.length - 1]).toHaveFocus();
    }
};

export const HeadingLevel: Story = {
    name: 'Heading level',
    render: () => (
        <GridList aria-label="Products">
            <GridListTitleBar
                title="Products (heading level 3)"
                headingLevel={3}
                additionalTitle={`(${PRODUCTS.length})`}
            />
            <GridListGroupHeader headingLevel={4}>Group (heading level 4)</GridListGroupHeader>
            {PRODUCTS.map((product) => (
                <GridListItem key={product.id} title={product.name} description={product.vendor} titleLevel={5}>
                    {productImage}
                </GridListItem>
            ))}
        </GridList>
    )
};
