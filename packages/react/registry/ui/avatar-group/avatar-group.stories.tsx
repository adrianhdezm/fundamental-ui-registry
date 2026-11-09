import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Avatar, type AvatarSize } from '@/ui/avatar/avatar';
import { Link } from '@/ui/link/link';
import {
    QuickView,
    QuickViewGroup,
    QuickViewGroupItem,
    QuickViewGroupItemContent,
    QuickViewGroupItemContentElement,
    QuickViewGroupItemLabel,
    QuickViewGroupTitle,
    QuickViewSubheader,
    QuickViewSubheaderSubtitle,
    QuickViewSubheaderTitle
} from '@/ui/quick-view/quick-view';
import { AvatarGroup, AvatarGroupItem, AvatarGroupOverflowList } from './avatar-group';

interface Person {
    name: string;
    role: string;
    image?: string;
}

const PEOPLE: Person[] = [
    { name: 'Alexander Hamilton', role: 'Treasury' },
    { name: 'Benjamin Franklin', role: 'Diplomat' },
    { name: 'Charlotte Brontë', role: 'Author', image: 'assets/person.svg' },
    { name: 'Dorothy Hodgkin', role: 'Chemist' },
    { name: 'Emmy Noether', role: 'Mathematician' },
    { name: 'Frida Kahlo', role: 'Painter', image: 'assets/person.svg' },
    { name: 'Grace Hopper', role: 'Computer scientist' },
    { name: 'Hedy Lamarr', role: 'Inventor' },
    { name: 'Isaac Newton', role: 'Physicist' },
    { name: 'Jane Austen', role: 'Author' },
    { name: 'Katherine Johnson', role: 'Mathematician' },
    { name: 'Leonardo da Vinci', role: 'Polymath' }
];

const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, '-');

/** The details of a person: a quick view with the avatar, the role and an email link. */
function PersonDetails({ person: p, idPrefix }: { person: Person; idPrefix: string }) {
    const email = `${slug(p.name).replace(/-/g, '.')}@example.com`;
    return (
        <QuickView>
            <QuickViewSubheader>
                <Avatar circle size="s" label={p.name} image={p.image} aria-label={p.name} />
                <QuickViewSubheaderTitle>{p.name}</QuickViewSubheaderTitle>
                <QuickViewSubheaderSubtitle>{p.role}</QuickViewSubheaderSubtitle>
            </QuickViewSubheader>
            <QuickViewGroup>
                <QuickViewGroupTitle id={`${idPrefix}-${slug(p.name)}-contact`}>Contact details</QuickViewGroupTitle>
                <QuickViewGroupItem>
                    <QuickViewGroupItemLabel>Email</QuickViewGroupItemLabel>
                    <QuickViewGroupItemContent>
                        <QuickViewGroupItemContentElement render={<Link href={`mailto:${email}`} />}>
                            {email}
                        </QuickViewGroupItemContentElement>
                    </QuickViewGroupItemContent>
                </QuickViewGroupItem>
            </QuickViewGroup>
        </QuickView>
    );
}

/** The avatars of `people` as group items, with their details. */
const avatars = (size: AvatarSize, idPrefix: string, people: Person[] = PEOPLE) =>
    people.map((p) => (
        <AvatarGroupItem key={p.name} title={p.name} details={<PersonDetails person={p} idPrefix={idPrefix} />}>
            <Avatar circle border size={size} label={p.name} image={p.image} title={p.name} aria-label={p.name} />
        </AvatarGroupItem>
    ));

const NOTE = 'mt-0 mb-2 font-sap-font-family text-sap-font-size text-sap-text-color';

