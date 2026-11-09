import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';
import {
    NestedList,
    NestedListContent,
    NestedListExpandIcon,
    NestedListHeader,
    NestedListIcon,
    NestedListItem,
    NestedListLink,
    NestedListPopover,
    NestedListTitle
} from '@/ui/nested-list/nested-list';
import {
    SideNavigation,
    SideNavigationMain,
    SideNavigationUtility,
    type SideNavigationModel,
    type SideNavigationProps
} from './side-navigation';

const TEXT = 'm-0 font-sap-font-family text-sap-font-size text-sap-text-color';

/** The navigation in a column of a fixed height, next to the last chosen link, as Angular's stories. */
function Frame({
    chosen,
    condensed,
    height = 'h-[32rem]',
    children
}: {
    chosen?: string;
    condensed?: boolean;
    height?: string;
    children: ReactNode;
}) {
    return (
        <div className={`flex gap-4 ${height}`}>
            <div className={condensed ? 'w-16 shadow-sap-content-shadow0' : 'w-72 shadow-sap-content-shadow0'}>
                {children}
            </div>
            {chosen !== undefined && (
                <p className={TEXT} aria-live="polite">
                    Chosen: {chosen || 'none'}
                </p>
            )}
        </div>
    );
}

const SETTINGS = ['Profile', 'Security', 'Language', 'Notifications'];

/** Angular's story: headers, icons, an expandable Settings item (a popover when condensed), utility links. */
function StorySideNav({ condensed = false, selectable = true, ...props }: Omit<SideNavigationProps, 'children'>) {
    const [settingsOpen, setSettingsOpen] = useState(!condensed);
    const [chosen, setChosen] = useState('');
    const settingsRow = (
        <NestedListContent>
            <NestedListLink>
                <NestedListIcon glyph="settings" />
                <NestedListTitle>Settings</NestedListTitle>
            </NestedListLink>
            <NestedListExpandIcon />
        </NestedListContent>
    );
    const settingsList = (textOnly: boolean) => (
        <NestedList textOnly={textOnly}>
            {SETTINGS.map((sub) => (
                <NestedListItem key={sub}>
                    <NestedListLink onClick={() => setChosen(sub)}>
                        <NestedListTitle>{sub}</NestedListTitle>
                    </NestedListLink>
                </NestedListItem>
            ))}
        </NestedList>
    );
    const link = (glyph: string, title: string, selected = false) => (
        <NestedListItem>
            <NestedListLink selected={selected} onClick={() => setChosen(title)}>
                <NestedListIcon glyph={glyph} />
                <NestedListTitle>{title}</NestedListTitle>
            </NestedListLink>
        </NestedListItem>
    );
    return (
        <Frame chosen={chosen} condensed={condensed}>
            <SideNavigation condensed={condensed} selectable={selectable} {...props}>
                <SideNavigationMain>
                    <NestedList>
                        <NestedListHeader>Overview</NestedListHeader>
                        {link('home', 'Home', !selectable)}
                        {link('crossed-line-chart', 'Analytics')}
                        <NestedListHeader>Administration</NestedListHeader>
                        <NestedListItem expanded={settingsOpen} onExpandedChange={setSettingsOpen}>
                            {condensed ? (
                                <NestedListPopover>
                                    {settingsRow}
                                    {settingsList(false)}
                                </NestedListPopover>
                            ) : (
                                <>
                                    {settingsRow}
                                    {settingsList(true)}
                                </>
                            )}
                        </NestedListItem>
                        {link('add-equipment', 'Equipment')}
                    </NestedList>
                </SideNavigationMain>
                <SideNavigationUtility>
                    <NestedList>
                        {link('bell', 'Notifications')}
                        {link('sys-help', 'Help')}
                    </NestedList>
                </SideNavigationUtility>
            </SideNavigation>
        </Frame>
    );
}

