import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Title } from '@/ui/title/title';
import { LayoutGrid, LayoutGridCol, LayoutGridRow } from './layout-grid';

/** Coloured content, as fundamental-styles' `docs-layout-grid-bg`: centred, at least 4rem tall. */
function Block({ alt = false, children }: { alt?: boolean; children: ReactNode }) {
    return (
        <div
            className={cn(
                'box-border flex min-h-16 w-full items-center justify-center text-center rounded-sap-element-border-corner-radius border',
                alt
                    ? 'border-sap-indication-color-6 bg-sap-indication-color-6-background text-sap-indication-color-6-text-color'
                    : 'border-sap-indication-color-5 bg-sap-indication-color-5-background text-sap-indication-color-5-text-color'
            )}
        >
            {children}
        </div>
    );
}

function Heading({ children }: { children: ReactNode }) {
    return (
        <Title level={3} headerSize={6} wrap className="mt-6 mb-2 first:mt-0">
            {children}
        </Title>
    );
}

const meta = {
    title: 'Components/Layout Grid',
    component: LayoutGrid,
    subcomponents: { LayoutGridRow, LayoutGridCol },
    parameters: {
        docs: {
            description: {
                component:
                    'A responsive 12-column grid. Columns span 1-12 columns, with separate spans and offsets from 600px (md), 1024px (lg) and 1440px (xl) on. Gutters are 0.25rem on small screens and 0.5rem from 600px on. Without explicit rows, the grid puts its columns in one row that wraps.'
            }
        }
    },
    args: { noGap: false, noHorizontalGap: false, noVerticalGap: false }
} satisfies Meta<typeof LayoutGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

export const Basic: Story = {
    render: (args) => (
        <LayoutGrid {...args}>
            {range(12).map((n) => (
                <LayoutGridCol key={`1-${n}`} span={1}>
                    <Block>1</Block>
                </LayoutGridCol>
            ))}
            {range(6).map((n) => (
                <LayoutGridCol key={`2-${n}`} span={2}>
                    <Block alt>2</Block>
                </LayoutGridCol>
            ))}
            {range(4).map((n) => (
                <LayoutGridCol key={`3-${n}`} span={3}>
                    <Block>3</Block>
                </LayoutGridCol>
            ))}
            {range(3).map((n) => (
                <LayoutGridCol key={`4-${n}`} span={4}>
                    <Block alt>4</Block>
                </LayoutGridCol>
            ))}
            <LayoutGridCol span={6}>
                <Block>6</Block>
            </LayoutGridCol>
            <LayoutGridCol span={6}>
                <Block>6</Block>
            </LayoutGridCol>
            <LayoutGridCol span={12}>
                <Block alt>12</Block>
            </LayoutGridCol>
        </LayoutGrid>
    )
};

const label = (n: number) => `${n} ${n === 1 ? 'column' : 'columns'} element`;

export const DifferentSizeColumns: Story = {
    name: 'Different size columns',
    parameters: { docs: { description: { story: 'One explicit row per pair of columns.' } } },
    render: (args) => (
        <LayoutGrid {...args}>
            <LayoutGridRow>
                <LayoutGridCol>
                    <Block>{label(12)}</Block>
                </LayoutGridCol>
            </LayoutGridRow>
            {range(11)
                .reverse()
                .map((n) => (
                    <LayoutGridRow key={n}>
                        <LayoutGridCol span={n}>
                            <Block>{label(n)}</Block>
                        </LayoutGridCol>
                        <LayoutGridCol span={12 - n}>
                            <Block alt>{label(12 - n)}</Block>
                        </LayoutGridCol>
                    </LayoutGridRow>
                ))}
            <LayoutGridRow>
                <LayoutGridCol>
                    <Block alt>{label(12)}</Block>
                </LayoutGridCol>
            </LayoutGridRow>
        </LayoutGrid>
    )
};

export const Responsive: Story = {
    name: 'Responsive spans',
    parameters: {
        docs: {
            description: {
                story: 'Each breakpoint inherits the span of the one below until it sets its own: `span` below 600px, `colMd` from 600px, `colLg` from 1024px and `colXl` from 1440px. Resize the window.'
            }
        }
    },
    render: (args) => (
        <>
            <Heading>12 / md 6 / lg 4 / xl 4</Heading>
            <LayoutGrid {...args}>
                {range(4).map((n) => (
                    <LayoutGridCol key={n} span={12} colMd={6} colLg={4} colXl={4}>
                        <Block alt={n % 2 === 0}>({n} cell)</Block>
                    </LayoutGridCol>
                ))}
            </LayoutGrid>
            <Heading>12 / md 6 / lg 4 / xl 3</Heading>
            <LayoutGrid {...args}>
                {range(4).map((n) => (
                    <LayoutGridCol key={n} span={12} colMd={6} colLg={4} colXl={3}>
                        <Block alt={n % 2 === 0}>Column {n}</Block>
                    </LayoutGridCol>
                ))}
            </LayoutGrid>
            <Heading>6 / md 4 / lg 3 / xl 3</Heading>
            <LayoutGrid {...args}>
                {range(4).map((n) => (
                    <LayoutGridCol key={n} span={6} colMd={4} colLg={3} colXl={3}>
                        <Block alt={n % 2 === 0}>Column element</Block>
                    </LayoutGridCol>
                ))}
            </LayoutGrid>
        </>
    )
};

