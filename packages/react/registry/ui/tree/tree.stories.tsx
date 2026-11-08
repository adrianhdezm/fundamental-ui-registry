import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType, type ReactNode } from 'react';
import { Avatar } from '@/ui/avatar/avatar';
import { Button } from '@/ui/button/button';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { Title } from '@/ui/title/title';
import {
    Tree,
    TreeItem,
    TreeItemButton,
    TreeItemIcon,
    TreeItemText,
    type TreeDataSource,
    type TreeItemData,
    type TreeItemState,
    type TreeProps,
    type TreeSelectionPlacement
} from './tree';

interface Product {
    title: string;
    icon: string;
    value?: number;
    editable?: boolean;
}

/** A small product hierarchy with states and values. */
const products = (): Partial<TreeItemData<Product>>[] => {
    let value = 0;
    const leaf = (title: string, icon: string, state?: TreeItemState): Partial<TreeItemData<Product>> => ({
        data: { title, icon, value: ++value, editable: true },
        state,
        navigatable: true
    });
    return [
        {
            expanded: true,
            navigatable: true,
            data: { title: 'Computer systems', icon: 'laptop', value: ++value },
            children: [
                {
                    expanded: true,
                    data: { title: 'Laptops', icon: 'laptop', value: ++value },
                    children: [
                        leaf('Notebook Basic 15', 'laptop', 'success'),
                        leaf('Notebook Professional 17', 'laptop')
                    ]
                },
                {
                    data: { title: 'Desktops', icon: 'sys-monitor', value: ++value },
                    children: [
                        leaf('Office Desktop', 'sys-monitor', 'warning'),
                        leaf('Gaming Desktop', 'sys-monitor', 'error')
                    ]
                }
            ]
        },
        {
            navigatable: true,
            data: { title: 'Accessories', icon: 'add-equipment', value: ++value },
            children: [leaf('Mouse', 'add-equipment', 'default'), leaf('Keyboard', 'keyboard-and-mouse')]
        },
        { navigatable: true, data: { title: 'Software', icon: 'source-code', value: ++value } }
    ];
};

const LONG_TEXT =
    'Level 1 with very long text that does not wrap ... perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.';
const LONG_WRAPPING_TEXT =
    'Level 1 with very long text and wrapping behaviour ... perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.';

const HEADING = 'mt-6 mb-2 first:mt-0';
const TEXT = 'font-sap-font-family text-sap-font-size text-sap-text-color';

function Heading({ children }: { children: ReactNode }) {
    return (
        <Title level={3} headerSize={5} className={HEADING}>
            {children}
        </Title>
    );
}

/** A data item as a tree item, with its icon and title. */
function productItem(item: TreeItemData<Product>, props: Partial<Parameters<typeof TreeItem>[0]> = {}) {
    return (
        <TreeItem id={item.id} childNodes={item.children} defaultExpanded={!!item.expanded} {...props}>
            <TreeItemIcon glyph={item.data.icon} />
            <TreeItemText>{item.data.title}</TreeItemText>
        </TreeItem>
    );
}

type PlaygroundArgs = Omit<TreeProps, 'children'>;

