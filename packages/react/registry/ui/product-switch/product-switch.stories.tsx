import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { ProductSwitch, ProductSwitchBody, type ProductSwitchItem } from './product-switch';

const TEXT = 'font-sap-font-family text-sap-font-size text-sap-text-color';

const ALL: ProductSwitchItem[] = [
    { title: 'Home', subtitle: 'Central Home', icon: 'home', stickToPosition: true, disabledDragAndDrop: true },
    { title: 'Analytics Cloud', subtitle: 'Analytics Cloud', icon: 'business-objects-experience' },
    { title: 'Catalog', subtitle: 'Ariba', icon: 'contacts' },
    { title: 'Guided Buying', icon: 'credit-card' },
    { title: 'Strategic Procurement', icon: 'cart-3' },
    { title: 'Vendor Management', subtitle: 'Fieldglass', icon: 'shipping-status' },
    { title: 'Human Capital Management', icon: 'customer' },
    { title: 'Sales Cloud', subtitle: 'Sales Cloud', icon: 'sales-notification' },
    { title: 'Commerce Cloud', subtitle: 'Commerce Cloud', icon: 'retail-store' },
    { title: 'Marketing Cloud', subtitle: 'Marketing Cloud', icon: 'marketing-campaign' },
    { title: 'Service Cloud', icon: 'family-care' },
    {
        title: 'Customer Data Cloud',
        icon: 'customer-briefing',
        // an image or glyph avatar: initials would be visible text missing from the item's name (WCAG 2.5.3)
        avatar: { glyph: 'customer-briefing', colorAccent: 6 }
    }
];

interface ExampleProps {
    count?: number;
    list?: boolean;
    busy?: boolean;
    custom?: boolean;
}

/** Angular's story product switch: the products (reorderable) and a live region with the product opened. */
function Example({ count = 12, list = false, busy = false, custom = false }: ExampleProps) {
    const [products, setProducts] = useState<ProductSwitchItem[]>(() =>
        ALL.slice(0, count).map((p) => ({ ...p, callback: () => undefined }))
    );
    const [chosen, setChosen] = useState('');
    return (
        <div className="flex items-center justify-end gap-2">
            <span className={TEXT} aria-live="polite">
                {chosen}
            </span>
            <ProductSwitch button={custom ? <Button glyph="grid" label="Products" /> : undefined}>
                <ProductSwitchBody
                    products={products}
                    onProductsChange={setProducts}
                    busy={busy}
                    forceListMode={list}
                    onItemClick={(item) => setChosen(`Opened ${item.title}`)}
                />
            </ProductSwitch>
        </div>
    );
}

const NAVIGATION: ProductSwitchItem[] = [
    { title: 'SAP Start', subtitle: 'Opens in new tab (default)', icon: 'home', url: 'https://www.sap.com' },
    {
        title: 'SAP Ariba',
        subtitle: 'Opens in new tab (explicit)',
        icon: 'contacts',
        url: 'https://www.sap.com/products/spend-management/ariba-network.html',
        target: '_blank'
    },
    {
        title: 'Business Data Cloud',
        subtitle: 'Opens in same tab',
        icon: 'business-objects-experience',
        url: 'https://www.sap.com/products/technology-platform/business-data-cloud.html',
        target: '_self'
    },
    { title: 'Callback Only', subtitle: 'No navigation, fires callback', icon: 'action' }
];

/** Products with urls (and their targets) and one with a callback. */
function NavigationExample() {
    const [chosen, setChosen] = useState('');
    const [products] = useState(() =>
        NAVIGATION.map((p) => (p.url ? p : { ...p, callback: () => setChosen('Custom callback fired') }))
    );
    return (
        <div className="flex items-center justify-end gap-2">
            <span className={TEXT} aria-live="polite">
                {chosen}
            </span>
            <ProductSwitch>
                <ProductSwitchBody defaultProducts={products} />
            </ProductSwitch>
        </div>
    );
}

/** fundamental-styles' products (Large story), for the visual comparison. */
const REFERENCE: ProductSwitchItem[] = [
    { title: 'SAP Start', subtitle: 'Central Home', icon: 'home' },
    { title: 'Analytics Cloud Analytics Cloud', subtitle: 'Analytics Cloud', icon: 'business-objects-experience' },
    { title: 'Catalog', subtitle: 'Ariba', icon: 'contacts' },
    { title: 'Guided Buying', icon: 'credit-card' },
    { title: 'Strategic Procurement', icon: 'cart-3' },
    { title: 'Travel & Expense', subtitle: 'Concur', icon: 'flight' },
    { title: 'Vendor Management', subtitle: 'Fieldglass', icon: 'shipping-status' },
    { title: 'Human Capital Management Human Capital Management', icon: 'customer' },
    { title: 'Sales Cloud', subtitle: 'Sales Cloud', icon: 'sales-notification' },
    { title: 'Commerce Cloud', subtitle: 'Commerce Cloud', icon: 'retail-store' },
    { title: 'Marketing Cloud', subtitle: 'Marketing Cloud', icon: 'marketing-campaign' },
    { title: 'Service Cloud', icon: 'family-care' },
    { title: 'Customer Data Cloud', icon: 'customer-briefing' },
    { title: 'S/4HANA', icon: 'batch-payments' },
    { title: 'Business Technology Platform', icon: 'cloud' },
    { title: 'Intelligent Spend Management', icon: 'expense-report' },
    { title: 'Supply Chain Management', icon: 'supplier' },
    { title: 'Asset Management', icon: 'iphone' },
    { title: 'Extended Planning & Analysis', icon: 'chart-axis' },
    { title: 'Financial Management', icon: 'money-bills' }
];

