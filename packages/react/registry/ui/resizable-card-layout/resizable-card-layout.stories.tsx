import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType } from 'react';
import { expect, waitFor } from 'storybook/test';
import { Card, CardContent, CardCounter, CardHeader, CardMainHeader, CardSubtitle, CardTitle } from '@/ui/card/card';
import { List, ListItem, ListTitle } from '@/ui/list/list';
import {
    ResizableCardItem,
    ResizableCardLayout,
    type ResizableCardItemConfig,
    type ResizedEvent
} from './resizable-card-layout';

const TEXT = 'font-sap-font-family text-sap-font-size text-sap-text-color';

const CARDS: ResizableCardItemConfig[] = [
    {
        title: 'Sales orders',
        rank: 1,
        cardWidthColSpan: 1,
        cardHeightRowSpan: 25,
        cardMiniHeaderRowSpan: 5,
        cardMiniContentRowSpan: 12
    },
    {
        title: 'Open invoices',
        rank: 2,
        cardWidthColSpan: 1,
        cardHeightRowSpan: 18,
        cardMiniHeaderRowSpan: 5,
        cardMiniContentRowSpan: 8
    },
    {
        title: 'Deliveries',
        rank: 3,
        cardWidthColSpan: 2,
        cardHeightRowSpan: 20,
        cardMiniHeaderRowSpan: 5,
        cardMiniContentRowSpan: 8
    },
    {
        title: 'Top customers',
        rank: 4,
        cardWidthColSpan: 2,
        cardHeightRowSpan: 13,
        cardMiniHeaderRowSpan: 5,
        cardMiniContentRowSpan: 8
    },
    {
        title: 'Returns',
        rank: 5,
        cardWidthColSpan: 1,
        cardHeightRowSpan: 13,
        cardMiniHeaderRowSpan: 5,
        cardMiniContentRowSpan: 8
    },
    {
        title: 'Messages',
        rank: 6,
        cardWidthColSpan: 1,
        cardHeightRowSpan: 16,
        cardMiniHeaderRowSpan: 5,
        cardMiniContentRowSpan: 8,
        resizable: false
    }
];

const LINES = Array.from({ length: 12 }, (_, i) => i + 1);

/** Rows of the list that fit a card of the given height: none at the mini header, then one per 3 rows. */
function visibleLines(card: ResizableCardItemConfig, rowSpan: number): number {
    const header = card.cardMiniHeaderRowSpan ?? 0;
    if (rowSpan <= header) return 0;
    return Math.min(LINES.length, Math.max(1, Math.floor((rowSpan - header) / 3)));
}

type Mode = 'config' | 'layout' | 'inputs';