/** Angular's Text only story: two groups of text links and text utility links. */
function StoryTextOnly() {
    const [chosen, setChosen] = useState('');
    const links = (titles: string[], first = false) =>
        titles.map((title, index) => (
            <NestedListItem key={title}>
                <NestedListLink selected={first && index === 0} onClick={() => setChosen(title)}>
                    <NestedListTitle>{title}</NestedListTitle>
                </NestedListLink>
            </NestedListItem>
        ));
    return (
        <Frame chosen={chosen} height="h-[26rem]">
            <SideNavigation>
                <SideNavigationMain>
                    <NestedList textOnly>
                        <NestedListHeader>Group Header 1</NestedListHeader>
                        {links(['Link 1', 'Link 2'], true)}
                        <NestedListHeader>Group Header 2</NestedListHeader>
                        {links(['Link 3', 'Link 4'])}
                    </NestedList>
                </SideNavigationMain>
                <SideNavigationUtility>
                    <NestedList textOnly>{links(['Settings', 'Sign Out'])}</NestedList>
                </SideNavigationUtility>
            </SideNavigation>
        </Frame>
    );
}

/** Angular's Programmatic state story: items are not selectable, buttons change `expanded` and `selected`. */
function StoryProgrammatic() {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(false);
    const text = (title: string, isSelected = false) => (
        <NestedListItem>
            <NestedListLink selected={isSelected}>
                <NestedListTitle>{title}</NestedListTitle>
            </NestedListLink>
        </NestedListItem>
    );
    return (
        <div className="flex h-[30rem] gap-4">
            <div className="w-72 shadow-sap-content-shadow0">
                <SideNavigation selectable={false}>
                    <SideNavigationMain>
                        <NestedList textOnly>
                            {text('Link 1')}
                            {text('Link 2')}
                            <NestedListItem expanded={open} onExpandedChange={setOpen}>
                                <NestedListContent selected={selected}>
                                    <NestedListLink>
                                        <NestedListTitle>Link 3</NestedListTitle>
                                    </NestedListLink>
                                    <NestedListExpandIcon />
                                </NestedListContent>
                                <NestedList>
                                    {['Child 1', 'Child 2', 'Child 3'].map((child, index) => (
                                        <NestedListItem key={child}>
                                            <NestedListLink selected={index === 0 && selected}>
                                                <NestedListTitle>{child}</NestedListTitle>
                                            </NestedListLink>
                                        </NestedListItem>
                                    ))}
                                </NestedList>
                            </NestedListItem>
                            {text('Link 4')}
                        </NestedList>
                    </SideNavigationMain>
                    <SideNavigationUtility>
                        <NestedList textOnly>{text('Settings')}</NestedList>
                    </SideNavigationUtility>
                </SideNavigation>
            </div>
            <div className="flex items-start gap-2">
                <Button label={selected ? 'Unselect child' : 'Select child'} onClick={() => setSelected(!selected)} />
                <Button label={open ? 'Close' : 'Open'} onClick={() => setOpen(!open)} />
            </div>
        </div>
    );
}

/** Angular's From data story: the navigation built from a `SideNavigationModel`. */
function StoryModel({ condensed = false }: { condensed?: boolean }) {
    const [chosen, setChosen] = useState('');
    const [config] = useState<SideNavigationModel>(() => {
        const pick = (name: string) => () => setChosen(name);
        return {
            mainNavigation: {
                items: [
                    { headerTitle: 'Header Title 1' },
                    { link: { icon: 'home', title: 'Link 1', callback: pick('Link 1') } },
                    { headerTitle: 'Header Title 2' },
                    { link: { icon: 'account', title: 'Link 2', callback: pick('Link 2') } },
                    {
                        expanded: !condensed,
                        link: { icon: 'activate', title: 'Link 3' },
                        list: {
                            textOnly: true,
                            items: [
                                { link: { title: 'Sublink 1', callback: pick('Sublink 1') } },
                                { link: { title: 'Sublink 2', selected: true, callback: pick('Sublink 2') } },
                                { link: { title: 'Sublink 3', callback: pick('Sublink 3') } }
                            ]
                        }
                    },
                    { link: { icon: 'approvals', title: 'Link 4', callback: pick('Link 4') } }
                ]
            },
            utilityNavigation: {
                items: [
                    { link: { icon: 'action-settings', title: 'Settings', callback: pick('Settings') } },
                    { link: { icon: 'log', title: 'Sign Out', callback: pick('Sign Out') } }
                ]
            }
        };
    });
    return (
        <Frame chosen={chosen} condensed={condensed} height="h-[34rem]">
            <SideNavigation sideNavigationConfiguration={config} condensed={condensed} />
        </Frame>
    );
}