const meta = {
    title: 'Components/Tree',
    component: Tree,
    subcomponents: { TreeItem, TreeItemIcon, TreeItemText, TreeItemButton } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'A tree shows a hierarchy of items that expand and collapse. Nest `TreeItem`s, or pass a `dataSource` (an array, a promise or a `TreeDataSource`) and a `renderItem`; children of data items load when they expand. ' +
                    'Items can be navigatable, highlighted and selected (single or multiple, with `value`/`defaultValue`/`onValueChange`). The tree is one tab stop: Up and Down move between the items, Home and End to the first and last, Right and Left expand and collapse them and move between parents and children, Enter and Space select.'
            }
        }
    },
    argTypes: {
        selection: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
        selectionPlacement: { control: 'inline-radio', options: ['none', 'left', 'afterExpand', 'right'] }
    },
    args: {
        noBorder: false,
        selection: 'none',
        selectionPlacement: 'left',
        independentSections: false,
        navigationIndicator: false,
        noDataText: 'No data',
        loadingLabel: 'Loading'
    }
} satisfies Meta<PlaygroundArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** fundamental-react's `dev` story: every option as a control. */
export const Playground: Story = {
    render: (args) => (
        <Tree aria-label="Playground" className="max-w-lg" {...args}>
            <TreeItem defaultExpanded navigatable>
                <TreeItemIcon glyph="laptop" />
                <TreeItemText>Level 1</TreeItemText>
                <TreeItem defaultExpanded navigatable>
                    <TreeItemText>Level 2</TreeItemText>
                    <TreeItem navigatable state="success">
                        <TreeItemText>Level 3</TreeItemText>
                    </TreeItem>
                </TreeItem>
                <TreeItem navigatable>
                    <TreeItemText>Level 2</TreeItemText>
                    <TreeItemButton variant="transparent" glyph="edit" aria-label="Edit" />
                </TreeItem>
            </TreeItem>
            <TreeItem navigatable>
                <TreeItemIcon glyph="phone" />
                <TreeItemText>Level 1</TreeItemText>
            </TreeItem>
        </Tree>
    )
};

export const Basic: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Nested items with icons and a wrapping text; items from data without borders; the no data row of an empty data tree.'
            }
        }
    },
    render: () => (
        <>
            <Heading>Nested items</Heading>
            <Tree aria-label="Nested items" className="max-w-lg">
                <TreeItem>
                    <TreeItemIcon glyph="account" />
                    <TreeItemText>Item 1 (Level 1)</TreeItemText>
                </TreeItem>
                <TreeItem wrapContent defaultExpanded>
                    <TreeItemIcon glyph="e-care" />
                    <TreeItemText>Item 2 with a long description that wraps to the next line (Level 1)</TreeItemText>
                    <TreeItem defaultExpanded>
                        <TreeItemText>Item 1 (Level 2)</TreeItemText>
                        <TreeItem>
                            <TreeItemText>Item 1 (Level 3)</TreeItemText>
                            <TreeItem>
                                <TreeItemText>Item 1 (Level 4)</TreeItemText>
                            </TreeItem>
                        </TreeItem>
                    </TreeItem>
                    <TreeItem>
                        <TreeItemText>Item 2 (Level 2)</TreeItemText>
                    </TreeItem>
                </TreeItem>
                <TreeItem>
                    <TreeItemIcon glyph="phone" />
                    <TreeItemText>Item 3 (Level 1)</TreeItemText>
                </TreeItem>
            </Tree>

            <Heading>Items from data, without borders</Heading>
            <Tree
                aria-label="Products"
                dataSource={PRODUCTS}
                renderItem={(item) => productItem(item)}
                noBorder
                className="max-w-lg"
            />

            <Heading>No data</Heading>
            <Tree aria-label="Empty" dataSource={[]} renderItem={() => null} className="max-w-lg" />
        </>
    )
};
const PRODUCTS = products();

