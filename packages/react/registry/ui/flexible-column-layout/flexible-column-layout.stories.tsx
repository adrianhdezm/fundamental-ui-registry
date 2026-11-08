import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Bar, BarElement, BarLeft, BarRight } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import {
    DynamicPage,
    DynamicPageContent,
    DynamicPageGlobalActions,
    DynamicPageHeader,
    DynamicPageLayoutActions,
    DynamicPageSubheader
} from '@/ui/dynamic-page/dynamic-page';
import { List, ListItem, ListLink, ListTitle } from '@/ui/list/list';
import { Title } from '@/ui/title/title';
import {
    FlexibleColumnLayout,
    FlexibleColumnLayoutConfigProvider,
    type FlexibleColumnLayout as Layout,
    type FlexibleColumnLayoutBackgroundDesign
} from './flexible-column-layout';

const LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

const LAYOUTS: Layout[] = [
    'OneColumnStartFullScreen',
    'OneColumnMidFullScreen',
    'OneColumnEndFullScreen',
    'TwoColumnsStartExpanded',
    'TwoColumnsMidExpanded',
    'TwoColumnsEndExpanded',
    'ThreeColumnsMidExpanded',
    'ThreeColumnsEndExpanded',
    'ThreeColumnsStartMinimized',
    'ThreeColumnsEndMinimized'
];

const PRODUCTS = ['Notebook Basic 15', 'Notebook Basic 17', 'Ergo Screen E-I', 'Flat Future'];

const TEXT = 'm-0 p-4 font-sap-font-family text-sap-font-size text-sap-text-color';

function ColumnTitle({ children }: { children: string }) {
    return (
        <Bar>
            <BarLeft>
                <BarElement>
                    <Title level={3} headerSize={5}>
                        {children}
                    </Title>
                </BarElement>
            </BarLeft>
        </Bar>
    );
}