const SKIP_LINK = { href: '#content', label: 'Skip navigation' };

interface FrItem {
    title: ReactNode;
    glyph?: string;
    selected?: boolean;
    children?: string[];
}

/** fundamental-react's stories: one or more lists of "Link Item"s with the second selected and a skip link. */
function StoryFundamentalReact({
    lists,
    condensed = false,
    textOnly = !condensed
}: {
    lists: { title?: string; label?: string; utility?: boolean; items: FrItem[] }[];
    condensed?: boolean;
    textOnly?: boolean;
}) {
    const main = lists.filter((list) => !list.utility);
    const utility = lists.filter((list) => list.utility);
    const render = (list: (typeof lists)[number], key: number) => (
        <NestedList key={key} textOnly={textOnly} aria-label={list.label}>
            {list.title && <NestedListHeader>{list.title}</NestedListHeader>}
            {list.items.map((item, index) => (
                <NestedListItem key={index}>
                    {item.children ? (
                        <>
                            <NestedListContent>
                                <NestedListLink href="#">
                                    <NestedListTitle>{item.title}</NestedListTitle>
                                </NestedListLink>
                                <NestedListExpandIcon aria-label="Expand submenu" />
                            </NestedListContent>
                            <NestedList textOnly>
                                {item.children.map((child) => (
                                    <NestedListItem key={child}>
                                        <NestedListLink href="#">
                                            <NestedListTitle>{child}</NestedListTitle>
                                        </NestedListLink>
                                    </NestedListItem>
                                ))}
                            </NestedList>
                        </>
                    ) : (
                        <NestedListLink href="#" selected={item.selected}>
                            {item.glyph && <NestedListIcon glyph={item.glyph} />}
                            <NestedListTitle>{item.title}</NestedListTitle>
                        </NestedListLink>
                    )}
                </NestedListItem>
            ))}
        </NestedList>
    );
    return (
        <Frame condensed={condensed} height="h-[26rem]">
            <SideNavigation condensed={condensed} skipLink={SKIP_LINK}>
                <SideNavigationMain>{main.map(render)}</SideNavigationMain>
                {utility.length > 0 && <SideNavigationUtility>{utility.map(render)}</SideNavigationUtility>}
            </SideNavigation>
        </Frame>
    );
}

/** Five "Link Item"s, the second selected, with the glyphs given. */
const linkItems = (glyphs: (string | undefined)[] = [], title = 'Link Item'): FrItem[] =>
    [0, 1, 2, 3, 4].map((index) => ({ title, glyph: glyphs[index], selected: index === 1 }));

type PlaygroundArgs = Pick<SideNavigationProps, 'condensed' | 'selectable' | 'collapseWidth' | 'aria-label'>;

const meta = {
    title: 'Components/Side Navigation',
    component: SideNavigation,
    subcomponents: { SideNavigationMain, SideNavigationUtility } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'The side navigation holds main and utility nested lists. Items open child lists with the expand button or the Right arrow (Left in RTL) and close them with the Left arrow; ' +
                    'Up and Down move across all visible items, Enter and Space activate them. Clicking an item selects it and highlights its parents. ' +
                    'Condensed, it shows the first-level icons only and opens child lists in popovers. In fundamental-ngx the side navigation is deprecated in favour of the vertical navigation.'
            }
        }
    },
    args: { condensed: false, selectable: true, 'aria-label': 'Main Navigation' }
} satisfies Meta<PlaygroundArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The navigation props as controls; `collapseWidth` condenses it while the window is at most that wide. */
export const Playground: Story = { render: (args) => <StorySideNav key={String(args.condensed)} {...args} /> };

export const Default: Story = { render: () => <StorySideNav /> };

export const Condensed: Story = { render: () => <StorySideNav condensed /> };

export const NotSelectable: Story = { name: 'Not selectable', render: () => <StorySideNav selectable={false} /> };

export const FromData: Story = { name: 'From data', render: () => <StoryModel /> };

export const FromDataCondensed: Story = { name: 'From data, condensed', render: () => <StoryModel condensed /> };