export const Customization: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Rows take a `style` (a background colour, padding), a `className`, and any content in the text, such as avatars and buttons.'
            }
        }
    },
    render: () => (
        <Tree aria-label="Customized items" className="max-w-lg">
            <TreeItem>
                <TreeItemIcon glyph="account" />
                <TreeItemText>Item 1 (Level 1)</TreeItemText>
            </TreeItem>
            <TreeItem wrapContent>
                <TreeItemIcon glyph="e-care" />
                <TreeItemText>Item 2 with a long description that wraps to the next line (Level 1)</TreeItemText>
                <TreeItem>
                    <TreeItemText>Item 1 (Level 2)</TreeItemText>
                    <TreeItem>
                        <TreeItemText>Item 1 (Level 3)</TreeItemText>
                        <TreeItem>
                            <TreeItemText>Item 1 (Level 4)</TreeItemText>
                            <TreeItem>
                                <TreeItemText>Item 1 (Level 5)</TreeItemText>
                            </TreeItem>
                        </TreeItem>
                    </TreeItem>
                </TreeItem>
                <TreeItem>
                    <TreeItemText>Item 2 (Level 2)</TreeItemText>
                </TreeItem>
            </TreeItem>
            {/* a background colour: any CSS colour, here a theme token */}
            <TreeItem style={{ backgroundColor: 'var(--sapList_HoverBackground)' }} wrapContent>
                <TreeItemText render={<div />} className="flex items-center gap-4 py-4">
                    <Avatar size="s" circle glyph="product" colorAccent={1} />
                    <span>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias eum iste perspiciatis
                        reprehenderit! Tempora provident excepturi officiis iste! Iusto architecto libero adipisci cum
                        quaerat sed velit, voluptatibus a et recusandae.
                    </span>
                </TreeItemText>
            </TreeItem>
            {/* a style object for the row */}
            <TreeItem style={{ background: 'var(--sapInformationBackgroundColor)', paddingBlock: '1rem' }}>
                <TreeItemText render={<div />} className="flex items-center gap-4">
                    <Avatar size="s" glyph="product" colorAccent={9} />
                    <span className="flex-1">Product name catalog</span>
                    <Button variant="transparent" glyph="overflow" aria-label="More" title="More" />
                </TreeItemText>
            </TreeItem>
            {/* classes added to the row */}
            <TreeItem className="bg-sap-list-group-header-background">
                <TreeItemIcon glyph="phone" />
                <TreeItemText>Item 5 (Level 1), with a custom class</TreeItemText>
            </TreeItem>
        </Tree>
    )
};

function StatesExample() {
    const [clicked, setClicked] = useState('');
    return (
        <>
            <Heading>Navigatable items, highlights and action buttons</Heading>
            <Tree
                aria-label="Navigation"
                dataSource={STATES_PRODUCTS}
                navigationIndicator
                className="max-w-xl"
                renderItem={(item) => (
                    <TreeItem
                        id={item.id}
                        childNodes={item.children}
                        defaultExpanded={!!item.expanded}
                        navigatable={!!item.navigatable}
                        state={item.state}
                        onTreeItemClick={() => setClicked(item.data.title)}
                    >
                        <TreeItemIcon glyph={item.data.icon} />
                        <TreeItemText>{item.data.title}</TreeItemText>
                        {item.data.editable && (
                            <>
                                <TreeItemButton
                                    variant="transparent"
                                    glyph="edit"
                                    aria-label={`Edit ${item.data.title}`}
                                />
                                <TreeItemButton
                                    variant="transparent"
                                    glyph="decline"
                                    aria-label={`Remove ${item.data.title}`}
                                />
                            </>
                        )}
                    </TreeItem>
                )}
            />
            <p className={TEXT}>Clicked: {clicked || '-'}</p>
        </>
    );
}
const STATES_PRODUCTS = products();

export const States: Story = {
    name: 'Navigation, highlights and buttons',
    parameters: {
        docs: {
            description: {
                story: 'Navigatable items have hover and press states and, with `navigationIndicator`, an arrow at the end; `state` shows a highlight indicator; `TreeItemButton`s go after the text and are reached with Tab from their item.'
            }
        }
    },
    render: () => <StatesExample />
};

const PLACEMENTS: [TreeSelectionPlacement, string][] = [
    ['none', 'None'],
    ['left', 'Left'],
    ['afterExpand', 'After expander'],
    ['right', 'Right']
];
const SELECTION_PRODUCTS = products();

