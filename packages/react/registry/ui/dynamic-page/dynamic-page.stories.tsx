import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type ReactNode } from 'react';
import { Avatar } from '@/ui/avatar/avatar';
import { Bar, BarElement, BarLeft, BarRight } from '@/ui/bar/bar';
import { Breadcrumb, BreadcrumbItem } from '@/ui/breadcrumb/breadcrumb';
import { Button } from '@/ui/button/button';
import { FormLabel } from '@/ui/form/form';
import { Link } from '@/ui/link/link';
import { List, ListItem, ListLink, ListTitle } from '@/ui/list/list';
import { MessageStrip } from '@/ui/message-strip/message-strip';
import { ObjectNumber } from '@/ui/object-number/object-number';
import { ObjectStatus } from '@/ui/object-status/object-status';
import { Tab, TabList } from '@/ui/tabs/tabs';
import { Text } from '@/ui/text/text';
import { Title } from '@/ui/title/title';
import { Toolbar, ToolbarItem } from '@/ui/toolbar/toolbar';
import {
    Wizard,
    WizardContent,
    WizardNavigation,
    WizardNextStep,
    WizardProgressBar,
    WizardStep,
    WizardStepIndicator,
    type WizardStepStatus
} from '@/ui/wizard/wizard';
import {
    DynamicPage,
    DynamicPageBreadcrumb,
    DynamicPageContent,
    DynamicPageFooter,
    DynamicPageGlobalActions,
    DynamicPageHeader,
    DynamicPageLayoutActions,
    DynamicPageSubheader,
    DynamicPageTabs,
    DynamicPageTitleContent,
    type DynamicPageActions,
    type DynamicPageResponsiveSize
} from './dynamic-page';

const meta = {
    title: 'Components/Dynamic Page',
    component: DynamicPage,
    subcomponents: {
        DynamicPageHeader,
        DynamicPageSubheader,
        DynamicPageContent,
        DynamicPageFooter,
        DynamicPageBreadcrumb,
        DynamicPageGlobalActions,
        DynamicPageLayoutActions,
        DynamicPageTitleContent,
        DynamicPageTabs
    },
    parameters: {
        layout: 'fullscreen',
        docs: {
            story: { inline: false, iframeHeight: 680 },
            description: {
                component:
                    'A dynamic page has a title area (`DynamicPageHeader`: breadcrumb, title, key information, global and layout actions), a collapsible header (`DynamicPageSubheader`), optional tabs and scrolling content (`DynamicPageContent`). ' +
                    'Clicking the title area, the collapse button, Enter or Space on the header toggle, or scrolling the content collapses the header; a pinned header stays expanded. ' +
                    'Paddings and the position of the layout actions adapt to the width of the page.\n\n' +
                    '```tsx\n' +
                    '<DynamicPage aria-label="Product">\n' +
                    '    <DynamicPageHeader title="Product" subtitle="Details">\n' +
                    '        <DynamicPageBreadcrumb><Breadcrumb>…</Breadcrumb></DynamicPageBreadcrumb>\n' +
                    '        <DynamicPageGlobalActions><Button label="Edit" /></DynamicPageGlobalActions>\n' +
                    '    </DynamicPageHeader>\n' +
                    '    <DynamicPageSubheader pinnable>Header content</DynamicPageSubheader>\n' +
                    '    <DynamicPageContent>Content</DynamicPageContent>\n' +
                    '</DynamicPage>\n' +
                    '```'
            }
        }
    }
} satisfies Meta<typeof DynamicPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const LOREM =
    'Dolor sit lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius assumenda, quidem natus optio repudiandae deleniti in atque quis, sed cum asperiores minus rerum incidunt unde quod fuga amet ea reprehenderit. ';

const TITLE = 'Balenciaga Triple S Trainers';
const SUBTITLE = 'Oversized multimaterial sneakers with quilted effect';

const BREADCRUMB = (
    <DynamicPageBreadcrumb>
        <Breadcrumb ariaLabel="Breadcrumbs">
            <BreadcrumbItem>
                <Link href="#">Men</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
                <Link href="#">Shoes</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
                <span aria-current="page">Running Shoes</span>
            </BreadcrumbItem>
        </Breadcrumb>
    </DynamicPageBreadcrumb>
);