/** Angular's story layout: six cards configured per item (`config`), on the layout, or with the item props. */
function Example({ mode = 'config' }: { mode?: Mode }) {
    const [status, setStatus] = useState('');
    /** Height in rows of each card (inputs mode), updated on stepChange. */
    const [rowSpans, setRowSpans] = useState<Record<string, number>>({});
    const onStepChange = (event: ResizedEvent) => {
        const title = event.card.title;
        if (title) setRowSpans((spans) => ({ ...spans, [title]: event.newCardHeightRowSpan }));
    };
    const linesOf = (card: ResizableCardItemConfig) => {
        if (mode !== 'inputs') return LINES;
        const rowSpan = rowSpans[card.title ?? ''] ?? card.cardHeightRowSpan ?? 0;
        return LINES.slice(0, visibleLines(card, rowSpan));
    };
    const content = (card: ResizableCardItemConfig) => (
        <Card>
            <CardHeader>
                <CardMainHeader>
                    <CardTitle level={3}>{card.title}</CardTitle>
                    <CardSubtitle render={<h4 />}>
                        {card.resizable === false ? 'Not resizable' : 'Resizable'}
                    </CardSubtitle>
                    {mode === 'inputs' && (
                        <CardCounter>
                            {linesOf(card).length} of {LINES.length}
                        </CardCounter>
                    )}
                </CardMainHeader>
            </CardHeader>
            <CardContent>
                <List noBorder aria-label={card.title}>
                    {linesOf(card).map((line) => (
                        <ListItem key={line}>
                            <ListTitle>
                                {card.title} item {line}
                            </ListTitle>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
    return (
        <div className="block">
            <p className={`m-0 ${TEXT}`} aria-live="polite">
                Drag the edges or the corner of a card to resize it. {status}
            </p>
            <ResizableCardLayout
                layoutConfig={mode === 'layout' ? CARDS : null}
                onResized={(event) => {
                    setStatus(
                        `${event.card.title}: ${event.cardWidthColSpan} column(s), ${event.cardHeightRowSpan} rows.`
                    );
                    onStepChange(event);
                }}
                onStepChange={onStepChange}
                onMiniHeaderReached={(event) => setStatus(`${event.card.title}: mini header`)}
                onMiniContentReached={(event) => setStatus(`${event.card.title}: mini content`)}
            >
                {CARDS.map((card) =>
                    mode === 'config' ? (
                        <ResizableCardItem key={card.title} config={card}>
                            {content(card)}
                        </ResizableCardItem>
                    ) : mode === 'layout' ? (
                        <ResizableCardItem key={card.title}>{content(card)}</ResizableCardItem>
                    ) : (
                        <ResizableCardItem
                            key={card.title}
                            title={card.title}
                            rank={card.rank}
                            cardWidthColSpan={card.cardWidthColSpan ?? 1}
                            cardHeightRowSpan={card.cardHeightRowSpan}
                            cardMiniHeaderRowSpan={card.cardMiniHeaderRowSpan}
                            cardMiniContentRowSpan={card.cardMiniContentRowSpan}
                            resizable={card.resizable ?? true}
                        >
                            {content(card)}
                        </ResizableCardItem>
                    )
                )}
            </ResizableCardLayout>
        </div>
    );
}

const meta = {
    title: 'Components/Resizable Card Layout',
    component: ResizableCardLayout,
    subcomponents: { ResizableCardItem } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'The resizable card layout places cards in columns of 20rem (one to four, by the available width). Cards are resized by dragging their end edge, bottom edge or corner; ' +
                    'widths snap to columns and heights to 1rem rows, down to the mini content or mini header height. Other cards move to make room. The arrow keys move the focus between the cards.\n\n' +
                    '```tsx\n' +
                    '<ResizableCardLayout onLayoutChange={save}>\n' +
                    '    <ResizableCardItem key="sales" title="Sales" cardWidthColSpan={2} cardHeightRowSpan={20} cardMiniHeaderRowSpan={5} cardMiniContentRowSpan={10}>\n' +
                    '        <Card>...</Card>\n' +
                    '    </ResizableCardItem>\n' +
                    '</ResizableCardLayout>\n' +
                    '```'
            }
        }
    }
} satisfies Meta<typeof ResizableCardLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Resizable cards', render: () => <Example /> };

export const LayoutConfig: Story = {
    name: 'Layout config',
    parameters: {
        docs: {
            description: {
                story: 'The same cards, configured with one `layoutConfig` array on `ResizableCardLayout`: each entry applies to the card at its position.'
            }
        }
    },
    render: () => <Example mode="layout" />
};

export const ItemInputs: Story = {
    name: 'Item inputs',
    parameters: {
        docs: {
            description: {
                story: 'Cards configured with the item props (`rank`, `cardWidthColSpan`, `cardHeightRowSpan`, mini spans, `resizable`). Each list shows as many rows as fit its card and updates on `onStepChange`.'
            }
        }
    },
    render: () => <Example mode="inputs" />
};

export const Resizing: Story = {
    name: 'State: resizing',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story: 'The first card in the middle of a resize: the dashed frame, the corner handle and the indication of the next column.'
            }
        }
    },
    render: () => <Example />,
    // a pointer that is not the mouse (pointerId 99) presses the end edge of the first card and moves 200px
    play: async ({ canvasElement }) => {
        const edge = await waitFor(() => {
            const found = canvasElement.querySelector<HTMLElement>('.cursor-ew-resize');
            expect(found).not.toBeNull();
            return found!;
        });
        const rect = edge.getBoundingClientRect();
        const rtl = getComputedStyle(edge).direction === 'rtl';
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const fire = (target: EventTarget, type: string, clientX: number) =>
            target.dispatchEvent(
                new PointerEvent(type, { bubbles: true, cancelable: true, clientX, clientY: y, pointerId: 99 })
            );
        fire(edge, 'pointerdown', x);
        for (let step = 1; step <= 10; step++) fire(document, 'pointermove', x + (rtl ? -20 : 20) * step);
        await waitFor(() => expect(canvasElement.querySelector('[data-resize-corner]')).not.toBeNull());
    }
};