/** fundamental-styles' Medium and Two Column stories: the second product has a short title. */
const SHORT = [REFERENCE[0], { ...REFERENCE[1], title: 'Analytics Cloud' }, ...REFERENCE.slice(2)];

/** Bodies rendered into the page, as fundamental-styles' static stories. */
function InPage() {
    const label = 'm-0 mb-2 font-sap-font-family text-sap-font-small-size text-sap-content-label-color';
    return (
        <div className="flex flex-col gap-6">
            {(
                [
                    ['Large (4 columns)', REFERENCE, false],
                    ['Medium (3 columns)', SHORT.slice(0, 5), false],
                    ['Two columns', SHORT.slice(0, 2), false],
                    ['List', REFERENCE.slice(0, 14), true]
                ] as const
            ).map(([name, products, list]) => (
                <section key={name} aria-label={name}>
                    <p className={label}>{name}</p>
                    <ProductSwitchBody data-variant={name} defaultProducts={[...products]} forceListMode={list} />
                </section>
            ))}
        </div>
    );
}

/** Opens the product switch from its button (named `name`) and waits for the products. */
function openSwitch(name = 'Product switch'): Story['play'] {
    return async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name }));
        await waitFor(() => expect(document.querySelector('[role=menu] [role=menuitem]')).not.toBeNull());
    };
}

const meta = {
    title: 'Components/Product Switch',
    component: ProductSwitch,
    subcomponents: { ProductSwitchBody } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 640 },
            description: {
                component:
                    'The product switch (usually in the shellbar) opens the products of the user: a grid of four columns for 7 or more products, three for 3 to 6, two for fewer, and a list on small screens. ' +
                    'Products can be reordered by drag and drop (sticky products keep their place). Arrow keys move between them; Enter and Space open them.\n\n' +
                    '```tsx\n' +
                    '<ProductSwitch>\n' +
                    '    <ProductSwitchBody products={products} onProductsChange={setProducts} />\n' +
                    '</ProductSwitch>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        placement: {
            control: 'select',
            options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end']
        }
    },
    args: { placement: 'bottom-end', disabled: false, noArrow: true, focusTrapped: false }
} satisfies Meta<typeof ProductSwitch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <div className="flex justify-end">
            <ProductSwitch {...args}>
                <ProductSwitchBody defaultProducts={ALL} />
            </ProductSwitch>
        </div>
    )
};

export const Large: Story = { name: 'Large (4 columns)', render: () => <Example /> };

export const Medium: Story = { name: 'Medium (3 columns)', render: () => <Example count={6} /> };

export const Small: Story = { name: 'Two columns', render: () => <Example count={2} /> };

export const List: Story = { name: 'List', render: () => <Example list /> };

export const Busy: Story = { name: 'Busy and custom button', render: () => <Example busy custom /> };

export const Navigation: Story = {
    name: 'URL navigation',
    parameters: {
        docs: {
            description: {
                story:
                    'Products with a `url` open it with `window.open` in their `target` (`_blank` by default), unless they have a `callback`. ' +
                    'They are rendered as links, and a target other than `_self` is added to the accessible name.'
            }
        }
    },
    render: () => <NavigationExample />
};

export const Bodies: Story = {
    name: 'Products in the page',
    parameters: {
        docs: {
            description: {
                story: "`ProductSwitchBody` on its own, with fundamental-styles' products: the four layouts, for the visual comparison."
            }
        }
    },
    render: () => <InPage />
};

export const OpenLarge: Story = {
    name: 'Open: large',
    tags: ['!autodocs'],
    render: () => <Example />,
    play: openSwitch()
};

export const OpenMedium: Story = {
    name: 'Open: medium',
    tags: ['!autodocs'],
    render: () => <Example count={6} />,
    play: openSwitch()
};

export const OpenTwoColumns: Story = {
    name: 'Open: two columns',
    tags: ['!autodocs'],
    render: () => <Example count={2} />,
    play: openSwitch()
};

export const OpenList: Story = {
    name: 'Open: list',
    tags: ['!autodocs'],
    render: () => <Example list />,
    play: openSwitch()
};

export const OpenBusy: Story = {
    name: 'Open: busy',
    tags: ['!autodocs'],
    render: () => <Example busy custom />,
    play: openSwitch('Products')
};

export const OpenNavigation: Story = {
    name: 'Open: URL navigation',
    tags: ['!autodocs'],
    render: () => <NavigationExample />,
    play: openSwitch()
};
