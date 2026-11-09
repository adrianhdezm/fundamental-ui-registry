import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Avatar } from '@/ui/avatar/avatar';
import { Button } from '@/ui/button/button';
import { List, ListContent, ListItem, ListSubline, ListTitle } from '@/ui/list/list';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { Toolbar, ToolbarSpacer } from '@/ui/toolbar/toolbar';
import { Panel, PanelContent, PanelTitle, type PanelProps } from './panel';

const LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ut laoreet lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean sagittis aliquam justo et suscipit. Nam molestie, magna at elementum pulvinar, nisi enim venenatis ante, id convallis mi neque nec risus.';

/** fundamental-styles' panel text, for the visual reference stories. */
const FS_LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ut laoreet lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean sagittis aliquam justo et suscipit. Nam molestie, magna at elementum pulvinar, nisi enim venenatis ante, id convallis mi neque nec risus. Cras blandit sagittis augue at facilisis. Mauris egestas nunc nec diam mollis auctor. Vestibulum sed euismod elit, eget accumsan quam. Donec eleifend porttitor viverra. Nunc porttitor dictum erat at molestie. Sed quis velit dolor. Vestibulum et turpis eget enim gravida gravida vitae at massa. Suspendisse facilisis elit ut dolor posuere consectetur. Morbi ac nibh sit amet dolor lobortis tincidunt in ornare erat. Vestibulum tristique euismod enim, ac volutpat odio cursus sit amet.';

/** The text fundamental-styles' fixed height example adds after it (the start of it: enough to scroll). */
const FS_MORE =
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed temporibus dolorum cupiditate recusandae quaerat aperiam facilis provident nemo nostrum porro corporis nesciunt ducimus, ad molestias adipisci soluta iure quam repellat. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi placeat temporibus, eveniet modi nobis inventore debitis explicabo consectetur, sunt fugit suscipit dolore ab et ullam natus, in molestiae deserunt. Aperiam. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Rerum eveniet consequatur quis dolores, voluptatem et! Odit laboriosam, ducimus accusantium autem minus maxime excepturi, voluptatibus delectus sint animi soluta incidunt officia? Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam blanditiis fuga aspernatur dolore numquam culpa quos perspiciatis nobis ipsum soluta nostrum, consequatur ab, asperiores minus eum labore inventore maxime tempore!';

const meta = {
    title: 'Components/Panel',
    component: Panel,
    subcomponents: { PanelTitle, PanelContent },
    parameters: {
        docs: {
            description: {
                component:
                    'Panels group content under a title bar. Expandable panels show and hide their content with the arrow button (Base UI Collapsible); fixed panels always show it. ' +
                    'The `PanelTitle` goes first in the header, other children (actions, a toolbar) after it, and the `PanelContent` below the header.'
            }
        }
    },
    args: { expanded: true, fixed: false, transparent: false, noRadius: false }
} satisfies Meta<typeof Panel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Angular's two-way `[(expanded)]`: the first panel is controlled and its state is shown below. */
function ExpandableExample({ expanded: initial = true, ...args }: PanelProps) {
    const [expanded, setExpanded] = useState(initial);
    return (
        <>
            <Panel
                {...args}
                expanded={expanded}
                onExpandedChange={setExpanded}
                expandAriaLabel="Panel details"
                expandAriaLabelledBy="panel-title-1"
            >
                <PanelTitle id="panel-title-1">Panel Header</PanelTitle>
                <PanelContent aria-label="Panel content">{LOREM}</PanelContent>
            </Panel>
            <Panel expandAriaLabel="Collapsed panel">
                <PanelTitle>Collapsed panel</PanelTitle>
                <PanelContent aria-label="Collapsed panel content">{LOREM}</PanelContent>
            </Panel>
            <p className="m-0 mt-4 text-sap-font-small-size text-sap-content-label-color">
                expanded: {String(expanded)}
            </p>
        </>
    );
}

export const Expandable: Story = {
    parameters: {
        docs: {
            description: {
                story: 'A controlled panel (`expanded` / `onExpandedChange`) and an uncontrolled one, collapsed at first.'
            }
        }
    },
    render: (args) => <ExpandableExample key={String(args.expanded)} {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button', { name: 'Collapsed panel' });
        await expect(button).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(button);
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        await expect(canvas.getByRole('region', { name: 'Collapsed panel content' })).toBeVisible();
        await userEvent.click(button);
    }
};

export const Fixed: Story = {
    name: 'Fixed, header actions, fixed height and transparent',
    render: () => (
        <>
            <Panel fixed>
                <PanelTitle>Fixed panel</PanelTitle>
                <PanelContent aria-label="Fixed content">{LOREM}</PanelContent>
            </Panel>
            <Panel defaultExpanded expandAriaLabel="Panel with actions">
                <PanelTitle>Panel with header actions</PanelTitle>
                <Button variant="transparent" label="Edit" />
                <Button variant="transparent" glyph="delete" aria-label="Delete" />
                <PanelContent aria-label="Content with actions">{LOREM}</PanelContent>
            </Panel>
            <Panel defaultExpanded expandAriaLabel="Fixed height panel">
                <PanelTitle>Fixed height content (scrolls)</PanelTitle>
                {/* focusable so the scrolling region can be scrolled from the keyboard */}
                <PanelContent aria-label="Scrolling content" height="5rem" tabIndex={0}>
                    {LOREM} {LOREM}
                </PanelContent>
            </Panel>
            <Panel defaultExpanded transparent expandAriaLabel="Transparent panel">
                <PanelTitle>Transparent panel</PanelTitle>
                <PanelContent aria-label="Transparent content">{LOREM}</PanelContent>
            </Panel>
        </>
    )
};

