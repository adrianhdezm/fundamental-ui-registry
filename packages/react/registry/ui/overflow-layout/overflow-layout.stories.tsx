import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Avatar } from '@/ui/avatar/avatar';
import { Bar, BarElement, BarLeft, ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import { InfoLabel, type InfoLabelColor } from '@/ui/info-label/info-label';
import { Link } from '@/ui/link/link';
import { Popover, PopoverBody, PopoverBodyHeader, PopoverTrigger } from '@/ui/popover/popover';
import { Title } from '@/ui/title/title';
import { OverflowItem, OverflowLayout } from './overflow-layout';

const meta = {
    title: 'Components/Overflow Layout',
    component: OverflowLayout,
    parameters: {
        docs: {
            description: {
                component:
                    'Overflow layouts show as many items as fit in one row (and at most `maxVisibleItems`); the rest go ' +
                    'into a "N more" popover. Items with `forceVisibility` always stay visible. Children are the items; ' +
                    'wrap one in `OverflowItem` to give it data, `forceVisibility`, `onHiddenChange`, or a render ' +
                    'function of its context (`hidden`, `index`, `globalIndex`, …). `renderMore` replaces the "more" ' +
                    'button and popover with your own control.\n\n' +
                    '```tsx\n' +
                    '<OverflowLayout maxVisibleItems={5} ariaRole="list" ariaLabel="Tags">\n' +
                    '    {tags.map((tag) => (\n' +
                    '        <InfoLabel key={tag} className="me-2">{tag}</InfoLabel>\n' +
                    '    ))}\n' +
                    '</OverflowLayout>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        maxVisibleItems: { control: { type: 'number', min: 0 } },
        showMorePosition: { control: 'inline-radio', options: ['left', 'right'] }
    },
    args: {
        maxVisibleItems: Number.POSITIVE_INFINITY,
        showMorePosition: 'right',
        showMoreButton: true,
        reverseHiddenItems: false,
        enableKeyboardNavigation: true,
        ariaRole: 'list',
        ariaLabel: 'Info labels'
    }
} satisfies Meta<typeof OverflowLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

const color = (i: number) => ((i % 10) + 1) as InfoLabelColor;
const NOTE = 'm-0 text-sap-font-small-size text-sap-content-label-color';

export const Playground: Story = {
    render: (args) => (
        <div className="max-w-xl">
            <OverflowLayout {...args}>
                {Array.from({ length: 12 }, (_, i) => (
                    <InfoLabel key={i} className="me-2" color={color(i)}>
                        {`Info label ${i + 1}`}
                    </InfoLabel>
                ))}
            </OverflowLayout>
        </div>
    )
};

function Resizable() {
    const [items, setItems] = useState(() => Array.from({ length: 10 }, (_, i) => i + 1));
    const [hidden, setHidden] = useState(0);
    const [max, setMax] = useState(Number.POSITIVE_INFINITY);
    return (
        <div className="flex flex-col gap-6">
            <div
                className="resize-x overflow-hidden border border-dashed border-sap-group-content-border-color p-2"
                style={{ width: '36rem', minWidth: '10rem' }}
            >
                <OverflowLayout
                    maxVisibleItems={max}
                    ariaRole="list"
                    ariaLabel="Info labels"
                    onHiddenItemsCountChange={setHidden}
                >
                    {items.map((item, i) => (
                        <OverflowItem key={item}>
                            {({ hidden: isHidden }) => (
                                <InfoLabel className="me-2" color={color(i)}>
                                    {`Info label ${item}${isHidden ? ' (hidden)' : ''}`}
                                </InfoLabel>
                            )}
                        </OverflowItem>
                    ))}
                </OverflowLayout>
            </div>
            <p className={NOTE}>
                {items.length} items, {hidden} hidden. Drag the corner to resize.
            </p>
            <div className="flex gap-2">
                <Button label="Add item" onClick={() => setItems((list) => [...list, list.length + 1])} />
                <Button label="Remove item" onClick={() => setItems((list) => list.slice(0, -1))} />
                <Button
                    label={max === 3 ? 'No limit' : 'Max 3 visible'}
                    onClick={() => setMax(max === 3 ? Number.POSITIVE_INFINITY : 3)}
                />
            </div>
        </div>
    );
}

export const Default: Story = {
    name: 'Resizable',
    parameters: {
        docs: {
            description: {
                story:
                    'The layout follows the width of its container: drag the corner. Each item knows whether it renders ' +
                    'in the popover (`hidden`); `onHiddenItemsCountChange` reports how many are hidden.'
            }
        }
    },
    render: () => <Resizable />
};

const LABELS = Array.from({ length: 12 }, (_, i) => i + 1);

export const AlwaysVisible: Story = {
    name: 'Forced visibility, start position and custom "more"',
    parameters: {
        docs: {
            description: {
                story:
                    'The last label has `forceVisibility` and stays in the row. The second layout shows the "more" ' +
                    'control at the start (`showMorePosition="left"`), so items overflow from the start, lists them ' +
                    'in reverse order (`reverseHiddenItems`), and renders its own control with `renderMore`.'
            }
        }
    },
    render: () => (
        <div className="flex max-w-xl flex-col gap-6">
            <OverflowLayout>
                {LABELS.map((item) => (
                    <OverflowItem key={item} forceVisibility={item === 12}>
                        <InfoLabel className="me-2" color={item === 12 ? 8 : 6}>
                            {item === 12 ? 'Always visible' : `Label ${item}`}
                        </InfoLabel>
                    </OverflowItem>
                ))}
            </OverflowLayout>
            <OverflowLayout
                showMorePosition="left"
                reverseHiddenItems
                renderMore={(hidden) => <Button variant="transparent" label={`+${hidden.length}`} />}
            >
                {LABELS.map((item) => (
                    <InfoLabel key={item} className="ms-2" color={3}>
                        {`Label ${item}`}
                    </InfoLabel>
                ))}
            </OverflowLayout>
        </div>
    )
};

/** A hidden info label as a button: clicking it in the popover moves it into the row. */
const PILL =
    'm-0 cursor-pointer rounded-sap-element-border-corner-radius border-0 bg-transparent p-0 focus-visible:outline-sap';

function ClickToShowDemo() {
    const [items, setItems] = useState(() => Array.from({ length: 15 }, (_, i) => i));
    const [forced, setForced] = useState<number | null>(null);
    return (
        <div className="flex max-w-xl flex-col gap-4">
            <p className={NOTE}>Click an item in the &quot;More&quot; popover to move it into the visible row.</p>
            <OverflowLayout ariaRole="list" ariaLabel="Info labels">
                {items.map((item) => (
                    <OverflowItem key={item} forceVisibility={forced === item}>
                        {({ hidden }) =>
                            hidden ? (
                                <button type="button" className={PILL} onClick={() => setForced(item)}>
                                    <InfoLabel color={color(item)}>{`Info label ${item} hidden`}</InfoLabel>
                                </button>
                            ) : (
                                <InfoLabel className="me-2" color={color(item)}>
                                    {`Info label ${item}${forced === item ? ' shown' : ' visible'}`}
                                </InfoLabel>
                            )
                        }
                    </OverflowItem>
                ))}
            </OverflowLayout>
            <div className="flex gap-2">
                <Button label="Add new item" onClick={() => setItems((list) => [...list, list.length])} />
                <Button label="Remove item" onClick={() => setItems((list) => list.slice(0, -1))} />
            </div>
        </div>
    );
}

export const ClickToShow: Story = {
    name: 'Click to show',
    parameters: {
        docs: {
            description: {
                story:
                    'Fundamental NGX\'s "Forcing visibility of the items": a hidden item renders as a button in the ' +
                    'popover; clicking it gives it `forceVisibility`, so it moves into the row.'
            }
        }
    },
    render: () => <ClickToShowDemo />
};

interface Person {
    id: string;
    name: string;
    position: string;
    email: string;
    glyph?: string;
}

const POSITIONS = ['Marketing Manager', 'Visual Designer', 'Software Developer'];
const GLYPHS = ['accidental-leave', 'account', 'activity-individual', 'action-settings', 'add-contact', 'calendar'];
const NAMES = [
    'John Doe',
    'Sarah Parker',
    'Jason Goldwell',
    'Christian Bow',
    'Jessica Bale',
    'Jonathan Smith',
    'Gordon Jason',
    'Simon Swan',
    'Whitney Carter',
    'Chris Copper',
    'David Doe',
    'John Parker',
    'Sarah Goldwell',
    'Jason Bow',
    'Christian Bale',
    'Jessica Smith',
    'Jonathan Jason',
    'Gordon Swan',
    'Simon Carter',
    'Whitney Copper'
];
const person = (name: string, i: number): Person => ({
    id: `story-person-${i}`,
    name,
    position: POSITIONS[i % POSITIONS.length]!,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    glyph: i % 2 ? GLYPHS[i % GLYPHS.length] : undefined
});

/** Avatars show a photo or an icon: initials in a button would not match its name. */
function PersonAvatar({ person: p, ...props }: { person: Person } & Omit<Parameters<typeof Avatar>[0], 'children'>) {
    return (
        <Avatar
            size="s"
            circle
            border
            glyph={p.glyph}
            image={p.glyph ? null : 'assets/person.svg'}
            aria-label={p.name}
            title={p.name}
            {...props}
        />
    );
}

/** Stand-in for the quick view until it is ported: a title, the person and the contact details. */
function BusinessCard({ person: p, onBack }: { person: Person; onBack?: () => void }) {
    return (
        <div className="flex w-[20rem] flex-col whitespace-normal">
            <PopoverBodyHeader>
                <Bar barDesign="header">
                    <BarLeft>
                        {onBack && (
                            <ButtonBar glyph="navigation-left-arrow" aria-label="Back" title="Back" onClick={onBack} />
                        )}
                        <BarElement>
                            <Title level={5}>Business card</Title>
                        </BarElement>
                    </BarLeft>
                </Bar>
            </PopoverBodyHeader>
            <div className="flex items-center gap-3 p-4">
                <PersonAvatar person={p} />
                <div className="flex flex-col gap-1">
                    <Title level={6}>{p.name}</Title>
                    <span className="text-sap-font-small-size text-sap-content-label-color">{p.position}</span>
                </div>
            </div>
            <section className="flex flex-col gap-2 px-4 pb-4" aria-labelledby={`${p.id}-contact`}>
                <Title level={6} id={`${p.id}-contact`}>
                    Contact details
                </Title>
                <div className="flex flex-col gap-1">
                    <span className="text-sap-font-small-size text-sap-content-label-color">Email</span>
                    <Link href={`mailto:${p.email}`}>{p.email}</Link>
                </div>
            </section>
        </div>
    );
}

function AvatarGroupDemo() {
    const [people, setPeople] = useState(() => NAMES.map(person));
    const [detail, setDetail] = useState<Person | null>(null);
    return (
        <div className="flex max-w-md flex-col gap-4">
            <OverflowLayout<Person>
                ariaRole="list"
                ariaLabel="Team members"
                renderMore={(hidden) => (
                    <Popover placement="bottom" noArrow={false} onOpenChange={() => setDetail(null)}>
                        <PopoverTrigger
                            render={
                                <Button
                                    variant="transparent"
                                    label={`+${hidden.length}`}
                                    aria-label={`+${hidden.length} more team members`}
                                />
                            }
                        />
                        <PopoverBody aria-label={`Team members (${hidden.length})`}>
                            {detail ? (
                                <BusinessCard person={detail} onBack={() => setDetail(null)} />
                            ) : (
                                <div className="flex flex-col">
                                    <PopoverBodyHeader>
                                        <Bar barDesign="header">
                                            <BarLeft>
                                                <BarElement>
                                                    <Title level={5}>{`Team members (${hidden.length})`}</Title>
                                                </BarElement>
                                            </BarLeft>
                                        </Bar>
                                    </PopoverBodyHeader>
                                    <div className="m-0 flex max-w-[19.5rem] flex-wrap gap-2 p-2" role="list">
                                        {hidden.map((ref) => (
                                            <div key={ref.key} role="listitem">
                                                <PersonAvatar
                                                    person={ref.item}
                                                    clickable
                                                    onAvatarClick={() => setDetail(ref.item)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </PopoverBody>
                    </Popover>
                )}
            >
                {people.map((p) => (
                    <OverflowItem key={p.id} item={p}>
                        <div className="me-1 flex">
                            <Popover placement="top" noArrow={false}>
                                <PopoverTrigger nativeButton={false} render={<PersonAvatar person={p} clickable />} />
                                <PopoverBody aria-label={p.name}>
                                    <BusinessCard person={p} />
                                </PopoverBody>
                            </Popover>
                        </div>
                    </OverflowItem>
                ))}
            </OverflowLayout>
            <div className="flex gap-2">
                <Button
                    label="Add new item"
                    onClick={() => setPeople((list) => [...list, person(`Extra User ${list.length}`, list.length)])}
                />
                <Button label="Remove item" onClick={() => setPeople((list) => list.slice(0, -1))} />
            </div>
        </div>
    );
}

export const AvatarGroup: Story = {
    name: 'Avatar group',
    parameters: {
        docs: {
            description: {
                story:
                    'Fundamental NGX\'s "Overflow Layout Complex example": an avatar group. Each visible avatar opens a ' +
                    'business card; the custom "+N" control (`renderMore`) opens a popover with the hidden avatars, ' +
                    'and clicking one shows its card there.'
            }
        }
    },
    render: () => <AvatarGroupDemo />
};

/** Clicks the "more" control of the first overflow layout and waits for its popover. */
async function openMore(canvasElement: HTMLElement, label: RegExp): Promise<void> {
    const more = await waitFor(() => {
        const el = [...canvasElement.querySelectorAll<HTMLElement>('[aria-haspopup]')].find((b) =>
            label.test(b.textContent ?? '')
        );
        expect(el).toBeDefined();
        return el!;
    });
    await userEvent.click(more);
    await waitFor(() => {
        expect(more.getAttribute('aria-expanded')).toBe('true');
        expect(document.getElementById(more.getAttribute('aria-controls') ?? '')).not.toBeNull();
    });
}

export const OpenMore: Story = {
    name: 'Open: more popover',
    tags: ['!autodocs'],
    render: Default.render,
    play: ({ canvasElement }) => openMore(canvasElement, /more$/)
};
export const OpenClickToShow: Story = {
    name: 'Open: click to show',
    tags: ['!autodocs'],
    render: ClickToShow.render,
    play: ({ canvasElement }) => openMore(canvasElement, /more$/)
};
export const OpenAvatarGroup: Story = {
    name: 'Open: avatar group',
    tags: ['!autodocs'],
    render: AvatarGroup.render,
    play: ({ canvasElement }) => openMore(canvasElement, /^\+\d+$/)
};
