import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { DatePicker } from '@/ui/date-picker/date-picker';
import { FormLabel } from '@/ui/form/form';
import { Icon } from '@/ui/icon/icon';
import { Input } from '@/ui/input/input';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/ui/menu/menu';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { Select, SelectOption } from '@/ui/select/select';
import { SplitButton } from '@/ui/split-button/split-button';
import { Title } from '@/ui/title/title';
import { Toolbar, ToolbarItem, ToolbarLabel, ToolbarOverflowButton, ToolbarSeparator, ToolbarSpacer } from './toolbar';

const meta = {
    title: 'Components/Toolbar',
    component: Toolbar,
    parameters: {
        docs: {
            description: {
                component:
                    'Toolbars hold a title and actions. With `shouldOverflow`, items that do not fit move into an ' +
                    'overflow popover, by priority (`overflowPriority`) and group (`overflowGroup`). Items are ' +
                    '`ToolbarOverflowButton`, `ToolbarLabel` and any control wrapped in `ToolbarItem`; other children ' +
                    'always stay in the row. Items keep their state in the popover: they are moved, not rendered again.\n\n' +
                    '```tsx\n' +
                    '<Toolbar title="Products" shouldOverflow>\n' +
                    '    <ToolbarSpacer />\n' +
                    '    <ToolbarOverflowButton variant="transparent" label="Add" />\n' +
                    '    <ToolbarOverflowButton variant="transparent" label="Export" overflowPriority="low" />\n' +
                    '    <ToolbarItem overflowPriority="low"><Checkbox label="Only mine" /></ToolbarItem>\n' +
                    '</Toolbar>\n' +
                    '```'
            }
        }
    },
    argTypes: { variant: { control: 'select', options: ['solid', 'transparent', 'auto', 'info'] } },
    args: { variant: 'solid', title: 'Products', clearBorder: false, shouldOverflow: true }
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

const COL = 'flex flex-col gap-6';
const NOTE = 'm-0 mt-2 text-sap-font-small-size text-sap-content-label-color';
const HEADING = 'm-0 mb-2 font-sap-font-header-family text-sap-font-header5-size text-sap-text-color';

function Resizable({ width, children }: { width: string; children: ReactNode }) {
    return (
        <>
            <div
                className="resize-x overflow-hidden border border-dashed border-sap-group-content-border-color p-1"
                style={{ width, minWidth: '12rem' }}
            >
                {children}
            </div>
            <p className={NOTE}>Drag the bottom-right corner to resize.</p>
        </>
    );
}

export const Playground: Story = {
    render: (args) => (
        <Resizable width="40rem">
            <Toolbar {...args}>
                <ToolbarSpacer />
                <ToolbarOverflowButton variant="transparent" label="Add" />
                <ToolbarOverflowButton variant="transparent" label="Edit" />
                <ToolbarOverflowButton variant="transparent" label="Export" overflowPriority="low" />
                <ToolbarOverflowButton variant="transparent" label="Share" overflowPriority="low" />
                <ToolbarOverflowButton
                    variant="transparent"
                    glyph="action-settings"
                    aria-label="Settings"
                    overflowPriority="never"
                />
            </Toolbar>
        </Resizable>
    )
};

/** The icon buttons at the end of fundamental-styles' toolbars. */
function IconButtons() {
    return (
        <>
            <Button variant="transparent" glyph="survey" aria-label="Survey" />
            <Button variant="transparent" glyph="pool" aria-label="Pool" />
            <Button variant="transparent" glyph="pie-chart" aria-label="Chart" />
        </>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <h3 className={HEADING}>{title}</h3>
            {children}
        </section>
    );
}

export const Types: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'The variants (`solid`, `transparent`, `auto`, `info`), `clearBorder`, an active info toolbar ' +
                    '(focusable, clicked with Enter and Space) and a title, with the contents of fundamental-styles’ Types.'
            }
        }
    },
    render: () => (
        <div className={COL}>
            <Section title="Solid">
                <Toolbar variant="solid" aria-label="Solid toolbar">
                    <ToolbarLabel>Products (23)</ToolbarLabel>
                    <Button variant="transparent" label="Create" />
                    <ToolbarSpacer />
                    <Button variant="transparent" label="Edit" />
                    <Button variant="transparent" label="Delete" />
                    <ToolbarSeparator />
                    <IconButtons />
                </Toolbar>
            </Section>
            <Section title="Transparent">
                <Toolbar variant="transparent" aria-label="Transparent toolbar">
                    <Button variant="transparent" label="Create" />
                    <Button variant="transparent" label="Save" />
                    <ToolbarSpacer />
                    <Button variant="transparent" label="Edit" />
                    <Button variant="transparent" label="Delete" />
                    <ToolbarSeparator />
                    <IconButtons />
                </Toolbar>
            </Section>
            <Section title="Auto">
                <Toolbar variant="auto" aria-label="Auto toolbar">
                    <Button variant="transparent" label="Create" />
                    <ToolbarSpacer />
                    <Button variant="transparent" label="Edit" />
                    <Button variant="transparent" label="Delete" />
                    <ToolbarSeparator />
                    <IconButtons />
                </Toolbar>
            </Section>
            <Section title="Clear">
                <Toolbar clearBorder aria-label="Clear toolbar">
                    <ToolbarSpacer />
                    <Button variant="transparent" label="Edit" />
                    <Button variant="transparent" label="Delete" />
                    <ToolbarSeparator />
                    <IconButtons />
                </Toolbar>
            </Section>
            <Section title="Transparent without border">
                <Toolbar variant="transparent" clearBorder aria-label="Transparent toolbar without border">
                    <ToolbarLabel>Transparent</ToolbarLabel>
                </Toolbar>
            </Section>
            <Section title="Info (not active)">
                <Toolbar variant="info" aria-label="Info, not active toolbar">
                    <ToolbarLabel>3 item selected</ToolbarLabel>
                    <ToolbarSpacer />
                    <Icon glyph="undo" />
                </Toolbar>
            </Section>
            <Section title="Info (active)">
                <Toolbar variant="info" active aria-label="Info, active toolbar">
                    <ToolbarLabel>3 item selected</ToolbarLabel>
                    <ToolbarSpacer />
                    <Icon glyph="undo" />
                </Toolbar>
            </Section>
            <Section title="Info (active) with an icon">
                <Toolbar variant="info" active aria-label="Active info toolbar">
                    <Icon glyph="filter" />
                    <ToolbarLabel>Info active: filtered by Category</ToolbarLabel>
                </Toolbar>
            </Section>
            <Section title="Title">
                <Toolbar title="Products (104)" headingLevel={4}>
                    <ToolbarSpacer />
                    <Button variant="transparent" label="Save" />
                    <Button variant="transparent" label="Delete" />
                </Toolbar>
            </Section>
        </div>
    )
};