function ProductList({ selected, onOpen }: { selected: string; onOpen: (product: string) => void }) {
    return (
        <div className="h-full bg-sap-group-content-background">
            <ColumnTitle>Products</ColumnTitle>
            <List navigationIndicator aria-label="Products">
                {PRODUCTS.map((product) => (
                    <ListItem key={product}>
                        <ListLink
                            href="#"
                            navigated={product === selected}
                            onClick={(event) => {
                                event.preventDefault();
                                onOpen(product);
                            }}
                        >
                            <ListTitle>{product}</ListTitle>
                        </ListLink>
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

interface StoryFclProps {
    backgroundDesign?: FlexibleColumnLayoutBackgroundDesign;
    initial?: Layout;
}

/** The Angular story: a product list, its detail and the supplier, with a layout switcher. */
function StoryFcl({ backgroundDesign = 'solid', initial = 'TwoColumnsMidExpanded' }: StoryFclProps) {
    const [layout, setLayout] = useState<Layout>(initial);
    const [selected, setSelected] = useState(PRODUCTS[0]);
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 font-sap-font-family text-sap-font-size text-sap-text-color">
                <label htmlFor="fcl-layout">Layout</label>
                <select
                    id="fcl-layout"
                    className="h-9 rounded-sap-field-border-corner-radius border border-sap-field-border-color bg-sap-field-background px-2 text-sap-field-text-color"
                    value={layout}
                    onChange={(event) => setLayout(event.target.value as Layout)}
                >
                    {LAYOUTS.map((l) => (
                        <option key={l} value={l}>
                            {l}
                        </option>
                    ))}
                </select>
                <span>
                    Drag the corner to resize: below 960px one column fills the layout, below 1280px at most two.
                </span>
            </div>
            <div
                className="resize-x overflow-hidden border border-dashed border-sap-group-content-border-color"
                style={{ width: '100%', minWidth: '20rem' }}
            >
                {/* 25rem high, as fundamental-styles' examples */}
                <FlexibleColumnLayout
                    className="h-[25rem]"
                    layout={layout}
                    onLayoutChange={setLayout}
                    backgroundDesign={backgroundDesign}
                    startColumn={
                        <ProductList
                            selected={selected}
                            onOpen={(product) => {
                                setSelected(product);
                                setLayout('TwoColumnsMidExpanded');
                            }}
                        />
                    }
                    midColumn={
                        <div className="h-full bg-sap-group-content-background">
                            <Bar>
                                <BarLeft>
                                    <BarElement>
                                        <Title level={3} headerSize={5}>
                                            {selected}
                                        </Title>
                                    </BarElement>
                                </BarLeft>
                                <BarRight>
                                    <BarElement>
                                        <Button label="Supplier" onClick={() => setLayout('ThreeColumnsMidExpanded')} />
                                    </BarElement>
                                    <BarElement>
                                        <Button
                                            variant="transparent"
                                            glyph="decline"
                                            aria-label="Close"
                                            onClick={() => setLayout('OneColumnStartFullScreen')}
                                        />
                                    </BarElement>
                                </BarRight>
                            </Bar>
                            <p className={TEXT}>Details of {selected}: price, availability and the supplier.</p>
                        </div>
                    }
                    endColumn={
                        <div className="h-full bg-sap-group-content-background">
                            <Bar>
                                <BarLeft>
                                    <BarElement>
                                        <Title level={3} headerSize={5}>
                                            Supplier
                                        </Title>
                                    </BarElement>
                                </BarLeft>
                                <BarRight>
                                    <BarElement>
                                        <Button
                                            variant="transparent"
                                            glyph="decline"
                                            aria-label="Close supplier"
                                            onClick={() => setLayout('TwoColumnsMidExpanded')}
                                        />
                                    </BarElement>
                                </BarRight>
                            </Bar>
                            <p className={TEXT}>Very Best Screens, Walldorf</p>
                        </div>
                    }
                />
            </div>
        </div>
    );
}

/** The Angular story with a dynamic page in the mid column. */
function StoryFclDynamicPage() {
    const [layout, setLayout] = useState<Layout>('TwoColumnsMidExpanded');
    const [selected, setSelected] = useState(PRODUCTS[0]);
    return (
        <FlexibleColumnLayout
            className="h-[36rem]"
            layout={layout}
            onLayoutChange={setLayout}
            startColumn={
                <ProductList
                    selected={selected}
                    onOpen={(product) => {
                        setSelected(product);
                        if (layout === 'OneColumnStartFullScreen') setLayout('TwoColumnsMidExpanded');
                    }}
                />
            }
            midColumn={
                <DynamicPage aria-label="Product details" expandContent={false}>
                    <DynamicPageHeader title={selected} subtitle="Price, availability and the supplier">
                        <DynamicPageGlobalActions aria-label="Product actions">
                            <Button variant="transparent" label="Edit" />
                        </DynamicPageGlobalActions>
                        <DynamicPageLayoutActions aria-label="Column actions">
                            {layout === 'OneColumnMidFullScreen' ? (
                                <Button
                                    variant="transparent"
                                    glyph="exit-full-screen"
                                    aria-label="Exit full screen"
                                    title="Exit full screen"
                                    onClick={() => setLayout('TwoColumnsMidExpanded')}
                                />
                            ) : (
                                <Button
                                    variant="transparent"
                                    glyph="full-screen"
                                    aria-label="Full screen"
                                    title="Full screen"
                                    onClick={() => setLayout('OneColumnMidFullScreen')}
                                />
                            )}
                            <Button
                                variant="transparent"
                                glyph="decline"
                                aria-label="Close"
                                title="Close"
                                onClick={() => setLayout('OneColumnStartFullScreen')}
                            />
                        </DynamicPageLayoutActions>
                    </DynamicPageHeader>
                    <DynamicPageSubheader pinnable>
                        Supplier: Very Best Screens, Walldorf. Collapse or pin this header; scrolling the content
                        collapses it unless it is pinned.
                    </DynamicPageSubheader>
                    <DynamicPageContent>
                        {Array.from({ length: 12 }, (_, i) => (
                            <p key={i} className="m-0 mb-4">
                                {LOREM}
                            </p>
                        ))}
                    </DynamicPageContent>
                </DynamicPage>
            }
        />
    );
}

const meta = {
    title: 'Components/Flexible Column Layout',
    component: FlexibleColumnLayout,
    subcomponents: { FlexibleColumnLayoutConfigProvider },
    parameters: {
        docs: {
            description: {
                component:
                    'The flexible column layout shows up to three columns (for example list, detail and detail of the detail). ' +
                    'The layout sets the column widths; separator buttons between visible columns expand or collapse them. ' +
                    'On narrow layouts the columns collapse to two or one, and the layout comes back when there is room again. ' +
                    'Column widths per layout can be changed with `FlexibleColumnLayoutConfigProvider` or `layoutDefinitions`.\n\n' +
                    '```tsx\n' +
                    '<FlexibleColumnLayout\n' +
                    '    layout={layout}\n' +
                    '    onLayoutChange={setLayout}\n' +
                    '    startColumn={<ProductList />}\n' +
                    '    midColumn={<ProductDetail />}\n' +
                    '    endColumn={<Supplier />}\n' +
                    '/>\n' +
                    '```'
            }
        }
    }
} satisfies Meta<typeof FlexibleColumnLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'List, detail and detail-detail',
    render: () => <StoryFcl />
};

export const ThreeColumns: Story = {
    name: 'Three columns, transparent separators',
    render: () => <StoryFcl initial="ThreeColumnsMidExpanded" backgroundDesign="transparent" />
};

export const CustomConfig: Story = {
    name: 'Custom layout widths',
    parameters: {
        docs: {
            description: {
                story: '`FlexibleColumnLayoutConfigProvider` sets TwoColumnsMidExpanded to 50% and 50%; translucent separators.'
            }
        }
    },
    render: () => (
        <FlexibleColumnLayoutConfigProvider layouts={{ TwoColumnsMidExpanded: { start: 50, mid: 50, end: 0 } }}>
            <StoryFcl initial="TwoColumnsMidExpanded" backgroundDesign="translucent" />
        </FlexibleColumnLayoutConfigProvider>
    )
};

export const WithDynamicPage: Story = {
    name: 'With dynamic page',
    parameters: {
        docs: {
            description: {
                story: 'The mid column hosts a dynamic page with a collapsible, pinnable header; its layout actions switch to OneColumnMidFullScreen and close the column.'
            }
        }
    },
    render: () => <StoryFclDynamicPage />
};

const placeholder = (text: string) => <p className={TEXT}>{text}</p>;

export const ThreeColumnsExample: Story = {
    name: 'Three columns, fundamental-styles example',
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' Three Columns Layout example: ThreeColumnsMidExpanded, 25rem high, solid separators. `lgBreakPoint` 1024 keeps three columns on a canvas narrower than 1280px."
            }
        }
    },
    render: () => (
        <FlexibleColumnLayout
            className="h-[25rem]"
            defaultLayout="ThreeColumnsMidExpanded"
            lgBreakPoint={1024}
            startColumn={placeholder('Start column')}
            midColumn={placeholder('Mid column')}
            endColumn={placeholder('End column')}
        />
    )
};