function SelectionExample() {
    const [placement, setPlacement] = useState<TreeSelectionPlacement>('left');
    const [independent, setIndependent] = useState(false);
    const [single, setSingle] = useState<unknown>(3);
    const [multiple, setMultiple] = useState<unknown>([3, 4]);
    const render = (prefix: string) => (item: TreeItemData<Product>) =>
        productItem(item, { id: `${prefix}-${item.id}`, value: item.data.value });
    return (
        <>
            <div className="mb-4 flex flex-wrap items-center gap-4">
                <SegmentedButton
                    aria-label="Selection placement"
                    value={placement}
                    onValueChange={(v) => setPlacement(v as TreeSelectionPlacement)}
                >
                    {PLACEMENTS.map(([value, label]) => (
                        <SegmentedButtonItem key={value} value={value} label={label} />
                    ))}
                </SegmentedButton>
                <Checkbox label="Independent sections" checked={independent} onCheckedChange={setIndependent} />
            </div>

            <Heading>Single selection</Heading>
            <Tree
                aria-label="Single selection"
                selection="single"
                selectionPlacement={placement}
                independentSections={independent}
                dataSource={SELECTION_PRODUCTS}
                renderItem={render('single')}
                value={single}
                onValueChange={setSingle}
                className="max-w-xl"
            />
            <p className={TEXT}>Value: {JSON.stringify(single)}</p>

            <Heading>Multiple selection</Heading>
            <Tree
                aria-label="Multiple selection"
                selection="multiple"
                selectionPlacement={placement === 'none' ? 'left' : placement}
                independentSections={independent}
                dataSource={SELECTION_PRODUCTS}
                renderItem={render('multiple')}
                value={multiple}
                onValueChange={setMultiple}
                className="max-w-xl"
            />
            <p className={TEXT}>Value: {JSON.stringify(multiple)}</p>
        </>
    );
}

export const Selection: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Single selection with radio buttons and multiple selection with checkboxes, placed left, after the expander or right; `independentSections` puts left controls in one column. The row selects (click, Enter or Space); the controls only show the state.'
            }
        }
    },
    render: () => <SelectionExample />
};

/** Children fetched on expansion, as from a server. */
class LazyChildren implements TreeDataSource<Partial<TreeItemData<Product>>> {
    private readonly level: number;

    constructor(level: number) {
        this.level = level;
    }

    fetch(): Promise<Partial<TreeItemData<Product>>[]> {
        return new Promise((resolve) =>
            setTimeout(
                () =>
                    resolve(
                        Array.from({ length: 5 }, (_, i) => ({
                            data: { title: `Item ${i + 1} (Level ${this.level})`, icon: 'folder-blank' },
                            children: this.level < 4 ? new LazyChildren(this.level + 1) : []
                        }))
                    ),
                1500
            )
        );
    }

    getTotalItems(): number {
        return 5;
    }
}
const LAZY = new LazyChildren(1);

export const LazyLoading: Story = {
    name: 'Lazy loading',
    parameters: {
        docs: {
            description: {
                story: 'A `TreeDataSource` fetches the items, and the children of an item when it expands; loading rows show meanwhile.'
            }
        }
    },
    render: () => (
        <>
            <Heading>Children load when an item expands</Heading>
            <Tree
                aria-label="Lazy tree"
                dataSource={LAZY}
                renderItem={(item) => productItem(item)}
                className="max-w-lg"
            />
        </>
    )
};

/** fundamental-react's levels, with Level 1 expanded and fundamental-styles' long texts. */
function LevelsTree({ label }: { label: string }) {
    return (
        <Tree aria-label={label}>
            <TreeItem defaultExpanded>
                <TreeItemText>Level 1</TreeItemText>
                <TreeItem>
                    <TreeItemText>Level 2</TreeItemText>
                    <TreeItem>
                        <TreeItemText>Level 3</TreeItemText>
                    </TreeItem>
                </TreeItem>
                <TreeItem>
                    <TreeItemText>Level 2</TreeItemText>
                </TreeItem>
                <TreeItem>
                    <TreeItemText>Level 2</TreeItemText>
                </TreeItem>
            </TreeItem>
            <TreeItem>
                <TreeItemText>Level 1</TreeItemText>
            </TreeItem>
            <TreeItem>
                <TreeItemText>{LONG_TEXT}</TreeItemText>
            </TreeItem>
            <TreeItem wrapContent>
                <TreeItemText>{LONG_WRAPPING_TEXT}</TreeItemText>
            </TreeItem>
        </Tree>
    );
}