export const TitleSpacerSeparator: Story = {
    name: 'Title, spacer and separator',
    render: () => (
        <div className={COL}>
            <Toolbar title="Toolbar title">
                <ToolbarSpacer />
                <Button variant="transparent" label="Add" />
                <ToolbarSeparator />
                <Button variant="transparent" glyph="sort" aria-label="Sort" />
                <Button variant="transparent" glyph="filter" aria-label="Filter" />
            </Toolbar>
            <Toolbar aria-label="Fixed spacer">
                <Button variant="transparent" label="Left" />
                <ToolbarSpacer fixed width="100px" />
                <Button variant="transparent" label="After 100px" />
                <ToolbarSpacer />
                <Button variant="transparent" label="Right" />
            </Toolbar>
        </div>
    )
};

export const Alignment: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Spacers align the items, as in fundamental-styles’ Alignment and Separators stories.'
            }
        }
    },
    render: () => (
        <div className={COL}>
            <Section title="Left and right-aligned">
                <Toolbar aria-label="Left and right-aligned toolbar">
                    <Button variant="positive" label="Accept" />
                    <ToolbarSpacer />
                    <Button variant="negative" label="Reject" />
                </Toolbar>
            </Section>
            <Section title="Centered">
                <Toolbar aria-label="Centered toolbar">
                    <ToolbarSpacer />
                    <Button label="Centered" />
                    <ToolbarSpacer />
                </Toolbar>
            </Section>
            <Section title="Right-aligned">
                <Toolbar aria-label="Right-aligned toolbar">
                    <ToolbarSpacer />
                    <Button label="Right-aligned" />
                </Toolbar>
            </Section>
            <Section title="Spacers with fixed width">
                <Toolbar aria-label="Spacers with fixed width toolbar">
                    <Button variant="transparent" label="Accept" />
                    <Button variant="transparent" label="Reject" />
                    <ToolbarSpacer fixed width="50px" />
                    <Button label="Edit" />
                    <ToolbarSpacer fixed width="150px" />
                    <Button variant="transparent" label="Delete" />
                </Toolbar>
            </Section>
            <Section title="Separators">
                <Toolbar aria-label="Separators toolbar">
                    <ToolbarSpacer />
                    <ToolbarSeparator />
                    <Button variant="transparent" glyph="survey" aria-label="Survey" />
                    <ToolbarSeparator />
                    <Button variant="transparent" glyph="pool" aria-label="Pool" />
                    <Button variant="transparent" glyph="pie-chart" aria-label="Chart" />
                </Toolbar>
            </Section>
        </div>
    )
};

