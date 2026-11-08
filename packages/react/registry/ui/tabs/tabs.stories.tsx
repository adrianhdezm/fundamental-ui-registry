import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { FormItem, FormLabel } from '@/ui/form/form';
import { InputGroup } from '@/ui/input-group/input-group';
import { Title } from '@/ui/title/title';
import {
    Tab,
    TabCount,
    TabIcon,
    TabItem,
    TabLink,
    TabList,
    TabNav,
    TabTag,
    type TabListActions,
    type TabSizes
} from './tabs';

const meta = {
    title: 'Components/Tabs',
    component: TabList,
    subcomponents: { Tab, TabNav, TabItem, TabLink, TabTag, TabCount, TabIcon },
    parameters: {
        docs: {
            description: {
                component:
                    'A tab bar for `Tab` panels: titles or `titleContent`, counts, value states, icon-only, process and ' +
                    'filter modes. Tabs that do not fit go into a "More" menu. With `stackContent` all panels show one ' +
                    'below the other and the tabs follow the scrolling. The tabs form one tab stop: Left, Right, Home and ' +
                    'End move between them (Base UI Tabs) and Enter, Space or a click selects. `TabNav` styles a bar of ' +
                    'links, e.g. for router navigation.\n\n' +
                    '```tsx\n' +
                    '<TabList ariaLabel="Product">\n' +
                    '    <Tab title="Info">Information</Tab>\n' +
                    '    <Tab title="Notes" count={3}>Notes</Tab>\n' +
                    '</TabList>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        mode: { control: 'select', options: [null, 'icon-only', 'process', 'filter'] },
        size: { control: 'select', options: ['s', 'm', 'l', 'xl', 'xxl'] },
        maxVisibleTabs: { control: { type: 'number', min: 1 } }
    },
    args: {
        ariaLabel: 'Playground tabs',
        mode: null,
        size: 'm',
        collapseOverflow: true,
        maxVisibleTabs: Number.POSITIVE_INFINITY,
        collapsibleTabs: false,
        moreLabel: 'More'
    }
} satisfies Meta<typeof TabList>;
export default meta;
type Story = StoryObj<typeof meta>;

const CONTENT = 'block p-4 font-sap-font-family text-sap-font-size text-sap-text-color';
const HEADING = 'mt-6 mb-2 first:mt-0';
const LOREM = 'Lorem ipsum dolor sit amet consectetur adipisicing elit.';
const LOREM_LONG =
    'Numquam libero id corporis odit animi voluptat, Lorem ipsum dolor sit amet consectetur adipisicing elit. ' +
    'Possimus quia tempore eligendi tempora repellat officia rerum laudantium, veritatis officiis asperiores ipsum ' +
    'nam, distinctio, dolor provident culpa voluptatibus esse deserunt animi?';

/** The Angular and fundamental-react playgrounds: the props of the tab list as controls, on three tabs. */
export const Playground: Story = {
    render: (args) => (
        <TabList {...args}>
            {[
                { title: 'Link 1', glyph: 'cart', count: '1' },
                { title: 'Link 2', glyph: 'employee', count: '2' },
                { title: 'Link 3', glyph: 'calendar', count: '3' }
            ].map((tab, i) => (
                <Tab key={tab.title} header={args.mode === 'filter' && i === 0} {...tab}>
                    <span className={CONTENT}>Content of {tab.title}</span>
                </Tab>
            ))}
        </TabList>
    )
};

export const Basic: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Tabs from titles, with a disabled tab; semantic tabs with `tabState`; and `titleContent` with a ' +
                    '`TabTag` in place of the title, with counts.'
            }
        }
    },
    render: () => (
        <>
            <Title level={3} headerSize={5} className={HEADING}>
                Tabs from titles
            </Title>
            <TabList ariaLabel="Basic tabs">
                <Tab title="Link 1">
                    <span className={CONTENT}>Content for tab 1</span>
                </Tab>
                <Tab title="Link 2">
                    <span className={CONTENT}>Content for tab 2</span>
                </Tab>
                <Tab title="Link 3">
                    <span className={CONTENT}>Content for tab 3</span>
                </Tab>
                <Tab title="Disabled" disabled>
                    <span className={CONTENT}>Not shown</span>
                </Tab>
            </TabList>

            <Title level={3} headerSize={5} className={HEADING}>
                Semantic tabs
            </Title>
            <TabList ariaLabel="Semantic tabs">
                <Tab title="Success" tabState="success">
                    <span className={CONTENT}>Success content</span>
                </Tab>
                <Tab title="Error" tabState="error">
                    <span className={CONTENT}>Error content</span>
                </Tab>
                <Tab title="Warning" tabState="warning">
                    <span className={CONTENT}>Warning content</span>
                </Tab>
                <Tab title="Information" tabState="information">
                    <span className={CONTENT}>Information content</span>
                </Tab>
                <Tab title="Neutral" tabState="neutral">
                    <span className={CONTENT}>Neutral content</span>
                </Tab>
            </TabList>

            <Title level={3} headerSize={5} className={HEADING}>
                Tabs with title content and counts
            </Title>
            <TabList ariaLabel="Templated tabs" size="s">
                <Tab
                    count="12"
                    titleContent={
                        <TabTag>
                            Inbox <b>(12)</b>
                        </TabTag>
                    }
                >
                    <span className={CONTENT}>Inbox</span>
                </Tab>
                <Tab title="Drafts" count="3">
                    <span className={CONTENT}>Drafts</span>
                </Tab>
                <Tab title="Sent">
                    <span className={CONTENT}>Sent</span>
                </Tab>
            </TabList>
        </>
    )
};