const meta = {
    title: 'Components/Avatar Group',
    component: AvatarGroup,
    subcomponents: { AvatarGroupItem, AvatarGroupOverflowList },
    parameters: {
        docs: {
            description: {
                component:
                    'Avatar groups show the people of a team. Individual groups give each avatar its own details popover; ' +
                    'group-type groups overlap the avatars and open one popover with all of them. Avatars that do not fit ' +
                    'go into an overflow popover.\n\n' +
                    '```tsx\n' +
                    '<AvatarGroup size="s" overflowPopoverTitle="Team members" ariaLabel="Team members">\n' +
                    '    {people.map((p) => (\n' +
                    '        <AvatarGroupItem key={p.id} title={p.name} details={<PersonDetails person={p} />}>\n' +
                    '            <Avatar circle border size="s" label={p.name} />\n' +
                    '        </AvatarGroupItem>\n' +
                    '    ))}\n' +
                    '</AvatarGroup>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        type: { control: 'inline-radio', options: ['individual', 'group'] },
        size: { control: 'select', options: ['xs', 's', 'm', 'l', 'xl'] },
        orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
        overflowButtonShape: { control: 'inline-radio', options: ['square', 'circle'] },
        maxVisibleItems: { control: { type: 'number', min: 0 } },
        placement: {
            control: 'select',
            options: [undefined, 'bottom', 'bottom-start', 'bottom-end', 'top', 'right', 'left']
        }
    },
    args: {
        type: 'individual',
        size: 's',
        orientation: 'horizontal',
        overflowButtonShape: 'circle',
        overflowPopoverTitle: 'Team members',
        ariaLabel: 'Team members'
    }
} satisfies Meta<typeof AvatarGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <div className="max-w-xl">
            <AvatarGroup {...args}>{avatars(args.size ?? 's', 'playground')}</AvatarGroup>
        </div>
    )
};

export const Individual: Story = {
    name: 'Individual (resize to overflow)',
    parameters: {
        docs: {
            description: {
                story:
                    'Each avatar opens its details in a popover; the ones that do not fit go into the "+N" overflow ' +
                    'popover, which lists them and shows the details of the one chosen. Resize the window to see more ' +
                    'or fewer avatars.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            {(['xs', 's', 'm', 'l'] as const).map((size) => (
                <div key={size} className="max-w-xl">
                    <AvatarGroup size={size} overflowPopoverTitle="Team members" ariaLabel={`Team members (${size})`}>
                        {avatars(size, `individual-${size}`)}
                    </AvatarGroup>
                </div>
            ))}
        </div>
    )
};