const GLOBAL_ACTIONS = (
    <DynamicPageGlobalActions aria-label="Product actions">
        <Button variant="positive" label="Accept" />
        <Button variant="negative" label="Reject" />
    </DynamicPageGlobalActions>
);

const LAYOUT_ACTIONS = (
    <DynamicPageLayoutActions aria-label="Page actions">
        <Button variant="transparent" glyph="resize" aria-label="Resize" title="Resize" />
        <Button variant="transparent" glyph="exit-full-screen" aria-label="Exit full screen" title="Exit full screen" />
        <Button variant="transparent" glyph="decline" aria-label="Close" title="Close" />
    </DynamicPageLayoutActions>
);

/** A label and its value, as a form facet entry. */
const FacetValue = ({ id, label, value }: { id: string; label: string; value: string }) => (
    <div className="flex items-baseline gap-1">
        <FormLabel colon htmlFor={id}>
            {label}
        </FormLabel>
        <Text id={id}>{value}</Text>
    </div>
);

/** A facet with a title (a stand-in for Angular's `fd-facet`: facets are not ported yet). */
const Facet = ({ title, children }: { title?: string; children: ReactNode }) => (
    <div className="flex flex-col gap-2">
        {title && (
            <Title level={3} headerSize={6}>
                {title}
            </Title>
        )}
        {children}
    </div>
);

/** The facets of the Angular stories, in a plain wrapping row (a stand-in for `fd-facet-group`). */
const FACETS = (
    <div role="group" aria-label="Product facets" className="flex flex-wrap items-start gap-x-12 gap-y-4">
        <Avatar size="l" glyph="money-bills" aria-label="Product" />
        <Facet title="Technical data">
            <FacetValue id="dp-unit" label="Base unit" value="Each" />
            <FacetValue id="dp-length" label="Length" value="23.24 Centimeter" />
            <FacetValue id="dp-width" label="Width" value="86.1 Centimeter" />
        </Facet>
        <Facet title="Status">
            <ObjectStatus status="positive" label="Delivery" large />
        </Facet>
        <Facet title="Delivery time">
            <ObjectStatus status="critical" glyph="shipping-status" label="12 days" large />
        </Facet>
        <Facet title="Pricing">
            <ObjectNumber number={579} unit="EUR" status="informative" large />
        </Facet>
    </div>
);

const CONTENT = (
    <DynamicPageContent>
        {Array.from({ length: 6 }, (_, i) => (
            <p key={i} className="m-0 mb-4">
                {LOREM.repeat(4)}
            </p>
        ))}
    </DynamicPageContent>
);

const FOOTER = (
    <DynamicPageFooter>
        <Bar barDesign="floating-footer">
            <BarRight>
                <BarElement>
                    <Button variant="emphasized" label="Save" />
                </BarElement>
                <BarElement>
                    <Button variant="transparent" label="Cancel" />
                </BarElement>
            </BarRight>
        </Bar>
    </DynamicPageFooter>
);

const SUBHEADER_TEXT =
    'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ullam possimus corrupti architecto perspiciatis, delectus necessitatibus incidunt numquam asperiores tenetur iure. Cum consequuntur impedit repellendus esse, facere autem optio consequatur nobis?';

const Frame = ({ width = '100%', children }: { width?: string; children: ReactNode }) => (
    <div className="h-[40rem] overflow-hidden bg-sap-background-color" style={{ maxWidth: width }}>
        {children}
    </div>
);

export const Default: Story = {
    name: 'Facets, pinnable header and footer',
    render: () => (
        <Frame>
            <DynamicPage aria-label="Product details" expandContent={false} positionRelative>
                <DynamicPageHeader
                    title={TITLE}
                    subtitle={SUBTITLE}
                    facet={<Avatar size="s" glyph="money-bills" aria-label="Product" className="me-4" />}
                >
                    {BREADCRUMB}
                    <DynamicPageTitleContent>Some RANDOM things</DynamicPageTitleContent>
                    {GLOBAL_ACTIONS}
                    {LAYOUT_ACTIONS}
                </DynamicPageHeader>
                <DynamicPageSubheader pinnable>{FACETS}</DynamicPageSubheader>
                {CONTENT}
                {FOOTER}
            </DynamicPage>
        </Frame>
    )
};