export const TextOnly: Story = { name: 'Text only', render: () => <StoryTextOnly /> };

export const Programmatic: Story = { name: 'Programmatic state', render: () => <StoryProgrammatic /> };

/** fundamental-react's primary story: text links, the second selected, an external link, and a skip link (Tab). */
export const Primary: Story = {
    render: () => (
        <StoryFundamentalReact
            lists={[
                {
                    items: [
                        ...linkItems().slice(0, 4),
                        {
                            title: (
                                <>
                                    External Link Item <Icon glyph="action" />
                                </>
                            )
                        }
                    ]
                }
            ]}
        />
    )
};

/** fundamental-react's compact story: the compact density. */
export const Compact: Story = {
    render: () => (
        <div data-density="compact">
            <StoryFundamentalReact lists={[{ items: linkItems() }]} />
        </div>
    )
};

/** fundamental-react's condensed story: one level of icons, the second selected. */
export const CondensedOneLevel: Story = {
    name: 'Condensed, one level',
    render: () => (
        <StoryFundamentalReact condensed lists={[{ items: linkItems(['home', 'cart', 'accept', 'alert', 'bell']) }]} />
    )
};

/** fundamental-react's oneLevel story: a main and a utility list. */
export const OneLevel: Story = {
    name: 'One level',
    render: () => (
        <StoryFundamentalReact
            lists={[
                { items: linkItems() },
                {
                    label: 'Utility Menu',
                    utility: true,
                    items: linkItems()
                        .slice(0, 2)
                        .map((i) => ({ ...i, selected: false }))
                }
            ]}
        />
    )
};

/** fundamental-react's withTitle story: group headers, one with a long title. */
export const WithTitle: Story = {
    name: 'With title',
    render: () => (
        <StoryFundamentalReact
            lists={[
                { title: 'Group Title', items: linkItems() },
                {
                    title: 'Group Title With A Pretty Long Name',
                    items: [{ title: 'Link Item' }, { title: 'Link Item With A Pretty Long Name' }]
                }
            ]}
        />
    )
};

/** fundamental-react's withSubList story: two items with child lists. */
export const WithSubList: Story = {
    name: 'With sub list',
    render: () => (
        <StoryFundamentalReact
            lists={[
                {
                    items: [
                        { title: 'Link Item 1' },
                        { title: 'Link Item 2', children: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'] },
                        { title: 'Link Item 3' },
                        { title: 'Link Item 4', children: ['Item 1', 'Item 2', 'Item 3', 'Item 4'] },
                        { title: 'Link Item' }
                    ]
                }
            ]}
        />
    )
};

/** fundamental-react's withIcons story: links with icons, the second selected. */
export const WithIcons: Story = {
    name: 'With icons',
    render: () => (
        <StoryFundamentalReact
            textOnly={false}
            lists={[{ items: linkItems(['home', 'home', 'home', 'home', 'home']) }]}
        />
    )
};

/** Opens the child list of a condensed first-level row in its popover from the keyboard (Right, Left in RTL). */
async function openChildPopover(canvas: HTMLElement, title: string, first: string): Promise<void> {
    const row = await waitFor(() => {
        const el = [...canvas.querySelectorAll<HTMLElement>('[aria-haspopup=tree]')].find(
            (r) => r.textContent?.trim() === title
        );
        expect(el).toBeTruthy();
        return el!;
    });
    if (row.getAttribute('aria-expanded') !== 'true') {
        row.focus();
        await userEvent.keyboard(getComputedStyle(row).direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
    }
    await waitFor(() => expect(document.activeElement?.textContent).toBe(first));
}

export const OpenCondensed: Story = {
    name: 'Open: condensed popover',
    tags: ['!autodocs'],
    render: () => <StorySideNav condensed />,
    play: ({ canvasElement }) => openChildPopover(canvasElement, 'Settings', 'Profile')
};

export const OpenFromDataCondensed: Story = {
    name: 'Open: from data, condensed',
    tags: ['!autodocs'],
    render: () => <StoryModel condensed />,
    play: ({ canvasElement }) => openChildPopover(canvasElement, 'Link 3', 'Sublink 1')
};