export const Group: Story = {
    name: 'Group type',
    parameters: {
        docs: {
            description: {
                story: 'The avatars overlap and the whole group is one button that opens the list of all avatars.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            <div className="max-w-md">
                <AvatarGroup type="group" size="m" overflowPopoverTitle="Team members">
                    {avatars('m', 'group-m')}
                </AvatarGroup>
            </div>
            <div className="max-w-md">
                <AvatarGroup type="group" size="s" overflowPopoverTitle="Team members" maxVisibleItems={4}>
                    {avatars('s', 'group-s')}
                </AvatarGroup>
            </div>
        </div>
    )
};

export const MaxVisibleAndVertical: Story = {
    name: 'Max visible, square overflow button and vertical',
    render: () => (
        <div className="flex gap-12">
            <AvatarGroup size="s" maxVisibleItems={5} overflowButtonShape="square" overflowPopoverTitle="Team members">
                {avatars('s', 'max-s')}
            </AvatarGroup>
            <AvatarGroup size="xs" orientation="vertical" maxVisibleItems={4} overflowPopoverTitle="Team members">
                {avatars('xs', 'vertical-individual')}
            </AvatarGroup>
            <AvatarGroup
                type="group"
                size="xs"
                orientation="vertical"
                maxVisibleItems={4}
                overflowPopoverTitle="Team members"
            >
                {avatars('xs', 'vertical-group')}
            </AvatarGroup>
        </div>
    )
};

export const PopoverPlacement: Story = {
    name: 'Popover placement',
    parameters: {
        docs: {
            description: {
                story:
                    'The popovers open below the group (`bottom`, centred) by default, or to the right of a vertical ' +
                    'group; `placement` aligns them differently, e.g. `bottom-end`.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            <div>
                <p className={NOTE}>
                    <code>placement="bottom"</code> (default, centred)
                </p>
                <AvatarGroup type="group" size="m" placement="bottom" overflowPopoverTitle="Team members">
                    {avatars('m', 'placement-bottom')}
                </AvatarGroup>
            </div>
            <div>
                <p className={NOTE}>
                    <code>placement="bottom-end"</code> (aligned to the end)
                </p>
                <AvatarGroup type="group" size="m" placement="bottom-end" overflowPopoverTitle="Team members">
                    {avatars('m', 'placement-end')}
                </AvatarGroup>
            </div>
        </div>
    )
};

export const OverflowButtonShape: Story = {
    name: 'Overflow button shape',
    render: () => (
        <div className="flex flex-wrap items-start gap-12">
            <div>
                <p className={NOTE}>Default (square overflow button)</p>
                <AvatarGroup
                    size="m"
                    className="max-w-[200px]"
                    overflowPopoverTitle="Team members"
                    ariaLabel="Team with a square overflow button"
                >
                    {avatars('m', 'shape-square')}
                </AvatarGroup>
            </div>
            <div>
                <p className={NOTE}>
                    <code>overflowButtonShape="circle"</code>
                </p>
                <AvatarGroup
                    size="m"
                    className="max-w-[200px]"
                    overflowButtonShape="circle"
                    overflowPopoverTitle="Team members"
                    ariaLabel="Team with a circle overflow button"
                >
                    {avatars('m', 'shape-circle')}
                </AvatarGroup>
            </div>
        </div>
    )
};

export const CustomOverflow: Story = {
    name: 'Custom overflow button and body',
    parameters: {
        docs: {
            description: {
                story:
                    '`renderOverflowButton` replaces the "+N" button (Angular\'s `fdAvatarGroupOverflowButton`) and ' +
                    '`renderOverflowBody` the content of the overflow popover (`fdAvatarGroupOverflowBody`); both get ' +
                    'the avatars. `AvatarGroupOverflowList` is the default content, e.g. with another back label.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            <AvatarGroup
                size="s"
                maxVisibleItems={4}
                overflowPopoverTitle="More people"
                ariaLabel="Team with a custom overflow button"
                renderOverflowButton={(hidden) => (
                    <span className="flex h-12 items-center px-2 font-sap-font-family text-sap-font-size text-sap-link-color underline">
                        {`${hidden.length} more people`}
                    </span>
                )}
            >
                {avatars('s', 'custom-button')}
            </AvatarGroup>
            <AvatarGroup
                size="s"
                maxVisibleItems={4}
                overflowButtonShape="circle"
                overflowPopoverTitle="More people"
                ariaLabel="Team with a custom overflow body"
                renderOverflowBody={(items) => (
                    <AvatarGroupOverflowList
                        items={items}
                        title={`More people (${items.length})`}
                        backLabel="All people"
                    />
                )}
            >
                {avatars('s', 'custom-body')}
            </AvatarGroup>
        </div>
    )
};

// fundamental-styles' Overflow and Group Type stories: four avatars and "+4" in an individual group, six
// overlapping avatars and "+8" in a group-type group
const FS_PEOPLE: Person[] = [
    { name: 'Wendy Wallace', role: 'Marketing Manager' },
    { name: 'Simon Drew', role: 'Visual Designer' },
    { name: 'Christian Bow', role: 'Software Developer', image: 'assets/person.svg' },
    { name: 'Endy Wallace', role: 'Marketing Manager' },
    { name: 'Whitney Copper', role: 'Visual Designer' },
    { name: 'John Doe', role: 'Software Developer', image: 'assets/person.svg' },
    { name: 'Andy Wallace', role: 'Marketing Manager' },
    { name: 'John Carter', role: 'Visual Designer' },
    { name: 'Brian Tracey', role: 'Software Developer' },
    { name: 'Jared Moe', role: 'Marketing Manager' },
    { name: 'Ben Bloggs', role: 'Visual Designer' },
    { name: 'Simon Swan', role: 'Software Developer' },
    { name: 'Mike Simons', role: 'Marketing Manager' },
    { name: 'Fred Bloggs', role: 'Visual Designer' }
];

/** As fundamental-styles: the second of every three avatars shows the person placeholder icon (no label, named by aria-label). */
const fsAvatars = (size: AvatarSize, idPrefix: string, count: number) =>
    FS_PEOPLE.slice(0, count).map((p, i) => (
        <AvatarGroupItem key={p.name} title={p.name} details={<PersonDetails person={p} idPrefix={idPrefix} />}>
            <Avatar
                circle
                border
                size={size}
                label={i % 3 === 1 ? undefined : p.name}
                image={p.image}
                title={p.name}
                aria-label={p.name}
            />
        </AvatarGroupItem>
    ));

export const Overflow: Story = {
    name: 'Overflow (fundamental-styles)',
    parameters: {
        docs: {
            description: {
                story:
                    'The examples of fundamental-styles: an individual group with four avatars and a circle "+4" ' +
                    'button (`maxVisibleItems={5}`), and a group-type group with six avatars and "+8".'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            <AvatarGroup
                size="s"
                maxVisibleItems={5}
                overflowButtonShape="circle"
                overflowPopoverTitle="Team members"
                ariaLabel="Team members"
            >
                {fsAvatars('s', 'fs-individual', 8)}
            </AvatarGroup>
            <AvatarGroup
                type="group"
                size="m"
                maxVisibleItems={7}
                overflowButtonShape="circle"
                overflowPopoverTitle="Team members (14)"
            >
                {fsAvatars('m', 'fs-group', 14)}
            </AvatarGroup>
        </div>
    )
};

/** Clicks a trigger and waits for its popover. */
async function openPopover(trigger: HTMLElement): Promise<void> {
    await userEvent.click(trigger);
    await waitFor(() => {
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(document.querySelector('[role=dialog]')).not.toBeNull();
    });
}

const OpenIndividual = () => (
    <AvatarGroup size="s" maxVisibleItems={5} overflowPopoverTitle="Team members" ariaLabel="Team members">
        {avatars('s', 'open')}
    </AvatarGroup>
);

export const OpenDetails: Story = {
    name: 'Open: avatar details',
    tags: ['!autodocs'],
    render: () => <OpenIndividual />,
    play: ({ canvasElement }) =>
        openPopover(canvasElement.querySelector<HTMLElement>('[data-avatar-group-item] [role=button]')!)
};

export const OpenGroup: Story = {
    name: 'Open: group popover',
    tags: ['!autodocs'],
    render: () => (
        <AvatarGroup type="group" size="s" maxVisibleItems={4} overflowPopoverTitle="Team members">
            {avatars('s', 'open-group')}
        </AvatarGroup>
    ),
    play: ({ canvasElement }) => openPopover(canvasElement.querySelector<HTMLElement>('[role=button]')!)
};

export const OpenOverflow: Story = {
    name: 'Open: overflow list',
    tags: ['!autodocs'],
    render: () => <OpenIndividual />,
    play: ({ canvasElement }) =>
        openPopover(canvasElement.querySelector<HTMLElement>('[data-avatar-group-overflow] [role=button]')!)
};

export const OpenOverflowDetails: Story = {
    name: 'Open: overflow details',
    tags: ['!autodocs'],
    render: () => <OpenIndividual />,
    play: async ({ canvasElement }) => {
        await openPopover(canvasElement.querySelector<HTMLElement>('[data-avatar-group-overflow] [role=button]')!);
        await userEvent.click(document.querySelector<HTMLElement>('[role=dialog] [role=listitem]')!);
        await waitFor(() => expect(document.querySelector('[role=dialog] button[aria-label="Back"]')).not.toBeNull());
    }
};