export const WrappingAndNonWrappingContents: Story = {
    name: 'Wrapping and non-wrapping contents',
    parameters: {
        docs: {
            description: {
                story: 'Texts truncate by default; `wrapContent` on an item lets its text wrap. The texts are those of fundamental-styles’ Primary story.'
            }
        }
    },
    render: () => <LevelsTree label="Root Tree" />
};

export const Compact: Story = {
    parameters: {
        docs: {
            description: {
                story: 'fundamental-react’s `compact` prop is the compact density: `data-density="compact"` on a container (or the density toolbar).'
            }
        }
    },
    render: () => (
        <div data-density="compact">
            <LevelsTree label="Compact tree" />
        </div>
    )
};

const actions = (
    <>
        <TreeItemButton variant="transparent" glyph="edit" aria-label="Edit" />
        <TreeItemButton variant="transparent" glyph="decline" aria-label="Decline" />
    </>
);

export const NodeActionsAndNoBorder: Story = {
    name: 'Icons, node actions and no borders on level 1',
    parameters: {
        docs: {
            description: {
                story: 'Icons go before (or after) the text with `TreeItemIcon` (fundamental-react’s `glyphsBefore`/`glyphsAfter`); action buttons with `TreeItemButton` (its `actions`); `noBorder` removes the borders of the first level.'
            }
        }
    },
    render: () => (
        <Tree aria-label="Tree with actions and no border" noBorder>
            <TreeItem defaultExpanded>
                <TreeItemIcon glyph="e-care" />
                <TreeItemIcon glyph="activate" />
                <TreeItemText>Level 1</TreeItemText>
                {actions}
                <TreeItem defaultExpanded>
                    <TreeItemIcon glyph="account" />
                    <TreeItemText>Level 2</TreeItemText>
                    {actions}
                    <TreeItem>
                        <TreeItemIcon glyph="product" />
                        <TreeItemText>Level 3</TreeItemText>
                        {actions}
                        <TreeItem>
                            <TreeItemIcon glyph="wrench" />
                            <TreeItemText>Level 4</TreeItemText>
                            {actions}
                        </TreeItem>
                    </TreeItem>
                    <TreeItem>
                        <TreeItemIcon glyph="history" />
                        <TreeItemText>Level 3</TreeItemText>
                        {actions}
                    </TreeItem>
                </TreeItem>
                <TreeItem>
                    <TreeItemIcon glyph="competitor" />
                    <TreeItemText>Level 2</TreeItemText>
                    {actions}
                </TreeItem>
            </TreeItem>
            <TreeItem>
                <TreeItemIcon glyph="batch-payments" />
                <TreeItemText>Level 1</TreeItemText>
                <TreeItemIcon glyph="bell" />
                {actions}
            </TreeItem>
            <TreeItem>
                <TreeItemIcon glyph="favorite" />
                <TreeItemText>Level 1</TreeItemText>
                {actions}
            </TreeItem>
        </Tree>
    )
};

