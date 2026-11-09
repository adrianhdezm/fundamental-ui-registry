import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { Title } from '@/ui/title/title';
import { Pagination, type PaginationProps } from './pagination';

const HEADING = 'mt-6 mb-2 first:mt-0';
const SMALL = 'm-0 font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

function Heading({ children }: { children: ReactNode }) {
    return (
        <Title level={3} headerSize={5} className={HEADING}>
            {children}
        </Title>
    );
}

function Small({ children }: { children: ReactNode }) {
    return <p className={SMALL}>{children}</p>;
}

/** A pagination whose page (and items per page) the story keeps, as Angular's two-way bindings. */
function Bound({ page: initial = 1, ...props }: Omit<PaginationProps, 'currentPage'> & { page?: number }) {
    const [page, setPage] = useState(initial);
    return <Pagination {...props} currentPage={page} onCurrentPageChange={setPage} />;
}

const meta = {
    title: 'Components/Pagination',
    component: Pagination,
    parameters: {
        docs: {
            description: {
                component:
                    'Previous and next buttons and page numbers with ellipses, an optional items per page select and ' +
                    'the number of results. With more than nine pages the current page is an input. The controls form ' +
                    'one tab stop; Left, Right, Home and End move between them, and page changes are announced. In ' +
                    'mobile mode and on screens up to 1023px it shows first, previous, "Page: [input] of N", next and ' +
                    'last.\n\n' +
                    '```tsx\n' +
                    '<Pagination totalItems={500} currentPage={page} onCurrentPageChange={setPage} />\n' +
                    '<Pagination totalItems={500} itemsPerPageOptions={[10, 20, 50]} itemsPerPage={size} onItemsPerPageChange={setSize} />\n' +
                    '```'
            }
        }
    },
    args: { totalItems: 500, itemsPerPage: 10, mobile: false, displayTotalItems: true }
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: function Render(args) {
        const [page, setPage] = useState(5);
        return <Pagination {...args} currentPage={page} onCurrentPageChange={setPage} />;
    }
};

function BasicExample() {
    const [page, setPage] = useState(5);
    const [notification, setNotification] = useState('');
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const request = (next: number) => {
        setNotification('loading...');
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            setPage(next);
            setNotification('page change success!');
        }, 1000);
    };
    return (
        <>
            <Pagination
                aria-label="Basic pagination example"
                displayTotalItems={false}
                totalItems={50}
                currentPage={page}
                onPageChangeStart={request}
            />
            <Button label="Go to page 1" onClick={() => request(1)} />
            {notification && <Small>{notification}</Small>}
        </>
    );
}

export const Basic: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'The page changes when `currentPage` is updated: here after a simulated request started by ' +
                    '`onPageChangeStart`.'
            }
        }
    },
    render: () => <BasicExample />
};

export const ShowingItems: Story = {
    name: 'Showing items',
    parameters: {
        docs: { description: { story: '`renderDisplayText` sets the text that shows the items on the page.' } }
    },
    render: () => (
        <Bound
            aria-label="Pagination with renderDisplayText property"
            totalItems={50}
            itemsPerPage={10}
            renderDisplayText={(showing) => `From ${showing.from} to ${showing.to}. Total items ${showing.totalCount}`}
        />
    )
};

function ItemsPerPageExample() {
    const [size, setSize] = useState(4);
    const [customSize, setCustomSize] = useState(5);
    return (
        <>
            <Heading>
                <code>itemsPerPage={'{15}'}</code>: items per page (10 by default)
            </Heading>
            <Bound aria-label="Pagination with itemsPerPage property" totalItems={150} itemsPerPage={15} page={2} />
            <Heading>
                <code>itemsPerPageOptions={'{[4, 8, 16]}'}</code>: the default select
            </Heading>
            <Bound
                aria-label="Pagination with itemsPerPageOptions property"
                totalItems={150}
                itemsPerPageOptions={[4, 8, 16]}
                itemsPerPage={size}
                onItemsPerPageChange={setSize}
                page={2}
            />
            <Heading>Custom items per page: a segmented button</Heading>
            <Small>
                <code>renderItemsPerPage</code> gets the options as <code>pageOptions</code> and the selection callback
                as <code>onSelect</code>.
            </Small>
            <Bound
                aria-label="Pagination with custom items"
                totalItems={150}
                itemsPerPage={customSize}
                itemsPerPageOptions={[2, 5, 100]}
                onItemsPerPageChange={setCustomSize}
                page={2}
                renderItemsPerPage={({ onSelect, pageOptions }) => (
                    <SegmentedButton
                        aria-label="Items per page"
                        value={`${customSize}`}
                        onValueChange={(value) => onSelect(Number(value))}
                    >
                        {pageOptions.map((count) => (
                            <SegmentedButtonItem
                                key={count}
                                value={`${count}`}
                                label={`${count}`}
                                aria-label={`Show ${count} items per page`}
                            />
                        ))}
                    </SegmentedButton>
                )}
            />
        </>
    );
}

export const ItemsPerPage: Story = {
    name: 'Items per page',
    render: () => <ItemsPerPageExample />
};

