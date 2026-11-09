import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/ui/button/button';
import { LayoutGrid, LayoutGridCol } from '@/ui/layout-grid/layout-grid';
import {
    LayoutPanel,
    LayoutPanelActions,
    LayoutPanelBody,
    LayoutPanelDescription,
    LayoutPanelFilters,
    LayoutPanelFooter,
    LayoutPanelHead,
    LayoutPanelHeader,
    LayoutPanelTitle
} from './layout-panel';

const meta = {
    title: 'Components/Layout Panel',
    component: LayoutPanel,
    subcomponents: {
        LayoutPanelHeader,
        LayoutPanelHead,
        LayoutPanelTitle,
        LayoutPanelDescription,
        LayoutPanelActions,
        LayoutPanelFilters,
        LayoutPanelBody,
        LayoutPanelFooter
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Layout panels are rounded content containers with a header (title, description, actions), filters, body and footer. The parts are placed in that order whatever the order of the children.'
            }
        }
    },
    argTypes: { backgroundImage: { control: 'text' } },
    args: { transparent: false, backgroundImage: '' }
} satisfies Meta<typeof LayoutPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

function Header() {
    return (
        <LayoutPanelHeader>
            <LayoutPanelHead>
                <LayoutPanelTitle>Layout Panel Title</LayoutPanelTitle>
                <LayoutPanelDescription>Layout panel description</LayoutPanelDescription>
            </LayoutPanelHead>
            <LayoutPanelActions>
                <Button label="Action" />
            </LayoutPanelActions>
        </LayoutPanelHeader>
    );
}

export const Basic: Story = {
    parameters: {
        docs: { description: { story: 'Header with title, description and actions, filters, body and footer.' } }
    },
    render: (args) => (
        <LayoutPanel {...args}>
            <Header />
            <LayoutPanelFilters>Filters: Category, Price</LayoutPanelFilters>
            <LayoutPanelBody>Layout panel body</LayoutPanelBody>
            <LayoutPanelFooter>Layout panel footer</LayoutPanelFooter>
        </LayoutPanel>
    )
};

/** fundamental-react's panel: the head's `title` and `description` props, a compact action and two filters. */
function SinglePanel() {
    return (
        <LayoutPanel>
            <LayoutPanelHeader>
                <LayoutPanelHead description="LayoutPanel Description" title="LayoutPanel Header with Actions" />
                <LayoutPanelActions>
                    <Button data-density="compact" glyph="add" label="Add New Button" />
                </LayoutPanelActions>
            </LayoutPanelHeader>
            <LayoutPanelFilters>
                <div>LayoutPanel Filters</div>
                <div className="mt-2 flex flex-wrap gap-2">
                    <Button menu label="Color" />
                    <Button menu label="Size" />
                </div>
            </LayoutPanelFilters>
            <LayoutPanelBody>
                <div>LayoutPanel Body</div>
                <div className="mt-4 rounded-sap-tile-border-corner-radius bg-sap-tile-background p-4 text-sap-tile-text-color shadow-sap-content-shadow0">
                    <div className="font-bold text-sap-tile-title-text-color">Tile Title</div>
                    <p className="m-0 mt-2">Tile Description</p>
                </div>
            </LayoutPanelBody>
            <LayoutPanelFooter>LayoutPanel Footer</LayoutPanelFooter>
        </LayoutPanel>
    );
}

export const SingleLayoutPanel: Story = {
    name: 'Single layout panel',
    parameters: {
        docs: {
            description: {
                story: 'The head takes `title` and `description` props (heading level 3 by default, `headingLevel` to change it). The filter buttons and the tile are placeholders until menu, popover and tile are ported.'
            }
        }
    },
    render: () => <SinglePanel />
};

export const InAResponsiveLayoutGrid: Story = {
    name: 'In a responsive layout grid',
    parameters: {
        docs: {
            description: { story: 'Panels in `LayoutGrid` columns: 8 + 4 and 3 + 9 columns from 600px, stacked below.' }
        }
    },
    render: () => (
        <LayoutGrid>
            {[8, 4, 3, 9].map((span, index) => (
                <LayoutGridCol key={index} span={12} colMd={span}>
                    <SinglePanel />
                </LayoutGridCol>
            ))}
        </LayoutGrid>
    )
};

const cell = 'border-b border-sap-list-border-color px-4 py-2 text-start';
const products = [
    ['Laptop', 'Electronics', '1,299.00 EUR'],
    ['Office chair', 'Furniture', '249.00 EUR'],
    ['Monitor', 'Electronics', '399.00 EUR']
];

export const EdgeBleed: Story = {
    name: 'Edge bleed',
    parameters: {
        docs: {
            description: { story: '`bleed` removes the body padding, for tables and images that reach the edges.' }
        }
    },
    render: () => (
        <div className="flex flex-col gap-6">
            <LayoutPanel>
                <Header />
                <LayoutPanelBody bleed>
                    <table className="w-full border-collapse text-sap-font-size text-sap-list-text-color">
                        <thead className="bg-sap-list-header-background font-bold">
                            <tr>
                                <th className={cell}>Product</th>
                                <th className={cell}>Category</th>
                                <th className={cell}>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((row) => (
                                <tr key={row[0]}>
                                    {row.map((value) => (
                                        <td key={value} className={cell}>
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </LayoutPanelBody>
            </LayoutPanel>
            <LayoutPanel>
                <Header />
                <LayoutPanelBody bleed>
                    <img src="assets/landscape.svg" alt="Landscape" className="block h-40 w-full object-cover" />
                </LayoutPanelBody>
            </LayoutPanel>
        </div>
    )
};

export const Transparent: Story = {
    parameters: { docs: { description: { story: '`transparent` removes the background colour.' } } },
    render: () => (
        <LayoutPanel transparent>
            <LayoutPanelHeader>
                <LayoutPanelHead>
                    <LayoutPanelTitle>Layout Panel Title</LayoutPanelTitle>
                    <LayoutPanelDescription>Layout panel description</LayoutPanelDescription>
                </LayoutPanelHead>
                <LayoutPanelActions>
                    <Button variant="emphasized" label="Action" />
                </LayoutPanelActions>
            </LayoutPanelHeader>
            <LayoutPanelFilters>Filters: Category, Price</LayoutPanelFilters>
            <LayoutPanelBody>Transparent layout panel</LayoutPanelBody>
            <LayoutPanelFooter>Layout panel footer</LayoutPanelFooter>
        </LayoutPanel>
    )
};

export const FooterVariations: Story = {
    name: 'Footer variations',
    parameters: {
        docs: {
            description: { story: '`position` aligns the footer content at the end or the start; centred by default.' }
        }
    },
    render: () => (
        <div className="flex flex-col gap-6">
            <LayoutPanel>
                <Header />
                <LayoutPanelBody>Footer at the end</LayoutPanelBody>
                <LayoutPanelFooter position="end">
                    <Button variant="emphasized" label="Save" />
                    <Button variant="transparent" label="Cancel" />
                </LayoutPanelFooter>
            </LayoutPanel>
            <LayoutPanel>
                <Header />
                <LayoutPanelBody>Footer at the start</LayoutPanelBody>
                <LayoutPanelFooter position="start">
                    <Button variant="emphasized" label="Save" />
                    <Button variant="transparent" label="Cancel" />
                </LayoutPanelFooter>
            </LayoutPanel>
            <LayoutPanel>
                <Header />
                <LayoutPanelBody>Centered footer (default)</LayoutPanelBody>
                <LayoutPanelFooter>Layout panel footer</LayoutPanelFooter>
            </LayoutPanel>
        </div>
    )
};
