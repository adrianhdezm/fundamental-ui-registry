import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    ResizableCardItem,
    ResizableCardLayout,
    type ResizableCardItemConfig,
    type ResizableCardLayoutConfig,
    type ResizedEvent
} from './resizable-card-layout';

const card = (title: string, config: Partial<ResizableCardItemConfig> = {}): ResizableCardItemConfig => ({
    title,
    cardWidthColSpan: 1,
    cardHeightRowSpan: 10,
    cardMiniHeaderRowSpan: 3,
    cardMiniContentRowSpan: 5,
    ...config
});

const FIVE = ['A', 'B', 'C', 'D', 'E'].map((title, i) => card(title, { rank: i + 1 }));

interface Events {
    steps: ResizedEvent[];
    resizings: ResizedEvent[];
    resizeds: ResizedEvent[];
    miniHeader: ResizedEvent[];
    miniContent: ResizedEvent[];
    layouts: ResizableCardLayoutConfig[];
}

interface HostProps {
    width?: number;
    cards?: ResizableCardItemConfig[];
}

/** Mirrors the Angular test host: one item per configuration (`config`). */
function Host({ width = 1500, cards = FIVE, events }: HostProps & { events: Events }) {
    return (
        <>
            <button id="before">Before</button>
            <div style={{ width }}>
                <ResizableCardLayout
                    onStepChange={(e) => events.steps.push(e)}
                    onResizing={(e) => events.resizings.push(e)}
                    onResized={(e) => events.resizeds.push(e)}
                    onMiniHeaderReached={(e) => events.miniHeader.push(e)}
                    onMiniContentReached={(e) => events.miniContent.push(e)}
                    onLayoutChange={(config) => events.layouts.push(config)}
                >
                    {cards.map((item) => (
                        <ResizableCardItem key={item.title} config={item}>
                            <div className="h-full bg-sap-tile-background">{item.title}</div>
                        </ResizableCardItem>
                    ))}
                </ResizableCardLayout>
            </div>
        </>
    );
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const stable = async () => {
    await frame();
    await frame();
};

const box = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-resizable-card-box]')!;
const sizeOf = (el: HTMLElement) => [parseFloat(box(el).style.width), parseFloat(box(el).style.height)];
/** Position from the styles (the cards animate to it). */
const positionOf = (el: HTMLElement) => [parseFloat(el.style.insetInlineStart), parseFloat(el.style.top)];
const itemsIn = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('[id^="fd-card-item-"]')];

async function setup(config: HostProps = {}) {
    const events: Events = { steps: [], resizings: [], resizeds: [], miniHeader: [], miniContent: [], layouts: [] };
    let props = config;
    const screen = await render(<Host {...props} events={events} />);
    await stable();
    const update = async (next: HostProps) => {
        props = { ...props, ...next };
        await screen.rerender(<Host {...props} events={events} />);
        await stable();
    };
    const root = screen.container;
    // the real cursor stays where an earlier test left it; over a card, that card shows its corner handle
    await userEvent.hover(root.querySelector<HTMLElement>('#before')!);
    await stable();
    const layout = root.querySelector<HTMLElement>('#before + div > div')!;
    const items = () => itemsIn(root);
    const item = (title: string) => items().find((i) => i.getAttribute('aria-label') === title)!;
    const position = (title: string) => positionOf(item(title));
    const size = (title: string) => sizeOf(item(title));
    const handle = (title: string, cursor: 'ew' | 'ns' | 'nwse') =>
        item(title).querySelector<HTMLElement>(`.cursor-${cursor}-resize`);
    return { screen, events, update, root, layout, items, item, position, size, handle };
}

