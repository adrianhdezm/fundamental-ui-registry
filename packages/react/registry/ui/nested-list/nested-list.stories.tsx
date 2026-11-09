import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import {
    NestedList,
    NestedListContent,
    NestedListExpandIcon,
    NestedListHeader,
    NestedListIcon,
    NestedListItem,
    NestedListLink,
    NestedListPopover,
    NestedListProvider,
    NestedListTitle,
    PreparedNestedList,
    type NestedListModel,
    type NestedListProps
} from './nested-list';

const TEXT = 'm-0 font-sap-font-family text-sap-font-size text-sap-text-color';

/** The list next to the last chosen link, as Angular's stories. */
function Frame({ chosen, condensed, children }: { chosen: string; condensed?: boolean; children: ReactNode }) {
    return (
        <div className="flex gap-4">
            <div className={condensed ? 'w-16 shadow-sap-content-shadow0' : 'w-72 shadow-sap-content-shadow0'}>
                {children}
            </div>
            <p className={TEXT} aria-live="polite">
                Chosen: {chosen || 'none'}
            </p>
        </div>
    );
}

const LINKS = [
    { icon: 'home', title: 'Home' },
    { icon: 'crossed-line-chart', title: 'Analytics' },
    { icon: 'add-equipment', title: 'Equipment' }
];
const SETTINGS = ['Profile', 'Security', 'Language'];

/** Angular's story: group headers, links with icons, the first one selected, and an expanded Settings group. */
function StoryNestedList({ textOnly = false, ...props }: Omit<NestedListProps, 'children'>) {
    const [chosen, setChosen] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(true);
    return (
        <Frame chosen={chosen}>
            <NestedList textOnly={textOnly} {...props}>
                <NestedListHeader>Overview</NestedListHeader>
                {LINKS.map((link, index) => (
                    <NestedListItem key={link.title}>
                        <NestedListLink selected={index === 0} onClick={() => setChosen(link.title)}>
                            {!textOnly && <NestedListIcon glyph={link.icon} />}
                            <NestedListTitle>{link.title}</NestedListTitle>
                        </NestedListLink>
                    </NestedListItem>
                ))}
                <NestedListHeader>Administration</NestedListHeader>
                <NestedListItem expanded={settingsOpen} onExpandedChange={setSettingsOpen}>
                    <NestedListContent>
                        <NestedListLink>
                            {!textOnly && <NestedListIcon glyph="settings" />}
                            <NestedListTitle>Settings</NestedListTitle>
                        </NestedListLink>
                        <NestedListExpandIcon />
                    </NestedListContent>
                    <NestedList textOnly>
                        {SETTINGS.map((sub) => (
                            <NestedListItem key={sub}>
                                <NestedListLink onClick={() => setChosen(sub)}>
                                    <NestedListTitle>{sub}</NestedListTitle>
                                </NestedListLink>
                            </NestedListItem>
                        ))}
                    </NestedList>
                </NestedListItem>
            </NestedList>
        </Frame>
    );
}

/** A condensed list outside a side navigation: icons only, the children of Settings and Analytics in popovers. */
function StoryCondensed({ settingsOpen = false }: { settingsOpen?: boolean }) {
    const [chosen, setChosen] = useState('');
    return (
        <Frame chosen={chosen} condensed>
            <NestedListProvider condensed>
                <NestedList aria-label="Condensed navigation">
                    <NestedListHeader>Overview</NestedListHeader>
                    <NestedListItem>
                        <NestedListLink selected onClick={() => setChosen('Home')}>
                            <NestedListIcon glyph="home" />
                            <NestedListTitle>Home</NestedListTitle>
                        </NestedListLink>
                    </NestedListItem>
                    <NestedListItem>
                        <NestedListPopover>
                            <NestedListContent>
                                <NestedListLink>
                                    <NestedListIcon glyph="crossed-line-chart" />
                                    <NestedListTitle>Analytics</NestedListTitle>
                                </NestedListLink>
                                <NestedListExpandIcon />
                            </NestedListContent>
                            <NestedList>
                                {['Sales', 'Forecasts'].map((sub) => (
                                    <NestedListItem key={sub}>
                                        <NestedListLink onClick={() => setChosen(sub)}>
                                            <NestedListTitle>{sub}</NestedListTitle>
                                        </NestedListLink>
                                    </NestedListItem>
                                ))}
                            </NestedList>
                        </NestedListPopover>
                    </NestedListItem>
                    <NestedListItem defaultExpanded={settingsOpen}>
                        <NestedListPopover>
                            <NestedListContent>
                                <NestedListLink>
                                    <NestedListIcon glyph="settings" />
                                    <NestedListTitle>Settings</NestedListTitle>
                                </NestedListLink>
                                <NestedListExpandIcon />
                            </NestedListContent>
                            <NestedList>
                                {SETTINGS.map((sub) => (
                                    <NestedListItem key={sub}>
                                        <NestedListLink onClick={() => setChosen(sub)}>
                                            <NestedListTitle>{sub}</NestedListTitle>
                                        </NestedListLink>
                                    </NestedListItem>
                                ))}
                            </NestedList>
                        </NestedListPopover>
                    </NestedListItem>
                </NestedList>
            </NestedListProvider>
        </Frame>
    );
}

