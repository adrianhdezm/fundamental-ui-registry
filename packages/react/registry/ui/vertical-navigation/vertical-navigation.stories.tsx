import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType } from 'react';
import { expect, waitFor } from 'storybook/test';
import {
    ListNavigationItem,
    ListNavigationItemArrow,
    ListNavigationItemIcon,
    ListNavigationItemList,
    ListNavigationItemText,
    VerticalNavigation,
    VerticalNavigationGroupHeader,
    type VerticalNavigationProps
} from './vertical-navigation';

interface Entry {
    glyph: string;
    text: string;
    children?: string[];
}

const ENTRIES: Entry[] = [
    { glyph: 'home', text: 'Overview' },
    { glyph: 'calendar', text: 'Calendar', children: ['Today', 'Upcoming Events Upcoming Events'] },
    { glyph: 'customer', text: 'Customers', children: ['Accounts', 'Contacts'] },
    { glyph: 'shipping-status', text: 'Deliveries' }
];
const SERVICES: Entry[] = [
    { glyph: 'headset', text: 'Support' },
    { glyph: 'meal', text: 'Lunch' },
    { glyph: 'stethoscope', text: 'Health' }
];

interface StoryVerticalNavProps extends Pick<VerticalNavigationProps, 'condensed' | 'aria-label'> {
    icons?: boolean;
    grouping?: boolean;
    /** Expands Calendar at first. */
    expandFirst?: boolean;
    /** The current page at first. */
    initial?: string;
}

/** Angular's story host: the navigation next to the current page, which a click on an item changes. */
function StoryVerticalNav({
    condensed = false,
    icons = true,
    grouping = false,
    expandFirst = false,
    initial = 'Overview',
    'aria-label': ariaLabel
}: StoryVerticalNavProps) {
    const [current, setCurrent] = useState(initial);
    return (
        <div className="flex h-[30rem] items-start gap-6">
            <VerticalNavigation condensed={condensed} aria-label={ariaLabel}>
                {ENTRIES.map((entry, index) => (
                    <ListNavigationItem
                        key={entry.text}
                        indicated={current === entry.text}
                        defaultExpanded={expandFirst && index === 1}
                        onClick={() => !entry.children && setCurrent(entry.text)}
                    >
                        {icons && <ListNavigationItemIcon glyph={entry.glyph} />}
                        <ListNavigationItemText>{entry.text}</ListNavigationItemText>
                        {entry.children && <ListNavigationItemArrow />}
                        {entry.children && (
                            <ListNavigationItemList>
                                {entry.children.map((child) => (
                                    <ListNavigationItem
                                        key={child}
                                        indicated={current === child}
                                        onClick={() => setCurrent(child)}
                                    >
                                        <ListNavigationItemText>{child}</ListNavigationItemText>
                                    </ListNavigationItem>
                                ))}
                            </ListNavigationItemList>
                        )}
                    </ListNavigationItem>
                ))}
                {grouping && (
                    <>
                        <VerticalNavigationGroupHeader>Employee Services</VerticalNavigationGroupHeader>
                        {SERVICES.map((entry) => (
                            <ListNavigationItem
                                key={entry.text}
                                indicated={current === entry.text}
                                onClick={() => setCurrent(entry.text)}
                            >
                                <ListNavigationItemIcon glyph={entry.glyph} />
                                <ListNavigationItemText>{entry.text}</ListNavigationItemText>
                            </ListNavigationItem>
                        ))}
                    </>
                )}
            </VerticalNavigation>
            <p className="m-0 font-sap-font-family text-sap-font-size text-sap-text-color" aria-live="polite">
                Current page: {current}
            </p>
        </div>
    );
}

type PlaygroundArgs = StoryVerticalNavProps;

const meta = {
    title: 'Components/Vertical Navigation',
    component: VerticalNavigation,
    subcomponents: {
        ListNavigationItem,
        ListNavigationItemIcon,
        ListNavigationItemText,
        ListNavigationItemArrow,
        ListNavigationItemList,
        VerticalNavigationGroupHeader
    } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'The vertical navigation lists the pages of an application with icons, texts and second-level items; `indicated` marks the current page (on a collapsed parent when a child is current). ' +
                    'Condensed, it shows the icons only and opens second-level items in a panel over the content. ' +
                    'Up and Down move between visible items, Right and Left (mirrored in RTL) expand and collapse, Enter and Space toggle or activate.'
            }
        }
    },
    args: { condensed: false, icons: true, grouping: false, expandFirst: false, 'aria-label': 'Main Navigation' }
} satisfies Meta<PlaygroundArgs>;
export default meta;
type Story = StoryObj<PlaygroundArgs>;

/** The story host's options as controls. */
export const Playground: Story = {
    render: (args) => <StoryVerticalNav key={String(args.expandFirst)} {...args} />
};

export const Default: Story = { render: () => <StoryVerticalNav expandFirst initial="Today" /> };

export const Condensed: Story = { render: () => <StoryVerticalNav condensed initial="Today" /> };

export const Grouping: Story = { render: () => <StoryVerticalNav grouping initial="Support" /> };

export const NoIcons: Story = { name: 'No icons', render: () => <StoryVerticalNav icons={false} expandFirst /> };

export const OpenCondensed: Story = {
    name: 'Open: condensed panel',
    tags: ['!autodocs'],
    // Calendar starts expanded, as Angular's story, so the panel is open on load
    render: () => <StoryVerticalNav condensed expandFirst initial="Today" />,
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const today = [...canvasElement.querySelectorAll<HTMLElement>('[role=treeitem]')].find(
                (item) => item.textContent === 'Today'
            );
            expect(today?.offsetParent).toBeTruthy();
        });
    }
};