export const Overflow: Story = {
    name: 'Overflow priorities and groups',
    render: () => (
        <div className={`${COL} max-w-xl`}>
            <Toolbar shouldOverflow aria-label="Overflow priorities">
                <ToolbarOverflowButton label="Button First" />
                <ToolbarOverflowButton label="Always" overflowPriority="always" />
                <ToolbarOverflowButton label="Never" overflowPriority="never" />
                <ToolbarOverflowButton label="Low" overflowPriority="low" />
                <ToolbarSpacer />
                <ToolbarOverflowButton label="High" overflowPriority="high" />
                <ToolbarOverflowButton label="Disappear" overflowPriority="disappear" />
                <ToolbarOverflowButton label="Button Last" />
            </Toolbar>
            <Toolbar shouldOverflow aria-label="Overflow groups">
                <ToolbarOverflowButton label="Button" />
                <ToolbarOverflowButton label="Never" overflowPriority="never" />
                <ToolbarOverflowButton label="Gr 1 / Low" overflowPriority="low" overflowGroup={1} />
                <ToolbarOverflowButton label="Gr 2 / Low" overflowPriority="low" overflowGroup={2} />
                <ToolbarOverflowButton label="Gr 2 / Low" overflowPriority="low" overflowGroup={2} />
                <ToolbarOverflowButton label="Gr 1 / High" overflowPriority="high" overflowGroup={1} />
            </Toolbar>
            <Toolbar shouldOverflow aria-label="Overflow with form controls">
                <ToolbarLabel>Search</ToolbarLabel>
                <ToolbarItem>
                    <Input className="w-40" aria-label="Search" placeholder="Search" />
                </ToolbarItem>
                <ToolbarItem>
                    <Checkbox label="Only mine" />
                </ToolbarItem>
                <ToolbarOverflowButton label="Apply" />
                <ToolbarOverflowButton label="Reset" overflowPriority="low" />
                <ToolbarOverflowButton label="Save View" overflowPriority="low" />
            </Toolbar>
        </div>
    )
};

export const OverflowPopover: Story = {
    name: 'Overflow popover',
    parameters: {
        docs: {
            description: {
                story:
                    'The contents of fundamental-styles’ Overflow story: transparent buttons, labels and separators ' +
                    'that always overflow (a separator overflows when it is wrapped in a `ToolbarItem`).'
            }
        }
    },
    render: () => (
        <div className="max-w-xl" style={{ minHeight: '20rem' }}>
            <Toolbar shouldOverflow aria-label="Toolbar">
                <ToolbarLabel>Products (34)</ToolbarLabel>
                <Button variant="transparent" label="Create" />
                <ToolbarSpacer />
                <Button variant="transparent" label="Save" />
                <Button variant="transparent" label="Copy" />
                <ToolbarOverflowButton variant="transparent" label="Edit" overflowPriority="always" />
                <ToolbarItem overflowPriority="always">
                    <ToolbarSeparator />
                </ToolbarItem>
                <ToolbarOverflowButton variant="transparent" label="Delete" overflowPriority="always" />
                <ToolbarItem overflowPriority="always">
                    <ToolbarSeparator />
                </ToolbarItem>
                <ToolbarOverflowButton variant="transparent" label="Assign" overflowPriority="always" />
                <ToolbarOverflowButton variant="transparent" label="Exit" overflowPriority="always" />
                <ToolbarItem overflowPriority="always">
                    <ToolbarSeparator />
                </ToolbarItem>
                <ToolbarLabel overflowPriority="always">Label</ToolbarLabel>
                <ToolbarLabel overflowPriority="always">Form Label</ToolbarLabel>
            </Toolbar>
        </div>
    )
};