/** Angular's From data story: headers, links with callbacks and an expanded child list. */
function StoryModel({ condensed = false }: { condensed?: boolean }) {
    const [chosen, setChosen] = useState('');
    const [list] = useState<NestedListModel>(() => {
        const pick = (name: string) => () => setChosen(name);
        return {
            items: [
                { headerTitle: 'Header Title 1' },
                { link: { icon: 'home', title: 'Link 1', callback: pick('Link 1') } },
                {
                    expanded: !condensed,
                    link: { icon: 'activate', title: 'Link 2' },
                    list: {
                        textOnly: true,
                        items: [
                            { link: { title: 'Sublink 1', callback: pick('Sublink 1') } },
                            { link: { title: 'Sublink 2', callback: pick('Sublink 2') } }
                        ]
                    }
                },
                { headerTitle: 'Header Title 2' },
                { link: { icon: 'approvals', title: 'Link 3', callback: pick('Link 3') } }
            ]
        };
    });
    return (
        <Frame chosen={chosen} condensed={condensed}>
            <PreparedNestedList list={list} condensed={condensed} aria-label="Navigation" />
        </Frame>
    );
}

/** Angular's side-navigation Programmatic state: items keep their `selected` props, buttons change them. */
function StoryNotSelectable() {
    const [selected, setSelected] = useState('Home');
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <Button
                    label={expanded ? 'Collapse Settings' : 'Expand Settings'}
                    onClick={() => setExpanded(!expanded)}
                />
                <Button label="Select Home" onClick={() => setSelected('Home')} />
                <Button label="Select Security" onClick={() => setSelected('Security')} />
            </div>
            <div className="w-72 shadow-sap-content-shadow0">
                <NestedListProvider selectable={false}>
                    <NestedList>
                        <NestedListItem>
                            <NestedListLink selected={selected === 'Home'} onClick={() => setSelected('Home')}>
                                <NestedListIcon glyph="home" />
                                <NestedListTitle>Home</NestedListTitle>
                            </NestedListLink>
                        </NestedListItem>
                        <NestedListItem expanded={expanded} onExpandedChange={setExpanded}>
                            <NestedListContent selected={selected === 'Security'}>
                                <NestedListLink>
                                    <NestedListIcon glyph="settings" />
                                    <NestedListTitle>Settings</NestedListTitle>
                                </NestedListLink>
                                <NestedListExpandIcon />
                            </NestedListContent>
                            <NestedList textOnly>
                                {SETTINGS.map((sub) => (
                                    <NestedListItem key={sub}>
                                        <NestedListLink selected={selected === sub} onClick={() => setSelected(sub)}>
                                            <NestedListTitle>{sub}</NestedListTitle>
                                        </NestedListLink>
                                    </NestedListItem>
                                ))}
                            </NestedList>
                        </NestedListItem>
                    </NestedList>
                </NestedListProvider>
            </div>
        </div>
    );
}

type PlaygroundArgs = Pick<
    NestedListProps,
    'textOnly' | 'ariaRoledescriptionTree' | 'ariaRoledescriptionMenuBar' | 'ariaLabelSelected'
>;

const meta = {
    title: 'Components/Nested List',
    component: NestedList,
    subcomponents: {
        NestedListItem,
        NestedListLink,
        NestedListContent,
        NestedListTitle,
        NestedListIcon,
        NestedListHeader,
        NestedListExpandIcon,
        NestedListPopover,
        NestedListProvider,
        PreparedNestedList
    } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'A tree of navigation links with group headers and expandable child lists, usable on its own or inside a side navigation. ' +
                    'Up and Down move across the visible rows (wrapping at the ends), Home and End jump to the first and last; Right opens a child list (Left in RTL) and Left closes it. ' +
                    'Clicking an item selects it and highlights its parents; before any click, the `selected` props show the selection. ' +
                    'In a condensed `NestedListProvider`, first-level items show their icons only and a `NestedListPopover` opens their children to the side.'
            }
        }
    },
    args: {
        textOnly: false,
        ariaRoledescriptionTree: 'Navigation List Tree',
        ariaRoledescriptionMenuBar: 'Navigation List Menu Bar',
        ariaLabelSelected: 'Selected'
    }
} satisfies Meta<PlaygroundArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The list props as controls. */
export const Playground: Story = { render: (args) => <StoryNestedList {...args} /> };

export const Default: Story = { render: () => <StoryNestedList /> };

export const TextOnly: Story = { name: 'Text only', render: () => <StoryNestedList textOnly /> };

export const FromData: Story = { name: 'From data', render: () => <StoryModel /> };

export const NotSelectable: Story = { name: 'Not selectable', render: () => <StoryNotSelectable /> };

export const Condensed: Story = { render: () => <StoryCondensed /> };

export const FromDataCondensed: Story = { name: 'From data, condensed', render: () => <StoryModel condensed /> };

/** The Settings popover open from the start, to compare it with fundamental-styles. */
export const CondensedOpen: Story = {
    name: 'Condensed, open',
    tags: ['!autodocs'],
    render: () => <StoryCondensed settingsOpen />
};

const rows = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('[role=treeitem]')];
const forwardKey = (root: HTMLElement) => (getComputedStyle(root).direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');

/** Opens the popover of the second row of a condensed list from the keyboard: Down, then Right (Left in RTL). */
async function openSecond(canvasElement: HTMLElement, first: string) {
    rows(canvasElement)[0]!.focus();
    await userEvent.keyboard(`{ArrowDown}${forwardKey(canvasElement)}`);
    await waitFor(() => expect(document.activeElement?.textContent).toBe(first));
}

export const OpenCondensed: Story = {
    name: 'Open: condensed popover',
    tags: ['!autodocs'],
    render: () => <StoryCondensed />,
    play: ({ canvasElement }) => openSecond(canvasElement, 'Sales')
};

export const OpenFromDataCondensed: Story = {
    name: 'Open: from data, condensed',
    tags: ['!autodocs'],
    render: () => <StoryModel condensed />,
    play: ({ canvasElement }) => openSecond(canvasElement, 'Sublink 1')
};