function CustomizableExample() {
    const [expanded, setExpanded] = useState(true);
    const [expanded2, setExpanded2] = useState(true);
    return (
        <>
            <Panel
                transparent
                noRadius
                expanded={expanded}
                onExpandedChange={setExpanded}
                expandAriaLabel="Accounts"
                expandAriaLabelledBy="panel-custom-title-1"
            >
                <PanelTitle level={5} id="panel-custom-title-1">
                    Accounts
                </PanelTitle>
                <Button variant="transparent" glyph="add-employee" aria-label="Add account" title="Add account" />
                <PanelContent noPadding aria-label="Accounts">
                    <List subline aria-label="Accounts">
                        <ListItem interactive>
                            <Avatar size="s" label="Jane Doe" />
                            <ListContent>
                                <ListTitle>Jane Doe</ListTitle>
                                <ListSubline>Software Developer</ListSubline>
                                <ListSubline>Walldorf</ListSubline>
                            </ListContent>
                        </ListItem>
                        <ListItem interactive>
                            <Avatar size="s" glyph="group" aria-label="Team" />
                            <ListContent>
                                <ListTitle>Design team</ListTitle>
                                <ListSubline>12 members</ListSubline>
                            </ListContent>
                        </ListItem>
                        <ListItem interactive active>
                            <Avatar size="s" label="John Doe" image="assets/person.svg" />
                            <ListContent>
                                <ListTitle>John Doe</ListTitle>
                                <ListSubline>Product Owner</ListSubline>
                                <ListSubline>Berlin</ListSubline>
                            </ListContent>
                        </ListItem>
                    </List>
                </PanelContent>
            </Panel>
            <Panel
                noRadius
                expanded={expanded2}
                onExpandedChange={setExpanded2}
                expandAriaLabel="Notes"
                expandAriaLabelledBy="panel-custom-title-2"
                className="mt-8"
            >
                <PanelTitle level={5} id="panel-custom-title-2">
                    Notes
                </PanelTitle>
                <Button variant="transparent" glyph="add-employee" aria-label="Add account" title="Add account" />
                <PanelContent transparent aria-label="Notes">
                    {LOREM}
                </PanelContent>
            </Panel>
        </>
    );
}

export const Customizable: Story = {
    name: 'Customizable (transparent, no radius, no padding)',
    render: () => <CustomizableExample />
};

/** fundamental-styles' toolbar in a panel header: a segmented button at the end. */
function HeaderToolbar() {
    return (
        <Toolbar variant="transparent" clearBorder aria-label="Panel actions">
            <ToolbarSpacer />
            <SegmentedButton aria-label="Group label" defaultValue="left">
                <SegmentedButtonItem value="left" label="Left" />
                <SegmentedButtonItem value="middle" label="Middle" />
                <SegmentedButtonItem value="right" label="Right" />
            </SegmentedButton>
        </Toolbar>
    );
}

export const Variants: Story = {
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' Panel examples with their texts (the visual reference): transparent, fixed with a toolbar, collapsed with a toolbar, expanded, and fixed height."
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            {/* the headers compared by pixels stay in the first screen: a header captured at the bottom edge of the
                viewport after scrolling loses its bottom border in the screenshot */}
            <div data-example="transparent">
                <Panel defaultExpanded transparent expandAriaLabel="expand/collapse panel">
                    <PanelTitle>Panel header expanded</PanelTitle>
                    <PanelContent aria-label="Transparent content">{FS_LOREM}</PanelContent>
                </Panel>
                <Panel fixed transparent>
                    <PanelTitle id="variants-transparent-fixed-title">Panel header</PanelTitle>
                    <HeaderToolbar />
                    <PanelContent noPadding aria-labelledby="variants-transparent-fixed-title">
                        {FS_LOREM}
                    </PanelContent>
                </Panel>
            </div>
            <div data-example="fixed">
                <Panel fixed>
                    <PanelTitle id="variants-fixed-title">
                        Panel header with a long title that reflows at narrow viewports (320px)
                    </PanelTitle>
                    <HeaderToolbar />
                    <PanelContent aria-labelledby="variants-fixed-title">{FS_LOREM}</PanelContent>
                </Panel>
            </div>
            <div data-example="expandable">
                <Panel expandAriaLabel="expand/collapse panel">
                    <PanelTitle id="variants-collapsed-title">Panel header collapsed</PanelTitle>
                    <HeaderToolbar />
                    <PanelContent aria-labelledby="variants-collapsed-title">{FS_LOREM}</PanelContent>
                </Panel>
                <Panel defaultExpanded expandAriaLabel="expand/collapse panel">
                    <PanelTitle id="variants-expanded-title">Panel header expanded</PanelTitle>
                    <PanelContent aria-labelledby="variants-expanded-title">{FS_LOREM}</PanelContent>
                </Panel>
            </div>
            <div data-example="fixed-height">
                <Panel defaultExpanded expandAriaLabel="expand/collapse panel">
                    {/* the same title as the expanded example: the regions are named apart (axe landmark-unique) */}
                    <PanelTitle>Panel header expanded</PanelTitle>
                    <PanelContent aria-label="Fixed height content" height="150px" tabIndex={0}>
                        {FS_LOREM} {FS_MORE}
                    </PanelContent>
                </Panel>
            </div>
        </div>
    )
};