export const Modes: Story = {
    render: () => (
        <>
            <Title level={3} headerSize={5} className={HEADING}>
                Icon only
            </Title>
            <TabList mode="icon-only" ariaLabel="Icon only tabs">
                <Tab glyph="cart" title="Cart" count="3">
                    <span className={CONTENT}>Cart</span>
                </Tab>
                <Tab glyph="employee" title="Employees" tabState="success">
                    <span className={CONTENT}>Employees</span>
                </Tab>
                <Tab glyph="alert" title="Alerts" tabState="warning" count="99">
                    <span className={CONTENT}>Alerts</span>
                </Tab>
                <Tab glyph="calendar" title="Calendar">
                    <span className={CONTENT}>Calendar</span>
                </Tab>
            </TabList>

            <Title level={3} headerSize={5} className={HEADING}>
                Process
            </Title>
            <TabList mode="process" ariaLabel="Process tabs">
                <Tab glyph="cart" title="Order" count="1 step">
                    <span className={CONTENT}>Order</span>
                </Tab>
                <Tab glyph="shipping-status" title="Shipping" count="2 steps">
                    <span className={CONTENT}>Shipping</span>
                </Tab>
                <Tab glyph="paid-leave" title="Payment" count="3 steps">
                    <span className={CONTENT}>Payment</span>
                </Tab>
            </TabList>

            <Title level={3} headerSize={5} className={HEADING}>
                Filter
            </Title>
            <TabList mode="filter" ariaLabel="Filter tabs">
                <Tab header title="Products" count="120">
                    <span className={CONTENT}>All products</span>
                </Tab>
                <Tab glyph="hint" title="New" count="12" tabState="information">
                    <span className={CONTENT}>New products</span>
                </Tab>
                <Tab glyph="message-success" title="In stock" count="80" tabState="success">
                    <span className={CONTENT}>In stock</span>
                </Tab>
                <Tab glyph="message-warning" title="Low stock" count="20" tabState="warning">
                    <span className={CONTENT}>Low stock</span>
                </Tab>
                <Tab glyph="message-error" title="Out of stock" count="8" tabState="error">
                    <span className={CONTENT}>Out of stock</span>
                </Tab>
            </TabList>
        </>
    )
};

const MANY = [
    'Overview',
    'Details',
    'Notes',
    'Attachments',
    'History',
    'Approvals',
    'Related',
    'Settings',
    'Logs',
    'Audit'
];