export const NotCollapsible: Story = {
    name: 'Not collapsible, list background',
    render: () => (
        <Frame>
            <DynamicPage aria-label="Product details" expandContent={false} background="list">
                <DynamicPageHeader title={TITLE} subtitle={SUBTITLE}>
                    {BREADCRUMB}
                    {GLOBAL_ACTIONS}
                    {LAYOUT_ACTIONS}
                </DynamicPageHeader>
                <DynamicPageSubheader collapsible={false}>{SUBHEADER_TEXT}</DynamicPageSubheader>
                {CONTENT}
            </DynamicPage>
        </Frame>
    )
};

export const Collapsed: Story = {
    name: 'Collapsed header, custom title and message strip',
    render: () => (
        <Frame>
            <DynamicPage aria-label="Order" expandContent={false} background="transparent">
                <DynamicPageHeader
                    subtitle="Created by John Li"
                    renderTitle={(collapsed) => `Order 4711 ${collapsed ? '(collapsed)' : ''}`}
                >
                    {GLOBAL_ACTIONS}
                    {LAYOUT_ACTIONS}
                    <MessageStrip type="warning">The delivery date is not confirmed yet.</MessageStrip>
                </DynamicPageHeader>
                <DynamicPageSubheader defaultCollapsed>{FACETS}</DynamicPageSubheader>
                <TabList ariaLabel="Order sections">
                    <Tab title="Items">{CONTENT}</Tab>
                    <Tab title="Notes">{CONTENT}</Tab>
                </TabList>
            </DynamicPage>
        </Frame>
    )
};

export const Small: Story = {
    name: 'Small width',
    render: () => (
        <Frame width="24rem">
            <DynamicPage aria-label="Product details" expandContent={false} positionRelative>
                <DynamicPageHeader title={TITLE} subtitle="Oversized multimaterial sneakers">
                    {BREADCRUMB}
                    {GLOBAL_ACTIONS}
                    {LAYOUT_ACTIONS}
                </DynamicPageHeader>
                <DynamicPageSubheader>{FACETS}</DynamicPageSubheader>
                {CONTENT}
                {FOOTER}
            </DynamicPage>
        </Frame>
    )
};

const TabsPage = ({ stacked }: { stacked: boolean }) => (
    <Frame>
        <DynamicPage aria-label="Product details" expandContent={false} positionRelative>
            <DynamicPageHeader title={TITLE} subtitle={SUBTITLE}>
                {BREADCRUMB}
                {GLOBAL_ACTIONS}
                {LAYOUT_ACTIONS}
            </DynamicPageHeader>
            <DynamicPageSubheader pinnable>{FACETS}</DynamicPageSubheader>
            <TabList ariaLabel="Product sections" stackContent={stacked}>
                {['General', 'Pricing', 'Stock', 'Suppliers', 'Notes'].map((tab) => (
                    <Tab key={tab} title={tab}>
                        <DynamicPageContent>
                            <h3 className="m-0 mb-4 text-sap-font-header5-size">{tab}</h3>
                            {Array.from({ length: 3 }, (_, i) => (
                                <p key={i} className="m-0 mb-4">
                                    {LOREM.repeat(3)}
                                </p>
                            ))}
                        </DynamicPageContent>
                    </Tab>
                ))}
            </TabList>
            {FOOTER}
        </DynamicPage>
    </Frame>
);

export const Tabs: Story = {
    name: 'Tabs',
    parameters: {
        docs: {
            description: {
                story: 'A `TabList` between the header and the content: the tab bar follows the page paddings and scrolling the selected tab collapses the header.'
            }
        }
    },
    render: () => <TabsPage stacked={false} />
};

export const StackedTabs: Story = {
    name: 'Stacked tabs',
    parameters: {
        docs: {
            description: {
                story: 'With `stackContent` all sections show one below the other; the tabs follow the scrolling and only the last section leaves room for the footer.'
            }
        }
    },
    render: () => <TabsPage stacked />
};