export const Offsets: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Offsets (0-12 columns) per breakpoint, inherited upwards like spans. `offsetPosition="after"` leaves the offset after the column.'
            }
        }
    },
    render: (args) => (
        <>
            <Heading>Offset before the column</Heading>
            <LayoutGrid {...args}>
                <LayoutGridRow>
                    <LayoutGridCol>
                        <Block>12 columns</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
                <LayoutGridRow>
                    <LayoutGridCol span={6}>
                        <Block alt>6 columns</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
                <LayoutGridRow>
                    <LayoutGridCol span={8} colOffset={4} colMd={6} colOffsetMd={2} colLg={4} colOffsetLg={4}>
                        <Block>Different column-width and offset in different inflection points</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
                <LayoutGridRow>
                    <LayoutGridCol span={6} colOffset={6}>
                        <Block alt>6 columns with 6-column offset</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
                <LayoutGridRow>
                    <LayoutGridCol span={4} colOffset={4}>
                        <Block>4, offset 4</Block>
                    </LayoutGridCol>
                    <LayoutGridCol span={6} colOffset={0} colOffsetMd={3} colOffsetLg={6}>
                        <Block alt>offset 0 / md 3 / lg 6</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
                <LayoutGridRow>
                    <LayoutGridCol span={6} colOffsetMd={1} colOffsetLg={2} colOffsetXl={4}>
                        <Block>6, offset md 1 / lg 2 / xl 4</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
                <LayoutGridRow>
                    <LayoutGridCol span={6} colOffsetMd={2} colOffsetXl={3}>
                        <Block alt>6, offset md 2 / xl 3</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
            </LayoutGrid>
            <Heading>Offset after the column</Heading>
            <LayoutGrid {...args}>
                <LayoutGridCol
                    span={3}
                    offsetPosition="after"
                    colOffset={1}
                    colOffsetMd={2}
                    colOffsetLg={2}
                    colOffsetXl={1}
                >
                    <Block>2 column-width and offset after in different inflection points</Block>
                </LayoutGridCol>
                <LayoutGridCol span={4} offsetPosition="after" colOffset={1}>
                    <Block alt>4 columns with 2-column offset after</Block>
                </LayoutGridCol>
                <LayoutGridCol span={2}>
                    <Block>2 column element</Block>
                </LayoutGridCol>
            </LayoutGrid>
        </>
    )
};

export const Nesting: Story = {
    parameters: {
        docs: {
            description: {
                story: 'A row inside a column nests a grid of 12 columns in the width of that column. A nested `LayoutGrid` works too, with its own padding and gutters (here removed with `px-0` and `noVerticalGap`).'
            }
        }
    },
    render: (args) => (
        <>
            <Heading>Rows in columns</Heading>
            <LayoutGrid {...args}>
                <LayoutGridCol span={2}>
                    <Block>2 col (~17%)</Block>
                </LayoutGridCol>
                <LayoutGridCol span={10}>
                    <LayoutGridRow>
                        <LayoutGridCol span={2}>
                            <Block alt>2 col inner row 1 (~14%)</Block>
                        </LayoutGridCol>
                        <LayoutGridCol span={10}>
                            <LayoutGridRow>
                                <LayoutGridCol span={6}>
                                    <Block>6 coll inner row 2 (~34%)</Block>
                                </LayoutGridCol>
                                <LayoutGridCol span={6}>
                                    <LayoutGridRow>
                                        <LayoutGridCol span={4}>
                                            <Block alt>4 coll inner row 3 (~10%)</Block>
                                        </LayoutGridCol>
                                        <LayoutGridCol span={8}>
                                            <Block>8 coll inner row 3 (~23%)</Block>
                                        </LayoutGridCol>
                                    </LayoutGridRow>
                                </LayoutGridCol>
                            </LayoutGridRow>
                        </LayoutGridCol>
                    </LayoutGridRow>
                </LayoutGridCol>
            </LayoutGrid>
            <Heading>Nested columns next to other columns</Heading>
            <LayoutGrid {...args}>
                <LayoutGridCol span={6}>
                    <LayoutGridRow>
                        <LayoutGridCol span={6}>
                            <Block alt>Nested Column Element</Block>
                        </LayoutGridCol>
                        <LayoutGridCol span={3}>
                            <Block alt>Nested Column Element</Block>
                        </LayoutGridCol>
                        <LayoutGridCol span={3}>
                            <Block alt>Nested Column Element</Block>
                        </LayoutGridCol>
                    </LayoutGridRow>
                </LayoutGridCol>
                {range(3).map((n) => (
                    <LayoutGridCol key={n} span={2}>
                        <Block>Column Element</Block>
                    </LayoutGridCol>
                ))}
            </LayoutGrid>
            <Heading>Nested grid</Heading>
            <LayoutGrid {...args}>
                <LayoutGridCol span={6}>
                    <Block>6</Block>
                </LayoutGridCol>
                <LayoutGridCol span={6}>
                    <LayoutGrid className="px-0" noVerticalGap>
                        <LayoutGridCol span={6}>
                            <Block alt>nested 6</Block>
                        </LayoutGridCol>
                        <LayoutGridCol span={6}>
                            <Block alt>nested 6</Block>
                        </LayoutGridCol>
                    </LayoutGrid>
                </LayoutGridCol>
            </LayoutGrid>
        </>
    )
};