export const HighlightIndicators: Story = {
    name: 'Highlight indicators',
    parameters: {
        docs: {
            description: {
                story: '`state` (`default`, `error`, `success`, `warning`) shows a highlight indicator at the start of the item; fundamental-react’s `highlight`. As fundamental-styles’ Highlight indicators story.'
            }
        }
    },
    render: () => (
        <Tree aria-label="Root Tree">
            <TreeItem state="default" defaultExpanded>
                <TreeItemText>Level 1</TreeItemText>
                <TreeItem state="warning" defaultExpanded>
                    <TreeItemText>Level 2</TreeItemText>
                    <TreeItem state="error" defaultExpanded>
                        <TreeItemText>Level 3</TreeItemText>
                        <TreeItem state="success">
                            <TreeItemText>Level 4</TreeItemText>
                            <TreeItem>
                                <TreeItemText>Level 5</TreeItemText>
                            </TreeItem>
                        </TreeItem>
                        <TreeItem>
                            <TreeItemText>Level 4</TreeItemText>
                        </TreeItem>
                    </TreeItem>
                    <TreeItem>
                        <TreeItemText>Level 3</TreeItemText>
                    </TreeItem>
                </TreeItem>
                <TreeItem>
                    <TreeItemText>Level 2</TreeItemText>
                </TreeItem>
            </TreeItem>
            <TreeItem>
                <TreeItemText>Level 1</TreeItemText>
            </TreeItem>
            <TreeItem>
                <TreeItemText>Level 1</TreeItemText>
            </TreeItem>
        </Tree>
    )
};

/** fundamental-react's navigation tree: every other level navigates (all of them with `all`). */
function NavigationTree({ all = false, label }: { all?: boolean; label: string }) {
    const [clicked, setClicked] = useState('');
    const nav = (text: string, on: boolean) => ({
        navigatable: all || on,
        onTreeItemClick: all || on ? () => setClicked(text) : undefined
    });
    return (
        <>
            <Tree aria-label={label} navigationIndicator={!all}>
                <TreeItem defaultExpanded {...nav('Level 1', true)}>
                    <TreeItemText>Level 1</TreeItemText>
                    <TreeItem defaultExpanded {...nav('Level 2', false)}>
                        <TreeItemText>Level 2</TreeItemText>
                        <TreeItem {...nav('Level 3', true)}>
                            <TreeItemText>Level 3</TreeItemText>
                            <TreeItem {...nav('Level 4', false)}>
                                <TreeItemText>Level 4</TreeItemText>
                                <TreeItem {...nav('Level 5', true)}>
                                    <TreeItemText>Level 5</TreeItemText>
                                    <TreeItem {...nav('Level 6', false)}>
                                        <TreeItemText>Level 6</TreeItemText>
                                        <TreeItem {...nav('Level 7', true)}>
                                            <TreeItemText>Level 7</TreeItemText>
                                            <TreeItem {...nav('Level 8', false)}>
                                                <TreeItemText>Level 8</TreeItemText>
                                            </TreeItem>
                                            <TreeItem {...nav('Level 8', true)}>
                                                <TreeItemText>Level 8</TreeItemText>
                                            </TreeItem>
                                        </TreeItem>
                                        <TreeItem {...nav('Level 7', false)}>
                                            <TreeItemText>Level 7</TreeItemText>
                                        </TreeItem>
                                    </TreeItem>
                                    <TreeItem {...nav('Level 6', true)}>
                                        <TreeItemText>Level 6</TreeItemText>
                                    </TreeItem>
                                </TreeItem>
                                <TreeItem {...nav('Level 5', true)}>
                                    <TreeItemText>Level 5</TreeItemText>
                                </TreeItem>
                            </TreeItem>
                            <TreeItem {...nav('Level 4', false)}>
                                <TreeItemText>Level 4</TreeItemText>
                            </TreeItem>
                        </TreeItem>
                        <TreeItem {...nav('Level 3', false)}>
                            <TreeItemText>Level 3</TreeItemText>
                        </TreeItem>
                    </TreeItem>
                    <TreeItem {...nav('Level 2', false)}>
                        <TreeItemText>Level 2</TreeItemText>
                    </TreeItem>
                </TreeItem>
                <TreeItem navigated {...nav('Level 1 (navigated)', true)}>
                    <TreeItemText>Level 1</TreeItemText>
                </TreeItem>
                <TreeItem {...nav('Level 1', true)}>
                    <TreeItemText>Level 1</TreeItemText>
                </TreeItem>
            </Tree>
            <p className={TEXT}>Clicked: {clicked || '-'}</p>
        </>
    );
}