/** fundamental-styles' Desktop example: a text in the header, pinnable, and a navigation of its own in `DynamicPageTabs`. */
export const OtherNavigation: Story = {
    name: 'Header text and other navigation',
    parameters: {
        docs: {
            description: {
                story: 'Navigation other than a `TabList` goes into `DynamicPageTabs`, which follows the page paddings and casts the header shadow.'
            }
        }
    },
    render: () => (
        <Frame>
            <DynamicPage aria-label="Product details" expandContent={false} size="extra-large" autoResponsive={false}>
                <DynamicPageHeader title={TITLE} subtitle={SUBTITLE}>
                    {BREADCRUMB}
                    <DynamicPageTitleContent>Some RANDOM things</DynamicPageTitleContent>
                    {GLOBAL_ACTIONS}
                    {LAYOUT_ACTIONS}
                </DynamicPageHeader>
                <DynamicPageSubheader pinnable>{SUBHEADER_TEXT}</DynamicPageSubheader>
                <DynamicPageTabs>
                    <nav aria-label="Sections" className="flex gap-6 py-3">
                        <Link href="#">Overview</Link>
                        <Link href="#">Details</Link>
                    </nav>
                </DynamicPageTabs>
                {CONTENT}
            </DynamicPage>
        </Frame>
    )
};

/** fundamental-styles' Collapsed Header example: the header starts collapsed (`defaultCollapsed`). */
export const CollapsedHeader: Story = {
    name: 'Collapsed header',
    render: () => (
        <Frame>
            <DynamicPage aria-label="Product details" expandContent={false} size="extra-large" autoResponsive={false}>
                <DynamicPageHeader title={TITLE} subtitle={SUBTITLE}>
                    {BREADCRUMB}
                    <DynamicPageTitleContent>Collapsed Header with both expand and pin buttons</DynamicPageTitleContent>
                    {GLOBAL_ACTIONS}
                    {LAYOUT_ACTIONS}
                </DynamicPageHeader>
                <DynamicPageSubheader pinnable defaultCollapsed>
                    {SUBHEADER_TEXT}
                </DynamicPageSubheader>
                {CONTENT}
            </DynamicPage>
        </Frame>
    )
};

/** Global actions in a toolbar: on small pages they move into its overflow. */
const TOOLBAR_ACTIONS = (
    <DynamicPageGlobalActions aria-label="Product actions">
        <Toolbar variant="transparent" clearBorder aria-label="Product actions toolbar">
            <ToolbarItem>
                <Button variant="positive" label="Accept" />
            </ToolbarItem>
            <ToolbarItem>
                <Button variant="negative" label="Reject" />
            </ToolbarItem>
        </Toolbar>
    </DynamicPageGlobalActions>
);

const WIDTHS = [
    { label: 'Small', width: '24rem' },
    { label: 'Medium', width: '48rem' },
    { label: 'Large', width: '72rem' },
    { label: 'Extra large', width: '92rem' }
];

function ResponsivePage() {
    const [width, setWidth] = useState('24rem');
    const [size, setSize] = useState<DynamicPageResponsiveSize | null>(null);
    return (
        <div className="flex flex-col gap-3 p-4 font-sap-font-family text-sap-font-size text-sap-text-color">
            <div role="group" aria-label="Page width" className="flex flex-wrap items-center gap-2">
                {WIDTHS.map((option) => (
                    <Button
                        key={option.label}
                        label={`${option.label} (${option.width})`}
                        toggled={width === option.width}
                        onClick={() => setWidth(option.width)}
                    />
                ))}
                <span aria-live="polite">Size: {size}</span>
            </div>
            <div className="overflow-x-auto">
                <div className="h-[36rem] overflow-hidden bg-sap-background-color" style={{ width }}>
                    <DynamicPage
                        aria-label="Product details"
                        expandContent={false}
                        positionRelative
                        onSizeChange={setSize}
                    >
                        <DynamicPageHeader title={TITLE} subtitle={SUBTITLE}>
                            {BREADCRUMB}
                            <DynamicPageTitleContent>Key information</DynamicPageTitleContent>
                            {TOOLBAR_ACTIONS}
                            <DynamicPageLayoutActions aria-label="Page actions">
                                <Button
                                    variant="transparent"
                                    glyph="exit-full-screen"
                                    aria-label="Exit full screen"
                                    title="Exit full screen"
                                />
                                <Button variant="transparent" glyph="decline" aria-label="Close" title="Close" />
                            </DynamicPageLayoutActions>
                        </DynamicPageHeader>
                        <DynamicPageSubheader pinnable>{FACETS}</DynamicPageSubheader>
                        {CONTENT}
                        {FOOTER}
                    </DynamicPage>
                </div>
            </div>
        </div>
    );
}