/** Drags a handle by dx/dy in steps, with pointer events. */
async function drag(handle: HTMLElement, dx: number, dy: number, steps = 10, release = true) {
    const rect = handle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const fire = (target: EventTarget, type: string, cx: number, cy: number) =>
        target.dispatchEvent(
            new PointerEvent(type, {
                bubbles: true,
                cancelable: true,
                clientX: cx,
                clientY: cy,
                pointerId: 1,
                button: 0
            })
        );
    fire(handle, 'pointerdown', x, y);
    for (let step = 1; step <= steps; step++) {
        fire(document, 'pointermove', x + (dx * step) / steps, y + (dy * step) / steps);
        await frame();
    }
    const end = { x: x + dx, y: y + dy };
    if (release) fire(document, 'pointerup', end.x, end.y);
    await frame();
    return {
        move: async (mx: number, my: number) => {
            fire(document, 'pointermove', x + mx, y + my);
            await frame();
        },
        up: async () => {
            fire(document, 'pointerup', end.x, end.y);
            await frame();
        }
    };
}

afterEach(() => {
    document.documentElement.removeAttribute('dir');
});

describe('ResizableCardLayout', () => {
    it('layout size from the available width (≤656 sm, ≤975 md, ≤1359 lg, else xl) sets 1–4 columns and paddings', async () => {
        const { update, layout, position } = await setup();
        const cases: [number, number, number, number][] = [
            // available width, layout width, padding, columns
            [1500, 1424, 48, 4],
            [1359, 1024, 16, 3],
            [975, 688, 16, 2],
            [656, 336, 8, 1]
        ];
        for (const [width, layoutWidth, padding, columns] of cases) {
            await update({ width });
            expect(parseFloat(layout.style.width)).toBe(layoutWidth);
            expect(getComputedStyle(layout).paddingLeft).toBe(`${padding}px`);
            // the first row holds one card per column
            const firstRow = ['A', 'B', 'C', 'D'].filter((t) => position(t)[1] === 0);
            expect(firstRow).toHaveLength(columns);
            expect(position('A')[0]).toBe(padding);
            if (columns > 1) expect(position('B')[0]).toBe(padding + 336);
        }
        await update({ width: 1360 });
        expect(parseFloat(layout.style.width)).toBe(1424);
    });

    it('cards are placed by rank at the topmost position where they fit (layout height = highest column + 1rem)', async () => {
        const { layout, position } = await setup({
            cards: [
                card('A', { rank: 1, cardHeightRowSpan: 20 }),
                card('B', { rank: 2, cardWidthColSpan: 2, cardHeightRowSpan: 10 }),
                card('C', { rank: 3, cardHeightRowSpan: 5 }),
                // ranks decide the order, not the content order
                card('E', { rank: 5, cardWidthColSpan: 3, cardHeightRowSpan: 5 }),
                card('D', { rank: 4, cardHeightRowSpan: 15 })
            ]
        });
        expect(position('A')).toEqual([48, 0]);
        expect(position('B')).toEqual([48 + 336, 0]);
        expect(position('C')).toEqual([48 + 3 * 336, 0]);
        // D goes under C, the lowest column
        expect(position('D')).toEqual([48 + 3 * 336, 80 + 16]);
        // E (3 columns) does not fit under B and C next to the taller D, so it goes below A
        expect(position('E')).toEqual([48, 320 + 16]);
        // highest column (A and E) + 1rem
        expect(parseFloat(layout.style.height)).toBe(336 + 80 + 16);
    });

    it('cards are focusable groups named by their title', async () => {
        const { item } = await setup();
        const a = item('A');
        expect(a.getAttribute('role')).toBe('group');
        expect(a.getAttribute('tabindex')).toBe('0');
        expect(a.id).toMatch(/^fd-card-item-/);
    });

    it('card widths are limited to the columns and restored when there is room again', async () => {
        const { update, events, size } = await setup({
            cards: [card('A', { rank: 1, cardWidthColSpan: 3 }), card('B', { rank: 2 })]
        });
        expect(size('A')[0]).toBe(3 * 320 + 2 * 16);
        await update({ width: 900 });
        expect(size('A')[0]).toBe(2 * 320 + 16);
        expect(events.resizeds.at(-1)!.cardWidthColSpan).toBe(2);
        await update({ width: 600 });
        expect(size('A')[0]).toBe(320);
        await update({ width: 1500 });
        expect(size('A')[0]).toBe(3 * 320 + 2 * 16);
    });

    it('dragging the end edge/corner snaps the width to columns once past half a column (emits stepChange, resized)', async () => {
        const { events, size, handle, item } = await setup();
        const { resizeds, resizings } = events;
        const edge = handle('A', 'ew')!;
        expect(edge).not.toBeNull();

        // less than half a column: back to one column
        await drag(edge, 120, 0);
        await stable();
        expect(size('A')[0]).toBe(320);
        expect(resizings.length).toBeGreaterThan(0);
        expect(resizeds.at(-1)!.cardWidthColSpan).toBe(1);

        // past half a column: two columns
        const steps = events.steps.length;
        const resized = resizeds.length;
        await drag(handle('A', 'ew')!, 200, 0);
        await stable();
        expect(size('A')[0]).toBe(2 * 320 + 16);
        expect(events.steps.length).toBeGreaterThan(steps);
        expect(resizeds.length).toBeGreaterThan(resized);
        expect(resizeds.at(-1)).toMatchObject({ cardWidthColSpan: 2, prevCardWidth: 320, cardWidth: 656 });

        // the corner appears on hover and resizes both ways
        expect(handle('A', 'nwse')).toBeNull();
        await userEvent.hover(box(item('A')));
        await stable();
        const corner = handle('A', 'nwse')!;
        expect(corner).not.toBeNull();
        // at the bottom end corner of the card
        const cornerBox = corner.getBoundingClientRect();
        const cardBox = box(item('A')).getBoundingClientRect();
        expect(cornerBox.height).toBe(24);
        expect(Math.round(cornerBox.right)).toBe(Math.round(cardBox.right - 1));
        expect(cornerBox.bottom).toBeGreaterThan(cardBox.bottom);
        await drag(corner, -200, 45);
        await stable();
        expect(size('A')).toEqual([320, 208]);
        expect(resizeds.at(-1)).toMatchObject({ cardWidthColSpan: 1, cardHeightRowSpan: 13 });
    });

    it('the card shows a dashed frame while resizing and an indication of the next column', async () => {
        const { handle, item } = await setup();
        const frameBox = item('A').firstElementChild as HTMLElement;
        expect(getComputedStyle(frameBox).borderTopWidth).toBe('0px');
        const gesture = await drag(handle('A', 'ew')!, 200, 0, 10, false);
        await stable();
        expect(getComputedStyle(frameBox).borderTopStyle).toBe('dashed');
        expect(getComputedStyle(frameBox).borderTopWidth).toBe('2px');
        expect(item('A').style.zIndex).toBe('1');
        const indication = frameBox.lastElementChild as HTMLElement;
        // 520px wide: 136px are missing to the two-column width
        expect(parseFloat(indication.style.width)).toBe(2 * 320 + 16 - 520);
        await gesture.up();
        await stable();
        expect(getComputedStyle(frameBox).borderTopWidth).toBe('0px');
        expect(parseFloat(indication.style.width)).toBe(0);
        expect(item('A').style.zIndex).toBe('0');
    });

    it('growing a card past half a column moves cards at the end of its row down; shrinking back restores their ranks', async () => {
        const { handle, position, events } = await setup();
        const { layouts } = events;
        expect(position('D')).toEqual([48 + 3 * 336, 0]);
        expect(position('E')).toEqual([48, 176]);
        const gesture = await drag(handle('A', 'ew')!, 200, 0, 10, false);
        await stable();
        // A covers two columns, B and C move along; D (end of the row) moves down, after E
        expect(position('B')).toEqual([48 + 2 * 336, 0]);
        expect(position('C')).toEqual([48 + 3 * 336, 0]);
        expect(position('E')[1]).toBe(176);
        expect(position('D')[1]).toBe(176);
        expect(position('D')[0]).toBeGreaterThan(position('E')[0]);
        const ranks = (config: ResizableCardLayoutConfig) => config.map((c) => `${c.title}${c.rank}`);
        expect(ranks(layouts.at(-1)!)).toEqual(['A1', 'B2', 'C3', 'D5', 'E4']);
        expect(events.steps.length).toBeGreaterThan(0);

        // back to the start: ranks restored
        await gesture.move(10, 0);
        await stable();
        await gesture.up();
        await stable();
        expect(ranks(layouts.at(-1)!)).toEqual(['A1', 'B2', 'C3', 'D4', 'E5']);
        expect(position('D')).toEqual([48 + 3 * 336, 0]);
        expect(position('E')).toEqual([48, 176]);
    });

    it('dragging the bottom edge snaps the height to 1rem rows; below mini content snaps to it, then to the mini header (emits miniContentReached / miniHeaderReached)', async () => {
        const { events, handle, size, position } = await setup();
        const bottom = () => handle('A', 'ns')!;
        expect(size('A')[1]).toBe(160);

        // 197px: 12 rows (5px rounds down)
        await drag(bottom(), 0, 37);
        await stable();
        expect(size('A')[1]).toBe(192);
        expect(events.steps.length).toBeGreaterThan(0);
        expect(events.resizeds.at(-1)!.cardHeightRowSpan).toBe(12);
        // the card below now fits higher up under B
        expect(position('E')).toEqual([48 + 336, 176]);

        // 205px: 13 rows (13px rounds up)
        await drag(bottom(), 0, 13);
        await stable();
        expect(size('A')[1]).toBe(208);

        // shrinking below mini header + mini content (8 rows) snaps to it
        await drag(bottom(), 0, -150, 15);
        await stable();
        expect(size('A')[1]).toBe(128);
        expect(events.miniContent).toHaveLength(1);
        expect(events.miniContent[0].cardHeightRowSpan).toBe(8);
        expect(events.miniHeader).toHaveLength(0);

        // shrinking further snaps to the mini header (3 rows)
        await drag(bottom(), 0, -10, 2);
        await stable();
        expect(size('A')[1]).toBe(48);
        expect(events.miniHeader).toHaveLength(1);
        expect(events.miniHeader[0].cardHeightRowSpan).toBe(3);

        // growing from the mini header goes back to the mini content height
        await drag(bottom(), 0, 10, 2);
        await stable();
        expect(size('A')[1]).toBe(128);
        expect(events.miniContent).toHaveLength(2);
        expect(position('E')).toEqual([48, 128 + 16]);
    });

    it('resizable=false shows no handles', async () => {
        const { handle, item, size } = await setup({
            cards: [card('A', { rank: 1, resizable: false }), card('B', { rank: 2 })]
        });
        expect(handle('A', 'ew')).toBeNull();
        expect(handle('A', 'ns')).toBeNull();
        await userEvent.hover(box(item('A')));
        await stable();
        expect(handle('A', 'nwse')).toBeNull();
        expect(size('A')).toEqual([320, 160]);
        expect(handle('B', 'ew')).not.toBeNull();
    });

    it('RTL: horizontal resizing is mirrored and cards are placed from the right', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        const { events, handle, item, layout, size } = await setup();
        const a = item('A').getBoundingClientRect();
        const b = item('B').getBoundingClientRect();
        expect(Math.round(layout.getBoundingClientRect().right - a.right)).toBe(48);
        expect(b.right).toBeLessThan(a.left);

        const edge = handle('A', 'ew')!;
        // the edge is on the left
        expect(edge.getBoundingClientRect().left).toBeLessThan(a.left + 330 - 320 + 1);
        const steps = events.steps.length;
        const gesture = await drag(edge, -200, 0, 10, false);
        await stable();
        // growing into the next column moves the card at the end of the row down, as in LTR
        expect(events.steps.length).toBeGreaterThan(steps);
        expect(item('D').style.top).not.toBe('0px');
        await gesture.up();
        await stable();
        expect(size('A')[0]).toBe(2 * 320 + 16);
        // dragging to the right makes it narrower
        await drag(handle('A', 'ew')!, 200, 0);
        await stable();
        expect(size('A')[0]).toBe(320);
    });

    it('the corner sits at the bottom left in RTL', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        const { handle, item } = await setup();
        await userEvent.hover(box(item('A')));
        await stable();
        const corner = handle('A', 'nwse')!.parentElement!.getBoundingClientRect();
        const cardBox = box(item('A')).getBoundingClientRect();
        expect(Math.round(corner.left)).toBe(Math.round(cardBox.left - 4 + 1));
    });

    it('arrow keys move focus between cards in rank order', async () => {
        const { item, root, update } = await setup();
        await update({ cards: [card('C', { rank: 3 }), card('A', { rank: 1 }), card('B', { rank: 2 })] });
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.keyboard('{Tab}');
        // tab order follows the DOM
        expect(document.activeElement).toBe(item('C'));
        item('A').focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(item('B'));
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(item('C'));
        // wraps
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(item('A'));
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(item('C'));
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(item('B'));
    });

    it('swaps ArrowLeft and ArrowRight in RTL', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        const { item } = await setup();
        item('A').focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(item('B'));
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(item('A'));
    });

    it('onLayoutChange emits the configuration (rank, spans) when it changes', async () => {
        const { events, update, handle } = await setup();
        const last = () => events.layouts.at(-1)!;
        expect(last()).toHaveLength(5);
        expect(last()[0]).toEqual({
            title: 'A',
            rank: 1,
            cardWidthColSpan: 1,
            cardHeightRowSpan: 10,
            cardMiniHeaderRowSpan: 3,
            cardMiniContentRowSpan: 5,
            resizable: true
        });
        const count = events.layouts.length;
        await drag(handle('B', 'ew')!, 200, 0);
        await stable();
        expect(events.layouts.length).toBeGreaterThan(count);
        expect(last()[1]).toMatchObject({ title: 'B', cardWidthColSpan: 2 });

        await update({ width: 900 });
        expect(last().every((c) => c.cardWidthColSpan! <= 2)).toBe(true);
    });

    it('layoutConfig assigns title, rank, spans and resizable to the cards in content order', async () => {
        const miniHeader: ResizedEvent[] = [];
        const layoutConfig: ResizableCardLayoutConfig = [
            card('First', { rank: 3, cardWidthColSpan: 2, cardHeightRowSpan: 12 }),
            card('Second', { rank: 1, cardHeightRowSpan: 20, resizable: false }),
            card('Third', { rank: 2, cardHeightRowSpan: 12, cardMiniHeaderRowSpan: 4 })
        ];
        const screen = await render(
            <div style={{ width: 1500 }}>
                <ResizableCardLayout layoutConfig={layoutConfig} onMiniHeaderReached={(e) => miniHeader.push(e)}>
                    {[1, 2, 3].map((n) => (
                        <ResizableCardItem key={n}>
                            <div className="h-full bg-sap-tile-background">Card {n}</div>
                        </ResizableCardItem>
                    ))}
                </ResizableCardLayout>
            </div>
        );
        await stable();
        const items = itemsIn(screen.container);
        expect(items.map((i) => i.getAttribute('aria-label'))).toEqual(['First', 'Second', 'Third']);
        expect(sizeOf(items[0])).toEqual([2 * 320 + 16, 192]);
        expect(sizeOf(items[1])).toEqual([320, 320]);
        expect(sizeOf(items[2])).toEqual([320, 192]);
        // placed by rank: Second, Third, then First (two columns)
        expect(positionOf(items[1])).toEqual([48, 0]);
        expect(positionOf(items[2])).toEqual([48 + 336, 0]);
        expect(positionOf(items[0])).toEqual([48 + 2 * 336, 0]);
        // resizable=false from the layout configuration
        expect(items[1].querySelector('.cursor-ew-resize')).toBeNull();
        expect(items[2].querySelector('.cursor-ew-resize')).not.toBeNull();
        // mini spans from the layout configuration: shrinking snaps to mini header 4 + mini content 5 rows,
        // then to the mini header
        const bottom = () => items[2].querySelector<HTMLElement>('.cursor-ns-resize')!;
        await drag(bottom(), 0, -100, 10);
        await stable();
        expect(sizeOf(items[2])[1]).toBe(144);
        await drag(bottom(), 0, -10, 2);
        await stable();
        expect(sizeOf(items[2])[1]).toBe(64);
        expect(miniHeader.at(-1)?.cardHeightRowSpan).toBe(4);
    });

    it('a one-column card dragged left stays one column wide', async () => {
        const { events, handle, size } = await setup();
        await drag(handle('A', 'ew')!, -250, 0);
        await stable();
        expect(size('A')[0]).toBe(320);
        expect(events.resizeds.at(-1)!.cardWidthColSpan).toBe(1);
    });

    it('item props (title, rank, cardWidthColSpan, cardHeightRowSpan, resizable) place and size a card like config', async () => {
        const screen = await render(
            <div style={{ width: 1500 }}>
                <ResizableCardLayout>
                    <ResizableCardItem
                        title="Wide"
                        rank={2}
                        cardWidthColSpan={2}
                        cardHeightRowSpan={12}
                        cardMiniHeaderRowSpan={3}
                        cardMiniContentRowSpan={5}
                    >
                        <div className="h-full bg-sap-tile-background">Wide</div>
                    </ResizableCardItem>
                    <ResizableCardItem title="Tall" rank={1} cardHeightRowSpan={20} resizable={false}>
                        <div className="h-full bg-sap-tile-background">Tall</div>
                    </ResizableCardItem>
                </ResizableCardLayout>
            </div>
        );
        await stable();
        const [wide, tall] = itemsIn(screen.container);
        expect([wide.getAttribute('aria-label'), tall.getAttribute('aria-label')]).toEqual(['Wide', 'Tall']);
        expect(sizeOf(wide)).toEqual([2 * 320 + 16, 192]);
        expect(sizeOf(tall)).toEqual([320, 320]);
        // rank 1 first, though it comes second in the content
        expect(positionOf(tall)).toEqual([48, 0]);
        expect(positionOf(wide)).toEqual([48 + 336, 0]);
        expect(tall.querySelector('.cursor-ew-resize')).toBeNull();
        expect(wide.querySelector('.cursor-ew-resize')).not.toBeNull();
    });

    it('a new span from the props replaces the resized one (rerender)', async () => {
        const view = (span: number) => (
            <div style={{ width: 1500 }}>
                <ResizableCardLayout>
                    <ResizableCardItem title="A" cardWidthColSpan={span} cardHeightRowSpan={10} />
                </ResizableCardLayout>
            </div>
        );
        const screen = await render(view(1));
        await stable();
        const [a] = itemsIn(screen.container);
        await drag(a.querySelector<HTMLElement>('.cursor-ew-resize')!, 200, 0);
        await stable();
        expect(sizeOf(a)[0]).toBe(656);
        await screen.rerender(view(3));
        await stable();
        expect(sizeOf(a)[0]).toBe(3 * 320 + 2 * 16);
    });

    it('passes native props, className and ref to the roots', async () => {
        const ref = createRef<HTMLDivElement>();
        const itemRef = createRef<HTMLDivElement>();
        const screen = await render(
            <ResizableCardLayout ref={ref} className="blue" data-sample="Sample">
                <ResizableCardItem ref={itemRef} className="red" data-item="Item" title="Named" id="own" />
            </ResizableCardLayout>
        );
        const root = screen.container.querySelector<HTMLElement>('[data-sample]')!;
        expect(root.className).toContain('blue');
        expect(ref.current).toBe(root);
        const item = root.querySelector<HTMLElement>('[data-item]')!;
        expect(item.className).toContain('red');
        expect(itemRef.current).toBe(item);
        expect(item.id).toBe('own');
        expect(item.getAttribute('aria-label')).toBe('Named');
    });
});
