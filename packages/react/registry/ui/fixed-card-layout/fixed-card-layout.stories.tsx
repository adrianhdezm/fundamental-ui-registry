import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardMainHeader, CardSubtitle, CardTitle } from '@/ui/card/card';
import {
    FixedCardLayout,
    FixedCardLayoutCard,
    type CardDropped,
    type ColumnsWidthConfig,
    type FixedCardLayoutProps
} from './fixed-card-layout';

const TEXT = 'font-sap-font-family text-sap-font-size text-sap-text-color';

const CARDS = [
    { title: 'Sales orders', lines: 3 },
    { title: 'Open invoices', lines: 6 },
    { title: 'Deliveries', lines: 2 },
    { title: 'Top customers', lines: 5 },
    { title: 'Returns', lines: 1 },
    { title: 'Stock alerts', lines: 4 },
    { title: 'Approvals', lines: 2 },
    { title: 'Messages', lines: 3 }
];

type ExampleProps = Pick<
    FixedCardLayoutProps,
    'maxColumns' | 'cardMinimumWidth' | 'columnsWidthConfig' | 'disableDragDrop' | 'dragStartDelay'
>;

/** Angular's story layout: eight cards, the number of columns and the last move in a live region. */
function Example(props: ExampleProps) {
    const [columns, setColumns] = useState(0);
    const [last, setLast] = useState('');
    const dropped = (event: CardDropped) =>
        setLast(`Moved card ${event.previousIndex + 1} to position ${event.currentIndex + 1}.`);
    return (
        <div className="flex flex-col gap-3">
            <p className={`m-0 ${TEXT}`} aria-live="polite">
                {columns} columns. Drag a card, or focus it and press Alt with an arrow key, to move it. {last}
            </p>
            <FixedCardLayout
                {...props}
                onLayoutChange={(change) => setColumns(change.numberOfColumns)}
                onCardDraggedDropped={dropped}
            >
                {CARDS.map((card, i) => (
                    <FixedCardLayoutCard key={card.title} rank={i + 1}>
                        <Card>
                            <CardHeader>
                                <CardMainHeader>
                                    <CardTitle level={3}>{card.title}</CardTitle>
                                    <CardSubtitle render={<h4 />}>Card {i + 1}</CardSubtitle>
                                </CardMainHeader>
                            </CardHeader>
                            <CardContent>
                                <div className={`p-4 ${TEXT}`}>
                                    {Array.from({ length: card.lines }, (_, line) => (
                                        <p key={line} className="m-0 mb-2">
                                            Line {line + 1} of {card.title.toLowerCase()}
                                        </p>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </FixedCardLayoutCard>
                ))}
            </FixedCardLayout>
        </div>
    );
}

const meta = {
    title: 'Components/Fixed Card Layout',
    component: FixedCardLayout,
    subcomponents: { FixedCardLayoutCard } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'The fixed card layout places cards row by row in as many columns of at least 20rem as fit (at most `maxColumns`). Cards keep their own height. ' +
                    'They can be reordered by dragging (hold, then move), or with Alt and the arrow keys; the arrow keys alone move the focus between cards.\n\n' +
                    '```tsx\n' +
                    '<FixedCardLayout onCardDraggedDropped={save}>\n' +
                    '    <FixedCardLayoutCard key="orders" rank={1}>\n' +
                    '        <Card>...</Card>\n' +
                    '    </FixedCardLayoutCard>\n' +
                    '</FixedCardLayout>\n' +
                    '```'
            }
        }
    },
    args: { maxColumns: 10, cardMinimumWidth: 320, disableDragDrop: false, dragStartDelay: 200 }
} satisfies Meta<typeof FixedCardLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: ({ maxColumns, cardMinimumWidth, disableDragDrop, dragStartDelay }) => (
        <Example
            maxColumns={maxColumns}
            cardMinimumWidth={cardMinimumWidth}
            disableDragDrop={disableDragDrop}
            dragStartDelay={dragStartDelay}
        />
    )
};

export const Default: Story = { name: 'Responsive columns', render: () => <Example /> };

export const MaxColumns: Story = { name: 'At most two columns', render: () => <Example maxColumns={2} /> };

const WIDTHS: ColumnsWidthConfig = { 1: 2, 2: 1, 3: 1 };

export const ColumnWidths: Story = {
    name: 'Custom column widths',
    parameters: {
        docs: { description: { story: '`columnsWidthConfig={{ 1: 2, 2: 1, 3: 1 }}`: the free space goes 2:1:1.' } }
    },
    render: () => <Example maxColumns={3} columnsWidthConfig={WIDTHS} />
};

export const DisabledDragDrop: Story = {
    name: 'Drag and drop disabled',
    render: () => <Example disableDragDrop />
};

export const Mobile: Story = {
    name: 'Mobile display',
    render: () => (
        <div className="w-88 max-w-full">
            <Example />
        </div>
    )
};

export const CardMinimumWidth: Story = {
    name: 'Custom card minimum width',
    render: () => <Example cardMinimumWidth={400} />
};