/** Rows as an array, so the grid sees them as explicit rows. */
const gapRows = () => [
    <LayoutGridRow key="8-4">
        <LayoutGridCol span={8}>
            <Block>8 col no gap</Block>
        </LayoutGridCol>
        <LayoutGridCol span={4}>
            <Block alt>4 col no gap</Block>
        </LayoutGridCol>
    </LayoutGridRow>,
    <LayoutGridRow key="6-6">
        <LayoutGridCol span={6}>
            <Block>6 col no gap</Block>
        </LayoutGridCol>
        <LayoutGridCol span={6}>
            <Block alt>6 col no gap</Block>
        </LayoutGridCol>
    </LayoutGridRow>,
    <LayoutGridRow key="4-8">
        <LayoutGridCol span={4}>
            <Block>4 col no gap</Block>
        </LayoutGridCol>
        <LayoutGridCol span={8}>
            <Block alt>8 col no gap</Block>
        </LayoutGridCol>
    </LayoutGridRow>
];

export const NoGap: Story = {
    name: 'Without gaps',
    parameters: {
        docs: {
            description: {
                story: '`noGap` removes all gutters; `noHorizontalGap` and `noVerticalGap` remove only the inline or the block ones.'
            }
        }
    },
    render: () => (
        <>
            <Heading>noGap</Heading>
            <LayoutGrid noGap data-variant="no-gap">
                {gapRows()}
            </LayoutGrid>
            <Heading>noHorizontalGap</Heading>
            <LayoutGrid noHorizontalGap data-variant="no-horizontal-gap">
                {gapRows()}
            </LayoutGrid>
            <Heading>noVerticalGap</Heading>
            <LayoutGrid noVerticalGap data-variant="no-vertical-gap">
                {gapRows()}
            </LayoutGrid>
            <Heading>Wrapping columns without gaps</Heading>
            <LayoutGrid noGap>
                {range(6).map((n) => (
                    <LayoutGridCol key={n} span={4}>
                        <Block alt={n % 2 === 0}>4</Block>
                    </LayoutGridCol>
                ))}
            </LayoutGrid>
        </>
    )
};

export const AutoAdjusting: Story = {
    name: 'Growing columns',
    parameters: {
        docs: {
            description: {
                story: '`colGrow` makes a column take the remaining space of its row; growing columns share it equally.'
            }
        }
    },
    render: (args) => (
        <>
            <Heading>Before and after a fixed column</Heading>
            <LayoutGrid {...args}>
                <LayoutGridCol colGrow>
                    <Block>Auto adjusting col before 7 col</Block>
                </LayoutGridCol>
                <LayoutGridCol span={7}>
                    <Block alt>7 col</Block>
                </LayoutGridCol>
                <LayoutGridCol colGrow>
                    <Block>Auto adjusting col after 7 col</Block>
                </LayoutGridCol>
            </LayoutGrid>
            <Heading>In rows</Heading>
            <LayoutGrid {...args}>
                <LayoutGridRow>
                    <LayoutGridCol span={8}>
                        <Block>{'span={8}'}</Block>
                    </LayoutGridCol>
                    <LayoutGridCol colGrow>
                        <Block alt>colGrow</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
                <LayoutGridRow>
                    <LayoutGridCol span={3}>
                        <Block>{'span={3}'}</Block>
                    </LayoutGridCol>
                    <LayoutGridCol colGrow>
                        <Block alt>colGrow</Block>
                    </LayoutGridCol>
                    <LayoutGridCol span={3}>
                        <Block>{'span={3}'}</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
                <LayoutGridRow>
                    <LayoutGridCol colGrow>
                        <Block alt>colGrow</Block>
                    </LayoutGridCol>
                    <LayoutGridCol span={4}>
                        <Block>{'span={4}'}</Block>
                    </LayoutGridCol>
                </LayoutGridRow>
            </LayoutGrid>
            <Heading>Sharing the remaining cells</Heading>
            <LayoutGrid {...args}>
                <LayoutGridCol span={12} colMd={8} colLg={7} colXl={6}>
                    <Block>We have defined col spans for this Column</Block>
                </LayoutGridCol>
                <LayoutGridCol colGrow>
                    <Block alt>This Column will share available cells</Block>
                </LayoutGridCol>
                <LayoutGridCol colGrow>
                    <Block alt>This Column will share available cells</Block>
                </LayoutGridCol>
            </LayoutGrid>
        </>
    )
};