function BehaviourStory() {
    const actions = useRef<TabListActions>(null);
    const [added, setAdded] = useState<number[]>([]);
    const [index, setIndex] = useState(0);
    return (
        <>
            <Title level={3} headerSize={5} className={HEADING}>
                Overflow into a "More" menu
            </Title>
            <div className="max-w-xl">
                <TabList ariaLabel="Many tabs">
                    {MANY.map((tab) => (
                        <Tab key={tab} title={tab}>
                            <span className={CONTENT}>Content of {tab}</span>
                        </Tab>
                    ))}
                </TabList>
            </div>

            <Title level={3} headerSize={5} className={HEADING}>
                Collapsible, at most three visible
            </Title>
            <TabList ariaLabel="Collapsible tabs" collapsibleTabs maxVisibleTabs={3}>
                {MANY.slice(0, 6).map((tab) => (
                    <Tab key={tab} title={tab}>
                        <span className={CONTENT}>Content of {tab}</span>
                    </Tab>
                ))}
            </TabList>

            <Title level={3} headerSize={5} className={HEADING}>
                Programmatic selection and added tabs
            </Title>
            <div className="mb-2 flex gap-2">
                <Button label="Select tab 2" onClick={() => actions.current?.selectTab('story-tab-2')} />
                <Button label="Add tab" onClick={() => setAdded((a) => [...a, a.length + 4])} />
                <Button label="Remove tab" onClick={() => setAdded((a) => a.slice(0, -1))} />
            </div>
            <TabList actionsRef={actions} ariaLabel="Dynamic tabs" onValueChange={(_, i) => setIndex(i)}>
                <Tab id="story-tab-1" title="Tab 1">
                    <span className={CONTENT}>Tab 1</span>
                </Tab>
                <Tab id="story-tab-2" title="Tab 2">
                    <span className={CONTENT}>Tab 2</span>
                </Tab>
                <Tab id="story-tab-3" title="Tab 3">
                    <span className={CONTENT}>Tab 3</span>
                </Tab>
                {added.map((n) => (
                    <Tab key={n} title={`Tab ${n}`}>
                        <span className={CONTENT}>Tab {n}</span>
                    </Tab>
                ))}
            </TabList>
            <p className={`${CONTENT} px-0`}>Selected index: {index}</p>
        </>
    );
}

export const Behaviour: Story = {
    name: 'Overflow, collapsible and dynamic tabs',
    render: () => <BehaviourStory />
};

export const Stacked: Story = {
    name: 'Stacked content',
    render: () => (
        <div className="h-96">
            <TabList ariaLabel="Stacked sections" stackContent>
                {['General', 'Address', 'Contacts', 'Payment', 'Notes'].map((section) => (
                    <Tab key={section} title={section}>
                        <div
                            className={`${CONTENT} h-60 border-0 border-b border-solid border-sap-group-title-border-color`}
                        >
                            <Title level={4} headerSize={5} className="mb-2">
                                {section}
                            </Title>
                            <p className="m-0">
                                Scroll the content: the tabs follow. Click a tab to scroll to its section.
                            </p>
                        </div>
                    </Tab>
                ))}
            </TabList>
        </div>
    )
};

function DefaultTabStory() {
    const [hide, setHide] = useState(true);
    return (
        <>
            <Title level={3} headerSize={5} className={HEADING}>
                Default tab specified
            </Title>
            <TabList ariaLabel="Tabs with a default tab" defaultValue="story-default-three">
                <Tab id="story-default-one" title="Link 1">
                    <span className={CONTENT}>Content for tab 1</span>
                </Tab>
                <Tab id="story-default-two" title="Link 2">
                    <span className={CONTENT}>Content for tab 2</span>
                </Tab>
                <Tab id="story-default-three" title="Link 3">
                    <span className={CONTENT}>Content for tab 3</span>
                </Tab>
            </TabList>

            <Title level={3} headerSize={5} className={HEADING}>
                Default tab selected again when the tabs change
            </Title>
            <Button className="mb-2" label={`${hide ? 'Show' : 'Hide'} first tab`} onClick={() => setHide(!hide)} />
            <TabList ariaLabel="Tabs that select the default tab on change" selectDefaultOnTabsChange>
                {!hide && (
                    <Tab id="story-change-one" title="Link 1">
                        <span className={CONTENT}>Content for tab 1</span>
                    </Tab>
                )}
                <Tab id="story-change-two" title="Link 2">
                    <span className={CONTENT}>Content for tab 2</span>
                </Tab>
                <Tab id="story-change-three" title="Link 3">
                    <span className={CONTENT}>Content for tab 3</span>
                </Tab>
            </TabList>
        </>
    );
}

export const DefaultTab: Story = {
    name: 'Default tab',
    render: () => <DefaultTabStory />
};

export const FormContent: Story = {
    name: 'Form content',
    render: () => (
        <TabList ariaLabel="Tabs with form content">
            {[1, 2, 3].map((tab) => (
                <Tab key={tab} title={`Link ${tab}`}>
                    <div className={`${CONTENT} flex flex-col items-start gap-2`}>
                        <span>Content for tab {tab}</span>
                        {tab === 1 && <Button label="Save" />}
                        <FormItem>
                            <FormLabel htmlFor={`story-tabs-amount-${tab}`}>Left aligned icon add-on</FormLabel>
                            <InputGroup
                                placement="before"
                                glyph="cart"
                                glyphAriaLabel="Add to cart"
                                placeholder="Amount"
                                inputId={`story-tabs-amount-${tab}`}
                            />
                        </FormItem>
                    </div>
                </Tab>
            ))}
        </TabList>
    )
};

