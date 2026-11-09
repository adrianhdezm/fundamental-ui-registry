import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Card, CardHeader, CardMainHeader, CardTitle } from '@/ui/card/card';
import {
    FixedCardLayout,
    FixedCardLayoutCard,
    type CardDropped,
    type ColumnsWidthConfig,
    type FixedCardLayoutChange
} from './fixed-card-layout';

interface TestCard {
    title: string;
    height: number;
}

const cards = (heights: number[]): TestCard[] => heights.map((height, i) => ({ title: `Card ${i + 1}`, height }));

interface HostProps {
    width?: number;
    cards?: TestCard[];
    maxColumns?: number;
    cardMinimumWidth?: number;
    widthConfig?: ColumnsWidthConfig | null;
    disabled?: boolean;
    changes: FixedCardLayoutChange[];
    drops: CardDropped[];
}

/** Mirrors the Angular test host. */
function Host({
    width = 1000,
    cards: list = cards([100, 200, 150, 120, 80]),
    maxColumns = 10,
    cardMinimumWidth = 320,
    widthConfig = null,
    disabled = false,
    changes,
    drops
}: HostProps) {
    return (
        <>
            <button id="before">Before</button>
            <div style={{ width }}>
                <FixedCardLayout
                    maxColumns={maxColumns}
                    cardMinimumWidth={cardMinimumWidth}
                    columnsWidthConfig={widthConfig}
                    disableDragDrop={disabled}
                    dragStartDelay={0}
                    onLayoutChange={(change) => changes.push(change)}
                    onCardDraggedDropped={(drop) => drops.push(drop)}
                >
                    {list.map((card, i) => (
                        <FixedCardLayoutCard key={card.title} rank={i + 1}>
                            <Card data-title={card.title}>
                                <CardHeader>
                                    <CardMainHeader>
                                        <CardTitle level={3} id={`title-${i}`}>
                                            {card.title}
                                        </CardTitle>
                                    </CardMainHeader>
                                </CardHeader>
                                <div style={{ height: card.height }} />
                            </Card>
                        </FixedCardLayoutCard>
                    ))}
                </FixedCardLayout>
            </div>
        </>
    );
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const stable = async () => {
    await frame();
    await frame();
    await frame();
};

async function setup(config: Omit<HostProps, 'changes' | 'drops'> = {}) {
    const changes: FixedCardLayoutChange[] = [];
    const drops: CardDropped[] = [];
    let props: Omit<HostProps, 'changes' | 'drops'> = config;
    const screen = await render(<Host {...props} changes={changes} drops={drops} />);
    await stable();
    const update = async (next: Omit<HostProps, 'changes' | 'drops'>) => {
        props = { ...props, ...next };
        await screen.rerender(<Host {...props} changes={changes} drops={drops} />);
        await stable();
    };
    const root = screen.container;
    const layout = root.querySelector<HTMLElement>('#before + div > div')!;
    const items = () => [...root.querySelectorAll<HTMLElement>('[role=group]:has(> [data-title])')];
    const titles = () => items().map((item) => item.querySelector('h3')!.textContent!.trim());
    const item = (title: string) => items().find((i) => i.querySelector(`[data-title="${title}"]`))!;
    const columnLefts = () => [...new Set(items().map((i) => Math.round(i.getBoundingClientRect().left)))];
    return {
        screen,
        root,
        update,
        layout,
        inner: layout.firstElementChild as HTMLElement,
        items,
        titles,
        item,
        columnLefts,
        changes,
        drops,
        columns: () => changes.at(-1)?.numberOfColumns
    };
}

const mouse = (type: 'mousePressed' | 'mouseReleased' | 'mouseMoved', x: number, y: number) =>
    cdp().send('Input.dispatchMouseEvent', {
        type,
        x,
        y,
        button: 'left',
        buttons: type === 'mouseReleased' ? 0 : 1,
        clickCount: 1
    });

/** Drags one element onto another with the real mouse (the target is located once the drag has started). */
async function drag(from: HTMLElement, to: HTMLElement) {
    const start = from.getBoundingClientRect();
    let x = Math.round(start.left + 20);
    let y = Math.round(start.top + 20);
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await mouse('mousePressed', x, y);
    await frame();
    // past the drag threshold
    x += 10;
    y += 10;
    await mouse('mouseMoved', x, y);
    await frame();
    // a second move lets the card under the pointer take the placeholder
    await mouse('mouseMoved', x + 1, y + 1);
    await frame();
    await frame();
    const target = to.getBoundingClientRect();
    // the dragged card itself is hidden while dragging: then the pointer stays where it is
    const hidden = !target.width;
    const tx = hidden ? x + 1 : Math.round(target.left + target.width / 2);
    const ty = hidden ? y + 1 : Math.round(target.top + Math.min(target.height / 2, 30));
    for (let step = 1; step <= 10; step++) {
        await mouse('mouseMoved', x + ((tx - x) * step) / 10, y + ((ty - y) * step) / 10);
        await frame();
    }
    await mouse('mouseReleased', tx, ty);
    await frame();
}

afterEach(() => {
    document.documentElement.removeAttribute('dir');
});

describe('FixedCardLayout', () => {
    it('a larger cardMinimumWidth reduces the number of columns (never below 20rem)', async () => {
        const { update, columns, columnLefts, items } = await setup();
        expect(columns()).toBe(3);

        await update({ cardMinimumWidth: 400 });
        expect(columns()).toBe(2);
        expect(columnLefts()).toHaveLength(2);
        expect(items().every((i) => i.getBoundingClientRect().width >= 400)).toBe(true);

        // below 20rem the minimum stays 20rem
        await update({ cardMinimumWidth: 100 });
        expect(columns()).toBe(3);
        expect(items().every((i) => i.getBoundingClientRect().width >= 320)).toBe(true);
    });

    it('number of columns follows the width (cards at least 20rem, 1rem gaps), capped by maxColumns and the card count', async () => {
        const { update, columnLefts, columns, items } = await setup();
        // 1000px + the 1rem start gap: three 20rem columns with gaps fit
        expect(columns()).toBe(3);
        expect(columnLefts()).toHaveLength(3);
        expect(items().every((i) => i.getBoundingClientRect().width >= 320)).toBe(true);

        await update({ width: 700 });
        expect(columns()).toBe(2);
        expect(columnLefts()).toHaveLength(2);

        // exactly 2 x 20rem + gap
        await update({ width: 640 });
        expect(columns()).toBe(2);

        await update({ width: 639 });
        expect(columns()).toBe(1);
        expect(columnLefts()).toHaveLength(1);

        await update({ width: 2000 });
        expect(columns()).toBe(5);

        await update({ maxColumns: 2 });
        expect(columns()).toBe(2);

        await update({ maxColumns: 10, cards: cards([100, 100]) });
        expect(columns()).toBe(2);
        expect(columnLefts()).toHaveLength(2);
    });

    it('cards are placed row by row: card i goes to column i % columns, DOM order stays the rank order', async () => {
        const { titles, item, columnLefts } = await setup();
        expect(titles()).toEqual(['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5']);
        const lefts = columnLefts().sort((a, b) => a - b);
        const left = (title: string) => Math.round(item(title).getBoundingClientRect().left);
        const top = (title: string) => item(title).getBoundingClientRect().top;
        const bottom = (title: string) => item(title).getBoundingClientRect().bottom;
        expect(['Card 1', 'Card 2', 'Card 3'].map(left)).toEqual(lefts);
        expect(left('Card 4')).toBe(lefts[0]);
        expect(left('Card 5')).toBe(lefts[1]);
        // the first row is aligned at the top, the second row sits 1rem below each column's card
        expect(top('Card 2')).toBeCloseTo(top('Card 1'), 0);
        expect(top('Card 3')).toBeCloseTo(top('Card 1'), 0);
        expect(top('Card 4') - bottom('Card 1')).toBeCloseTo(16, 0);
        expect(top('Card 5') - bottom('Card 2')).toBeCloseTo(16, 0);
        // columns 1rem apart
        expect(lefts[1] - Math.round(item('Card 1').getBoundingClientRect().right)).toBe(16);
    });

    it('cards are focusable groups labelled by their card title', async () => {
        const { items } = await setup();
        const first = items()[0];
        expect(first.getAttribute('role')).toBe('group');
        expect(first.getAttribute('tabindex')).toBe('0');
        expect(first.getAttribute('aria-labelledby')).toBe('title-0');
    });

    it('container height is the highest column; re-measured when a card changes height', async () => {
        const { update, inner, items } = await setup();
        const heights = () => items().map((i) => i.offsetHeight);
        const expected = () => {
            const h = heights();
            const columns = [h[0] + h[3] + 32, h[1] + h[4] + 32, h[2] + 16];
            return Math.ceil(Math.max(...columns) + 4);
        };
        expect(inner.getBoundingClientRect().height).toBe(expected());

        await update({ cards: cards([100, 200, 600, 120, 80]) });
        await stable();
        expect(inner.getBoundingClientRect().height).toBe(expected());
        expect(inner.getBoundingClientRect().height).toBeGreaterThan(600);
        // the layout reserves the space: the content after it does not overlap the cards
        const lowest = Math.max(...items().map((i) => i.getBoundingClientRect().bottom));
        expect(inner.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(lowest);
    });

    it('columnsWidthConfig distributes the free space by the column modifiers', async () => {
        const { update, item } = await setup();
        await update({ maxColumns: 2, widthConfig: { 1: 2, 2: 1 } });
        // layout width 1016px, 2 x 320px minimum, the 376px left over go 2:1
        const column = (title: string) => item(title).parentElement!.getBoundingClientRect().width;
        expect(Math.round(column('Card 1'))).toBe(Math.round(320 + (376 * 2) / 3));
        expect(Math.round(column('Card 2'))).toBe(Math.round(320 + 376 / 3));
        expect(Math.round(column('Card 3'))).toBe(Math.round(column('Card 1')));

        await update({ widthConfig: null });
        expect(Math.round(column('Card 1'))).toBe(Math.round(column('Card 2')));
    });

    it('dragging a card onto another swaps their ranks and emits onCardDraggedDropped (previous/current index)', async () => {
        const { drops, item, titles } = await setup();
        await drag(item('Card 1'), item('Card 3'));
        await stable();
        expect(drops).toHaveLength(1);
        const drop = drops[0];
        expect(drop.previousIndex).toBe(0);
        expect(drop.currentIndex).toBe(2);
        expect(drop.layoutColumns).toBe(3);
        expect(drop.items.map((c) => c.rank)).toEqual([1, 2, 3, 4, 5]);
        expect(drop.items.map((c) => c.key)).toEqual(['Card 3', 'Card 2', 'Card 1', 'Card 4', 'Card 5']);
        expect(titles()).toEqual(['Card 3', 'Card 2', 'Card 1', 'Card 4', 'Card 5']);
        // card 1 now sits in the third column
        expect(Math.round(item('Card 1').getBoundingClientRect().left)).toBeGreaterThan(
            Math.round(item('Card 2').getBoundingClientRect().left)
        );
    });

    it('the cards below the dragged one move up, and can be dropped on where they are now', async () => {
        const { drops, item, titles } = await setup({ cards: cards([100, 200, 150, 120, 80, 90, 110]) });
        await drag(item('Card 1'), item('Card 7'));
        await stable();
        expect(drops).toHaveLength(1);
        expect(drops[0]).toMatchObject({ previousIndex: 0, currentIndex: 6 });
        expect(titles()).toEqual(['Card 7', 'Card 2', 'Card 3', 'Card 4', 'Card 5', 'Card 6', 'Card 1']);
    });

    it('shows a placeholder above the card under the pointer and a preview that follows it while dragging', async () => {
        const { item, inner } = await setup();
        const start = item('Card 1').getBoundingClientRect();
        const x = Math.round(start.left + 20);
        const y = Math.round(start.top + 20);
        await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        await mouse('mousePressed', x, y);
        await mouse('mouseMoved', x + 10, y + 10);
        await stable();
        // the dragged card's place is freed: card 4 moves up into the first row
        expect(item('Card 1').parentElement!.style.display).toBe('none');
        expect(Math.round(item('Card 4').getBoundingClientRect().top)).toBe(Math.round(start.top));
        const preview = document.querySelector<HTMLElement>('[data-fixed-card-layout-preview]')!;
        expect(preview).not.toBeNull();
        expect(preview.getAttribute('aria-hidden')).toBe('true');
        expect(preview.querySelector('[id]')).toBeNull();
        expect(getComputedStyle(preview).position).toBe('fixed');

        const target = item('Card 3').getBoundingClientRect();
        await mouse('mouseMoved', Math.round(target.left + 50), Math.round(target.top + 20));
        await stable();
        const placeholder = inner.querySelector<HTMLElement>('[data-fixed-card-layout-placeholder]')!;
        expect(placeholder.nextElementSibling).toBe(item('Card 3'));
        expect(getComputedStyle(placeholder).borderTopStyle).toBe('dashed');
        expect(placeholder.getAttribute('aria-hidden')).toBe('true');
        expect(item('Card 3').getBoundingClientRect().top).toBeGreaterThan(placeholder.getBoundingClientRect().bottom);
        await mouse('mouseReleased', Math.round(target.left + 50), Math.round(target.top + 20));
        await stable();
        expect(document.querySelector('[data-fixed-card-layout-preview]')).toBeNull();
        expect(inner.querySelector('[data-fixed-card-layout-placeholder]')).toBeNull();
    });

    it('within a column of two, dragging the lower card onto the upper one swaps them, the other way keeps the order', async () => {
        const { drops, item, titles, inner } = await setup();
        // dropped where it was: card 5 moved up under the pointer, and the upper card on the lower one keeps the order
        await drag(item('Card 2'), item('Card 2'));
        await stable();
        expect(drops).toHaveLength(0);
        expect(item('Card 2').parentElement!.style.display).toBe('');
        expect(item('Card 2').getBoundingClientRect().height).toBeGreaterThan(0);
        expect(titles()).toEqual(['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5']);

        // the placeholder goes above the target card: card 1 above card 4 is the current order
        await drag(item('Card 1'), item('Card 4'));
        await stable();
        expect(drops).toHaveLength(0);
        expect(titles()).toEqual(['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5']);

        await drag(item('Card 4'), item('Card 1'));
        await stable();
        expect(drops).toHaveLength(1);
        expect(drops[0]).toMatchObject({ previousIndex: 3, currentIndex: 0 });
        expect(titles()).toEqual(['Card 4', 'Card 2', 'Card 3', 'Card 1', 'Card 5']);
        expect(item('Card 1').getBoundingClientRect().top).toBeGreaterThan(
            item('Card 4').getBoundingClientRect().bottom
        );
        // the layout height is measured again after the drop
        const lowest = Math.max(
            ...[...inner.querySelectorAll('[role=group]')].map((i) => i.getBoundingClientRect().bottom)
        );
        expect(Math.round(inner.getBoundingClientRect().bottom - lowest)).toBe(4);
    });

    it('Alt+Arrow keys swap with the neighbour card (left/right respect RTL, up/down by row) and keep focus on the moved card', async () => {
        const { drops, item, titles } = await setup();
        item('Card 1').focus();
        await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');
        await stable();
        expect(titles()).toEqual(['Card 2', 'Card 1', 'Card 3', 'Card 4', 'Card 5']);
        expect(drops.at(-1)).toMatchObject({ previousIndex: 0, currentIndex: 1, layoutColumns: 3 });
        expect(document.activeElement).toBe(item('Card 1'));

        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await stable();
        expect(titles()).toEqual(['Card 2', 'Card 5', 'Card 3', 'Card 4', 'Card 1']);
        expect(document.activeElement).toBe(item('Card 1'));

        // no card below: nothing moves
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await stable();
        expect(titles()).toEqual(['Card 2', 'Card 5', 'Card 3', 'Card 4', 'Card 1']);

        await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
        await stable();
        expect(titles()).toEqual(['Card 2', 'Card 1', 'Card 3', 'Card 4', 'Card 5']);
        await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
        await stable();
        expect(titles()).toEqual(['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5']);

        // no column before the first: nothing moves
        await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
        await stable();
        expect(titles()).toEqual(['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5']);
        expect(document.activeElement).toBe(item('Card 1'));

        // RTL: ArrowLeft moves towards the end
        document.documentElement.setAttribute('dir', 'rtl');
        await stable();
        await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
        await stable();
        expect(titles()).toEqual(['Card 2', 'Card 1', 'Card 3', 'Card 4', 'Card 5']);
        // and it is visually to the left of card 2
        expect(item('Card 1').getBoundingClientRect().right).toBeLessThan(item('Card 2').getBoundingClientRect().left);
        expect(document.activeElement).toBe(item('Card 1'));
    });

    it('arrow keys without Alt move focus between cards with wrap', async () => {
        const { drops, items } = await setup();
        const list = items();
        list[0].focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(list[1]);
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(list[2]);
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(list[1]);
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(list[0]);
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(list[4]);
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(list[0]);
        // focus moves never reorder
        expect(drops).toHaveLength(0);
    });

    it('swaps ArrowLeft and ArrowRight in RTL', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        const { items } = await setup();
        const list = items();
        list[0].focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(list[1]);
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(list[0]);
    });

    it('Tab moves into and out of the cards one by one', async () => {
        const { root, items } = await setup();
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(items()[0]);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(items()[1]);
    });

    it('disableDragDrop disables pointer and keyboard moves', async () => {
        const { update, drops, item, titles } = await setup();
        await update({ disabled: true });
        await drag(item('Card 1'), item('Card 3'));
        await stable();
        expect(drops).toHaveLength(0);
        expect(titles()).toEqual(['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5']);

        item('Card 1').focus();
        await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');
        await stable();
        expect(drops).toHaveLength(0);
        expect(titles()).toEqual(['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5']);
        // plain arrows still move the focus
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(item('Card 2'));
    });

    it('a press shorter than dragStartDelay that moves does not drag', async () => {
        const drops: CardDropped[] = [];
        const screen = await render(
            <div style={{ width: 1000 }}>
                <FixedCardLayout dragStartDelay={10000} onCardDraggedDropped={(d) => drops.push(d)}>
                    {['A', 'B', 'C'].map((title) => (
                        <FixedCardLayoutCard key={title}>
                            <Card>
                                <CardHeader>
                                    <CardMainHeader>
                                        <CardTitle>{title}</CardTitle>
                                    </CardMainHeader>
                                </CardHeader>
                            </Card>
                        </FixedCardLayoutCard>
                    ))}
                </FixedCardLayout>
            </div>
        );
        await stable();
        const groups = [...screen.container.querySelectorAll<HTMLElement>('[role=group]:has(> [role=region])')];
        await drag(groups[0], groups[2]);
        await stable();
        expect(drops).toHaveLength(0);
        expect(document.querySelector('[data-fixed-card-layout-preview]')).toBeNull();
        expect(groups[0].parentElement!.style.display).toBe('');
    });

    it('onLayoutChange emits the number of columns and width', async () => {
        const { update, changes } = await setup();
        expect(changes.at(-1)).toEqual({ numberOfColumns: 3, screenSize: 1016 });
        const count = changes.length;
        await update({ width: 700 });
        expect(changes.at(-1)).toEqual({ numberOfColumns: 2, screenSize: 716 });
        expect(changes.length).toBeGreaterThan(count);
    });

    it('takes ranks from the cards and follows a new rank', async () => {
        const order = (ranks: number[]) => (
            <div style={{ width: 1000 }}>
                <FixedCardLayout>
                    {['A', 'B', 'C'].map((title, i) => (
                        <FixedCardLayoutCard key={title} rank={ranks[i]} aria-label={title} />
                    ))}
                </FixedCardLayout>
            </div>
        );
        const screen = await render(order([3, 1, 2]));
        await stable();
        const labels = () =>
            [...screen.container.querySelectorAll('[role=group]')].map((el) => el.getAttribute('aria-label'));
        expect(labels()).toEqual(['B', 'C', 'A']);
        await screen.rerender(order([1, 2, 3]));
        await stable();
        expect(labels()).toEqual(['A', 'B', 'C']);
    });

    it('passes native props, className and ref to the roots', async () => {
        const ref = createRef<HTMLDivElement>();
        const cardRef = createRef<HTMLDivElement>();
        const screen = await render(
            <FixedCardLayout ref={ref} className="blue" data-sample="Sample">
                <FixedCardLayoutCard ref={cardRef} className="red" data-card="Card" aria-label="Named">
                    Content
                </FixedCardLayoutCard>
            </FixedCardLayout>
        );
        const root = screen.container.querySelector<HTMLElement>('[data-sample]')!;
        expect(root.className).toContain('blue');
        expect(ref.current).toBe(root);
        const card = root.querySelector<HTMLElement>('[data-card]')!;
        expect(card.className).toContain('red');
        expect(cardRef.current).toBe(card);
        expect(card.getAttribute('aria-label')).toBe('Named');
    });
});