export const TitleVariants: Story = {
    name: 'Title variants',
    render: () => (
        <div className={COL}>
            <Toolbar title="Title via the title prop" />
            <Toolbar title="Title with heading level 3" headingLevel={3} />
            <Toolbar aria-labelledby="story-toolbar-projected-title">
                <Title level={4} id="story-toolbar-projected-title">
                    Projected title with an icon
                </Title>
                <Icon glyph="account" />
            </Toolbar>
        </div>
    )
};

const FRUITS = ['Apple', 'Pineapple', 'Tomato', 'Strawberry'];

export const OverflowOverlays: Story = {
    name: 'Overflow with overlays',
    parameters: {
        docs: {
            description: {
                story:
                    'Overlay controls keep working in the overflow popover: a date picker, a select, a split button, ' +
                    'a menu button and a segmented button, plus a fixed spacer.'
            }
        }
    },
    render: () => (
        <Resizable width="24rem">
            <Toolbar shouldOverflow aria-label="Overflow with overlays">
                <ToolbarOverflowButton label="Button 1" />
                <ToolbarOverflowButton label="Button 2" />
                <ToolbarItem>
                    <DatePicker placeholder="mm/dd/yyyy" />
                </ToolbarItem>
                <ToolbarItem>
                    <Select placeholder="Select an option" aria-label="Fruit">
                        {FRUITS.map((fruit) => (
                            <SelectOption key={fruit} value={fruit}>
                                {fruit}
                            </SelectOption>
                        ))}
                    </Select>
                </ToolbarItem>
                <ToolbarItem>
                    <Checkbox label="Option 1" />
                </ToolbarItem>
                <ToolbarItem>
                    <SplitButton aria-label="Split button">
                        <MenuItem>Option 1</MenuItem>
                        <MenuItem>Option 2</MenuItem>
                    </SplitButton>
                </ToolbarItem>
                <ToolbarLabel render={<FormLabel htmlFor="story-toolbar-input" />}>Default input</ToolbarLabel>
                <ToolbarItem>
                    <Input id="story-toolbar-input" className="max-w-[12.5rem]" placeholder="Field placeholder text" />
                </ToolbarItem>
                <ToolbarItem>
                    <Menu>
                        <MenuTrigger render={<Button menu label="Menu button" />} />
                        <MenuPopup aria-label="Menu button">
                            <MenuItem>Option 1</MenuItem>
                            <MenuItem>Option 2</MenuItem>
                        </MenuPopup>
                    </Menu>
                </ToolbarItem>
                <ToolbarItem>
                    <SegmentedButton aria-label="Alignment" defaultValue="left">
                        <SegmentedButtonItem value="left" label="Left" />
                        <SegmentedButtonItem value="middle" label="Middle" />
                        <SegmentedButtonItem value="right" label="Right" />
                    </SegmentedButton>
                </ToolbarItem>
                <ToolbarItem>
                    <ToolbarSpacer fixed width="200px" />
                </ToolbarItem>
                <ToolbarOverflowButton label="Button 3" />
            </Toolbar>
        </Resizable>
    )
};

/**
 * Clicks the "More" button of the first toolbar of the story and waits for its popover. The button is taken once
 * the overflow has settled (controls such as the date picker reach their width a moment after the first render).
 */
async function openOverflow(canvasElement: HTMLElement): Promise<void> {
    const query = () => canvasElement.querySelector<HTMLElement>('[role="toolbar"] button[aria-label="More"]');
    const more = await waitFor(async () => {
        const el = query();
        expect(el).not.toBeNull();
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(query()).toBe(el);
        return el!;
    });
    await userEvent.click(more);
    await waitFor(() => expect(document.querySelector('[role="dialog"] [data-toolbar-overflow]')).not.toBeNull());
}

export const OpenOverflow: Story = {
    name: 'Open: overflow',
    tags: ['!autodocs'],
    render: Overflow.render,
    play: ({ canvasElement }) => openOverflow(canvasElement)
};
export const OpenOverflowPopover: Story = {
    name: 'Open: overflow popover',
    tags: ['!autodocs'],
    render: OverflowPopover.render,
    play: ({ canvasElement }) => openOverflow(canvasElement)
};
export const OpenOverflowOverlays: Story = {
    name: 'Open: overflow with overlays',
    tags: ['!autodocs'],
    render: OverflowOverlays.render,
    play: ({ canvasElement }) => openOverflow(canvasElement)
};