function MobileExample() {
    const [size, setSize] = useState(4);
    return (
        <Bound
            aria-label="Mobile pagination"
            mobile
            totalItems={2000}
            itemsPerPage={size}
            onItemsPerPageChange={setSize}
            itemsPerPageOptions={[4, 8, 16, 32]}
            page={500}
        />
    );
}

export const Mobile: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Pagination switches to the mobile layout below 1024px; `mobile` shows it at any width. The values ' +
                    'are fundamental-styles’ (Angular: 50 items, 4 per page, page 2).'
            }
        }
    },
    render: () => <MobileExample />
};

/** fundamental-styles' examples: a pagination with more than nine pages and one with less, one item per page. */
function PagesExample({ name, page, short }: { name: string; page: number; short: number }) {
    return (
        <>
            <Heading>&gt; 9 Pages</Heading>
            <Bound
                id={`pg-${name}-long`}
                aria-label={`${name} page example, pagination with more than 9 pages`}
                totalItems={500}
                itemsPerPage={1}
                page={page}
            />
            <Heading>&lt; 9 Pages</Heading>
            <Bound
                id={`pg-${name}-short`}
                aria-label={`${name} page example, pagination with less than 9 pages`}
                totalItems={3}
                itemsPerPage={1}
                page={short}
            />
        </>
    );
}

export const FirstPage: Story = {
    name: 'First page',
    parameters: { docs: { description: { story: 'fundamental-styles’ First Page: one item per page.' } } },
    render: () => <PagesExample name="first" page={1} short={1} />
};

export const MiddlePage: Story = {
    name: 'Middle page',
    parameters: { docs: { description: { story: 'fundamental-styles’ Middle Page.' } } },
    render: () => <PagesExample name="middle" page={300} short={2} />
};

export const LastPage: Story = {
    name: 'Last page',
    parameters: { docs: { description: { story: 'fundamental-styles’ Last Page.' } } },
    render: () => <PagesExample name="last" page={500} short={3} />
};

function PerPageExample() {
    const [size, setSize] = useState(4);
    return (
        <Bound
            id="pg-per-page"
            aria-label="per page page example, pagination with more than 9 pages"
            totalItems={2000}
            itemsPerPage={size}
            onItemsPerPageChange={setSize}
            itemsPerPageOptions={[4, 8, 16, 32]}
            page={500}
        />
    );
}

export const PerPage: Story = {
    name: 'Per page',
    parameters: { docs: { description: { story: 'fundamental-styles’ Per Page: a select for the items per page.' } } },
    render: () => <PerPageExample />
};

export const Primary: Story = {
    parameters: { docs: { description: { story: 'fundamental-react’s primary pagination: 101 items.' } } },
    render: () => <Pagination totalItems={101} />
};

export const InitialPage: Story = {
    name: 'Initial page',
    parameters: {
        docs: {
            description: { story: '`defaultCurrentPage` (fundamental-react’s `initialPage`) for an uncontrolled page.' }
        }
    },
    render: () => <Pagination totalItems={101} defaultCurrentPage={5} />
};

export const HideTotal: Story = {
    name: 'Hide total items',
    render: () => <Pagination totalItems={101} displayTotalItems={false} />
};

export const TotalText: Story = {
    name: 'Total text',
    parameters: {
        docs: {
            description: { story: '`totalResultsLabel` (fundamental-react’s `totalText`); `{total}` is replaced.' }
        }
    },
    render: () => <Pagination totalItems={101} totalResultsLabel="{total} Dalmations" />
};

export const PageSizes: Story = {
    name: 'Page sizes',
    parameters: {
        docs: {
            description: {
                story:
                    '`itemsPerPage` 25 and 0: sizes are rounded down and at least 1 (fundamental-react falls back to ' +
                    '10 for 0).'
            }
        }
    },
    render: () => (
        <>
            <Heading>25 items per page</Heading>
            <Pagination aria-label="25 items per page" totalItems={101} itemsPerPage={25} />
            <Heading>0 items per page</Heading>
            <Pagination aria-label="0 items per page" totalItems={101} itemsPerPage={0} />
        </>
    )
};

export const ManyPages: Story = {
    name: 'Many pages',
    parameters: {
        docs: {
            description: {
                story:
                    'fundamental-react’s `visiblePageTotal` examples: the pages shown are always the ends and two on ' +
                    'each side of the current page.'
            }
        }
    },
    render: () => (
        <>
            <Heading>221 items</Heading>
            <Bound aria-label="221 items" totalItems={221} page={12} />
            <Heading>10 items, one per page</Heading>
            <Bound aria-label="10 items, one per page" totalItems={10} itemsPerPage={1} />
            <Heading>200 items, 0 per page</Heading>
            <Bound aria-label="200 items, 0 per page" totalItems={200} itemsPerPage={0} />
        </>
    )
};

export const OpenItemsPerPage: Story = {
    name: 'Open: items per page',
    tags: ['!autodocs'],
    render: () => <ItemsPerPageExample />,
    play: async ({ canvasElement }) => {
        const combobox = canvasElement.querySelector<HTMLElement>('[role=combobox]')!;
        await userEvent.click(combobox);
        await waitFor(() => expect(document.querySelector('[role=listbox] [role=option]')).not.toBeNull());
        await waitFor(() => expect(combobox.getAttribute('aria-expanded')).toBe('true'));
    }
};