function NavigationStory() {
    const pages = ['Home', 'Products', 'Orders', 'Customers'];
    const [active, setActive] = useState('Home');
    return (
        <>
            <TabNav aria-label="Pages">
                {pages.map((page) => (
                    <TabItem key={page}>
                        <TabLink
                            href="#"
                            active={active === page}
                            onClick={(event) => {
                                event.preventDefault();
                                setActive(page);
                            }}
                        >
                            <TabTag>{page}</TabTag>
                        </TabLink>
                    </TabItem>
                ))}
            </TabNav>
            <p className={`${CONTENT} px-0`}>Showing the {active} page</p>
        </>
    );
}

export const Navigation: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    '`TabNav` with `TabItem`, `TabLink` (`active` from your router) and `TabTag`: a bar of links with ' +
                    'one tab stop, the arrow keys move between them.'
            }
        }
    },
    render: () => <NavigationStory />
};

/* fundamental-react examples */

const SAMPLE = [
    { title: 'Tab 1', content: LOREM },
    { title: 'Tab 2', content: LOREM_LONG },
    { title: 'Tab 3', content: LOREM },
    { title: 'Tab 4', content: 'Please review your shopping chart.' }
];

export const SelectedIndex: Story = {
    name: 'Selected tab',
    parameters: {
        docs: { description: { story: "fundamental-react's `selectedIndex={1}`: `defaultValue` with the tab's id." } }
    },
    render: () => (
        <TabList ariaLabel="Tabs with the second tab selected" defaultValue="selected-2">
            {SAMPLE.map((tab, i) => (
                <Tab key={tab.title} id={`selected-${i + 1}`} title={tab.title}>
                    <span className={CONTENT}>{tab.content}</span>
                </Tab>
            ))}
        </TabList>
    )
};

export const Icons: Story = {
    name: 'Icon tabs',
    parameters: {
        docs: {
            description: {
                story:
                    'fundamental-react\'s tabs with only a `glyph` (its "all buttons" story) are the icon-only mode: the ' +
                    "title becomes hidden text. With counts, as fundamental-styles' icon tabs."
            }
        }
    },
    render: () => (
        <TabList ariaLabel="Icon tabs" mode="icon-only" size="s" defaultValue="icon-2">
            {SAMPLE.map((tab, i) => (
                <Tab key={tab.title} id={`icon-${i + 1}`} glyph="cart" title={tab.title} count={['12', '15', '1'][i]}>
                    <span className={CONTENT}>{tab.content}</span>
                </Tab>
            ))}
        </TabList>
    )
};

export const Disabled: Story = {
    parameters: { docs: { description: { story: 'All tabs disabled: none is selected or in the tab order.' } } },
    render: () => (
        <TabList ariaLabel="Disabled tabs">
            {SAMPLE.map((tab) => (
                <Tab key={tab.title} title={tab.title} disabled>
                    <span className={CONTENT}>{tab.content}</span>
                </Tab>
            ))}
        </TabList>
    )
};

export const Sizes: Story = {
    parameters: {
        docs: { description: { story: 'The bar padding: `s` 1rem, `m` and `l` 2rem, `xl` and `xxl` 3rem.' } }
    },
    render: () => (
        <div className="flex flex-col gap-4">
            {(['s', 'm', 'l', 'xl', 'xxl'] as TabSizes[]).map((size) => (
                <TabList key={size} ariaLabel={`Size ${size}`} size={size}>
                    {SAMPLE.map((tab) => (
                        <Tab key={tab.title} title={tab.title}>
                            <span className={CONTENT}>{tab.content}</span>
                        </Tab>
                    ))}
                </TabList>
            ))}
        </div>
    )
};

export const OpenMore: Story = {
    name: 'Open: More menu',
    tags: ['!autodocs'],
    render: () => <BehaviourStory />,
    play: async ({ canvasElement }) => {
        const more = await waitFor(() => {
            const el = canvasElement.querySelector<HTMLElement>('button[aria-haspopup=menu]');
            expect(el).not.toBeNull();
            return el!;
        });
        await userEvent.click(more);
        await waitFor(() => expect(more.getAttribute('aria-expanded')).toBe('true'));
        await waitFor(() => expect(document.querySelector('[role=menu] [role=menuitem]')).not.toBeNull());
    }
};