export const Responsive: Story = {
    name: 'Responsive',
    parameters: {
        docs: {
            description: {
                story: 'The same page at the four sizes (`onSizeChange` reports them): paddings follow the size, the layout actions move up next to the breadcrumb below 1280px, and on small pages the global actions toolbar moves its actions into the overflow.'
            }
        }
    },
    render: () => <ResponsivePage />
};

function ContainerHeightPage() {
    const [spaces, setSpaces] = useState<number[]>([]);
    const page = useRef<DynamicPageActions>(null);
    // the page moved: measure it again once the spaces are rendered
    const change = (next: number[]) => {
        setSpaces(next);
        requestAnimationFrame(() => page.current?.refreshSize());
    };
    return (
        <div className="flex flex-col font-sap-font-family text-sap-font-size text-sap-text-color">
            {spaces.map((space) => (
                <div key={space} className="flex h-16 shrink-0 items-center bg-sap-neutral-background px-4">
                    Space {space} above the page
                </div>
            ))}
            <DynamicPage
                aria-label="Product details"
                size="large"
                autoResponsive={false}
                offset={48}
                positionRelative
                actionsRef={page}
            >
                <DynamicPageHeader
                    title={TITLE}
                    subtitle="The page fills the window below its top, minus a 48px offset for the bar below it"
                >
                    {BREADCRUMB}
                    <DynamicPageTitleContent>Key information</DynamicPageTitleContent>
                    {TOOLBAR_ACTIONS}
                </DynamicPageHeader>
                <DynamicPageSubheader collapsible={false}>
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ullam possimus corrupti architecto
                    perspiciatis.
                </DynamicPageSubheader>
                {CONTENT}
                <DynamicPageFooter>
                    <Bar barDesign="floating-footer">
                        <BarRight>
                            <BarElement>
                                <Button
                                    label="Add space above"
                                    disabled={spaces.length > 1}
                                    onClick={() => change([...spaces, spaces.length + 1])}
                                />
                            </BarElement>
                            <BarElement>
                                <Button
                                    label="Remove space"
                                    disabled={!spaces.length}
                                    onClick={() => change(spaces.slice(0, -1))}
                                />
                            </BarElement>
                        </BarRight>
                    </Bar>
                </DynamicPageFooter>
            </DynamicPage>
            <div className="flex h-12 shrink-0 items-center bg-sap-shell-color px-4 text-sap-shell-text-color">
                Bar below the page (offset)
            </div>
        </div>
    );
}

export const ContainerHeight: Story = {
    name: 'Dynamic height of the parent',
    parameters: {
        docs: {
            description: {
                story: 'The page fills the window below its top minus `offset`. When content above it changes, `actionsRef.current.refreshSize()` measures it again.'
            }
        }
    },
    render: () => <ContainerHeightPage />
};

type ColumnLayout = 'OneColumnStartFullScreen' | 'TwoColumnsMidExpanded' | 'OneColumnMidFullScreen';

const PRODUCTS = ['Balenciaga Triple S Trainers', 'Running shoes', 'Trail shoes'];