export const NavigationLinks: Story = {
    name: 'Navigation links',
    parameters: {
        docs: {
            description: {
                story: 'Items that navigate (fundamental-react’s `link`) are `navigatable`, with `onTreeItemClick` doing the navigation; `navigationIndicator` shows their arrow, and `navigated` marks the item navigated to (fundamental-react’s `isNavigated`).'
            }
        }
    },
    render: () => <NavigationTree label="Navigation links" />
};

export const ActiveTree: Story = {
    name: 'Active tree',
    parameters: {
        docs: {
            description: {
                story: 'Every item navigatable (fundamental-react’s `active` tree): hover and press states on all items, without the navigation indicator.'
            }
        }
    },
    render: () => <NavigationTree all label="Active tree" />
};

/** fundamental-react's selection trees, with the first item selected (as in fundamental-styles' Selection story). */
function SelectionTree({ multiple, placement }: { multiple: boolean; placement: 'left' | 'right' }) {
    const [value, setValue] = useState<unknown>(multiple ? ['a-1'] : 'a-1');
    const levels = (prefix: string, first: string, second: string) => (
        <TreeItem value={`${prefix}-1`}>
            <TreeItemText>{first}</TreeItemText>
            <TreeItem value={`${prefix}-2`}>
                <TreeItemText>{second}</TreeItemText>
                <TreeItem value={`${prefix}-3`}>
                    <TreeItemText>Level 3</TreeItemText>
                    <TreeItem value={`${prefix}-4`}>
                        <TreeItemText>Level 4</TreeItemText>
                        <TreeItem value={`${prefix}-5`}>
                            <TreeItemText>Level 5</TreeItemText>
                        </TreeItem>
                    </TreeItem>
                </TreeItem>
            </TreeItem>
        </TreeItem>
    );
    return (
        <>
            <Tree
                aria-label={`${multiple ? 'Multiple' : 'Single'} selection, ${placement}`}
                selection={multiple ? 'multiple' : 'single'}
                selectionPlacement={placement}
                value={value}
                onValueChange={setValue}
            >
                {levels('a', 'Level 1 - onValueChange', 'Level 2 - onValueChange')}
                {levels('b', 'Level 1', 'Level 2')}
            </Tree>
            <p className={TEXT}>Value: {JSON.stringify(value)}</p>
        </>
    );
}

export const MultiSelectionLeft: Story = {
    name: 'Multi selection left',
    parameters: {
        docs: {
            description: {
                story: '`selection="multiple"` selects several items, with checkboxes; `onValueChange` gets the array of selected values (fundamental-react’s `onSelectionChange` per node).'
            }
        }
    },
    render: () => <SelectionTree multiple placement="left" />
};

export const MultiSelectionRight: Story = {
    name: 'Multi selection right',
    parameters: {
        docs: { description: { story: '`selectionPlacement` sets where the selection controls go.' } }
    },
    render: () => <SelectionTree multiple placement="right" />
};

export const SingleSelectionLeft: Story = {
    name: 'Single selection left',
    parameters: {
        docs: {
            description: {
                story: '`selection="single"` selects one item, with radio buttons; `onValueChange` gets its value, or null when it is clicked again.'
            }
        }
    },
    render: () => <SelectionTree multiple={false} placement="left" />
};

export const SingleSelectionRight: Story = {
    name: 'Single selection right',
    render: () => <SelectionTree multiple={false} placement="right" />
};

export const EmptyTree: Story = {
    name: 'Empty tree',
    parameters: {
        docs: {
            description: {
                story: 'A tree without items shows `noDataText` (fundamental-react’s `emptyText`).'
            }
        }
    },
    render: () => <Tree aria-label="Root Tree" noDataText="No data" />
};