/** A page in the mid column of a two-column layout (a stand-in for the flexible column layout, not ported yet). */
function ColumnLayoutPage() {
    const [selected, setSelected] = useState(PRODUCTS[0]);
    const [layout, setLayout] = useState<ColumnLayout>('TwoColumnsMidExpanded');
    const columns =
        layout === 'TwoColumnsMidExpanded'
            ? 'grid-cols-[1fr_2fr]'
            : layout === 'OneColumnMidFullScreen'
              ? 'grid-cols-[0_1fr]'
              : 'grid-cols-[1fr_0]';
    return (
        <div className={`grid h-[40rem] overflow-hidden ${columns}`}>
            <div
                className="h-full min-w-0 overflow-hidden bg-sap-group-content-background"
                hidden={layout === 'OneColumnMidFullScreen'}
            >
                <Bar>
                    <BarLeft>
                        <BarElement>
                            <Title level={2} headerSize={5}>
                                Products
                            </Title>
                        </BarElement>
                    </BarLeft>
                </Bar>
                <List navigationIndicator aria-label="Products">
                    {PRODUCTS.map((product) => (
                        <ListItem key={product}>
                            <ListLink
                                href="#"
                                navigated={product === selected}
                                onClick={(event) => {
                                    event.preventDefault();
                                    setSelected(product);
                                    if (layout === 'OneColumnStartFullScreen') setLayout('TwoColumnsMidExpanded');
                                }}
                            >
                                <ListTitle>{product}</ListTitle>
                            </ListLink>
                        </ListItem>
                    ))}
                </List>
            </div>
            <div className="min-w-0 overflow-hidden" hidden={layout === 'OneColumnStartFullScreen'}>
                <DynamicPage aria-label="Product details" expandContent={false} positionRelative>
                    <DynamicPageHeader title={selected} subtitle={SUBTITLE}>
                        {BREADCRUMB}
                        {TOOLBAR_ACTIONS}
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
                    <DynamicPageSubheader pinnable>{FACETS}</DynamicPageSubheader>
                    {CONTENT}
                </DynamicPage>
            </div>
        </div>
    );
}

export const InColumnLayout: Story = {
    name: 'Inside a column layout',
    parameters: {
        docs: {
            description: {
                story: 'The page in the second column of a two-column layout, with full screen and close layout actions. A plain grid stands in for the flexible column layout, which is not ported yet.'
            }
        }
    },
    render: () => <ColumnLayoutPage />
};

const STEPS = ['Product type', 'Customer information', 'Payment details'];
const GLYPHS = ['product', 'user-edit', 'credit-card'];

function WizardPage() {
    const [status, setStatus] = useState<WizardStepStatus[]>(['current', 'upcoming', 'upcoming']);
    const go = (step: number) =>
        setStatus(STEPS.map((_, i) => (i < step ? 'completed' : i === step ? 'current' : 'upcoming')));
    return (
        <DynamicPage aria-label="New order" size="large" autoResponsive={false}>
            <DynamicPageHeader title="This is a wizard title" />
            <DynamicPageContent className="overflow-hidden p-0">
                <Wizard>
                    <WizardNavigation>
                        <WizardProgressBar size="lg" aria-label="Wizard steps">
                            {STEPS.map((step, i) => (
                                <WizardStep
                                    key={step}
                                    status={status[i]}
                                    onStatusChange={(next) =>
                                        setStatus((all) => all.map((s, j) => (j === i ? next : s)))
                                    }
                                    label={step}
                                    aria-label={`Step ${i + 1}: ${step}`}
                                >
                                    <WizardStepIndicator glyph={GLYPHS[i]} />
                                    <WizardContent size="lg">
                                        <Title level={3} headerSize={4} className="mb-4">
                                            {i + 1}. {step}
                                        </Title>
                                        <p className="m-0">{LOREM.repeat(5)}</p>
                                        {i < STEPS.length - 1 && (
                                            <WizardNextStep>
                                                <Button
                                                    variant="emphasized"
                                                    label={`Go to step ${i + 2}`}
                                                    onClick={() => go(i + 1)}
                                                />
                                            </WizardNextStep>
                                        )}
                                    </WizardContent>
                                </WizardStep>
                            ))}
                        </WizardProgressBar>
                    </WizardNavigation>
                </Wizard>
            </DynamicPageContent>
        </DynamicPage>
    );
}

export const WithWizard: Story = {
    name: 'With wizard',
    render: () => <WizardPage />
};
